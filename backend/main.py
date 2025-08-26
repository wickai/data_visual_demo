from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
import os
import tempfile
import logging
import json

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 导入我们的模块
from src.database import engine, get_db, Base, User, Product, DailyData
from src.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    ProductResponse, ProductDetailResponse, DailyDataResponse,
    ExcelUploadResponse
)
from src.auth import (
    verify_password, get_password_hash, create_access_token,
    verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
)
from src.utils import parse_excel_file, save_excel_data_to_db

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="库存数据可视化系统")

# 添加422错误处理器
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    logger.error(f"Validation error for {request.method} {request.url}: {len(exc.errors())} errors")
    
    # 清理错误信息，移除不能序列化的对象
    clean_errors = []
    for error in exc.errors():
        clean_error = {
            "type": error.get("type"),
            "loc": error.get("loc"),
            "msg": error.get("msg")
        }
        # 只有当input不是bytes类型时才包含
        if "input" in error and not isinstance(error["input"], bytes):
            clean_error["input"] = error["input"]
        clean_errors.append(clean_error)
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": clean_errors,
            "message": "请求数据验证失败",
            "help": "请检查请求数据格式是否正确，登录接口需要发送JSON格式数据",
            "required_fields": {
                "login": ["username", "password"],
                "register": ["username", "email", "password"]
            },
            "content_type_hint": "请使用 Content-Type: application/json 发送请求"
        }
    )

# 允许跨域（前端 React 访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 安全配置
security = HTTPBearer()

# 依赖注入：获取当前用户
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 用户认证相关API
@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Register attempt for username: {user.username}, email: {user.email}")
        
        # 检查用户名是否已存在
        db_user = db.query(User).filter(User.username == user.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # 检查邮箱是否已存在
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # 创建新用户
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User registered successfully: {user.username}")
        return db_user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for username: {user.username}")
        
        # 验证用户
        db_user = db.query(User).filter(User.username == user.username).first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            logger.warning(f"Login failed for username: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 创建访问令牌
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.username}, expires_delta=access_token_expires
        )
        logger.info(f"Login successful for username: {user.username}")
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# 产品数据相关API
@app.get("/products", response_model=List[ProductResponse])
def get_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@app.get("/product/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # 获取每日数据
    daily_data = db.query(DailyData).filter(DailyData.product_id == product_id).order_by(DailyData.day).all()
    
    # 转换数据格式
    days = []
    for data in daily_data:
        days.append(DailyDataResponse(
            day=data.day,
            inventory=data.inventory,
            procurement=data.procurement_amount,
            sales=data.sales_amount
        ))
    
    return ProductDetailResponse(
        id=product.id,
        name=product.name,
        opening_inventory=product.opening_inventory,
        days=days
    )

@app.get("/products/compare")
def compare_products(
    product_ids: str,  # 逗号分隔的产品ID，如 "0000001,0000002"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """对比多个产品的数据"""
    ids = [pid.strip() for pid in product_ids.split(',') if pid.strip()]
    if not ids:
        raise HTTPException(status_code=400, detail="No product IDs provided")
    
    result = []
    for product_id in ids:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            daily_data = db.query(DailyData).filter(DailyData.product_id == product_id).order_by(DailyData.day).all()
            days = []
            for data in daily_data:
                days.append({
                    "day": data.day,
                    "inventory": data.inventory,
                    "procurement": data.procurement_amount,
                    "sales": data.sales_amount
                })
            
            result.append({
                "id": product.id,
                "name": product.name,
                "days": days
            })
    
    return result

# Excel上传相关API
@app.post("/upload-excel", response_model=ExcelUploadResponse)
async def upload_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传Excel文件并解析数据"""
    # 检查文件类型
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files are allowed")
    
    try:
        # 保存临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # 解析Excel文件
        excel_data = parse_excel_file(tmp_file_path)
        
        # 保存到数据库
        result = save_excel_data_to_db(excel_data, db)
        
        # 删除临时文件
        os.unlink(tmp_file_path)
        
        return ExcelUploadResponse(
            message="Excel file uploaded and processed successfully",
            products_count=result['products_count'],
            days_count=result['days_count']
        )
    
    except Exception as e:
        # 清理临时文件
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        raise HTTPException(status_code=400, detail=str(e))

# 健康检查
@app.get("/")
def root():
    return {"message": "库存数据可视化系统 API"}
