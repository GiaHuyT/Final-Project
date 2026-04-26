import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send, ShieldCheck, CreditCard, Clock } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8 font-body">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 xl:gap-16 mb-16">
                    {/* Brand & About */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="flex items-center gap-3">
                                <img src="/images/logo.png" alt="AutoBid Logo" className="w-64 md:w-72 h-auto object-contain rounded-xl shadow-sm border border-slate-50" />
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-headline">AutoBid</h3>
                                    <p className="text-xs font-bold text-primary tracking-widest uppercase mt-0.5">Logistics & E-commerce</p>
                                </div>
                            </div>
                        </Link>
                        <p className="text-slate-500 leading-relaxed text-sm pr-4">
                            Nền tảng cung cấp giải pháp vận tải, thuê xe chuyên nghiệp và sàn thương mại điện tử hàng đầu. Chúng tôi cam kết mang lại trải nghiệm minh bạch, an toàn và tối ưu nhất cho doanh nghiệp của bạn.
                        </p>
                        <div className="space-y-3 pt-2 text-sm text-slate-600">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <span>Tầng 15, Tòa nhà Tech Tower, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>Hotline: 1900 1234 (8:00 - 22:00)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>Email: support@autobid.vn</span>
                            </div>
                        </div>
                    </div>

                    {/* Dịch vụ */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-tight">Dịch Vụ</h4>
                        <ul className="space-y-3.5 text-sm font-medium">
                            <li><Link href="/logistics" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Dịch vụ Logistics</Link></li>
                            <li><Link href="/car-rental" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Thuê xe tự lái</Link></li>
                            <li><Link href="/driver-rental" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Thuê tài xế</Link></li>
                            <li><Link href="/auctions" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Sàn đấu giá</Link></li>
                            <li><Link href="/categories" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Mua bán xe</Link></li>
                            <li><Link href="/maintenance" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Bảo dưỡng định kỳ</Link></li>
                        </ul>
                    </div>

                    {/* Hỗ trợ khách hàng */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-tight">Hỗ Trợ</h4>
                        <ul className="space-y-3.5 text-sm font-medium">
                            <li><Link href="/faq" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Câu hỏi thường gặp</Link></li>
                            <li><Link href="/contact" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Liên hệ hỗ trợ</Link></li>
                            <li><Link href="/terms" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Điều khoản sử dụng</Link></li>
                            <li><Link href="/privacy" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Chính sách bảo mật</Link></li>
                            <li><Link href="/quy-che-hoat-dong" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Quy chế hoạt động</Link></li>
                            <li><Link href="/dispute" className="text-slate-500 hover:text-primary hover:translate-x-1 transition-transform inline-block">Giải quyết tranh chấp</Link></li>
                        </ul>
                    </div>

                    {/* Nhận bản tin */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-tight">Đăng Ký Nhận Tin</h4>
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            Nhận thông tin cập nhật mới nhất về các phiên đấu giá và ưu đãi logistics.
                        </p>
                        <form className="relative mb-6">
                            <input 
                                type="email" 
                                placeholder="Email của bạn..." 
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                            <button 
                                type="button" 
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg px-3 flex items-center justify-center transition-colors shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                        <div className="flex gap-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-slate-100 hover:border-primary hover:scale-110"><Facebook className="h-4 w-4" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-slate-100 hover:border-primary hover:scale-110"><Twitter className="h-4 w-4" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-slate-100 hover:border-primary hover:scale-110"><Instagram className="h-4 w-4" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-slate-100 hover:border-primary hover:scale-110"><Linkedin className="h-4 w-4" /></a>
                        </div>
                    </div>
                </div>

                {/* Features & Certs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-slate-100 mb-8">
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">An Toàn Tuyệt Đối</p>
                            <p className="text-xs text-slate-500 font-medium">Bảo vệ dữ liệu & giao dịch</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Thanh Toán Đa Dạng</p>
                            <p className="text-xs text-slate-500 font-medium">Hỗ trợ nhiều phương thức</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Hỗ Trợ 24/7</p>
                            <p className="text-xs text-slate-500 font-medium">Luôn sẵn sàng giải đáp</p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 text-sm font-medium">
                    <p className="text-slate-500">
                        © {new Date().getFullYear()} AutoBid Logistics & E-commerce. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-slate-500">
                        <img src="https://images.dmca.com/Badges/dmca-badge-w100-5x1-08.png?ID=0" alt="DMCA" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
