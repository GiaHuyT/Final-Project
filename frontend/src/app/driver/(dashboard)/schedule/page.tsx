"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, X } from 'lucide-react';

let errorTimeout: NodeJS.Timeout | null = null;

const STANDARD_TIME_SLOTS = [
    // Ca 3 tiếng
    { startTime: '00:00', endTime: '03:00', type: 'Chở khách' },
    { startTime: '03:05', endTime: '06:05', type: 'Chở khách' },
    { startTime: '06:00', endTime: '09:00', type: 'Chở khách' },
    { startTime: '09:00', endTime: '12:00', type: 'Đưa đón' },
    { startTime: '12:00', endTime: '15:00', type: 'Chở khách' },
    { startTime: '15:00', endTime: '18:00', type: 'Chở khách' },
    { startTime: '18:00', endTime: '21:00', type: 'Đưa đón' },
    { startTime: '21:00', endTime: '00:00', type: 'Chở khách' },

    // Ca 4-5 tiếng
    { startTime: '00:00', endTime: '05:00', type: 'Đưa đón' },
    { startTime: '03:00', endTime: '08:00', type: 'Chở khách' },
    { startTime: '05:30', endTime: '10:30', type: 'Chở khách' },
    { startTime: '08:00', endTime: '12:00', type: 'Đưa đón' },
    { startTime: '10:30', endTime: '14:30', type: 'Chở khách' },
    { startTime: '13:00', endTime: '17:00', type: 'Chở khách' },
    { startTime: '16:00', endTime: '21:00', type: 'Đưa đón' },

    // Ca 8 tiếng (Hành chính)
    { startTime: '06:00', endTime: '14:00', type: 'Đưa đón' },
    { startTime: '08:00', endTime: '16:00', type: 'Chở khách' },
    { startTime: '14:00', endTime: '22:00', type: 'Chở khách' },

    // Ca 12 tiếng (Full day / Night)
    { startTime: '06:00', endTime: '18:00', type: 'Đưa đón' },
    { startTime: '12:00', endTime: '00:00', type: 'Chở khách' },
    { startTime: '18:00', endTime: '06:00', type: 'Chở khách' },
];

export default function SchedulePage() {
    const [activeTab, setActiveTab] = useState('search');
    const [shifts, setShifts] = useState<any[]>([]);
    const [registeredDestinations, setRegisteredDestinations] = useState<any[]>([]);
    
    // Trạng thái tương tác
    const [registeredShiftIds, setRegisteredShiftIds] = useState<number[]>([]);
    
    // Trạng thái bộ lọc
    const [filterTime, setFilterTime] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterLocation, setFilterLocation] = useState('all');
    
    // Trạng thái lỗi xác thực
    const [validationError, setValidationError] = useState<string | null>(null);
    
    // Trạng thái bối cảnh ngày
    const [selectedDateObj, setSelectedDateObj] = useState(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d.getTime();
    });

    const dateContainerRef = React.useRef<HTMLDivElement>(null);

    const generateExtendedDates = () => {
        const generatedDates = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Sinh ra dải ngày từ mùng 1 tháng hiện tại đến hết tháng sau (khoảng 60 ngày)
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const isPast = currentDate < today;
            const isToday = currentDate.getTime() === today.getTime();

            const dayStr = currentDate.getDate().toString().padStart(2, '0');
            const monthStr = `Th${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

            generatedDates.push({
                day: dayStr,
                month: monthStr,
                isPast,
                isToday,
                dateObj: currentDate
            });
        }
        return generatedDates;
    };

    const monthDates = React.useMemo(() => generateExtendedDates(), []);

    const scrollDates = (direction: 'left' | 'right') => {
        if (dateContainerRef.current) {
            const scrollAmount = 200;
            dateContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Scroll to active date on initial load
    React.useEffect(() => {
        if (dateContainerRef.current) {
            // Give it a tiny delay to ensure rendering is complete
            setTimeout(() => {
                const activeElement = dateContainerRef.current?.querySelector('.bg-emerald-500');
                if (activeElement) {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }, 100);
        }
    }, []);

    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const toggleRegistration = (id: number) => {
        if (registeredShiftIds.includes(id)) {
            const newIds = registeredShiftIds.filter(shiftId => shiftId !== id);
            setRegisteredShiftIds(newIds);
            localStorage.setItem('registered_shifts', JSON.stringify(newIds));
            const newRegShifts = shifts.filter(s => newIds.includes(s.id));
            localStorage.setItem('registered_shift_details', JSON.stringify(newRegShifts));
            return;
        }

        const targetShift = shifts.find(s => s.id === id);
        if (!targetShift) return;

        const regShifts = shifts.filter(s => registeredShiftIds.includes(s.id));

        // Validation helpers
        const getProvince = (address: string) => {
            if (!address) return '';
            const parts = address.split(',');
            return parts[parts.length - 1].trim().toLowerCase();
        };

        const coversMinute = (start: number, end: number, min: number) => {
            if (start < end) return min >= start && min < end;
            return min >= start || min < end;
        };

        const checkOverlap = (s1: any, s2: any) => {
            const start1 = timeToMinutes(s1.startTime);
            const end1 = timeToMinutes(s1.endTime);
            const start2 = timeToMinutes(s2.startTime);
            const end2 = timeToMinutes(s2.endTime);
            
            // Allow exact back-to-back shifts (e.g. 06:00-14:00 and 14:00-22:00)
            if (end1 === start2 || end2 === start1) return false;
            
            for (let m = 0; m < 1440; m++) {
                if (coversMinute(start1, end1, m) && coversMinute(start2, end2, m)) return true;
            }
            return false;
        };

        // Rule 2: Same time slot check
        const sameTimeShifts = regShifts.filter(s => s.startTime === targetShift.startTime && s.endTime === targetShift.endTime);
        
        const showError = (msg: string) => {
            setValidationError(null); // Reset to re-trigger animation
            setTimeout(() => {
                setValidationError(msg);
                if (errorTimeout) clearTimeout(errorTimeout);
                errorTimeout = setTimeout(() => setValidationError(null), 5000);
            }, 10);
        };

        if (sameTimeShifts.length >= 2) {
            showError('Bạn chỉ được đăng ký tối đa 2 khu vực trong cùng 1 khung giờ.');
            return;
        }

        if (sameTimeShifts.length === 1) {
            const currentProvince = getProvince(sameTimeShifts[0].fullAddress);
            const targetProvince = getProvince(targetShift.fullAddress);
            if (currentProvince && targetProvince && currentProvince !== targetProvince) {
                showError(`Bạn chỉ được đăng ký thêm khu vực trong cùng tỉnh/thành phố (${sameTimeShifts[0].fullAddress.split(',').pop()?.trim()}).`);
                return;
            }
        }

        // Rule 1: Overlap check with DIFFERENT time slots
        const differentTimeShifts = regShifts.filter(s => !(s.startTime === targetShift.startTime && s.endTime === targetShift.endTime));
        for (const reg of differentTimeShifts) {
            if (checkOverlap(targetShift, reg)) {
                showError(`Khung giờ này bị chồng lấp với ca bạn đã đăng ký: ${reg.startTime} - ${reg.endTime} (${reg.location})`);
                return;
            }
        }

        setValidationError(null);
        const newIds = [...registeredShiftIds, id];
        setRegisteredShiftIds(newIds);
        localStorage.setItem('registered_shifts', JSON.stringify(newIds));
        const newRegShifts = shifts.filter(s => newIds.includes(s.id));
        localStorage.setItem('registered_shift_details', JSON.stringify(newRegShifts));
    };


    React.useEffect(() => {
        const savedDest = localStorage.getItem('driver_destinations');
        let dests: any[] = [];
        if (savedDest) {
            try {
                dests = JSON.parse(savedDest);
                setRegisteredDestinations(dests);
            } catch (e) {}
        }

        const savedShifts = localStorage.getItem('registered_shifts');
        if (savedShifts) {
            try {
                setRegisteredShiftIds(JSON.parse(savedShifts));
            } catch (e) {}
        }

        let dynamicShifts: any[] = [];
        let idCounter = 1;

        if (dests.length > 0) {
            STANDARD_TIME_SLOTS.forEach(slot => {
                dests.forEach((dest: any) => {
                    const fullAddress = dest.address;
                    const parts = fullAddress.split(',');
                    const shortLocation = parts.length > 1 ? `${parts[0].trim()}, ${parts[1].trim()}` : fullAddress;
                    
                    dynamicShifts.push({
                        id: idCounter++,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        location: shortLocation,
                        fullAddress: dest.address,
                        type: slot.type
                    });
                });
            });
        } else {
            STANDARD_TIME_SLOTS.forEach(slot => {
                dynamicShifts.push({
                    id: idCounter++,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    location: 'Chưa đăng ký khu vực',
                    fullAddress: '',
                    type: slot.type
                });
            });
        }
        setShifts(dynamicShifts);
    }, []);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch làm việc</h1>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600">
                    <Info className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 pb-3 text-[15px] font-bold transition-colors relative text-center ${activeTab === 'search' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Tìm lịch hoạt động
                    {activeTab === 'search' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('registered')}
                    className={`flex-1 pb-3 text-[15px] font-bold transition-colors relative text-center ${activeTab === 'registered' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Lịch đã đăng ký
                    {activeTab === 'registered' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>
                    )}
                </button>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-slate-100 shadow-sm relative mt-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 shrink-0" onClick={() => scrollDates('left')}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div ref={dateContainerRef} className="flex gap-2 md:gap-4 overflow-x-auto px-2 scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {monthDates.map((date, idx) => {
                        const isActive = date.dateObj.getTime() === selectedDateObj;
                        return (
                            <div
                                key={idx}
                                onClick={() => {
                                    if (!date.isPast) {
                                        setSelectedDateObj(date.dateObj.getTime());
                                    }
                                }}
                                className={`flex flex-col items-center justify-center min-w-[50px] md:min-w-[60px] h-[60px] rounded-xl transition-all ${isActive
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                        : date.isPast
                                            ? 'opacity-50 text-slate-400 cursor-not-allowed bg-slate-50/50'
                                            : 'hover:bg-emerald-50 text-slate-600 cursor-pointer'
                                    }`}
                            >
                                <span className={`text-[11px] font-medium ${isActive ? 'text-emerald-50' : date.isToday ? 'text-emerald-600' : ''}`}>
                                    {date.month}
                                </span>
                                <span className={`text-[18px] font-bold ${date.isToday && !isActive ? 'text-emerald-600' : ''}`}>
                                    {date.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 shrink-0" onClick={() => scrollDates('right')}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <Select value={filterTime} onValueChange={setFilterTime}>
                    <SelectTrigger className="w-[150px] shrink-0 bg-white border-slate-200 text-slate-600 h-9 text-[13px] rounded-lg">
                        <SelectValue placeholder="Tất cả khung giờ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả khung giờ</SelectItem>
                        {Array.from(new Set(shifts.map(s => `${s.startTime} - ${s.endTime}`))).sort().map((ts, idx) => (
                            <SelectItem key={idx} value={ts}>{ts}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px] shrink-0 bg-white border-slate-200 text-slate-600 h-9 text-[13px] rounded-lg">
                        <SelectValue placeholder="Tất cả loại ca" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại ca</SelectItem>
                        <SelectItem value="3">Ca 3 tiếng</SelectItem>
                        <SelectItem value="5">Ca 5 tiếng</SelectItem>
                        <SelectItem value="8">Ca 8 tiếng</SelectItem>
                        <SelectItem value="12">Ca 12 tiếng</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-[160px] shrink-0 bg-white border-slate-200 text-slate-600 h-9 text-[13px] rounded-lg">
                        <SelectValue placeholder="Tất cả khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả khu vực</SelectItem>
                        {Array.from(new Set(shifts.map(s => s.location))).map((loc, idx) => (
                            <SelectItem key={idx} value={loc}>{loc}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Floating Top-Center Error Toast */}
            {validationError && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-lg">
                    <style>{`
                        @keyframes shrinkBar {
                            from { width: 100%; }
                            to { width: 0%; }
                        }
                    `}</style>
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 relative overflow-hidden">
                        <AlertCircle className="h-5 w-5 shrink-0 z-10" />
                        <span className="text-[14px] font-medium leading-relaxed flex-1 z-10">{validationError}</span>
                        <button onClick={() => setValidationError(null)} className="ml-2 shrink-0 text-rose-400 hover:text-rose-600 transition-colors z-10">
                            <X className="h-5 w-5" />
                        </button>
                        
                        {/* Progress Bar */}
                        <div 
                            className="absolute bottom-0 left-0 h-1 bg-rose-500" 
                            style={{ animation: 'shrinkBar 5s linear forwards' }} 
                        />
                    </div>
                </div>
            )}

            {/* Shift List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...shifts]
                    .filter(shift => activeTab === 'search' || registeredShiftIds.includes(shift.id))
                    .filter(shift => {
                        if (filterType === 'all') return true;
                        
                        const [startH, startM] = shift.startTime.split(':').map(Number);
                        const [endH, endM] = shift.endTime.split(':').map(Number);
                        let duration = endH - startH + (endM - startM) / 60;
                        if (duration <= 0) duration += 24;
                        
                        if (filterType === '3') return Math.round(duration) === 3;
                        if (filterType === '5') return Math.round(duration) === 5;
                        if (filterType === '8') return Math.round(duration) === 8;
                        if (filterType === '12') return Math.round(duration) === 12;
                        return true;
                    })
                    .filter(shift => filterLocation === 'all' || shift.location === filterLocation)
                    .filter(shift => filterTime === 'all' || `${shift.startTime} - ${shift.endTime}` === filterTime)
                    .sort((a, b) => {
                        if (a.startTime === b.startTime) {
                            return a.endTime.localeCompare(b.endTime);
                        }
                        return a.startTime.localeCompare(b.startTime);
                    })
                    .map((shift) => {
                        const isRegistered = registeredShiftIds.includes(shift.id);
                        return (
                            <div key={shift.id} className={`bg-white rounded-[20px] border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col transition-colors ${isRegistered ? 'border-emerald-500 shadow-emerald-100/50' : 'border-slate-100 hover:border-emerald-100'}`}>
                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Time */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-[20px] font-bold ${isRegistered ? 'text-emerald-700' : 'text-slate-900'}`}>{shift.startTime}</span>
                                        <div className="h-px flex-1 mx-4 bg-slate-200"></div>
                                        <span className={`text-[20px] font-bold ${isRegistered ? 'text-emerald-700' : 'text-slate-900'}`}>{shift.endTime}</span>
                                    </div>

                                    {/* Location Box */}
                                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span className="text-[14px] font-bold text-slate-700 truncate" title={shift.location}>{shift.location}</span>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex justify-center mt-auto pt-2">
                                        {activeTab === 'search' ? (
                                            <Button 
                                                variant="outline" 
                                                disabled={isRegistered}
                                                onClick={() => toggleRegistration(shift.id)}
                                                className={`rounded-xl h-10 px-10 text-[14px] font-bold transition-all w-full ${isRegistered ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-100' : 'bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                                                {isRegistered ? 'Đã đăng ký' : 'Đăng ký'}
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                onClick={() => toggleRegistration(shift.id)}
                                                className="rounded-xl h-10 px-10 text-[14px] font-bold transition-all w-full bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                                                Hủy ca làm
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                
                {activeTab === 'registered' && registeredShiftIds.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-slate-500 font-medium">Bạn chưa đăng ký ca làm việc nào.</p>
                        <Button variant="link" onClick={() => setActiveTab('search')} className="text-emerald-600 mt-2">
                            Xem lịch hoạt động để đăng ký
                        </Button>
                    </div>
                )}
                
            </div>

        </div>
    );
}
