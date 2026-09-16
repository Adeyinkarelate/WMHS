"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { formatDistance, mapsDirectionsUrl } from "@/lib/utils/haversine";

export type MapFacility = {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  emergencyAvailable: boolean;
  locationLat: number;
  locationLng: number;
  distanceKm?: number | null;
};

type Origin = { lat: number; lng: number };

export function FacilityMap({
  facilities,
  origin,
}: {
  facilities: MapFacility[];
  origin?: Origin | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current || facilities.length === 0) return;
    const host = hostRef.current;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    async function draw() {
      const leaflet = await import("leaflet");
      const L = leaflet.default ?? leaflet;
      if (cancelled || !host.isConnected) return;

      const pins: Array<{ lat: number; lng: number }> = facilities.map((f) => ({
        lat: f.locationLat,
        lng: f.locationLng,
      }));
      if (origin) pins.push(origin);

      const center = origin ?? pins[0] ?? { lat: 9.08, lng: 8.68 };
      map = L.map(host, { scrollWheelZoom: false, zoomControl: true }).setView([center.lat, center.lng], 7);
      if (cancelled) {
        map.remove();
        map = null;
        return;
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      if (origin) {
        L.marker([origin.lat, origin.lng], {
          icon: pinIcon(L, "#2f6f5e", "You"),
          title: "Saved location",
        })
          .addTo(map)
          .bindPopup("<strong>Your saved location</strong>");
        bounds.extend([origin.lat, origin.lng]);
      }

      for (const facility of facilities) {
        const color = facility.emergencyAvailable ? "#b42318" : "#1a56b0";
        const distance =
          typeof facility.distanceKm === "number" ? `<p>${formatDistance(facility.distanceKm)}</p>` : "";
        const emergency = facility.emergencyAvailable ? "<p>Emergency care on site</p>" : "";
        const href = mapsDirectionsUrl(
          { lat: facility.locationLat, lng: facility.locationLng },
          origin
        );
        L.marker([facility.locationLat, facility.locationLng], {
          icon: pinIcon(L, color, facility.emergencyAvailable ? "E" : "F"),
          title: facility.name,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(facility.name)}</strong>
             <p>${escapeHtml(facility.address)}</p>
             ${distance}${emergency}
             <p>${escapeHtml(facility.contactPhone)}</p>
             <p><a href="${href}" target="_blank" rel="noreferrer">Directions</a></p>`
          );
        bounds.extend([facility.locationLat, facility.locationLng]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
      }
      requestAnimationFrame(() => map?.invalidateSize());
      setTimeout(() => map?.invalidateSize(), 150);
    }

    void draw();

    return () => {
      cancelled = true;
      map?.remove();
      map = null;
    };
  }, [facilities, origin]);

  if (facilities.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div ref={hostRef} className="facility-map h-72 w-full sm:h-96" />
      <p className="border-t border-line px-4 py-2 text-caption text-ink-muted">
        Red pins are emergency-capable. Blue pins are other facilities.
        {origin ? " Green is your saved location." : ""} Use Directions for turn-by-turn maps.
      </p>
    </div>
  );
}

function pinIcon(L: typeof import("leaflet"), color: string, label: string) {
  return L.divIcon({
    className: "wmhs-pin",
    html: `<span class="wmhs-pin-dot" style="background:${color}">${escapeHtml(label)}</span>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -32],
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
