import random
import string
import time


def generate_transaction_reference(prefix: str = "TXN") -> str:
    """Generate a realistic mock transaction reference."""
    timestamp = int(time.time())
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{timestamp % 1000000:06d}-{suffix}"


def format_product_response(product):
    """Format a Product model into the required response dictionary."""
    farmer_summary = None
    if product.farmer:
        farm_name = product.farmer.farmer_profile.farm_name if product.farmer.farmer_profile else None
        farm_location = product.farmer.farmer_profile.farm_location if product.farmer.farmer_profile else None
        farm_desc = product.farmer.farmer_profile.description if product.farmer.farmer_profile else None

        farmer_summary = {
            "id": product.farmer.id,
            "name": product.farmer.name,
            "email": product.farmer.email,
            "phone": product.farmer.phone,
            "farm_name": farm_name,
            "farm_location": farm_location,
            "farm_description": farm_desc,
        }

    category_summary = None
    if product.category:
        category_summary = {
            "id": product.category.id,
            "name": product.category.name,
        }

    return {
        "id": product.id,
        "farmer_id": product.farmer_id,
        "category_id": product.category_id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "unit": product.unit,
        "quantity_available": product.quantity_available,
        "image_url": product.image_url,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "category": category_summary,
        "farmer": farmer_summary,
    }
