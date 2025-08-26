import { useState } from "react";
import { uploadExcel } from "../api";

export default function ExcelUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 检查文件类型
      const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');
      if (!isExcel) {
        setMessage("请选择Excel文件 (.xlsx 或 .xls)");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("请先选择文件");
      return;
    }

    setUploading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await uploadExcel(file);
      setResult(response);
      setMessage("文件上传成功！");
      setFile(null);
      // 重置文件输入
      document.getElementById('file-input').value = '';
      
      // 调用回调函数刷新产品列表
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (error) {
      setMessage(`上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Excel 数据导入</h1>
      
      <div className="max-w-2xl mx-auto">
        {/* 文件格式说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Excel 文件格式要求</h3>
          <div className="text-sm text-blue-700">
            <p className="mb-2">Excel文件应包含以下列：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>ID - 产品ID</li>
              <li>Product Name - 产品名称</li>
              <li>Opening Inventory - 期初库存</li>
              <li>Procurement Qty (Day X) - 第X天采购数量</li>
              <li>Procurement Price (Day X) - 第X天采购价格</li>
              <li>Sales Qty (Day X) - 第X天销售数量</li>
              <li>Sales Price (Day X) - 第X天销售价格</li>
            </ul>
            <p className="mt-2 text-xs text-blue-600">
              示例：0000001,CHERRY 1PACK,117,0,$0.00,21,$13.72,0,$0.00,22,$5.98...
            </p>
          </div>
        </div>

        {/* 文件上传区域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div>
              <label htmlFor="file-input" className="cursor-pointer">
                <span className="text-indigo-600 font-medium hover:text-indigo-500">
                  点击选择文件
                </span>
                <span className="text-gray-500"> 或拖放文件到此处</span>
              </label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {file && (
              <div className="text-sm text-gray-600">
                已选择: {file.name}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              支持 .xlsx 和 .xls 格式，最大文件大小 10MB
            </p>
          </div>
        </div>

        {/* 上传按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                上传中...
              </>
            ) : (
              "上传文件"
            )}
          </button>
        </div>

        {/* 消息显示 */}
        {message && (
          <div className={`mt-4 p-4 rounded-md ${result ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* 上传结果 */}
        {result && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">上传结果</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• 导入产品数量: {result.products_count}</p>
              <p>• 导入数据条数: {result.days_count}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              数据已成功导入数据库，您可以在仪表板中查看和分析这些数据。产品列表已自动刷新。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}