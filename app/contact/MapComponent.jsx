"use client";
import { useEffect, useRef } from "react";

export default function MapComponent() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Add Leaflet CSS via link tag
    const linkId = "leaflet-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Wait for CSS to load then init map
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Prevent re-initialization
      if (mapInstanceRef.current) return;

      // Fix for default marker icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Create map
      const map = L.map(mapRef.current).setView([-7.9215169, 112.5973649], 15);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add marker
      L.marker([-7.9215169, 112.5973649])
        .addTo(map)
        .bindPopup(
          `<div style="text-align: center;">
            <strong>AI Vision Lab</strong><br/>
            University of Muhammadiyah Malang Campus III<br/>
            Jl. Raya Tlogomas No.246
          </div>`,
        );
    };

    // Small delay to ensure CSS is loaded
    setTimeout(initMap, 100);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-96 rounded-2xl overflow-hidden"
      style={{ height: "400px", width: "100%" }}
    />
  );
}
