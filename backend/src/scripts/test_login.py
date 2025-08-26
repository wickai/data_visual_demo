#!/usr/bin/env python3
"""
测试登录接口的脚本
用于验证422错误的修复
"""

import sys
import os
import requests
import json

# Add parent directories to path (if needed for future extensions)
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

# 服务器地址
BASE_URL = "http://localhost:8000"

def test_login_scenarios():
    """测试不同的登录场景"""
    
    print("=== 测试登录接口 ===")
    
    # 场景1：正确的登录请求
    print("\n1. 测试正确格式的登录请求:")
    correct_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            json=correct_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 场景2：缺少必需字段
    print("\n2. 测试缺少password字段:")
    missing_password = {
        "username": "testuser"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            json=missing_password,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 场景3：错误的字段名
    print("\n3. 测试错误的字段名:")
    wrong_field = {
        "user": "testuser",  # 应该是username
        "pass": "testpass"   # 应该是password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            json=wrong_field,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 场景4：错误的Content-Type
    print("\n4. 测试错误的Content-Type:")
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            data="username=testuser&password=testpass",  # form data而不是JSON
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")

if __name__ == "__main__":
    test_login_scenarios()