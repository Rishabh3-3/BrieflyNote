from fastapi import APIRouter, Depends, HTTPException, status 
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from database import get_session
from models.user import User
from auth.utils import hash_password, verify_password, create_access_token, get_current_user
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
#from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from schemas.token import TokenData  # adjust path if needed
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Pydantic model for signup request
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

# Pydantic model for login request
class LoginRequest(BaseModel):
    email: EmailStr
    password: str



@router.post("/signup")
def signup(user_data: SignUpRequest, session: Session = Depends(get_session)):
    # Check if user already exists
    user_exists = session.exec(select(User).where(User.email == user_data.email)).first()
    if user_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered.")

    # Hash the password
    hashed_pw = hash_password(user_data.password)

    # Create user
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        tokens_left=5  # Default tokens on sign up
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Generate token for the new user
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/login")
def login(user_data: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "tokens_left": current_user.tokens_left,
        "created_at": current_user.created_at
    }