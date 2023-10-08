import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import 'dayjs/locale/ja';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './_reset.css';
import './index.css';

// 相対日時のプラグインを有効化
dayjs.extend(relativeTime);
// 日本語で ◯日前 のように表示する
dayjs.locale('ja');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
