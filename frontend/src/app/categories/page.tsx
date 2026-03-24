"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await http.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-surface-container-highest min-h-screen">


      <main className="pt-32 pb-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4 font-headline uppercase italic">Bộ sưu tập xe</h1>
          <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
            Khám phá các mẫu xe hiệu suất cao được tuyển chọn khắt khe, phân chia theo di sản và công nghệ kỹ thuật.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.length === 0 ? (
             <div className="col-span-full h-64 border-2 border-dashed border-outline-variant flex items-center justify-center rounded-3xl">
                <p className="text-on-surface-variant font-bold uppercase tracking-widest">Chưa có mẫu xe nào được định nghĩa</p>
             </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-surface-container-low shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all p-8 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative z-10">
                     <span className="inline-block px-3 py-1 bg-primary text-on-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">Bộ sưu tập</span>
                     <h3 className="text-2xl font-black text-white font-headline uppercase italic leading-none">{cat.name}</h3>
                     <p className="text-white/70 text-sm mt-2 font-medium">Khám phá tất cả xe trong mẫu này</p>
                  </div>
                  <Link href={`/auctions?category=${cat.id}`} className="absolute inset-0 z-20"></Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
