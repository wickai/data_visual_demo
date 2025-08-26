import { useState } from "react";
import { 
  Card, 
  Upload, 
  Button, 
  Alert, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Divider,
  message as antdMessage
} from 'antd';
import { 
  UploadOutlined, 
  InboxOutlined, 
  FileExcelOutlined, 
  CheckCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { uploadExcel } from "../api";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export default function ExcelUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileList, setFileList] = useState([]);

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel' ||
                   file.name.endsWith('.xlsx') || 
                   file.name.endsWith('.xls');
    
    if (!isExcel) {
      antdMessage.error('请选择Excel文件 (.xlsx 或 .xls)');
      return Upload.LIST_IGNORE;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      antdMessage.error('文件大小不能超过10MB!');
      return Upload.LIST_IGNORE;
    }
    
    setFile(file);
    return false; // 阻止自动上传
  };

  const handleUpload = async () => {
    if (!file) {
      antdMessage.warning('请先选择文件');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await uploadExcel(file);
      setResult(response);
      antdMessage.success('文件上传成功！');
      setFile(null);
      setFileList([]);
      
      // 调用回调函数刷新产品列表
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (error) {
      antdMessage.error(`上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload,
    onChange: (info) => {
      setFileList(info.fileList.slice(-1)); // 只保留最后一个文件
    },
    onRemove: () => {
      setFile(null);
      setFileList([]);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <Card 
        style={{ marginBottom: '24px' }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ textAlign: 'center' }}>
          <FileExcelOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#52c41a', 
              marginBottom: '16px' 
            }} 
          />
          <Title level={2} style={{ margin: '0 0 8px', color: '#1f2937' }}>
            Excel 数据导入
          </Title>
          <Text type="secondary">
            支持产品库存、采购和销售数据批量导入
          </Text>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧：上传区域 */}
        <Col xs={24} lg={14}>
          <Card 
            title={<><UploadOutlined /> 文件上传</>}
            style={{ height: '100%' }}
          >
            <Dragger {...uploadProps} style={{ marginBottom: '16px' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                <Text strong>点击或拖拽Excel文件到此区域</Text>
              </p>
              <p className="ant-upload-hint">
                <Text type="secondary">
                  支持 .xlsx 和 .xls 格式，最大文件大小 10MB
                </Text>
              </p>
            </Dragger>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button 
                type="primary" 
                size="large"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                disabled={!file || uploading}
                loading={uploading}
                style={{
                  height: '48px',
                  paddingLeft: '32px',
                  paddingRight: '32px'
                }}
              >
                {uploading ? '上传中...' : '开始上传'}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 右侧：格式说明 */}
        <Col xs={24} lg={10}>
          <Card 
            title={<><FileExcelOutlined /> 文件格式要求</>}
            style={{ height: '100%' }}
          >
            <Alert
              message="Excel 文件结构要求"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong>必需列：</Text>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li><Text code>ID</Text> - 产品ID</li>
                <li><Text code>Product Name</Text> - 产品名称</li>
                <li><Text code>Opening Inventory</Text> - 期初库存</li>
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>每天数据列：</Text>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li><Text code>Procurement Qty (Day X)</Text> - 第X天采购数量</li>
                <li><Text code>Procurement Price (Day X)</Text> - 第X天采购价格</li>
                <li><Text code>Sales Qty (Day X)</Text> - 第X天销售数量</li>
                <li><Text code>Sales Price (Day X)</Text> - 第X天销售价格</li>
              </ul>
            </div>

            <Alert
              message="示例数据"
              description={
                <Text code style={{ fontSize: '12px' }}>
                  0000001,CHERRY 1PACK,117,0,$0.00,21,$13.72...
                </Text>
              }
              type="success"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 上传结果显示 */}
      {result && (
        <Card 
          title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> 上传结果</>}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="导入产品数量"
                value={result.products_count}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="导入数据条数"
                value={result.days_count}
                prefix={<FileExcelOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="处理状态"
                value="成功"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Alert
            message="导入成功！"
            description="数据已成功导入数据库，您可以在仪表板中查看和分析这些数据。产品列表已自动刷新。"
            type="success"
            showIcon
            closable
            onClose={() => setResult(null)}
          />
        </Card>
      )}
    </div>
  );
}