from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True)  # 产品ID如 "0000001"
    name = Column(String, nullable=False)
    opening_inventory = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    daily_data = relationship("DailyData", back_populates="product")

class DailyData(Base):
    __tablename__ = "daily_data"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    day = Column(Integer, nullable=False)  # 第几天
    
    # 库存数据
    inventory = Column(Integer, nullable=False, default=0)
    
    # 采购数据
    procurement_qty = Column(Integer, nullable=False, default=0)
    procurement_price = Column(Float, nullable=False, default=0.0)
    
    # 销售数据
    sales_qty = Column(Integer, nullable=False, default=0)
    sales_price = Column(Float, nullable=False, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    product = relationship("Product", back_populates="daily_data")
    
    @property
    def procurement_amount(self):
        """采购金额 = 数量 * 价格"""
        return self.procurement_qty * self.procurement_price
    
    @property
    def sales_amount(self):
        """销售金额 = 数量 * 价格"""
        return self.sales_qty * self.sales_price