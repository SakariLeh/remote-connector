from backend_app.identity_microservice.DTO.Request.user_create_dto import UserCreateDTO
from backend_app.identity_microservice.services.identity_service import IdentityService


auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/register", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED, summary="Register a new user")
async def register(dto: UserCreateDTO, service: IdentityService = Depends(get_identity_service)):
    try:
        user = await service.register_new_user(dto)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))