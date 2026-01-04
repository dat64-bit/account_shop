import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Chặn việc load lại trang của form
        
        try {
            // 1. GỌI API SANG SPRING BOOT
            const res = await axios.post('http://localhost:8080/api/auth/login', {
                username: username,
                password: password
            });

            // 2. NẾU THÀNH CÔNG (Spring trả về 200 OK)
            console.log("Đăng nhập thành công:", res.data);

            // 3. LƯU TOKEN VÀO KHO (LocalStorage) -> Cực kỳ quan trọng!
            // Giống như việc bạn cất thẻ từ vào ví.
            localStorage.setItem('accessToken', res.data.token);

            alert("Đăng nhập thành công!");
            // Chuyển hướng sang trang chủ...
            
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Đăng nhập thất bại: " + (error.response?.data || "Lỗi server"));
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <div>
                <label>Username:</label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
            </div>
            <div>
                <label>Password:</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            <button type="submit">Đăng nhập</button>
        </form>
    );
};

export default Login;