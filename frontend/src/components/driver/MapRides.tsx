"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });
}

const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : null;

// A custom icon for user location
const userIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : null;

interface MapRidesProps {
    rides: any[];
    userLocation: [number, number] | null;
    onMarkerClick: (rideId: number) => void;
}

const defaultCenter: [number, number] = [21.028511, 105.804817];

export default function MapRides({ rides, userLocation, onMarkerClick }: MapRidesProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(userLocation || defaultCenter, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Remove existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    if (userLocation && userIcon) {
      const uMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
      uMarker.bindPopup('<div class="font-semibold text-center">Vị trí của bạn</div>');
      markersRef.current.push(uMarker);
      map.setView(userLocation, 13);
    }

    if (customIcon) {
      rides.forEach(ride => {
        const lat = ride.pickupLat || ((userLocation?.[0] || defaultCenter[0]) + (Math.random() - 0.5) * 0.05);
        const lng = ride.pickupLng || ((userLocation?.[1] || defaultCenter[1]) + (Math.random() - 0.5) * 0.05);
        
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        
        const popupDiv = document.createElement('div');
        popupDiv.className = "p-1 min-w-[150px]";
        
        const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ride.totalPrice || 0);
        
        popupDiv.innerHTML = `
          <div class="font-bold text-slate-800">${ride.customer?.username || 'Khách hàng'}</div>
          <div class="text-xs text-slate-500 mb-2 line-clamp-2">${ride.pickupAddress || 'Đang cập nhật'}</div>
          <div class="font-semibold text-emerald-600 mb-2">${priceFormatted}</div>
          <button class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs py-1.5 font-medium transition-colors">Xem chi tiết</button>
        `;
        
        popupDiv.querySelector('button')?.addEventListener('click', (e) => {
          e.stopPropagation();
          onMarkerClick(ride.id);
        });

        marker.bindPopup(popupDiv);
        markersRef.current.push(marker);
      });
    }

  }, [rides, userLocation, mounted, onMarkerClick]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden z-0 border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center text-slate-400">
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0">
      <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
    </div>
  );
}
