"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in Next.js
// Only run on client to avoid SSR issues
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

interface RideMapProps {
  pickup: [number, number] | null;
  dropoff: [number, number] | null;
  routeGeometry?: [number, number][] | null;
  className?: string;
}

const defaultCenter: [number, number] = [21.028511, 105.804817];

export default function RideMap({ pickup, dropoff, routeGeometry, className }: RideMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(pickup || defaultCenter, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Clear route
    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    if (pickup && customIcon) {
      const pMarker = L.marker(pickup, { icon: customIcon }).addTo(map);
      markersRef.current.push(pMarker);
    }

    if (dropoff && customIcon) {
      const dMarker = L.marker(dropoff, { icon: customIcon }).addTo(map);
      markersRef.current.push(dMarker);
    }

    if (routeGeometry) {
      routeRef.current = L.polyline(routeGeometry, { color: '#2563eb', weight: 5, opacity: 0.8 }).addTo(map);
      map.fitBounds(routeRef.current.getBounds(), { padding: [50, 50] });
    } else if (pickup && dropoff) {
      routeRef.current = L.polyline([pickup, dropoff], { color: '#2563eb', weight: 4, dashArray: '10, 10' }).addTo(map);
      map.fitBounds(routeRef.current.getBounds(), { padding: [50, 50] });
    } else if (pickup) {
      map.setView(pickup, 15);
    } else {
      map.setView(defaultCenter, 13);
    }

  }, [pickup, dropoff, routeGeometry, mounted]);

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
      <div className={`w-full h-full rounded-2xl overflow-hidden z-0 border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center text-slate-400 ${className}`}>
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden z-0 border border-slate-200 shadow-inner ${className}`}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
    </div>
  );
}
