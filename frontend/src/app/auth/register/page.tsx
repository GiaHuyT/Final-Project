"use client";

import { useState } from "react";

export default function RegisterPage() {
  // Lưu dữ liệu form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmpassword: "",
  });

  const [ errors, setErrors ] = useState<any>({});

  const validateForm = () => {
    const newerrors: any = {};

  // Username
  if (!formData.username.trim()) {
    newerrors.username = "Username không được để trống";
  } else if (formData.username.length < 3) {
    newerrors.username = "Username phải có ít nhất 3 ký tự";
  }

  // Email
  if (!formData.email.trim()) {
    newerrors.email = "Email không được để trống";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newerrors.email = "Email không đúng định dạng";
  }

  // Phone number
  if (!formData.phonenumber.trim()) {
    newerrors.phonenumber = "Số điện thoại không được để trống";
  } else if (!/^\d{9,12}$/.test(formData.phonenumber)) {
  newerrors.phonenumber = "Số điện thoại phải gồm 9–12 chữ số";
}

  // Password
  if (!formData.password) {
    newerrors.password = "Mật khẩu không được để trống";
  } else if (formData.password.length < 6) {
    newerrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }
  
  // Confirm password
  if (formData.confirmpassword !== formData.password) {
    newerrors.confirmpassword = "Xác nhận mật khẩu không khớp";
  }

  setErrors(newerrors);
  return Object.keys(newerrors).length === 0;
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn reload trang

    const response = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Đăng ký thành công!");
      window.location.href = "/auth/login";
    } else {
      alert("Có lỗi xảy ra khi đăng ký!");
    }
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "auto" }}>
      <h1>Tạo tài khoản mới</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <input
          type="tel"
          inputMode="numeric"
          placeholder="Số điện thoại"
          value={formData.phonenumber}
          onChange={(e) =>
            setFormData({ ...formData, phonenumber: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={formData.confirmpassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmpassword: e.target.value })
          }
          required
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#0070f3",
            color: "white",
            border: "none",
          }}
        >
          Đăng ký
        </button>
      </form>

      <p>
        Đã có tài khoản? <a href="/auth/login">Đăng nhập</a>
      </p>
    </div>
  );
}
