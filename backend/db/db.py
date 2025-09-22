from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()

def get_db():
    try:    
        print("Connecting to MongoDB...")
        print("MONGODB_URI:", os.getenv("db_url"))
        client = MongoClient(os.getenv("db_url"))
        db=client['hackathon_smit']  # <-- specify your database name here
        return db

    except Exception as e:
        print("Error connecting to MongoDB:", e)
        return None

# # db/db.py
# import os
# from pymongo import MongoClient

# _client = None

# def get_db():
#     global _client
#     if _client is None:
#         uri = os.getenv("MONGODB_URI")
#         if not uri:
#             raise RuntimeError("MONGODB_URI not set")
#         _client = MongoClient(uri, connectTimeoutMS=10000, serverSelectionTimeoutMS=10000)
#     return _client["hackathon_smit"]
