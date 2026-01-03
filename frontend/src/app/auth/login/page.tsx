'use client';
import { useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.message === 'Đăng nhập thành công') {
            alert('Đăng nhập thành công! Chào ' + data.user.username);
            // Bạn có thể lưu thông tin user vào localStorage để dùng cho các trang khác
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            alert(data.message || 'Sai tên đăng nhập hoặc mật khẩu');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
            <h1>Đăng nhập</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    placeholder="Email hoặc PhoneNumber"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>
                    Vào hệ thống
                </button>
            </form>
            <p>Chưa có tài khoản? <a href="/auth/register">Đăng ký ngay</a></p>
        </div>
    );
}