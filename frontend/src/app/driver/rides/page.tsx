"use client";

import React, { useState, useEffect } from "react";
import { initSocket, disconnectSocket } from "@/lib/socket";
import Cookies from "js-cookie";
import { MapPin, Navigation, Phone, CheckCircle2, Navigation2, Check, UserCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import http from "@/lib/http";

export default function DriverRidesPage() {
  const [socket, setSocket] = useState<any>(null);
  const [incomingRides, setIncomingRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      const token = Cookies.get("token");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) return;
      
      try {
        const userData = JSON.parse(userStr);
        // Tìm nạp hồ sơ mới để có được loại giấy phép chính xác
        const { data: profile } = await http.get('/users/profile');
        setUser(profile);
        
        let driverLicense = 'B1';
        if (profile.serviceProfiles && profile.serviceProfiles.length > 0) {
          const rentalServices = profile.serviceProfiles[0].driverRentalServices;
          if (rentalServices && rentalServices.length > 0) {
            driverLicense = rentalServices[0].licenseType || 'B1';
          }
        }

        const getLicenseLevel = (type: string) => {
          switch (type) {
            case 'B1': return 1;
            case 'B2': return 2;
            case 'C': return 3;
            case 'D': return 4;
            case 'E': return 5;
            case 'FC': return 6;
            default: return 0;
          }
        };

        const canDrive = (driverLicense: string, requiredLicense: string) => {
          if (!requiredLicense) return true; 
          return getLicenseLevel(driverLicense) >= getLicenseLevel(requiredLicense);
        };
        
        // Khởi tạo ổ cắm cưỡi ngựa
        const newSocket = initSocket('rides', token, profile.id);
        
        newSocket.on('new-ride-request', (booking: any) => {
          if (canDrive(driverLicense, booking.requiredLicense)) {
            setIncomingRides(prev => [booking, ...prev]);
            toast("🚕 Có cuốc xe mới phù hợp với bạn!", { icon: "🔔" });
          }
        });

        newSocket.on('ride-taken', ({ bookingId }: { bookingId: number }) => {
          setIncomingRides(prev => prev.filter(r => r.id !== bookingId));
        });

        setSocket(newSocket);

        // Tìm nạp chuyến đi chủ động nếu có
        const fetchActiveRide = async () => {
          try {
            const res = await http.get('/driver-booking/driver');
            const rides = res.data;
            const active = rides.find((r: any) => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status));
            if (active) setActiveRide(active);
          } catch (error) {
            console.error(error);
          }
        };
        
        // Tìm nạp các chuyến đi đang chờ xử lý khi có tải
        const fetchPendingRides = async () => {
          try {
            const res = await http.get('/driver-booking/pending');
            const filteredRides = res.data.filter((r: any) => canDrive(driverLicense, r.requiredLicense));
            setIncomingRides(filteredRides);
          } catch (error) {
            console.error(error);
          }
        };

        fetchActiveRide();
        fetchPendingRides();

      } catch (error) {
        console.error("Error init driver dashboard", error);
      }
    };

    initData();

    return () => disconnectSocket('rides');
  }, []);

  const handleAcceptRide = (bookingId: number) => {
    if (!socket) return;
    
    // Cập nhật giao diện người dùng lạc quan
    const rideToAccept = incomingRides.find(r => r.id === bookingId);
    if (rideToAccept) {
      setIncomingRides(prev => prev.filter(r => r.id !== bookingId));
      setActiveRide({ ...rideToAccept, status: 'ACCEPTED' });
    }

    socket.emit('accept-ride', { bookingId }, (response: any) => {
      if (response && response.error) {
        toast.error(response.error);
        setActiveRide(null); // Khôi phục
        // Tải lại các chuyến đi đang chờ xử lý
        http.get('/driver-booking/pending').then(res => setIncomingRides(res.data));
      } else {
        toast.success("Nhận cuốc thành công!");
        setActiveRide(response);
      }
    });
  };

  const handleUpdateStatus = (status: string) => {
    if (!socket || !activeRide) return;

    socket.emit('update-ride-status', { bookingId: activeRide.id, status }, (response: any) => {
      if (response && response.error) {
        toast.error(response.error);
      } else {
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          toast.success("Cuốc xe đã kết thúc.");
          setActiveRide(null);
        } else {
          toast.success("Đã cập nhật trạng thái chuyến đi.");
          setActiveRide(response);
        }
      }
    });
  };

  if (!user || !user.roles.includes('DRIVER')) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-500">Trang này chỉ dành cho Tài xế đã được phê duyệt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-[144px] pb-12 px-4 md:px-8 font-body">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trạm Nhận Cuốc</h1>
            <p className="text-slate-500 font-medium mt-2">Bật trực tuyến để nhận yêu cầu từ khách hàng.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Đang trực tuyến
          </div>
        </div>

        {activeRide ? (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {activeRide.status === 'ACCEPTED' ? 'Đang đến nhận xe' : 'Đang lái xe hộ'}
                </h2>
                <p className="text-blue-200 text-sm">Mã chuyến: #{activeRide.id}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{activeRide.totalPrice?.toLocaleString()} đ</div>
                <p className="text-blue-200 text-sm">Thu tiền mặt</p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Thông tin khách hàng */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {activeRide.customer?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{activeRide.customer?.username}</h3>
                    <p className="text-sm text-slate-500">{activeRide.contactPhone || activeRide.customer?.phonenumber}</p>
                  </div>
                </div>
                <a href={`tel:${activeRide.contactPhone || activeRide.customer?.phonenumber}`} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 shadow-lg transition-transform hover:scale-105">
                  <Phone className="w-5 h-5" />
                </a>
              </div>

              {/* Car Info */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">🚘</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-blue-400 block">Biển số xe</label>
                    <p className="font-bold text-slate-900 uppercase">{activeRide.licensePlate}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-blue-400 block">Hộp số</label>
                    <p className="font-bold text-slate-900">{activeRide.transmission}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-blue-400 block">Loại xe</label>
                    <p className="font-bold text-slate-900">{activeRide.carBrand} ({activeRide.carType})</p>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="relative pl-8 space-y-6">
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
                
                <div className="relative z-10">
                  <div className="absolute -left-[35px] top-0 w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Điểm nhận xe</label>
                  <p className="font-semibold text-slate-900 leading-relaxed">{activeRide.pickupAddress}</p>
                </div>
                
                <div className="relative z-10">
                  <div className="absolute -left-[35px] top-0 w-6 h-6 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                  </div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Điểm trả xe (Đích đến)</label>
                  <p className="font-semibold text-slate-900 leading-relaxed">{activeRide.dropoffAddress}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex gap-4">
                {activeRide.status === 'ACCEPTED' ? (
                  <button 
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className="flex-1 py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30 flex justify-center items-center gap-2"
                  >
                    <Navigation2 className="w-5 h-5" /> Đã nhận xe & Khởi hành
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Hoàn thành chuyến đi
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn hủy chuyến xe này?')) {
                      handleUpdateStatus('CANCELLED');
                    }
                  }}
                  className="py-4 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Cuốc xe chờ nhận ({incomingRides.length})</h2>
            
            {incomingRides.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có cuốc xe nào</h3>
                <p className="text-slate-500">Hệ thống sẽ thông báo ngay khi có khách hàng đặt xe.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incomingRides.map(ride => (
                  <div key={ride.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Mới</span>
                        <h3 className="font-black text-slate-900 text-xl mt-2">{ride.totalPrice?.toLocaleString()} đ</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 font-medium text-sm">{ride.distanceKm} km</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 relative">
                      <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-slate-100"></div>
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="w-4 h-4 bg-slate-200 rounded-full border-4 border-white shrink-0 mt-0.5"></div>
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">{ride.pickupAddress}</p>
                      </div>
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="w-4 h-4 bg-slate-900 rounded-full border-4 border-white shrink-0 mt-0.5"></div>
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">{ride.dropoffAddress}</p>
                      </div>
                    </div>

                    {/* Car Info Preview */}
                    <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-500">Xe: <span className="text-slate-900 uppercase">{ride.licensePlate}</span></span>
                        <div className="flex gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 border border-blue-200 rounded text-blue-700">Y/c Bằng: {ride.requiredLicense || 'B1'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white border rounded text-slate-700">{ride.transmission}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{ride.carBrand} ({ride.carType})</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-bold text-slate-900">{ride.customer?.username || 'Khách hàng'}</span>
                      </div>
                      <button 
                        onClick={() => handleAcceptRide(ride.id)}
                        className="py-2.5 px-6 bg-slate-900 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-blue-600 active:scale-95 transition-all shadow-md group-hover:shadow-blue-600/20"
                      >
                        NHẬN CUỐC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
