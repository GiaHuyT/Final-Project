"use client";

import React, { useState, useEffect } from "react";
import { Star, ArrowUp, Loader2, Trash2 } from "lucide-react";
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

interface ProductReviewsProps {
    productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
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
    }, [productId]);

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
            const { data } = await http.get(`/reviews/product/${productId}`);
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
            const { data } = await http.get(`/reviews/user/rating/product/${productId}`);
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
                targetId: productId,
                targetType: 'PRODUCT',
                content: comment
            });
            setComment("");
            fetchReviews();
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
            await http.post("/reviews", {
                targetId: productId,
                targetType: 'PRODUCT',
                rating: rating
            });
            setUserRating(rating);
            toast.success("Cảm ơn bạn đã đánh giá!");
            fetchReviews();
        } catch (error: any) {
            console.error("Error submitting rating:", error);
            toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
        }
    };

    return (
        <div className="mt-16 space-y-12 mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline/10 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2 font-headline">Đánh giá & Bình luận</h2>
                    <p className="text-on-surface-variant font-medium">Khách hàng nói gì về chiếc xe này</p>
                </div>
                
                <div className="flex items-center gap-6 bg-surface p-6 rounded-[2rem] shadow-sm border border-outline/10">
                    <div className="text-center">
                        <div className="text-4xl font-black text-on-surface leading-none mb-1 font-headline">
                            {totalRatings > 0 ? avgRating.toFixed(1) : "0.0"}
                        </div>
                        <div className="flex justify-center mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-4 h-4 ${totalRatings > 0 && star <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-outline-variant"}`} 
                                />
                            ))}
                        </div>
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{totalRatings} lượt đánh giá</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-12">
                    <div className="bg-surface-container rounded-[2.5rem] p-8 md:p-10 border border-outline/10">
                        <h3 className="text-xl font-black text-on-surface mb-8 font-headline">Góc chia sẻ</h3>
                        
                        <div className="space-y-8">
                            {/* Star Rating Way 1 */}
                            <div>
                                <p className="text-sm font-bold text-on-surface-variant mb-3 uppercase tracking-wider">Mức độ hài lòng của bạn</p>
                                <p className="text-xs text-on-surface-variant italic mb-4">* Chỉ áp dụng cho khách hàng đã mua xe thành công</p>
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
                                                        : "text-outline-variant"
                                                } transition-colors duration-200`} 
                                            />
                                        </button>
                                    ))}
                                    {userRating > 0 && (
                                        <span className="ml-4 text-sm font-bold text-primary">Bạn đã đánh giá {userRating} sao</span>
                                    )}
                                </div>
                            </div>

                            {/* Comment Way 2 */}
                            <form onSubmit={handleSubmitComment} className="space-y-4">
                                <p className="text-sm font-bold text-on-surface-variant mb-3 uppercase tracking-wider">Bình luận về mẫu xe này</p>
                                <div className="relative group">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={isLoggedIn ? "Mọi người đều có thể để lại bình luận..." : "Vui lòng đăng nhập để gửi bình luận"}
                                        disabled={!isLoggedIn || submitting}
                                        className="w-full min-h-[120px] bg-surface border border-outline/20 rounded-2xl p-6 text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none disabled:bg-surface-variant disabled:cursor-not-allowed"
                                    />
                                    {isLoggedIn && (
                                        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-on-surface-variant text-xs font-medium">
                                            {comment.length} ký tự
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button 
                                        disabled={!isLoggedIn || submitting || !comment.trim()}
                                        className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-6 rounded-2xl font-bold flex items-center gap-3 transition-all hover:translate-x-1 uppercase tracking-widest text-[10px]"
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
                    <h3 className="text-xl font-black text-on-surface mb-4 px-2 font-headline">Bình luận gần đây</h3>
                    
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin h-8 w-8 text-outline-variant" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 bg-surface border-2 border-dashed border-outline/10 rounded-[2rem]">
                            <p className="text-on-surface-variant font-medium italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-surface p-8 rounded-[2.5rem] border border-outline/10 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12 border-2 border-surface">
                                            <AvatarImage src={review.user.avatar || ""} />
                                            <AvatarFallback className="bg-primary-container text-on-primary-container font-bold uppercase">
                                                {review.user.username.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-on-surface">{review.user.username}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
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
                                                            className="text-on-surface-variant hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                                            title="Xóa nhận xét"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-on-surface-variant text-sm leading-relaxed underline-offset-4 decoration-outline/10 italic">
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
