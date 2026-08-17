from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from app.core.database import get_db
from app.core.auth import (
    hash_password, verify_password, create_access_token, decode_access_token, oauth2_scheme
)
from app.schemas.governance import LoginRequestSchema, TokenResponseSchema, UserSchema

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])

# Seed / In-memory User Database for demonstration & tests
DEFAULT_TENANT_ID = "tenant_ecotrend_enterprise"
MOCK_USERS_DB = {
    "admin@ecotrend.io": {
        "id": "usr_admin_001",
        "tenant_id": DEFAULT_TENANT_ID,
        "email": "admin@ecotrend.io",
        "hashed_password": hash_password("AdminPass123!"),
        "full_name": "System Administrator",
        "role": "SUPER_ADMIN",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    "operator@ecotrend.io": {
        "id": "usr_operator_002",
        "tenant_id": DEFAULT_TENANT_ID,
        "email": "operator@ecotrend.io",
        "hashed_password": hash_password("OperatorPass123!"),
        "full_name": "EHS Operator",
        "role": "OPERATOR",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    "analyst@ecotrend.io": {
        "id": "usr_analyst_003",
        "tenant_id": DEFAULT_TENANT_ID,
        "email": "analyst@ecotrend.io",
        "hashed_password": hash_password("AnalystPass123!"),
        "full_name": "Data Analyst",
        "role": "ANALYST",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
}

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        # Fallback to default admin user for backward compatibility if header missing
        return MOCK_USERS_DB["admin@ecotrend.io"]
    
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    email = payload.get("sub")
    
    for u in MOCK_USERS_DB.values():
        if u["email"] == email:
            if not u["is_active"]:
                raise HTTPException(status_code=401, detail="User account is inactive")
            return u
    raise HTTPException(status_code=401, detail="Invalid user credentials")

@router.post("/login", response_model=TokenResponseSchema)
async def login(payload: LoginRequestSchema):
    user = MOCK_USERS_DB.get(payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive")

    token = create_access_token({"sub": user["email"], "tenant_id": user["tenant_id"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "tenant_id": user["tenant_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "is_active": user["is_active"],
            "created_at": user["created_at"]
        }
    }

@router.post("/refresh", response_model=TokenResponseSchema)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    token = create_access_token({"sub": current_user["email"], "tenant_id": current_user["tenant_id"], "role": current_user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": current_user
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": f"User '{current_user['email']}' successfully logged out."}

@router.get("/me", response_model=UserSchema)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserSchema(**current_user)
