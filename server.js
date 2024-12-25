const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

// 中间件设置
app.use(cors());
app.use(express.json());

// 创建 HTTP 服务器和 Socket.IO 实例
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 默认路由
app.get('/', (req, res) => {
    res.send('Hello! Your server is running successfully.');
});

// 聊天记录存储（仅在内存中，重启后清空）
let messages = [];

// Socket.IO 连接事件
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 发送现有聊天记录给新连接的用户
    socket.emit('chat_history', messages);

    // 监听发送消息事件
    socket.on('send_message', (data) => {
        const timestamp = new Date().toLocaleTimeString(); // 添加时间戳
        const messageWithTimestamp = { ...data, timestamp }; // 添加时间戳到消息
        messages.push(messageWithTimestamp); // 保存消息
        io.emit('receive_message', messageWithTimestamp); // 广播消息
    });

    // 用户断开连接
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// 启动服务器
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
