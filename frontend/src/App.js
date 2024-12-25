import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css'; // 引入样式文件

// 替换为你的 Heroku 地址
const socket = io('https://my-chat-app.herokuapp.com');

function App() {
  const [nickname, setNickname] = useState(''); // 保存用户昵称
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isNicknameSet, setIsNicknameSet] = useState(false); // 检查昵称是否设置
  const messagesEndRef = useRef(null); // 用于滚动到底部

  useEffect(() => {
    // 接收后端发送的消息
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // 接收聊天记录
    socket.on('chat_history', (data) => {
      setMessages(data);
    });

    // 清理事件监听
    return () => {
      socket.off('receive_message');
      socket.off('chat_history');
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString(); // 添加时间戳
      socket.emit('send_message', { text: message, sender: nickname, timestamp }); // 发送消息到后端
      setMessage(''); // 清空输入框
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage(); // 当按下 Enter 键时，发送消息
    }
  };

  const handleSetNickname = () => {
    if (nickname.trim()) {
      setIsNicknameSet(true); // 设置昵称完成
    }
  };

  return (
    <div className="chat-container">
      {!isNicknameSet ? (
        <div className="nickname-container">
          <h2>Enter your nickname:</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="chat-input"
            placeholder="Your nickname..."
          />
          <button onClick={handleSetNickname} className="chat-send-button">
            Start Chat
          </button>
        </div>
      ) : (
        <>
          <div className="chat-header">Chat App</div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.sender === nickname ? 'chat-message-self' : 'chat-message-other'
                }`}
              >
                <div className="chat-sender">{msg.sender}</div>
                <div className="chat-text">{msg.text}</div>
                <div className="chat-timestamp">{msg.timestamp}</div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress} // 监听按键事件
              className="chat-input"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="chat-send-button">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
