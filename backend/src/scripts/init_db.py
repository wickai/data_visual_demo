#!/usr/bin/env python3
"""
Database initialization script
"""
import sys
import os

# Add parent directories to path to access src modules
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from sqlalchemy.orm import Session
from src.database import engine, SessionLocal, Base, User, Product, DailyData
from src.auth import get_password_hash

def init_database():
    """Initialize database"""
    print("Initializing database...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).first()
        if not existing_user:
            # Create default admin user
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin_user)
            print("Created default admin user: admin/admin123")
        
        # Check if sample data exists
        existing_product = db.query(Product).first()
        if not existing_product:
            # Create sample product data
            products_data = [
                {
                    "id": "0000001",
                    "name": "CHERRY 1PACK",
                    "opening_inventory": 117,
                    "days": [
                        {"day": 1, "inventory": 95, "procurement_qty": 0, "procurement_price": 0, "sales_qty": 22, "sales_price": 5.98},
                        {"day": 2, "inventory": 104, "procurement_qty": 21, "procurement_price": 13.72, "sales_qty": 12, "sales_price": 5.98},
                        {"day": 3, "inventory": 97, "procurement_qty": 0, "procurement_price": 0, "sales_qty": 7, "sales_price": 4.98},
                    ]
                },
                {
                    "id": "0000002",
                    "name": "ENOKI MUSHROOM 360G",
                    "opening_inventory": 1020,
                    "days": [
                        {"day": 1, "inventory": 1613, "procurement_qty": 750, "procurement_price": 3.20, "sales_qty": 157, "sales_price": 4.38},
                        {"day": 2, "inventory": 1742, "procurement_qty": 240, "procurement_price": 2.80, "sales_qty": 111, "sales_price": 4.38},
                        {"day": 3, "inventory": 1839, "procurement_qty": 192, "procurement_price": 3.60, "sales_qty": 95, "sales_price": 4.38},
                    ]
                }
            ]
            
            for product_data in products_data:
                # Create product
                product = Product(
                    id=product_data["id"],
                    name=product_data["name"],
                    opening_inventory=product_data["opening_inventory"]
                )
                db.add(product)
                
                # Create daily data
                for day_data in product_data["days"]:
                    daily_data = DailyData(
                        product_id=product_data["id"],
                        day=day_data["day"],
                        inventory=day_data["inventory"],
                        procurement_qty=day_data["procurement_qty"],
                        procurement_price=day_data["procurement_price"],
                        sales_qty=day_data["sales_qty"],
                        sales_price=day_data["sales_price"]
                    )
                    db.add(daily_data)
            
            print("Created sample product data")
        
        db.commit()
        print("Database initialization completed!")
        
    except Exception as e:
        print(f"Initialization failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()