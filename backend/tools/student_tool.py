from agents import Agent, OpenAIChatCompletionsModel, ModelSettings, Runner, function_tool
from openai import AsyncOpenAI
from db.db import get_db
import os
from dotenv import load_dotenv
from typing import Any
from email_utils.email import _send_welcome_email
load_dotenv()


# Database connection
db = get_db()                  
collection = db["students"]   


@function_tool
def read_students():
    print("Fetching all students...")
    """
    Fetch all students from the database.

    Returns:
        dict: {"Data": [students...], "Error": bool, "Message": str}
    """
    try:
        students_list = []
        for stud in collection.find({}):
            stud["_id"] = str(stud["_id"])
            students_list.append(stud)

        return {
            "Data": students_list,
            "Error": False,
            "Message": "All students data fetched successfully"
        }
    except Exception as e:
        return {"Data": [], "Error": True, "Message": str(e)}


@function_tool
def read_student_by_id(id: int):
    print(f"Fetching student by id={id}...")
    """
    Fetch a student by numeric `id`.

    Args:
        id (int): Student's numeric id (not Mongo _id).
    """
    try:
        student = collection.find_one({"id": id})
        if student:
            student["_id"] = str(student["_id"])
            return {"Data": student, "Error": False, "Message": "Student data fetched successfully"}
        else:
            return {"Data": {}, "Error": True, "Message": "Student not found"}
    except Exception as e:
        return {"Data": {}, "Error": True, "Message": str(e)}

# ===== ADD STUDENT (auto-send welcome email after insert) =====
@function_tool
def add_student(id: int, name: str, age: int, email: str, department: str | None = None):
    print("Adding student...")
    """
    Add a new student to the database. After successful insert, automatically send a
    welcome/department email to the provided student email.

    Args:
        id (int): Numeric student id (unique in your domain).
        name (str)
        age (int)
        email (str)
        department (str | None)
    """
    try:
        # Ensure id uniqueness
        if collection.find_one({"id": id}):
            return {"Data": {}, "Error": True, "Message": f"Student with id={id} already exists"}

        doc = {
            "id": id,
            "name": name,
            "email": email.strip() if email else None,
            "department": department,
        }
        result = collection.insert_one(doc)
        print("Student added:", result.inserted_id)

        # Build return copy with string _id
        inserted = collection.find_one({"_id": result.inserted_id})
        if inserted:
            inserted["_id"] = str(inserted["_id"])

        # Try to send email (do not fail the whole call if email fails)
        if doc.get("email"):
            try:
                _send_welcome_email(doc["email"], doc.get("name") or "Student", doc.get("department"))
                email_status = {"sent": True, "to": doc["email"]}
            except Exception as mail_err:
                email_status = {"sent": False, "to": doc["email"], "error": str(mail_err)}
        else:
            email_status = {"sent": False, "to": None, "error": "No email provided"}

        return {
            "Data": {"student": inserted, "email_status": email_status},
            "Error": False,
            "Message": "Student added successfully"
        }

    except Exception as e:
        return {"Data": {}, "Error": True, "Message": str(e)}


# ----- DELETE STUDENT -----
@function_tool
def delete_student(id: int):
    print(f"Deleting student id={id}...")
    """
    Delete a student by numeric `id`.
    """
    try:
        result = collection.delete_one({"id": id})
        if result.deleted_count > 0:
            return {"Data": {"id": id}, "Error": False, "Message": "Student deleted successfully"}
        else:
            return {"Data": {}, "Error": True, "Message": "Student not found"}
    except Exception as e:
        return {"Data": {}, "Error": True, "Message": str(e)}



@function_tool
def update_student(id: int, field: str, new_value: Any):
    print(f"Updating student id={id}, field={field}...")
    """
    Update a single field for a student identified by `id`.

    Args:
        id (int): Student's numeric id (not Mongo _id).
        field (str): One of {"name","age","grade","department","email"}.
        new_value (Any): New value to set.
    """
    try:
        # Disallow changing primary keys and Mongo _id
        if field in {"_id", "id"}:
            return {"Data": {}, "Error": True, "Message": f"Updating '{field}' is not allowed"}

        allowed_fields = {"name", "age", "grade", "department", "email"}
        if field not in allowed_fields:
            return {"Data": {}, "Error": True, "Message": f"Invalid field '{field}'. Allowed: {sorted(list(allowed_fields))}"}

        # Cast types where sensible
        if field == "age":
            try:
                new_value = int(new_value)
            except (TypeError, ValueError):
                return {"Data": {}, "Error": True, "Message": "Field 'age' must be an integer"}

        update_doc = {"$set": {field: new_value}}
        result = collection.update_one({"id": id}, update_doc)

        if result.matched_count == 0:
            return {"Data": {}, "Error": True, "Message": f"Student with id={id} not found"}

        updated = collection.find_one({"id": id})
        if updated:
            updated["_id"] = str(updated["_id"])

        return {
            "Data": {"id": id, "updated_field": field, "new_value": new_value, "student": updated},
            "Error": False,
            "Message": "Student updated successfully"
        }

    except Exception as e:
        return {"Data": {}, "Error": True, "Message": str(e)}


