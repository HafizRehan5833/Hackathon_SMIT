from fastapi import FastAPI, APIRouter, HTTPException, Body, status
from typing import Dict, Optional
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import os, uuid, re

# --------- Load environment variables ----------
load_dotenv()

# --------- MongoDB Setup ----------
from db.db import get_db
db = get_db()

chats_collection = db["chats"]
students_collection = db["students"]
profiles_collection = db["profiles"]   # profile memory

# --------- OpenAI + Agents ----------
from agents import Agent, OpenAIChatCompletionsModel, ModelSettings, Runner  # type: ignore
from openai import AsyncOpenAI  # type: ignore
from tools.student_tool import add_student, read_students, update_student, delete_student, read_student_by_id
from tools.campus_faq import rag_query

openai_client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

agent = Agent(
    name="StudentDataAgent",
    instructions="""
You are an AI assistant that helps manage student records. You can perform the following actions:
- Add a new student record.
- Read existing student records.
- Update student records.
- Delete student records.
For student-related info, use student tools.
For general campus-related questions, use rag_query.
Also, if the user shares their name or profession, remember it for future context.
    """,
    model=OpenAIChatCompletionsModel(
        model="gemini-2.5-flash",
        openai_client=openai_client
    ),
    tools=[read_students, add_student, delete_student, update_student, read_student_by_id, rag_query],
    model_settings=ModelSettings(temperature=0.7, max_tokens=1000),
)

student_router = APIRouter()

# --------- Request Model ----------
class ChatRequest(BaseModel):
    user_input: str

# --------- Save message ----------
def save_message(thread_id: str, role: str, content: str):
    chat_doc = {
        "thread_id": thread_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow()
    }
    result = chats_collection.insert_one(chat_doc)
    chat_doc["id"] = str(result.inserted_id)
    return chat_doc

# --------- Save profile details ----------
def save_user_profile(thread_id: str, text: str):
    name_match = re.search(r"\bmy name is ([A-Za-z ]+)", text, re.IGNORECASE)
    profession_match = re.search(r"\bI am a[n]* ([A-Za-z ]+)", text, re.IGNORECASE)

    update_fields = {}
    if name_match:
        update_fields["name"] = name_match.group(1).strip()
    if profession_match:
        update_fields["profession"] = profession_match.group(1).strip()

    if update_fields:
        profiles_collection.update_one(
            {"thread_id": thread_id},
            {"$set": update_fields},
            upsert=True
        )

def get_user_profile(thread_id: str) -> str:
    profile = profiles_collection.find_one({"thread_id": thread_id})
    if not profile:
        return ""
    profile_parts = []
    if "name" in profile:
        profile_parts.append(f"The user's name is {profile['name']}.")
    if "profession" in profile:
        profile_parts.append(f"The user's profession is {profile['profession']}.")
    return " ".join(profile_parts)

# --------- Delete Thread and All Messages ----------

@student_router.delete("/thread/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(thread_id: str):
    chats_collection.delete_many({"thread_id": thread_id})
    profiles_collection.delete_many({"thread_id": thread_id})
    return None


# --------- Get All Threads (for sidebar) ----------
@student_router.get("/threads")
async def get_threads():
    # Find all system messages (thread creation)
    threads = list(chats_collection.find({"role": "system"}).sort("timestamp", -1))
    result = []
    for t in threads:
        thread_id = t["thread_id"]
        # Find first user message for this thread
        user_msg = chats_collection.find_one({"thread_id": thread_id, "role": "user"}, sort=[("timestamp", 1)])
        first_user_msg = user_msg["content"] if user_msg else None
        result.append({
            "thread_id": thread_id,
            "created": t["timestamp"].isoformat(),
            "firstUserMsg": first_user_msg
        })
    return {"threads": result}

# --------- Create Thread ----------
@student_router.post("/thread")
async def create_thread():
    thread_id = str(uuid.uuid4())
    chats_collection.insert_one({
        "thread_id": thread_id,
        "role": "system",
        "content": "Thread created",
        "timestamp": datetime.utcnow()
    })
    return {"thread_id": thread_id, "message": "New thread created successfully"}

# --------- Chat Endpoint ----------
@student_router.post("/chat")
async def chat_endpoint(request: ChatRequest = Body(...), thread_id: Optional[str] = None) -> Dict:
    try:
        user_text = request.user_input.strip() if request.user_input else None
        if not user_text:
            raise HTTPException(status_code=400, detail="User input cannot be empty.")

        # If no thread_id given, create/find last one
        if not thread_id:
            last_thread = chats_collection.find_one({"role": "system"}, sort=[("timestamp", -1)])
            if not last_thread:
                thread_id = str(uuid.uuid4())
                chats_collection.insert_one({
                    "thread_id": thread_id,
                    "role": "system",
                    "content": "Thread created automatically",
                    "timestamp": datetime.utcnow()
                })
            else:
                thread_id = last_thread["thread_id"]

        # Save user message
        save_message(thread_id, "user", user_text)

        # Save profile info if present
        save_user_profile(thread_id, user_text)

        # Fetch last 10 messages for context
        history_cursor = chats_collection.find({"thread_id": thread_id}).sort("timestamp", -1).limit(10)
        history = list(history_cursor)[::-1]

        messages = [{"role": doc["role"], "content": doc["content"]} for doc in history]

        # Inject stored profile context
        profile_text = get_user_profile(thread_id)
        if profile_text:
            user_text = profile_text + " " + user_text

        # Run agent
        result = await Runner.run(agent, user_text, context=messages)
        assistant_reply = result.final_output

        # Save assistant reply
        save_message(thread_id, "assistant", assistant_reply)

        # Fetch full history
        full_history_cursor = chats_collection.find({"thread_id": thread_id}).sort("timestamp", 1)
        full_history = [
            {
                "id": str(doc["_id"]),
                "thread_id": doc["thread_id"],
                "role": doc["role"],
                "content": doc["content"],
                "timestamp": doc["timestamp"]
            }
            for doc in full_history_cursor
        ]

        return {
            "thread_id": thread_id,
            "response": assistant_reply,
            "history": full_history
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
