import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

// 预定义颜色数组
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#87d068', '#ffc0cb', '#ffb347', '#98fb98'
];

export default function ProductChart({ data, compareMode = false, products = [] }) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    inventory: true,
    procurement: true,
    sales: true
  });

  const toggleMetric = (metric) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // 处理单产品模式的数据
  const renderSingleProduct = () => {
    return (
      <div className="w-full">
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => toggleMetric('inventory')}
            className={`px-3 py-1 rounded text-sm ${
              visibleMetrics.inventory 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            🎯 库存
          </button>
          <button
            onClick={() => toggleMetric('procurement')}
            className={`px-3 py-1 rounded text-sm ${
              visibleMetrics.procurement 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            📦 采购金额
          </button>
          <button
            onClick={() => toggleMetric('sales')}
            className={`px-3 py-1 rounded text-sm ${
              visibleMetrics.sales 
                ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            💰 销售金额
          </button>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              label={{ value: '天数', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: '数量/金额', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name, props) => {
                if (name === '库存') return [value, '库存数量'];
                if (name === '采购金额') return [`$${value.toFixed(2)}`, '采购金额'];
                if (name === '销售金额') return [`$${value.toFixed(2)}`, '销售金额'];
                return [value, name];
              }}
              labelFormatter={(label) => `第 ${label} 天`}
            />
            <Legend />

            {visibleMetrics.inventory && (
              <Line 
                type="monotone" 
                dataKey="inventory" 
                stroke="#8884d8" 
                name="库存"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {visibleMetrics.procurement && (
              <Line 
                type="monotone" 
                dataKey="procurement" 
                stroke="#82ca9d" 
                name="采购金额"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {visibleMetrics.sales && (
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#ff7300" 
                name="销售金额"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 处理多产品对比模式的数据
  const renderCompareProducts = () => {
    if (!products || products.length === 0) {
      return <div className="text-center py-8 text-gray-500">没有选择对比产品</div>;
    }

    // 合并所有产品的数据
    const mergedData = {};
    
    products.forEach((product, productIndex) => {
      product.days.forEach(day => {
        const dayKey = day.day;
        if (!mergedData[dayKey]) {
          mergedData[dayKey] = { day: dayKey };
        }
        
        const prefix = `${product.name.substring(0, 10)}...`;
        mergedData[dayKey][`${prefix}_库存`] = day.inventory;
        mergedData[dayKey][`${prefix}_采购`] = day.procurement;
        mergedData[dayKey][`${prefix}_销售`] = day.sales;
      });
    });

    const chartData = Object.values(mergedData).sort((a, b) => a.day - b.day);

    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">产品对比分析</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 库存对比 */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-medium mb-3 text-blue-800">📊 库存对比</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="2 2" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [value, '库存数量']} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {products.map((product, index) => {
                  const prefix = `${product.name.substring(0, 10)}...`;
                  return (
                    <Line
                      key={`inventory-${product.id}`}
                      type="monotone"
                      dataKey={`${prefix}_库存`}
                      stroke={COLORS[index % COLORS.length]}
                      name={prefix}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 采购金额对比 */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-medium mb-3 text-green-800">📦 采购金额对比</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="2 2" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '采购金额']} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {products.map((product, index) => {
                  const prefix = `${product.name.substring(0, 10)}...`;
                  return (
                    <Line
                      key={`procurement-${product.id}`}
                      type="monotone"
                      dataKey={`${prefix}_采购`}
                      stroke={COLORS[index % COLORS.length]}
                      name={prefix}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 销售金额对比 */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-medium mb-3 text-orange-800">💰 销售金额对比</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="2 2" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '销售金额']} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {products.map((product, index) => {
                  const prefix = `${product.name.substring(0, 10)}...`;
                  return (
                    <Line
                      key={`sales-${product.id}`}
                      type="monotone"
                      dataKey={`${prefix}_销售`}
                      stroke={COLORS[index % COLORS.length]}
                      name={prefix}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 产品摘要信息 */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-semibold mb-3">对比产品摘要</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <div key={product.id} className="bg-white rounded border p-3">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-sm">{product.name}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>ID: {product.id}</div>
                  <div>数据天数: {product.days.length}</div>
                  <div>平均库存: {Math.round(product.days.reduce((sum, day) => sum + day.inventory, 0) / product.days.length)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {compareMode ? renderCompareProducts() : renderSingleProduct()}
    </div>
  );
}
