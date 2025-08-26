from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# 用户相关模式
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# 产品相关模式
class ProductResponse(BaseModel):
    id: str
    name: str
    opening_inventory: int
    
    class Config:
        from_attributes = True

class DailyDataResponse(BaseModel):
    day: int
    inventory: int
    procurement: float  # 采购金额
    sales: float  # 销售金额
    
    class Config:
        from_attributes = True

class ProductDetailResponse(BaseModel):
    id: str
    name: str
    opening_inventory: int
    days: List[DailyDataResponse]
    
    class Config:
        from_attributes = True

# Excel上传相关模式
class ExcelUploadResponse(BaseModel):
    message: str
    products_count: int
    days_count: int