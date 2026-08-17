from typing import List, Dict, Set
from fastapi import HTTPException, status

ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    "SUPER_ADMIN": {
        "READ_ENVIRONMENTAL_DATA", "READ_PREDICTIONS", "READ_COMPLIANCE", "GENERATE_REPORTS",
        "MANAGE_RECOMMENDATIONS", "APPROVE_INTERVENTIONS", "MANAGE_USERS", "MANAGE_TENANTS", "VIEW_AUDIT_LOGS"
    },
    "ADMIN": {
        "READ_ENVIRONMENTAL_DATA", "READ_PREDICTIONS", "READ_COMPLIANCE", "GENERATE_REPORTS",
        "MANAGE_RECOMMENDATIONS", "APPROVE_INTERVENTIONS", "MANAGE_USERS", "VIEW_AUDIT_LOGS"
    },
    "ANALYST": {
        "READ_ENVIRONMENTAL_DATA", "READ_PREDICTIONS", "READ_COMPLIANCE", "GENERATE_REPORTS",
        "MANAGE_RECOMMENDATIONS"
    },
    "OPERATOR": {
        "READ_ENVIRONMENTAL_DATA", "READ_PREDICTIONS", "READ_COMPLIANCE", "MANAGE_RECOMMENDATIONS"
    },
    "VIEWER": {
        "READ_ENVIRONMENTAL_DATA", "READ_PREDICTIONS", "READ_COMPLIANCE"
    }
}

def has_permission(role: str, permission: str) -> bool:
    role_perms = ROLE_PERMISSIONS.get(role.upper(), set())
    return permission.upper() in role_perms

def verify_permission(role: str, permission: str):
    if not has_permission(role, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{role}' lacks required permission '{permission}'"
        )
