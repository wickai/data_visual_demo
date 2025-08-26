import { useEffect, useState } from "react";
import { Flex, Layout } from 'antd';
import ProductChart from "./components/ProductChart";
import Login from "./components/Login";
import ExcelUpload from "./components/ExcelUpload";
import Navigation from "./components/Navigation";
import { getProducts, getProduct, compareProducts, getCurrentUser } from "./api";

const { Header, Content, Footer, Sider } = Layout;

// Ant Design Layout 样式配置
const layoutStyle = {
  minHeight: '100vh',
};

const siderStyle = {
  background: '#fff',
  borderRight: '1px solid #f0f0f0',
};

const headerStyle = {
  background: '#fff',
  borderBottom: '1px solid #f0f0f0',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const contentStyle = {
  margin: '0',
  minHeight: 'auto',
  background: '#f5f5f5',
};

const footerStyle = {
  textAlign: 'center',
  background: '#fff',
  borderTop: '1px solid #f0f0f0',
};

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
    // Get user information again
    getCurrentUser()
      .then(setUser)
      .catch(err => console.error('Failed to get user info:', err));
  };

  const handleProductSelection = (productId) => {
    if (compareMode) {
      setSelectedProducts(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        } else if (prev.length < 5) { // Limit to maximum 5 products comparison
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
          <p className="mt-4 text-gray-600">Loading...</p>
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
        
        {/* Mode Switch Button */}
        <div className="mb-4">
          <button
            onClick={toggleCompareMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              compareMode 
                ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {compareMode ? '🔄 Switch to Single Product Mode' : '📊 Switch to Compare Mode'}
          </button>
        </div>

        {/* Product Selection Area */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          {compareMode ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Products to Compare (Max 5)</h3>
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
                  {selectedProducts.length} products selected for comparison
                </div>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Product to View Detailed Data
              </label>
              <select
                id="product-select"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selected || ""}
                onChange={(e) => handleProductSelection(e.target.value)}
              >
                <option value="">Please select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chart Display Area */}
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
              <p>Please select products to compare</p>
            </div>
          )
        ) : (
          chartData.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {products.find(p => p.id === selected)?.name || 'Product Details'}
              </h2>
              <ProductChart data={chartData} compareMode={false} />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📈</div>
              <p>Please select a product to view data visualization</p>
            </div>
          )
        )}
      </div>

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
    <Flex>
      <Layout style={layoutStyle}>
        <Sider width="25%" style={siderStyle}>
          <Navigation 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
            user={user}
          />
        </Sider>
        <Layout>
          <Header style={headerStyle}>
            <div>
              <h1 className="text-xl font-bold text-gray-900 m-0">
                {currentPage === 'dashboard' ? '📊 Data Visualization Dashboard' : '📁 Data Import'}
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.username || 'User'}
            </div>
          </Header>
          <Content style={contentStyle}>
            <div className="p-6">
              {renderContent()}
            </div>
          </Content>
          <Footer style={footerStyle}>
            © 2024 Data Visualization Platform - Built with AI Assistant
          </Footer>
        </Layout>
      </Layout>
    </Flex>
  );
}

export default App;
