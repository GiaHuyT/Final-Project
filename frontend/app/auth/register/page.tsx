'use client';
import { useState } from 'react';

export default function RegisterPage() {
    // useState để lưu trữ dữ liệu từ các ô nhập liệu
    const [formData, setFormData] = useState({
        email: '',
        phonenumber: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trang web tải lại khi nhấn nút

        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('Đăng ký thành công!');
            window.location.href = '/login'; // Chuyển hướng người dùng sang trang đăng nhập
        } else {
            alert('Có lỗi xảy ra khi đăng ký!');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
            <h1>Tạo tài khoản mới</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                    type="phonenumber"
                    placeholder="Số điện thoại"
                    onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit" style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none' }}>
                    Đăng ký
                </button>
            </form>
            <p>Đã có tài khoản? <a href="/auth/login">Đăng nhập</a></p>
        </div>
    );
}