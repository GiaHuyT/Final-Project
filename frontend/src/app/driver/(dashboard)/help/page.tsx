"use client";

import React, { useState } from 'react';
import { 
    Search, 
    MessageCircleQuestion, 
    MessageSquare,
    ChevronRight,
    CarFront,
    AlertTriangle,
    BadgeDollarSign,
    ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const CATEGORIES = [
    { id: 'suggest', label: 'Gợi ý' },
    { id: 'trip', label: 'Thông tin Cuốc xe' },
    { id: 'incident', label: 'Xử lý Sự cố' },
    { id: 'payment', label: 'Thanh toán' },
    { id: 'insurance', label: 'Bảo hiểm & Rủi ro' },
];

const FAQS = [
    // Gợi ý (suggest)
    {
        id: 'faq-s1',
        category: 'suggest',
        title: '[Gợi ý] Làm sao để nhận được nhiều cuốc xe Lái xe hộ hơn?',
        content: 'Để tăng cơ hội nhận cuốc xe, bạn nên: \n1. Đăng ký nhận cuốc ở các khu vực trung tâm, đặc biệt là gần các nhà hàng, quán nhậu vào khung giờ tối (19:00 - 23:00).\n2. Giữ thái độ phục vụ chuyên nghiệp để nhận đánh giá 5 sao từ khách hàng.'
    },
    {
        id: 'faq-s2',
        category: 'suggest',
        title: '[Gợi ý] Trang phục chuẩn khi đi nhận Lái xe hộ là gì?',
        content: 'Trang phục chuẩn dành cho đối tác Lái xe hộ của AutoBid bao gồm:\n- Áo thun có cổ hoặc sơ mi lịch sự (khuyến khích mặc đồng phục AutoBid).\n- Quần dài (không mặc quần đùi, quần rách).\n- Giày kín mũi (không mang dép lê).\n- Luôn mang theo găng tay trắng khi cầm lái xe của khách hàng để thể hiện sự chuyên nghiệp.'
    },

    // Thông tin cuốc xe (trip)
    {
        id: 'faq-t1',
        category: 'trip',
        title: '[Lái xe hộ] Khách yêu cầu thay đổi lộ trình đi quá xa so với app?',
        content: 'Nếu khách hàng yêu cầu thay đổi lộ trình vượt quá 3km so với đích đến ban đầu trên app, bạn cần yêu cầu khách hàng sử dụng tính năng "Thay đổi điểm đến" trên ứng dụng của họ để hệ thống tính lại phí. Tuyệt đối không tự ý chạy ngoài lộ trình để tránh rủi ro về bảo hiểm.'
    },
    {
        id: 'faq-t2',
        category: 'trip',
        title: '[Lái xe hộ] Tôi có thể từ chối chở thêm người quá tải không?',
        content: 'CÓ. Đối tác có quyền và NGHĨA VỤ từ chối chở quá số người quy định của xe (ví dụ xe 5 chỗ chỉ chở tối đa 4 hành khách + 1 tài xế). Nếu khách hàng ép buộc, bạn có thể Hủy chuyến với lý do "Khách hàng yêu cầu chở quá tải" mà không bị trừ điểm hiệu suất.'
    },
    {
        id: 'faq-t3',
        category: 'trip',
        title: '[Lái xe hộ] Khách hàng mang theo thú cưng lên xe của họ?',
        content: 'Vì đây là tài sản (xe) của chính khách hàng, họ hoàn toàn có quyền mang thú cưng lên xe. Tuy nhiên, nếu thú cưng gây ảnh hưởng đến sự an toàn khi lái xe (ví dụ: nhảy lên vô lăng, cắn/giành ghế lái), bạn có quyền yêu cầu khách kiểm soát thú cưng hoặc kết thúc chuyến đi sớm để đảm bảo an toàn.'
    },

    // Xử lý Sự cố (incident)
    {
        id: 'faq-i1',
        category: 'incident',
        title: '[Lái xe hộ] Khách hàng giao xe bị xước/móp từ trước, tôi phải làm gì?',
        content: 'Trước khi nhận bàn giao chìa khóa và bắt đầu chuyến đi, bạn BẮT BUỘC phải đi một vòng quanh xe cùng khách hàng để kiểm tra hiện trạng. Nếu phát hiện vết xước/móp, hãy dùng tính năng "Chụp ảnh hiện trạng" trên ứng dụng để lưu lại bằng chứng. Tuyệt đối không nhận lái nếu khách hàng từ chối đồng kiểm.'
    },
    {
        id: 'faq-i2',
        category: 'incident',
        title: '[Lái xe hộ] Xử lý thế nào nếu khách say xỉn nôn mửa ra xe?',
        content: 'Trường hợp khách hàng không tự chủ được hành vi và nôn mửa ra xe của chính họ: \n1. Lập tức tìm vị trí an toàn để tấp xe vào lề. \n2. Báo cáo sự cố lên tổng đài thông qua nút "Hỗ trợ khẩn cấp" trên ứng dụng. \n3. AutoBid không chịu trách nhiệm vệ sinh xe cho khách hàng trong trường hợp này, tài xế có thể kết thúc cuốc xe sớm nếu tình trạng khách quá tệ.'
    },
    {
        id: 'faq-i3',
        category: 'incident',
        title: '[Lái xe hộ] Xe của khách bị hỏng giữa đường (bể lốp, hết bình)?',
        content: 'Nếu xe của khách gặp sự cố kỹ thuật giữa đường:\n1. Tấp xe vào lề an toàn và bật đèn cảnh báo (Hazard).\n2. Thông báo ngay cho khách hàng (chủ xe) về tình trạng xe.\n3. Nếu chủ xe yêu cầu, bạn có thể hỗ trợ gọi xe cứu hộ hoặc thợ sửa xe. Cuốc xe có thể được kết thúc sớm dựa trên quãng đường đã đi thực tế.'
    },
    {
        id: 'faq-i4',
        category: 'incident',
        title: '[Lái xe hộ] Khách hàng say xỉn và có lời lẽ xúc phạm/đe dọa?',
        content: 'An toàn của đối tác là ưu tiên hàng đầu. Nếu khách hàng có hành vi bạo lực, đe dọa hoặc xúc phạm:\n1. Giữ bình tĩnh, tấp xe vào nơi đông người/an toàn.\n2. Chấm dứt chuyến đi ngay lập tức và rời khỏi xe.\n3. Bấm nút "SOS" trên ứng dụng để kết nối ngay với công an hoặc tổng đài AutoBid để được can thiệp.'
    },

    // Thanh toán (payment)
    {
        id: 'faq-p1',
        category: 'payment',
        title: '[Lái xe hộ] Tôi có bị trừ tiền nếu cuốc xe bị hủy do khách chưa chuẩn bị xe?',
        content: 'Nếu bạn đã đến điểm đón quá 10 phút nhưng khách hàng vẫn chưa giao xe, bạn có quyền hủy cuốc xe với lý do "Khách hàng vắng mặt/Chưa sẵn sàng". Bạn sẽ không bị trừ điểm tỷ lệ nhận đơn và sẽ được nhận 30.000đ phí hỗ trợ di chuyển từ hệ thống.'
    },
    {
        id: 'faq-p2',
        category: 'payment',
        title: '[Lái xe hộ] Khách từ chối trả phí cầu đường/bến bãi?',
        content: 'Theo quy định của AutoBid, phí cầu đường, trạm thu phí, phí đỗ xe phát sinh trong quá trình diễn ra cuốc xe Lái xe hộ sẽ do KHÁCH HÀNG chi trả. Nếu khách từ chối, bạn vui lòng thanh toán trước, giữ lại biên lai và gửi yêu cầu "Hỗ trợ hoàn phí" lên ứng dụng sau khi chuyến đi kết thúc.'
    },
    {
        id: 'faq-p3',
        category: 'payment',
        title: '[Lái xe hộ] Khách hàng chuyển khoản nhầm số tiền cuốc xe?',
        content: 'Đối với đơn hàng thanh toán tiền mặt/chuyển khoản trực tiếp cho tài xế, nếu khách chuyển nhầm dư tiền, bạn vui lòng chuyển trả lại ngay. Nếu khách chuyển thiếu và đã rời đi, vui lòng liên hệ tổng đài CSKH trong vòng 24h để AutoBid hỗ trợ liên hệ khách hàng truy thu.'
    },

    // Bảo hiểm & Rủi ro (insurance)
    {
        id: 'faq-in1',
        category: 'insurance',
        title: '[Lái xe hộ] Nếu xảy ra va chạm giao thông khi tôi đang lái xe của khách?',
        content: 'Nếu xảy ra va chạm: \n1. Giữ nguyên hiện trường, tuyệt đối không di dời xe. \n2. Gọi ngay số Hotline khẩn cấp của AutoBid: 1900 1234. \n3. Liên hệ Cảnh sát Giao thông (113). \nLưu ý: Mọi chuyến đi "Lái xe hộ" đều được AutoBid mua gói Bảo hiểm Trách nhiệm Dân sự Đặc biệt. Vui lòng tuân thủ đúng quy trình để được bảo hiểm chi trả.'
    },
    {
        id: 'faq-in2',
        category: 'insurance',
        title: '[Lái xe hộ] Xe của khách bị phạt nguội do lỗi của tôi thì sao?',
        content: 'Trong trường hợp có thông báo phạt nguội gửi về cho chủ xe (khách hàng), AutoBid sẽ đối chiếu thời gian vi phạm với thời gian chuyến đi thực tế của bạn. Nếu xác định vi phạm xảy ra trong lúc bạn đang cầm lái do lỗi chủ quan (vượt đèn đỏ, quá tốc độ), bạn sẽ phải chịu 100% chi phí nộp phạt.'
    },
    {
        id: 'faq-in3',
        category: 'insurance',
        title: '[Lái xe hộ] Khách hàng báo mất đồ đạc trong xe sau chuyến đi?',
        content: 'AutoBid không chịu trách nhiệm đối với các tài sản cá nhân có giá trị cao để trong xe của khách hàng. Tuy nhiên, để bảo vệ bản thân, đối tác TUYỆT ĐỐI không lục lọi hộc để đồ, cốp xe của khách. Nếu bị khách khiếu nại, AutoBid sẽ phối hợp với cơ quan công an để điều tra làm rõ dựa trên GPS và lời khai các bên.'
    }
];

export default function HelpCenterPage() {
    const [activeCategory, setActiveCategory] = useState('suggest');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFAQs = FAQS.filter(faq => {
        const matchesSearch = faq.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              faq.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'suggest' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Tiêu đề & Tìm kiếm */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Trung tâm Trợ giúp</h1>
                        <p className="text-slate-500 mt-1">Hỗ trợ và giải đáp thắc mắc cho Đối tác Lái xe hộ</p>
                    </div>
                </div>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-700 border-none shadow-md text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <MessageCircleQuestion className="w-48 h-48" />
                    </div>
                    <CardContent className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Xin chào, chúng tôi có thể giúp gì cho bạn?</h2>
                        <div className="relative w-full max-w-2xl mt-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <Input 
                                placeholder="Nhập từ khóa tìm kiếm (VD: Hủy chuyến, Tai nạn, Thanh toán...)" 
                                className="pl-14 h-16 rounded-2xl bg-white text-slate-800 text-lg shadow-lg border-none placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Cảnh báo quan trọng */}
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start md:items-center justify-between gap-4">
                    <div className="flex items-start md:items-center gap-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="font-bold text-rose-900">Cảnh báo lừa đảo: Cuốc xe Lái xe hộ ảo</p>
                            <p className="text-rose-700 text-sm mt-1">Cảnh giác với các thủ đoạn yêu cầu chuyển tiền trước để nhận chuyến. AutoBid không bao giờ yêu cầu điều này.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100 shrink-0 hidden md:flex">
                        Tìm hiểu thêm
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Danh mục thanh bên */}
                    <div className="md:col-span-1 space-y-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Danh mục hỗ trợ</h3>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between",
                                    activeCategory === cat.id 
                                        ? "bg-emerald-600 text-white shadow-md" 
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                {cat.label}
                                {activeCategory === cat.id && <ChevronRight className="w-4 h-4 opacity-70" />}
                            </button>
                        ))}
                    </div>

                    {/* Nội dung câu hỏi thường gặp */}
                    <div className="md:col-span-3">
                        <Card className="border-none shadow-sm h-full">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">Câu hỏi thường gặp</h2>
                                {filteredFAQs.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {filteredFAQs.map(faq => (
                                            <AccordionItem value={faq.id} key={faq.id} className="border border-slate-100 rounded-xl px-2 overflow-hidden data-[state=open]:bg-slate-50/50 data-[state=open]:border-emerald-100 transition-colors">
                                                <AccordionTrigger className="text-[15px] font-bold text-slate-700 hover:no-underline hover:text-emerald-600 py-4 px-2 text-left leading-relaxed">
                                                    {faq.title}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-600 text-[15px] leading-relaxed pb-4 px-2 whitespace-pre-line">
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

                {/* Liên hệ hỗ trợ */}
                <Card className="bg-slate-800 border-none shadow-xl text-white mt-12">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center shrink-0">
                                <MessageSquare className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Cần hỗ trợ thêm?</h3>
                                <p className="text-slate-400">Đội ngũ CSKH của AutoBid luôn sẵn sàng hỗ trợ bạn 24/7.</p>
                            </div>
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 rounded-xl text-base w-full md:w-auto shadow-lg shadow-emerald-900/20">
                            Chat với CSKH ngay
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
