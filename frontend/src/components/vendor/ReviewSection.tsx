"use client";

import React, { useState, useEffect } from "react";
import { Star, ArrowUp, Loader2, User, Trash2 } from "lucide-react";
import http from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";

interface Review {
    id: number;
    content: string;
    rating: number;
    createdAt: string;
    user: {
        id: number;
        username: string;
        avatar: string | null;
    };
}

interface ReviewSectionProps {
    vendorId: number;
}

export default function ReviewSection({ vendorId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        setIsLoggedIn(!!token);
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        
        fetchReviews();
        if (token) {
            fetchUserRating();
        }
    }, [vendorId]);

    const handleDeleteReview = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhận xét này?")) return;

        try {
            await http.delete(`/reviews/${id}`);
            toast.success("Đã xóa nhận xét thành công");
            fetchReviews();
        } catch (error: any) {
            console.error("Error deleting review:", error);
            toast.error(error.response?.data?.message || "Không thể xóa nhận xét");
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await http.get(`/reviews/vendor/${vendorId}`);
            setReviews(data.reviews);
            setAvgRating(data.averageRating);
            setTotalRatings(data.totalRatings);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRating = async () => {
        try {
            const { data } = await http.get(`/reviews/user/rating/${vendorId}`);
            setUserRating(data);
        } catch (error) {
            console.error("Error fetching user rating:", error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setSubmitting(true);
            await http.post("/reviews", {
                targetId: vendorId,
                content: comment
            });
            setComment("");
            fetchReviews();
            // Optional: alert or toast
            toast.success("Bình luận của bạn đã được gửi");
        } catch (error: any) {
            console.error("Error submitting comment:", error);
            toast.error(error.response?.data?.message || "Không thể gửi bình luận");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRate = async (rating: number) => {
        if (!isLoggedIn) {
            toast.error("Vui lòng đăng nhập để đánh giá");
            return;
        }

        try {
            setUserRating(rating);
            await http.post("/reviews", {
                targetId: vendorId,
                rating: rating
            });
            toast.success("Cảm ơn bạn đã đánh giá!");
            fetchReviews();
        } catch (error: any) {
            console.error("Error submitting rating:", error);
            toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
        }
    };

    return (
        <div className="mt-16 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Đánh giá & Nhận xét</h2>
                    <p className="text-slate-500 font-medium">Khách hàng nói gì về nhà cung cấp này</p>
                </div>
                
                <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="text-center">
                        <div className="text-4xl font-black text-slate-900 leading-none mb-1">
                            {totalRatings > 0 ? avgRating.toFixed(1) : "0.0"}
                        </div>
                        <div className="flex justify-center mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-4 h-4 ${totalRatings > 0 && star <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} 
                                />
                            ))}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{totalRatings} lượt đánh giá</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-12">
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-200/50">
                        <h3 className="text-xl font-black text-slate-900 mb-8">Viết đánh giá của bạn</h3>
                        
                        <div className="space-y-8">
                            {/* Star Rating Way 1 */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Mức độ hài lòng</p>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRate(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${
                                                    star <= (hoverRating || userRating) 
                                                        ? "text-yellow-400 fill-yellow-400" 
                                                        : "text-slate-300"
                                                } transition-colors duration-200`} 
                                            />
                                        </button>
                                    ))}
                                    {userRating > 0 && (
                                        <span className="ml-4 text-sm font-bold text-blue-600">Bạn đã đánh giá {userRating} sao</span>
                                    )}
                                </div>
                            </div>

                            {/* Comment Way 2 */}
                            <form onSubmit={handleSubmitComment} className="space-y-4">
                                <p className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Nhận xét chi tiết</p>
                                <div className="relative group">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={isLoggedIn ? "Chia sẻ trải nghiệm của bạn về dịch vụ và sản phẩm..." : "Vui lòng đăng nhập để gửi bình luận"}
                                        disabled={!isLoggedIn || submitting}
                                        className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    />
                                    {isLoggedIn && (
                                        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-slate-400 text-xs font-medium">
                                            {comment.length} ký tự
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button 
                                        disabled={!isLoggedIn || submitting || !comment.trim()}
                                        className="bg-slate-900 hover:bg-black text-white px-8 py-6 rounded-2xl font-bold flex items-center gap-3 transition-all hover:translate-x-1"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                                        Gửi bình luận
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-12 space-y-6">
                    <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Bình luận gần đây</h3>
                    
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin h-8 w-8 text-slate-300" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <p className="text-slate-400 font-medium italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12 border-2 border-slate-50">
                                            <AvatarImage src={review.user.avatar || ""} />
                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold uppercase">
                                                {review.user.username.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-900">{review.user.username}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(review.createdAt).toLocaleString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {currentUser?.id === review.user.id && (
                                                        <button 
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                                            title="Xóa nhận xét"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed underline-offset-4 decoration-slate-200 italic">
                                                "{review.content}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
