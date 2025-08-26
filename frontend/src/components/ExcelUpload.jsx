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
      antdMessage.error('Please select an Excel file (.xlsx or .xls)');
      return Upload.LIST_IGNORE;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      antdMessage.error('File size cannot exceed 10MB!');
      return Upload.LIST_IGNORE;
    }
    
    setFile(file);
    return false; // 阻止自动上传
  };

  const handleUpload = async () => {
    if (!file) {
      antdMessage.warning('Please select a file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await uploadExcel(file);
      setResult(response);
      antdMessage.success('File uploaded successfully!');
      setFile(null);
      setFileList([]);
      
      // Call callback function to refresh product list
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (error) {
      antdMessage.error(`Upload failed: ${error.message}`);
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
            Excel Data Import
          </Title>
          <Text type="secondary">
            Support batch import of product inventory, procurement and sales data
          </Text>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧：上传区域 */}
        <Col xs={24} lg={14}>
          <Card 
            title={<><UploadOutlined /> File Upload</>}
            style={{ height: '100%' }}
          >
            <Dragger {...uploadProps} style={{ marginBottom: '16px' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                <Text strong>Click or drag Excel files to this area</Text>
              </p>
              <p className="ant-upload-hint">
                <Text type="secondary">
                  Support .xlsx and .xls formats, maximum file size 10MB
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
                {uploading ? 'Uploading...' : 'Start Upload'}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 右侧：格式说明 */}
        <Col xs={24} lg={10}>
          <Card 
            title={<><FileExcelOutlined /> File Format Requirements</>}
            style={{ height: '100%' }}
          >
            <Alert
              message="Excel File Structure Requirements"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Required Columns:</Text>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li><Text code>ID</Text> - Product ID</li>
                <li><Text code>Product Name</Text> - Product Name</li>
                <li><Text code>Opening Inventory</Text> - Opening Inventory</li>
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>Daily Data Columns:</Text>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li><Text code>Procurement Qty (Day X)</Text> - Day X Procurement Quantity</li>
                <li><Text code>Procurement Price (Day X)</Text> - Day X Procurement Price</li>
                <li><Text code>Sales Qty (Day X)</Text> - Day X Sales Quantity</li>
                <li><Text code>Sales Price (Day X)</Text> - Day X Sales Price</li>
              </ul>
            </div>

            <Alert
              message="Sample Data"
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
          title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> Upload Result</>}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Imported Products Count"
                value={result.products_count}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Imported Data Records"
                value={result.days_count}
                prefix={<FileExcelOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Processing Status"
                value="Success"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Alert
            message="Import Successful!"
            description="Data has been successfully imported into the database. You can view and analyze this data in the dashboard. The product list has been automatically refreshed."
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