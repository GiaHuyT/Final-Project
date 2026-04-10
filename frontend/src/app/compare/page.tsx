"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2, Gauge, Maximize2, Fuel, ShieldCheck, Gamepad2, Zap, ArrowDown, ArrowUp } from "lucide-react";
import http from "@/lib/http";
import { cn } from "@/lib/utils";

export default function ComparePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id1 = searchParams.get('id1');
    const id2 = searchParams.get('id2');

    const [car1, setCar1] = useState<any>(null);
    const [car2, setCar2] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id1 || !id2) {
            setError("Vui lòng chọn 2 xe để so sánh.");
            setIsLoading(false);
            return;
        }

        const fetchCars = async () => {
            try {
                const [res1, res2] = await Promise.all([
                    http.get(`/products/${id1}`),
                    http.get(`/products/${id2}`)
                ]);
                setCar1(res1.data);
                setCar2(res2.data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu xe:", err);
                setError("Không thể dữ liệu xe. Vui lòng thử lại sau.");
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
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Đang phân tích dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (error || !car1 || !car2) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 pt-16">
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
    const renderComparisonNumber = (val1: number | undefined | null, val2: number | undefined | null, invertBest: boolean = false, format: string = "") => {
        const v1 = val1 || 0;
        const v2 = val2 || 0;
        
        let c1Color = "text-slate-900";
        let c2Color = "text-slate-900";
        let icon1 = null;
        let icon2 = null;

        if (v1 !== v2 && v1 !== 0 && v2 !== 0) {
            const isV1Better = invertBest ? v1 < v2 : v1 > v2;
            if (isV1Better) {
                c1Color = "text-emerald-600 font-black";
                icon1 = <ArrowUp className="w-4 h-4 text-emerald-500 inline -mt-1 ml-1 animate-bounce" />;
                c2Color = "text-red-500";
                icon2 = <ArrowDown className="w-4 h-4 text-red-500 inline -mt-1 ml-1" />;
            } else {
                c2Color = "text-emerald-600 font-black";
                icon2 = <ArrowUp className="w-4 h-4 text-emerald-500 inline -mt-1 ml-1 animate-bounce" />;
                c1Color = "text-red-500";
                icon1 = <ArrowDown className="w-4 h-4 text-red-500 inline -mt-1 ml-1" />;
            }
        }

        return {
            val1Node: <span className={c1Color}>{v1 === 0 ? "---" : `${v1.toLocaleString()} ${format}`}{icon1}</span>,
            val2Node: <span className={c2Color}>{v2 === 0 ? "---" : `${v2.toLocaleString()} ${format}`}{icon2}</span>,
        };
    };

    // Helper: Compare Boolean
    const renderComparisonBool = (val1: boolean, val2: boolean) => {
        let c1Color = val1 ? "text-emerald-600 font-black" : "text-slate-400";
        let c2Color = val2 ? "text-emerald-600 font-black" : "text-slate-400";
        
        return {
            val1Node: <span className={c1Color}>{val1 ? "Có" : "Không"}</span>,
            val2Node: <span className={c2Color}>{val2 ? "Có" : "Không"}</span>,
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

    const priceComp = renderComparisonNumber(car1.price, car2.price, true, "₫");
    const powerComp = renderComparisonNumber(parseInt(car1.maxPower) || 0, parseInt(car2.maxPower) || 0, false, "PS");
    const torqueComp = renderComparisonNumber(parseInt(car1.maxTorque) || 0, parseInt(car2.maxTorque) || 0, false, "Nm");
    const capacityComp = renderComparisonNumber(parseInt(car1.engineCapacity?.replace(/\D/g, '')) || 0, parseInt(car2.engineCapacity?.replace(/\D/g, '')) || 0, false, "cc");
    const lengthComp = renderComparisonNumber(car1.length, car2.length, false, "mm");
    const widthComp = renderComparisonNumber(car1.width, car2.width, false, "mm");
    const wheelbaseComp = renderComparisonNumber(car1.wheelbase, car2.wheelbase, false, "mm");
    const groundClearanceComp = renderComparisonNumber(car1.groundClearance, car2.groundClearance, false, "mm");
    const fuelConsumptionComp = renderComparisonNumber(car1.avgFuelConsumption, car2.avgFuelConsumption, true, "L/100km");
    const airbagsComp = renderComparisonNumber(car1.airbags, car2.airbags, false, "túi");

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
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
                    {/* Car 1 */}
                    <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-sm flex flex-col items-center text-center border-t-4 border-blue-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic -z-0 pointer-events-none group-hover:scale-110 transition-transform">1</div>
                        <div className="w-full aspect-video rounded-2xl bg-slate-100 overflow-hidden mb-6 z-10 shadow-inner">
                            <img src={car1.imageUrl} alt={car1.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 z-10">{car1.brand}</span>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 z-10">{car1.name}</h2>
                        <span className="text-slate-500 text-sm font-medium z-10 mb-4">{car1.year} • {car1.condition}</span>
                        <div className="text-xl md:text-3xl font-black text-slate-900 z-10">{car1.price?.toLocaleString()} <span className="text-sm font-bold text-slate-400">VND</span></div>
                    </div>

                    {/* Car 2 */}
                    <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-sm flex flex-col items-center text-center border-t-4 border-orange-500 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 p-4 opacity-10 font-black text-6xl italic -z-0 pointer-events-none group-hover:scale-110 transition-transform">2</div>
                        <div className="w-full aspect-video rounded-2xl bg-slate-100 overflow-hidden mb-6 z-10 shadow-inner">
                            <img src={car2.imageUrl} alt={car2.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 z-10">{car2.brand}</span>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 z-10">{car2.name}</h2>
                        <span className="text-slate-500 text-sm font-medium z-10 mb-4">{car2.year} • {car2.condition}</span>
                        <div className="text-xl md:text-3xl font-black text-slate-900 z-10">{car2.price?.toLocaleString()} <span className="text-sm font-bold text-slate-400">VND</span></div>
                    </div>
                </div>

                {/* Specs Comparison Table */}
                <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    
                    {/* Section 1: Động cơ & Hiệu suất */}
                    <div className="mb-10">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <Gauge className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Động cơ & Hiệu suất</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Công suất" c1={powerComp.val1Node} c2={powerComp.val2Node} bg />
                            <SpecRow title="Mô-men xoắn" c1={torqueComp.val1Node} c2={torqueComp.val2Node} />
                            <SpecRow title="Dung tích" c1={capacityComp.val1Node} c2={capacityComp.val2Node} bg />
                            <SpecRow title="Hộp số" c1={<span className="text-slate-700">{car1.transmission || "---"}</span>} c2={<span className="text-slate-700">{car2.transmission || "---"}</span>} />
                            <SpecRow title="Dẫn động" c1={<span className="text-slate-700">{car1.driveType || "---"}</span>} c2={<span className="text-slate-700">{car2.driveType || "---"}</span>} bg />
                        </div>
                    </div>

                    {/* Section 2: Kích thước */}
                    <div className="mb-10">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <Maximize2 className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Kích thước</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Chiều dài" c1={lengthComp.val1Node} c2={lengthComp.val2Node} bg />
                            <SpecRow title="Chiều rộng" c1={widthComp.val1Node} c2={widthComp.val2Node} />
                            <SpecRow title="Cơ sở" c1={wheelbaseComp.val1Node} c2={wheelbaseComp.val2Node} bg />
                            <SpecRow title="Gầm xe" c1={groundClearanceComp.val1Node} c2={groundClearanceComp.val2Node} />
                        </div>
                    </div>

                    {/* Section 3: Nhiên liệu */}
                    <div className="mb-10">
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <Fuel className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Nhiên liệu</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Loại nhiên liệu" c1={<span className="text-slate-700">{car1.fuelType || "---"}</span>} c2={<span className="text-slate-700">{car2.fuelType || "---"}</span>} bg />
                            <SpecRow title="Tiêu thụ trung bình" c1={fuelConsumptionComp.val1Node} c2={fuelConsumptionComp.val2Node} />
                        </div>
                    </div>

                    {/* Section 4: An toàn & Tiện nghi */}
                    <div>
                        <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <ShieldCheck className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">An toàn & Tiện nghi</h3>
                        </div>
                        <div className="flex flex-col">
                            <SpecRow title="Số túi khí" c1={airbagsComp.val1Node} c2={airbagsComp.val2Node} bg />
                            <SpecRow title="Cảm biến lùi" c1={renderComparisonBool(car1.rearSensor, car2.rearSensor).val1Node} c2={renderComparisonBool(car1.rearSensor, car2.rearSensor).val2Node} />
                            <SpecRow title="Camera 360" c1={renderComparisonBool(car1.camera360, car2.camera360).val1Node} c2={renderComparisonBool(car1.camera360, car2.camera360).val2Node} bg />
                            <SpecRow title="Ghế chỉnh điện" c1={renderComparisonBool(car1.electricSeats, car2.electricSeats).val1Node} c2={renderComparisonBool(car1.electricSeats, car2.electricSeats).val2Node} />
                            <SpecRow title="Apple CarPlay" c1={renderComparisonBool(car1.appleCarplay, car2.appleCarplay).val1Node} c2={renderComparisonBool(car1.appleCarplay, car2.appleCarplay).val2Node} bg />
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
