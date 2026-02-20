"use client";
/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timer, Search, CarFront, Award, TrendingUp, MapPin, ChevronRight, Gauge } from "lucide-react";

export default function Home() {
  const categories = [
    { name: "Sports Cars", icon: <TrendingUp className="h-8 w-8 text-blue-500" />, count: "124 Live" },
    { name: "Classics", icon: <Award className="h-8 w-8 text-blue-500" />, count: "89 Live" },
    { name: "SUVs & Trucks", icon: <CarFront className="h-8 w-8 text-blue-500" />, count: "215 Live" },
    { name: "Supercars", icon: <Gauge className="h-8 w-8 text-blue-500" />, count: "64 Live" },
  ];

  const liveAuctions = [
    {
      id: 1,
      title: "2019 Porsche 911 GT3 RS",
      subtitle: "4.0L Flat-Six, 7-Speed PDK, 8k Miles",
      image: "https://images.unsplash.com/photo-1503376766444-c6fa713b1945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      currentBid: "$185,000",
      endsIn: "45m",
      bids: 32,
      location: "Miami, FL",
      endingSoon: true,
    },
    {
      id: 2,
      title: "2021 Ford Bronco First Edition",
      subtitle: "2.7L EcoBoost V6, 10-Speed Auto, Sasquatch",
      image: "https://images.unsplash.com/photo-1620023640244-1234c0f862aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      currentBid: "$62,500",
      endsIn: "2h 15m",
      bids: 18,
      location: "Austin, TX",
      endingSoon: true,
    },
    {
      id: 3,
      title: "1994 Toyota Supra Turbo",
      subtitle: "3.0L 2JZ-GTE, 6-Speed Manual, 45k Miles",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      currentBid: "$88,000",
      endsIn: "1d 5h",
      bids: 45,
      location: "Los Angeles, CA",
      endingSoon: false,
    },
    {
      id: 4,
      title: "2022 BMW M5 CS",
      subtitle: "4.4L Twin-Turbo V8, AWD, 3k Miles",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      currentBid: "$115,000",
      endsIn: "2d 12h",
      bids: 21,
      location: "Chicago, IL",
      endingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="relative overflow-hidden bg-gray-900 text-white pb-20 pt-28">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="Premium sports car in studio lighting"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center md:text-left">
            <div className="max-w-3xl">
              <span className="inline-block py-1 px-4 rounded-full bg-blue-600/20 text-blue-400 font-semibold text-sm mb-6 border border-blue-500/30 backdrop-blur-sm">
                The enthusiast car auction platform
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                Buy and Sell <span className="text-blue-500">Cool Cars</span> <br className="hidden md:block" />Online.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
                Curated auctions of premium, classic, and enthusiast vehicles. Verified buyers, transparent history, and a community of auto lovers.
              </p>

              {/* Automotive Search Bar */}
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto md:mx-0 shadow-2xl">
                <div className="flex-1 flex bg-white rounded-xl overflow-hidden shadow-inner">
                  <div className="flex items-center pl-4 text-gray-500">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Make, Model, or Keyword (e.g. Porsche 911)"
                    className="w-full py-4 px-3 text-gray-900 focus:outline-none text-lg"
                  />
                </div>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 px-10 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg">
                  Search
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 justify-center md:justify-start text-sm text-gray-300 font-medium">
                <span className="text-gray-400">Trending:</span>
                <Link href="#" className="hover:text-white transition-colors">Porsche 911</Link>
                <Link href="#" className="hover:text-white transition-colors">BMW M3</Link>
                <Link href="#" className="hover:text-white transition-colors">Ford Bronco</Link>
                <Link href="#" className="hover:text-white transition-colors">JDM Classics</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Live Auctions */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live Auctions
                </h2>
                <p className="text-gray-500 mt-2 font-medium">Bid on these hand-picked vehicles ending soon.</p>
              </div>
              <Link href="/auctions" className="hidden md:flex items-center gap-1 text-blue-600 font-bold hover:text-blue-800 transition-colors">
                View All <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {liveAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group bg-white rounded-2xl flex flex-col">
                  <div className="aspect-[16/11] relative overflow-hidden bg-gray-200">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-lg backdrop-blur-md ${auction.endingSoon ? 'bg-red-600/90 text-white' : 'bg-black/70 text-white'}`}>
                      <Timer className="h-4 w-4" />
                      {auction.endsIn}
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-0 flex-grow">
                    <CardTitle className="text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors">
                      {auction.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium line-clamp-2 mt-2 leading-relaxed">
                      {auction.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{auction.location}</span>
                    </div>

                    <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Bid</p>
                        <p className="text-2xl font-black text-gray-900">{auction.currentBid}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                          {auction.bids} Bids
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 font-bold h-12 rounded-xl" size="lg">
                View All Auctions
              </Button>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="py-20 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Browse By Category</h2>
              <p className="text-gray-500 mt-2">Find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md group">
                  <div className="bg-white p-5 rounded-2xl shadow-sm text-gray-700 group-hover:scale-110 transition-all duration-300 mb-5 border border-gray-50">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                  <p className="text-sm text-blue-600 font-bold mt-2">{cat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-20">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Process</span>
              <h2 className="text-4xl font-extrabold mt-2 mb-4">How AutoBid Works</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">The simplest, safest way to buy and sell premium vehicles online.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-gray-200 rounded-full">
                <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
              </div>

              <div className="relative text-center z-10">
                <div className="w-24 h-24 mx-auto bg-white text-blue-600 border-4 border-blue-100 rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Submit Vehicle</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sellers submit basic details. Our curation team reviews the car and writes an accurate, unbiased description.
                </p>
              </div>

              <div className="relative text-center z-10">
                <div className="w-24 h-24 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl shadow-blue-600/30">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Live Auction</h3>
                <p className="text-gray-600 leading-relaxed">
                  The custom auction goes live. Bidders verify their identity to ensure a safe, community-driven experience.
                </p>
              </div>

              <div className="relative text-center z-10">
                <div className="w-24 h-24 mx-auto bg-white text-gray-900 border-4 border-gray-100 rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Win & Pay</h3>
                <p className="text-gray-600 leading-relaxed">
                  The highest bidder wins! We connect the buyer and seller to securely finalize payment and transport.
                </p>
              </div>
            </div>

            <div className="mt-20 text-center">
              <Link href="/sell">
                <Button size="lg" className="bg-gray-900 hover:bg-black text-white px-12 py-8 text-xl rounded-2xl font-bold shadow-2xl transition-transform hover:-translate-y-1">
                  Start Selling Your Car
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
