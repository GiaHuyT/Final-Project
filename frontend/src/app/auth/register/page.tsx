"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newerrors: any = {};

    if (!formData.username.trim())
      newerrors.username = "Username không được để trống";
    else if (formData.username.length < 3)
      newerrors.username = "Username phải có ít nhất 3 ký tự";

    if (!formData.email.trim()) newerrors.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newerrors.email = "Email không đúng định dạng";

    if (!formData.phonenumber.trim())
      newerrors.phonenumber = "Số điện thoại không được để trống";
    else if (!/^\d{9,12}$/.test(formData.phonenumber))
      newerrors.phonenumber = "Số điện thoại phải gồm 9–12 chữ số";

    if (!formData.password) newerrors.password = "Mật khẩu không được để trống";
    else if (formData.password.length < 6)
      newerrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (formData.confirmpassword !== formData.password)
      newerrors.confirmpassword = "Xác nhận mật khẩu không khớp";

    setErrors(newerrors);
    return Object.keys(newerrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Đăng ký thất bại");
        return;
      }

      alert("Đăng ký thành công!");
      window.location.href = "/auth/login";
    } catch (error) {
      alert("Không kết nối được server backend");
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
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
        {errors.username && (
          <span style={{ color: "red" }}>{errors.username}</span>
        )}

        <input
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}

        <input
          placeholder="Số điện thoại"
          value={formData.phonenumber}
          onChange={(e) =>
            setFormData({ ...formData, phonenumber: e.target.value })
          }
        />
        {errors.phonenumber && (
          <span style={{ color: "red" }}>{errors.phonenumber}</span>
        )}

        <input
          type="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password}</span>
        )}

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={formData.confirmpassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmpassword: e.target.value })
          }
        />
        {errors.confirmpassword && (
          <span style={{ color: "red" }}>{errors.confirmpassword}</span>
        )}

        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}
