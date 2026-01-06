'use client';
import { useState } from 'react';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newerrors: any = {};

        if (!identifier.trim())
            newerrors.identifier = 'Email hoặc số điện thoại không được để trống';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) && !/^\d{9,12}$/.test(identifier))
            newerrors.identifier = 'Email hoặc số điện thoại không đúng định dạng';

        if (!password) 
            newerrors.password = 'Mật khẩu không được để trống';
        else if (password.length < 6)
            newerrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

        setErrors(newerrors);
        return Object.keys(newerrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Đăng nhập thành công');
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/';
            } else {
                alert(data.message || 'Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Không kết nối được đến server backend');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
            <h1>Đăng nhập</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    placeholder="Email hoặc PhoneNumber"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                {errors.identifier && (
                    <span style={{ color: 'red' }}>{errors.identifier}</span>
                )}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                    <span style={{ color: 'red' }}>{errors.password}</span>
                )}

                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>
                    Vào hệ thống
                </button>
            </form>
            <p>Chưa có tài khoản? <a href="/auth/register">Đăng ký ngay</a></p>
        </div>
    );
}