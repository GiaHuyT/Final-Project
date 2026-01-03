"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../hook/zod-schema/userschema";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="wrapper">
  <form className="form-box">
    <h2>Đăng ký</h2>

    <div className="field">
      <label>Username</label>
      <input />
      <p className="error">...</p>
    </div>

    <div className="field">
      <label>Email</label>
      <input />
    </div>

    <div className="field">
      <label>Số điện thoại</label>
      <input />
    </div>

    <div className="field">
      <label>Mật khẩu</label>
      <input type="password" />
    </div>

    <div className="field">
      <label>Xác nhận mật khẩu</label>
      <input type="password" />
    </div>

    <button>Đăng ký</button>

    <p>Đã có tài khoản? Đăng nhập</p>
  </form>
</div>

  );
}
