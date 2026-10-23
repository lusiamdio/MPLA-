import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Member, Announcement, PartyEvent, LearningCourse, SupportTicket, ChatChannel, PaymentLog, SurveyPoll, MemberFieldVisibility, FieldVisibilityLevel } from "../types";
import DigitalCard from "./DigitalCard";
import AbsaPaymentCheckoutModal from "./AbsaPaymentCheckoutModal";
import VodaPayPaymentCheckoutModal from "./VodaPayPaymentCheckoutModal";
import MemberProfile from "./MemberProfile";
import MemberSecurityDiagnosticSuite from "./MemberSecurityDiagnosticSuite";
import OfficialMemberCertificateModal from "./OfficialMemberCertificateModal";
import CertificationProgressBar from "./CertificationProgressBar";
import AudioTranscriber from "./AudioTranscriber";
import { showToast } from "../lib/notifications";
import { safePrintHtml } from "../lib/printUtils";
import { 
  LOCAL_JOAO_LOURENCO_IMAGE,
  EVENT_CONFERENCE_COVER,
  EVENT_RALLY_COVER,
  EVENT_WORKSHOP_COVER,
  EVENT_FORUM_COVER
} from "../images";
import { 
  User, CreditCard, ShieldCheck, FileText, DollarSign, Calendar, Award, 
  Newspaper, MessageSquare, Users, MapPin, Settings, HelpCircle, ArrowRight, 
  CheckCircle2, ChevronRight, Search, Download, Share2, Printer, Plus, Grid, 
  List, Eye, Trash2, Archive, CheckCircle, Clock, Send, Heart, Bookmark, 
  Share, Video, Vote, Shield, Smartphone, Key, Bell, Phone, Mail, Sparkles, 
  LogOut, ChevronDown, RefreshCw, Volume2, Lock, EyeOff, Check, X, Camera, Map, Image as ImageIcon,
  Target, Gift, Compass, BookOpen, AlertCircle, Filter, Globe, Laptop, FileDown,
  Repeat, Receipt, Zap, QrCode, Wallet, Mic,
  Linkedin, Twitter, Facebook, Instagram, Github, ExternalLink, Link as LinkIcon,
  Youtube, Play, MessageCircle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Interfaces
interface MemberPortalViewsProps {
  member: Member;
  activeSubTab: string;
  onChangeTab: (tab: any) => void;
  onUpdateProfile: (updatedData: Partial<Member>) => void;
  onMakePayment: (amount: number, purpose: string, method: string) => void;
  onRegisterEvent: (eventId: string) => void;
  onCompleteCourse: (courseId: string) => void;
  onCastVote: (pollId: string, option: string) => void;
  events: PartyEvent[];
  courses: LearningCourse[];
  polls: SurveyPoll[];
  announcements: Announcement[];
  tickets: SupportTicket[];
  onSubmitTicket: (type: any, description: string) => void;
  onSubmitTicketReply: (ticketId: string, text: string) => void;
}

export default function MemberPortalViews({
  member,
  activeSubTab,
  onChangeTab,
  onUpdateProfile,
  onMakePayment,
  onRegisterEvent,
  onCompleteCourse,
  onCastVote,
  events,
  courses,
  polls,
  announcements,
  tickets,
  onSubmitTicket,
  onSubmitTicketReply
}: MemberPortalViewsProps) {
  
  // RENDER CORRESPONDING TAB
  switch (activeSubTab) {
    case "dashboard":
      return <HomeDashboardView member={member} events={events} announcements={announcements} onChangeTab={onChangeTab} onRegisterEvent={onRegisterEvent} />;
    case "profile":
      return <ProfileLinkedInView member={member} onUpdateProfile={onUpdateProfile} onChangeTab={onChangeTab} />;
    case "card":
      return <DigitalCard member={member} />;
    case "status":
      return <MembershipStatusView member={member} />;
    case "documents":
      return <DocumentsManagerView member={member} />;
    case "payments":
      return <PaymentsDashboardView member={member} onMakePayment={onMakePayment} />;
    case "events":
      return <EventsCarouselView member={member} events={events} onRegisterEvent={onRegisterEvent} />;
    case "learning":
      return <LearningCentreView member={member} courses={courses} onCompleteCourse={onCompleteCourse} />;
    case "volunteering":
      return <VolunteeringMissionsView member={member} />;
    case "directory":
      return <MemberDirectoryView member={member} onChangeTab={onChangeTab} />;
    case "benefits":
      return <BenefitsAndAwardsView member={member} />;
    case "news":
      return <NewsFeedView announcements={announcements} />;
    case "messages":
      return <MessagesMessengerView member={member} />;
    case "community":
      return <CommunitySocialView member={member} polls={polls} onCastVote={onCastVote} />;
    case "committee":
      return <CommitteeDetailsView member={member} announcements={announcements} />;
    case "support":
    case "feedback":
    case "tickets":
      return <SupportCentreView member={member} tickets={tickets} onSubmitTicket={onSubmitTicket} onSubmitTicketReply={onSubmitTicketReply} />;
    case "settings":
      return <SettingsView member={member} onUpdateProfile={onUpdateProfile} />;
    default:
      return <HomeDashboardView member={member} events={events} announcements={announcements} onChangeTab={onChangeTab} onRegisterEvent={onRegisterEvent} />;
  }
}

// ==========================================
// 1. HOME DASHBOARD VIEW
// ==========================================
function HomeDashboardView({ member, events, announcements, onChangeTab, onRegisterEvent }: { member: Member, events: PartyEvent[], announcements: Announcement[], onChangeTab: (tab: any) => void, onRegisterEvent: (eventId: string) => void }) {
  // Physical Card logistics timeline steps
  const steps = [
    { label: "Submetido", desc: "Pedido recebido", done: true },
    { label: "Verificação", desc: "Dados aprovados", done: true },
    { label: "Impressão", desc: "Cunho holográfico", done: member.physicalCardStatus !== "Submitted" && member.physicalCardStatus !== "Verification" },
    { label: "Expedido", desc: "Envelope selado", done: ["Ready for Dispatch", "In Transit", "Available for Collection", "Collected"].includes(member.physicalCardStatus) },
    { label: "Pronto", desc: "Sede Provincial", done: ["Available for Collection", "Collected"].includes(member.physicalCardStatus) }
  ];

  // Activities
  const activities = [
    { type: "renew", text: "Inscrição anual de militante confirmada com sucesso", date: "Hoje às 10:24", color: "bg-[#16A34A]" },
    { type: "event", text: "Registado para o Plenário Regional de Luanda", date: "Ontem às 14:15", color: "bg-[#C8102E]" },
    { type: "cert", text: "Certificado de 'História e Valores do MPLA' emitido", date: "15 Jul 2026", color: "bg-[#FFCC00]" },
    { type: "ann", text: "Aviso de convocatória recebido do Comité de Especialidade", date: "12 Jul 2026", color: "bg-slate-800" },
    { type: "pay", text: "Pagamento de quotas mensais recebido - Ref: TX-9031", date: "05 Jul 2026", color: "bg-[#16A34A]" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#C8102E]/20 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8102E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#FFCC00]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Column Welcome Info */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16A34A]/20 text-emerald-300 rounded-full text-xs font-bold border border-[#16A34A]/30">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Militante Ativo • Sede Oficial
            </span>
            <div className="space-y-1">
              <p className="text-slate-400 font-medium text-sm">Bom Dia,</p>
              <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight text-white">{member.fullName}</h2>
              <p className="text-slate-300 font-mono text-xs">{member.membershipNo}</p>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs text-slate-300 pt-2">
              <span className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-[#FFCC00]" /> {member.committee}
              </span>
              <span className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-[#FFCC00]" /> Membro desde {member.registrationDate.split("-")[0] || "2018"}
              </span>
              <span className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Quotas Regularizadas
              </span>
            </div>
          </div>

          {/* Right Column Membership Credential Status Block */}
          <div className="lg:col-span-5 flex flex-col items-stretch gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <img 
                  src={member.photo} 
                  alt={member.fullName} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#FFCC00] shadow-md bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFCC00] font-black block">Credencial Oficial</span>
                  <p className="text-sm font-bold text-white truncate">{member.fullName}</p>
                  <p className="text-xs font-mono text-slate-300">{member.membershipNo}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-600/90 text-white text-[10px] font-bold rounded-lg border border-emerald-500 shadow-xs inline-block">
                    ATIVO
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[9px] text-slate-400 uppercase font-mono">B.I. / Documento</p>
                  <p className="font-mono font-bold text-slate-200 truncate mt-0.5">{member.nationalId}</p>
                </div>
                <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[9px] text-slate-400 uppercase font-mono">Estrutura Partidária</p>
                  <p className="font-sans font-bold text-[#FFCC00] truncate mt-0.5">{member.category}</p>
                </div>
              </div>

              <button 
                onClick={() => onChangeTab("card")}
                className="w-full py-3 bg-[#FFCC00] hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-[#FFCC00]/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                Ver Cartão de Membro Digital
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest font-mono">Ações de Auto-Serviço</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Atualizar Perfil", desc: "Altere dados e contatos", icon: User, color: "text-[#C8102E] bg-red-50 hover:bg-red-100/50 border-red-100", tab: "profile" },
            { title: "Cartão Digital", desc: "Baixe a credencial oficial", icon: CreditCard, color: "text-[#FFCC00] bg-yellow-50 hover:bg-yellow-100/50 border-yellow-100", tab: "card" },
            { title: "Pagar Quotas", desc: "Regularize suas quotas", icon: DollarSign, color: "text-[#16A34A] bg-emerald-50 hover:bg-emerald-100/50 border-emerald-100", tab: "payments" },
            { title: "Inscrição de Evento", desc: "Participe dos plenários", icon: Calendar, color: "text-blue-600 bg-blue-50 hover:bg-blue-100/50 border-blue-100", tab: "events" },
            { title: "Comité de Círculo", desc: "Fale com o Secretariado", icon: Users, color: "text-purple-600 bg-purple-50 hover:bg-purple-100/50 border-purple-100", tab: "committee" },
            { title: "Academia Política", desc: "Cursos e Formação", icon: Award, color: "text-orange-600 bg-orange-50 hover:bg-orange-100/50 border-orange-100", tab: "learning" },
            { title: "Notícias & Mídia", desc: "Boletins e Comunicados", icon: Newspaper, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100/50 border-indigo-100", tab: "news" },
            { title: "Canal de Suporte", desc: "Perguntas e Suporte", icon: HelpCircle, color: "text-teal-600 bg-teal-50 hover:bg-teal-100/50 border-teal-100", tab: "support" }
          ].map((action, idx) => (
            <button 
              key={idx} 
              onClick={() => onChangeTab(action.tab as any)}
              className={`p-4 rounded-xl border text-left space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer ${action.color}`}
            >
              <action.icon className="w-5 h-5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">{action.title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Split section: Membership Status & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Logistics Status Widget */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-display font-black text-slate-900 text-sm">Estado de Entrega do Cartão</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Ref: Central Emissora Centralizada MPLA</p>
              </div>
              <span className="px-2 py-1 bg-red-50 text-[#C8102E] rounded-md text-[9px] font-mono font-black uppercase tracking-wider border border-red-100">
                LOG: {member.physicalCardStatus.toUpperCase()}
              </span>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-5 gap-2 relative pt-6 pb-4">
              <div className="absolute top-[42px] left-6 right-6 h-1 bg-slate-100 z-0 rounded" />
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center z-10 space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                    step.done 
                      ? "bg-[#C8102E] border-[#C8102E] text-white shadow-sm" 
                      : "bg-white border-slate-200 text-slate-400"
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-800 leading-tight">{step.label}</p>
                    <p className="text-[8px] text-slate-400 hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-4 text-xs flex gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C8102E] shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-slate-800">Nota de Logística Activa</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                O seu cartão físico encontra-se na fase de {member.physicalCardStatus}. Estimamos o despacho definitivo do lote nos próximos 4 dias úteis para a Sede Consular local em Joanesburgo.
              </p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h4 className="font-display font-black text-slate-900 text-sm">Actividades Recentes</h4>
            <span className="text-[9px] text-slate-400 font-mono font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ATUALIZADO AGORA
            </span>
          </div>

          <div className="space-y-4.5">
            {activities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${act.color}`} />
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs text-slate-700 leading-snug font-medium">{act.text}</p>
                  <p className="text-[9px] text-slate-400 font-mono">{act.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. PROFILE LINKEDIN VIEW
// ==========================================
function ProfileLinkedInView({ member, onUpdateProfile, onChangeTab }: { member: Member, onUpdateProfile: (updatedData: Partial<Member>) => void, onChangeTab: (tab: any) => void }) {
  const [profileMode, setProfileMode] = useState<"overview" | "editor">("overview");
  const [activeTab, setActiveTab] = useState<"about" | "membership" | "activity" | "payments">("about");
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(member.fullName);
  const [email, setEmail] = useState(member.email);
  const [mobile, setMobile] = useState(member.mobile);
  const [occupation, setOccupation] = useState(member.occupation || "");
  const [employer, setEmployer] = useState(member.employer || "");
  const [education, setEducation] = useState(member.education || "");
  
  // Expanded profile fields
  const [bio, setBio] = useState(member.bio || "");
  const [skills, setSkills] = useState<string[]>(member.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>(member.interests || []);
  const [interestInput, setInterestInput] = useState("");
  const [socialLinks, setSocialLinks] = useState(member.socialLinks || {});
  const defaultVisibility: MemberFieldVisibility = {
    bio: 'public',
    skills: 'public',
    interests: 'members',
    socialLinks: 'public',
    email: 'members',
    mobile: 'private',
    occupation: 'public'
  };

  const [visibilitySettings, setVisibilitySettings] = useState<MemberFieldVisibility>(member.visibilitySettings || defaultVisibility);

  // Keep in sync when member prop updates
  useEffect(() => {
    setFullName(member.fullName);
    setEmail(member.email);
    setMobile(member.mobile);
    setOccupation(member.occupation || "");
    setEmployer(member.employer || "");
    setEducation(member.education || "");
    setBio(member.bio || "");
    setSkills(member.skills || []);
    setInterests(member.interests || []);
    setSocialLinks(member.socialLinks || {});
    setVisibilitySettings(member.visibilitySettings || defaultVisibility);
  }, [member]);

  const handleAddSkill = (skillToAdd?: string) => {
    const val = (skillToAdd || skillInput).trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (interestToAdd?: string) => {
    const val = (interestToAdd || interestInput).trim();
    if (val && !interests.includes(val)) {
      setInterests([...interests, val]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const updateVisibility = (field: keyof MemberFieldVisibility, level: FieldVisibilityLevel) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [field]: level
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ 
      fullName, 
      email, 
      mobile, 
      occupation, 
      employer, 
      education,
      bio,
      skills,
      interests,
      socialLinks,
      visibilitySettings
    });
    setIsEditing(false);
  };

  const renderVisibilityBadge = (level?: FieldVisibilityLevel) => {
    const current = level || 'public';
    if (current === 'public') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <Globe className="w-3 h-3 text-emerald-600" /> Público
        </span>
      );
    }
    if (current === 'members') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          <Users className="w-3 h-3 text-blue-600" /> Apenas Membros
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
        <Lock className="w-3 h-3 text-slate-500" /> Privado
      </span>
    );
  };

  const renderVisibilitySelect = (field: keyof MemberFieldVisibility, currentVal?: FieldVisibilityLevel) => {
    const val = currentVal || 'public';
    return (
      <select
        value={val}
        onChange={(e) => updateVisibility(field, e.target.value as FieldVisibilityLevel)}
        className="text-[11px] font-bold py-1 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
      >
        <option value="public">🌐 Público (Todos)</option>
        <option value="members">👥 Apenas Membros</option>
        <option value="private">🔒 Privado (Apenas Eu)</option>
      </select>
    );
  };

  if (profileMode === "editor") {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setProfileMode("overview")}
            className="text-xs font-bold text-[#D3122A] hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            ← Voltar à Visão Geral do Perfil
          </button>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">
            Configuração de Coordenadas, Fotografia & Palavra-passe
          </span>
        </div>
        <MemberProfile member={member} onUpdateProfile={onUpdateProfile} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Mode Navigation Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1 self-start max-w-sm">
        <button
          onClick={() => setProfileMode("overview")}
          className="flex-1 py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 bg-white text-[#D3122A] font-bold shadow-xs"
        >
          <Globe className="w-3.5 h-3.5" /> Visão Pública
        </button>
        <button
          onClick={() => setProfileMode("editor")}
          className="flex-1 py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900"
        >
          <User className="w-3.5 h-3.5" /> Editar Coordenadas
        </button>
      </div>

      {/* cover and header banner card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-[#C8102E] via-[#C8102E] to-slate-950 relative">
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute right-4 bottom-4 flex gap-2">
            <button 
              onClick={() => setProfileMode("editor")}
              className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Alterar Capa, Foto & Dados
            </button>
          </div>
        </div>

        {/* Profile Stats Overview Section */}
        <div className="p-6 relative pt-0">
          {/* Avatar positioning */}
          <div className="absolute -top-16 left-6">
            <div className="relative">
              <img 
                src={member.photo} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md bg-white" 
                alt="Avatar" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full flex items-center justify-center shadow-md" />
            </div>
          </div>

          <div className="pt-10 sm:pt-14 flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">{member.fullName}</h2>
                <span className="px-2 py-0.5 bg-red-100 text-[#C8102E] rounded-md text-[9px] font-mono font-black uppercase border border-red-200">
                  {member.membershipLevel}
                </span>
                <span className="px-2 py-0.5 bg-yellow-100 text-[#FFCC00] dark:text-yellow-800 rounded-md text-[9px] font-mono font-black uppercase border border-yellow-200">
                  COMITÉ SA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {member.occupation || "Public Servant"} • {member.employer || "Governo Provincial"}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C8102E]" /> {member.committee} ({member.province})
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0 pt-2 md:pt-0">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                {isEditing ? "Cancelar" : "Editar Perfil"}
              </button>
              <button 
                onClick={() => onChangeTab("card")}
                className="flex-1 px-4 py-2 bg-[#C8102E] text-white hover:bg-red-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-200"
              >
                <CreditCard className="w-4 h-4" />
                Cartão Digital
              </button>
            </div>
          </div>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6 mt-6">
            <div className="text-center sm:text-left space-y-0.5">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Quota em Atraso</p>
              <p className="text-lg font-black font-mono text-[#C8102E]">R{member.outstandingBalance}</p>
            </div>
            <div className="text-center sm:text-left space-y-0.5">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Cursos Feitos</p>
              <p className="text-lg font-black font-mono text-slate-800">1 / 4</p>
            </div>
            <div className="text-center sm:text-left space-y-0.5">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Presença Eventos</p>
              <p className="text-lg font-black font-mono text-slate-800">2 Reunidões</p>
            </div>
            <div className="text-center sm:text-left space-y-0.5">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Nível de Militância</p>
              <p className="text-lg font-black font-mono text-emerald-600">GRAU 2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto whitespace-nowrap bg-white px-6 py-2.5 rounded-xl border">
        {[
          { key: "about", label: "Informações Gerais & Perfil", icon: User },
          { key: "membership", label: "Filiação & Comité", icon: ShieldCheck },
          { key: "activity", label: "Actividade", icon: Newspaper },
          { key: "payments", label: "Histórico de Quotas", icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === tab.key 
                ? "bg-[#C8102E] text-white shadow-xs" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm">Editar Perfil de Militante & Controlos de Visibilidade</h3>
                <p className="text-[11px] text-slate-400">Actualize a sua biografia, competências, interesses e decida quem pode ver cada informação.</p>
              </div>
              <button
                type="button"
                onClick={() => onChangeTab("settings")}
                className="text-[11px] text-[#C8102E] hover:underline font-bold"
              >
                Definições Avançadas de Conta →
              </button>
            </div>

            {/* Basic Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nome Completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" required />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Endereço de E-mail</label>
                  {renderVisibilitySelect('email', visibilitySettings.email)}
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" required />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Telemóvel</label>
                  {renderVisibilitySelect('mobile', visibilitySettings.mobile)}
                </div>
                <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" required />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Profissão</label>
                  {renderVisibilitySelect('occupation', visibilitySettings.occupation)}
                </div>
                <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Entidade Patronal</label>
                <input type="text" value={employer} onChange={(e) => setEmployer(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nível Académico</label>
                <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            {/* Short Bio */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span>Biografia Curta (Bio)</span>
                  </label>
                  <p className="text-[10px] text-slate-400">Apresente-se aos camaradas e à comunidade.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Visibilidade:</span>
                  {renderVisibilitySelect('bio', visibilitySettings.bio)}
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Escreva uma breve biografia sobre o seu percurso na comunidade, compromisso partidário e realizações..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-red-500 outline-none transition resize-none text-slate-800"
                />
                <div className="absolute right-2.5 bottom-2.5 text-[9px] font-mono text-slate-400 bg-white/80 px-1 py-0.5 rounded">
                  {bio.length}/500
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Competências & Habilidades (Skills)</span>
                  </label>
                  <p className="text-[10px] text-slate-400">Mais-valias que coloca ao serviço do partido e da comunidade.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Visibilidade:</span>
                  {renderVisibilitySelect('skills', visibilitySettings.skills)}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic px-2 py-1">Nenhuma competência adicionada.</p>
                ) : (
                  skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-900 rounded-lg text-xs font-medium">
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Adicionar competência (ex: Mobilização de Quadros, Gestão de Projetos)..."
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Liderança Comunitária", "Comunicação Estratégica", "Gestão de Projetos", "Direito & Legislação", "Desenvolvimento Web"].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddSkill(sug)}
                    disabled={skills.includes(sug)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md border border-slate-200 transition disabled:opacity-40 cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Áreas de Interesse & Causas</span>
                  </label>
                  <p className="text-[10px] text-slate-400">Temas em que deseja colaborar ativamente.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Visibilidade:</span>
                  {renderVisibilitySelect('interests', visibilitySettings.interests)}
                </div>
              </div>

              {/* Interests Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {interests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic px-2 py-1">Nenhum interesse adicionado.</p>
                ) : (
                  interests.map((interest, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium">
                      <span>{interest}</span>
                      <button type="button" onClick={() => handleRemoveInterest(interest)} className="text-slate-400 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Interest Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="Adicionar área de interesse (ex: Juventude & Desporto, Ação Social)..."
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Juventude & Desporto (JMPLA)", "Empoderamento Feminino (OMA)", "Ação Social Comunitária", "Tecnologia & Inovação Digital"].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddInterest(sug)}
                    disabled={interests.includes(sug)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md border border-slate-200 transition disabled:opacity-40 cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Redes Sociais & Canais Digitais</span>
                  </label>
                  <p className="text-[10px] text-slate-400">Links para perfis externos no directório partidário.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Visibilidade:</span>
                  {renderVisibilitySelect('socialLinks', visibilitySettings.socialLinks)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-[#0A66C2]" /> LinkedIn
                  </label>
                  <input
                    type="url"
                    value={socialLinks.linkedin || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/usuario"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <Twitter className="w-3 h-3 text-slate-800" /> Twitter / X
                  </label>
                  <input
                    type="url"
                    value={socialLinks.twitter || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://x.com/usuario"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <Facebook className="w-3 h-3 text-[#1877F2]" /> Facebook
                  </label>
                  <input
                    type="url"
                    value={socialLinks.facebook || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/usuario"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-[#E4405F]" /> Instagram
                  </label>
                  <input
                    type="url"
                    value={socialLinks.instagram || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/usuario"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <Github className="w-3 h-3 text-slate-800" /> GitHub
                  </label>
                  <input
                    type="url"
                    value={socialLinks.github || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="https://github.com/usuario"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-emerald-600" /> Website Pessoal
                  </label>
                  <input
                    type="url"
                    value={socialLinks.website || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    placeholder="https://seusite.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer">Descartar</button>
              <button type="submit" className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Gravar Alterações & Visibilidade</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Basic Identification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Nome de Filiação</p>
                    <p className="font-bold text-slate-800 text-sm">{member.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">BI Nacional / Passaporte</p>
                    <p className="font-bold text-slate-800 font-mono">{member.nationalId}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Telemóvel</p>
                      {renderVisibilityBadge(member.visibilitySettings?.mobile || 'private')}
                    </div>
                    <p className="font-bold text-slate-800">{member.mobile}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Correio Electrónico</p>
                      {renderVisibilityBadge(member.visibilitySettings?.email || 'members')}
                    </div>
                    <p className="font-bold text-slate-800 font-mono truncate">{member.email}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Profissão / Função</p>
                      {renderVisibilityBadge(member.visibilitySettings?.occupation || 'public')}
                    </div>
                    <p className="font-bold text-slate-800">{member.occupation || "N/D"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Entidade / Nível Académico</p>
                    <p className="font-bold text-slate-800">{member.employer || "N/D"} {member.education ? `(${member.education})` : ''}</p>
                  </div>
                </div>

                {/* Short Bio Presentation */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C8102E]" />
                      <span>Biografia & Apresentação</span>
                    </h4>
                    {renderVisibilityBadge(member.visibilitySettings?.bio || 'public')}
                  </div>
                  {member.bio ? (
                    <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-line">
                      "{member.bio}"
                    </p>
                  ) : (
                    <div className="text-xs text-slate-400 italic flex items-center justify-between py-2">
                      <span>Nenhuma biografia adicionada ainda.</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(true)}
                        className="text-[11px] text-[#C8102E] font-bold hover:underline"
                      >
                        + Adicionar biografia
                      </button>
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Competências & Habilidades (Skills)</span>
                    </h4>
                    {renderVisibilityBadge(member.visibilitySettings?.skills || 'public')}
                  </div>
                  {member.skills && member.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic flex items-center justify-between py-1">
                      <span>Nenhuma competência registada.</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(true)}
                        className="text-[11px] text-indigo-600 font-bold hover:underline"
                      >
                        + Adicionar competências
                      </button>
                    </div>
                  )}
                </div>

                {/* Interests Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Áreas de Interesse & Causas</span>
                    </h4>
                    {renderVisibilityBadge(member.visibilitySettings?.interests || 'members')}
                  </div>
                  {member.interests && member.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {member.interests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic flex items-center justify-between py-1">
                      <span>Nenhuma área de interesse registada.</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(true)}
                        className="text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        + Adicionar interesses
                      </button>
                    </div>
                  )}
                </div>

                {/* Social Media Links Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Redes Sociais & Presença Digital</span>
                    </h4>
                    {renderVisibilityBadge(member.visibilitySettings?.socialLinks || 'public')}
                  </div>
                  {member.socialLinks && Object.values(member.socialLinks).some(v => Boolean(v)) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      {member.socialLinks.linkedin && (
                        <a 
                          href={member.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-[#0A66C2]/10 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-[#0A66C2] transition group"
                        >
                          <Linkedin className="w-4 h-4 shrink-0" />
                          <span className="truncate">LinkedIn</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      )}
                      {member.socialLinks.twitter && (
                        <a 
                          href={member.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-900 transition group"
                        >
                          <Twitter className="w-4 h-4 shrink-0" />
                          <span className="truncate">Twitter / X</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      )}
                      {member.socialLinks.facebook && (
                        <a 
                          href={member.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-[#1877F2]/10 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-[#1877F2] transition group"
                        >
                          <Facebook className="w-4 h-4 shrink-0" />
                          <span className="truncate">Facebook</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      )}
                      {member.socialLinks.instagram && (
                        <a 
                          href={member.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-[#E4405F]/10 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-[#E4405F] transition group"
                        >
                          <Instagram className="w-4 h-4 shrink-0" />
                          <span className="truncate">Instagram</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      )}
                      {member.socialLinks.github && (
                        <a 
                          href={member.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition group"
                        >
                          <Github className="w-4 h-4 shrink-0" />
                          <span className="truncate">GitHub</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      )}
                      {member.socialLinks.website && (
                        <a 
                          href={member.socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 transition group"
                        >
                          <LinkIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">Website</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic flex items-center justify-between py-1">
                      <span>Nenhuma rede social conectada.</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(true)}
                        className="text-[11px] text-sky-600 font-bold hover:underline"
                      >
                        + Conectar canais digitais
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "membership" && (
              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold flex items-center gap-1.5">
                      <span>Número de Identificação Militante (ADL)</span>
                      <span className="text-[8px] bg-red-50 text-[#C8102E] font-bold px-1.5 py-0.2 rounded border border-red-100">OFICIAL</span>
                    </p>
                    <p className="font-bold text-slate-800 text-sm font-mono text-[#C8102E]">{member.membershipNo}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Nível de Credenciamento</p>
                    <p className="font-bold text-slate-800">{member.membershipLevel} Militant</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Comité de Círculo Local</p>
                    <p className="font-bold text-slate-800">{member.committee}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Província Administrativa</p>
                    <p className="font-bold text-slate-800">{member.province}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Data de Juramento Oficial</p>
                    <p className="font-bold text-slate-800 font-mono">{member.registrationDate}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Estado de Quotas</p>
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-[#16A34A] rounded text-[10px] font-bold border border-emerald-100">
                      REGULARIZADO
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-4">
                {[
                  { text: "Presença confirmada no Plenário Semanal MPLA Ward 117", date: "Há 2 dias" },
                  { text: "Submissão de sugestões no fórum de debates comunitários", date: "Há 1 semana" },
                  { text: "Conclusão com distinção do Masterclass de Governação Local", date: "Há 2 semanas" }
                ].map((act, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700">{act.text}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.date}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[9px]">
                        <th className="pb-2">ID Transação</th>
                        <th className="pb-2">Data</th>
                        <th className="pb-2">Valor</th>
                        <th className="pb-2">Descrição</th>
                        <th className="pb-2 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      <tr>
                        <td className="py-3 font-mono">TX-9021-GP</td>
                        <td className="py-3">05 Jan 2026</td>
                        <td className="py-3 font-mono">R120.00</td>
                        <td className="py-3">Quotas Anuais 2026</td>
                        <td className="py-3 text-right"><span className="text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Pago</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-mono">TX-7012-GP</td>
                        <td className="py-3">10 Jan 2025</td>
                        <td className="py-3 font-mono">R100.00</td>
                        <td className="py-3">Quotas Anuais 2025</td>
                        <td className="py-3 text-right"><span className="text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Pago</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. FULL SCREEN DIGITAL CARD VIEW
// ==========================================
function DigitalCardFullScreenView({ member }: { member: Member }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center animate-fade-in" id="full-card-panel">
      <div className="space-y-1">
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Cartão de Militante Oficial</h2>
        <p className="text-xs text-slate-500">Credencial criptográfica em alta resolução com assinatura digital homologada.</p>
      </div>

      <div 
        className="relative w-full max-w-[440px] h-[280px] rounded-2xl shadow-2xl transition-all duration-700 cursor-pointer overflow-hidden mx-auto hover:shadow-[#C8102E]/20 hover:scale-103 border border-[#FFCC00]/40"
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-[#C8102E] via-[#C8102E] to-slate-950 text-white rounded-2xl transition-transform duration-500 backface-hidden ${flipped ? 'rotate-y-180 opacity-0 pointer-events-none' : 'rotate-y-0 opacity-100'}`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg border-2 border-[#FFCC00]">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/MPLA_Party_logo.svg/250px-MPLA_Party_logo.svg.png" 
                  alt="MPLA" 
                  className="w-6 h-6 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left leading-none">
                <span className="text-base font-display font-black text-[#FFCC00] leading-none uppercase block">MPLA</span>
                <span className="text-[9px] font-mono font-black tracking-widest text-[#FFCC00] leading-none mt-0.5 block">MPLA SEDE SA</span>
                <p className="text-[8px] text-slate-200 mt-1 uppercase font-bold leading-none">Membro Oficial Recenseado</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded-md border border-emerald-700 shadow-sm">
              ACTIVO
            </span>
          </div>

          <div className="flex gap-4 items-center text-left">
            <img src={member.photo} className="w-16 h-16 rounded-full object-cover border-2 border-[#FFCC00] shadow-lg bg-slate-800" referrerPolicy="no-referrer" />
            <div className="min-w-0">
              <h3 className="text-sm font-black tracking-wide truncate">{member.fullName}</h3>
              <p className="text-xs text-[#FFCC00] font-mono leading-none">{member.membershipNo}</p>
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-0.5 leading-none">MPLA Cape Town</p>
              <p className="text-[10px] text-slate-300 truncate font-medium mt-1">{member.committee}</p>
            </div>
          </div>

          <div className="border-t border-white/15 pt-2 grid grid-cols-3 gap-2 text-left text-[10px] text-slate-300">
            <div>
              <p className="text-[7.5px] uppercase font-mono tracking-widest text-slate-400 leading-none">Data Nasc.</p>
              <p className="font-bold font-mono text-white mt-0.5">{member.dob ? member.dob.split('-').reverse().join('/') : 'N/D'}</p>
            </div>
            <div>
              <p className="text-[7.5px] uppercase font-mono tracking-widest text-slate-400 leading-none">Província</p>
              <p className="font-bold text-white mt-0.5 truncate">{member.province}</p>
            </div>
            <div className="text-right">
              <p className="text-[7.5px] uppercase font-mono tracking-widest text-slate-400 leading-none">Nível</p>
              <p className="font-mono font-bold text-[#FFCC00] mt-0.5">{member.membershipLevel || "Standard"}</p>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 w-full h-full p-6 flex flex-col justify-between bg-[#FDFDFD] text-[#1A1A1A] rounded-2xl border-[3px] border-double border-slate-300 transition-transform duration-500 backface-hidden ${flipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0 pointer-events-none'}`}>
          <div className="h-4 bg-gradient-to-b from-[#1A1A1A] to-slate-950 -mx-6 -mt-6 mb-3" />
          <div className="flex justify-between items-center gap-4 text-left">
            <div className="space-y-1.5 flex-1">
              <div>
                <p className="text-[7.5px] text-slate-400 uppercase font-mono tracking-wider leading-none">Contacto de Emergência</p>
                <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{member.emergencyContact?.name || "Next of Kin"}</p>
                <p className="text-[10px] font-mono font-semibold text-slate-600">{member.emergencyContact?.phone || member.mobile}</p>
              </div>
              <div>
                <p className="text-[7.5px] text-slate-400 uppercase font-mono tracking-wider leading-none">B.I. Nacional</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{member.nationalId}</p>
              </div>
              <div>
                <p className="text-[7.5px] text-slate-400 uppercase font-mono tracking-wider leading-none">Verificação Digital</p>
                <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">https://diaspora.mpla.ao/verificar</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent("https://diaspora.mpla.ao/verificar")}`} 
                  alt="QR" 
                  className="w-13 h-13"
                />
              </div>
              {/* Miniature President João Lourenço */}
              <div className="flex flex-col items-center text-center">
                <img 
                  src={LOCAL_JOAO_LOURENCO_IMAGE} 
                  alt="S.E. João Lourenço" 
                  className="w-7 h-7 rounded-full object-cover object-top border border-[#FFCC00] bg-white shadow-2xs" 
                />
                <span className="text-[6px] font-extrabold text-slate-900 uppercase leading-none mt-0.5">S.E. João Lourenço</span>
                <span className="text-[5px] font-bold text-[#C8102E] uppercase font-mono leading-none">Presidente MPLA</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 text-center">
            <div className="h-5 w-full bg-slate-100 rounded flex items-center justify-center overflow-hidden px-4">
              <div className="flex gap-[1.5px] items-stretch h-3 w-full">
                {[...Array(32)].map((_, i) => (
                  <div key={i} className="bg-slate-800" style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }} />
                ))}
              </div>
            </div>
            <p className="text-[8px] font-mono text-slate-400 mt-1">*{member.membershipNo}*</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 italic">Clique no cartão de identificação para rodar.</p>

      {/* Action buttons row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex flex-col items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-sm">
          <Printer className="w-4.5 h-4.5 text-slate-500" /> Imprimir Cartão
        </button>
        <button onClick={() => showToast("PDF do cartão oficial gerado para download!", "info")} className="p-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex flex-col items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-sm">
          <FileText className="w-4.5 h-4.5 text-slate-500" /> Exportar PDF
        </button>
        <button onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast("Link oficial de validação copiado!", "success"); }} className="p-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex flex-col items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-sm">
          <Share2 className="w-4.5 h-4.5 text-slate-500" /> Partilhar Credencial
        </button>
        <button onClick={() => showToast("Credencial digital adicionada à Carteira Móvel com sucesso.", "success")} className="p-3 bg-[#FFCC00] text-slate-950 font-black rounded-xl text-xs flex flex-col items-center gap-1.5 hover:bg-yellow-500 transition cursor-pointer shadow-sm">
          <Sparkles className="w-4.5 h-4.5" /> Adicionar Carteira
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. DETAILED LOGISTICS / MEMBERSHIP STATUS
// ==========================================
function MembershipStatusView({ member }: { member: Member }) {
  const regDate = member.registrationDate ? new Date(member.registrationDate) : new Date();
  
  // Real-time calculation: exactly 2 weeks (14 days) delivery date
  const deliveryEstDate = member.physicalCardEstDate || new Date(regDate.getTime() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];
  
  // Unique Tracking code generated automatically
  const trackingCode = member.trackingCode || `MPLA-CT-2026-${(member.id || "001").toUpperCase().replace(/[^A-Z0-9]/g, "")}-${member.membershipNo.slice(-4)}`;

  const steps = [
    { 
      key: "Submitted", 
      title: "Pedido Registado", 
      date: regDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }), 
      desc: "Solicitação de cartão físico registada no sistema central do Comité de Cape Town.", 
      done: true 
    },
    { 
      key: "Verification", 
      title: "Verificação de Ficha & Biometria", 
      date: new Date(regDate.getTime() + 2 * 24 * 3600 * 1000).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }), 
      desc: "Análise do formulário e validação do enquadramento da fotografia de perfil.", 
      done: true 
    },
    { 
      key: "Approved", 
      title: "Emissão no Gabinete de Cape Town", 
      date: new Date(regDate.getTime() + 5 * 24 * 3600 * 1000).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }), 
      desc: "Aprovação e homologação pelo Secretariado do Comité de Coordenação de Cape Town.", 
      done: member.physicalCardStatus !== "Submitted" && member.physicalCardStatus !== "Verification" 
    },
    { 
      key: "Printing", 
      title: "Cunho Térmico Holográfico 3D", 
      date: new Date(regDate.getTime() + 8 * 24 * 3600 * 1000).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }), 
      desc: "Impressão do suporte PVC de alta densidade com banda magnética e código QR.", 
      done: ["In Transit", "Available for Collection", "Collected"].includes(member.physicalCardStatus) 
    },
    { 
      key: "Available for Collection", 
      title: "Pronto para Levantamento na Sede", 
      date: `Previsão: ${new Date(deliveryEstDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}`, 
      desc: "O cartão estará disponível na Secretaria do Comité de Cape Town (África do Sul).", 
      done: member.physicalCardStatus === "Collected" 
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in" id="logistics-tracking">
      <div className="space-y-1">
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Rastreamento de Identidade Física</h2>
        <p className="text-xs text-slate-500">Acompanhamento em tempo real da produção e entrega do Cartão de Militante em Cape Town.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Real-Time Tracker Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Código de Rastreio Automático</p>
            <p className="font-bold font-mono text-[#FFCC00] text-sm tracking-wider mt-0.5">{trackingCode}</p>
          </div>
          <div>
            <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Gabinete Emissor</p>
            <p className="font-bold text-white mt-0.5">Cape Town (África do Sul)</p>
          </div>
          <div>
            <p className="text-slate-400 font-mono uppercase text-[9px] font-bold">Previsão de Entrega (2 Semanas)</p>
            <p className="font-bold text-emerald-400 font-mono mt-0.5">
              {new Date(deliveryEstDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="relative pl-8 border-l-2 border-slate-200 space-y-6 py-2">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Stepper Dot */}
              <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                step.done 
                  ? "bg-[#C8102E] border-[#C8102E] text-white" 
                  : "bg-white border-slate-300 text-slate-400"
              }`}>
                <Check className="w-3.5 h-3.5" />
              </div>

              {/* Step info card */}
              <div className={`p-4 rounded-xl border transition ${
                step.done 
                  ? "bg-white border-slate-200 shadow-xs" 
                  : "bg-slate-50 border-slate-100 text-slate-400"
              }`}>
                <div className="flex justify-between items-center gap-4 text-xs">
                  <h4 className="font-bold text-slate-900">{step.title}</h4>
                  <span className="font-mono text-[10px] text-[#C8102E] font-bold">{step.date}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. DOCUMENTS / BEAUTIFUL FILE MANAGER
// ==========================================
function DocumentsEmptyState({ onSeed }: { onSeed: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto space-y-6 animate-fade-in bg-white rounded-3xl border border-slate-100 shadow-xs">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C8102E]/10 to-[#FFCC00]/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute w-40 h-40 border-2 border-dashed border-[#FFCC00]/30 rounded-full animate-spin-slow" />
        <div className="absolute w-28 h-28 border border-slate-200 rounded-full" />
        
        <div className="absolute transform -rotate-12 translate-x-3 -translate-y-2 bg-slate-100 border border-slate-300 w-16 h-20 rounded-lg shadow-sm flex flex-col justify-between p-2">
          <div className="w-8 h-1 bg-slate-300 rounded" />
          <div className="space-y-1">
            <div className="w-10 h-1 bg-slate-200 rounded" />
            <div className="w-12 h-1 bg-slate-200 rounded" />
          </div>
          <div className="flex justify-end"><FileText className="w-4 h-4 text-slate-400" /></div>
        </div>

        <div className="absolute transform rotate-6 translate-y-2 -translate-x-2 bg-[#0F172A] w-18 h-22 rounded-xl shadow-lg border border-slate-800 flex flex-col justify-between p-3 z-10">
          <div className="flex justify-between items-center">
            <div className="w-4 h-4 rounded bg-[#C8102E] flex items-center justify-center">
              <span className="text-[7px] text-[#FFCC00] font-black">★</span>
            </div>
            <div className="w-6 h-1.5 bg-[#FFCC00] rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="w-12 h-1 bg-slate-700 rounded" />
            <div className="w-10 h-1 bg-slate-700 rounded" />
            <div className="w-8 h-1 bg-slate-700 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[7px] font-mono text-slate-500">PDF SECURE</span>
            <ShieldCheck className="w-4 h-4 text-[#FFCC00]" />
          </div>
        </div>

        <div className="absolute top-6 left-6 w-3 h-3 bg-[#C8102E] rounded-full animate-bounce" />
        <div className="absolute bottom-6 right-6 w-4 h-4 bg-[#FFCC00] rounded-sm rotate-45 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-black text-slate-900 text-sm">Pasta de Documentos Vazia</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Ainda não possui documentos homologados nesta secção. Aqui serão arquivados os seus comprovativos de quotas, fichas oficiais e diplomas académicos do partido.
        </p>
      </div>

      <button
        onClick={onSeed}
        className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md hover:shadow-red-500/20 flex items-center gap-2 cursor-pointer mx-auto"
      >
        <Sparkles className="w-4 h-4 text-[#FFCC00]" />
        Gerar Documentos de Demonstração
      </button>
    </div>
  );
}

function DocumentsManagerView({ member }: { member: Member }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState<string>("All");
  
  // Real-Time Document Exchange States
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Membership");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Document Viewer Modal State
  const [selectedDocPreview, setSelectedDocPreview] = useState<any | null>(null);

  // Fetch real-time documents from server
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${member.id}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [member.id]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle || !selectedFileName) {
      showToast("Por favor indique o título e selecione um ficheiro.", "warning");
      return;
    }

    try {
      setUploading(true);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDocTitle,
          category: newDocCategory,
          sender: member.id,
          recipientId: "super-admin",
          fileName: selectedFileName,
          description: newDocDescription
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast("Documento submetido e enviado ao Super Administrador em tempo real!", "success");
        setShowUploadModal(false);
        setNewDocTitle("");
        setNewDocDescription("");
        setSelectedFileName("");
        fetchDocuments();
      }
    } catch (err) {
      showToast("Erro ao enviar ficheiro. Tente novamente.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = (doc: any) => {
    const element = document.createElement("a");
    const file = new Blob([
      `DOCUMENTO OFICIAL DO MPLA DIÁSPORA\n` +
      `----------------------------------------\n` +
      `Título: ${doc.title}\n` +
      `Ficheiro: ${doc.fileName}\n` +
      `Data: ${doc.date}\n` +
      `Militante: ${member.fullName} (${member.membershipNo})\n` +
      `Estado: ${doc.status}\n\n` +
      `Descrição:\n${doc.description || "Documento arquivado no Cofre de Documentos Oficiais."}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTabFilter === "All") return matchesSearch;
    if (activeTabFilter === "AIGeneral") return matchesSearch && d.category === "AIGeneral";
    if (activeTabFilter === "Sent") return matchesSearch && d.sender === member.id;
    if (activeTabFilter === "Received") return matchesSearch && d.sender !== member.id;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="documents-filemanager">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Cofre de Documentos Oficiais</h2>
          <p className="text-xs text-slate-500">Aceda, faça download e troque ficheiros em tempo real com o Super Administrador.</p>
        </div>

        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Enviar Ficheiro à Administração
        </button>
      </div>

      {/* Tabs Filter Row */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2 whitespace-nowrap">
        {[
          { key: "All", label: "Todos os Ficheiros" },
          { key: "AIGeneral", label: "Documentos Gerais do Partido (IA)" },
          { key: "Sent", label: "Enviados à Administração" },
          { key: "Received", label: "Recebidos da Administração & Fichas" }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTabFilter(t.key)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTabFilter === t.key 
                ? "bg-slate-900 text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-3 top-3 text-slate-400"><Search className="w-4 h-4" /></span>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por título ou nome do ficheiro no cofre..." 
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#C8102E]/20"
        />
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-mono">
          A carregar cofre criptográfico em tempo real...
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#C8102E]/40 transition shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="p-3 bg-red-50 text-[#C8102E] rounded-xl"><FileText className="w-6 h-6" /></div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    doc.category === "AIGeneral" ? "bg-amber-100 text-amber-800" :
                    doc.sender === member.id ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {doc.category === "AIGeneral" ? "Gerado por IA" : doc.sender === member.id ? "Enviado" : "Recebido"}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{doc.fileName}</p>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{doc.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>{doc.date} • {doc.size || "1.2 MB"}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedDocPreview(doc)} 
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-950 cursor-pointer"
                    title="Visualizar Documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDownloadFile(doc)} 
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-[#C8102E] cursor-pointer"
                    title="Download Ficheiro"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Nenhum documento encontrado</p>
          <p className="text-[11px] text-slate-400">Não existem ficheiros nesta categoria ou com estes termos de pesquisa.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-black text-slate-900 text-sm">Enviar Ficheiro ao Super Administrador</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Título do Documento</label>
                <input 
                  type="text" 
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Ex: Comprovativo de Residência / Requerimento" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#C8102E]/20 font-medium"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Categoria</label>
                <select 
                  value={newDocCategory} 
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                >
                  <option value="Membership">Acreditação & Filiação</option>
                  <option value="Identification">Documentos de Identidade / BI</option>
                  <option value="Finance">Comprovativos de Pagamento</option>
                  <option value="Other">Outro Ficheiro Oficial</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Anexar Ficheiro</label>
                <input 
                  type="file" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFileName(e.target.files[0].name);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
                {selectedFileName && (
                  <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">Ficheiro Selecionado: {selectedFileName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Observações ao Administrador</label>
                <textarea 
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  placeholder="Instruções adicionais ou detalhes do documento..." 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg h-20 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-[#C8102E] text-white font-bold rounded-lg cursor-pointer shadow-sm hover:bg-red-700">
                  {uploading ? "A Submeter..." : "Enviar Ficheiro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document View Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C8102E]" />
                <h3 className="font-display font-black text-slate-900 text-sm truncate">{selectedDocPreview.title}</h3>
              </div>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400 uppercase text-[9px] font-bold">Ficheiro:</span>
                <span className="font-bold text-slate-800">{selectedDocPreview.fileName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400 uppercase text-[9px] font-bold">Data de Emissão:</span>
                <span className="font-bold text-slate-800">{selectedDocPreview.date}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase text-[9px] font-bold block">Conteúdo / Descrição:</span>
                <p className="text-slate-700 font-sans leading-relaxed text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                  {selectedDocPreview.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedDocPreview(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg cursor-pointer">Fechar</button>
              <button onClick={() => handleDownloadFile(selectedDocPreview)} className="px-4 py-2 bg-[#C8102E] text-white font-bold text-xs rounded-lg cursor-pointer shadow-sm flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Descarregar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. PAYMENTS / BANKING STYLE DASHBOARD
// ==========================================
function PaymentsDashboardView({ member, onMakePayment }: { member: Member, onMakePayment: (amount: number, purpose: string, method: string) => void }) {
  const [payAmount, setPayAmount] = useState(member.outstandingBalance || 120);
  const [payPurpose, setPayPurpose] = useState("Quotas Mensais de Membro");
  const [payMethod, setPayMethod] = useState("Absa Pay Instant EFT");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Absa Checkout Modal
  const [absaModalOpen, setAbsaModalOpen] = useState(false);
  const [absaModalAmount, setAbsaModalAmount] = useState(120);
  const [absaModalPurpose, setAbsaModalPurpose] = useState("Quotas Mensais de Membro");
  const [absaModalRecurring, setAbsaModalRecurring] = useState(false);

  // VodaPay Checkout Modal
  const [vodapayModalOpen, setVodapayModalOpen] = useState(false);
  const [vodapayModalAmount, setVodapayModalAmount] = useState(120);
  const [vodapayModalPurpose, setVodapayModalPurpose] = useState("Quotas Mensais de Membro (VodaPay)");
  const [vodapayModalRecurring, setVodapayModalRecurring] = useState(false);

  // Member Subscriptions state
  const [memberSubs, setMemberSubs] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Whop Virtual Debit Card States
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardStatus, setCardStatus] = useState<'Active' | 'Blocked'>(member.virtualCardStatus || 'Active');
  const [cardBalance, setCardBalance] = useState<number>(member.virtualCardBalance || 0);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState(250);
  const [funding, setFunding] = useState(false);

  // Card Credentials
  const cardNumber = member.virtualCardNumber || "4000 1975 8820 4019";
  const cardExpiry = member.virtualCardExpiry || "12/28";
  const cardCvv = member.virtualCardCvv || "382";

  // Fetch Member Subscriptions
  const fetchSubscriptions = () => {
    setSubsLoading(true);
    fetch(`/api/absa/recurring-schedules?memberId=${member.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setMemberSubs(data);
      })
      .catch(() => {})
      .finally(() => setSubsLoading(false));
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [member.id]);

  const handleOpenAbsa = (amountToPay: number, purposeToPay: string, recurring: boolean = false) => {
    setAbsaModalAmount(amountToPay);
    setAbsaModalPurpose(purposeToPay);
    setAbsaModalRecurring(recurring);
    setAbsaModalOpen(true);
  };

  const handleOpenVodaPay = (amountToPay: number, purposeToPay: string, recurring: boolean = false) => {
    setVodapayModalAmount(amountToPay);
    setVodapayModalPurpose(purposeToPay);
    setVodapayModalRecurring(recurring);
    setVodapayModalOpen(true);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    if (payMethod.includes("VodaPay")) {
      handleOpenVodaPay(payAmount, payPurpose, false);
      return;
    }
    if (payMethod.includes("Absa")) {
      handleOpenAbsa(payAmount, payPurpose, false);
      return;
    }
    if (cardStatus === 'Blocked') {
      showToast("O seu cartão de débito virtual está bloqueado. Desbloqueie o cartão para efetuar pagamentos.", "warning");
      return;
    }
    onMakePayment(payAmount, payPurpose, payMethod);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 4000);
  };

  const handleToggleBlockCard = async () => {
    try {
      const newStatus = cardStatus === 'Active' ? 'Blocked' : 'Active';
      setCardStatus(newStatus);
      await fetch(`/api/members/${member.id}/virtual-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_block" })
      });
      showToast(`Cartão virtual ${newStatus === 'Active' ? 'desbloqueado' : 'bloqueado'} com sucesso.`, "info");
    } catch (err) {
      console.error("Error toggling card status:", err);
    }
  };

  const handleFundCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFunding(true);
      const res = await fetch(`/api/members/${member.id}/virtual-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fund", amount: fundAmount })
      });
      const data = await res.json();
      if (data.success) {
        setCardBalance(data.member.virtualCardBalance);
        setShowFundModal(false);
        showToast(`Sucesso! Foram recarregados R${fundAmount}.00 no seu cartão virtual via Whop Gateway.`, "success");
      }
    } catch (err) {
      showToast("Erro ao recarregar o cartão via Whop.", "error");
    } finally {
      setFunding(false);
    }
  };

  const handlePrintSingleReceipt = (tx: any) => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo Oficial de Quota - MPLA</title>
          <style>
            body { font-family: -apple-system, sans-serif; color: #0F172A; margin: 30px; }
            .header { border-bottom: 2px solid #DC0032; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            h1 { color: #DC0032; font-size: 18px; margin: 0; text-transform: uppercase; }
            .box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 10px; margin: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #E2E8F0; font-size: 13px; }
            .total { font-size: 22px; font-weight: 900; color: #DC0032; text-align: center; padding: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>MPLA - Delegação África do Sul</h1>
              <p style="font-size: 11px; color: #64748B; margin: 2px 0;">Comprovativo de Quitação de Contribuição Partidária</p>
            </div>
            <span style="background: #10B981; color: white; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: bold;">PAGO</span>
          </div>
          <div class="total">R ${tx.amount}.00 ZAR</div>
          <div class="box">
            <div class="row"><span>ID da Transação:</span><strong>${tx.id}</strong></div>
            <div class="row"><span>Data:</span><strong>${tx.date}</strong></div>
            <div class="row"><span>Militante:</span><strong>${member.fullName}</strong></div>
            <div class="row"><span>Nº de Membro:</span><strong>${member.membershipNo}</strong></div>
            <div class="row"><span>Finalidade:</span><strong>${tx.purpose}</strong></div>
            <div class="row"><span>Método:</span><strong>${tx.method || 'Absa Pay Open Banking'}</strong></div>
          </div>
          <p style="font-size: 10px; color: #94A3B8; text-align: center;">Emitido eletronicamente pelo Sistema de Gestão do MPLA África do Sul.</p>
        </body>
      </html>
    `;
    safePrintHtml(receiptHtml, "Recibo-Oficial-MPLA");
    showToast("Comprovativo de quitação pronto para impressão!", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="banking-payments">
      
      {/* ABSA & VODAPAY GATEWAY BANNERS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ABSA PAY BANNER */}
        <div className="bg-linear-to-r from-[#DC0032] via-[#AA0028] to-[#660018] text-white p-5 rounded-3xl shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs text-white border border-white/20">
                absa
              </span>
              <h3 className="text-sm font-display font-black tracking-tight">
                Absa Pay • Instant EFT & DebiCheck
              </h3>
            </div>
            <p className="text-[11px] text-white/80">
              Pague quotas via Absa Pay Instant EFT ou débito automático mensal sem taxas adicionais.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 relative z-10">
            <button
              onClick={() => handleOpenAbsa(120, "Quotas Mensais de Membro", false)}
              className="px-3.5 py-2 bg-white text-[#DC0032] hover:bg-slate-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pagar Quota (R120)
            </button>

            <button
              onClick={() => handleOpenAbsa(120, "Quotas Mensais de Membro", true)}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-900 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
              Débito DebiCheck
            </button>
          </div>
        </div>

        {/* VODAPAY SUPERAPP BANNER */}
        <div className="bg-linear-to-r from-[#E60000] via-[#C8102E] to-[#990000] text-white p-5 rounded-3xl shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-white text-[#E60000] flex items-center justify-center font-black text-xs shadow-xs">
                <Zap className="w-4 h-4 fill-[#E60000]" />
              </span>
              <h3 className="text-sm font-display font-black tracking-tight">
                VodaPay Gateway • SuperApp & QR Code
              </h3>
              <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-0.5 rounded font-black">NOVO</span>
            </div>
            <p className="text-[11px] text-white/80">
              Pagamento instantâneo via Carteira Digital VodaPay, QR Code "Scan to Pay" ou Mobile Push.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 relative z-10">
            <button
              onClick={() => handleOpenVodaPay(120, "Quotas Mensais de Membro (VodaPay)", false)}
              className="px-3.5 py-2 bg-white text-[#E60000] hover:bg-slate-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              Scan QR / Pagar (R120)
            </button>

            <button
              onClick={() => handleOpenVodaPay(120, "Quotas Mensais de Membro (VodaPay)", true)}
              className="px-3.5 py-2 bg-black/40 hover:bg-black/60 text-white border border-white/30 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              VodaPay Auto-Debit
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Outstanding Balance card */}
        <div className="lg:col-span-5 bg-linear-to-br from-[#0F172A] via-slate-900 to-black text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-widest">Saldo Pendente de Quotas</p>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border ${
                (member.outstandingBalance || 0) === 0 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
                {(member.outstandingBalance || 0) === 0 ? "REGULARIZADO" : "PENDENTE"}
              </span>
            </div>
            <h3 className="text-4xl font-display font-black text-[#FFCC00] font-mono pt-1">
              R{member.outstandingBalance || 0}.00
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Equivalente a ≈ {Math.round((member.outstandingBalance || 0) * 56.45).toLocaleString()} AOA (Kwanzas).
            </p>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Gateway Absa Open Banking</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ATIVO & PROTEGIDO
            </span>
          </div>
        </div>

        {/* INDIVIDUAL VIRTUAL DEBIT CARD (WHOP PAYMENT SYSTEM) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#C8102E]" />
              <h4 className="font-display font-black text-slate-900 text-sm">Cartão de Débito Digital de Quotas</h4>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md border border-purple-200">
              Whop & Absa Integrated
            </span>
          </div>

          {/* Virtual Metallic Debit Card Display */}
          <div className={`p-5 rounded-2xl text-white shadow-xl relative overflow-hidden transition-all duration-300 ${
            cardStatus === 'Blocked' 
              ? "bg-linear-to-r from-slate-800 to-slate-950 opacity-80" 
              : "bg-linear-to-br from-[#1E293B] via-[#0F172A] to-[#C8102E]"
          }`}>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[9px] font-mono font-black tracking-widest text-[#FFCC00] uppercase block">MPLA DEBIT CARD</span>
                <span className="text-[8px] text-slate-300 font-mono">Militante: {member.membershipNo}</span>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded ${
                cardStatus === 'Active' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}>
                {cardStatus === 'Active' ? "ATIVO" : "BLOQUEADO"}
              </span>
            </div>

            {/* Card Balance & Details */}
            <div className="my-4 relative z-10 space-y-1">
              <p className="text-[9px] font-mono uppercase text-slate-400">Saldo Disponível no Cartão</p>
              <p className="text-2xl font-black font-mono text-[#FFCC00]">R{cardBalance}.00</p>
            </div>

            <div className="relative z-10 space-y-2">
              <p className="text-base font-mono font-bold tracking-widest text-slate-200">
                {showCardDetails ? cardNumber : `•••• •••• •••• ${cardNumber.slice(-4)}`}
              </p>
              
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Titular</span>
                  <span className="font-bold text-white uppercase">{member.fullName}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Validade</span>
                  <span className="font-bold text-white">{cardExpiry}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">CVV</span>
                  <span className="font-bold text-white">{showCardDetails ? cardCvv : "•••"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Card Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {showCardDetails ? <EyeOff className="w-4 h-4 text-slate-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
              {showCardDetails ? "Ocultar Detalhes" : "Ver Detalhes do Cartão"}
            </button>

            <button
              onClick={handleToggleBlockCard}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                cardStatus === 'Active'
                  ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200"
                  : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-200"
              }`}
            >
              <Lock className="w-4 h-4" />
              {cardStatus === 'Active' ? "Bloquear Cartão" : "Desbloquear Cartão"}
            </button>

            <button
              onClick={() => setShowFundModal(true)}
              className="flex-1 py-2 px-3 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Carregar Cartão
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE RECURRING DEBICHECK SUBSCRIPTIONS */}
      {memberSubs.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-[#DC0032]" />
              <h4 className="font-display font-black text-slate-900 text-sm">
                Minhas Subscrições Recorrentes Absa DebiCheck
              </h4>
            </div>
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              Débito Automático Activo
            </span>
          </div>

          <div className="space-y-3">
            {memberSubs.map(sub => (
              <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{sub.purpose}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Valor: <strong className="text-slate-900">R {sub.amount}.00 ZAR</strong> / {sub.interval === 'annual' ? 'Anual' : sub.interval === 'quarterly' ? 'Trimestral' : 'Mensal'} • Conta: {sub.accountName} ({sub.accountNumberMasked})
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Próxima Renovação</div>
                    <div className="font-black text-[#DC0032] font-mono">{sub.nextBillingDate}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Payment Form & Transaction History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-display font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-[#C8102E]" /> Efectuar Pagamento de Quotas
          </h4>

          {paymentSuccess ? (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-5 rounded-xl text-center space-y-2 animate-fade-in">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold">Quotas Processadas em Tempo Real!</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">A transação foi registada e o seu comprovativo já está disponível no Cofre de Documentos Oficiais.</p>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Finalidade da Quota</label>
                <select value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                  <option value="Quotas Mensais de Membro">Quotas Mensais de Membro (R120)</option>
                  <option value="Renovação de Inscrição Anual">Renovação de Inscrição Anual (R250)</option>
                  <option value="Contribuição Extraordinária">Contribuição Extraordinária / Doação</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Valor a Pagar (ZAR)</label>
                <input 
                  type="number" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(Number(e.target.value))} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                  min="10"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Método de Liquidação</label>
                <select 
                  value={payMethod} 
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="Absa Pay Instant EFT">Absa Pay Instant EFT (Open Banking)</option>
                  <option value="VodaPay Gateway (Vodacom)">VodaPay SuperApp (Scan QR / Mobile Push / In-App)</option>
                  <option value="Cartão Virtual Whop">Cartão Virtual Whop ({cardNumber.slice(-4)})</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 bg-[#DC0032] hover:bg-[#B30026] text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Processar Pagamento de R{payAmount}.00 via {payMethod}
              </button>
            </form>
          )}
        </div>

        {/* Real-Time Transaction Logs Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-display font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
            Histórico Real de Pagamentos & Recibos
          </h4>

          {member.paymentHistory && member.paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[9px]">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Valor</th>
                    <th className="pb-2">Finalidade</th>
                    <th className="pb-2 text-right">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {member.paymentHistory.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 font-mono text-[10px] text-slate-500">{tx.id}</td>
                      <td className="py-3 font-mono text-[10px]">{tx.date}</td>
                      <td className="py-3 font-mono font-bold text-slate-900">R{tx.amount}.00</td>
                      <td className="py-3 truncate max-w-[120px]">{tx.purpose}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handlePrintSingleReceipt(tx)}
                          className="p-1 hover:bg-slate-100 rounded text-[#DC0032] font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Imprimir Comprovativo Oficial"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Recibo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs font-mono bg-slate-50 rounded-xl border border-slate-100 p-4">
              Nenhuma transação efetuada até ao momento. O seu registo está regularizado.
            </div>
          )}
        </div>
      </div>

      {/* Fund Card Modal via Whop */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-black text-slate-900 text-sm">Carregar Cartão Virtual</h3>
              <button onClick={() => setShowFundModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFundCardSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Valor a Carregar (ZAR)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFundAmount(amt)}
                      className={`py-2 rounded-lg font-mono font-bold border transition ${
                        fundAmount === amt ? "bg-[#C8102E] text-white border-[#C8102E]" : "bg-slate-50 text-slate-800 border-slate-200"
                      }`}
                    >
                      R{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Valor Personalizado</label>
                <input 
                  type="number" 
                  value={fundAmount} 
                  onChange={(e) => setFundAmount(Number(e.target.value))} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold" 
                  min="50"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowFundModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" disabled={funding} className="px-4 py-2 bg-[#C8102E] text-white font-bold rounded-lg cursor-pointer shadow-sm hover:bg-red-700">
                  {funding ? "A Processar..." : `Carregar R${fundAmount}.00`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABSA PAYMENT MODAL */}
      <AbsaPaymentCheckoutModal
        isOpen={absaModalOpen}
        onClose={() => {
          setAbsaModalOpen(false);
          fetchSubscriptions();
        }}
        member={member}
        defaultAmount={absaModalAmount}
        defaultPurpose={absaModalPurpose}
        defaultIsRecurring={absaModalRecurring}
        onSuccess={(payment, updatedMember) => {
          fetchSubscriptions();
          onMakePayment(payment.amount, payment.purpose, payment.method);
        }}
      />

      {/* VODAPAY PAYMENT MODAL */}
      <VodaPayPaymentCheckoutModal
        isOpen={vodapayModalOpen}
        onClose={() => {
          setVodapayModalOpen(false);
        }}
        member={member}
        defaultAmount={vodapayModalAmount}
        defaultPurpose={vodapayModalPurpose}
        defaultIsRecurring={vodapayModalRecurring}
        onSuccess={(payment, updatedMember) => {
          onMakePayment(payment.amount, payment.purpose, payment.method);
        }}
      />
    </div>
  );
}

// ==========================================
// 7. EVENTS CAROUSEL VIEW
// ==========================================
const ConfettiBurst = () => {
  const particles = Array.from({ length: 60 }).map((_, i) => {
    const angle = Math.random() * 360;
    const distance = 40 + Math.random() * 120;
    const x = Math.cos(angle * (Math.PI / 180)) * distance;
    const y = Math.sin(angle * (Math.PI / 180)) * distance - 20;
    const size = 4 + Math.random() * 10;
    const duration = 1.2 + Math.random() * 1.5;
    const colors = ["#C8102E", "#FFCC00", "#16A34A", "#0F172A", "#FFFFFF"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return { id: i, x, y, size, duration, color, rotate: Math.random() * 720 };
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 100,
            opacity: [1, 1, 0],
            scale: [1, 1.3, 0.4],
            rotate: p.rotate
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
};

function EventsCarouselView({ member, events, onRegisterEvent }: { member: Member, events: PartyEvent[], onRegisterEvent: (eventId: string) => void }) {
  const [successEventId, setSuccessEventId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const handleRegister = (id: string) => {
    onRegisterEvent(id);
    setSuccessEventId(id);
  };

  const images = [
    EVENT_CONFERENCE_COVER,
    EVENT_RALLY_COVER,
    EVENT_WORKSHOP_COVER,
    EVENT_FORUM_COVER
  ];

  const activeEvent = events.find(e => e.id === successEventId);

  // Filter events based on selection
  const filteredEvents = events.filter(ev => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Plenary") return ev.title.toLowerCase().includes("plenário") || ev.title.toLowerCase().includes("assembleia");
    if (selectedFilter === "Campaign") return ev.title.toLowerCase().includes("campanha") || ev.organizer === "National";
    return true;
  });

  // Predefined WhatsApp Link compiler
  const getWhatsAppLink = (evt: PartyEvent) => {
    const whatsappMsg = `Saudações Camaradas!\n\nConfirmo a minha inscrição oficial no evento do MPLA Cape Town:\n\n🎟️ *COMPROVATIVO DE INSCRIÇÃO*\n----------------------------------------\n*Ref:* REC-MPLA-${evt.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}\n*Evento:* ${evt.title}\n*Data:* ${evt.date}\n*Local:* ${evt.location}\n*Organizador:* ${evt.organizer}\n\n👤 *DETALHES DO MILITANTE*\n*Nome:* ${member.fullName}\n*Código de Membro:* ${member.membershipNo}\n*Comité:* MPLA Cape Town - África do Sul\n*Sede Consular:* Goodwood, Cape Town\n----------------------------------------\nEnviado através do Portal de Militantes MPLA Cape Town.`;
    return `https://wa.me/27821234567?text=${encodeURIComponent(whatsappMsg)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in" id="events-carousel">
      {/* Premium Hero Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#C8102E]/30 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8102E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#FFCC00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C8102E]/20 text-red-400 rounded-full text-[10px] font-bold border border-[#C8102E]/40 uppercase tracking-widest font-mono">
            Agenda Oficial de Atividades
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-black text-white tracking-tight">Assembleias e Eventos MPLA</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consulte a programação oficial do <strong className="text-white">Comité do MPLA Cape Town</strong>. Inscreva-se nas sessões oficiais de militantes para confirmar a sua participação activa no auto-treino e plenários regionais.
          </p>
        </div>
      </div>

      {/* Tabs and Premium Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-2">
          {[
            { key: "All", label: "Todos os Eventos" },
            { key: "Plenary", label: "Plenários e Assembleias" },
            { key: "Campaign", label: "Campanhas e Sessões" }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === f.key
                  ? "bg-[#C8102E] text-white shadow-md shadow-red-700/10"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          A carregar dados seguros do Comité Consular de Cape Town...
        </span>
      </div>

      {/* Grid Layout of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev, idx) => {
          const isRegistered = ev.registeredMemberIds?.includes(member.id);
          const image = images[idx % images.length];
          const availableVacancies = ev.capacity - (ev.registeredCount || 0);
          const vacancyPercentage = (ev.registeredCount || 0) / ev.capacity;

          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs shrink-0 flex flex-col justify-between hover:border-[#C8102E]/40 hover:shadow-lg transition-all group duration-300">
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={ev.title} 
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-600/90 backdrop-blur-xs text-white text-[9px] font-mono rounded font-bold uppercase tracking-wider shadow-xs">
                  {ev.organizer}
                </div>
                {isRegistered && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-mono rounded font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Inscrito
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-display font-black text-slate-800 text-sm leading-snug line-clamp-1" title={ev.title}>
                    {ev.title}
                  </h3>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#C8102E] shrink-0" /> {ev.date}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" /> {ev.location}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {/* Vacancy visual indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono font-medium">
                      <span className="text-slate-400">Capacidade total: {ev.capacity}</span>
                      <span className={`font-bold ${availableVacancies < 10 ? "text-red-600 animate-pulse" : "text-emerald-600"}`}>
                        {availableVacancies} Vagas Disponíveis
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          vacancyPercentage > 0.9 ? "bg-red-600" : vacancyPercentage > 0.7 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, vacancyPercentage * 100)}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRegister(ev.id)}
                    disabled={isRegistered}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isRegistered 
                        ? "bg-emerald-50 text-[#16A34A] border border-emerald-100 cursor-default font-extrabold" 
                        : "bg-[#0F172A] hover:bg-red-700 text-white shadow-md hover:shadow-lg shadow-slate-900/10 cursor-pointer hover:border-red-700"
                    }`}
                  >
                    {isRegistered ? <Check className="w-4 h-4" /> : null}
                    {isRegistered ? "Inscrição Confirmada" : "Fazer Inscrição Oficial"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* POP-UP SUCCESS MICRO-INTERACTION MODAL WITH TICKET RECEIPT & WHATSAPP ACTION */}
      <AnimatePresence>
        {successEventId && activeEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-200 space-y-6 relative overflow-hidden my-8"
            >
              <ConfettiBurst />

              {/* Close Button */}
              <button 
                onClick={() => setSuccessEventId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="font-display font-black text-slate-900 text-base">Inscrição Efetuada com Sucesso!</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  A sua presença no evento foi registada e o Comité Central do Super Admin foi notificado.
                </p>
              </div>

              {/* HIGH-FIDELITY DIGITAL TICKET RECEIPT CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden shadow-inner font-mono text-[10px] leading-relaxed text-slate-700">
                {/* Receipt Header Banner */}
                <div className="bg-[#C8102E] text-white p-3.5 text-center font-display font-black text-xs tracking-wider flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#FFCC00] rounded-full animate-ping" />
                  <span>COMPROVATIVO DE INSCRIÇÃO</span>
                </div>

                <div className="p-4 space-y-3.5 relative">
                  {/* Dotted border line divider */}
                  <div className="absolute left-0 right-0 top-0 h-1 flex justify-between overflow-hidden opacity-30 select-none">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <span key={i} className="w-2 h-2 bg-slate-900 rounded-full shrink-0 -mt-1" />
                    ))}
                  </div>

                  {/* Receipt Meta */}
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2 text-[9px] text-slate-400">
                    <span>REF: REC-MPLA-{(activeEvent.id || "0").toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}</span>
                    <span>{new Date().toLocaleDateString("pt-AO")}</span>
                  </div>

                  {/* Event Details Section */}
                  <div className="space-y-2">
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-sans">Actividade / Plenário</p>
                    <p className="font-sans font-black text-slate-900 text-xs tracking-tight leading-snug">{activeEvent.title}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[8px] font-sans">DATA DO EVENTO</span>
                        <strong className="font-mono">{activeEvent.date}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] font-sans">ORGANIZAÇÃO</span>
                        <strong className="font-mono">{activeEvent.organizer}</strong>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-600">
                      <span className="text-slate-400 block text-[8px] font-sans">LOCAL DE REUNIÃO</span>
                      <strong className="font-mono break-all">{activeEvent.location}</strong>
                    </div>
                  </div>

                  {/* Dotted cutting divider */}
                  <div className="relative py-2">
                    <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-300" />
                    <div className="absolute -left-6 top-1.5 w-4 h-4 bg-white border-r border-slate-200 rounded-full shadow-inner" />
                    <div className="absolute -right-6 top-1.5 w-4 h-4 bg-white border-l border-slate-200 rounded-full shadow-inner" />
                  </div>

                  {/* Member Details Section */}
                  <div className="space-y-2 bg-white/60 p-2.5 rounded-lg border border-slate-200/50">
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold font-sans">Credenciais do Militante</p>
                    <div className="space-y-1 text-[9px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nome:</span>
                        <strong className="text-slate-800 text-right">{member.fullName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nº de Membro:</span>
                        <strong className="text-slate-900 font-bold">{member.membershipNo}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delegação:</span>
                        <strong className="text-slate-800">MPLA Cape Town</strong>
                      </div>
                    </div>
                  </div>

                  {/* Official stamp lookalike */}
                  <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-2 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-emerald-700 font-sans font-black text-[9px] uppercase tracking-wider block">INSCRIÇÃO DEFERIDA</span>
                      <span className="text-[8px] text-emerald-600 font-sans block">Código Verificado • MPLA Cape Town</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-dashed flex items-center justify-center text-emerald-600 font-bold text-[8px] rotate-12">
                      MPLA
                    </div>
                  </div>
                </div>
              </div>

              {/* EXPLICIT INSTRUCTION TO SCREENSHOT OR WHATSAPP */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2 text-xs">
                <p className="font-bold text-[#C8102E] flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> Acção Obrigatória do Militante:
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Por favor, <strong>tire uma captura de ecrã (screenshot)</strong> deste comprovativo para apresentar à entrada, ou clique no botão abaixo para <strong>enviar os detalhes da inscrição diretamente via WhatsApp</strong> ao Secretariado do Comité Consular.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold">
                <button
                  onClick={() => {
                    showToast("Use o atalho do seu dispositivo (ex: Volume + Power, ou Cmd+Shift+4) para guardar a imagem.", "info");
                    setSuccessEventId(null);
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Camera className="w-4 h-4" />
                  Tirar Screenshot
                </button>

                <a
                  href={getWhatsAppLink(activeEvent)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSuccessEventId(null)}
                  className="px-4 py-3 bg-[#16A34A] hover:bg-green-700 text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-green-700/10 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Enviar via WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 8. LEARNING CENTRE / NETFLIX STYLE LAYOUT
// ==========================================
function LearningCentreView({ member, courses, onCompleteCourse }: { member: Member, courses: LearningCourse[], onCompleteCourse: (courseId: string) => void }) {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [reflectionText, setReflectionText] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState<boolean | null>(null);
  const [studyTab, setStudyTab] = useState<"read" | "curriculum" | "case" | "quiz" | "media">("read");
  const [mediaFilter, setMediaFilter] = useState<"all" | "materials" | "classes" | "youtube" | "social">("all");
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    speaker?: string;
    date?: string;
    duration?: string;
    youtubeUrl?: string;
    recordingUrl?: string;
    slidesUrl?: string;
    summary?: string;
  } | null>(null);
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAudioTranscriber, setShowAudioTranscriber] = useState(false);

  const totalAssignments = courses.length;
  const completedCount = courses.filter(c => 
    member.completedCourses?.includes(c.id) || 
    (c.id === "pilar-1" && (member.completedCourses?.includes("c-1") || member.completedCourses?.includes("c_1")))
  ).length;
  const hasPassedAll = totalAssignments > 0 && completedCount === totalAssignments;

  const activeCourse = courses.find(c => c.id === activeCourseId);

  // Default fallback data for Pilar V and Academy multimedia & materials
  const fallbackMaterials = [
    {
      title: "Estatutos Consolidados do MPLA (Edição Diáspora 2026)",
      type: "Estatutos & Regulamentos",
      format: "PDF",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: "4.2 MB",
      category: "Doutrina",
      description: "Texto oficial consolidado dos Estatutos do Partido, definindo direitos, deveres, disciplina e princípios de organização partidária."
    },
    {
      title: "Cartilha de Cidadania & Apoio Consular na África do Sul",
      type: "Manual Prático",
      format: "PDF",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: "2.8 MB",
      category: "Comunidade",
      description: "Guia completo de regularização migratória, emissão de documentos consulares angolanos, registo civil e integração socioeconómica."
    },
    {
      title: "Compêndio de Discursos Fundamentais dos Líderes do MPLA",
      type: "Antologia Histórica",
      format: "E-Book",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: "6.1 MB",
      category: "História",
      description: "Coletânea dos pronunciamentos mais marcantes dos Presidentes Agostinho Neto, José Eduardo dos Santos e João Lourenço."
    },
    {
      title: "Caderno de Liderança de Quadros & Gestão de Estruturas",
      type: "Caderno Técnico",
      format: "PDF",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: "3.5 MB",
      category: "Liderança",
      description: "Metodologias de gestão de CAPs, elaboração de relatórios, técnicas de moderação de assembleias e protocolo político."
    },
    {
      title: "Pacote de Pílulas de Conhecimento para WhatsApp (Edição 2026)",
      type: "Infográficos & Microformação",
      format: "ZIP / Imagens",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: "8.7 MB",
      category: "Microlearning",
      description: "Conjunto de 12 infográficos oficiais e cartões visuais optimizados para difusão pedagógica em grupos e redes sociais."
    },
    {
      title: "Guia Passo-a-Passo do Cartão Digital & Certificação",
      type: "Tutorial Ilustrado",
      format: "PDF",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: "1.9 MB",
      category: "Tecnologia",
      description: "Instruções com capturas de ecrã para validar o cartão de membro com QR Code e solicitar o Certificado Oficial de Mérito."
    }
  ];

  const fallbackClasses = [
    {
      id: "class-1",
      title: "Aula Magna: História da Luta de Libertação e a Diáspora Africana",
      date: "15 de Janeiro de 2026",
      speaker: "Comitê Central • Direcção de Formação Ideológica",
      topic: "História & Fundação",
      duration: "58 minutos",
      youtubeId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slidesUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: "Análise profunda das origens do nacionalismo angolano, o papel decisivo da diáspora africana nos países da Linha da Frente e as etapas históricas da fundação do MPLA."
    },
    {
      id: "class-2",
      title: "Seminário Especial: Estatutos do Partido, Direitos e Disciplina Militante",
      date: "28 de Fevereiro de 2026",
      speaker: "Comissão de Auditoria, Ética e Disciplina Partidária",
      topic: "Estatutos & Ética",
      duration: "1h 12m",
      youtubeId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slidesUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: "Estudo comparado dos direitos e deveres dos militantes no exterior, processo de auscultação democrática interna, pagamento de quotas e disciplina partidária."
    },
    {
      id: "class-3",
      title: "Conferência: Relações Bilaterais Angola — África do Sul e a Diáspora na SADC",
      date: "12 de Março de 2026",
      speaker: "Secretariado para as Questões da Comunidade & Relações Externas",
      topic: "Diplomacia & SADC",
      duration: "1h 05m",
      youtubeId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slidesUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: "Panorâmica da cooperação estratégica entre Luanda e Pretória, acordos de mobilidade, integração de estudantes e trabalhadores e protecção da comunidade."
    },
    {
      id: "class-4",
      title: "Masterclass: Liderança, Comunicação Responsável e Combate à Desinformação",
      date: "02 de Abril de 2026",
      speaker: "Secretariado para Informação, Propaganda e Formação Militante",
      topic: "Comunicação Digital",
      duration: "48 minutos",
      youtubeId: "dQw4w9WgXcQ",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slidesUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: "Práticas modernas de oratória, criação de mensagens pedagógicas (pílulas de conhecimento), combate a notícias falsas nas redes e postura do militante online."
    }
  ];

  const fallbackSocial = [
    {
      title: "Grupo Oficial de Militantes MPLA — África do Sul",
      platform: "whatsapp" as const,
      url: "https://chat.whatsapp.com/MPLA-SouthAfrica-Militantes",
      description: "Canal central de comunicação directa com a coordenação nacional, convocatórias de assembleias e acolhimento comunitário.",
      badge: "Comunidade Oficial"
    },
    {
      title: "Canal de Avisos & Pílulas de Conhecimento no WhatsApp",
      platform: "whatsapp" as const,
      url: "https://whatsapp.com/channel/MPLA-Pilulas-Conhecimento-SA",
      description: "Microformação diária, sínteses dos estatutos, infográficos explicativos e comunicados urgentes para telemóvel.",
      badge: "Canal Verificado"
    },
    {
      title: "Página Oficial do MPLA na África do Sul (Facebook)",
      platform: "facebook" as const,
      url: "https://facebook.com/mpla.africadosul.oficial",
      description: "Transmissões em directo, coberturas fotográficas dos actos políticos e pronunciamentos oficiais.",
      badge: "Facebook Oficial"
    },
    {
      title: "Perfil Oficial @mpla_africadosul (Instagram)",
      platform: "instagram" as const,
      url: "https://instagram.com/mpla_africadosul",
      description: "Stories diários, coberturas dinâmicas, agendas das províncias e conteúdos visuais patrióticos.",
      badge: "Instagram Oficial"
    },
    {
      title: "Canal @mpla.diaspora (TikTok)",
      platform: "tiktok" as const,
      url: "https://tiktok.com/@mpla.diaspora",
      description: "Pílulas de vídeo curtas de 60 segundos com momentos históricos, curiosidades cívicas e dinamismo da juventude.",
      badge: "TikTok Oficial"
    },
    {
      title: "Rede de Quadros e Profissionais MPLA África do Sul (LinkedIn)",
      platform: "linkedin" as const,
      url: "https://linkedin.com/company/mpla-diaspora-south-africa",
      description: "Rede profissional para conectar quadros, académicos, engenheiros e empreendedores angolanos na África do Sul.",
      badge: "Rede Profissional"
    },
    {
      title: "Canal da Academia Política do MPLA (YouTube)",
      platform: "youtube" as const,
      url: "https://youtube.com/@mpla_africadosul_oficial",
      description: "Arquivo audiovisual com todas as aulas gravadas, documentários históricos, seminários e intervenções de dirigentes.",
      badge: "Vídeos & Aulas"
    }
  ];

  // When opening a course, reset the state
  const handleStartCourse = (courseId: string, initialTab: "read" | "curriculum" | "case" | "quiz" | "media" = "read") => {
    setActiveCourseId(courseId);
    setSelectedAnswers({});
    setReflectionText("");
    setQuizChecked(false);
    setQuizSuccess(null);
    setStudyTab(initialTab);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
    setQuizChecked(false); // reset checked state on selection
  };

  const handleVerifyQuiz = () => {
    if (!activeCourse || !activeCourse.quiz) return;
    
    // Check if all questions are answered
    const totalQuestions = activeCourse.quiz.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalQuestions) {
      showToast("Por favor, responda a todas as perguntas antes de verificar.", "warning");
      return;
    }

    let allCorrect = true;
    activeCourse.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] !== q.correctIndex) {
        allCorrect = false;
      }
    });

    setQuizChecked(true);
    setQuizSuccess(allCorrect);

    if (allCorrect) {
      // Award the completion!
      onCompleteCourse(activeCourse.id);
      showToast(`Parabéns! Módulo "${activeCourse.title}" concluído com distinção!`, "success");
    }
  };

  // Helper to render manual structured content nicely without raw ** signs
  const renderStructuredContent = (content: string) => {
    return content.split("\n\n").map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Helper to strip ** and replace with styled bold elements
      const renderTextWithBold = (text: string) => {
        const parts = text.split("**");
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} className="font-extrabold text-slate-900">{part}</strong>;
          }
          return part;
        });
      };

      if (trimmed.startsWith("# ")) {
        const txt = trimmed.replace("# ", "");
        return <h3 key={pIdx} className="text-xl font-display font-black text-slate-900 border-b pb-2 mb-4 mt-2">{renderTextWithBold(txt)}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        const txt = trimmed.replace("## ", "");
        return <h4 key={pIdx} className="text-sm font-black text-slate-800 uppercase tracking-wider font-mono border-l-2 border-[#C8102E] pl-2 mt-4 mb-2">{renderTextWithBold(txt)}</h4>;
      }
      if (trimmed.startsWith("### ")) {
        const txt = trimmed.replace("### ", "");
        return <h5 key={pIdx} className="text-xs font-bold text-slate-700 mt-3 mb-1">{renderTextWithBold(txt)}</h5>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map(li => li.replace(/^[-*]\s+/, ""));
        return (
          <ul key={pIdx} className="list-disc pl-5 space-y-2 text-xs text-slate-600 leading-relaxed my-2">
            {items.map((item, iIdx) => (
              <li key={iIdx}>{renderTextWithBold(item)}</li>
            ))}
          </ul>
        );
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split("\n").map(li => li.replace(/^\d+\.\s+/, ""));
        return (
          <ol key={pIdx} className="list-decimal pl-5 space-y-2 text-xs text-slate-600 leading-relaxed my-2">
            {items.map((item, iIdx) => (
              <li key={iIdx}>{renderTextWithBold(item)}</li>
            ))}
          </ol>
        );
      }
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return <p key={pIdx} className="text-xs font-bold text-slate-800 italic my-2">{trimmed.replace(/\*\*/g, "")}</p>;
      }
      if (trimmed === "---") {
        return <hr key={pIdx} className="my-4 border-slate-200" />;
      }
      return <p key={pIdx} className="text-xs text-slate-600 leading-relaxed my-2">{renderTextWithBold(trimmed)}</p>;
    });
  };

  if (activeCourse) {
    const isCompleted = member.completedCourses?.includes(activeCourse.id) ||
      (activeCourse.id === "pilar-1" && (member.completedCourses?.includes("c-1") || member.completedCourses?.includes("c_1")));

    const currentScenario = activeCourse.studyCase?.scenario || 
      (activeCourse.id === "c-1" ? "Numa célula de bairro, um militante recém-filiado propõe uma iniciativa de apoio a famílias, mas encontra resistência." : "Estudo prático de aplicação das normas e valores partidários.");
    const currentQuestion = activeCourse.studyCase?.reflectionQuestion || "Reflexão Doutrinária: Como atuaria perante este cenário, equilibrando a disciplina organizacional com o dever de solidariedade e iniciativa local?";
    const currentTask = activeCourse.studyCase?.practicalTask || "Identifique na sua comunidade uma necessidade concreta e registe o plano de acção no seu progresso.";

    return (
      <div className="space-y-6 animate-fade-in" id="active-study-module">
        {/* Breadcrumbs / Back button */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setActiveCourseId(null)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Voltar à Academia Política (5 Pilares)
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono bg-red-100 text-[#C8102E] px-2.5 py-1 rounded-full font-black border border-red-200">
              {activeCourse.pillarRoman || "ACADEMIA DO MPLA"}
            </span>
            <span className="text-[10px] uppercase font-mono bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
              Formação de Quadros
            </span>
          </div>
        </div>

        {/* Header Block */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10">
            <Award className="w-64 h-64 text-yellow-400" />
          </div>
          <div className="relative space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FFCC00] font-black bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                {activeCourse.pillarRoman || activeCourse.category}
              </span>
              <span className="text-[10px] font-mono text-slate-300">
                {activeCourse.pillarTitle}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-display font-black text-white leading-tight">
              {activeCourse.title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeCourse.description}
            </p>

            {activeCourse.targetAudience && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-amber-200/90 flex items-start gap-2">
                <Users className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono text-[10px] uppercase">Público-Alvo:</strong>
                  <span>{activeCourse.targetAudience}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-500" /> Duração: {activeCourse.duration}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className={`font-bold ${isCompleted ? "text-emerald-400" : "text-amber-400"}`}>
                {isCompleted ? "✓ Módulo Aprovado" : "Módulo em Curso"}
              </span>
            </div>
          </div>
        </div>

        {/* Study Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          <button
            onClick={() => setStudyTab("read")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              studyTab === "read"
                ? "border-[#C8102E] text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            1. Guia Curricular & Manual
          </button>
          <button
            onClick={() => setStudyTab("curriculum")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              studyTab === "curriculum"
                ? "border-[#C8102E] text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            2. Conteúdo Essencial & Formato
          </button>
          <button
            onClick={() => setStudyTab("case")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              studyTab === "case"
                ? "border-[#C8102E] text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            3. Estudo de Caso & Prática
          </button>
          {/* 4. Autoavaliação (Quiz) */}
          <button
            onClick={() => setStudyTab("quiz")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              studyTab === "quiz"
                ? "border-[#C8102E] text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            4. Autoavaliação (Quiz)
          </button>

          {/* 5. MATERIAIS EXTRA, AULAS & REDES SOCIAIS (EXCLUSIVO APENAS PARA O PILAR V) */}
          {(activeCourse.id === "pilar-5" || activeCourse.pillarNumber === 5) && (
            <button
              onClick={() => setStudyTab("media")}
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                studyTab === "media"
                  ? "border-[#C8102E] text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <span>5. Materiais Extra, Aulas & Redes Sociais</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#C8102E] text-white rounded-full font-bold uppercase">
                Pilar V
              </span>
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Reading area */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 max-h-[640px] overflow-y-auto">
            {studyTab === "read" && (
              <div className="space-y-4">
                {activeCourse.contentMarkdown && renderStructuredContent(activeCourse.contentMarkdown)}
              </div>
            )}

            {studyTab === "curriculum" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono border-l-2 border-[#C8102E] pl-2">
                    Estrutura Curricular Oficial do {activeCourse.pillarRoman || "Pilar"}
                  </h3>
                  <h4 className="text-base font-bold text-slate-900">{activeCourse.pillarTitle}</h4>
                </div>

                {/* Target Audience Banner */}
                {activeCourse.targetAudience && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Público-Alvo Específico:</span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{activeCourse.targetAudience}</p>
                  </div>
                )}

                {/* Essential Content Points */}
                {activeCourse.essentialContent && activeCourse.essentialContent.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-mono uppercase">
                      <Target className="w-4 h-4 text-[#C8102E]" /> Conteúdo Essencial Curricular:
                    </h5>
                    <div className="space-y-2">
                      {activeCourse.essentialContent.map((point, idx) => (
                        <div key={idx} className="p-3 bg-red-50/40 border border-red-100/70 rounded-xl flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#C8102E] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Format description */}
                {activeCourse.formatDescription && (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-800 flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-amber-700" /> Formato Pedagógico:
                    </span>
                    <p className="text-xs text-amber-950 font-semibold leading-relaxed">{activeCourse.formatDescription}</p>
                  </div>
                )}

                {/* Resources */}
                {activeCourse.resources && activeCourse.resources.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold text-slate-900 font-mono uppercase flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#C8102E]" /> Documentos & Manuais de Apoio:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeCourse.resources.map((res, rIdx) => (
                        <div key={rIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {res.type.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono font-bold">Oficial MPLA</span>
                          </div>
                          <p className="font-bold text-xs text-slate-900 leading-snug">{res.title}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{res.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {studyTab === "case" && (
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono border-l-2 border-[#C8102E] pl-2">
                    Estudo de Caso Prático ({activeCourse.pillarRoman || "Pilar"})
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/80">
                    "{currentScenario}"
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {currentQuestion}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 block">Escreva aqui a sua reflexão pessoal (Militante):</label>
                    <button
                      type="button"
                      onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                      className="text-xs text-[#C8102E] hover:text-[#A50D24] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{showVoiceRecorder ? "Fechar Microfone" : "Ditar por Voz (gemini-3.5-transcribe)"}</span>
                    </button>
                  </div>

                  {showVoiceRecorder && (
                    <div className="mb-2">
                      <AudioTranscriber
                        compact
                        title="Ditar Reflexão Doutrinária com Microfone"
                        description="Fale no microfone e clique em 'Transcrever com IA' para converter a sua fala em texto com o modelo gemini-3.5-transcribe."
                        onTranscribeComplete={(text) => {
                          setReflectionText((prev) => (prev ? `${prev}\n\n${text}` : text));
                          setShowVoiceRecorder(false);
                          showToast("Reflexão transcrita e inserida com sucesso!", "success");
                        }}
                      />
                    </div>
                  )}

                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Registe o seu pensamento estruturado à luz dos estatutos e directivas partidárias..."
                    className="w-full h-32 text-xs border border-slate-300 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!reflectionText.trim()) {
                        showToast("Por favor escreva a sua reflexão antes de guardar.", "warning");
                        return;
                      }
                      showToast("A sua reflexão de estudo foi gravada com sucesso no seu Registo de Progresso Pessoal.", "success");
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Gravar Notas de Estudo
                  </button>
                </div>

                <hr className="border-slate-200" />

                <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/50 space-y-2">
                  <h4 className="text-xs font-black text-[#C8102E] uppercase tracking-widest font-mono">
                    Tarefa de Acção Comunitária e Prática
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {currentTask}
                  </p>
                </div>
              </div>
            )}

            {studyTab === "quiz" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">Autoavaliação de Conhecimentos ({activeCourse.pillarRoman || "Pilar"})</h3>
                  <p className="text-xs text-slate-500">
                    Responda às questões oficiais extraídas do Manual Curricular da Academia Política do MPLA para validar o aproveitamento neste pilar.
                  </p>
                </div>

                {activeCourse.quiz && activeCourse.quiz.map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  const showIsWrong = quizChecked && selectedOpt !== q.correctIndex;
                  const showIsRight = quizChecked && selectedOpt === q.correctIndex;

                  return (
                    <div key={qIdx} className={`p-4 rounded-xl border ${
                      showIsWrong ? "bg-rose-50 border-rose-100 text-rose-950" :
                      showIsRight ? "bg-emerald-50 border-emerald-100 text-emerald-950" :
                      "bg-slate-50 border-slate-200 text-slate-800"
                    } space-y-3`}>
                      <p className="text-xs font-bold leading-relaxed">{qIdx + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOpt === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              className={`w-full text-left p-2.5 text-xs rounded-lg border transition flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? "bg-slate-900 text-white border-slate-900 font-bold" 
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FFCC00]" />}
                            </button>
                          );
                        })}
                      </div>
                      {quizChecked && (
                        <div className="space-y-1 pt-1">
                          <p className={`text-[10px] font-mono font-bold ${showIsRight ? "text-emerald-700" : "text-rose-700"}`}>
                            {showIsRight ? "✓ Resposta Correta!" : `✗ Incorreta. A resposta certa era: "${q.options[q.correctIndex]}"`}
                          </p>
                          {q.explanation && (
                            <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200/50 leading-relaxed">
                              <strong>Nota Doutrinária:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2">
                  {quizSuccess ? (
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center gap-3">
                      <Check className="w-8 h-8 text-emerald-600 bg-white rounded-full p-1" />
                      <div>
                        <h4 className="text-xs font-bold">Módulo Aprovado com Sucesso!</h4>
                        <p className="text-[10px] text-emerald-800">
                          Parabéns camarada! Respondeu com precisão às questões deste pilar e acumulou créditos para a obtenção do Certificado Oficial de Mérito e Formação Política.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleVerifyQuiz}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Submeter e Verificar Respostas
                      </button>
                      {quizSuccess === false && (
                        <p className="text-rose-600 text-[10px] text-center font-bold font-mono">
                          Algumas respostas não estão em conformidade com os estatutos. Reveja o guia curricular e tente novamente!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: MATERIAIS EXTRA, AULAS & REDES SOCIAIS (EXCLUSIVO APENAS PARA O PILAR V) */}
            {studyTab === "media" && (activeCourse.id === "pilar-5" || activeCourse.pillarNumber === 5) && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#800000] text-white p-5 rounded-2xl border border-red-900/40 relative overflow-hidden space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Pilar V • Diáspora Conectada
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Acesso Livre a Militantes
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Recursos Multimédia, Aulas Gravadas & Redes Sociais Oficiais
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-2xl">
                    Aceda aos materiais extra em PDF, assista às aulas anteriores e vídeos no YouTube, e junte-se aos grupos de WhatsApp, Facebook, Instagram, TikTok e LinkedIn do MPLA na África do Sul.
                  </p>
                </div>

                {/* Sub-Filter Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                  {[
                    { id: "all", label: "Todos os Conteúdos" },
                    { id: "social", label: "Grupos WhatsApp & Redes Sociais" },
                    { id: "classes", label: "Aulas Anteriores" },
                    { id: "youtube", label: "Vídeos no YouTube" },
                    { id: "materials", label: "Materiais Extra & PDFs" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setMediaFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        mediaFilter === tab.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* SECTION 1: SOCIAL MEDIA & WHATSAPP GROUPS */}
                {(mediaFilter === "all" || mediaFilter === "social") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#C8102E]" />
                        Grupos de WhatsApp & Redes Sociais do MPLA
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">Canais Oficiais Verificados</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* WhatsApp Group 1 */}
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                              <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700">Comunidade SA</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">
                            Grupo Oficial de Militantes MPLA África do Sul
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Canal central para avisos do Secretariado, convocatórias de assembleias e acolhimento comunitário.
                          </p>
                        </div>
                        <a
                          href="https://chat.whatsapp.com/MPLA-SouthAfrica-Militantes"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showToast("A abrir ligação para o Grupo Oficial de WhatsApp...", "info")}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Entrar no Grupo WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>

                      {/* WhatsApp Channel (Pílulas de Conhecimento) */}
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                              <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700">Microformação</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">
                            Canal de Avisos & Pílulas de Conhecimento
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Receba no seu smartphone resumos dos estatutos, infográficos patrióticos e comunicados directos.
                          </p>
                        </div>
                        <a
                          href="https://whatsapp.com/channel/MPLA-Pilulas-Conhecimento-SA"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showToast("A abrir Canal de Pílulas de Conhecimento no WhatsApp...", "info")}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Aderir ao Canal WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>

                      {/* Facebook */}
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between space-y-3 hover:border-blue-300 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-100 text-blue-800">
                              <Facebook className="w-3 h-3 text-blue-600" /> Facebook
                            </span>
                            <span className="text-[10px] font-mono font-bold text-blue-700">Página Oficial</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">
                            Página Oficial do MPLA na África do Sul
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Transmissões em directo, coberturas fotográficas dos actos políticos, discursos e notícias comunitárias.
                          </p>
                        </div>
                        <a
                          href="https://facebook.com/mpla.africadosul.oficial"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showToast("A abrir Página Oficial no Facebook...", "info")}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Facebook className="w-3.5 h-3.5" />
                          <span>Seguir Página no Facebook</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>

                      {/* Instagram */}
                      <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/40 flex flex-col justify-between space-y-3 hover:border-pink-300 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-pink-100 text-pink-800">
                              <Instagram className="w-3 h-3 text-pink-600" /> Instagram
                            </span>
                            <span className="text-[10px] font-mono font-bold text-pink-700">@mpla_africadosul</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">
                            Perfil Oficial no Instagram
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Stories de encontros comunitários, destaques comemorativos e conteúdos visuais sobre Angola.
                          </p>
                        </div>
                        <a
                          href="https://instagram.com/mpla_africadosul"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showToast("A abrir Perfil Oficial no Instagram...", "info")}
                          className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>Seguir no Instagram</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>

                      {/* TikTok */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3 hover:border-slate-400 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-900 text-white">
                              TikTok
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-600">@mpla.diaspora</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">
                            Canal Oficial no TikTok
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Pílulas de vídeo curtas de 60 segundos com momentos históricos, dinamismo da JMPLA e cidadania.
                          </p>
                        </div>
                        <a
                          href="https://tiktok.com/@mpla.diaspora"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showToast("A abrir Canal Oficial no TikTok...", "info")}
                          className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Assistir no TikTok</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>

                      {/* LinkedIn */}
                      <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 flex flex-col justify-between space-y-3 hover:border-sky-300 transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-sky-100 text-sky-800">
                              <Linkedin className="w-3 h-3 text-sky-700" /> LinkedIn
                            </span>
                            <span className="text-[10px] font-mono font-bold text-sky-700">Rede Profissional</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">
                            Rede de Quadros & Profissionais MPLA África do Sul
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Networking para engenheiros, académicos, médicos, estudantes universitários e líderes angolanos.
                          </p>
                        </div>
                        <a
                          href="https://linkedin.com/company/mpla-diaspora-south-africa"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => showToast("A abrir Rede Profissional no LinkedIn...", "info")}
                          className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>Conectar no LinkedIn</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: PREVIOUS CLASSES (AULAS ANTERIORES) */}
                {(mediaFilter === "all" || mediaFilter === "classes") && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-[#C8102E]" />
                        Arquivo de Aulas Anteriores & Masterclasses Gravadas
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">4 Sessões Disponíveis</span>
                    </div>

                    <div className="space-y-3">
                      {(activeCourse.previousClasses && activeCourse.previousClasses.length > 0 ? activeCourse.previousClasses : fallbackClasses).map((cls) => (
                        <div key={cls.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-100 text-[#C8102E]">
                                {cls.topic}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {cls.date}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {cls.duration}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="font-bold text-xs text-slate-900 leading-snug">
                              {cls.title}
                            </h5>
                            <p className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded inline-block">
                              Prelector: {cls.speaker}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                              {cls.summary}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setActiveVideoModal({
                                  title: cls.title,
                                  speaker: cls.speaker,
                                  date: cls.date,
                                  duration: cls.duration,
                                  youtubeUrl: cls.youtubeUrl,
                                  recordingUrl: cls.recordingUrl,
                                  slidesUrl: cls.slidesUrl,
                                  summary: cls.summary
                                })}
                                className="px-3 py-1.5 bg-[#C8102E] hover:bg-[#A50D24] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Assistir Aula Gravada</span>
                              </button>
                              <a
                                href={cls.youtubeUrl || "https://youtube.com"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-red-200 cursor-pointer"
                              >
                                <Youtube className="w-3.5 h-3.5 text-red-600" />
                                <span>Ver no YouTube</span>
                              </a>
                            </div>

                            <a
                              href={cls.slidesUrl || "#"}
                              onClick={(e) => {
                                if (!cls.slidesUrl || cls.slidesUrl === "#") {
                                  e.preventDefault();
                                  showToast("A descarregar Diapositivos em PDF da aula...", "success");
                                }
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1 border border-slate-200"
                            >
                              <FileDown className="w-3.5 h-3.5 text-slate-500" />
                              <span>Diapositivos (PDF)</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: YOUTUBE VIDEO LINKS */}
                {(mediaFilter === "all" || mediaFilter === "youtube") && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-600" />
                        Transmissões & Vídeos Oficiais no YouTube
                      </h4>
                      <a 
                        href="https://youtube.com/@mpla_africadosul_oficial" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        Subscrever Canal Oficial <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        {
                          title: "Discurso Inaugural da Academia Política na África do Sul",
                          duration: "42 min",
                          views: "1.4k visualizações",
                          url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
                          speaker: "Primeiro Secretário do Comité"
                        },
                        {
                          title: "Documentário: O Papel da Diáspora Angolana na SADC",
                          duration: "35 min",
                          views: "2.1k visualizações",
                          url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
                          speaker: "Comissão de História Partidária"
                        },
                        {
                          title: "Guia Visual: Como Utilizar o Portal Digital do Militante",
                          duration: "18 min",
                          views: "3.8k visualizações",
                          url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
                          speaker: "Secretariado para Informação e Mídia Digital"
                        },
                        {
                          title: "Webinar Plenário: Direitos Cívicos e Apoio Consular na Diáspora",
                          duration: "52 min",
                          views: "980 visualizações",
                          url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
                          speaker: "Secretariado para Questões da Comunidade"
                        }
                      ].map((vid, vIdx) => (
                        <div key={vIdx} className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col justify-between space-y-3 border border-slate-800 hover:border-red-600/50 transition group">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span className="flex items-center gap-1 text-red-400 font-bold">
                                <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Oficial
                              </span>
                              <span>{vid.duration}</span>
                            </div>
                            <h5 className="font-bold text-xs text-white group-hover:text-amber-300 transition leading-snug">
                              {vid.title}
                            </h5>
                            <p className="text-[10px] text-slate-400">
                              Prelector / Responsável: {vid.speaker}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">{vid.views}</span>
                            <a
                              href={vid.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Assistir no YouTube</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: EXTRA MATERIALS (MATERIAIS EXTRA & DOCUMENTOS) */}
                {(mediaFilter === "all" || mediaFilter === "materials") && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#C8102E]" />
                        Materiais Extra, Estatutos & Cadernos Doutrinários
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">Acervo Oficial 2026</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {(activeCourse.extraMaterials && activeCourse.extraMaterials.length > 0 ? activeCourse.extraMaterials : fallbackMaterials).map((mat, mIdx) => (
                        <div key={mIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-300 hover:bg-white transition">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-200 text-slate-700">
                                {mat.format} • {mat.size}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {mat.category || "Oficial"}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-900 leading-snug">
                              {mat.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {mat.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                              {mat.type}
                            </span>
                            <a
                              href={mat.url || "#"}
                              onClick={() => {
                                showToast(`A descarregar "${mat.title}"...`, "success");
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar Ficheiro</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area: Course details & progress */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono border-b pb-2">
                Informações do {activeCourse.pillarRoman || "Pilar"}
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Pilar Curricular:</span>
                  <span className="font-bold text-[#C8102E] font-mono">{activeCourse.pillarRoman || "Pilar"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Categoria Temática:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeCourse.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Autoavaliação:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeCourse.quiz?.length || 0} perguntas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Regime:</span>
                  <span className="font-bold text-slate-800 font-mono">Presencial & E-learning</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Award className="w-7 h-7 text-amber-600" />
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  hasPassedAll 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                    : "bg-amber-100 text-amber-800 border-amber-200"
                }`}>
                  {hasPassedAll ? "Homologado" : `${completedCount}/${totalAssignments} Pilares`}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Certificado Oficial da Academia</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {hasPassedAll 
                  ? "Parabéns! Completou com êxito todos os 5 Pilares da Academia Política do MPLA. O seu Certificado Oficial emitido pelo Secretário-Geral e pelo Presidente da República está homologado."
                  : `O Certificado Oficial de Mérito exige aprovação em todos os 5 Pilares Estratégicos da formação partidária (${completedCount} de ${totalAssignments} concluídos).`}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    hasPassedAll
                      ? "bg-[#C8102E] hover:bg-[#A50D24] text-white"
                      : "bg-slate-900 hover:bg-slate-950 text-white"
                  }`}
                >
                  {hasPassedAll ? (
                    <>
                      <Award className="w-4 h-4 text-[#FFCC00]" />
                      <span>Emitir Certificado Oficial (PDF)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Requisitos do Certificado</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter courses by pillar if selected
  const displayedCourses = pillarFilter === "all" 
    ? courses 
    : courses.filter(c => c.id === pillarFilter || c.id === `pilar-${pillarFilter}`);

  return (
    <div className="space-y-8 animate-fade-in" id="learning-academy">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-[#C8102E]">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              Academia Política do MPLA
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Estrutura Curricular em <strong>5 Pilares Estratégicos</strong> para Formação Doutrinária, Cívica e de Liderança de Militantes, Quadros e Diáspora na África do Sul.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAudioTranscriber(!showAudioTranscriber)}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer shadow-xs"
        >
          <Mic className="w-3.5 h-3.5 text-[#C8102E]" />
          <span>{showAudioTranscriber ? "Fechar Gravador" : "Transcrever Áudio (gemini-3.5-transcribe)"}</span>
        </button>
      </div>

      {showAudioTranscriber && (
        <AudioTranscriber
          title="Transcrição de Áudio de Formação & Palestras"
          description="Grave notas com o microfone ou carregue ficheiros de conferências políticas para transcrever com alta precisão usando o modelo gemini-3.5-transcribe."
          placeholder="O texto transcrito da formação aparecerá aqui..."
          onTranscribeComplete={(text) => {
            showToast("Áudio transcrito com sucesso!", "success");
          }}
        />
      )}

      {/* DEDICATED CSS PROGRESS BAR COMPONENT FOR CERTIFICATION */}
      <CertificationProgressBar
        courses={courses}
        completedCourseIds={member.completedCourses || []}
        onOpenCertificateModal={() => setIsCertModalOpen(true)}
        onSelectCourse={(cId) => handleStartCourse(cId)}
      />

      {/* Official Certificate Progression Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        hasPassedAll 
          ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-emerald-200" 
          : "bg-gradient-to-r from-amber-50/70 via-red-50/40 to-slate-50 border-amber-200/80"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C8102E]" />
              <h3 className="font-display font-black text-sm text-slate-900 uppercase tracking-wide">
                Certificado Oficial de Mérito & Formação Política
              </h3>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                hasPassedAll 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                  : "bg-amber-100 text-amber-900 border-amber-200"
              }`}>
                {hasPassedAll ? "100% Concluído" : "Acesso Condicionado"}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {hasPassedAll 
                ? `O camarada ${member.fullName} concluiu com aproveitamento integral todos os 5 Pilares da Academia Política do MPLA. O Certificado Oficial assinado pelo Secretário-Geral do MPLA e pelo Presidente da República está homologado!`
                : `Conforme os estatutos, o Certificado Oficial do MPLA só é gerado após o militante completar todas as avaliações dos 5 Pilares Estratégicos (${completedCount} de ${totalAssignments} concluídos).`}
            </p>
            {/* Progress bar */}
            <div className="max-w-md pt-1 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600">
                <span>Progresso nos 5 Pilares:</span>
                <span className="text-[#C8102E]">{completedCount} de {totalAssignments} Pilares ({totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#C8102E] to-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalAssignments > 0 ? (completedCount / totalAssignments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCertModalOpen(true)}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
              hasPassedAll 
                ? "bg-[#C8102E] hover:bg-[#A50D24] text-white shadow-red-200" 
                : "bg-slate-900 hover:bg-slate-950 text-white"
            }`}
          >
            {hasPassedAll ? (
              <>
                <Award className="w-4 h-4 text-[#FFCC00]" />
                <span>Emitir Certificado Oficial (PDF)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Requisitos ({completedCount}/{totalAssignments})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanatory Banner of the 5 Pillars Architecture */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-700 text-xs leading-relaxed space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#C8102E]" />
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide font-mono">
            Arquitetura Curricular da Academia Política em 5 Pilares
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          A Academia Política do MPLA na Diáspora da África do Sul estrutura a formação do militante em cinco pilares complementares que acompanham desde os primeiros passos da filiação até à liderança de quadros e docência política.
        </p>

        {/* Pillars Filter Tabs */}
        <div className="pt-1 flex flex-wrap gap-2">
          <button
            onClick={() => setPillarFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              pillarFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
            }`}
          >
            Todos os 5 Pilares
          </button>
          {[
            { id: "pilar-1", label: "PILAR I: Acolhimento" },
            { id: "pilar-2", label: "PILAR II: Ideologia Contínua" },
            { id: "pilar-3", label: "PILAR III: Quadros & Liderança" },
            { id: "pilar-4", label: "PILAR IV: Formadores" },
            { id: "pilar-5", label: "PILAR V: Digital & Diáspora" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPillarFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                pillarFilter === tab.id
                  ? "bg-[#C8102E] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[#C8102E]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Pillars Cards Listing */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course, idx) => {
            const isCompleted = member.completedCourses?.includes(course.id) ||
              (course.id === "pilar-1" && (member.completedCourses?.includes("c-1") || member.completedCourses?.includes("c_1")));
            const pillarBadge = course.pillarRoman || `PILAR ${idx + 1}`;

            return (
              <div 
                key={course.id} 
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition ${
                  isCompleted ? "border-emerald-200" : "border-slate-200 hover:border-amber-400/60"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Badge Row */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 bg-red-50 text-[#C8102E] border border-red-100 rounded text-[9px] font-mono font-black uppercase tracking-wider">
                        {pillarBadge}
                      </span>
                      <h4 className="font-display font-black text-slate-900 text-sm leading-snug">
                        {course.pillarTitle || course.title}
                      </h4>
                    </div>
                    {isCompleted ? (
                      <span className="text-[9px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        ✓ Concluído
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                        Pendente
                      </span>
                    )}
                  </div>

                  {/* Target Audience Box */}
                  {course.targetAudience && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Público-Alvo:</span>
                      <p className="text-[11px] text-slate-700 font-medium leading-relaxed line-clamp-2">
                        {course.targetAudience}
                      </p>
                    </div>
                  )}

                  {/* Essential Content Bullets */}
                  {course.essentialContent && course.essentialContent.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                        Conteúdo Essencial:
                      </span>
                      <ul className="space-y-1">
                        {course.essentialContent.slice(0, 4).map((bullet, bIdx) => (
                          <li key={bIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-snug">
                            <span className="text-[#C8102E] font-bold mt-0.5">•</span>
                            <span className="line-clamp-1">{bullet}</span>
                          </li>
                        ))}
                        {course.essentialContent.length > 4 && (
                          <li className="text-[10px] text-slate-400 font-mono italic pl-2.5">
                            + {course.essentialContent.length - 4} tópicos adicionais
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Format description */}
                  {course.formatDescription && (
                    <div className="pt-1 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 leading-snug">
                      <strong className="font-mono text-[9px] uppercase block text-amber-800">Formato:</strong>
                      {course.formatDescription}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                    <span>Carga: {course.duration || "4 horas"}</span>
                    <span>{course.quiz?.length || 3} Questões de Exame</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {isCompleted ? (
                    <button
                      onClick={() => handleStartCourse(course.id)}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition text-center cursor-pointer border border-emerald-200 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rever Pilar & Autoavaliação</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartCourse(course.id)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Iniciar Formação do Pilar</span>
                    </button>
                  )}

                  {/* Quick Access to Extra Materials, Classes & Social Channels (EXCLUSIVO APENAS PARA O PILAR V) */}
                  {(course.id === "pilar-5" || course.pillarNumber === 5) && (
                    <button
                      onClick={() => handleStartCourse(course.id, "media")}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-[#C8102E] text-xs font-bold rounded-xl transition text-center cursor-pointer border border-red-200 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Materiais Extra, Aulas & Redes Sociais</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Lecture Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold tracking-wider">
                  Aula Gravada • Academia Política do MPLA
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              <video
                controls
                className="w-full h-full object-cover"
                src={activeVideoModal.recordingUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                poster="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
              >
                O seu navegador não suporta reprodução directa de vídeo.
              </video>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between text-slate-400 font-mono text-[11px] gap-2">
                <span>Prelector: <strong className="text-white">{activeVideoModal.speaker}</strong></span>
                <span>{activeVideoModal.date} • {activeVideoModal.duration}</span>
              </div>
              <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-[11px]">
                {activeVideoModal.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <a
                href={activeVideoModal.youtubeUrl || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Youtube className="w-4 h-4" />
                <span>Abrir Vídeo no YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={activeVideoModal.slidesUrl || "#"}
                onClick={() => showToast("A descarregar Diapositivos em PDF da aula...", "success")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Diapositivos (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      <OfficialMemberCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        member={member}
        courses={courses}
        onGoToCourse={(courseId) => handleStartCourse(courseId)}
      />
    </div>
  );
}

// ==========================================
// 9. NEWS FEED / MODERN NEWS LAYOUT
// ==========================================
function NewsFeedView({ announcements }: { announcements: Announcement[] }) {
  const images = [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=60"
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="news-feed">
      <div className="space-y-1">
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Comunicados & Notícias Oficiais</h2>
        <p className="text-xs text-slate-500">Acompanhe as notícias de última hora, comunicados de imprensa e campanhas activas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((news, idx) => (
          <div key={news.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#C8102E]/35 transition-all flex flex-col justify-between">
            <div className="relative h-48 bg-slate-100">
              <img src={images[idx % images.length]} className="w-full h-full object-cover" alt="News Cover" />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#C8102E] text-white text-[9px] font-mono rounded font-bold uppercase">
                {news.source}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {news.date} • 3 min de leitura
                </span>
                <h3 className="font-display font-black text-slate-900 text-sm leading-snug">{news.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">{news.content}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono font-bold">Autor: {news.author}</span>
                <div className="flex gap-2 text-slate-400">
                  <button onClick={() => showToast("Publicação curtida!", "success")} className="p-1 hover:bg-slate-100 rounded text-[#C8102E] cursor-pointer"><Heart className="w-4 h-4" /></button>
                  <button onClick={() => showToast("Publicação guardada nos favoritos!", "info")} className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"><Bookmark className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. MESSAGES / MESSENGER INTERFACE
// ==========================================
// ==========================================
// 10. MESSAGES / MESSENGER INTERFACE
// ==========================================
function MessagesEmptyState({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto space-y-6 animate-fade-in bg-white rounded-3xl">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C8102E]/10 via-[#FFCC00]/5 to-[#16A34A]/5 rounded-full blur-2xl animate-pulse" />
        
        {/* Interlocking Rings */}
        <div className="absolute w-36 h-36 border border-slate-100 rounded-full" />
        <div className="absolute w-28 h-28 border border-dashed border-[#FFCC00]/40 rounded-full animate-spin-slow" />
        
        {/* Yellow Bubble (Left / Back) */}
        <div className="absolute transform -translate-x-6 translate-y-2 bg-[#FFCC00] text-slate-900 px-3.5 py-2 rounded-2xl rounded-bl-none shadow-md border border-amber-300 flex items-center gap-1">
          <span className="text-[10px] font-mono font-black">★</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-200" />
            <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-300" />
          </div>
        </div>

        {/* Red Bubble (Right / Front) */}
        <div className="absolute transform translate-x-6 -translate-y-4 bg-[#C8102E] text-white px-4 py-2.5 rounded-2xl rounded-br-none shadow-lg flex flex-col gap-1 z-10 border border-red-700">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[7px] font-bold uppercase tracking-wider text-slate-200">MPLA SECURE</span>
          </div>
          <p className="text-[10px] font-semibold text-left">Camarada...</p>
        </div>

        {/* Small floating accents */}
        <div className="absolute top-2 left-6 w-2.5 h-2.5 bg-[#16A34A] rounded-full animate-pulse" />
        <div className="absolute bottom-4 right-10 text-[#FFCC00] text-sm font-black animate-bounce">★</div>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display font-black text-slate-900 text-sm">Sem Mensagens Activas</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
          A sua caixa de correio seguro com o Secretariado está limpa. Aqui pode tirar dúvidas directamente com os oficiais do partido.
        </p>
      </div>

      <button
        onClick={onStartChat}
        className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md hover:shadow-red-500/20 flex items-center gap-2 cursor-pointer mx-auto"
      >
        <MessageSquare className="w-4 h-4 text-[#FFCC00]" />
        Iniciar Conversa de Boas-Vindas
      </button>
    </div>
  );
}

function MessagesMessengerView({ member }: { member: Member }) {
  const [messages, setMessages] = useState<Array<{ sender: string; name: string; text: string; time: string }>>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    const newMsg = { sender: "member", name: member.fullName, text: typedMessage, time: "Agora" };
    setMessages([...messages, newMsg]);
    setTypedMessage("");

    // Secretariado automatic acknowledgment
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "officer", name: `Secretário do Comité ${member.committee}`, text: `Saudações camarada ${member.fullName}. Recebemos a sua mensagem e responderemos em breve.`, time: "Agora" }
      ]);
    }, 1200);
  };

  const handleStartChat = () => {
    setMessages([
      { sender: "officer", name: `Secretário do Comité ${member.committee}`, text: `Olá camarada ${member.fullName}, seja bem-vindo ao canal de mensagens directas da Direcção do MPLA. Como podemos ajudar hoje?`, time: "Agora" }
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden h-[520px] shadow-xs" id="messenger-panel">
      {/* Channels Sidebar List */}
      <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider">Conversas Directas</h3>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Comité {member.committee}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {messages.length > 0 ? (
            <div className="p-4 bg-white flex gap-3 cursor-pointer border-l-4 border-[#C8102E]">
              <div className="w-10 h-10 bg-[#C8102E]/10 rounded-full flex items-center justify-center text-[#C8102E] shrink-0 font-bold">
                {member.committee.substring(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 truncate">{member.committee}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Hoje</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                  {messages[messages.length - 1]?.text || "Inicie a conversa..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[11px] text-slate-400 font-mono">
              Nenhuma conversa activa. Clique abaixo para contactar a liderança.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-8 flex flex-col justify-between h-full bg-white relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-white p-6">
            <MessagesEmptyState onStartChat={handleStartChat} />
          </div>
        ) : (
          <>
            {/* Chat window top header bar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#16A34A] rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Secretariado do {member.committee}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Canal Seguro</span>
            </div>

            {/* Scrollable messages container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "member" ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] text-xs ${
                    msg.sender === "member" 
                      ? "bg-[#C8102E] text-white rounded-br-none" 
                      : "bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-2xs"
                  }`}>
                    <p className="font-bold text-[10px] opacity-80 mb-1">{msg.name}</p>
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom typed input tray */}
            <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
              <input 
                type="text" 
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Escreva a sua mensagem para o comité..." 
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#C8102E]"
              />
              <button type="submit" className="p-2.5 bg-[#C8102E] text-white rounded-xl hover:bg-red-700 transition shadow-sm cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 11. COMMUNITY / SOCIAL FÖRD
// ==========================================
function CommunitySocialView({ member, polls, onCastVote }: { member: Member, polls: SurveyPoll[], onCastVote: (pollId: string, option: string) => void }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Maria Fernandes",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      text: "Excelente ver a nossa delegação em Cape Town a crescer com tanto empenho dos jovens militantes. Juntos pelo progresso de Angola! 🇦🇴❤️",
      likes: 18,
      dislikes: 1,
      comments: 4,
      liked: false,
      disliked: false,
      commentsList: [
        { author: "Camarada João Neto", text: "Completamente de acordo! A juventude é a nossa maior força.", date: "Há 2 horas" },
        { author: "Maria Fernandes", text: "Obrigada camarada, vamos em frente!", date: "Há 1 hora" },
        { author: "António G.", text: "Viva Angola! Viva o MPLA!", date: "Há 45 min" },
        { author: "Camarada Tunisia Sebastião", text: "Excelente iniciativa para mobilizar os novos militantes no nosso comité de Cape Town.", date: "Há 10 min" }
      ]
    },
    {
      id: 2,
      author: "Camarada João Neto",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      text: "Lembrete: o plenário de debate político ideológico de sábado terá início às 14:00 em ponto na Sede Consular de Goodwood, Cape Town. Não faltem!",
      likes: 12,
      dislikes: 0,
      comments: 2,
      liked: false,
      disliked: false,
      commentsList: [
        { author: "Lando S.", text: "Lá estarei com certeza!", date: "Há 1 dia" },
        { author: "Camarada Raquel Correia", text: "Importante presença de todos os militantes.", date: "Há 18 horas" }
      ]
    }
  ]);
  const [newPostText, setNewPostText] = useState("");
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [sharedMsg, setSharedMsg] = useState<{[key: number]: string}>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: member.fullName,
      avatar: member.photo,
      text: newPostText,
      likes: 0,
      dislikes: 0,
      comments: 0,
      liked: false,
      disliked: false,
      commentsList: []
    };
    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const wasLiked = p.liked;
        const wasDisliked = p.disliked;
        return {
          ...p,
          liked: !wasLiked,
          likes: wasLiked ? p.likes - 1 : p.likes + 1,
          disliked: wasDisliked ? false : p.disliked,
          dislikes: wasDisliked ? p.dislikes - 1 : p.dislikes
        };
      }
      return p;
    }));
  };

  const toggleDislike = (postId: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const wasLiked = p.liked;
        const wasDisliked = p.disliked;
        return {
          ...p,
          disliked: !wasDisliked,
          dislikes: wasDisliked ? p.dislikes - 1 : p.dislikes + 1,
          liked: wasLiked ? false : p.liked,
          likes: wasLiked ? p.likes - 1 : p.likes
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments + 1,
          commentsList: [
            ...(p.commentsList || []),
            { author: member.fullName, text: commentText, date: "Agora mesmo" }
          ]
        };
      }
      return p;
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const handleShare = (postId: number, platform: string) => {
    setSharedMsg(prev => ({ ...prev, [postId]: `Partilhado com sucesso no ${platform}!` }));
    setTimeout(() => {
      setSharedMsg(prev => ({ ...prev, [postId]: "" }));
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="community-forum">
      {/* Left Area: Main Feed */}
      <div className="lg:col-span-8 space-y-6">
        {/* Create Post Card */}
        <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex gap-3">
            <img src={member.photo} className="w-9 h-9 rounded-full object-cover border" alt="Me" referrerPolicy="no-referrer" />
            <textarea 
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="O que está a pensar hoje, camarada?" 
              className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#C8102E] resize-none h-18"
            />
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-mono">Espaço Seguro de Debate Militante</span>
            <button type="submit" className="px-4 py-1.5 bg-[#C8102E] text-white text-xs font-bold rounded-lg hover:bg-red-700 transition shadow-sm cursor-pointer">
              Publicar
            </button>
          </div>
        </form>

        {/* Posts lists */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <img src={post.avatar} className="w-10 h-10 rounded-full object-cover border" alt="Author" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">{post.author}</h4>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">Membro Consular</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{post.text}</p>
              
              {/* Interaction Buttons Bar */}
              <div className="border-t border-b border-slate-100 py-2.5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 font-bold transition ${post.liked ? "text-[#C8102E]" : "hover:text-slate-600"}`}
                  >
                    <svg className={`w-4 h-4 ${post.liked ? "fill-[#C8102E] stroke-[#C8102E]" : "stroke-current"}`} fill="none" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.757c1.246 0 2.115 1.151 1.766 2.348l-1.5 5.143A2.001 2.001 0 0117.11 19H8a2 2 0 01-2-2v-7a2 2 0 01.378-1.178l3.621-5.432A2 2 0 0111.62 3h1.13a2 2 0 012 2v5zM4 19H3a1 1 0 01-1-1v-7a1 1 0 011-1h1M4 19v-9M4 19h1" />
                    </svg>
                    {post.likes} Apoios
                  </button>

                  <button 
                    type="button" 
                    onClick={() => toggleDislike(post.id)}
                    className={`flex items-center gap-1 font-bold transition ${post.disliked ? "text-slate-800" : "hover:text-slate-600"}`}
                  >
                    <svg className={`w-4 h-4 ${post.disliked ? "fill-slate-800 stroke-slate-800" : "stroke-current"}`} fill="none" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.243c-1.246 0-2.115-1.151-1.766-2.348l1.5-5.143A2.001 2.001 0 016.89 3H16a2 2 0 012 2v7a2 2 0 01-.378 1.178l-3.621 5.432A2 2 0 0112.38 21h-1.13a2 2 0 01-2-2v-5zM20 5h1a1 1 0 011-1v7a1 1 0 01-1 1h-1M20 5v9M20 5h-1" />
                    </svg>
                    {post.dislikes || 0} Contra
                  </button>
                </div>
                <span>{post.commentsList?.length || 0} Comentários</span>
              </div>

              {/* Share Social Media Bar */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8.5px] text-slate-400 font-mono font-bold uppercase tracking-wider">Partilhar Publicação</span>
                  {sharedMsg[post.id] && (
                    <span className="text-[9px] font-bold text-emerald-600 font-sans animate-pulse">{sharedMsg[post.id]}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "Facebook", bg: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/15 hover:bg-[#1877F2]/20" },
                    { name: "WhatsApp", bg: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/15 hover:bg-[#25D366]/20" },
                    { name: "TikTok", bg: "bg-black/5 text-slate-800 border-black/10 hover:bg-black/10" },
                    { name: "Instagram", bg: "bg-[#E1306C]/10 text-[#E1306C] border-[#E1306C]/15 hover:bg-[#E1306C]/20" },
                    { name: "X", bg: "bg-slate-900/10 text-slate-900 border-slate-900/15 hover:bg-slate-900/20" },
                    { name: "LinkedIn", bg: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/15 hover:bg-[#0A66C2]/20" }
                  ].map(plat => (
                    <button
                      key={plat.name}
                      type="button"
                      onClick={() => handleShare(post.id, plat.name)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded border transition ${plat.bg} cursor-pointer`}
                    >
                      {plat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-2 pt-1">
                {post.commentsList && post.commentsList.length > 0 && (
                  <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto animate-fade-in">
                    {post.commentsList.map((comment, cIdx) => (
                      <div key={cIdx} className="text-xs border-b border-slate-100/60 last:border-0 pb-1.5 last:pb-0">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-800 text-[10px]">{comment.author}</strong>
                          <span className="text-[8px] text-slate-400 font-mono">{comment.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Escreva um comentário..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#C8102E]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    Comentar
                  </button>
                </form>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Right Area: Interactive Polls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Consultas do Comité</h4>
          
          {polls.map((poll) => {
            const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
            const hasVoted = poll.votedMemberIds?.includes(member.id);

            return (
              <div key={poll.id} className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 leading-snug">{poll.title}</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">{poll.description}</p>
                <div className="space-y-2 pt-1">
                  {poll.options.map((opt) => {
                    const votes = poll.votes[opt] || 0;
                    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                    return (
                      <div key={opt}>
                        {hasVoted ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>{opt}</span>
                              <span className="font-mono">{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#C8102E]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => onCastVote(poll.id, opt)}
                            className="w-full text-left px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold hover:bg-red-50 hover:border-[#C8102E]/30 transition cursor-pointer"
                          >
                            {opt}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 12. COMMITTEE DETAILS VIEW (COMPOSIÇÃO DO SECRETARIADO DO COMITÉ DO PARTIDO JUNTO À COMUNIDADE ANGOLANA NA ÁFRICA DO SUL)
// ==========================================
function CommitteeDetailsView({ member, announcements }: { member: Member, announcements: Announcement[] }) {
  const topLeaders = [
    {
      titleBadge: "Primeiro Secretário",
      role: "Primeiro Secretário do Comité do MPLA na África do Sul",
      name: "Cda Francisco Carlos",
      phone: "+27 82 555 9011",
      email: "secretariado@mpla-africadosul.org",
      bio: "Líder supremo e Primeiro Secretário da comissão executiva do Comité do Partido MPLA na África do Sul, orientando a integração, filiação digital, unidade patriótica e representação institucional da comunidade angolana.",
      highlight: true
    },
    {
      titleBadge: "Segundo Secretário",
      role: "Segundo Secretário do Comité do MPLA na África do Sul",
      name: "Cda Gabriel Massuno",
      phone: "+27 82 777 3344",
      email: "gabriel.massuno@mpla-africadosul.org",
      bio: "Supervisão da articulação executiva, coordenação regional das estruturas partidárias em todas as províncias sul-africanas e apoio direto ao Primeiro Secretário.",
      highlight: true
    }
  ];

  const departmentSecretaries = [
    {
      titleBadge: "Organização & Mobilização",
      role: "Secretário para Organização e Mobilização",
      name: "Cda António Gonsalves",
      phone: "+27 83 666 4433",
      email: "organizacao@mpla-africadosul.org",
      bio: "Gestão do recenseamento e mobilização contínua de militantes, dinamização dos comités de acção (CAP), núcleos comunitários e crescimento do cadastro de membros na África do Sul."
    },
    {
      titleBadge: "Questões da Comunidade",
      role: "Secretário para as Questões da Comunidade",
      name: "Cda Cristóvão A. Domingos",
      phone: "+27 81 555 2211",
      email: "comunidade@mpla-africadosul.org",
      bio: "Acompanhamento direto e apoio social às famílias angolanas residentes na África do Sul, mediação comunitária, assistência consular e solidariedade cidadã."
    },
    {
      titleBadge: "Política & Eleições",
      role: "Secretária para as Questões Políticas e Eleitorais",
      name: "Cda Vânia Cruz",
      phone: "+27 83 999 5522",
      email: "politica@mpla-africadosul.org",
      bio: "Supervisão da estratégia política, acompanhamento dos processos eleitorais e cívicos na diáspora, dinamização do voto no exterior e análise permanente de conjuntura."
    },
    {
      titleBadge: "Informação & Formação",
      role: "Secretário para Informação, Propaganda e Formação Militante",
      name: "Cda Lusimadio Simão",
      phone: "+27 82 999 1234",
      email: "formacao@mpla-africadosul.org",
      bio: "Coordenação pedagógica da Academia Política do MPLA, inovação digital e e-learning, difusão da doutrina partidária, comunicação institucional e modernização tecnológica do portal."
    },
    {
      titleBadge: "Administração & Finanças",
      role: "Secretário para Administração e Finanças",
      name: "Cda Francisco Damas",
      phone: "+27 82 111 8899",
      email: "financas@mpla-africadosul.org",
      bio: "Gestão do património partidário, cobrança de quotas regulamentares, transparência contabilística e sustentabilidade orçamental das actividades do Comité."
    },
    {
      titleBadge: "Disciplina, Ética & Auditoria",
      role: "Coordenador da Comissão de Disciplina, Ética e Auditoria",
      name: "Cda Arnoldito Gomes",
      phone: "+27 82 444 7788",
      email: "auditoria@mpla-africadosul.org",
      bio: "Garantia da observância rigorosa dos Estatutos do Partido, salvaguarda da ética militante, transparência processual, auditoria interna e disciplina em todas as estruturas."
    }
  ];

  return (
    <div className="space-y-6 w-full animate-fade-in" id="committee-section">
      {/* Official Header */}
      <div className="space-y-2 text-center md:text-left bg-gradient-to-r from-slate-950 via-slate-900 to-[#990000] p-6 sm:p-8 rounded-2xl text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            MPLA ÁFRICA DO SUL • ESTRUTURA DIRIGENTE NACIONAL
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white tracking-tight uppercase leading-tight">
            COMPOSIÇÃO DO SECRETARIADO DO COMITÉ DO PARTIDO JUNTO À COMUNIDADE ANGOLANA NA ÁFRICA DO SUL
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
            Órgão executivo de direção permanente do Partido MPLA na República da África do Sul, responsável pela articulação política, dinamização da Academia Política, assistência comunitária e representação patriótica de todos os angolanos na diáspora.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-7">
        {/* Sede Nacional & Atendimento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex gap-3 bg-red-50/60 border border-red-100 p-4 rounded-xl">
            <MapPin className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 uppercase font-mono tracking-wide">Sede do Comité do Partido na África do Sul</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                Coordenação Nacional e representação junto à comunidade angolana em todas as províncias sul-africanas (Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, Free State, Limpopo, Mpumalanga e North West).
              </p>
              <p className="text-[11px] text-slate-500 font-mono pt-1">
                Atendimento de Segunda a Sexta: 09:00 – 16:30 • Linha Oficial de Apoio Comunitário
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between text-xs space-y-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Canal Institucional Central</span>
              <p className="font-bold text-slate-800">Secretariado Executivo</p>
              <p className="text-[11px] text-slate-500 font-mono">secretariado@mpla-africadosul.org</p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-[#C8102E] font-bold">
              <span>+27 82 555 9011</span>
              <span className="text-[9px] bg-red-100 text-[#C8102E] px-2 py-0.5 rounded">Oficial</span>
            </div>
          </div>
        </div>

        {/* Tier 1: Primeiro & Segundo Secretários */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider">
              Direcção Máxima do Comité do Partido na África do Sul
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topLeaders.map((off, idx) => (
              <div 
                key={idx} 
                className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-amber-400/40 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {off.titleBadge}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Comité • África do Sul
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-snug tracking-tight">
                    {off.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-400/90 leading-snug">
                    {off.role}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1">
                    {off.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center text-xs text-slate-300 font-mono gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{off.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <a href={`mailto:${off.email}`} className="text-amber-300 hover:underline font-bold truncate">
                      {off.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Secretários Departamentais & Coordenador da Comissão de Auditoria */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="w-4 h-4 text-[#C8102E]" />
            <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider">
              Secretários Departamentais & Comissões Especializadas
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentSecretaries.map((off, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-200 hover:bg-white hover:shadow-xs transition"
              >
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[9px] font-mono font-black uppercase text-[#C8102E] tracking-wider leading-snug block truncate" title={off.titleBadge}>
                    {off.titleBadge}
                  </span>
                  <p className="text-sm font-black text-slate-900 leading-snug">{off.name}</p>
                  <p className="text-[11px] font-semibold text-slate-700 leading-snug">{off.role}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">{off.bio}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex flex-col gap-1.5 text-[10px] text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Phone className="w-3 h-3 text-[#C8102E] shrink-0" />
                    <span>{off.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#C8102E] shrink-0" />
                    <a href={`mailto:${off.email}`} className="text-[#C8102E] hover:underline font-bold truncate" title={off.email}>
                      {off.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Contact Notice */}
        <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Precisa de falar diretamente com o Secretariado do Comité? Envie uma mensagem pelo portal ou abra um chamado no Centro de Apoio.</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-800 uppercase bg-amber-100 px-2 py-1 rounded">
            Canal Direto Protegido
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 13. SUPPORT CENTRE VIEW
// ==========================================
function SupportCentreView({ member, tickets, onSubmitTicket, onSubmitTicketReply }: { member: Member, tickets: SupportTicket[], onSubmitTicket: (type: any, description: string) => void, onSubmitTicketReply: (ticketId: string, text: string) => void }) {
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<any>("Profile Correction");
  const [success, setSuccess] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showSupportMic, setShowSupportMic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    onSubmitTicket(newType, newDesc);
    setNewDesc("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReply = (e: React.FormEvent, tId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSubmitTicketReply(tId, replyText);
    setReplyText("");
    showToast("Resposta submetida com sucesso!", "success");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in" id="support-centre">
      <div className="space-y-1">
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Centro de Apoio Consular</h2>
        <p className="text-xs text-slate-500">Abra pedidos de retificação, informe perda de credenciais ou envie dúvidas ao secretariado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ticket Submission form */}
        <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Novo Pedido</h4>
          
          {success ? (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center space-y-1 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
              <p className="font-bold">Ticket Aberto com Sucesso!</p>
              <p className="text-[10px] text-slate-500">A delegação local analisará a solicitação brevemente.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Tipo de Solicitação</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold">
                  <option value="Profile Correction">Retificação de Nome / Dados</option>
                  <option value="Lost Card Report">Perda de Cartão Físico</option>
                  <option value="Card Replacement">Pedido de Segunda Via</option>
                  <option value="General Inquiry">Consulta Geral</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Descrição da Solicitação</label>
                  <button
                    type="button"
                    onClick={() => setShowSupportMic(!showSupportMic)}
                    className="text-[10px] font-bold text-[#C8102E] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{showSupportMic ? "Fechar Microfone" : "Ditar com IA (gemini-3.5-transcribe)"}</span>
                  </button>
                </div>

                {showSupportMic && (
                  <div className="mb-2">
                    <AudioTranscriber
                      compact
                      title="Ditar Mensagem de Suporte"
                      description="Fale no microfone e transcreva a sua mensagem para a equipa consular."
                      onTranscribeComplete={(text) => {
                        setNewDesc((prev) => (prev ? `${prev} ${text}` : text));
                        setShowSupportMic(false);
                        showToast("Texto transcrito inserido no pedido!", "success");
                      }}
                    />
                  </div>
                )}

                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explique detalhadamente o seu pedido ao secretariado..." 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg h-24 resize-none"
                  required
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer">
                Submeter Pedido Oficial
              </button>
            </form>
          )}
        </div>

        {/* Existing tickets list */}
        <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Seus Pedidos Activos</h4>
          
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {tickets.map((tk) => (
              <div key={tk.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 font-mono text-[#C8102E]">{tk.type}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    tk.status === "Resolved" ? "bg-emerald-50 text-[#16A34A]" : "bg-yellow-50 text-amber-600"
                  }`}>{tk.status}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{tk.description}</p>
                <span className="text-[9px] text-slate-400 font-mono block">Criado em: {tk.createdAt}</span>

                {/* Show replies */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {tk.replies?.map((rp, rIdx) => (
                    <div key={rIdx} className="p-2 bg-white rounded border border-slate-200/50 text-[10px]">
                      <span className="font-bold text-slate-800">{rp.senderName}:</span>
                      <p className="text-slate-600 mt-0.5">{rp.text}</p>
                    </div>
                  ))}

                  <form onSubmit={(e) => handleReply(e, tk.id)} className="flex gap-1.5 pt-1">
                    <input 
                      type="text" 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Responder..." 
                      className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-[10px]"
                    />
                    <button type="submit" className="px-3 bg-slate-800 text-white rounded text-[10px] font-bold">Enviar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 15. VOLUNTEERING & MISSIONS VIEW
// ==========================================
function VolunteeringMissionsView({ member }: { member: Member }) {
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Completed">("All");

  const missions = [
    {
      id: "v1",
      title: "Campanha de Apoio Consular e Recenseamento",
      committee: "Comité de Cape Town",
      category: "Assistência Social",
      deadline: "30 Jul 2026",
      hoursLogged: 12,
      targetHours: 20,
      status: "Active",
      desc: "Registo presencial e apoio a cidadãos angolanos na emissão de documentos de identificação e cartão de militante."
    },
    {
      id: "v2",
      title: "Distribuição de Cestas Básicas e Material Escolar",
      committee: "JMPLA Western Cape",
      category: "Solidariedade",
      deadline: "15 Ago 2026",
      hoursLogged: 5,
      targetHours: 10,
      status: "Active",
      desc: "Organização de logística de doações para famílias necessitadas da comunidade de Bellville e Philippi."
    },
    {
      id: "v3",
      title: "Brigada de Formação Política Juvenil",
      committee: "Comité Central / Formação",
      category: "Educação",
      deadline: "10 Jun 2026",
      hoursLogged: 15,
      targetHours: 15,
      status: "Completed",
      desc: "Liderança de workshops sobre a História do MPLA para jovens quadros universitários."
    }
  ];

  const filtered = missions.filter(m => activeFilter === "All" || m.status === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Voluntariado & Missões Partidárias</h2>
          <p className="text-xs text-slate-500">Inscreva-se em brigadas comunitárias, acompanhe horas registradas e obtenha certificados de mérito.</p>
        </div>
        <button onClick={() => showToast("Sua candidatura para nova brigada de voluntariado foi registada!", "success")} className="px-4 py-2 bg-[#C8102E] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" /> Inscrever-se em Nova Missão
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#C8102E] rounded-xl"><Target className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Horas Prestadas</p>
            <p className="text-lg font-black text-slate-900 font-mono">32 Horas</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Missões Concluídas</p>
            <p className="text-lg font-black text-slate-900 font-mono">3 Brigadas</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Nível de Voluntário</p>
            <p className="text-lg font-black text-slate-900 font-mono">Brigadista Ouro</p>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(["All", "Active", "Completed"] as const).map((st) => (
          <button
            key={st}
            onClick={() => setActiveFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === st ? "bg-[#C8102E] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {st === "All" ? "Todas as Missões" : st === "Active" ? "Ativas" : "Concluídas"}
          </button>
        ))}
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-[#C8102E] bg-red-50 px-2 py-0.5 rounded border border-red-100">{m.category}</span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{m.title}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.committee}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                m.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-600"
              }`}>
                {m.status === "Active" ? "Em Curso" : "Concluído"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>

            {/* Progress Bar */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Progresso de Horas:</span>
                <span className="font-bold text-slate-800">{m.hoursLogged} / {m.targetHours} Horas</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#C8102E] h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (m.hoursLogged / m.targetHours) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-[10px] text-slate-400 font-mono">Prazo: {m.deadline}</span>
              <button onClick={() => showToast("Relatório de atividade submetido ao supervisor.", "success")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition cursor-pointer">
                Registar Horas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 16. MEMBER DIRECTORY VIEW
// ==========================================
function MemberDirectoryView({ member, onChangeTab }: { member: Member, onChangeTab: (tab: any) => void }) {
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("All");

  const directoryMembers = [
    { name: "Camarada Simão Lusimadio", committee: "Comité de Cape Town", province: "Western Cape", role: "Secretário Executivo", phone: "+27 82 123 4567", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" },
    { name: "Dra. Isabel Santos", committee: "Comité de Johannesburg", province: "Gauteng", role: "Coordenadora de Mulheres (OMA)", phone: "+27 71 987 6543", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" },
    { name: "Eng. António Neto", committee: "Comité de Pretoria", province: "Gauteng", role: "Responsável de Comunicação", phone: "+27 60 333 4444", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
    { name: "Prof. Manuel Agostinho", committee: "Comité de Durban", province: "KwaZulu-Natal", role: "Formador Ideológico", phone: "+27 83 555 7777", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
    { name: "Sofia Kassoma", committee: "Comité de Port Elizabeth", province: "Eastern Cape", role: "Delegada da JMPLA", phone: "+27 72 111 2222", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop" }
  ];

  const filtered = directoryMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.committee.toLowerCase().includes(search.toLowerCase());
    const matchesProvince = province === "All" || m.province === province;
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Diretório Oficial de Militantes</h2>
          <p className="text-xs text-slate-500">Rede de contactos do partido na África do Sul com controlos estritos de privacidade.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou comité..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </div>
        <select 
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="All">Todas as Províncias</option>
          <option value="Western Cape">Western Cape</option>
          <option value="Gauteng">Gauteng</option>
          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
          <option value="Eastern Cape">Eastern Cape</option>
        </select>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
            <img src={m.photo} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#FFCC00] shadow-sm shrink-0" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm truncate">{m.name}</h3>
              <p className="text-[10px] font-mono text-[#C8102E] font-bold">{m.role}</p>
              <p className="text-[10px] text-slate-500 truncate">{m.committee} • {m.province}</p>
              <div className="pt-2 flex gap-2">
                <button onClick={() => onChangeTab("messages")} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#C8102E]" /> Mensagem
                </button>
                <a href={`tel:${m.phone}`} className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold transition flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Ligar
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 17. BENEFITS & AWARDS VIEW
// ==========================================
function BenefitsAndAwardsView({ member }: { member: Member }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Benefícios & Reconhecimentos</h2>
        <p className="text-xs text-slate-500">Conquistas de militância, insígnias de honra e parcerias exclusivas aos membros recenseados.</p>
      </div>

      {/* Awards Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Suas Insígnias & Medalhas de Honra</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCC00]/20 text-[#FFCC00] flex items-center justify-center border border-[#FFCC00]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Mérito Consular 2026</h4>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">Atribuído pelo empenho destacado no apoio ao recenseamento em Cape Town.</p>
            </div>
            <span className="inline-block text-[9px] font-mono text-[#FFCC00] font-bold uppercase">Homologado pela Sede</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C8102E] flex items-center justify-center border border-red-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Militância Ativa (5 Anos)</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Reconhecimento de lealdade e assiduidade nos plenários e quotas.</p>
            </div>
            <span className="inline-block text-[9px] font-mono text-emerald-600 font-bold uppercase">Concedido em 2023</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-[#FFCC00] flex items-center justify-center border border-yellow-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Guardião da Ideologia</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Certificação avançada nos cursos de História e Governação do MPLA.</p>
            </div>
            <span className="inline-block text-[9px] font-mono text-slate-400 font-bold uppercase">Concedido em 2025</span>
          </div>
        </div>
      </div>

      {/* Member Benefits Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Benefícios & Parcerias Consulares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Atendimento Consular Prioritário", partner: "Embaixada & Consulados de Angola", desc: "Isenção de filas no agendamento de passaportes e atos consulares mediante apresentação do Cartão Digital.", icon: Shield },
            { title: "Apoio Jurídico Gratuito", partner: "Gabinete de Apoio ao Emigrante", desc: "Aconselhamento legal em processos de vistos, autorizações de residência e contratos de trabalho na África do Sul.", icon: Lock },
            { title: "Bolsas & Cursos de Língua Portuguesa", partner: "Centro Cultural Angolano", desc: "Desconto de 50% em cursos de formação executiva, cultura e apoio escolar para dependentes diretos.", icon: Award },
            { title: "Rede de Saúde & Seguros de Repatriamento", partner: "Parceiros Institucionais", desc: "Tabelas bonificadas em seguros de saúde transfronteiriços e assistência em emergência médica.", icon: Gift }
          ].map((b, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-3 bg-red-50 text-[#C8102E] rounded-xl shrink-0">
                <b.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                <p className="text-[10px] text-[#C8102E] font-mono font-bold">{b.partner}</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{b.desc}</p>
                <button onClick={() => showToast("Benefício solicitado! O código de cupão consular foi enviado para o seu email.", "success")} className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer">
                  Ativar Benefício
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 18. SETTINGS VIEW
// ==========================================
function SettingsView({ member, onUpdateProfile }: { member: Member, onUpdateProfile: (updatedData: Partial<Member>) => void }) {
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in" id="settings-panel">
      <div className="space-y-1">
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Preferências & Segurança</h2>
        <p className="text-xs text-slate-500">Ajuste as suas credenciais, alertas e opções de privacidade.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="space-y-4">
          <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Parâmetros de Segurança</h4>
          
          <div className="flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">Autenticação multifatorial (2FA)</p>
              <p className="text-[10px] text-slate-400">Solicitar OTP móvel em cada login consurlar.</p>
            </div>
            <button onClick={() => setTwoFactor(!twoFactor)} className={`w-9 h-5 rounded-full p-0.5 transition ${twoFactor ? "bg-[#C8102E]" : "bg-slate-200"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition transform ${twoFactor ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-50">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">Criptografia Biométrica</p>
              <p className="text-[10px] text-slate-400">Permitir Face ID / Touch ID na carteira digital móvel.</p>
            </div>
            <button onClick={() => setBiometrics(!biometrics)} className={`w-9 h-5 rounded-full p-0.5 transition ${biometrics ? "bg-[#C8102E]" : "bg-slate-200"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition transform ${biometrics ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Comunicação</h4>
          
          <div className="flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">Comunicados por E-mail</p>
              <p className="text-[10px] text-slate-400">Receber alertas de plenários locais imediatos.</p>
            </div>
            <button onClick={() => setNotifEmail(!notifEmail)} className={`w-9 h-5 rounded-full p-0.5 transition ${notifEmail ? "bg-[#C8102E]" : "bg-slate-200"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition transform ${notifEmail ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Account Security Diagnostic Suite */}
      <MemberSecurityDiagnosticSuite isAdmin={false} />
    </div>
  );
}
