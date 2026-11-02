from db.client import DatabaseClient
from models.schemas import CatalogItemResponse


class FavouriteService:
    def __init__(self, db: DatabaseClient):
        self.db = db

    def save(self, buyer_email: str, product_id: int) -> None:
        if self.db.get_catalog_item_by_id(product_id) is None:
            raise ValueError(f"Product {product_id} not found")
        self.db.add_favourite(buyer_email, product_id)

    def list_favourites(self, buyer_email: str) -> list[CatalogItemResponse]:
        return [
            CatalogItemResponse(
                id=item.id,
                name=item.name,
                description=item.description,
                price=item.price,
                picture_uri=item.picture_uri,
                catalog_brand_id=item.catalog_brand_id,
                catalog_type_id=item.catalog_type_id,
                brand_name=item.brand_name,
                type_name=item.type_name,
            )
            for item in self.db.list_favourite_items(buyer_email)
        ]
