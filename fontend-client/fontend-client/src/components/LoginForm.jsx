import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
    // Quản lý trạng thái form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Chặn load lại trang

        try {
            // GỌI API SANG SPRING BOOT
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: username,
                password: password
            });

            // Nếu thành công (Backend trả về 200)
            console.log("Kết quả:", response.data);
            alert(response.data.message); // Hiện thông báo "Đăng nhập thành công"

            // Lưu token giả vào localStorage để dùng sau này
            localStorage.setItem('accessToken', response.data.token);

        } catch (error) {
            // Nếu thất bại (Backend trả về 401 hoặc lỗi mạng)
            console.error(error);
            alert("Đăng nhập thất bại! Kiểm tra lại thông tin.");
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Đăng nhập hệ thống</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Tên đăng nhập" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        type="password" 
                        placeholder="Mật khẩu" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Đăng nhập ngay</button>
            </form>
        </div>
    );
};

export default LoginForm;