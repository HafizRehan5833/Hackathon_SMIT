from datetime import datetime
import email
from email import message
from pydantic import BaseModel,Field,AfterValidator
from rpds import List
from typing_extensions import Annotated


    



class LoginUser(BaseModel):
    email: str
    password: str



def is_even(value: int) -> int:
    if value % 2 == 1:
        raise ValueError(f'{value} is not an even number')
    return value


class UserCreate(BaseModel):
    name: Annotated[str, Field(min_length=3,max_length=50)]
    email: Annotated[str, Field(pattern=r'^\S+@\S+$')]
    password: Annotated[str, Field(min_length=6)]
    
    
#Agent Chat Request Model
class ChatRequest(BaseModel):
    # Accept either `user_input` (existing) or `message` (frontend) for flexibility.
    user_input: str    


# Password Reset Request Model

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


class DepartmentCount(BaseModel):
    department: str
    count: int

class StudentsByDeptResponse(BaseModel):
    results: list[DepartmentCount]   # <- use built-in list, not List
    total_departments: int
    total_students: int
    as_of: datetime

class TotalStudentsResponse(BaseModel):
    total_students: int
    as_of: datetime
