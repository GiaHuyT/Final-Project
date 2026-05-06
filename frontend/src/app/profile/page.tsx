"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Loader2, Car, Gavel, Bell, User, ArrowRight, Store, ShieldCheck, ChevronRight, ChevronDown, Image as ImageIcon, Plus, Trash2, CheckCircle2, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [isDriverRegModalOpen, setIsDriverRegModalOpen] = useState(false);
    const [isVipModalOpen, setIsVipModalOpen] = useState(false);
    const [driverFormData, setDriverFormData] = useState({
        // 1. Cá nhân
        name: '', dob: '', idCardNumber: '', phoneNumber: '', email: '', currentAddress: '',
        // 2. Bằng lái
        licenseType: '', licenseNumber: '', licenseIssueDate: '', licenseExpiryDate: '', experienceYears: '', hasServiceExperience: false,
        // 3. Lý lịch & sức khỏe
        hasCriminalRecord: true, healthConditionValid: false,
        // 4. Khu vực
        operatingCities: [] as string[], workType: '', workShifts: [] as string[],
        // 5. Thanh toán
        bankAccountNumber: '', bankName: '', bankAccountName: '',
        // 6. Thiết bị
        hasSmartphone: true, osPlatform: '', hasMobileData: true,
        // 7. Ảnh (gồm cả ảnh chân dung)
        avatarUrl: '', licenseFrontUrl: '', licenseBackUrl: '', idCardFrontUrl: '', idCardBackUrl: '', criminalRecordUrl: '',
        // 8. Cam kết
        agreedToTerms: false, agreedToNoAlcohol: false, agreedToResponsibility: false,
        // 9. Thêm
        bio: '', languages: [] as string[], pricePerKm: '',
    });
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const avatarRef = React.useRef<HTMLInputElement>(null);
    const licenseFrontRef = React.useRef<HTMLInputElement>(null);
    const licenseBackRef = React.useRef<HTMLInputElement>(null);
    const idCardFrontRef = React.useRef<HTMLInputElement>(null);
    const idCardBackRef = React.useRef<HTMLInputElement>(null);
    const criminalRecordRef = React.useRef<HTMLInputElement>(null);

    // Khu vực state
    const [provinces, setProvinces] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([
        { provCode: '', provName: '', distCode: '', distName: '', wardCode: '', wardName: '', districts: [], wards: [] }
    ]);

    const [currentAddressArea, setCurrentAddressArea] = useState<any>({
        provCode: '', provName: '', distCode: '', distName: '', wardCode: '', wardName: '', street: '', districts: [], wards: []
    });

    // Ngân hàng state
    const [banks, setBanks] = useState<any[]>([]);
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
    const [isLookingUpBank, setIsLookingUpBank] = useState(false);
    const [lookupFailed, setLookupFailed] = useState(false);

    useEffect(() => {
        if (driverFormData.bankName && driverFormData.bankAccountNumber && driverFormData.bankAccountNumber.length >= 6) {
            setIsLookingUpBank(true);
            const timeout = setTimeout(async () => {
                try {
                    const bank = banks.find(b => b.shortName === driverFormData.bankName);
                    if (bank && bank.bin) {
                        const res = await http.post('/payos/lookup-account', {
                            bin: bank.bin,
                            accountNumber: driverFormData.bankAccountNumber
                        });
                        
                        if (res.data && res.data.code === '00' && res.data.data?.accountName) {
                            setDriverFormData(prev => ({
                                ...prev,
                                bankAccountName: res.data.data.accountName
                            }));
                            setLookupFailed(false);
                            setMissingFields(prev => prev.filter(f => f !== 'bankAccountName'));
                            toast.success("Tra cứu tên chủ tài khoản thành công!");
                        } else {
                            toast.error("Hệ thống tra cứu tự động đang bảo trì. Vui lòng nhập tên thủ công.");
                            setDriverFormData(prev => ({ ...prev, bankAccountName: "" }));
                            setLookupFailed(true);
                        }
                    }
                } catch (error) {
                    console.error("Lỗi tra cứu:", error);
                    toast.error("Không thể tra cứu tự động lúc này. Vui lòng nhập tên thủ công.");
                    setDriverFormData(prev => ({ ...prev, bankAccountName: "" }));
                    setLookupFailed(true);
                } finally {
                    setIsLookingUpBank(false);
                }
            }, 1000);
            return () => clearTimeout(timeout);
        } else if (!driverFormData.bankAccountNumber || driverFormData.bankAccountNumber.length < 6) {
            setDriverFormData(prev => ({ ...prev, bankAccountName: "" }));
            setLookupFailed(false);
        }
    }, [driverFormData.bankName, driverFormData.bankAccountNumber, banks]);

    useEffect(() => {
        fetch('https://api.vietqr.io/v2/banks')
            .then(res => res.json())
            .then(data => {
                if (data.code === '00' && data.data) {
                    setBanks(data.data);
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(console.error);
    }, []);

    const handleProvChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setAreas(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], provCode: code, provName: code ? name : '', distCode: '', distName: '', wardCode: '', wardName: '', districts: [], wards: [] };
            return updated;
        });

        if (code) {
            fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    setAreas(curr => {
                        const updated = [...curr];
                        if (updated[index]) updated[index].districts = data.districts;
                        return updated;
                    });
                })
                .catch(console.error);
        }
    };

    const handleDistChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setAreas(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], distCode: code, distName: code ? name : '', wardCode: '', wardName: '', wards: [] };
            return updated;
        });

        if (code) {
            fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    setAreas(curr => {
                        const updated = [...curr];
                        if (updated[index]) updated[index].wards = data.wards;
                        return updated;
                    });
                })
                .catch(console.error);
        }
    };

    const handleWardChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setAreas(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], wardCode: code, wardName: code ? name : '' };
            return updated;
        });
    };

    const handleCurrentProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setCurrentAddressArea((prev: any) => ({ ...prev, provCode: code, provName: code ? name : '', distCode: '', distName: '', wardCode: '', wardName: '', districts: [], wards: [] }));

        if (code) {
            fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
                .then(res => res.json())
                .then(data => setCurrentAddressArea((curr: any) => ({ ...curr, districts: data.districts })))
                .catch(console.error);
        }
    };

    const handleCurrentDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setCurrentAddressArea((prev: any) => ({ ...prev, distCode: code, distName: code ? name : '', wardCode: '', wardName: '', wards: [] }));

        if (code) {
            fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
                .then(res => res.json())
                .then(data => setCurrentAddressArea((curr: any) => ({ ...curr, wards: data.wards })))
                .catch(console.error);
        }
    };

    const handleCurrentWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setCurrentAddressArea((prev: any) => ({ ...prev, wardCode: code, wardName: code ? name : '' }));
    };

    const addOperatingArea = () => {
        setAreas(prev => [...prev, { provCode: '', provName: '', distCode: '', distName: '', wardCode: '', wardName: '', districts: [], wards: [] }]);
    };

    const removeOperatingArea = (index: number) => {
        setAreas(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const validAreas = areas.map(a => [a.wardName, a.distName, a.provName].filter(Boolean).join(', ')).filter(Boolean);
        setDriverFormData(p => ({ ...p, operatingCities: validAreas }));
    }, [areas]);

    useEffect(() => {
        if (currentAddressArea.wardCode && currentAddressArea.distCode && currentAddressArea.provCode && currentAddressArea.street) {
            const address = [currentAddressArea.street, currentAddressArea.wardName, currentAddressArea.distName, currentAddressArea.provName].join(', ');
            setDriverFormData(p => ({ ...p, currentAddress: address }));
            setMissingFields(prev => prev.filter(f => f !== 'currentAddress'));
        } else {
            setDriverFormData(p => ({ ...p, currentAddress: '' }));
        }
    }, [currentAddressArea.wardCode, currentAddressArea.distCode, currentAddressArea.provCode, currentAddressArea.street]);

    const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'idCardNumber' || name === 'phoneNumber') {
            finalValue = value.replace(/\D/g, '');
        }
        setDriverFormData(prev => ({ ...prev, [name]: finalValue }));
        if (missingFields.includes(name)) {
            setMissingFields(prev => prev.filter(f => f !== name));
        }
        if (aiErrors[name]) {
            setAiErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setMissingFields(prev => prev.filter(f => f !== fieldName));
        setAiErrors(prev => ({ ...prev, [fieldName]: '' }));
        setUploadingField(fieldName);
        try {
            const data = new FormData();
            data.append('file', file);
            const res = await http.post('/users/avatar', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const uploadedUrl = res.data.avatarUrl;

            // Map fieldName to documentType
            let docType = '';
            if (fieldName === 'avatarUrl') docType = 'Ảnh chân dung';
            else if (fieldName === 'idCardFrontUrl') docType = 'Căn cước công dân (Mặt trước)';
            else if (fieldName === 'idCardBackUrl') docType = 'Căn cước công dân (Mặt sau)';
            else if (fieldName === 'licenseFrontUrl') docType = 'Giấy phép lái xe (Mặt trước)';
            else if (fieldName === 'licenseBackUrl') docType = 'Giấy phép lái xe (Mặt sau)';
            else if (fieldName === 'criminalRecordUrl') docType = 'Lý lịch tư pháp (Giấy chứng nhận tiền án tiền sự)';

            if (docType) {
                try {
                    await http.post('/users/verify-document', {
                        imageUrl: uploadedUrl,
                        documentType: docType
                    });
                } catch (verifyErr: any) {
                    const reason = verifyErr.response?.data?.message || 'Hình ảnh không hợp lệ.';
                    setAiErrors(prev => ({ ...prev, [fieldName]: reason }));
                    return; // Stop here, do not set driverFormData
                }
            }

            setDriverFormData(prev => ({ ...prev, [fieldName]: uploadedUrl }));
        } catch (error: any) {
            if (error.response?.status === 413) {
                setAiErrors(prev => ({ ...prev, [fieldName]: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 50MB.' }));
            } else {
                setAiErrors(prev => ({ ...prev, [fieldName]: 'Có lỗi xảy ra khi tải ảnh lên.' }));
            }
        } finally {
            setUploadingField(null);
            if (event.target) event.target.value = '';
        }
    };

    const submitDriverRequest = async () => {
        const requiredFields = [
            'name', 'dob', 'idCardNumber', 'phoneNumber', 'currentAddress',
            'licenseType', 'licenseNumber', 'experienceYears',
            'bankAccountNumber', 'bankName', 'bankAccountName',
            'avatarUrl', 'idCardFrontUrl', 'idCardBackUrl', 'licenseFrontUrl', 'licenseBackUrl', 'criminalRecordUrl', 'pricePerKm'
        ];

        const missing = requiredFields.filter(field => {
            const val = driverFormData[field as keyof typeof driverFormData];
            if (Array.isArray(val)) return val.length === 0;
            return !val;
        });

        if (!driverFormData.agreedToTerms) missing.push('agreedToTerms');
        if (!driverFormData.agreedToNoAlcohol) missing.push('agreedToNoAlcohol');
        if (!driverFormData.agreedToResponsibility) missing.push('agreedToResponsibility');

        let ageError = '';
        if (driverFormData.dob) {
            const dobDate = new Date(driverFormData.dob);
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                age--;
            }
            if (age < 18) {
                ageError = 'Yêu cầu phải từ đủ 18 tuổi';
            }
        }

        let idCardError = '';
        if (driverFormData.idCardNumber && !/^\d{12}$/.test(driverFormData.idCardNumber)) {
            idCardError = 'Số CCCD phải bao gồm đúng 12 chữ số';
        }

        let phoneError = '';
        if (driverFormData.phoneNumber && !/^\d{10,11}$/.test(driverFormData.phoneNumber)) {
            phoneError = 'Số điện thoại phải từ 10-11 chữ số';
        }

        if (missing.length > 0 || ageError || idCardError || phoneError) {
            setMissingFields(missing);
            setAiErrors(prev => {
                const newAiErrors = { ...prev };
                missing.forEach(field => delete newAiErrors[field]);
                if (ageError) newAiErrors.dob = ageError; else delete newAiErrors.dob;
                if (idCardError) newAiErrors.idCardNumber = idCardError; else delete newAiErrors.idCardNumber;
                if (phoneError) newAiErrors.phoneNumber = phoneError; else delete newAiErrors.phoneNumber;
                return newAiErrors;
            });
            toast.error('Vui lòng kiểm tra lại! Có trường thông tin bị thiếu hoặc không hợp lệ.');
            return;
        }

        setMissingFields([]);
        setIsSubmittingDriver(true);
        try {
            await http.post('/users/apply-driver', { ...driverFormData, email: user?.email || '' });
            setUser((prev: any) => ({ ...prev, driverRequestPending: true }));
        } catch (err: any) {
            const msg = err.response?.data?.message;
            if (msg) {
                if (msg.includes('Ảnh chân dung')) {
                    setAiErrors({ avatarUrl: msg });
                } else if (msg.includes('Căn cước công dân (Mặt trước)')) {
                    setAiErrors({ idCardFrontUrl: msg });
                } else if (msg.includes('Căn cước công dân (Mặt sau)')) {
                    setAiErrors({ idCardBackUrl: msg });
                } else if (msg.includes('Giấy phép lái xe (Mặt trước)')) {
                    setAiErrors({ licenseFrontUrl: msg });
                } else if (msg.includes('Giấy phép lái xe (Mặt sau)')) {
                    setAiErrors({ licenseBackUrl: msg });
                } else if (msg.includes('Lý lịch tư pháp')) {
                    setAiErrors({ criminalRecordUrl: msg });
                } else {
                    toast.error(msg);
                }
            } else {
                toast.error('Lỗi khi gửi yêu cầu');
            }
        } finally {
            setIsSubmittingDriver(false);
        }
    };

    const ImageUploadBox = ({ title, fieldName, refVar, containerClass, boxClass, imageClass = "object-contain p-1" }: { title: string, fieldName: keyof typeof driverFormData, refVar: React.RefObject<HTMLInputElement | null>, containerClass?: string, boxClass?: string, imageClass?: string }) => (
        <div className={cn("space-y-3", containerClass)}>
            <Label className="text-xs font-bold text-gray-700">{title}</Label>
            <div
                onClick={() => refVar.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group mb-2",
                    boxClass || "h-32",
                    (missingFields.includes(fieldName) || aiErrors[fieldName]) ? "border-red-500 bg-red-50/50 hover:bg-red-50" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-emerald-300"
                )}
            >
                {driverFormData[fieldName] ? (
                    <img src={driverFormData[fieldName] as string} className={cn("w-full h-full", imageClass)} alt={title} />
                ) : (
                    <div className="text-center p-4 space-y-1 text-gray-400 group-hover:text-emerald-500 transition-colors">
                        {uploadingField === fieldName ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                        ) : (
                            <>
                                <ImageIcon className="w-6 h-6 mx-auto" />
                                <p className="text-xs font-medium">Tải ảnh</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            {driverFormData[fieldName] && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs h-8"
                    onClick={() => setDriverFormData(prev => ({ ...prev, [fieldName]: '' }))}
                >
                    Xóa ảnh
                </Button>
            )}
            {aiErrors[fieldName] ? (
                <p className="text-xs text-red-500 font-medium text-center">{aiErrors[fieldName]}</p>
            ) : (
                missingFields.includes(fieldName) && !driverFormData[fieldName] && (
                    <p className="text-xs text-red-500 font-medium text-center">Bắt buộc phải tải ảnh này</p>
                )
            )}
            <input type="file" ref={refVar} onChange={(e) => handleFileChange(e, fieldName)} accept="image/*" className="hidden" />
        </div>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, productsRes] = await Promise.all([
                    http.get('/users/profile'),
                    // Fetch actual favorites data
                    http.get('/favorites').catch(() => ({ data: [] }))
                ]);
                setUser(profileRes.data);
                setProducts(productsRes.data || []);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                toast.error("Không thể tải thông tin hồ sơ");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    // Determine membership phrasing based on role
    const getRoleName = (role: string) => {
        if (role === 'ADMIN') return 'Quản Trị Hệ Thống';
        if (role === 'VENDOR') return 'Nhà Cung Cấp Xác Minh';
        return 'Thành Viên Cơ Bản';
    };

    const getMembershipTier = (role: string) => {
        if (role === 'ADMIN') return 'Quyền Hành Cao Nhất';
        if (role === 'VENDOR') return 'Hạng Thương Gia';
        return 'Hạng Phổ Thông';
    };

    const getRoleDescription = (role: string) => {
        if (role === 'ADMIN') return 'Bạn có toàn quyền truy cập và quản lý mọi dữ liệu trên hệ thống AutoBid.';
        if (role === 'VENDOR') return 'Chào mừng đối tác, bạn có thể niêm yết xe và quản lý giao dịch đấu giá.';
        return 'Bạn có thể thêm vào yêu thích và đặt giá thầu cho mọi chiếc xe trên nền tảng.';
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            <main className="pt-24 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
                {/* Header Section */}
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">Gara của tôi</h1>
                    <p className="text-slate-500 font-medium text-lg">Quản lý hồ sơ, danh sách xe yêu thích và các cài đặt chung.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                            <button className="flex items-center gap-3 px-5 py-4 text-blue-600 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600 bg-blue-50/50 transition-all whitespace-nowrap rounded-r-xl">
                                <User className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Hồ sơ cá nhân</span>
                            </button>
                            <Link href="/wishlist" className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Car className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Xe yêu thích</span>
                            </Link>
                            <Link href="/invoices" className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Receipt className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Hóa đơn của tôi</span>
                            </Link>
                            <Link href="/auctions/history" className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Gavel className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Lịch sử đấu giá</span>
                            </Link>
                            <Link href="/notifications" className="flex items-center gap-3 px-5 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 border-transparent rounded-r-xl">
                                <Bell className="w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-sm tracking-wide">Thông báo</span>
                            </Link>
                        </nav>

                        {/* Vendor Account Button (as per user image) */}
                        <div className="mt-6 px-2">
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (!user) return;

                                    if (user.isApprovedVendor) {
                                        let finalUser = user;
                                        if (!user.roles?.includes('VENDOR')) {
                                            try {
                                                const { data: updatedUser } = await http.patch('/users/switch-role', { role: 'VENDOR' });
                                                finalUser = updatedUser;
                                            } catch (err: any) {
                                                console.error(err);
                                                const lockReason = err.response?.data?.message || 'Tính năng VENDOR của bạn đã bị khóa.';
                                                toast.error(lockReason);
                                                return;
                                            }
                                        }
                                        localStorage.setItem('user', JSON.stringify(finalUser));
                                        Cookies.set('user_role', JSON.stringify(finalUser.roles || []), { path: '/' });
                                        window.location.href = '/vendor';
                                    } else {
                                        setIsRegModalOpen(true);
                                    }
                                }}
                                className={cn(
                                    "w-full py-4 px-4 rounded-2xl border flex items-center justify-between transition-all font-bold text-[13px] group shadow-sm",
                                    user?.roles?.includes('VENDOR')
                                        ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-900 active:scale-[0.98]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        user?.roles?.includes('VENDOR') ? "bg-white/10" : "bg-slate-100 group-hover:bg-slate-900 group-hover:text-white"
                                    )}>
                                        <Store className="w-4 h-4" />
                                    </div>
                                    <span>
                                        {user?.isApprovedVendor
                                            ? (user?.roles?.includes('VENDOR') ? 'Chế độ Người bán' : 'Tài khoản nhà cung cấp')
                                            : (user?.vendorRequestPending ? 'Đang chờ phê duyệt' : 'Tài khoản nhà cung cấp')
                                        }
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                            </button>
                        </div>

                        {/* Driver Account Button */}
                        <div className="mt-4 px-2">
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (!user) return;

                                    if (user.isApprovedDriver) {
                                        let finalUser = user;
                                        if (!user.roles?.includes('DRIVER')) {
                                            try {
                                                const { data: updatedUser } = await http.patch('/users/switch-role', { role: 'DRIVER' });
                                                finalUser = updatedUser;
                                            } catch (err: any) {
                                                console.error(err);
                                                const lockReason = err.response?.data?.message || 'Tính năng DRIVER của bạn đã bị khóa.';
                                                toast.error(lockReason);
                                                return;
                                            }
                                        }
                                        localStorage.setItem('user', JSON.stringify(finalUser));
                                        Cookies.set('user_role', JSON.stringify(finalUser.roles || []), { path: '/' });
                                        window.location.href = '/driver';
                                    } else {
                                        setIsDriverRegModalOpen(true);
                                    }
                                }}
                                className={cn(
                                    "w-full py-4 px-4 rounded-2xl border flex items-center justify-between transition-all font-bold text-[13px] group shadow-sm",
                                    user?.roles?.includes('DRIVER')
                                        ? "bg-emerald-900 text-white border-emerald-900 hover:bg-emerald-950"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-emerald-900 hover:text-emerald-900 active:scale-[0.98]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        user?.roles?.includes('DRIVER') ? "bg-white/10" : "bg-slate-100 group-hover:bg-emerald-900 group-hover:text-white"
                                    )}>
                                        <Car className="w-4 h-4" />
                                    </div>
                                    <span>
                                        {user?.isApprovedDriver
                                            ? 'Tài khoản Tài xế'
                                            : (user?.driverRequestPending ? 'Đang chờ duyệt Tài xế' : 'Đăng ký làm Tài xế')
                                        }
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-grow space-y-10">
                        {/* Registration Modal */}
                        <Dialog open={isRegModalOpen} onOpenChange={setIsRegModalOpen}>
                            <DialogContent className="sm:max-w-[460px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                                {user?.vendorRequestPending ? (
                                    <div className="p-12 text-center space-y-6 bg-white my-auto">
                                        <div className="w-24 h-24 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldCheck className="w-12 h-12" />
                                        </div>
                                        <DialogTitle className="text-2xl font-black text-slate-800">Hồ Sơ Đang Được Xét Duyệt</DialogTitle>
                                        <p className="text-slate-500 font-medium leading-relaxed">Hồ sơ đăng ký nhà cung cấp của bạn đã được gửi thành công. Đội ngũ AutoBid sẽ tiến hành xác minh thông tin trong vòng <strong className="text-slate-800">1-2 ngày làm việc</strong>.<br/><br/>Kết quả sẽ được thông báo qua Email và Thông báo trên hệ thống.</p>
                                        <Button onClick={() => setIsRegModalOpen(false)} className="bg-[#171717] hover:bg-black text-white rounded-xl px-12 h-14 font-bold mt-4 shadow-lg shadow-black/20 uppercase tracking-widest text-sm w-full">Đã hiểu</Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gradient-to-br from-[#404040] to-[#171717] p-8 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                                            <Store className="w-12 h-12 mb-4 relative z-10 opacity-90" />
                                            <DialogTitle className="text-2xl font-black mb-2 relative z-10">Đăng ký Nhà cung cấp</DialogTitle>
                                            <DialogDescription className="text-neutral-400 font-medium relative z-10">Bắt đầu kinh doanh xe chuyên nghiệp trên hệ thống AutoBid ngay hôm nay.</DialogDescription>
                                        </div>
                                <div className="p-8 space-y-6 bg-white">
                                    <div className="space-y-4">
                                        {[
                                            { icon: ShieldCheck, text: "Đăng bán xe không giới hạn", sub: "Tiếp cận hàng ngàn khách hàng tiềm năng." },
                                            { icon: Gavel, text: "Tạo và quản lý phiên đấu giá", sub: "Hệ thống đấu giá thời gian thực minh bạch." },
                                            { icon: Bell, text: "Hỗ trợ quảng bá sản phẩm", sub: "Nhận thông báo đơn hàng và báo cáo chi tiết." }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-900 border border-neutral-100 shrink-0 shadow-sm">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-800 leading-tight">{item.text}</p>
                                                    <p className="text-xs text-neutral-500 font-medium mt-0.5">{item.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await http.post('/users/apply-vendor');
                                                    toast.success('Gửi yêu cầu thành công!');
                                                    setIsRegModalOpen(false);
                                                    setTimeout(() => window.location.reload(), 800);
                                                } catch (err: any) {
                                                    toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
                                                }
                                            }}
                                            className="w-full bg-[#171717] hover:bg-black text-white h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:shadow-xl hover:scale-[1.01]"
                                        >
                                            Xác nhận đăng ký ngay
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsRegModalOpen(false)}
                                            className="w-full h-12 rounded-xl font-bold text-neutral-400 hover:text-neutral-600"
                                        >
                                            Để sau
                                        </Button>
                                    </div>
                                </div>
                                </>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Driver Registration Modal */}
                        <Dialog open={isDriverRegModalOpen} onOpenChange={setIsDriverRegModalOpen}>
                            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl scrollbar-hide bg-slate-50">
                                {user?.driverRequestPending ? (
                                    <div className="p-12 text-center space-y-6 bg-white my-auto">
                                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldCheck className="w-12 h-12" />
                                        </div>
                                        <DialogTitle className="text-2xl font-black text-slate-800">Hồ Sơ Đang Được Xét Duyệt</DialogTitle>
                                        <p className="text-slate-500 font-medium leading-relaxed">Hồ sơ đăng ký đối tác tài xế của bạn đã được gửi thành công. Đội ngũ AutoBid sẽ tiến hành xác minh thông tin và giấy tờ trong vòng <strong className="text-emerald-600">3-4 ngày làm việc</strong>.<br/><br/>Kết quả sẽ được thông báo qua Email và Thông báo trên hệ thống.</p>
                                        <Button onClick={() => setIsDriverRegModalOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 h-14 font-bold mt-4 shadow-lg shadow-emerald-600/20 uppercase tracking-widest text-sm">Đã hiểu</Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-emerald-600 p-8 text-white relative overflow-hidden shrink-0">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                                    <Car className="w-10 h-10 mb-3 relative z-10 opacity-90" />
                                    <DialogTitle className="text-2xl font-black mb-1 relative z-10">Hồ Sơ Đăng Ký Đối Tác Tài Xế</DialogTitle>
                                    <DialogDescription className="text-emerald-100 text-sm font-medium relative z-10">Vui lòng điền đầy đủ 6 phần thông tin dưới đây để chúng tôi xác minh và phê duyệt.</DialogDescription>
                                </div>
                                <div className="p-8 space-y-10">
                                    {/* 1. Thông tin cá nhân */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-2"><User className="w-5 h-5 text-emerald-600" /> 1. Thông tin cá nhân (bắt buộc)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-red-500">*</span></Label><Input name="name" value={driverFormData.name} onChange={handleDriverChange} className={missingFields.includes('name') ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('name') && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Họ và tên</p>}</div>
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Ngày sinh <span className="text-red-500">*</span></Label><Input type="date" name="dob" value={driverFormData.dob} onChange={handleDriverChange} className={missingFields.includes('dob') || aiErrors.dob ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('dob') && <p className="text-[11px] text-red-500 font-medium">Vui lòng chọn Ngày sinh</p>}{!missingFields.includes('dob') && aiErrors.dob && <p className="text-[11px] text-red-500 font-medium">{aiErrors.dob}</p>}</div>
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Số CCCD/CMND <span className="text-red-500">*</span></Label><Input name="idCardNumber" value={driverFormData.idCardNumber} onChange={handleDriverChange} maxLength={12} className={missingFields.includes('idCardNumber') || aiErrors.idCardNumber ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('idCardNumber') && !aiErrors.idCardNumber && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Số CCCD/CMND</p>}{aiErrors.idCardNumber && <p className="text-[11px] text-red-500 font-medium">{aiErrors.idCardNumber}</p>}</div>
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-red-500">*</span></Label><Input name="phoneNumber" value={driverFormData.phoneNumber} onChange={handleDriverChange} maxLength={11} className={missingFields.includes('phoneNumber') || aiErrors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('phoneNumber') && !aiErrors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Số điện thoại</p>}{aiErrors.phoneNumber && <p className="text-[11px] text-red-500 font-medium">{aiErrors.phoneNumber}</p>}</div>
                                            <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-bold text-slate-600">Email (Đã liên kết tài khoản) <span className="text-emerald-500 ml-1">✓</span></Label><Input type="email" name="email" value={user?.email || ''} disabled className="bg-slate-100/80 text-slate-500 cursor-not-allowed border-slate-200 font-medium select-none" /></div>
                                            <div className="space-y-1.5 md:col-span-2">
                                                <Label className="text-xs font-bold text-slate-600">Địa chỉ thường trú hiện tại <span className="text-red-500">*</span></Label>
                                                <div className={`flex flex-col gap-3 p-3 rounded-lg border ${missingFields.includes('currentAddress') ? 'border-red-500 bg-red-50/20' : 'border-slate-100 bg-slate-50'}`}>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <select value={currentAddressArea.provCode} onChange={handleCurrentProvChange} className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${missingFields.includes('currentAddress') && !currentAddressArea.provCode ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
                                                            <option value="">Chọn Tỉnh / Thành phố</option>
                                                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                                        </select>
                                                        <select value={currentAddressArea.distCode} onChange={handleCurrentDistChange} disabled={!currentAddressArea.provCode} className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400 ${missingFields.includes('currentAddress') && !currentAddressArea.distCode ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
                                                            <option value="">Chọn Quận / Huyện</option>
                                                            {currentAddressArea.districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
                                                        </select>
                                                        <select value={currentAddressArea.wardCode} onChange={handleCurrentWardChange} disabled={!currentAddressArea.distCode} className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400 ${missingFields.includes('currentAddress') && !currentAddressArea.wardCode ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
                                                            <option value="">Chọn Phường / Xã</option>
                                                            {currentAddressArea.wards.map((w: any) => <option key={w.code} value={w.code}>{w.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <Input 
                                                        placeholder="Số nhà, ngõ, tên đường, thôn/xóm..." 
                                                        value={currentAddressArea.street || ''} 
                                                        onChange={(e) => setCurrentAddressArea((prev: any) => ({ ...prev, street: e.target.value }))}
                                                        className={`w-full ${missingFields.includes('currentAddress') && !currentAddressArea.street ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                    />
                                                </div>
                                                {missingFields.includes('currentAddress') && <p className="text-[11px] text-red-500 font-medium mt-1">Vui lòng nhập Địa chỉ chi tiết và chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã</p>}
                                            </div>
                                            <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-bold text-slate-600">Giới thiệu bản thân (Tùy chọn)</Label><Input name="bio" value={driverFormData.bio} onChange={handleDriverChange} placeholder="Vài nét về bạn để khách hàng tin tưởng hơn" /></div>
                                            <div className="space-y-1.5 md:col-span-2 relative">
                                                <Label className="text-xs font-bold text-slate-600">Ngoại ngữ (Tùy chọn)</Label>
                                                <div 
                                                    className="w-full border rounded-xl min-h-[44px] p-2 bg-gray-50/50 cursor-pointer flex flex-wrap gap-2 items-center"
                                                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                                >
                                                    {driverFormData.languages.length === 0 ? (
                                                        <span className="text-slate-400 text-sm px-2">Chọn ngoại ngữ...</span>
                                                    ) : (
                                                        driverFormData.languages.map(lang => (
                                                            <span key={lang} className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
                                                                {lang}
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setDriverFormData(p => ({...p, languages: p.languages.filter(l => l !== lang)})) }}>&times;</button>
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                                {isLangDropdownOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto p-2">
                                                        {["Tiếng Anh", "Tiếng Trung (Phổ thông)", "Tiếng Hàn", "Tiếng Nhật", "Tiếng Pháp", "Tiếng Đức", "Tiếng Nga", "Tiếng Thái", "Tiếng Mã Lai / Indonesia", "Tiếng Tây Ban Nha", "Tiếng Hindi", "Tiếng Khmer", "Tiếng Lào"].map(lang => (
                                                            <div 
                                                                key={lang} 
                                                                className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer rounded-lg"
                                                                onClick={() => {
                                                                    setDriverFormData(p => ({
                                                                        ...p, 
                                                                        languages: p.languages.includes(lang) 
                                                                            ? p.languages.filter(l => l !== lang)
                                                                            : [...p.languages, lang]
                                                                    }))
                                                                }}
                                                            >
                                                                <input type="checkbox" checked={driverFormData.languages.includes(lang)} readOnly className="w-4 h-4 rounded text-emerald-600" />
                                                                <span className="text-sm font-medium text-slate-700">{lang}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                            <ImageUploadBox title="Ảnh chân dung selfie *" fieldName="avatarUrl" refVar={avatarRef} />
                                            <ImageUploadBox title="Ảnh CCCD (Mặt trước) *" fieldName="idCardFrontUrl" refVar={idCardFrontRef} />
                                            <ImageUploadBox title="Ảnh CCCD (Mặt sau) *" fieldName="idCardBackUrl" refVar={idCardBackRef} />
                                        </div>
                                    </section>

                                    {/* 2. Thông tin bằng lái */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-2"><Car className="w-5 h-5 text-emerald-600" /> 2. Thông tin bằng lái (bắt buộc)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-slate-600">Loại bằng lái <span className="text-red-500">*</span></Label>
                                                <select 
                                                    name="licenseType" 
                                                    value={driverFormData.licenseType} 
                                                    onChange={handleDriverChange} 
                                                    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${missingFields.includes('licenseType') ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                >
                                                    <option value="" disabled>Chọn hạng bằng lái</option>
                                                    <option value="B1">Hạng B1 (Xe số tự động)</option>
                                                    <option value="B2">Hạng B2 (Xe số sàn/tự động)</option>
                                                    <option value="C">Hạng C (Xe tải nặng)</option>
                                                    <option value="D">Hạng D (Xe khách &lt;30 chỗ)</option>
                                                    <option value="E">Hạng E (Xe khách &gt;30 chỗ)</option>
                                                    <option value="FC">Hạng FC (Xe container)</option>
                                                </select>
                                                {missingFields.includes('licenseType') && <p className="text-[11px] text-red-500 font-medium">Vui lòng chọn Hạng bằng lái</p>}
                                            </div>
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Số bằng lái <span className="text-red-500">*</span></Label><Input name="licenseNumber" value={driverFormData.licenseNumber} onChange={handleDriverChange} className={missingFields.includes('licenseNumber') ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('licenseNumber') && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Số bằng lái</p>}</div>
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Số năm kinh nghiệm <span className="text-red-500">*</span></Label><Input type="number" name="experienceYears" value={driverFormData.experienceYears} onChange={handleDriverChange} className={missingFields.includes('experienceYears') ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('experienceYears') && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Số năm kinh nghiệm</p>}</div>
                                            <div className="space-y-1.5 flex items-center gap-2 mt-6">
                                                <input type="checkbox" id="hasServiceExp" checked={driverFormData.hasServiceExperience} onChange={(e) => setDriverFormData(p => ({ ...p, hasServiceExperience: e.target.checked }))} className="w-4 h-4 rounded text-emerald-600" />
                                                <Label htmlFor="hasServiceExp" className="text-sm font-bold text-slate-600 cursor-pointer">Đã từng làm tài xế dịch vụ chưa?</Label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                            <ImageUploadBox title="GPLX (Mặt trước) *" fieldName="licenseFrontUrl" refVar={licenseFrontRef} />
                                            <ImageUploadBox title="GPLX (Mặt sau) *" fieldName="licenseBackUrl" refVar={licenseBackRef} />
                                        </div>
                                    </section>

                                    {/* 3. Lý lịch & an toàn */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> 3. Lý lịch & an toàn (rất quan trọng)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Trái: Ảnh */}
                                            <div className="h-full">
                                                <ImageUploadBox 
                                                    title="Lý lịch tư pháp (Phiếu số 1 hoặc 2) *" 
                                                    fieldName="criminalRecordUrl" 
                                                    refVar={criminalRecordRef} 
                                                    containerClass="flex flex-col h-full"
                                                    boxClass="flex-1 min-h-[8rem]"
                                                    imageClass="object-contain p-2"
                                                />
                                            </div>
                                            {/* Phải: Checkbox */}
                                            <div className="flex flex-col gap-4 justify-center">
                                                <div className="space-y-3 bg-white p-4 rounded-xl border">
                                                    <Label className="text-sm font-bold text-slate-800">Tình trạng pháp lý</Label>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" id="hasCrim" checked={!driverFormData.hasCriminalRecord} onChange={(e) => setDriverFormData(p => ({ ...p, hasCriminalRecord: !e.target.checked }))} className="w-4 h-4 rounded text-emerald-600" />
                                                        <Label htmlFor="hasCrim" className="text-sm text-slate-600 cursor-pointer">Tôi chưa từng có tiền án / tiền sự</Label>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 bg-white p-4 rounded-xl border">
                                                    <Label className="text-sm font-bold text-slate-800">Tình trạng sức khỏe</Label>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" id="healthOk" checked={driverFormData.healthConditionValid} onChange={(e) => setDriverFormData(p => ({ ...p, healthConditionValid: e.target.checked }))} className="w-4 h-4 rounded text-emerald-600" />
                                                        <Label htmlFor="healthOk" className="text-sm text-slate-600 cursor-pointer">Sức khỏe đảm bảo để lái xe an toàn</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 4. Giá thuê & Thanh toán */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-2">💰 4. Giá thuê & Thông tin thanh toán</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Giá thuê (VNĐ/Km) <span className="text-red-500">*</span></Label><Input type="number" name="pricePerKm" value={driverFormData.pricePerKm} onChange={handleDriverChange} className={missingFields.includes('pricePerKm') ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('pricePerKm') && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Giá thuê (VNĐ/Km)</p>}</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-slate-600">Ngân hàng <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <div 
                                                        className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white cursor-pointer ${missingFields.includes('bankName') ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                        onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                                                    >
                                                        {driverFormData.bankName ? (
                                                            <div className="flex items-center gap-2 truncate">
                                                                {banks.find(b => b.shortName === driverFormData.bankName)?.logo && (
                                                                    <img src={banks.find(b => b.shortName === driverFormData.bankName)?.logo} alt="logo" className="h-5 w-auto object-contain" />
                                                                )}
                                                                <span className="truncate">{driverFormData.bankName}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-500">Chọn ngân hàng</span>
                                                        )}
                                                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                                    </div>
                                                    {isBankDropdownOpen && (
                                                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto p-2">
                                                            {banks.map(bank => (
                                                                <div 
                                                                    key={bank.id} 
                                                                    className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer rounded-lg border-b last:border-0"
                                                                    onClick={() => {
                                                                        setDriverFormData(prev => ({ ...prev, bankName: bank.shortName }));
                                                                        setIsBankDropdownOpen(false);
                                                                        if (missingFields.includes('bankName')) {
                                                                            setMissingFields(prev => prev.filter(f => f !== 'bankName'));
                                                                        }
                                                                    }}
                                                                >
                                                                    <img src={bank.logo} alt={bank.shortName} className="h-6 w-12 object-contain" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-slate-800 truncate">{bank.shortName}</p>
                                                                        <p className="text-xs text-slate-500 truncate">{bank.name}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {missingFields.includes('bankName') && <p className="text-[11px] text-red-500 font-medium">Vui lòng chọn Ngân hàng</p>}
                                            </div>
                                            <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-600">Số tài khoản <span className="text-red-500">*</span></Label><Input name="bankAccountNumber" value={driverFormData.bankAccountNumber} onChange={handleDriverChange} className={missingFields.includes('bankAccountNumber') ? "border-red-500 focus-visible:ring-red-500" : ""} />{missingFields.includes('bankAccountNumber') && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Số tài khoản</p>}</div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-slate-600">Tên chủ tài khoản <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <Input 
                                                        name="bankAccountName" 
                                                        value={driverFormData.bankAccountName} 
                                                        onChange={handleDriverChange}
                                                        readOnly={!lookupFailed && !isLookingUpBank && driverFormData.bankAccountName !== ""} 
                                                        className={`${(!lookupFailed && driverFormData.bankAccountName !== "") ? "bg-slate-50 font-bold text-slate-700" : ""} ${missingFields.includes('bankAccountName') ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                                                        placeholder={isLookingUpBank ? "Đang tra cứu..." : (lookupFailed ? "Vui lòng nhập tên không dấu" : "")} 
                                                    />
                                                    {isLookingUpBank && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-600" />}
                                                </div>
                                                {missingFields.includes('bankAccountName') && <p className="text-[11px] text-red-500 font-medium">Vui lòng nhập Tên chủ tài khoản</p>}
                                            </div>
                                        </div>
                                    </section>

                                    {/* 5. Cam kết */}
                                    <section className="space-y-4 bg-orange-50 p-6 rounded-2xl border border-orange-200">
                                        <h3 className="text-lg font-black text-orange-900 flex items-center gap-2">📄 5. Điều khoản & Cam kết</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="aTerms" checked={driverFormData.agreedToTerms} onChange={(e) => { setDriverFormData(p => ({ ...p, agreedToTerms: e.target.checked })); if (e.target.checked) setMissingFields(prev => prev.filter(f => f !== 'agreedToTerms')); }} className={`w-5 h-5 rounded ${missingFields.includes('agreedToTerms') ? 'border-red-500' : 'border-orange-300'} text-orange-600 focus:ring-orange-500`} />
                                                <Label htmlFor="aTerms" className={`text-sm font-bold ${missingFields.includes('agreedToTerms') ? 'text-red-500' : 'text-orange-800'} cursor-pointer`}>Tôi đồng ý với mọi điều khoản sử dụng của nền tảng.</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="aAlco" checked={driverFormData.agreedToNoAlcohol} onChange={(e) => { setDriverFormData(p => ({ ...p, agreedToNoAlcohol: e.target.checked })); if (e.target.checked) setMissingFields(prev => prev.filter(f => f !== 'agreedToNoAlcohol')); }} className={`w-5 h-5 rounded ${missingFields.includes('agreedToNoAlcohol') ? 'border-red-500' : 'border-orange-300'} text-orange-600 focus:ring-orange-500`} />
                                                <Label htmlFor="aAlco" className={`text-sm font-bold ${missingFields.includes('agreedToNoAlcohol') ? 'text-red-500' : 'text-orange-800'} cursor-pointer`}>Tôi cam kết KHÔNG sử dụng rượu bia, chất kích thích khi làm việc.</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" id="aResp" checked={driverFormData.agreedToResponsibility} onChange={(e) => { setDriverFormData(p => ({ ...p, agreedToResponsibility: e.target.checked })); if (e.target.checked) setMissingFields(prev => prev.filter(f => f !== 'agreedToResponsibility')); }} className={`w-5 h-5 rounded ${missingFields.includes('agreedToResponsibility') ? 'border-red-500' : 'border-orange-300'} text-orange-600 focus:ring-orange-500`} />
                                                <Label htmlFor="aResp" className={`text-sm font-bold ${missingFields.includes('agreedToResponsibility') ? 'text-red-500' : 'text-orange-800'} cursor-pointer`}>Tôi chịu hoàn toàn trách nhiệm trước pháp luật nếu vi phạm các tiêu chuẩn an toàn.</Label>
                                            </div>
                                            {(missingFields.includes('agreedToTerms') || missingFields.includes('agreedToNoAlcohol') || missingFields.includes('agreedToResponsibility')) && (
                                                <p className="text-sm font-medium text-red-500 mt-2">Vui lòng đánh dấu vào tất cả các cam kết trên.</p>
                                            )}
                                        </div>
                                    </section>

                                    <div className="pt-6 flex flex-col sm:flex-row gap-3 border-t">
                                        <Button variant="ghost" onClick={() => setIsDriverRegModalOpen(false)} className="w-full sm:w-1/3 h-14 rounded-xl font-bold text-neutral-500 hover:bg-gray-200">Hủy bỏ</Button>
                                        <Button onClick={submitDriverRequest} disabled={isSubmittingDriver || uploadingField !== null} className="w-full sm:w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-xl font-black text-[15px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20">
                                            {isSubmittingDriver ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Gửi Hồ Sơ Phê Duyệt'}
                                        </Button>
                                    </div>
                                </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* VIP Details Modal */}
                        <Dialog open={isVipModalOpen} onOpenChange={setIsVipModalOpen}>
                            <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                                    <span className="material-symbols-outlined text-5xl mb-4 relative z-10 opacity-90 text-yellow-500">workspace_premium</span>
                                    <DialogTitle className="text-2xl font-black mb-2 relative z-10 text-white">Đặc quyền Thành viên</DialogTitle>
                                    <DialogDescription className="text-slate-300 font-medium relative z-10">Tích lũy chi tiêu trên hệ thống để thăng hạng và nhận các đặc quyền hấp dẫn.</DialogDescription>
                                </div>
                                <div className="p-8 space-y-6 bg-white max-h-[60vh] overflow-y-auto scrollbar-hide">
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-700 shrink-0">CB</div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-slate-900">Thành viên Cơ bản</h4>
                                                </div>
                                                <p className="text-sm font-medium text-slate-500 mb-2">Mặc định khi đăng ký</p>
                                                <ul className="text-xs text-slate-600 space-y-1 font-medium">
                                                    <li>• Mua bán, đấu giá cơ bản</li>
                                                    <li>• Thêm vào danh sách yêu thích</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center font-black text-blue-700 shrink-0">V1</div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-blue-900">Thành viên VIP 1</h4>
                                                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">10 Tỷ VNĐ</span>
                                                </div>
                                                <p className="text-sm font-medium text-blue-600 mb-2">Chi tiêu trên 10.000.000.000 VNĐ</p>
                                                <ul className="text-xs text-blue-800 space-y-1.5 font-medium mt-3">
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Chuyên viên hỗ trợ cá nhân (1-1) 24/7</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Huy hiệu VIP 1 nổi bật trên hồ sơ</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Miễn phí định giá xe cơ bản trực tuyến</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tặng 2 voucher rửa xe cao cấp mỗi tháng</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Ưu tiên đẩy tin bán xe lên trang chủ</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center font-black text-amber-700 shrink-0">V2</div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-amber-900">Thành viên VIP 2</h4>
                                                    <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">50 Tỷ VNĐ</span>
                                                </div>
                                                <p className="text-sm font-medium text-amber-600 mb-2">Chi tiêu trên 50.000.000.000 VNĐ</p>
                                                <ul className="text-xs text-amber-800 space-y-1.5 font-medium mt-3">
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Toàn bộ đặc quyền của VIP 1</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tiền 0.5% mọi giao dịch (Tối đa 50tr)</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Miễn phí test đâm đụng, ngập nước (2 lần/năm)</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tặng gói bảo dưỡng định kỳ (Trị giá 5 triệu)</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Miễn phí gọi cứu hộ kéo xe toàn quốc 24/7</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Quyền truy cập VIP Lounge tại các Showroom</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shrink-0">V3</div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-indigo-900">Thành viên VIP 3</h4>
                                                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">100 Tỷ VNĐ</span>
                                                </div>
                                                <p className="text-sm font-medium text-indigo-600 mb-2">Chi tiêu trên 100.000.000.000 VNĐ</p>
                                                <ul className="text-xs text-indigo-800 space-y-1.5 font-medium mt-3">
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Toàn bộ đặc quyền của VIP 2</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tiền 1% không giới hạn mọi giao dịch</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Vé mời danh dự tham dự đấu giá siêu xe kín</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Đội ngũ tài xế hạng sang miễn phí (4 lần/tháng)</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tặng gói phủ Ceramic cao cấp bảo vệ sơn hàng năm</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Xe siêu sang đón tiễn sân bay (12 lượt/năm)</li>
                                                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Thẻ hội viên VIP Golf Club liên kết</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2">
                                        <Button onClick={() => setIsVipModalOpen(false)} className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl font-bold">Đã hiểu</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>


                        {/* Personal Info Bento Section */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Profile Card */}
                            <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Thông tin Cá nhân</h2>
                                    <button className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors w-fit">
                                        Chỉnh sửa hồ sơ
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Họ và tên hoặc Tổ chức</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.username || "—"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Địa chỉ Email</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.email || "—"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Số điện thoại</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.phonenumber || "—"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Đăng ký ngày</label>
                                        <p className="text-xl font-bold text-slate-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Membership Status */}
                            <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-slate-900/10 relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 opacity-10">
                                    <span className="material-symbols-outlined text-9xl">workspace_premium</span>
                                </div>
                                <div className="relative z-10">
                                    <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-6 backdrop-blur-md">
                                        {getMembershipTier(user?.role)}
                                    </span>
                                    <h3 className="text-3xl font-black tracking-tight leading-tight mb-3">
                                        {getRoleName(user?.role)}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                        {getRoleDescription(user?.role)}
                                    </p>
                                </div>
                                <div onClick={() => setIsVipModalOpen(true)} className="mt-8 flex items-center gap-2 text-sm font-bold text-white cursor-pointer hover:text-blue-300 transition-colors w-max relative z-10">
                                    Chi tiết đặc quyền <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </section>

                        {/* Recently Viewed / Saved Cars */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 border-b border-slate-200 pb-4">Danh sách yêu thích</h2>
                            {products.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 min-h-[300px]">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                                        <Car className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có xe nào trong gara</h3>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm">Duyệt qua danh mục xe thể thao hiện tại và lưu những chiếc bạn quan tâm.</p>
                                    <Link href="/auctions" className="px-8 py-4 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                        Khám phá sàn giao dịch
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer flex flex-col">
                                            <Link href={`/products/${product.id}`} className="block flex-1">
                                                <div className="h-56 relative overflow-hidden bg-slate-100">
                                                    <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={product.imageUrl || "/images/static/car-placeholder.png"} />
                                                    <div 
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            try {
                                                                await http.post(`/favorites/toggle/${product.id}`);
                                                                setProducts(prev => prev.filter(p => p.id !== product.id));
                                                                toast.success('Đã xóa khỏi danh sách yêu thích');
                                                            } catch (error) {
                                                                toast.error('Có lỗi xảy ra khi xóa yêu thích');
                                                            }
                                                        }}
                                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                        <h3 className="font-extrabold text-lg text-slate-900 line-clamp-2 leading-tight">{product.name}</h3>
                                                    </div>
                                                    <p className="text-2xl font-black text-blue-600 mb-4">{product.price.toLocaleString('vi-VN')} <span className="text-[12px] align-top text-blue-400">đ</span></p>

                                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                                        <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400 text-sm">directions_car</span>
                                                            <span className="text-xs font-bold text-slate-700">{product.brand || 'Xe'}</span>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400 text-sm">speed</span>
                                                            <span className="text-xs font-bold text-slate-700">{product.mileage ? `${product.mileage} km` : 'Mới'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                                                        <div className="h-full bg-emerald-500 w-full"></div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Trạng thái: Tài sản hợp lệ</p>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 group hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">add</span>
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900 mb-2">Thêm xe yêu thích mới</h3>
                                        <p className="text-xs font-medium text-slate-500">Mở rộng danh sách những chiếc xe bạn đang quan tâm.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}