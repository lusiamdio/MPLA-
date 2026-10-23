import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PartyEvent } from "../types";
import { Compass, Navigation, Filter } from "lucide-react";

interface EventsMapProps {
  events: PartyEvent[];
  memberId: string;
  onRegisterEvent: (eventId: string) => void;
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string | null) => void;
}

export default function EventsMap({
  events,
  memberId,
  onRegisterEvent,
  selectedEventId,
  onSelectEvent
}: EventsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [provinceFilter, setProvinceFilter] = useState<string>("All");
  const [organizerFilter, setOrganizerFilter] = useState<string>("All");

  const filteredEvents = events.filter(e => {
    if (provinceFilter !== "All" && e.province !== provinceFilter) return false;
    if (organizerFilter !== "All" && e.organizer !== organizerFilter) return false;
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered over SADC / Southern Africa
      const map = L.map(mapContainerRef.current, {
        center: [-28.5, 24.5],
        zoom: 5,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MPLA CAPE',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    filteredEvents.forEach(evt => {
      if (!evt.lat || !evt.lng) return;

      const isReg = evt.registeredMemberIds?.includes(memberId);
      const isUpcoming = evt.status === "Upcoming";
      const pinColor = evt.organizer === "National" ? "#C8102E" : "#D4AF37";
      const badgeText = evt.organizer === "National" ? "NAC" : "PROV";

      const customIcon = L.divIcon({
        className: "custom-event-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background-color: ${pinColor}; color: white; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 10px; font-family: monospace; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span>${badgeText}</span>
              ${isReg ? '<span style="color: #34d399; font-weight: 900;">✓</span>' : isUpcoming ? '<span style="width: 6px; height: 6px; background-color: #34d399; border-radius: 50%; display: inline-block;"></span>' : ''}
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${pinColor}; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [60, 36],
        iconAnchor: [30, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([evt.lat, evt.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = document.createElement("div");
      popupHtml.className = "p-2 space-y-2 text-left min-w-[200px]";
      popupHtml.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span class="text-[9px] font-mono font-bold uppercase text-[#C8102E] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
            Comité ${evt.organizer}
          </span>
          <span class="text-[9px] font-mono font-bold text-slate-500">${evt.province || "SADC"}</span>
        </div>
        <h5 class="font-bold text-xs text-slate-900 leading-snug">${evt.title}</h5>
        <p class="text-[10px] text-slate-600">${evt.venue || evt.location}</p>
        <div class="text-[10px] text-slate-500 font-mono">
          📅 ${new Date(evt.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div class="pt-1">
          <button id="btn-map-reg-${evt.id}" class="w-full py-1.5 ${isReg ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#C8102E] hover:bg-red-700'} text-white font-bold text-[10px] rounded-lg transition cursor-pointer">
            ${isReg ? '✓ Inscrição Confirmada' : 'Confirmar Presença'}
          </button>
        </div>
      `;

      // Attach registration button event listener
      const btn = popupHtml.querySelector(`#btn-map-reg-${evt.id}`);
      if (btn) {
        btn.addEventListener("click", () => {
          onRegisterEvent(evt.id);
        });
      }

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        if (onSelectEvent) onSelectEvent(evt.id);
      });

      markersRef.current[evt.id] = marker;
      bounds.extend([evt.lat, evt.lng]);
    });

    if (filteredEvents.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [filteredEvents, memberId]);

  // Handle selected event focus
  useEffect(() => {
    if (!selectedEventId || !mapInstanceRef.current) return;
    const evt = events.find(e => e.id === selectedEventId);
    if (evt && evt.lat && evt.lng) {
      const map = mapInstanceRef.current;
      map.flyTo([evt.lat, evt.lng], 12, { duration: 1.2 });
      const marker = markersRef.current[evt.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedEventId, events]);

  const resetView = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([]);
    filteredEvents.forEach(e => {
      if (e.lat && e.lng) bounds.extend([e.lat, e.lng]);
    });
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else {
      mapInstanceRef.current.setView([-28.5, 24.5], 5);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-[#C8102E] rounded-xl border border-red-100">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
              Mapa Interativo de Localização dos Eventos
              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                SADC & Diáspora
              </span>
            </h3>
            <p className="text-xs text-slate-500">Navegue pelas assembleias e plenários no mapa geográfico. Clique nos marcadores para detalhes e inscrição.</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">Todas as Províncias</option>
              <option value="Gauteng">Gauteng</option>
              <option value="Western Cape">Western Cape</option>
              <option value="Luanda">Luanda</option>
            </select>
          </div>

          <button
            onClick={resetView}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Ajustar mapa"
          >
            <Navigation className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Centrar</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-[380px] z-0" />

        {/* Quick Pin Legend Overlay */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-md text-[10px] font-mono space-y-1.5 z-10">
          <div className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">Legenda dos Eventos</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E]" />
            <span className="text-slate-600 font-medium">Evento Nacional</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-600 font-medium">Evento Provincial / Local</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-600 font-medium">Inscrição Activa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
