import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ready } from './data';
import './style.css';
const root = createRoot(document.getElementById('root')!);
ready.then(() => root.render(<React.StrictMode><App /></React.StrictMode>)).catch(() => root.render(<main role="alert">本地数据库无法打开，请检查浏览器存储权限后重试。</main>));
