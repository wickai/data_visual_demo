import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Card, Button, Row, Col, Typography, Space, Tag, Statistic, Divider } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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
    const avgInventory = data.length > 0 ? Math.round(data.reduce((sum, day) => sum + day.inventory, 0) / data.length) : 0;
    const totalProcurement = data.reduce((sum, day) => sum + day.procurement, 0);
    const totalSales = data.reduce((sum, day) => sum + day.sales, 0);

    return (
      <div className="w-full">
        {/* 数据概览卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="平均库存"
                value={avgInventory}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="总采购金额"
                value={totalProcurement}
                precision={2}
                prefix={"$"}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="总销售金额"
                value={totalSales}
                precision={2}
                prefix={"$"}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表控制面板 */}
        <Card 
          title={<><LineChartOutlined /> 数据可视化图表</>} 
          size="small" 
          style={{ marginBottom: '16px' }}
        >
          <Space wrap>
            <Text strong>显示指标：</Text>
            <Button
              type={visibleMetrics.inventory ? "primary" : "default"}
              icon={visibleMetrics.inventory ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => toggleMetric('inventory')}
              size="small"
            >
              库存
            </Button>
            <Button
              type={visibleMetrics.procurement ? "primary" : "default"}
              icon={visibleMetrics.procurement ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => toggleMetric('procurement')}
              size="small"
            >
              采购金额
            </Button>
            <Button
              type={visibleMetrics.sales ? "primary" : "default"}
              icon={visibleMetrics.sales ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => toggleMetric('sales')}
              size="small"
            >
              销售金额
            </Button>
          </Space>
        </Card>

        {/* 主图表 */}
        <Card>
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
                formatter={(value, name) => {
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
                  stroke="#1890ff" 
                  name="库存"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1890ff' }}
                  activeDot={{ r: 6, fill: '#1890ff' }}
                />
              )}
              {visibleMetrics.procurement && (
                <Line 
                  type="monotone" 
                  dataKey="procurement" 
                  stroke="#52c41a" 
                  name="采购金额"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#52c41a' }}
                  activeDot={{ r: 6, fill: '#52c41a' }}
                />
              )}
              {visibleMetrics.sales && (
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#fa8c16" 
                  name="销售金额"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fa8c16' }}
                  activeDot={{ r: 6, fill: '#fa8c16' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  };

  // 处理多产品对比模式的数据
  const renderCompareProducts = () => {
    if (!products || products.length === 0) {
      return (
        <Card>
          <div className="text-center py-12">
            <PieChartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '16px' }}>没有选择对比产品</Text>
            </div>
          </div>
        </Card>
      );
    }

    // 合并所有产品的数据
    const mergedData = {};
    
    products.forEach((product) => {
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
        {/* 标题和产品标签 */}
        <Card 
          title={<><BarChartOutlined /> 产品对比分析</>}
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Space wrap>
            <Text strong>对比产品：</Text>
            {products.map((product, index) => (
              <Tag 
                key={product.id}
                color={COLORS[index % COLORS.length]}
                style={{ marginBottom: '4px' }}
              >
                {product.name}
              </Tag>
            ))}
          </Space>
        </Card>
        
        {/* 三个对比图表 */}
        <Row gutter={[16, 16]}>
          {/* 库存对比 */}
          <Col xs={24} lg={8}>
            <Card 
              title={<><BarChartOutlined style={{ color: '#1890ff' }} /> 库存对比</>}
              size="small"
            >
              <ResponsiveContainer width="100%" height={280}>
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
            </Card>
          </Col>

          {/* 采购金额对比 */}
          <Col xs={24} lg={8}>
            <Card 
              title={<><BarChartOutlined style={{ color: '#52c41a' }} /> 采购金额对比</>}
              size="small"
            >
              <ResponsiveContainer width="100%" height={280}>
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
            </Card>
          </Col>

          {/* 销售金额对比 */}
          <Col xs={24} lg={8}>
            <Card 
              title={<><BarChartOutlined style={{ color: '#fa8c16' }} /> 销售金额对比</>}
              size="small"
            >
              <ResponsiveContainer width="100%" height={280}>
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
            </Card>
          </Col>
        </Row>

        {/* 产品摘要信息 */}
        <Card 
          title="对比产品摘要" 
          size="small" 
          style={{ marginTop: '16px' }}
        >
          <Row gutter={[16, 16]}>
            {products.map((product, index) => {
              const avgInventory = product.days.length > 0 
                ? Math.round(product.days.reduce((sum, day) => sum + day.inventory, 0) / product.days.length)
                : 0;
              const totalSales = product.days.reduce((sum, day) => sum + day.sales, 0);
              
              return (
                <Col key={product.id} xs={24} sm={12} lg={8}>
                  <Card size="small" style={{ border: `2px solid ${COLORS[index % COLORS.length]}` }}>
                    <div style={{ marginBottom: '8px' }}>
                      <Tag color={COLORS[index % COLORS.length]} style={{ marginBottom: '4px' }}>
                        {product.name}
                      </Tag>
                    </div>
                    <Row gutter={[8, 8]}>
                      <Col span={24}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>ID: {product.id}</Text>
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="数据天数" 
                          value={product.days.length} 
                          valueStyle={{ fontSize: '14px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="平均库存" 
                          value={avgInventory} 
                          valueStyle={{ fontSize: '14px', color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title="总销售" 
                          value={totalSales} 
                          precision={0}
                          prefix="$"
                          valueStyle={{ fontSize: '14px', color: '#fa8c16' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full">
      {compareMode ? renderCompareProducts() : renderSingleProduct()}
    </div>
  );
}
