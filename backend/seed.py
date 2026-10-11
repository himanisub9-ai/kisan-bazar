"""
Seed data script for KisanBazar – Farmer Marketplace.
Populates:
- 1 Admin
- 3 Farmers with farm profiles
- 5 Consumers with carts
- 7 Agricultural Categories
- 18 Realistic Agricultural Products
- Sample Orders with items and payments
"""

import sys
import os
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models.user import User, FarmerProfile
from app.models.product import Category, Product
from app.models.cart import Cart
from app.models.order import Order, OrderItem, Payment
from app.auth.password import hash_password
from app.utils.helpers import generate_transaction_reference


def run_seed():
    print("[INFO] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Clearing existing records for clean seed...")
            db.query(Payment).delete()
            db.query(OrderItem).delete()
            db.query(Order).delete()
            db.query(Cart).delete()
            db.query(Product).delete()
            db.query(Category).delete()
            db.query(FarmerProfile).delete()
            db.query(User).delete()
            db.commit()

        print("[INFO] Creating Administrator account...")
        admin = User(
            name="Platform Administrator",
            email="admin@kisanbazar.com",
            password_hash=hash_password("admin123"),
            phone="+91 9876543210",
            role="admin",
            address="KisanBazar HQ, AgriTech Park, Pune, Maharashtra",
            is_active=True,
        )
        db.add(admin)

        print("[INFO] Creating Farmers with Farm Profiles...")
        farmers_data = [
            {
                "name": "Ramesh Patil",
                "email": "ramesh@kisanbazar.com",
                "password": "farmer123",
                "phone": "+91 9822012345",
                "address": "Village Shirwal, Satara District, Maharashtra",
                "farm_name": "Sahyadri Organic Orchards",
                "farm_location": "Shirwal, Satara, Maharashtra",
                "description": "Certified organic farm specializing in chemical-free indigenous fruits, table grapes, and fresh seasonal field vegetables. Practicing sustainable drip irrigation since 2012.",
            },
            {
                "name": "Sukhwinder Singh",
                "email": "sukhwinder@kisanbazar.com",
                "password": "farmer123",
                "phone": "+91 9814056789",
                "address": "Ludhiana Rural, Punjab",
                "farm_name": "Golden Harvest Agro Estate",
                "farm_location": "Samrala, Ludhiana, Punjab",
                "description": "Specialists in heritage wheat, premium long-grain Basmati rice, and cold-pressed mustard oil. Committed to natural soil enrichment and bio-fertilizers.",
            },
            {
                "name": "Ananya Reddy",
                "email": "ananya@kisanbazar.com",
                "password": "farmer123",
                "phone": "+91 9440198765",
                "address": "Anantapur Rural, Andhra Pradesh",
                "farm_name": "Deccan Sun Dairy & Spice Groves",
                "farm_location": "Penukonda, Anantapur, Andhra Pradesh",
                "description": "Smallholder cooperative farm raising indigenous Gir cows for A2 raw milk and desi ghee, along with organic single-origin turmeric and fiery Guntur chillies.",
            },
        ]

        farmer_users = []
        for fd in farmers_data:
            f_user = User(
                name=fd["name"],
                email=fd["email"],
                password_hash=hash_password(fd["password"]),
                phone=fd["phone"],
                role="farmer",
                address=fd["address"],
                is_active=True,
            )
            db.add(f_user)
            db.flush()

            profile = FarmerProfile(
                user_id=f_user.id,
                farm_name=fd["farm_name"],
                farm_location=fd["farm_location"],
                description=fd["description"],
            )
            db.add(profile)
            farmer_users.append(f_user)

        print("[INFO] Creating Consumers...")
        consumers_data = [
            {
                "name": "Priya Sharma",
                "email": "priya@gmail.com",
                "password": "consumer123",
                "phone": "+91 9988776655",
                "address": "Flat 402, Green Meadows, Baner, Pune 411045",
            },
            {
                "name": "Amit Verma",
                "email": "amit@gmail.com",
                "password": "consumer123",
                "phone": "+91 9871122334",
                "address": "Sector 56, DLF Phase 5, Gurugram, Haryana 122011",
            },
            {
                "name": "Sneha Kulkarni",
                "email": "sneha@gmail.com",
                "password": "consumer123",
                "phone": "+91 9765432109",
                "address": "B-12, Nilgiri Heights, Shivaji Nagar, Bengaluru 560001",
            },
            {
                "name": "Rajesh Mehta",
                "email": "rajesh@gmail.com",
                "password": "consumer123",
                "phone": "+91 9123456780",
                "address": "Flat 8B, Sea View Tower, Worli, Mumbai 400018",
            },
            {
                "name": "Deepa Sundaram",
                "email": "deepa@gmail.com",
                "password": "consumer123",
                "phone": "+91 9444332211",
                "address": "15/4 Third Cross Street, Adyar, Chennai 600020",
            },
        ]

        consumer_users = []
        for cd in consumers_data:
            c_user = User(
                name=cd["name"],
                email=cd["email"],
                password_hash=hash_password(cd["password"]),
                phone=cd["phone"],
                role="consumer",
                address=cd["address"],
                is_active=True,
            )
            db.add(c_user)
            db.flush()
            # Initialize empty cart
            c_cart = Cart(user_id=c_user.id)
            db.add(c_cart)
            consumer_users.append(c_user)

        print("[INFO] Creating Categories...")
        category_names = [
            "Vegetables",
            "Fruits",
            "Grains",
            "Pulses",
            "Dairy",
            "Spices",
            "Organic Products",
        ]
        categories_dict = {}
        for cat_name in category_names:
            cat = Category(name=cat_name)
            db.add(cat)
            db.flush()
            categories_dict[cat_name] = cat

        print("[INFO] Creating Agricultural Products...")
        products_data = [
            # Farmer Ramesh (Vegetables & Fruits & Organics)
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Vegetables"],
                "name": "Farm Fresh Red Tomatoes",
                "description": "Vine-ripened, juicy desi red tomatoes harvested early morning. Packed with natural lycopene and rich tanginess, perfect for curries and salads.",
                "price": 38.0,
                "unit": "kg",
                "quantity_available": 120.0,
                "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Vegetables"],
                "name": "Organic Farm Spinach (Palak)",
                "description": "Tender crisp green spinach leaves grown naturally without chemical pesticides. Rich in iron, vitamins, and antioxidants.",
                "price": 28.0,
                "unit": "piece",  # bunch
                "quantity_available": 60.0,
                "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Vegetables"],
                "name": "Crisp Mountain Carrots",
                "description": "Naturally sweet, crunchy orange carrots grown in cool hill soils. Excellent for fresh salads, juices, and gajar halwa.",
                "price": 45.0,
                "unit": "kg",
                "quantity_available": 90.0,
                "image_url": "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Vegetables"],
                "name": "Red Nasik Onions",
                "description": "Pungent, firm Nasik variety red onions with superior keeping quality and deep flavour.",
                "price": 34.0,
                "unit": "kg",
                "quantity_available": 200.0,
                "image_url": "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Fruits"],
                "name": "Himachal Royal Delicious Apples",
                "description": "Handpicked tree-ripened red crisp apples from Kinnaur high-altitude valleys. Naturally sweet with a floral aroma.",
                "price": 160.0,
                "unit": "kg",
                "quantity_available": 85.0,
                "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Fruits"],
                "name": "Robusta Ripe Bananas",
                "description": "Naturally sweetened Cavendish Robusta bananas. Rich in potassium and instant energy.",
                "price": 55.0,
                "unit": "dozen",
                "quantity_available": 45.0,
                "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
            },

            # Farmer Sukhwinder (Grains, Pulses & Organics)
            {
                "farmer": farmer_users[1],
                "category": categories_dict["Grains"],
                "name": "Traditional Sharbati Whole Wheat",
                "description": "Golden-amber Sharbati wheat grains from canal-irrigated black soils. Yields ultra-soft, aromatic, nutritious rotis.",
                "price": 52.0,
                "unit": "kg",
                "quantity_available": 500.0,
                "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[1],
                "category": categories_dict["Grains"],
                "name": "Aged 1121 Royal Basmati Rice",
                "description": "Extra long grain aged 2 years for fluffiness and non-sticky cooking. Distinct royal aroma, ideal for biryanis and pulao.",
                "price": 135.0,
                "unit": "kg",
                "quantity_available": 350.0,
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[1],
                "category": categories_dict["Pulses"],
                "name": "Unpolished Organic Toor Dal",
                "description": "Protein-rich pigeon pea dal cleaned naturally without synthetic chemical polish. Rich in authentic aroma and creaminess.",
                "price": 165.0,
                "unit": "kg",
                "quantity_available": 180.0,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[1],
                "category": categories_dict["Pulses"],
                "name": "Whole Green Moong Beans",
                "description": "Fresh harvest green gram suitable for nutritious sprouting or traditional khichdi. Packed with dietary fiber.",
                "price": 125.0,
                "unit": "kg",
                "quantity_available": 140.0,
                "image_url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[1],
                "category": categories_dict["Organic Products"],
                "name": "Cold Pressed Kachi Ghani Mustard Oil",
                "description": "Extracted on traditional wooden kolhu expellers at low temperature to retain natural pungent pungency and heart-healthy fats.",
                "price": 220.0,
                "unit": "litre",
                "quantity_available": 75.0,
                "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
            },

            # Farmer Ananya (Dairy, Spices, Organics)
            {
                "farmer": farmer_users[2],
                "category": categories_dict["Dairy"],
                "name": "Pure Gir Cow A2 Raw Milk",
                "description": "Fresh, creamy whole unadulterated raw milk from free-range pasture-fed indigenous Gir cows. Bottled in glass within 2 hours of milking.",
                "price": 85.0,
                "unit": "litre",
                "quantity_available": 40.0,
                "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[2],
                "category": categories_dict["Dairy"],
                "name": "Traditional Bilona Cow Desi Ghee",
                "description": "Prepared by churning cultured curd on firewood according to ancient Ayurvedic Vedic methods. Rich golden aroma and grainy texture.",
                "price": 880.0,
                "unit": "kg",
                "quantity_available": 30.0,
                "image_url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[2],
                "category": categories_dict["Dairy"],
                "name": "Soft Artisanal Malai Paneer",
                "description": "Melt-in-mouth tender cottage cheese crafted fresh every morning from whole cow milk. Zero artificial preservatives.",
                "price": 340.0,
                "unit": "kg",
                "quantity_available": 25.0,
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[2],
                "category": categories_dict["Spices"],
                "name": "Single-Origin Salem Turmeric Powder",
                "description": "Sun-dried rhizomes stone-ground with high 5.2% natural curcumin content. Intense natural fragrance and therapeutic potency.",
                "price": 240.0,
                "unit": "kg",
                "quantity_available": 110.0,
                "image_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[2],
                "category": categories_dict["Spices"],
                "name": "Bold Green Malabar Cardamom",
                "description": "Extra-bold fragrant cardamom pods harvested by hand in the Western Ghats mist valleys. Essential for sweet dishes and chai.",
                "price": 320.0,
                "unit": "gram",  # 100g unit
                "quantity_available": 50.0,
                "image_url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[2],
                "category": categories_dict["Organic Products"],
                "name": "Raw Wild Forest Honey",
                "description": "Unfiltered, unheated pure wildflower honey gathered sustainably by tribal gatherers in Nilgiri biosphere. Pure nectar sweetness.",
                "price": 450.0,
                "unit": "kg",
                "quantity_available": 35.0,
                "image_url": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
            },
            {
                "farmer": farmer_users[0],
                "category": categories_dict["Vegetables"],
                "name": "Fresh Organic Baby Potatoes",
                "description": "Nutty small skin-on baby potatoes grown in sandy loam soil. Excellent roasted or in traditional dum aloo.",
                "price": 32.0,
                "unit": "kg",
                "quantity_available": 150.0,
                "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
            },
        ]

        created_products = []
        for pd in products_data:
            prod = Product(
                farmer_id=pd["farmer"].id,
                category_id=pd["category"].id,
                name=pd["name"],
                description=pd["description"],
                price=pd["price"],
                unit=pd["unit"],
                quantity_available=pd["quantity_available"],
                image_url=pd["image_url"],
            )
            db.add(prod)
            created_products.append(prod)

        db.commit()

        print("[INFO] Creating Sample Orders...")
        # Order 1: Delivered order for Priya
        o1 = Order(
            consumer_id=consumer_users[0].id,
            total_amount=round(created_products[0].price * 3 + created_products[4].price * 2, 2),
            delivery_address="Flat 402, Green Meadows, Baner, Pune 411045",
            payment_method="Online Payment",
            payment_status="Paid",
            order_status="Delivered",
            created_at=datetime.utcnow() - timedelta(days=5),
        )
        db.add(o1)
        db.flush()

        oi1 = OrderItem(
            order_id=o1.id,
            product_id=created_products[0].id,
            farmer_id=created_products[0].farmer_id,
            quantity=3.0,
            price=created_products[0].price,
            subtotal=round(created_products[0].price * 3, 2),
        )
        oi2 = OrderItem(
            order_id=o1.id,
            product_id=created_products[4].id,
            farmer_id=created_products[4].farmer_id,
            quantity=2.0,
            price=created_products[4].price,
            subtotal=round(created_products[4].price * 2, 2),
        )
        db.add_all([oi1, oi2])

        p1 = Payment(
            order_id=o1.id,
            amount=o1.total_amount,
            payment_method="Online Payment",
            payment_status="Paid",
            transaction_reference=generate_transaction_reference("TXN"),
            created_at=o1.created_at,
        )
        db.add(p1)

        # Order 2: Shipped order for Amit
        o2 = Order(
            consumer_id=consumer_users[1].id,
            total_amount=round(created_products[6].price * 5 + created_products[7].price * 2, 2),
            delivery_address="Sector 56, DLF Phase 5, Gurugram, Haryana 122011",
            payment_method="Cash on Delivery",
            payment_status="Pending",
            order_status="Shipped",
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(o2)
        db.flush()

        oi3 = OrderItem(
            order_id=o2.id,
            product_id=created_products[6].id,
            farmer_id=created_products[6].farmer_id,
            quantity=5.0,
            price=created_products[6].price,
            subtotal=round(created_products[6].price * 5, 2),
        )
        oi4 = OrderItem(
            order_id=o2.id,
            product_id=created_products[7].id,
            farmer_id=created_products[7].farmer_id,
            quantity=2.0,
            price=created_products[7].price,
            subtotal=round(created_products[7].price * 2, 2),
        )
        db.add_all([oi3, oi4])

        p2 = Payment(
            order_id=o2.id,
            amount=o2.total_amount,
            payment_method="Cash on Delivery",
            payment_status="Pending",
            transaction_reference=generate_transaction_reference("COD"),
            created_at=o2.created_at,
        )
        db.add(p2)

        # Order 3: Pending order for Sneha (can be cancelled or packed)
        o3 = Order(
            consumer_id=consumer_users[2].id,
            total_amount=round(created_products[11].price * 4 + created_products[12].price * 1, 2),
            delivery_address="B-12, Nilgiri Heights, Shivaji Nagar, Bengaluru 560001",
            payment_method="Online Payment",
            payment_status="Paid",
            order_status="Pending",
            created_at=datetime.utcnow() - timedelta(hours=4),
        )
        db.add(o3)
        db.flush()

        oi5 = OrderItem(
            order_id=o3.id,
            product_id=created_products[11].id,
            farmer_id=created_products[11].farmer_id,
            quantity=4.0,
            price=created_products[11].price,
            subtotal=round(created_products[11].price * 4, 2),
        )
        oi6 = OrderItem(
            order_id=o3.id,
            product_id=created_products[12].id,
            farmer_id=created_products[12].farmer_id,
            quantity=1.0,
            price=created_products[12].price,
            subtotal=round(created_products[12].price * 1, 2),
        )
        db.add_all([oi5, oi6])

        p3 = Payment(
            order_id=o3.id,
            amount=o3.total_amount,
            payment_method="Online Payment",
            payment_status="Paid",
            transaction_reference=generate_transaction_reference("TXN"),
            created_at=o3.created_at,
        )
        db.add(p3)

        db.commit()

        print("\n[SUCCESS] Seed data successfully populated!")
        print("--------------------------------------------------")
        print("DEMO CREDENTIALS:")
        print("Admin:    admin@kisanbazar.com / admin123")
        print("Farmer 1: ramesh@kisanbazar.com / farmer123 (Sahyadri Organic Orchards)")
        print("Farmer 2: sukhwinder@kisanbazar.com / farmer123 (Golden Harvest Agro Estate)")
        print("Farmer 3: ananya@kisanbazar.com / farmer123 (Deccan Sun Dairy & Spice)")
        print("Consumer: priya@gmail.com / consumer123")
        print("Consumer: amit@gmail.com / consumer123")
        print("--------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during seed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
