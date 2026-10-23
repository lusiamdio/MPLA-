import React, { useState, useEffect } from "react";
import { 
  Member, Announcement, PartyEvent, LearningCourse, 
  SupportTicket, ChatChannel, SystemAuditLog, InventoryStats,
  AdminNotification
} from "./types";

// Import custom components
import DigitalCard from "./components/DigitalCard";
import MemberDashboard from "./components/MemberDashboard";
import MemberProfile from "./components/MemberProfile";
import MemberTickets from "./components/MemberTickets";
import MemberEvents from "./components/MemberEvents";
import AdminDashboard from "./components/AdminDashboard";
import AdminCardCentre from "./components/AdminCardCentre";
import AdminAICentre from "./components/AdminAICentre";
import AdminExecutiveCentre from "./components/AdminExecutiveCentre";
import AdminIntegrationCentre from "./components/AdminIntegrationCentre";
import AdminPaymentManagement from "./components/AdminPaymentManagement";
import AdminSystemCentre from "./components/AdminSystemCentre";
import AdminWebsiteCMS, { WebsiteCMSConfig, LeadershipMember, MapProvinceStat } from "./components/AdminWebsiteCMS";
import AuthPortal from "./components/AuthPortal";
import MemberPortalViews from "./components/MemberPortalViews";
import PublicWebsite from "./components/PublicWebsite";
import CardVerificationScanner from "./components/CardVerificationScanner";
import { LOCAL_MPLA_PARTY_LOGO } from "./images";

import { 
  Award, ShieldCheck, User, Sparkles, LogOut, CheckCircle2, 
  ChevronRight, Calendar, Compass, Layers, Bot, MessageSquare,
  BarChart3, Network, Settings, CreditCard, FileText, DollarSign, 
  Newspaper, Users, MapPin, HelpCircle, Phone, LifeBuoy, Globe,
  Target, Gift, QrCode
} from "lucide-react";

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"member" | "admin" | null>(null);
  const [activeView, setActiveView] = useState<"website" | "auth">("website");
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signin");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Global Role / Portal Selection
  const [currentPortal, setCurrentPortal] = useState<"member" | "admin">("member");

  // Member Portal active tab
  const [memberTab, setMemberTab] = useState<string>("dashboard");
  // Admin Portal active tab
  const [adminTab, setAdminTab] = useState<"dashboard" | "cms" | "finance" | "cards" | "ai" | "executive" | "integrations" | "system">("dashboard");

  // CMS & Public Site Management States
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteCMSConfig>({
    heroTitlePT: "Comité do MPLA CAPE",
    heroTitleEN: "MPLA CAPE Committee",
    heroSubtitlePT: "Unidade, Acção e Progresso ao Serviço da Comunidade Angolana no MPLA CAPE",
    heroSubtitleEN: "Unity, Action and Progress in Service of the Angolan Community at MPLA CAPE",
    tickerTextPT: "• Recenseamento de Militantes no MPLA CAPE (Cidade do Cabo, África do Sul e regiões conexas) • Emissão de Cartão Digital de Militante com QR Code e Chip NFC • Apoio Consular e Integração Social •",
    tickerTextEN: "• Member Census at MPLA CAPE (Cape Town, South Africa and surrounding regions) • Digital Membership Card Issuance • Consular Support & Social Integration •",
    emergencyAlertPT: "AVISO URGENTE: Atendimento Presencial e Digital para Atualização de Dados de Militantes no Comité do MPLA CAPE de Segunda a Sexta das 09h às 16h.",
    emergencyAlertEN: "URGENT NOTICE: In-Person & Digital Member Registry Updates at MPLA CAPE Committee Offices Mon-Fri 09:00 - 16:00.",
    emergencyActive: true,
    contactEmail: "contacto@mplacape.ao",
    contactPhone: "+244 923 000 000 / +27 21 444 8899",
    officeAddress: "Sede Central do MPLA CAPE",
    heroImageUrl: "https://cdn.dailymaverick.co.za/dailymaverick/wp-content/uploads/2022/01/000_9D84GG-1.jpg"
  });
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [mapStats, setMapStats] = useState<Record<string, MapProvinceStat>>({});

  // Mock Global State representing our in-memory database
  const [member, setMember] = useState<Member>({
    id: "m-1",
    membershipNo: "MP-2026-2243",
    fullName: "Simao",
    nationalId: "9603125089081",
    mobile: "+27 82 123 4567",
    email: "simao.lusimadio@gmail.com",
    dob: "1996-03-12",
    gender: "Male",
    maritalStatus: "Single",
    emergencyContact: {
      name: "Maria Lusimadio",
      phone: "+27 82 987 6543"
    },
    occupation: "Software Engineer",
    employer: "Tech Corp",
    education: "BSc Computer Science",
    province: "Gauteng",
    municipality: "City of Johannesburg",
    committee: "Ward 117 Local Committee",
    category: "General",
    membershipLevel: "Standard",
    leadershipRoles: ["Ward Representative", "Campaign Captain"],
    registrationDate: "2021-04-12",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    status: "Active",
    outstandingBalance: 120,
    paymentHistory: [
      { id: "tx_1", date: "2026-01-05", amount: 120, purpose: "Annual Membership Subscription 2026", status: "Paid" },
      { id: "tx_2", date: "2025-01-10", amount: 100, purpose: "Annual Membership Subscription 2025", status: "Paid" }
    ],
    completedCourses: ["pilar-1"],
    physicalCardStatus: "Approved",
    physicalCardEstDate: "2026-07-25",
    registeredEvents: ["e-2"],
    votedPolls: { "p-1": "Strongly Agree" },
    bio: "Militante ativo do MPLA empenhado no desenvolvimento tecnológico, inclusão cívica e fortalecimento da comunidade angolana na África do Sul.",
    skills: ["Liderança Comunitária", "Desenvolvimento Web", "Comunicação Estratégica", "Mobilização de Quadros"],
    interests: ["Tecnologia & Inovação", "Ação Social Comunitária", "Juventude & Formação Política", "Relações Diplomáticas"],
    socialLinks: {
      linkedin: "https://linkedin.com/in/simao-lusimadio",
      twitter: "https://x.com/simao_mpla",
      facebook: "https://facebook.com/simao.lusimadio",
      instagram: "https://instagram.com/simao.lusimadio",
      github: "https://github.com/simao-lusimadio",
      website: "https://simaolusimadio.org"
    },
    visibilitySettings: {
      bio: "public",
      skills: "public",
      interests: "members",
      socialLinks: "public",
      email: "members",
      mobile: "private",
      occupation: "public"
    }
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<PartyEvent[]>([]);
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [inventory, setInventory] = useState<InventoryStats>({
    blankCards: 4820,
    printersStatus: 'Online',
    inkPercent: 78,
    ribbonPercent: 62,
    packagingEnvelopes: 12050,
    holograms: 4200
  });

  // Fetch initial database state from Node/Express server backend
  const fetchAllData = async () => {
    try {
      const chatFetchPromise = member?.id 
        ? fetch(`/api/chats/${member.id}`)
        : Promise.resolve(new Response(JSON.stringify([])));

      const [
        resM, resA, resE, resC, resP, resT, resCh, resL, resI, resN,
        resW, resLdr, resMap
      ] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/announcements"),
        fetch("/api/events"),
        fetch("/api/courses"),
        fetch("/api/polls"),
        fetch("/api/tickets"),
        chatFetchPromise,
        fetch("/api/audit-logs"),
        fetch("/api/inventory"),
        fetch("/api/admin/notifications"),
        fetch("/api/admin/website-config"),
        fetch("/api/admin/leadership"),
        fetch("/api/admin/map-stats")
      ]);

      const dataM = resM.ok ? await resM.json() : [];
      const dataA = resA.ok ? await resA.json() : [];
      const dataE = resE.ok ? await resE.json() : [];
      const dataC = resC.ok ? await resC.json() : [];
      const dataP = resP.ok ? await resP.json() : [];
      const dataT = resT.ok ? await resT.json() : [];
      const dataCh = resCh.ok ? await resCh.json() : [];
      const dataL = resL.ok ? await resL.json() : [];
      const dataI = resI.ok ? await resI.json() : null;
      const dataN = resN.ok ? await resN.json() : [];

      if (resW.ok) setWebsiteConfig(await resW.json());
      if (resLdr.ok) setLeadership(await resLdr.json());
      if (resMap.ok) setMapStats(await resMap.json());

      if (Array.isArray(dataM)) {
        setMembers(dataM);
        if (member?.id) {
          const active = dataM.find((m: any) => m.id === member.id || m.email === member.email);
          if (active) {
            setMember(active);
          }
        }
      }
      if (Array.isArray(dataA)) setAnnouncements(dataA);
      if (Array.isArray(dataE)) setEvents(dataE);
      if (Array.isArray(dataC)) setCourses(dataC);
      if (Array.isArray(dataP)) setPolls(dataP);
      if (Array.isArray(dataT)) setTickets(dataT);
      if (Array.isArray(dataCh)) setChatChannels(dataCh);
      if (Array.isArray(dataL)) setAuditLogs(dataL);
      if (Array.isArray(dataN)) setAdminNotifications(dataN);
      if (dataI && typeof dataI === "object" && !dataI.error) setInventory(dataI);
    } catch (e) {
      console.error("Error fetching full database state: ", e);
    }
  };

  // CMS Handlers
  const handleUpdateWebsiteConfig = async (newConfig: Partial<WebsiteCMSConfig>) => {
    try {
      const res = await fetch("/api/admin/website-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAnnouncement = async (ann: Omit<Announcement, "id" | "date">) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ann)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAnnouncement = async (id: string, ann: Partial<Announcement>) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ann)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEvent = async (evt: Omit<PartyEvent, "id" | "registeredCount" | "registeredMemberIds">) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evt)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateEvent = async (id: string, evt: Partial<PartyEvent>) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evt)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLeadership = async (newLeadership: LeadershipMember[]) => {
    try {
      const res = await fetch("/api/admin/leadership", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadership)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMapStats = async (newMapStats: Record<string, MapProvinceStat>) => {
    try {
      const res = await fetch("/api/admin/map-stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMapStats)
      });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Initial fetch on mount for all public & portal data
    fetchAllData();

    // Re-synchronize when user returns to window/tab
    const handleFocus = () => {
      fetchAllData();
    };
    window.addEventListener("focus", handleFocus);

    // Continuous real-time background synchronization between Member and Super Admin
    const syncInterval = setInterval(() => {
      if (!document.hidden) {
        fetchAllData();
      }
    }, 10000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(syncInterval);
    };
  }, [member.id, isAuthenticated]);

  // Update member locally & post update to server
  const handleUpdateMember = async (id: string, updatedData: Partial<Member>) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateInventory = async (updatedInv: Partial<InventoryStats>) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInv)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Profile management submission
  const handleUpdateProfile = (updatedData: Partial<Member>) => {
    handleUpdateMember(member.id, updatedData);
  };

  // Poll Voting
  const handleCastVote = async (pollId: string, option: string) => {
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, option })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Payment Processing
  const handleMakePayment = async (amount: number, purpose: string, method: string) => {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, amount, method, purpose })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ticket submission
  const handleNewTicketSubmit = async (type: SupportTicket["type"], description: string) => {
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, type, description })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reply to support ticket
  const handleTicketReply = async (ticketId: string, text: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "member", senderName: member.fullName, text })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Super Admin: Update ticket status and assigned officer
  const handleUpdateTicketStatus = async (ticketId: string, status: SupportTicket["status"], assignedOfficer?: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedOfficer })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Super Admin: Reply to ticket as officer
  const handleAdminTicketReply = async (ticketId: string, text: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "officer", senderName: "Comando Central HQ", text })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit direct chat messages
  const handleChatSubmit = async (channelId: string, text: string) => {
    if (!text.trim()) {
      // Force update to catch simulated responses
      fetchAllData();
      return;
    }
    try {
      const res = await fetch(`/api/chats/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "member", senderName: member.fullName, text })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Register Event attendance
  const handleRegisterEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete Academy masterclass course
  const handleCompleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (user: any, role: "member" | "admin") => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentPortal(role);
    if (user) {
      setMember(user);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveView("website");
  };

  if (!isAuthenticated) {
    if (activeView === "auth") {
      return (
        <AuthPortal 
          onLoginSuccess={handleLoginSuccess} 
          onBackToWeb={() => setActiveView("website")}
          initialMode={authInitialMode}
        />
      );
    }
    return (
      <>
        <PublicWebsite 
          onNavigateToAuth={(mode) => {
            setAuthInitialMode(mode);
            setActiveView("auth");
          }}
          websiteConfig={websiteConfig}
          announcements={announcements}
          events={events}
          leadership={leadership}
          mapStats={mapStats}
          members={members}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
        {isScannerOpen && (
          <CardVerificationScanner 
            members={members}
            onClose={() => setIsScannerOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* BACKGROUND WATERMARK GRAPHICS (Angola Map + MPLA supporters) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Angola Map Watermark SVG */}
        <div className="absolute -left-16 top-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-[0.08]">
          <svg viewBox="0 0 200 200" className="w-full h-full fill-[#FFCC00]">
            <path d="M73,34 L111,37 L122,50 L140,54 L138,71 L151,80 L147,105 L157,114 L154,124 L142,126 L126,155 L119,158 L111,146 L108,131 L89,127 L82,135 L80,147 L65,147 L58,111 L60,93 L54,77 L51,75 L52,65 L58,62 L63,64 L68,47 L66,39 Z" />
            <polygon points="100,85 104,97 116,97 106,105 110,117 100,109 90,117 94,105 84,97 96,97" fill="#C8102E" className="animate-pulse" />
          </svg>
        </div>

        {/* Supporters image watermark */}
        <div className="absolute -right-12 bottom-12 w-[350px] h-[350px] md:w-[550px] md:h-[550px] rounded-full overflow-hidden opacity-[0.11] blur-[0.5px]">
          <img 
            src="/src/assets/images/mpla_supporters_background_1784328681804.jpg" 
            alt="Militantes MPLA" 
            className="w-full h-full object-cover grayscale contrast-110 brightness-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
        </div>
      </div>

      {/* GLOBAL SYSTEM BAR / BRAND HEADER */}
      <header className="bg-white px-4 sm:px-6 lg:px-8 2xl:px-12 py-4 sticky top-0 z-40 shadow-sm">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-transparent border-0 border-none outline-none ring-0 shadow-none flex items-center justify-center p-0 logo-transparent text-white">
              <img 
                src={LOCAL_MPLA_PARTY_LOGO} 
                alt="MPLA Logo" 
                className="w-full h-full object-contain bg-transparent border-0 border-none outline-none ring-0 logo-transparent"
              />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                MPLA Portal Unificado
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-50 text-[#D3122A] px-2 py-0.5 rounded">
                  {userRole === "admin" ? "HQ ADMIN" : "SECURE"}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                {userRole === "admin" ? "Super Admin Command Centre" : "MPLA Africa do Sul - Auto-Serviço"}
              </p>
            </div>
          </div>

          {/* Secure Workspace Header / Profiles and Logout */}
          <div className="flex items-center gap-4">
            {/* Sector indicator badge */}
            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border ${
              userRole === "admin" 
                ? "bg-red-50 text-[#D3122A] border-red-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {userRole === "admin" ? "🛡️ Comando Central HQ" : "👤 Acesso Membro Oficial"}
            </span>

            {userRole === "admin" && (
              <button 
                onClick={() => {
                  setCurrentPortal(currentPortal === "admin" ? "member" : "admin");
                  setMemberTab("dashboard");
                }}
                className="text-xs font-bold bg-[#D3122A] hover:bg-red-700 text-white px-3.5 py-2 rounded-xl transition shadow-md shadow-red-100 cursor-pointer"
              >
                {currentPortal === "admin" ? "Visualizar Como Membro" : "Voltar ao Super Admin"}
              </button>
            )}

            {/* Profile badge */}
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4">
              <img 
                src={userRole === "admin" ? "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150&h=150&fit=crop" : member.photo} 
                alt={userRole === "admin" ? "HQ Admin" : member.fullName} 
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs" 
                referrerPolicy="no-referrer"
              />
              <div className="text-left leading-none">
                <p className="text-xs font-bold text-slate-900 mb-0.5">{userRole === "admin" ? "Central Admin" : member.fullName}</p>
                <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  AUTHENTICATED
                </p>
              </div>
            </div>

            {/* Red Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-bold border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER LAYOUT */}
      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 2xl:px-12 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR SUB-NAVIGATION */}
        <aside className="w-full md:w-[280px] shrink-0 space-y-6">
          {currentPortal === "member" ? (
            /* MEMBER PORTAL NAVIGATION */
            <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div>
                <p className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold px-3 mb-2">Painel de Auto-Serviço</p>
                <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { key: "dashboard", label: "Painel Principal", icon: Compass },
                    { key: "profile", label: "Meu Perfil Completo", icon: User },
                    { key: "card", label: "Cartão de Membro Digital", icon: CreditCard },
                    { key: "status", label: "Estado de Membro", icon: ShieldCheck },
                    { key: "documents", label: "Documentos & Biblioteca", icon: FileText },
                    { key: "payments", label: "Pagamentos & Quotas", icon: DollarSign },
                    { key: "events", label: "Eventos & Calendário", icon: Calendar },
                    { key: "learning", label: "Ideologia & Formação", icon: Award },
                    { key: "volunteering", label: "Voluntariado & Missões", icon: Target },
                    { key: "directory", label: "Diretório de Membros", icon: Users },
                    { key: "benefits", label: "Benefícios & Medalhas", icon: Gift },
                    { key: "messages", label: "Mensagens", icon: MessageSquare },
                    { key: "community", label: "Comunidade", icon: Users },
                    { key: "committee", label: "Comité", icon: MapPin },
                    { key: "feedback", label: "Suporte & Reclamações", icon: HelpCircle },
                    { key: "settings", label: "Definições & Segurança", icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setMemberTab(tab.key)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        memberTab === tab.key
                          ? "bg-[#C8102E] text-white font-bold shadow-lg shadow-red-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <tab.icon className="w-4 h-4 shrink-0" />
                        {tab.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Need Help? Bottom of left sidebar */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <p className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold px-3">Precisa de Ajuda?</p>
                <div className="space-y-1 px-3">
                  <button 
                    onClick={() => setMemberTab("messages")}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-[#FFCC00] flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Chat de Suporte
                  </button>
                  <button 
                    onClick={() => setMemberTab("committee")}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-[#C8102E] flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Contacto do Comité
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* SUPER ADMIN PORTAL NAVIGATION */
            <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-lg space-y-2">
              <p className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold px-3 mb-2">Comando Central Super Admin</p>
              
              {[
                { key: "dashboard", label: "Gestão de Militantes", icon: Layers },
                { key: "finance", label: "Finanças & Absa Pay", icon: DollarSign },
                { key: "cms", label: "Gestão do Site Público (CMS)", icon: Globe },
                { key: "executive", label: "Comando Executivo & BI", icon: BarChart3 },
                { key: "cards", label: "Fila de Cartões & Stock", icon: Calendar },
                { key: "integrations", label: "Centro de Integrações", icon: Network },
                { key: "system", label: "Administração do Sistema", icon: Settings },
                { key: "ai", label: "Inteligência & Auditoria AI", icon: Bot }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAdminTab(tab.key as any)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    adminTab === tab.key
                      ? "bg-[#C8102E] text-white font-bold shadow-md shadow-red-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}

              <div className="pt-4 border-t border-slate-800 text-center">
                <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  HQ Officer Auth
                </div>
              </div>
            </div>
          )}

          {/* Mini Info banner in sidebar */}
          <div className="bg-slate-800/80 text-white p-5 rounded-xl border border-slate-700/50 space-y-3.5 relative overflow-hidden shadow-sm">
            <div className="absolute right-0 bottom-0 opacity-15 flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/MPLA_Party_logo.svg/250px-MPLA_Party_logo.svg.png" 
                className="w-24 h-24 object-contain transform translate-x-4 translate-y-4" 
                alt="MPLA" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-wider font-mono text-[#FFCC00] font-bold">Credenciais MPLA</p>
              <h3 className="font-display font-bold text-xs">Governação Democrática Central</h3>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-medium">Esta aplicação está homologada para operações regionais e municipais sob a direcção do Comité de Especialidade.</p>
          </div>
        </aside>

        {/* CORE PORTAL MAIN CONTAINER PANE */}
        <section className="flex-1 space-y-8 min-w-0">
          {currentPortal === "member" ? (
            /* MEMBER VIEW CONTROLLER */
            <MemberPortalViews
              member={member}
              activeSubTab={memberTab}
              onChangeTab={setMemberTab}
              onUpdateProfile={handleUpdateProfile}
              onMakePayment={handleMakePayment}
              onRegisterEvent={handleRegisterEvent}
              onCompleteCourse={handleCompleteCourse}
              onCastVote={handleCastVote}
              events={events}
              courses={courses}
              polls={polls}
              announcements={announcements}
              tickets={tickets}
              onSubmitTicket={handleNewTicketSubmit}
              onSubmitTicketReply={handleTicketReply}
            />
          ) : (
            /* CENTRAL ADMIN VIEW CONTROLLER */
            <>
              {adminTab === "dashboard" && (
                <div className="animate-fade-in">
                  <AdminDashboard 
                    members={members} 
                    auditLogs={auditLogs} 
                    notifications={adminNotifications}
                    tickets={tickets}
                    onMarkNotificationAsRead={handleMarkNotificationAsRead}
                    onUpdateMember={handleUpdateMember} 
                    onDeleteMember={handleDeleteMember} 
                    onReplyTicket={handleAdminTicketReply}
                    onUpdateTicketStatus={handleUpdateTicketStatus}
                    onOpenScanner={() => setIsScannerOpen(true)}
                  />
                </div>
              )}

              {adminTab === "finance" && (
                <div className="animate-fade-in">
                  <AdminPaymentManagement />
                </div>
              )}

              {adminTab === "cms" && (
                <div className="animate-fade-in">
                  <AdminWebsiteCMS 
                    announcements={announcements}
                    events={events}
                    websiteConfig={websiteConfig}
                    leadership={leadership}
                    mapStats={mapStats}
                    onUpdateWebsiteConfig={handleUpdateWebsiteConfig}
                    onCreateAnnouncement={handleCreateAnnouncement}
                    onUpdateAnnouncement={handleUpdateAnnouncement}
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                    onCreateEvent={handleCreateEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onUpdateLeadership={handleUpdateLeadership}
                    onUpdateMapStats={handleUpdateMapStats}
                  />
                </div>
              )}

              {adminTab === "cards" && (
                <div className="animate-fade-in">
                  <AdminCardCentre 
                    members={members} 
                    inventory={inventory} 
                    onUpdateMember={handleUpdateMember} 
                    onUpdateInventory={handleUpdateInventory} 
                    onOpenScanner={() => setIsScannerOpen(true)}
                  />
                </div>
              )}

              {adminTab === "ai" && (
                <div className="animate-fade-in">
                  <AdminAICentre />
                </div>
              )}

              {adminTab === "executive" && (
                <div className="animate-fade-in">
                  <AdminExecutiveCentre members={members} />
                </div>
              )}

              {adminTab === "integrations" && (
                <div className="animate-fade-in">
                  <AdminIntegrationCentre />
                </div>
              )}

              {adminTab === "system" && (
                <div className="animate-fade-in">
                  <AdminSystemCentre />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* SECURE SYSTEM FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 2xl:px-12 mt-12 text-center text-xs text-slate-500">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-slate-700">© 2026 MPLA AFRICA DO SUL. Todos os direitos reservados. Em conformidade com a Carta Constitucional.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs font-medium text-slate-600">
            <span>Developed by <strong className="text-slate-800">NeuroGrowth Labs</strong> <a href="https://www.neurogrowthlabs.co.za" target="_blank" rel="noopener noreferrer" className="text-[#C8102E] font-mono hover:underline font-bold">www.neurogrowthlabs.co.za</a></span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">Portal ID: M-1791641184163-SSL-2026</span>
          </div>
        </div>
      </footer>

      {isScannerOpen && (
        <CardVerificationScanner 
          members={members}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
