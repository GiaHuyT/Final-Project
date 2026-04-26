"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, ChevronRight, Loader2, Gauge, Maximize2, Fuel, ShieldCheck, 
    Zap, ArrowDown, ArrowUp, Plus, FileText, Settings, Car, Search 
} from "lucide-react";
import http from "@/lib/http";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id1 = searchParams.get('id1');
    const id2 = searchParams.get('id2');

    const [car1, setCar1] = useState<any>(null);
    const [car2, setCar2] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectingSlot, setSelectingSlot] = useState<1 | 2 | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [allCars, setAllCars] = useState<any[]>([]);

    useEffect(() => {
        if (isModalOpen && allCars.length === 0) {
            http.get('/products').then(res => setAllCars(res.data.products || res.data)).catch(console.error);
        }
    }, [isModalOpen]);

    const handleSelectCar = (carId: string) => {
        setIsModalOpen(false);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set(selectingSlot === 1 ? 'id1' : 'id2', carId);
        router.push(newUrl.pathname + newUrl.search);
        setSearchQuery("");
    };

    const filteredCars = allCars.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.brand?.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
        const fetchCars = async () => {
            try {
                if (id1) {
                    const res1 = await http.get(`/products/${id1}`);
                    setCar1(res1.data);
                } else {
                    setCar1(null);
                }

                if (id2) {
                    const res2 = await http.get(`/products/${id2}`);
                    setCar2(res2.data);
                } else {
                    setCar2(null);
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu xe:", err);
                setError("Không thể tải dữ liệu xe. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCars();
    }, [id1, id2]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin w-12 h-12 text-slate-900" />
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 pt-24">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <Zap className="w-10 h-10 text-red-300" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 font-headline mb-4">Lỗi So Sánh</h1>
                <p className="text-slate-500 mb-8 max-w-sm text-center">{error}</p>
                <button 
                    onClick={() => router.back()}
                    className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // Helper: Compare Number
    const renderNum = (val1: any, val2: any, invertBest = false, format = "") => {
        const v1 = parseFloat(val1) || 0;
        const v2 = parseFloat(val2) || 0;
        let c1Color = "text-slate-900"; let c2Color = "text-slate-900";
        let icon1 = null; let icon2 = null;

        if (car1 && car2 && v1 !== 0 && v2 !== 0 && v1 !== v2) {
            const isV1Better = invertBest ? v1 < v2 : v1 > v2;
            if (isV1Better) {
                c1Color = "text-emerald-600 font-black"; icon1 = <ArrowUp className="w-4 h-4 text-emerald-500 inline -mt-1 ml-1 animate-bounce" />;
                c2Color = "text-red-500 font-medium"; icon2 = <ArrowDown className="w-4 h-4 text-red-500 inline -mt-1 ml-1" />;
            } else {
                c2Color = "text-emerald-600 font-black"; icon2 = <ArrowUp className="w-4 h-4 text-emerald-500 inline -mt-1 ml-1 animate-bounce" />;
                c1Color = "text-red-500 font-medium"; icon1 = <ArrowDown className="w-4 h-4 text-red-500 inline -mt-1 ml-1" />;
            }
        }
        return {
            c1: car1 ? <span className={c1Color}>{v1 === 0 ? "---" : `${v1.toLocaleString('vi-VN')} ${format}`}{icon1}</span> : <span className="text-slate-300">---</span>,
            c2: car2 ? <span className={c2Color}>{v2 === 0 ? "---" : `${v2.toLocaleString('vi-VN')} ${format}`}{icon2}</span> : <span className="text-slate-300">---</span>,
        };
    };

    // Helper: Compare Boolean
    const renderBool = (val1: any, val2: any) => {
        let c1Color = val1 ? "text-emerald-600 font-black" : "text-slate-400 font-medium";
        let c2Color = val2 ? "text-emerald-600 font-black" : "text-slate-400 font-medium";
        return {
            c1: car1 ? <span className={c1Color}>{val1 ? "Có" : "Không"}</span> : <span className="text-slate-300">---</span>,
            c2: car2 ? <span className={c2Color}>{val2 ? "Có" : "Không"}</span> : <span className="text-slate-300">---</span>,
        };
    };

    // Helper: Compare Text
    const renderText = (val1: any, val2: any, format = "") => {
        return {
            c1: car1 ? <span className="text-slate-700 font-medium">{val1 ? `${val1} ${format}` : "---"}</span> : <span className="text-slate-300">---</span>,
            c2: car2 ? <span className="text-slate-700 font-medium">{val2 ? `${val2} ${format}` : "---"}</span> : <span className="text-slate-300">---</span>,
        };
    };

    const SpecRow = ({ title, c1, c2, icon: Icon, bg }: any) => (
        <div className={cn("grid grid-cols-3 items-center py-4 px-4 transition-colors hover:bg-white rounded-xl", bg ? "bg-slate-50/50" : "")}>
            <div className="text-right font-bold text-sm md:text-base">{c1}</div>
            <div className="flex flex-col items-center justify-center text-center">
                {Icon && <Icon className="w-4 h-4 mb-1 text-slate-400" />}
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{title}</span>
            </div>
            <div className="text-left font-bold text-sm md:text-base">{c2}</div>
        </div>
    );

    const renderCarCard = (car: any, index: number, colorClass: string, bgColor: string, textColor: string) => {
        if (!car) {
            return (
                <button 
                    onClick={() => { setSelectingSlot(index as 1 | 2); setIsModalOpen(true); }}
                    className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-4 md:p-8 flex flex-col items-center justify-center text-center min-h-[350px] hover:bg-slate-100 transition-colors group cursor-pointer relative overflow-hidden w-full"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-6xl italic -z-0 pointer-events-none group-hover:scale-110 transition-transform">{index}</div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-600 mb-2 z-10 text-lg">Thêm xe số {index}</h3>
                    <p className="text-sm text-slate-400 z-10 font-medium">Nhấn vào đây để chọn xe thêm vào so sánh</p>
                </button>
            );
        }
        return (
            <div className={cn("bg-white rounded-[2rem] p-4 md:p-8 shadow-sm flex flex-col items-center text-center border-t-4 relative overflow-hidden group", colorClass)}>
                <div className="absolute top-0 left-0 p-4 opacity-5 font-black text-6xl italic -z-0 pointer-events-none group-hover:scale-110 transition-transform">{index}</div>
                <div className="w-full aspect-video rounded-2xl bg-slate-100 overflow-hidden mb-6 z-10 shadow-inner">
                    <img src={car.imageUrl || "/images/static/car-porsche.png"} alt={car.name} className="w-full h-full object-cover" />
                </div>
                <span className={cn("text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 z-10", bgColor, textColor)}>{car.brand}</span>
                <Link href={`/products/${car.id}`}>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 z-10 hover:text-blue-600 transition-colors">{car.name}</h2>
                </Link>
                <span className="text-slate-500 text-sm font-medium z-10 mb-4">{car.year} • {car.condition}</span>
                <div className="text-xl md:text-3xl font-black text-slate-900 z-10">{car.price?.toLocaleString('vi-VN')} <span className="text-sm font-bold text-slate-400">VND</span></div>
                
                {/* Remove car btn */}
                <Link 
                    href={`/compare?${index === 1 ? (id2 ? `id1=&id2=${id2}` : '') : (id1 ? `id1=${id1}&id2=` : '')}`}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </Link>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-body">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                
                {/* Header Breadcrumb */}
                <div className="flex items-center gap-2 mb-8 text-sm font-bold text-slate-500">
                    <button onClick={() => router.back()} className="hover:text-slate-900 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-slate-900 uppercase tracking-widest">So sánh chi tiết</span>
                </div>

                {/* Hero Cars */}
                <div className="grid grid-cols-2 gap-4 md:gap-8 mb-12">
                    {renderCarCard(car1, 1, "border-blue-500", "bg-blue-50", "text-blue-600")}
                    {renderCarCard(car2, 2, "border-orange-500", "bg-orange-50", "text-orange-600")}
                </div>

                {/* Specs Comparison Table */}
                <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 overflow-hidden">
                    
                    {/* Section 1: Tình trạng & Thông tin pháp lý */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <FileText className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Tình trạng & Lịch sử</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Tình trạng xe" bg {...renderText(car1?.condition, car2?.condition)} />
                            <SpecRow title="Số ODO (Đã đi)" {...renderNum(car1?.mileage, car2?.mileage, true, "km")} />
                            <SpecRow title="Biển số" bg {...renderText(car1?.licensePlate, car2?.licensePlate)} />
                            <SpecRow title="Chi tiết tình trạng" {...renderText(car1?.conditionDetail, car2?.conditionDetail)} />
                        </div>
                    </div>

                    {/* Section 2: Động cơ & Hiệu suất */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <Gauge className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Động cơ & Vận hành</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Dung tích động cơ" bg {...renderNum(car1?.engineCapacity?.replace(/\D/g, ''), car2?.engineCapacity?.replace(/\D/g, ''), false, "L")} />
                            <SpecRow title="Công suất tối đa" {...renderNum(car1?.maxPower, car2?.maxPower, false, "PS")} />
                            <SpecRow title="Mô-men xoắn" bg {...renderNum(car1?.maxTorque, car2?.maxTorque, false, "Nm")} />
                            <SpecRow title="Hộp số" {...renderText(car1?.transmission, car2?.transmission)} />
                            <SpecRow title="Hệ dẫn động" bg {...renderText(car1?.driveType, car2?.driveType)} />
                        </div>
                    </div>

                    {/* Section 3: Kích thước & Trọng lượng */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <Maximize2 className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Kích thước & Trọng lượng</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Kiểu dáng" bg {...renderText(car1?.bodyType, car2?.bodyType)} />
                            <SpecRow title="Dài x Rộng x Cao (mm)" {...renderText(car1 ? `${car1.length} x ${car1.width} x ${car1.height}` : null, car2 ? `${car2.length} x ${car2.width} x ${car2.height}` : null)} />
                            <SpecRow title="Chiều dài cơ sở" bg {...renderNum(car1?.wheelbase, car2?.wheelbase, false, "mm")} />
                            <SpecRow title="Khoảng sáng gầm" {...renderNum(car1?.groundClearance, car2?.groundClearance, true, "mm")} />
                            <SpecRow title="Trọng lượng không tải" bg {...renderNum(car1?.curbWeight, car2?.curbWeight, true, "kg")} />
                        </div>
                    </div>

                    {/* Section 4: Nhiên liệu */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <Fuel className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Nhiên liệu</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Loại nhiên liệu" bg {...renderText(car1?.fuelType, car2?.fuelType)} />
                            <SpecRow title="Dung tích bình xăng" {...renderNum(car1?.fuelTankCapacity, car2?.fuelTankCapacity, false, "L")} />
                            <SpecRow title="Tiêu thụ nhiên liệu (ĐH)" bg {...renderNum(car1?.avgFuelConsumption, car2?.avgFuelConsumption, true, "L/100km")} />
                        </div>
                    </div>

                    {/* Section 5: An toàn & Tiện nghi */}
                    <div>
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <ShieldCheck className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">An toàn & Tiện nghi</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Số túi khí" bg {...renderNum(car1?.airbags, car2?.airbags, false, "túi")} />
                            <SpecRow title="Phanh ABS" {...renderBool(car1?.abs, car2?.abs)} />
                            <SpecRow title="Cân bằng điện tử ESP" bg {...renderBool(car1?.esp, car2?.esp)} />
                            <SpecRow title="Hỗ trợ phanh khẩn BA" {...renderBool(car1?.ba, car2?.ba)} />
                            <SpecRow title="Cảm biến lùi" bg {...renderBool(car1?.rearSensor, car2?.rearSensor)} />
                            <SpecRow title="Camera Hệ thống (360)" {...renderBool(car1?.camera360, car2?.camera360)} />
                            <SpecRow title="Điều hòa tự động" bg {...renderBool(car1?.autoConditioning, car2?.autoConditioning)} />
                            <SpecRow title="Màn hình giải trí" {...renderBool(car1?.infotainment, car2?.infotainment)} />
                            <SpecRow title="Apple CarPlay / Android" bg {...renderBool(car1?.appleCarplay, car2?.appleCarplay)} />
                            <SpecRow title="Ghế chỉnh điện" {...renderBool(car1?.electricSeats, car2?.electricSeats)} />
                        </div>
                    </div>
                    
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col pt-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-headline mb-2 text-slate-900">Chọn xe đối chiếu</DialogTitle>
                    </DialogHeader>
                    
                    <div className="relative mt-2 mb-4 shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên mẫu xe, hãng sản xuất..." 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm border-2 border-slate-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="overflow-y-auto pr-2 space-y-3 flex-1 min-h-[300px]">
                        {filteredCars.length > 0 ? filteredCars.map(car => (
                            <div 
                                key={car.id} 
                                onClick={() => handleSelectCar(car.id)}
                                className="flex items-center gap-5 p-4 bg-white border-2 border-slate-100 hover:border-blue-300 hover:shadow-lg rounded-2xl cursor-pointer transition-all"
                            >
                                <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                                    <img src={car.imageUrl || "/images/static/car-porsche.png"} alt={car.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 text-lg truncate mb-1">{car.name}</h4>
                                    <p className="text-xs font-bold text-slate-500 truncate uppercase tracking-widest">{car.year} • {car.condition}</p>
                                </div>
                                <div className="text-right shrink-0 bg-blue-50 px-4 py-2 rounded-xl">
                                    <p className="font-black text-blue-600 text-base whitespace-nowrap">{car.price?.toLocaleString('vi-VN')} ₫</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <span className="font-medium text-lg">Không tìm thấy mẫu xe nào phù hợp</span>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin w-12 h-12 text-slate-900" />
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Đang tải cấu hình so sánh...</span>
                </div>
            </div>
        }>
            <CompareContent />
        </Suspense>
    );
}
