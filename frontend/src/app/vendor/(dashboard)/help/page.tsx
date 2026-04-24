"use client";

import React, { useState } from 'react';
import { 
    Search, 
    MessageCircleQuestion, 
    MessageSquare,
    ChevronRight,
    AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
    { id: 'tips', label: 'Gợi ý & Hướng dẫn' },
    { id: 'inventory', label: 'Quản lý sản phẩm' },
    { id: 'orders', label: 'Đơn hàng & Giao dịch' },
    { id: 'auctions', label: 'Đấu giá trực tuyến' },
    { id: 'payments', label: 'Thanh toán & Doanh thu' },
];

const FAQS = [
    // Gợi ý & Hướng dẫn (tips)
    {
        id: 'faq-t1',
        category: 'tips',
        title: '[Gợi ý] Làm sao để thu hút nhiều khách hàng xem xe hơn?',
        content: 'Để gian hàng của bạn nổi bật, hãy:\n1. Cập nhật đầy đủ hình ảnh xe ở nhiều góc độ (Nội thất, Ngoại thất, Động cơ) với chất lượng rõ nét.\n2. Viết mô tả chi tiết, rõ ràng về tình trạng xe, số km đã đi, lịch sử bảo dưỡng.\n3. Đặt mức giá cạnh tranh so với mặt bằng chung trên thị trường.'
    },
    {
        id: 'faq-t2',
        category: 'tips',
        title: '[Gợi ý] Hướng dẫn chụp ảnh xe chuẩn AutoBid',
        content: 'Một bộ ảnh xe chuẩn nên bao gồm ít nhất 6 tấm:\n- Chụp góc 3/4 từ phía trước và phía sau xe.\n- Chụp trực diện đầu xe và đuôi xe.\n- Chụp toàn cảnh khoang lái từ ghế sau.\n- Chụp rõ bảng đồng hồ taplo hiển thị số ODO thực tế.'
    },

    // Quản lý sản phẩm (inventory)
    {
        id: 'faq-i1',
        category: 'inventory',
        title: '[Sản phẩm] Tôi có thể chỉnh sửa thông tin xe sau khi đã đăng không?',
        content: 'Có, bạn hoàn toàn có thể vào mục "Quản lý xe", chọn xe cần sửa và bấm vào biểu tượng cây bút để cập nhật thông tin. Tuy nhiên, nếu xe đang nằm trong một phiên đấu giá đang diễn ra, bạn sẽ không thể chỉnh sửa giá khởi điểm và một số thông số kỹ thuật để đảm bảo tính công bằng.'
    },
    {
        id: 'faq-i2',
        category: 'inventory',
        title: '[Sản phẩm] Phân biệt xe bán và xe cho thuê như thế nào?',
        content: 'Khi thêm xe mới, hệ thống sẽ tự động phân loại dựa trên mục đích bạn chọn. Các xe đăng vào "Quản lý xe" sẽ được niêm yết bán đứt hoặc đưa vào đấu giá. Còn các xe thêm vào "Quản lý xe cho thuê" sẽ được thiết lập giá theo ngày/giờ và có lịch trình riêng.'
    },

    // Đơn hàng & Giao dịch (orders)
    {
        id: 'faq-o1',
        category: 'orders',
        title: '[Đơn hàng] Quy trình xử lý khi có khách hàng đặt mua xe?',
        content: 'Khi có khách đặt mua, hệ thống sẽ báo Notification và đơn hàng vào trạng thái "Chờ xử lý".\n1. Bạn cần liên hệ ngay với khách hàng để xác nhận.\n2. Cập nhật trạng thái thành "Đang xử lý/Giao hàng".\n3. Hỗ trợ khách làm thủ tục sang tên (nếu có).\n4. Chuyển trạng thái thành "Hoàn thành" khi giao dịch thành công.'
    },
    {
        id: 'faq-o2',
        category: 'orders',
        title: '[Đơn hàng] Xử lý thế nào nếu khách hàng muốn hủy đơn?',
        content: 'Khách hàng có quyền hủy đơn trước khi bạn chuyển trạng thái sang "Đang giao hàng". Trong trường hợp khách đổi ý sau đó, hai bên cần thương lượng. Bạn có thể chủ động chuyển trạng thái đơn hàng thành "Đã hủy" trong hệ thống nếu giao dịch không thành.'
    },

    // Đấu giá trực tuyến (auctions)
    {
        id: 'faq-a1',
        category: 'auctions',
        title: '[Đấu giá] Đặt Giá khởi điểm và Bước giá như thế nào là hợp lý?',
        content: 'Giá khởi điểm nên đặt thấp hơn giá kỳ vọng khoảng 10-15% để kích thích người dùng tham gia trả giá. Bước giá nên đặt từ 1,000,000đ đến 5,000,000đ tùy thuộc vào phân khúc xe để đảm bảo các lượt trả giá diễn ra nhịp nhàng và liên tục.'
    },
    {
        id: 'faq-a2',
        category: 'auctions',
        title: '[Đấu giá] Chuyện gì xảy ra nếu hết thời gian mà không ai trả giá?',
        content: 'Nếu phiên đấu giá kết thúc mà không có bất kỳ lượt trả giá nào (hoặc mức trả giá cao nhất vẫn chưa đạt mức giá sàn/bán ngay), phiên đấu giá sẽ được hệ thống tự động đánh dấu là "Thất bại". Bạn có thể điều chỉnh lại giá khởi điểm và tạo một phiên đấu giá mới.'
    },

    // Thanh toán & Doanh thu (payments)
    {
        id: 'faq-p1',
        category: 'payments',
        title: '[Thanh toán] Mức phí nền tảng cho mỗi giao dịch thành công là bao nhiêu?',
        content: 'AutoBid hiện đang áp dụng mức phí 2% trên tổng giá trị giao dịch thành công (bao gồm cả bán xe và thắng đấu giá). Đối với dịch vụ cho thuê xe, mức phí nền tảng là 10% trên tổng doanh thu mỗi cuốc thuê.'
    },
    {
        id: 'faq-p2',
        category: 'payments',
        title: '[Doanh thu] Tiền bán xe sẽ được chuyển cho tôi khi nào?',
        content: 'Sau khi đơn hàng được đánh dấu "Hoàn thành" và khách hàng xác nhận đã nhận xe đầy đủ thủ tục pháp lý, hệ thống sẽ ghi nhận doanh thu. Số tiền này sẽ được chuyển vào tài khoản ngân hàng bạn đã đăng ký vào thứ 3 và thứ 6 hàng tuần.'
    }
];

export default function VendorHelpCenterPage() {
    const [activeCategory, setActiveCategory] = useState('tips');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    const handleOpenChat = async () => {
        try {
            setIsLoadingChat(true);
            const res = await http.get('/users/admin/support');
            if (res.data && res.data.id) {
                window.dispatchEvent(new CustomEvent('open-chat', { detail: { vendorId: res.data.id } }));
            }
        } catch (error) {
            console.error('Failed to get support admin:', error);
            toast.error("Không thể kết nối với CSKH lúc này.");
        } finally {
            setIsLoadingChat(false);
        }
    };

    const filteredFAQs = FAQS.filter(faq => {
        const matchesSearch = faq.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              faq.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'tips' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Trung tâm Trợ giúp</h1>
                        <p className="text-slate-500 font-medium mt-1">Hỗ trợ và giải đáp thắc mắc cho Nhà cung cấp</p>
                    </div>
                </div>

                <Card className="bg-gradient-to-br from-blue-600 to-indigo-800 border-none shadow-lg text-white overflow-hidden relative rounded-3xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <MessageCircleQuestion className="w-48 h-48" />
                    </div>
                    <CardContent className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Xin chào, chúng tôi có thể giúp gì cho bạn?</h2>
                        <div className="relative w-full max-w-2xl mt-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
                            <Input 
                                placeholder="Nhập từ khóa tìm kiếm (VD: Đấu giá, Đơn hàng, Doanh thu...)" 
                                className="pl-14 h-16 rounded-2xl bg-white text-slate-800 text-lg font-medium shadow-2xl border-none placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-blue-500/30"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Important Alert */}
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start md:items-center justify-between gap-4">
                    <div className="flex items-start md:items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-900">Thông báo quan trọng về chính sách đăng kiểm</p>
                            <p className="text-amber-700 text-sm mt-1">Tất cả các dòng xe đăng bán phải đảm bảo có giấy tờ đăng kiểm hợp lệ. Hành vi bán xe giấy tờ giả sẽ bị khóa tài khoản vĩnh viễn.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-amber-200 text-amber-700 font-bold hover:bg-amber-100 shrink-0 hidden md:flex rounded-xl">
                        Tìm hiểu thêm
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Categories */}
                    <div className="md:col-span-1 space-y-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-3">Danh mục hỗ trợ</h3>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 flex items-center justify-between border-2 border-transparent",
                                    activeCategory === cat.id 
                                        ? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                )}
                            >
                                {cat.label}
                                {activeCategory === cat.id && <ChevronRight className="w-4 h-4 opacity-70" />}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Content */}
                    <div className="md:col-span-3">
                        <Card className="border-gray-100 shadow-sm h-full rounded-[2rem]">
                            <CardContent className="p-8">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 mb-6 flex items-center gap-2">
                                    <MessageCircleQuestion className="w-6 h-6 text-blue-500" />
                                    Câu hỏi thường gặp
                                </h2>
                                {filteredFAQs.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {filteredFAQs.map(faq => (
                                            <AccordionItem value={faq.id} key={faq.id} className="border border-slate-100 rounded-2xl px-2 overflow-hidden data-[state=open]:bg-blue-50/30 data-[state=open]:border-blue-100 transition-colors">
                                                <AccordionTrigger className="text-[15px] font-bold text-slate-700 hover:no-underline hover:text-blue-600 py-5 px-3 text-left leading-relaxed">
                                                    {faq.title}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-600 font-medium text-[14px] leading-relaxed pb-5 px-3 whitespace-pre-line">
                                                    {faq.content}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="py-16 text-center">
                                        <MessageCircleQuestion className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy kết quả</h3>
                                        <p className="text-slate-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contact Support */}
                <Card className="bg-slate-900 border-none shadow-xl text-white mt-12 rounded-[2rem]">
                    <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center shrink-0">
                                <MessageSquare className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight mb-1">Cần hỗ trợ thêm?</h3>
                                <p className="text-slate-400 font-medium">Đội ngũ CSKH của chúng tôi luôn sẵn sàng hỗ trợ nhà cung cấp 24/7.</p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleOpenChat}
                            disabled={isLoadingChat}
                            className="bg-blue-600 hover:bg-blue-700 font-bold text-white h-14 px-10 rounded-2xl text-base w-full md:w-auto shadow-lg shadow-blue-900/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                            {isLoadingChat ? 'Đang kết nối...' : 'Chat với nhân viên hỗ trợ'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
