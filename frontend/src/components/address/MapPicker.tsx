"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    lat: number;
    lng: number;
    zoom?: number;
    onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, zoom, onChange }: MapPickerProps) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], zoom || map.getZoom());
        }
    }, [lat, lng, zoom, map]);

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return lat && lng ? (
        <Marker
            position={[lat, lng]}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onChange(position.lat, position.lng);
                },
            }}
        />
    ) : null;
}

export default function MapPicker({ lat, lng, zoom, onChange }: MapPickerProps) {
    const center: [number, number] = lat && lng ? [lat, lng] : [10.7769, 106.7009]; // Default to Saigon

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={lat} lng={lng} zoom={zoom} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
