from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_favourite_service, require_authenticated_user
from models.schemas import CatalogItemResponse
from services.favourite_service import FavouriteService

router = APIRouter(prefix="/api/favourites", tags=["favourites"])


@router.get("", response_model=list[CatalogItemResponse])
def list_favourites(
    email: str = Depends(require_authenticated_user),
    service: FavouriteService = Depends(get_favourite_service),
):
    return service.list_favourites(email)


@router.put("/{product_id}", status_code=204)
def save_favourite(
    product_id: int,
    email: str = Depends(require_authenticated_user),
    service: FavouriteService = Depends(get_favourite_service),
):
    try:
        service.save(email, product_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
