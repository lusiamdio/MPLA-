import React, { useState } from "react";
import { 
  Globe, Layout, Megaphone, Calendar, Users, MapPin, 
  Edit3, Plus, Trash2, Check, RefreshCw, AlertTriangle, 
  Eye, Save, CheckCircle, Sparkles, Image, Shield, FileText, ChevronRight
} from "lucide-react";
import { Announcement, PartyEvent } from "../types";

export interface LeadershipMember {
  id: string;
  name: string;
  role_pt: string;
  role_en: string;
  committee: string;
  bio_pt: string;
  bio_en: string;
  speech_pt: string;
  speech_en: string;
  photo: string;
}

export interface WebsiteCMSConfig {
  heroTitlePT: string;
  heroTitleEN: string;
  heroSubtitlePT: string;
  heroSubtitleEN: string;
  tickerTextPT: string;
  tickerTextEN: string;
  emergencyAlertPT: string;
  emergencyAlertEN: string;
  emergencyActive: boolean;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  heroImageUrl: string;
}

export interface MapProvinceStat {
  name: string;
  members: string;
  caps: number;
  projects: string;
}

interface AdminWebsiteCMSProps {
  announcements: Announcement[];
  events: PartyEvent[];
  websiteConfig: WebsiteCMSConfig;
  leadership: LeadershipMember[];
  mapStats: Record<string, MapProvinceStat>;
  onUpdateWebsiteConfig: (newConfig: Partial<WebsiteCMSConfig>) => void;
  onCreateAnnouncement: (ann: Omit<Announcement, "id" | "date">) => void;
  onUpdateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onCreateEvent: (evt: Omit<PartyEvent, "id" | "registeredCount" | "registeredMemberIds">) => void;
  onUpdateEvent: (id: string, evt: Partial<PartyEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateLeadership: (leadership: LeadershipMember[]) => void;
  onUpdateMapStats: (mapStats: Record<string, MapProvinceStat>) => void;
}

export default function AdminWebsiteCMS({
  announcements,
  events,
  websiteConfig,
  leadership,
  mapStats,
  onUpdateWebsiteConfig,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onUpdateLeadership,
  onUpdateMapStats
}: AdminWebsiteCMSProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "news" | "events" | "leadership" | "map">("hero");

  // Local form state for Website Config Hero & Banners
  const [heroForm, setHeroForm] = useState<WebsiteCMSConfig>({ ...websiteConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // News Modal / Form State
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    source: "National" as "National" | "Regional" | "Local",
    author: "Comissão de Comunicação MPLA",
    category: "News" as "Campaign" | "News" | "Press Release" | "Notice" | "Emergency"
  });

  // Events Form State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    location: "Sede do Comité do MPLA, Cape Town",
    organizer: "National" as "National" | "Provincial" | "Municipal" | "Local",
    capacity: 200,
    status: "Upcoming" as "Upcoming" | "Completed" | "Cancelled"
  });

  // Leadership Edit State
  const [editingLeader, setEditingLeader] = useState<LeadershipMember | null>(null);
  const [showLeaderModal, setShowLeaderModal] = useState(false);

  // Map Province Stat Editing
  const [localMapStats, setLocalMapStats] = useState<Record<string, MapProvinceStat>>({ ...mapStats });

  const handleSaveHeroConfig = () => {
    onUpdateWebsiteConfig(heroForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenNewsCreate = () => {
    setEditingNewsId(null);
    setNewsForm({
      title: "",
      content: "",
      source: "National",
      author: "Comissão de Comunicação MPLA",
      category: "News"
    });
    setShowNewsModal(true);
  };

  const handleOpenNewsEdit = (ann: Announcement) => {
    setEditingNewsId(ann.id);
    setNewsForm({
      title: ann.title,
      content: ann.content,
      source: ann.source,
      author: ann.author,
      category: ann.category
    });
    setShowNewsModal(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNewsId) {
      onUpdateAnnouncement(editingNewsId, newsForm);
    } else {
      onCreateAnnouncement(newsForm);
    }
    setShowNewsModal(false);
  };

  const handleOpenEventCreate = () => {
    setEditingEventId(null);
    setEventForm({
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 16),
      location: "Sede do Comité do MPLA, Cape Town",
      organizer: "National",
      capacity: 200,
      status: "Upcoming"
    });
    setShowEventModal(true);
  };

  const handleOpenEventEdit = (evt: PartyEvent) => {
    setEditingEventId(evt.id);
    setEventForm({
      title: evt.title,
      description: evt.description,
      date: evt.date.slice(0, 16),
      location: evt.location,
      organizer: evt.organizer,
      capacity: evt.capacity,
      status: evt.status
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      onUpdateEvent(editingEventId, eventForm);
    } else {
      onCreateEvent(eventForm);
    }
    setShowEventModal(false);
  };

  const handleSaveLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeader) return;
    const exists = leadership.some(l => l.id === editingLeader.id);
    let updated: LeadershipMember[];
    if (exists) {
      updated = leadership.map(l => l.id === editingLeader.id ? editingLeader : l);
    } else {
      updated = [...leadership, editingLeader];
    }
    onUpdateLeadership(updated);
    setShowLeaderModal(false);
    setEditingLeader(null);
  };

  const handleDeleteLeader = (id: string) => {
    if (confirm("Tem certeza que deseja remover este membro da comissão executiva do site público?")) {
      onUpdateLeadership(leadership.filter(l => l.id !== id));
    }
  };

  const handleSaveMapStats = () => {
    onUpdateMapStats(localMapStats);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8" id="admin-website-cms">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 rounded-2xl border border-slate-700 shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-[#FFCC00] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFCC00] bg-red-900/60 px-2.5 py-0.5 rounded-full border border-red-700/50">
              CMS do Site Público & Landing Page
            </span>
          </div>
          <h2 className="text-xl font-display font-black tracking-tight">Gestão Integral da Página Inicial e Conteúdos</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Controlo em tempo real de notícias, avisos urgentes, eventos oficiais, membros do comité executivo e métricas do mapa interativo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
              window.location.hash = "public-site";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#FFCC00]" />
            Ver Portal Público
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs font-bold">
        {[
          { key: "hero", label: "Banners & Títulos Principais", icon: Layout },
          { key: "news", label: "Notícias & Comunicados", badge: announcements.length, icon: Megaphone },
          { key: "events", label: "Eventos & Mobilizações", badge: events.length, icon: Calendar },
          { key: "leadership", label: "Comissão Executiva", badge: leadership.length, icon: Users },
          { key: "map", label: "Mapa Interativo do Cape", icon: MapPin }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 border-b-2 font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === tab.key
                ? "border-[#C8102E] text-[#C8102E] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: HERO & BANNERS */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Configuração da Título Hero, Ticker & Banners</h3>
              <p className="text-xs text-slate-500 mt-0.5">Edite o texto de apresentação, o ticker de notícias de topo e alertas de emergência.</p>
            </div>
            {saveSuccess && (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 font-mono animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Alterações Salvas no Site!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título Principal Hero (Português)</label>
                <input 
                  type="text" 
                  value={heroForm.heroTitlePT}
                  onChange={e => setHeroForm({ ...heroForm, heroTitlePT: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo Hero (Português)</label>
                <textarea 
                  rows={3}
                  value={heroForm.heroSubtitlePT}
                  onChange={e => setHeroForm({ ...heroForm, heroSubtitlePT: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Texto Ticker de Topo (Broadcasting)</label>
                <input 
                  type="text" 
                  value={heroForm.tickerTextPT}
                  onChange={e => setHeroForm({ ...heroForm, tickerTextPT: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Imagem de Fundo Hero (URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={heroForm.heroImageUrl}
                    onChange={e => setHeroForm({ ...heroForm, heroImageUrl: e.target.value })}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
                {heroForm.heroImageUrl && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                    <img src={heroForm.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-2 text-[9px] bg-black/60 text-white font-mono px-2 py-0.5 rounded">Pré-visualização</span>
                  </div>
                )}
              </div>

              {/* Emergency Banner Toggle */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Alerta de Emergência / Comunicado Especial
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={heroForm.emergencyActive}
                      onChange={e => setHeroForm({ ...heroForm, emergencyActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8102E]" />
                  </label>
                </div>

                <input 
                  type="text" 
                  placeholder="Texto da barra de aviso urgente no topo do site..."
                  value={heroForm.emergencyAlertPT}
                  onChange={e => setHeroForm({ ...heroForm, emergencyAlertPT: e.target.value })}
                  className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Email de Contacto</label>
                  <input 
                    type="text"
                    value={heroForm.contactEmail}
                    onChange={e => setHeroForm({ ...heroForm, contactEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Telefone Principal</label>
                  <input 
                    type="text"
                    value={heroForm.contactPhone}
                    onChange={e => setHeroForm({ ...heroForm, contactPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveHeroConfig}
              className="px-6 py-3 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-red-200 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Publicar Alterações no Site
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: NEWS & ANNOUNCEMENTS CMS */}
      {activeTab === "news" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Notícias, Comunicados e Publicações Públicas</h3>
              <p className="text-xs text-slate-500 mt-0.5">Gerencie os comunicados oficiais exibidos aos militantes e visitantes na landing page.</p>
            </div>
            <button
              onClick={handleOpenNewsCreate}
              className="px-4 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nova Notícia / Comunicado
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                      ann.category === "Emergency"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : ann.category === "Campaign"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Fonte: {ann.source} • {ann.date}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">• Por {ann.author}</span>
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-sm">{ann.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenNewsEdit(ann)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition"
                    title="Editar Notícia"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Remover esta notícia do site público?")) {
                        onDeleteAnnouncement(ann.id);
                      }
                    }}
                    className="p-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                    title="Remover Notícia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVENTS CMS */}
      {activeTab === "events" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Calendário de Eventos Públicos e Reuniões</h3>
              <p className="text-xs text-slate-500 mt-0.5">Agende cimeiras, seminários e assembleias com contagem decrescente e inscrições.</p>
            </div>
            <button
              onClick={handleOpenEventCreate}
              className="px-4 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Agendar Novo Evento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div key={evt.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase bg-red-50 text-[#C8102E] px-2.5 py-0.5 rounded-md border border-red-100">
                      {evt.organizer} • {evt.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Lotação: {evt.registeredCount}/{evt.capacity}</span>
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-sm">{evt.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{evt.description}</p>
                  <div className="pt-2 text-[11px] text-slate-500 font-mono space-y-1">
                    <p>📅 {new Date(evt.date).toLocaleString()}</p>
                    <p>📍 {evt.location}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleOpenEventEdit(evt)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Eliminar este evento do sistema?")) {
                        onDeleteEvent(evt.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTIVE COMMITTEE & LEADERSHIP CMS */}
      {activeTab === "leadership" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Comissão Executiva do Comité do MPLA em Cape Town</h3>
              <p className="text-xs text-slate-500 mt-0.5">Gerencie os secretários e dirigentes apresentados no site público.</p>
            </div>
            <button
              onClick={() => {
                setEditingLeader({
                  id: `ldr-${Date.now()}`,
                  name: "",
                  role_pt: "Secretário de Comissão",
                  role_en: "Committee Secretary",
                  committee: "national",
                  bio_pt: "",
                  bio_en: "",
                  speech_pt: "",
                  speech_en: "",
                  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop"
                });
                setShowLeaderModal(true);
              }}
              className="px-4 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Adicionar Novo Dirigente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadership.map((ldr) => (
              <div key={ldr.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#C8102E] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase">
                      COMITÉ {ldr.committee.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">Oficial Activo</span>
                  </div>
                  <h4 className="font-display font-black text-slate-900 text-sm truncate">{ldr.name}</h4>
                  <p className="text-[10px] font-mono font-bold text-[#C8102E] leading-tight">{ldr.role_pt}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{ldr.bio_pt}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setEditingLeader({ ...ldr });
                      setShowLeaderModal(true);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    Editar Dados
                  </button>
                  <button
                    onClick={() => handleDeleteLeader(ldr.id)}
                    className="p-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MAP & PROVINCES STATS */}
      {activeTab === "map" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Métricas e Projetos por Província (Mapa Interativo)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Atualize a contagem de militantes, células ativas e projetos comunitários para as províncias da África do Sul.</p>
            </div>
            {saveSuccess && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3.5 h-3.5" /> Salvo!
              </span>
            )}
          </div>

          <div className="space-y-6">
            {Object.keys(localMapStats).map((provKey) => {
              const item = localMapStats[provKey];
              return (
                <div key={provKey} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C8102E]" />
                      {provKey}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">Dados do Mapa Vivo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Total de Militantes Recenseados</label>
                      <input 
                        type="text" 
                        value={item.members}
                        onChange={e => {
                          setLocalMapStats({
                            ...localMapStats,
                            [provKey]: { ...item, members: e.target.value }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Células Ativas</label>
                      <input 
                        type="number" 
                        value={item.caps}
                        onChange={e => {
                          setLocalMapStats({
                            ...localMapStats,
                            [provKey]: { ...item, caps: parseInt(e.target.value) || 0 }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Projetos Comunitários Ativos</label>
                      <input 
                        type="text" 
                        value={item.projects}
                        onChange={e => {
                          setLocalMapStats({
                            ...localMapStats,
                            [provKey]: { ...item, projects: e.target.value }
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveMapStats}
                className="px-6 py-3 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Dados do Mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEWS FORM */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base">
              {editingNewsId ? "Editar Notícia / Comunicado" : "Nova Publicação"}
            </h3>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Publicação</label>
                <input 
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newsForm.category}
                    onChange={e => setNewsForm({ ...newsForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="News">Notícia</option>
                    <option value="Campaign">Campanha</option>
                    <option value="Press Release">Comunicado Oficial</option>
                    <option value="Notice">Aviso</option>
                    <option value="Emergency">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fonte / Âmbito</label>
                  <select
                    value={newsForm.source}
                    onChange={e => setNewsForm({ ...newsForm, source: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="National">Nacional</option>
                    <option value="Regional">Regional</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Conteúdo Completo</label>
                <textarea 
                  rows={5}
                  required
                  value={newsForm.content}
                  onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVENT FORM */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base">
              {editingEventId ? "Editar Evento Oficial" : "Agendar Novo Evento"}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Evento</label>
                <input 
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição e Objetivos</label>
                <textarea 
                  rows={3}
                  required
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data e Hora</label>
                  <input 
                    type="datetime-local"
                    required
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lotação Máxima</label>
                  <input 
                    type="number"
                    required
                    value={eventForm.capacity}
                    onChange={e => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 100 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Localização / Salão</label>
                <input 
                  type="text"
                  required
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LEADERSHIP FORM */}
      {showLeaderModal && editingLeader && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-slate-900 text-base">
              Editar Perfil do Dirigente da Comissão
            </h3>

            <form onSubmit={handleSaveLeader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={editingLeader.name}
                  onChange={e => setEditingLeader({ ...editingLeader, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cargo (Português)</label>
                <input 
                  type="text"
                  required
                  value={editingLeader.role_pt}
                  onChange={e => setEditingLeader({ ...editingLeader, role_pt: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biografia Curta (Português)</label>
                <textarea 
                  rows={3}
                  required
                  value={editingLeader.bio_pt}
                  onChange={e => setEditingLeader({ ...editingLeader, bio_pt: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem / Discurso e Contactos (Português)</label>
                <textarea 
                  rows={2}
                  value={editingLeader.speech_pt}
                  onChange={e => setEditingLeader({ ...editingLeader, speech_pt: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Foto Oficial (URL)</label>
                <input 
                  type="text"
                  required
                  value={editingLeader.photo}
                  onChange={e => setEditingLeader({ ...editingLeader, photo: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaderModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
