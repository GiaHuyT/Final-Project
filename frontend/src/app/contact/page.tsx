"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquareText } from "lucide-react";
import Link from "next/link";
import http from "@/lib/http";
import toast from "react-hot-toast";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    otherSubject: "",
    message: "",
    agreeToContact: false,
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên của bạn.";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập địa chỉ email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
    
    if (formData.subject === "other" && !formData.otherSubject.trim()) {
      newErrors.otherSubject = "Vui lòng ghi rõ vấn đề của bạn.";
    }
    
    if (!formData.message.trim()) newErrors.message = "Vui lòng nhập nội dung chi tiết.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!formData.agreeToContact || !formData.agreeToTerms) {
      toast.error("Vui lòng xác nhận cung cấp thông tin và đồng ý với các quy định để tiếp tục.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await http.post('/contacts', formData);
      setSubmitted(true);
      toast.success("Gửi yêu cầu thành công!");
    } catch (error) {
      console.error(error);
      toast.error('Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === "checkbox" ? e.target.checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-16">
      {/* Hero Header */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="AutoBid Executive Showroom"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="/images/static/autobid_contact_showroom.png"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-4">
            LIÊN HỆ BAN QUẢN TRỊ
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Ban quản trị nền tảng AutoBid luôn sẵn sàng hỗ trợ bạn. Vui lòng để lại thông tin hoặc liên hệ trực tiếp qua số hotline để được giải đáp thắc mắc về hệ thống.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-surface-container-low min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16">

          {/* Contact Info Sidebar */}
          <div className="lg:w-1/3">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 mb-8">
              Thông tin liên hệ
            </h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-100 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Địa chỉ trụ sở</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    AutoBid Tower, Gian hàng 99, Khu Chế Xuất Công Nghệ Cao Quận 9<br />
                    Thành phố Thủ Đức, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-100 text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Đường dây nóng</h3>
                  <a href="tel:19009999" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold block mb-1">
                    Hotline CSKH: 1900 9999
                  </a>
                  <a href="tel:0909999999" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold block">
                    Cứu hộ 24/7: 090 999 9999
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-100 text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Email hỗ trợ</h3>
                  <a href="mailto:support@autobid.com" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold">
                    support@autobid.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
              <h3 className="font-bold text-xl mb-2 font-headline relative z-10">Thời gian làm việc</h3>
              <ul className="space-y-2 text-sm text-slate-400 relative z-10">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Thứ 2 - Thứ 6:</span>
                  <span className="font-bold text-white">08:00 - 18:00</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Thứ 7:</span>
                  <span className="font-bold text-white">08:00 - 12:00</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span>Chủ nhật, Lễ:</span>
                  <span className="font-bold text-primary">Nghỉ</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 relative">
              {/* Form Title & Decorative */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600 rounded-t-3xl"></div>

              {submitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="font-headline text-3xl font-bold text-slate-900 mb-4">Gửi thành công!</h3>
                  <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                    Cảm ơn bạn đã liên hệ. Bộ phận hỗ trợ của AutoBid sẽ phản hồi lại thông qua Email hoặc Số điện thoại trong vòng 24 giờ tới.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm tracking-widest hover:brightness-110 transition-all font-headline"
                  >
                    GỬI THÊM YÊU CẦU
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">
                        Gửi yêu cầu hỗ trợ
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Điền thông tin vào biểu mẫu, bộ phận hỗ trợ của nền tảng sẽ liên hệ lại ngay.</p>
                      <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-blue-800 text-sm leading-relaxed">
                          <span className="font-bold">Lưu ý:</span> Biểu mẫu này dùng để liên hệ Ban quản trị (hỗ trợ kỹ thuật, khiếu nại, tư vấn tính năng nền tảng). Nếu bạn cần liên hệ mua xe, vui lòng sử dụng tính năng nhắn tin tại trang của thẻ xe hoặc nhà cung cấp.
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block shrink-0">
                      <MessageSquareText className="w-10 h-10 text-slate-200" />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Họ và Tên *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500 ring-red-500/20 text-red-900 focus:border-red-500 placeholder-red-300' : 'border-slate-200 text-slate-900 focus:ring-primary/20 focus:border-primary placeholder-slate-400'}`}
                          placeholder="Nhập họ tên của bạn..."
                        />
                        {errors.name && <p className="text-red-500 text-xs font-semibold mt-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Số điện thoại *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 ring-red-500/20 text-red-900 focus:border-red-500 placeholder-red-300' : 'border-slate-200 text-slate-900 focus:ring-primary/20 focus:border-primary placeholder-slate-400'}`}
                          placeholder="Ví dụ: 0912 345 678"
                        />
                        {errors.phone && <p className="text-red-500 text-xs font-semibold mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 ring-red-500/20 text-red-900 focus:border-red-500 placeholder-red-300' : 'border-slate-200 text-slate-900 focus:ring-primary/20 focus:border-primary placeholder-slate-400'}`}
                          placeholder="Nhập địa chỉ email..."
                        />
                        {errors.email && <p className="text-red-500 text-xs font-semibold mt-1">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Chủ đề</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 appearance-none"
                        >
                          <option value="">-- Chọn vấn đề cần hỗ trợ --</option>
                          <option value="vendor_support">Hỗ trợ đăng ký làm nhà cung cấp</option>
                          <option value="account">Hỗ trợ tài khoản / Đăng nhập</option>
                          <option value="maintenance">Hỗ trợ sửa chữa / bảo dưỡng</option>
                          <option value="report">Báo cáo vi phạm / Gian lận</option>
                          <option value="feedback">Góp ý chất lượng nền tảng</option>
                          <option value="other">Vấn đề khác</option>
                        </select>
                      </div>
                    </div>

                    {formData.subject === "other" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Vấn đề cụ thể là gì? *</label>
                        <input
                          type="text"
                          name="otherSubject"
                          value={formData.otherSubject}
                          onChange={handleChange}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.otherSubject ? 'border-red-500 ring-red-500/20 text-red-900 focus:border-red-500 placeholder-red-300' : 'border-slate-200 text-slate-900 focus:ring-primary/20 focus:border-primary placeholder-slate-400'}`}
                          placeholder="Vui lòng ghi rõ vấn đề của bạn..."
                        />
                        {errors.otherSubject && <p className="text-red-500 text-xs font-semibold mt-1">{errors.otherSubject}</p>}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nội dung chi tiết *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${errors.message ? 'border-red-500 ring-red-500/20 text-red-900 focus:border-red-500 placeholder-red-300' : 'border-slate-200 text-slate-900 focus:ring-primary/20 focus:border-primary placeholder-slate-400'}`}
                        placeholder="Quý khách vui lòng cung cấp dòng xe hoặc thắc mắc cụ thể..."
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-xs font-semibold mt-1">{errors.message}</p>}
                    </div>

                    <div className="pt-2 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            name="agreeToContact"
                            checked={formData.agreeToContact}
                            onChange={handleChange}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:border-primary checked:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
                          />
                          <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed user-select-none">
                          Tôi xác nhận cung cấp thông tin cá nhân để Ban quản trị AutoBid có thể liên hệ lại.*
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:border-primary checked:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
                          />
                          <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed user-select-none">
                          Tôi đã đọc và đồng ý với <Link href="/privacy" className="text-primary font-bold hover:underline">Chính sách bảo mật</Link> và <Link href="/terms" className="text-primary font-bold hover:underline">Điều khoản dịch vụ</Link> của AutoBid.*
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-full font-headline font-bold text-sm tracking-widest hover:bg-primary active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ĐANG XỬ LÝ...
                        </>
                      ) : (
                        <>GỬI YÊU CẦU CHO BAN QUẢN TRỊ</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] w-full bg-slate-200 relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15674.37279144865!2d106.79361665620953!3d10.84239855513904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527150a00df83%3A0xe54d85223ab40ac!2zS2h1IEPDtG5nIG5naOG7hyBjYW8sIFTEg25nIE5oxqFuIFBow7ogQSwgUXXhuq1uIDksIEjhu5MgQ2jDrSBNaW5oLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="AutoBid HQ Map"
          className="grayscale opacity-90 contrast-125"
        ></iframe>
        <div className="absolute inset-0 pointer-events-none border-t border-slate-200"></div>
      </section>

      <footer className="w-full py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="font-headline text-2xl font-bold mb-4">AutoBid</div>
          <p className="text-slate-500 max-w-md mx-auto text-sm mb-6">Nền tảng đấu giá và trao đổi dịch vụ chuyên nghiệp hàng đầu tại khu vực.</p>
          <p className="font-body text-[10px] uppercase tracking-widest font-medium text-slate-400">© 2024 AutoBid Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
