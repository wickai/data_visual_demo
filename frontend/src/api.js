const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// 获取存储的token
function getToken() {
  return localStorage.getItem('token');
}

// 设置token
export function setToken(token) {
  localStorage.setItem('token', token);
}

// 清除token
export function clearToken() {
  localStorage.removeItem('token');
}

// 通用请求函数
async function apiRequest(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 认证相关API
export async function login(username, password) {
  const response = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('登录失败');
  }

  const data = await response.json();
  setToken(data.access_token);
  return data;
}

export async function register(username, email, password) {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function getCurrentUser() {
  return apiRequest('/me');
}

// 产品相关API
export async function getProducts() {
  return apiRequest('/products');
}

export async function getProduct(pid) {
  return apiRequest(`/product/${pid}`);
}

export async function compareProducts(productIds) {
  const ids = Array.isArray(productIds) ? productIds.join(',') : productIds;
  return apiRequest(`/products/compare?product_ids=${ids}`);
}

// Excel上传API
export async function uploadExcel(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE}/upload-excel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('文件上传失败');
  }

  return response.json();
}
