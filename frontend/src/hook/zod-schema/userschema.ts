import { z } from "zod";

export const registerSchema = z
.object({
    username: z.string().min(1, "Username không được để trống"),

    email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),

    phonenumber: z
    .string()
    .min(9, "Số điện thoại phải từ 9–12 chữ số")
    .max(12, "Số điện thoại phải từ 9–12 chữ số")
    .regex(/^\d+$/, "Số điện thoại chỉ được chứa số"),

    password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải chứa chữ hoa, chữ thường và số"
    ),

    confirmpassword: z.string(),
})
.refine((data) => data.password === data.confirmpassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmpassword"],
});
