import { useState } from "react";
import "./Home.less";

export function Home() {
  const [message, setMessage] = useState("");

  const handleFetchData = async () => {
    try {
      const response = await fetch("/api/hello");
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Failed to fetch data");
      console.error(error);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>全栈 Web 应用框架</h1>
        <p className="subtitle">基于 Express + React + Vite 的前后端融合架构</p>

        <div className="features">
          <div className="feature-card">
            <h3>🚀 快速开发</h3>
            <p>开箱即用的开发环境配置</p>
          </div>
          <div className="feature-card">
            <h3>🔧 TypeScript</h3>
            <p>完整的类型支持</p>
          </div>
          <div className="feature-card">
            <h3>📦 模块化</h3>
            <p>清晰的项目结构</p>
          </div>
        </div>

        <div className="demo-section">
          <h2>API 示例</h2>
          <button onClick={handleFetchData} className="demo-button">
            测试 API 调用
          </button>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    </div>
  );
}
