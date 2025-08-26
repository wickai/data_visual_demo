import pandas as pd
import re
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from ..database import Product, DailyData

def parse_excel_file(file_path: str) -> Dict[str, Any]:
    """
    解析Excel文件并返回结构化数据
    """
    try:
        # 读取Excel文件
        df = pd.read_excel(file_path)
        
        # 检查必要的列
        required_columns = ['ID', 'Product Name', 'Opening Inventory']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")
        
        products_data = []
        
        for _, row in df.iterrows():
            product_id = str(row['ID']).strip()
            product_name = str(row['Product Name']).strip()
            opening_inventory = int(row['Opening Inventory'])
            
            # 解析每天的数据
            days_data = []
            day = 1
            
            while True:
                # 检查是否还有这一天的数据
                procurement_qty_col = f'Procurement Qty (Day {day})'
                procurement_price_col = f'Procurement Price (Day {day})'
                sales_qty_col = f'Sales Qty (Day {day})'
                sales_price_col = f'Sales Price (Day {day})'
                
                if (procurement_qty_col not in df.columns or 
                    procurement_price_col not in df.columns or
                    sales_qty_col not in df.columns or
                    sales_price_col not in df.columns):
                    break
                
                # 获取数据
                procurement_qty = row[procurement_qty_col] if pd.notna(row[procurement_qty_col]) else 0
                procurement_price_raw = row[procurement_price_col] if pd.notna(row[procurement_price_col]) else "$0.00"
                sales_qty = row[sales_qty_col] if pd.notna(row[sales_qty_col]) else 0
                sales_price_raw = row[sales_price_col] if pd.notna(row[sales_price_col]) else "$0.00"
                
                # 解析价格（去掉$符号）
                procurement_price = float(str(procurement_price_raw).replace('$', '').replace(',', '').strip() or 0)
                sales_price = float(str(sales_price_raw).replace('$', '').replace(',', '').strip() or 0)
                
                # 计算库存（这里简化处理，实际应该根据业务逻辑计算）
                if day == 1:
                    inventory = opening_inventory + int(procurement_qty) - int(sales_qty)
                else:
                    prev_inventory = days_data[-1]['inventory']
                    inventory = prev_inventory + int(procurement_qty) - int(sales_qty)
                
                days_data.append({
                    'day': day,
                    'inventory': inventory,
                    'procurement_qty': int(procurement_qty),
                    'procurement_price': procurement_price,
                    'sales_qty': int(sales_qty),
                    'sales_price': sales_price
                })
                
                day += 1
            
            products_data.append({
                'id': product_id,
                'name': product_name,
                'opening_inventory': opening_inventory,
                'days': days_data
            })
        
        return {
            'products': products_data,
            'products_count': len(products_data),
            'max_days': max(len(p['days']) for p in products_data) if products_data else 0
        }
    
    except Exception as e:
        raise ValueError(f"Error parsing Excel file: {str(e)}")

def save_excel_data_to_db(excel_data: Dict[str, Any], db: Session):
    """
    将Excel数据保存到数据库
    """
    try:
        products_count = 0
        days_count = 0
        
        for product_data in excel_data['products']:
            # 检查产品是否已存在
            existing_product = db.query(Product).filter(Product.id == product_data['id']).first()
            if existing_product:
                # 删除现有的每日数据
                db.query(DailyData).filter(DailyData.product_id == product_data['id']).delete()
                # 更新产品信息
                existing_product.name = product_data['name']
                existing_product.opening_inventory = product_data['opening_inventory']
            else:
                # 创建新产品
                new_product = Product(
                    id=product_data['id'],
                    name=product_data['name'],
                    opening_inventory=product_data['opening_inventory']
                )
                db.add(new_product)
                products_count += 1
            
            # 添加每日数据
            for day_data in product_data['days']:
                daily_data = DailyData(
                    product_id=product_data['id'],
                    day=day_data['day'],
                    inventory=day_data['inventory'],
                    procurement_qty=day_data['procurement_qty'],
                    procurement_price=day_data['procurement_price'],
                    sales_qty=day_data['sales_qty'],
                    sales_price=day_data['sales_price']
                )
                db.add(daily_data)
                days_count += 1
        
        db.commit()
        return {
            'products_count': products_count,
            'days_count': days_count
        }
    
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error saving to database: {str(e)}")