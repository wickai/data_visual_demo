import { useEffect, useState } from "react";
import ProductChart from "./components/ProductChart";
import Login from "./components/Login";
import ExcelUpload from "./components/ExcelUpload";
import Navigation from "./components/Navigation";
import { getProducts, getProduct, compareProducts, getCurrentUser } from "./api";

function App() {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 页面状态
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // 数据状态
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // 多产品对比状态
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [compareData, setCompareData] = useState([]);

  // 检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 获取产品列表
  const refreshProducts = async () => {
    try {
      const newProducts = await getProducts();
      setProducts(newProducts);
    } catch (err) {
      console.error('获取产品失败:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    }
  }, [isAuthenticated]);

  // 获取单个产品数据
  useEffect(() => {
    if (selected && !compareMode) {
      getProduct(selected)
        .then((res) => {
          setChartData(res.days || []);
        })
        .catch(err => console.error('获取产品详情失败:', err));
    }
  }, [selected, compareMode]);

  // 获取对比产品数据
  useEffect(() => {
    if (compareMode && selectedProducts.length > 0) {
      compareProducts(selectedProducts)
        .then(setCompareData)
        .catch(err => console.error('获取对比数据失败:', err));
    }
  }, [compareMode, selectedProducts]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // 重新获取用户信息
    getCurrentUser()
      .then(setUser)
      .catch(err => console.error('获取用户信息失败:', err));
  };

  const handleProductSelection = (productId) => {
    if (compareMode) {
      setSelectedProducts(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        } else if (prev.length < 5) { // 限制最多5个产品对比
          return [...prev, productId];
        }
        return prev;
      });
    } else {
      setSelected(productId);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedProducts([]);
    setSelected(null);
    setChartData([]);
    setCompareData([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderDashboard = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">📊 数据可视化仪表板</h1>
        
        {/* 模式切换按钮 */}
        <div className="mb-4">
          <button
            onClick={toggleCompareMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              compareMode 
                ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {compareMode ? '🔄 切换到单产品模式' : '📊 切换到对比模式'}
          </button>
        </div>

        {/* 产品选择区域 */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          {compareMode ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">选择要对比的产品 (最多5个)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                      disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= 5}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${
                      selectedProducts.includes(product.id) ? 'font-medium text-indigo-700' : 'text-gray-700'
                    }`}>
                      {product.name}
                    </span>
                  </label>
                ))}
              </div>
              {selectedProducts.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  已选择 {selectedProducts.length} 个产品进行对比
                </div>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
                选择产品查看详细数据
              </label>
              <select
                id="product-select"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selected || ""}
                onChange={(e) => handleProductSelection(e.target.value)}
              >
                <option value="">请选择商品</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 图表显示区域 */}
      <div className="bg-white border rounded-lg p-6">
        {compareMode ? (
          selectedProducts.length > 0 ? (
            <ProductChart 
              data={[]} 
              compareMode={true} 
              products={compareData}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>请选择要对比的产品</p>
            </div>
          )
        ) : (
          chartData.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {products.find(p => p.id === selected)?.name || '产品详情'}
              </h2>
              <ProductChart data={chartData} compareMode={false} />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📈</div>
              <p>请选择商品查看数据可视化</p>
            </div>
          )
        )}
      </div>

      {/* 数据统计摘要 */}
      {!compareMode && chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">平均库存</h3>
            <p className="text-2xl font-bold text-blue-900">
              {Math.round(chartData.reduce((sum, day) => sum + day.inventory, 0) / chartData.length)}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-1">总采购金额</h3>
            <p className="text-2xl font-bold text-green-900">
              ${chartData.reduce((sum, day) => sum + day.procurement, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800 mb-1">总销售金额</h3>
            <p className="text-2xl font-bold text-orange-900">
              ${chartData.reduce((sum, day) => sum + day.sales, 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'upload':
        return <ExcelUpload onUploadSuccess={refreshProducts} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        user={user}
      />
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
