import { Menu, Avatar, Typography, Space, Button, Divider } from 'antd';
import { DashboardOutlined, UploadOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { clearToken } from "../api";

const { Text } = Typography;

export default function Navigation({ currentPage, onPageChange, user }) {
  const handleLogout = () => {
    clearToken();
    window.location.reload();
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: '数据导入',
    },
  ];

  const handleMenuClick = ({ key }) => {
    onPageChange(key);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部Logo区域 */}
      <div className="p-4 border-b border-gray-200">
        <Space align="center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">📈</span>
          </div>
          <div>
            <Text strong className="text-lg">库存可视化</Text>
            <br />
            <Text type="secondary" className="text-xs">数据分析平台</Text>
          </div>
        </Space>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1">
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            border: 'none', 
            background: 'transparent',
            padding: '16px 0'
          }}
        />
      </div>

      {/* 底部用户信息 */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* 用户信息 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <Space>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div>
              <Text strong className="text-sm">
                {user?.username || 'User'}
              </Text>
              <br />
              <Text type="secondary" className="text-xs">
                {user?.email || '用户'}
              </Text>
            </div>
          </Space>
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        {/* 退出按钮 */}
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full text-left"
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}