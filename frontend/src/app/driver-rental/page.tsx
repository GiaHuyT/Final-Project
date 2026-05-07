"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Search, Loader2, CheckCircle2, UserCircle2, Phone, Star, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import http from "@/lib/http";
import { initSocket, disconnectSocket } from "@/lib/socket";
import Cookies from "js-cookie";

import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Tự động nhập bản đồ để tránh các sự cố SSR với Tờ rơi
const RideMap = dynamic(() => import("./components/RideMap"), { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Đang tải bản đồ...</div> });


export default function RideHailingPage() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  
  // Trạng thái tìm kiếm
  const [pickupResults, setPickupResults] = useState<any[]>([]);
  const [dropoffResults, setDropoffResults] = useState<any[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  
  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);

  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  
  const [status, setStatus] = useState<"IDLE" | "SEARCHING" | "ACCEPTED" | "ARRIVED_AT_PICKUP" | "CAR_RECEIVED" | "IN_PROGRESS" | "ARRIVED_AT_DROPOFF" | "COMPLETED">("IDLE");
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);

  // Thông tin người dùng và trạng thái thông tin xe
  const [user, setUser] = useState<any>(null);
  const [carBrand, setCarBrand] = useState("");
  const [carType, setCarType] = useState("Xe 4-9 chỗ");
  const [transmission, setTransmission] = useState("Số tự động");
  const [licensePlate, setLicensePlate] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  
  // Xem lại trạng thái
  const [rating, setRating] = useState(5);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewed, setIsReviewed] = useState(false);

  // Trạng thái báo cáo
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportOtherText, setReportOtherText] = useState("");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const calculateRequiredLicense = (type: string, trans: string) => {
    if (type === "Xe khách >30 chỗ") return "E";
    if (type === "Xe khách 16-30 chỗ") return "D";
    if (type === "Xe tải nặng (>3.5 tấn)") return "C";
    if (type === "Xe 4-9 chỗ" || type === "Xe tải nhẹ (<3.5 tấn)") {
      return trans === "Số sàn" ? "B2" : "B1";
    }
    return "B1";
  };

  // Tìm kiếm bằng API Nominatim
  const searchLocation = async (query: string, type: 'pickup' | 'dropoff') => {
    if (query.length < 3) {
      type === 'pickup' ? setPickupResults([]) : setDropoffResults([]);
      return;
    }
    type === 'pickup' ? setIsSearchingPickup(true) : setIsSearchingDropoff(true);
    try {
      const res = await axios.get(`/api/places?q=${encodeURIComponent(query)}`);
      type === 'pickup' ? setPickupResults(res.data) : setDropoffResults(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      type === 'pickup' ? setIsSearchingPickup(false) : setIsSearchingDropoff(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => searchLocation(pickup, 'pickup'), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [pickup]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => searchLocation(dropoff, 'dropoff'), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [dropoff]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setPickupResults([]);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target as Node)) {
        setDropoffResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (type: 'pickup' | 'dropoff', loc: any) => {
    if (type === 'pickup') {
      setPickup(loc.display_name);
      setPickupCoords([parseFloat(loc.lat), parseFloat(loc.lon)]);
      setPickupResults([]);
    } else {
      setDropoff(loc.display_name);
      setDropoffCoords([parseFloat(loc.lat), parseFloat(loc.lon)]);
      setDropoffResults([]);
    }
  };

  // Get Route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      if (pickupCoords && dropoffCoords) {
        try {
          const res = await axios.get(`https:// router.project-osrm.org/route/v1/drive/${pickupCoords[1]},${pickupCoords[0]};${dropoffCoords[1]},${dropoffCoords[0]}?overview=full&geometries=geojson`);
          if (res.data.routes && res.data.routes.length > 0) {
            const route = res.data.routes[0];
            
            // OSRM trả về tọa độ ở định dạng [lon, lat], Tờ rơi cần [lat, lon]
            const geometry: [number, number][] = route.geometry.coordinates.map((c: any[]) => [c[1], c[0]]);
            setRouteGeometry(geometry);
            
            // Chuyển đổi khoảng cách từ mét sang km
            const distKm = Math.max(1, Math.round(route.distance / 100) / 10);
            setDistance(distKm);
            
            // Giá cao cấp: 20.000 cơ sở + 15.000/km
            setPrice(20000 + distKm * 15000);
          }
        } catch (error) {
          console.error("OSRM Routing Error:", error);
        }
      } else {
        setDistance(null);
        setPrice(null);
        setRouteGeometry(null);
      }
    };
    
    fetchRoute();
  }, [pickupCoords, dropoffCoords]);

  // Ổ cắm thiết lập & Khởi tạo người dùng
  useEffect(() => {
    const token = Cookies.get("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (!contactPhone && userData.phonenumber) {
        setContactPhone(userData.phonenumber);
      }
      
      const newSocket = initSocket('rides', token, userData.id);
      
      newSocket.on('ride-accepted', (booking: any) => {
        setStatus("ACCEPTED");
        setCurrentBooking(booking);
        toast.success("Đã tìm thấy tài xế!");
      });

      newSocket.on('ride-status-updated', (booking: any) => {
        setStatus(booking.status as any);
        setCurrentBooking(booking);
        if (booking.status === 'COMPLETED') {
          toast.success("Chuyến đi đã hoàn thành!");
        }
      });

      newSocket.on('ride-cancelled', (data: any) => {
        toast.error("Tài xế đã hủy chuyến đi của bạn.");
        setStatus("IDLE");
        setCurrentBooking(null);
        setPickup("");
        setDropoff("");
        setPickupCoords(null);
        setDropoffCoords(null);
      });

      setSocket(newSocket);

      // Tìm nạp các lượt đặt chỗ đang hoạt động trên núi
      http.get('/driver-booking/customer')
        .then(res => {
          if (res.data && res.data.length > 0) {
            // Tìm đặt chỗ hoạt động gần đây nhất
            const active = res.data.find((b: any) => ['PENDING', 'SEARCHING', 'ACCEPTED', 'ARRIVED_AT_PICKUP', 'CAR_RECEIVED', 'IN_PROGRESS', 'ARRIVED_AT_DROPOFF'].includes(b.status));
            if (active) {
              setCurrentBooking(active);
              setStatus(active.status === 'PENDING' ? 'SEARCHING' : active.status);
              
              // Khôi phục dữ liệu biểu mẫu từ đăng ký đang hoạt động
              if (active.pickupAddress && !pickup) setPickup(active.pickupAddress);
              if (active.dropoffAddress && !dropoff) setDropoff(active.dropoffAddress);
              if (active.pickupLat) setPickupCoords([active.pickupLat, active.pickupLng]);
              if (active.dropoffLat) setDropoffCoords([active.dropoffLat, active.dropoffLng]);
            }
          }
        })
        .catch(err => console.error("Error fetching active bookings:", err));
    }

    return () => {
      disconnectSocket('rides');
    };
  }, []);

  const handleBookRide = () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Vui lòng chọn điểm đón và điểm đến.");
      return;
    }
    if (!carBrand || !carType || !licensePlate || !contactPhone) {
      toast.error("Vui lòng điền đầy đủ Thông tin xe & Liên hệ.");
      return;
    }
    if (!socket) {
      toast.error("Vui lòng đăng nhập để đặt xe.");
      return;
    }

    setStatus("SEARCHING");
    
    // Gửi yêu cầu đi xe
    socket.emit('request-ride', {
      pickupAddress: pickup,
      pickupLat: pickupCoords[0],
      pickupLng: pickupCoords[1],
      dropoffAddress: dropoff,
      dropoffLat: dropoffCoords[0],
      dropoffLng: dropoffCoords[1],
      distanceKm: distance,
      totalPrice: price,
      carBrand,
      carType,
      transmission,
      licensePlate,
      contactPhone,
      requiredLicense: calculateRequiredLicense(carType, transmission)
    }, (response: any) => {
      if (response && response.error) {
        toast.error(response.error);
        setStatus("IDLE");
      } else {
        setCurrentBooking(response);
      }
    });
  };

  const handleCancel = () => {
    if (socket && currentBooking) {
      setIsCancelling(true);
      socket.emit('cancel-ride', { bookingId: currentBooking.id }, (response: any) => {
        setIsCancelling(false);
        setCancelDialogOpen(false);
        if (response && response.error) {
          toast.error(response.error);
        } else {
          toast.success("Đã hủy cuốc xe.");
          setStatus("IDLE");
          setCurrentBooking(null);
          setPickup("");
          setDropoff("");
          setPickupCoords(null);
          setDropoffCoords(null);
        }
      });
    } else {
      setStatus("IDLE");
      setCurrentBooking(null);
      setPickup("");
      setDropoff("");
      setPickupCoords(null);
      setDropoffCoords(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-[144px] pb-12 px-4 md:px-8 font-body">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">
        
        {/* Bảng điều khiển bên trái: Mẫu đặt chỗ */}
        <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden relative z-10">
          
          <div className="p-6 bg-slate-900 text-white shrink-0">
            <h1 className="font-headline text-2xl font-black tracking-tight mb-1">Thuê Tài Xế VIP</h1>
            <p className="text-slate-400 text-sm">Trải nghiệm di chuyển đẳng cấp 5 sao.</p>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {status === "IDLE" && (
              <div className="space-y-6">
                <div className="space-y-4 relative">
                  <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-slate-200 z-0"></div>
                  
                  <div className="relative z-50" ref={pickupRef}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Điểm đón</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-blue-500" />
                      </div>
                      <input 
                        type="text" 
                        value={pickup}
                        onChange={(e) => {
                          setPickup(e.target.value);
                          if (pickupCoords) setPickupCoords(null);
                        }}
                        placeholder="Nhập địa chỉ đón..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      {isSearchingPickup && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 animate-spin" />}
                    </div>
                    {/* Kết quả tìm kiếm */}
                    {pickupResults.length > 0 && !pickupCoords && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 shadow-xl rounded-xl max-h-60 overflow-y-auto">
                        {pickupResults.map((loc, idx) => (
                          <div key={idx} onClick={() => handleSelectLocation('pickup', loc)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{loc.display_name.split(',')[0]}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{loc.display_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative z-40" ref={dropoffRef}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Điểm đến</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Navigation className="h-4 w-4 text-emerald-500" />
                      </div>
                      <input 
                        type="text" 
                        value={dropoff}
                        onChange={(e) => {
                          setDropoff(e.target.value);
                          if (dropoffCoords) setDropoffCoords(null);
                        }}
                        placeholder="Nhập địa chỉ đến..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      {isSearchingDropoff && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 animate-spin" />}
                    </div>
                    {/* Kết quả tìm kiếm */}
                    {dropoffResults.length > 0 && !dropoffCoords && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 shadow-xl rounded-xl max-h-60 overflow-y-auto">
                        {dropoffResults.map((loc, idx) => (
                          <div key={idx} onClick={() => handleSelectLocation('dropoff', loc)} className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{loc.display_name.split(',')[0]}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{loc.display_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phần thông tin xe & Liên hệ */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Thông tin phương tiện & Liên hệ</label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Hãng & Dòng xe</label>
                        <input 
                          type="text" 
                          value={carBrand}
                          onChange={(e) => setCarBrand(e.target.value)}
                          placeholder="VD: Vinfast VF8"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Kiểu xe</label>
                        <select 
                          value={carType}
                          onChange={(e) => setCarType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                        >
                          <option value="Xe 4-9 chỗ">Xe 4-9 chỗ</option>
                          <option value="Xe tải nhẹ (<3.5 tấn)">Xe tải nhẹ (&lt;3.5 tấn)</option>
                          <option value="Xe tải nặng (>3.5 tấn)">Xe tải nặng (&gt;3.5 tấn)</option>
                          <option value="Xe khách 16-30 chỗ">Xe khách 16-30 chỗ</option>
                          <option value="Xe khách >30 chỗ">Xe khách &gt;30 chỗ</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Biển số xe</label>
                        <input 
                          type="text" 
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                          placeholder="VD: 30K-123.45"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Hộp số</label>
                        <select 
                          value={transmission}
                          onChange={(e) => setTransmission(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                        >
                          <option value="Số tự động">Số tự động</option>
                          <option value="Số sàn">Số sàn</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1 block">SĐT liên hệ lúc chờ tài xế</label>
                      <input 
                        type="tel" 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Nhập SĐT..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {distance && price && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 text-sm font-medium">Quãng đường</span>
                      <span className="text-slate-900 font-bold">{distance} km</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-500 text-sm font-medium">Cước phí ước tính</span>
                      <span className="text-blue-600 font-black text-xl">{price.toLocaleString()} đ</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === "SEARCHING" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-2 bg-blue-500 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Đang tìm tài xế...</h3>
                  <p className="text-slate-500 text-sm">Hệ thống đang kết nối bạn với tài xế gần nhất.</p>
                </div>
              </div>
            )}

            {['ACCEPTED', 'ARRIVED_AT_PICKUP', 'CAR_RECEIVED', 'IN_PROGRESS', 'ARRIVED_AT_DROPOFF'].includes(status) && currentBooking?.driver && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className={`border p-4 rounded-2xl flex items-start gap-3 transition-colors ${status === 'ARRIVED_AT_DROPOFF' ? 'bg-amber-50 border-amber-200 text-amber-800' : status === 'CAR_RECEIVED' || status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">
                      {status === 'ACCEPTED' && 'Tài xế đang đến nhận xe!'}
                      {status === 'ARRIVED_AT_PICKUP' && 'Tài xế đã đến điểm đón!'}
                      {(status === 'CAR_RECEIVED' || status === 'IN_PROGRESS') && 'Đang trong hành trình'}
                      {status === 'ARRIVED_AT_DROPOFF' && 'Tài xế đã đến đích!'}
                    </h4>
                    <p className={`text-sm mt-1 ${status === 'ARRIVED_AT_DROPOFF' ? 'text-amber-700/80' : status === 'CAR_RECEIVED' || status === 'IN_PROGRESS' ? 'text-blue-700/80' : 'text-emerald-600/80'}`}>
                      {status === 'ACCEPTED' && 'Vui lòng chuẩn bị sẵn chìa khóa và giấy tờ xe.'}
                      {status === 'ARRIVED_AT_PICKUP' && 'Vui lòng ra gặp tài xế để bàn giao xe.'}
                      {(status === 'CAR_RECEIVED' || status === 'IN_PROGRESS') && 'Tài xế đang điều khiển xe của bạn đến điểm đích.'}
                      {status === 'ARRIVED_AT_DROPOFF' && 'Vui lòng kiểm tra xe và xác nhận hoàn thành chuyến đi.'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    {currentBooking.driver.avatar ? (
                      <img src={currentBooking.driver.avatar} alt="Driver" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 className="w-full h-full text-slate-400 p-2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{currentBooking.driver.username}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-medium mt-1">
                      <Star className="w-4 h-4 fill-current" /> 4.9 (128 chuyến)
                    </div>
                  </div>
                  <a href={`tel:${currentBooking.driver.phonenumber}`} className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm font-medium">Hạng bằng lái</span>
                    <span className="text-slate-900 font-bold bg-white px-2 py-1 rounded border shadow-sm text-blue-700">Hạng {currentBooking.requiredLicense || 'B1'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-500 text-sm font-medium">Tổng tiền</span>
                    <span className="text-blue-600 font-black text-xl">{currentBooking.totalPrice?.toLocaleString()} đ</span>
                  </div>
                </div>
              </div>
            )}
            
            {status === "COMPLETED" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-5 animate-in zoom-in-95 duration-500">
                {!isReviewed ? (
                  <div className="w-full">
                    <h3 className="text-xl font-black text-slate-900 mb-1">Đánh giá tài xế</h3>
                    <p className="text-slate-500 text-sm mb-4">Chuyến đi của bạn như thế nào?</p>
                    
                    <div className="flex justify-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star className={`w-10 h-10 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Ghi chú thêm về tài xế (nếu có)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-24 mb-4"
                    />

                    <button 
                      onClick={async () => {
                        try {
                          await http.post('/reviews', { 
                            targetId: currentBooking?.driver?.id || 1, 
                            rating, 
                            content: reviewNote 
                          });
                          setIsReviewed(true);
                          toast.success("Cảm ơn bạn đã đánh giá!");
                        } catch (error) {
                          toast.error("Không thể gửi đánh giá lúc này.");
                        }
                      }}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 mb-3"
                    >
                      Gửi Đánh Giá
                    </button>

                    <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                      <DialogTrigger asChild>
                        <button className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors mt-2">
                          <AlertTriangle className="w-3.5 h-3.5" /> Tố cáo tài xế
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Báo cáo vi phạm
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <p className="text-sm text-slate-500">Vui lòng chọn lý do tố cáo tài xế. Thông tin của bạn sẽ được bảo mật và giúp chúng tôi cải thiện dịch vụ.</p>
                          <div className="space-y-3">
                            {[
                              "Lái xe ẩu, không an toàn",
                              "Thái độ không đúng mực",
                              "Yêu cầu thêm tiền ngoài ứng dụng",
                              "Xe không đúng với mô tả / Biển số sai",
                              "Khác"
                            ].map((reason) => (
                              <label key={reason} className="flex items-start gap-3 cursor-pointer">
                                <div className="flex items-center h-5">
                                  <input 
                                    type="radio" 
                                    name="report_reason" 
                                    className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500" 
                                    checked={reportReason === reason}
                                    onChange={() => setReportReason(reason)}
                                  />
                                </div>
                                <div className="text-sm font-medium text-slate-700 leading-tight">
                                  {reason}
                                </div>
                              </label>
                            ))}
                          </div>
                          
                          {reportReason === "Khác" && (
                            <textarea
                              value={reportOtherText}
                              onChange={(e) => setReportOtherText(e.target.value)}
                              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-24 mt-2"
                            />
                          )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 mt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsReportOpen(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                          >
                            Hủy
                          </button>
                          <button 
                            type="button" 
                            disabled={!reportReason || (reportReason === "Khác" && !reportOtherText.trim())}
                            onClick={() => {
                              toast.success("Đã gửi báo cáo. Quản trị viên sẽ xử lý và phản hồi bạn sớm nhất.");
                              setIsReportOpen(false);
                              setReportReason("");
                              setReportOtherText("");
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Gửi Tố Cáo
                          </button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Cảm Ơn Bạn!</h3>
                      <p className="text-slate-500 text-sm max-w-[250px] mx-auto">Đánh giá của bạn giúp AutoBid duy trì chất lượng dịch vụ tốt nhất.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setStatus("IDLE");
                        setCurrentBooking(null);
                        setPickup("");
                        setDropoff("");
                        setPickupCoords(null);
                        setDropoffCoords(null);
                        setDistance(null);
                        setPrice(null);
                        setIsReviewed(false);
                        setRating(5);
                        setReviewNote("");
                      }}
                      className="mt-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold tracking-widest uppercase hover:bg-slate-800 transition-all"
                    >
                      Đặt Chuyến Mới
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 shrink-0">
            {status === "IDLE" && (
              <button 
                onClick={handleBookRide}
                disabled={!distance}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold tracking-widest uppercase hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex justify-center items-center gap-2"
              >
                Đặt Xe Ngay
              </button>
            )}
            {status === "SEARCHING" && (
              <button 
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold tracking-widest uppercase hover:bg-red-100 transition-all flex justify-center items-center gap-2"
              >
                {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Hủy Yêu Cầu
              </button>
            )}
            {['ACCEPTED', 'ARRIVED_AT_PICKUP', 'CAR_RECEIVED', 'IN_PROGRESS'].includes(status) && (
              <div className="space-y-4">
                <button 
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold tracking-widest uppercase hover:bg-red-100 transition-all"
                >
                  Hủy Chuyến
                </button>
                <div className="text-center text-xs font-medium text-slate-400">
                  Chuyến đi đang được thực hiện. Chúc bạn một hành trình vui vẻ.
                </div>
              </div>
            )}
            {status === "ARRIVED_AT_DROPOFF" && (
              <div className="space-y-4">
                <button 
                  onClick={async () => {
                    if (!currentBooking) return;
                    try {
                      await http.post(`/driver-booking/${currentBooking.id}/confirm`);
                      toast.success("Đã xác nhận hoàn thành chuyến đi!");
                      setStatus("COMPLETED");
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || "Không thể xác nhận hoàn thành.");
                    }
                  }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold tracking-widest uppercase hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-5 h-5" /> Xác Nhận Hoàn Thành
                </button>
                <div className="text-center text-xs font-medium text-amber-600">
                  * Tôi xác nhận xe còn nguyên vẹn và đã tới đúng điểm đến.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="w-full lg:w-2/3 h-[400px] lg:h-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative z-0">
          <RideMap pickup={pickupCoords} dropoff={dropoffCoords} routeGeometry={routeGeometry} />
        </div>
        
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={(open) => !isCancelling && setCancelDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Xác nhận hủy chuyến
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 text-sm">
              Bạn có chắc chắn muốn hủy chuyến đi này không? Hệ thống sẽ ghi nhận lịch sử hủy chuyến của bạn và hành động này không thể hoàn tác.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Xác nhận hủy
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
