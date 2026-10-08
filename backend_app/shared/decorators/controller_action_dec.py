# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# security_scheme = HTTPBearer()

# def auth_required(func):
#     @wraps(func)
#     async def wrapper(*args, credentials: HTTPAuthorizationCredentials = Depends(security_scheme), **kwargs):