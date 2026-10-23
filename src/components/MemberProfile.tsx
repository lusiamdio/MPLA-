import React, { useState } from "react";
import { Member, MemberSocialLinks, MemberFieldVisibility, FieldVisibilityLevel } from "../types";
import { DEFAULT_MEMBER_AVATAR } from "../images";
import { showToast } from "../lib/notifications";
import { 
  User, Mail, Phone, MapPin, Briefcase, Award, ShieldAlert, 
  Lock, Key, CheckCircle2, History, AlertCircle, Smartphone, Globe, BookOpen,
  Sparkles, Target, Share2, Plus, X, ExternalLink, Eye, Users, Check,
  Linkedin, Twitter, Facebook, Instagram, Github, Link as LinkIcon, FileText
} from "lucide-react";

function VisibilityBadgeSelect({
  value,
  onChange,
  label
}: {
  value: FieldVisibilityLevel;
  onChange: (level: FieldVisibilityLevel) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80">
      <button
        type="button"
        onClick={() => onChange('public')}
        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
          value === 'public'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Público: Visível para todos (diretório e visitantes)"
      >
        <Globe className="w-3 h-3" />
        <span>Público</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('members')}
        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
          value === 'members'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Membros: Visível apenas para camaradas autenticados"
      >
        <Users className="w-3 h-3" />
        <span>Membros</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('private')}
        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
          value === 'private'
            ? 'bg-slate-800 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Privado: Visível apenas para si e secretariado do comité"
      >
        <Lock className="w-3 h-3" />
        <span>Privado</span>
      </button>
    </div>
  );
}

interface MemberProfileProps {
  member: Member;
  onUpdateProfile: (updatedData: Partial<Member>) => void;
}

export default function MemberProfile({ member, onUpdateProfile }: MemberProfileProps) {
  // Local state for profile inputs
  const [fullName, setFullName] = useState(member.fullName);
  const [mobile, setMobile] = useState(member.mobile);
  const [email, setEmail] = useState(member.email);
  const [dob, setDob] = useState(member.dob);
  const [gender, setGender] = useState(member.gender);
  const [maritalStatus, setMaritalStatus] = useState(member.maritalStatus);
  const [emergencyName, setEmergencyName] = useState(member.emergencyContact?.name || "");
  const [emergencyPhone, setEmergencyPhone] = useState(member.emergencyContact?.phone || "");
  const [occupation, setOccupation] = useState(member.occupation);
  const [employer, setEmployer] = useState(member.employer);
  const [education, setEducation] = useState(member.education);
  const [photo, setPhoto] = useState(member.photo);
  const [coverPhoto, setCoverPhoto] = useState(member.coverPhoto || "");
  const [photoPositionX, setPhotoPositionX] = useState(member.photoPositionX ?? 50);
  const [photoPositionY, setPhotoPositionY] = useState(member.photoPositionY ?? 50);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const dragStartRef = React.useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0, startY: 0, initPosX: 50, initPosY: 50
  });

  // Expanded Profile Fields: Bio, Skills, Interests, Social Links & Visibility
  const [bio, setBio] = useState(member.bio || "");
  const [skills, setSkills] = useState<string[]>(member.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>(member.interests || []);
  const [interestInput, setInterestInput] = useState("");
  const [socialLinks, setSocialLinks] = useState<MemberSocialLinks>(member.socialLinks || {
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    github: "",
    website: ""
  });
  const [visibilitySettings, setVisibilitySettings] = useState<MemberFieldVisibility>({
    bio: member.visibilitySettings?.bio || "public",
    skills: member.visibilitySettings?.skills || "public",
    interests: member.visibilitySettings?.interests || "members",
    socialLinks: member.visibilitySettings?.socialLinks || "public",
    email: member.visibilitySettings?.email || "members",
    mobile: member.visibilitySettings?.mobile || "private",
    occupation: member.visibilitySettings?.occupation || "public"
  });

  // Interactive Privacy Preview mode in right column
  const [privacyPreviewRole, setPrivacyPreviewRole] = useState<'self' | 'members' | 'public'>('self');

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

  const handlePhotoMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPhoto(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: photoPositionX,
      initPosY: photoPositionY
    };
  };

  const handlePhotoMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPhoto) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    
    const newX = Math.min(100, Math.max(0, dragStartRef.current.initPosX - (deltaX * 0.7)));
    const newY = Math.min(100, Math.max(0, dragStartRef.current.initPosY - (deltaY * 0.7)));
    
    setPhotoPositionX(Math.round(newX));
    setPhotoPositionY(Math.round(newY));
  };

  const handlePhotoMouseUp = () => setIsDraggingPhoto(false);

  const [showRenewalModal, setShowRenewalModal] = useState(false);

  const canEditPhotos = Boolean(member.canUpdatePhoto || member.outstandingBalance === 0);

  const profileFileRef = React.useRef<HTMLInputElement>(null);
  const coverFileRef = React.useRef<HTMLInputElement>(null);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [notifSuccess, setNotifSuccess] = useState(false);

  // Security setting states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName,
      mobile,
      email,
      dob,
      gender,
      maritalStatus,
      emergencyContact: { name: emergencyName, phone: emergencyPhone },
      occupation,
      employer,
      education,
      photo,
      coverPhoto,
      photoPositionX,
      photoPositionY,
      bio,
      skills,
      interests,
      socialLinks,
      visibilitySettings
    });
    setNotifSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setNotifSuccess(false), 4000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("As novas palavras-passe não coincidem.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`/api/members/${member.id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Erro ao atualizar a palavra-passe.");
        setPwLoading(false);
        return;
      }

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Palavra-passe de segurança atualizada com sucesso!", "success");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      setPwError("Falha na comunicação com o servidor de segurança.");
    } finally {
      setPwLoading(false);
    }
  };

  // Mock Active Sessions
  const activeSessions = [
    { device: "Chrome v112 (macOS)", ip: "105.4.120.89", location: "Johannesburg, ZA", active: true },
    { device: "Android App v3.2", ip: "196.224.15.90", location: "Pretoria, ZA", active: false }
  ];

  return (
    <div className="space-y-8" id="profile-management-panel">
      {/* Visual Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-[#D3122A]" />
            Configuração do Perfil & Segurança
          </h2>
          <p className="text-xs text-slate-500 mt-1">Gerencie suas credenciais oficiais de membro, contatos de emergência e parametrizações de segurança da conta.</p>
        </div>
        <div className="text-xs font-mono font-bold bg-[#D3122A]/10 text-[#D3122A] px-3 py-1.5 rounded-xl border border-[#D3122A]/20">
          Ref: {member.membershipNo}
        </div>
      </div>

      {notifSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 shadow-xs animate-fade-in">
          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Perfil Atualizado com Sucesso!</p>
            <p className="text-[11px] text-emerald-700/80">Os seus dados de auto-serviço foram sincronizados com a base de dados central do MPLA.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Form Editor */}
        <form onSubmit={handleProfileSave} className="xl:col-span-8 space-y-6">
          {/* Section 1: Personal Coordinates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-red-50 text-[#D3122A] rounded-xl">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Informação Pessoal</h3>
                <p className="text-[11px] text-slate-400">Dados fundamentais do seu cartão oficial de membro.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5 flex items-center justify-between">
                  <span>Número de Identificação Militante (ADL)</span>
                  <span className="text-[8px] bg-red-50 text-[#C8102E] font-bold px-1.5 py-0.5 rounded border border-red-100">OFICIAL</span>
                </label>
                <input 
                  type="text" 
                  value={member.membershipNo} 
                  className="w-full p-3 bg-red-50/40 border border-red-100 rounded-xl text-xs text-[#991b1b] font-mono font-black outline-none cursor-not-allowed"
                  disabled
                />
                <span className="text-[9px] text-slate-400 block mt-1.5">Número de identificação do militante (Ex: ADL). Registado na central e no cartão.</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Número de Bilhete de Identidade (BI)</label>
                <input 
                  type="text" 
                  value={member.nationalId} 
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 outline-none cursor-not-allowed font-mono font-medium"
                  disabled
                />
                <span className="text-[9px] text-slate-400 block mt-1.5">O ID Nacional apenas pode ser alterado por administradores de registo.</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Data de Nascimento</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Género</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold text-slate-700"
                  >
                    <option value="Male">Masculino</option>
                    <option value="Female">Feminino</option>
                    <option value="Other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Estado Civil</label>
                  <select 
                    value={maritalStatus} 
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold text-slate-700"
                  >
                    <option value="Single">Solteiro(a)</option>
                    <option value="Married">Casado(a)</option>
                    <option value="Divorced">Divorciado(a)</option>
                    <option value="Widowed">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input type="file" ref={profileFileRef} accept="image/*" onChange={handleProfileFileChange} className="hidden" />
              <input type="file" ref={coverFileRef} accept="image/*" onChange={handleCoverFileChange} className="hidden" />

              {/* Photo & Cover Image Management Section */}
              <div className="sm:col-span-2 space-y-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    Fotografia & Capa do Cartão de Militante
                  </h4>
                  {canEditPhotos ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Edição Desbloqueada (Renovação Activa)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Bloqueado até Renovação
                    </span>
                  )}
                </div>

                {!canEditPhotos && (
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                      <p className="text-xs font-bold">Apenas permitido após renovação da quota</p>
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      De acordo com os regulamentos partidários, os membros apenas podem alterar a foto de perfil e a imagem de capa após a renovação da sua quota anual de militante.
                    </p>
                    {member.outstandingBalance > 0 && (
                      <p className="text-[11px] font-bold text-amber-900">
                        Valor de quota pendente: <span className="font-mono text-[#D3122A]">R{member.outstandingBalance}.00</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Photo Previews and Upload Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Profile Photo */}
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">Foto de Perfil do Cartão</p>
                      <span className="text-[9px] font-mono font-bold text-[#C8102E]">Arraste para Ajustar</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <img 
                          src={photo || DEFAULT_MEMBER_AVATAR} 
                          alt="Profile avatar" 
                          onMouseDown={handlePhotoMouseDown}
                          onMouseMove={handlePhotoMouseMove}
                          onMouseUp={handlePhotoMouseUp}
                          onMouseLeave={handlePhotoMouseUp}
                          className={`w-18 h-18 rounded-2xl object-cover border-2 border-white shadow-md bg-white select-none transition-all ${
                            isDraggingPhoto ? "cursor-grabbing ring-2 ring-[#C8102E]" : "cursor-grab hover:opacity-95"
                          }`}
                          style={{ objectPosition: `${photoPositionX}% ${photoPositionY}%` }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_MEMBER_AVATAR;
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full opacity-80 pointer-events-none">
                          {photoPositionX}% / {photoPositionY}%
                        </span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <button
                          type="button"
                          disabled={!canEditPhotos}
                          onClick={() => profileFileRef.current?.click()}
                          className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold text-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          Carregar Nova Foto
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight">
                          Arraste a imagem em qualquer direcção para ajustar a posição do rosto.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Photo */}
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                    <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">Imagem de Capa do Cartão</p>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-slate-800 relative">
                        <img 
                          src={coverPhoto || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"} 
                          alt="Cover banner" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <button
                          type="button"
                          disabled={!canEditPhotos}
                          onClick={() => coverFileRef.current?.click()}
                          className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold text-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          Carregar Nova Capa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Emergencies */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Contactos & Emergências</h3>
                <p className="text-[11px] text-slate-400">Como a equipa do comité o poderá contactar rapidamente.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Telemóvel</label>
                <input 
                  type="text" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Endereço de E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold"
                  required
                />
              </div>

              <div className="border-t border-slate-100 pt-4 sm:col-span-2">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Contacto de Emergência Directo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">Nome do Contacto</label>
                    <input 
                      type="text" 
                      value={emergencyName} 
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                      placeholder="Nome do parente / contacto"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">Telemóvel do Contacto</label>
                    <input 
                      type="text" 
                      value={emergencyPhone} 
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold"
                      placeholder="+27..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Professional & Work */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Informação Profissional</h3>
                <p className="text-[11px] text-slate-400">Dados para estatísticas de formação académica de quadros.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Profissão / Ocupação</label>
                <input 
                  type="text" 
                  value={occupation} 
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Entidade Patronal / Empresa</label>
                <input 
                  type="text" 
                  value={employer} 
                  onChange={(e) => setEmployer(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Nível Académico</label>
                <input 
                  type="text" 
                  value={education} 
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Short Bio & Personal Presentation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-[#D3122A] rounded-xl">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">Biografia & Apresentação</h3>
                  <p className="text-[11px] text-slate-400">Breve resumo sobre a sua trajetória cívica, profissional e partidária.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Visibilidade:</span>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.bio || 'public'} 
                  onChange={(val) => updateVisibility('bio', val)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Escreva uma breve biografia sobre o seu percurso na comunidade, compromisso com a causa nacional e experiência..."
                  className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition resize-none leading-relaxed text-slate-800"
                />
                <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-400 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {bio.length}/500 caracteres
                </div>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {visibilitySettings.bio === 'public' && 'Esta biografia pode ser visualizada por qualquer cidadão no directório e no portal público.'}
                {visibilitySettings.bio === 'members' && 'Apenas camaradas e militantes com sessão iniciada podem visualizar a sua biografia.'}
                {visibilitySettings.bio === 'private' && 'Apenas você e o secretariado do seu comité têm acesso a esta biografia.'}
              </p>
            </div>
          </div>

          {/* Section 5: Skills & Competencies */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">Competências & Habilidades (Skills)</h3>
                  <p className="text-[11px] text-slate-400">Identifique as suas mais-valias técnicas, políticas e comunitárias.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Visibilidade:</span>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.skills || 'public'} 
                  onChange={(val) => updateVisibility('skills', val)} 
                />
              </div>
            </div>

            {/* Current Skills Tags */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-50/70 border border-slate-200 rounded-xl">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic self-center px-2">Nenhuma competência adicionada ainda. Utilize o campo abaixo.</p>
                ) : (
                  skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 text-indigo-900 rounded-lg text-xs font-semibold shadow-2xs hover:border-indigo-300 transition"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-600 transition p-0.5 cursor-pointer rounded"
                        title="Remover"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Custom Skill */}
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                    placeholder="Adicionar competência (ex: Mobilização Comunitária, Gestão Financeira)..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Suggested Skills */}
              <div className="pt-1">
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">Sugestões Rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Liderança Comunitária",
                    "Comunicação Estratégica",
                    "Mobilização de Quadros",
                    "Gestão de Projetos",
                    "Desenvolvimento Web / TI",
                    "Direito & Legislação",
                    "Apoio Consular",
                    "Logística e Organização",
                    "Tradução (PT/EN/Zulu)"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={skills.includes(sug)}
                      onClick={() => handleAddSkill(sug)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                        skills.includes(sug)
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <span>+ {sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Interests & Causes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">Áreas de Interesse & Missões</h3>
                  <p className="text-[11px] text-slate-400">Campos de intervenção partidária, causas cívicas e áreas de paixão.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Visibilidade:</span>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.interests || 'members'} 
                  onChange={(val) => updateVisibility('interests', val)} 
                />
              </div>
            </div>

            {/* Current Interests Tags */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-50/70 border border-slate-200 rounded-xl">
                {interests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic self-center px-2">Nenhum interesse adicionado ainda. Adicione os seus temas de interesse.</p>
                ) : (
                  interests.map((interest, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold shadow-2xs hover:border-emerald-300 transition"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-slate-400 hover:text-rose-600 transition p-0.5 cursor-pointer rounded"
                        title="Remover"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Custom Interest */}
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                    placeholder="Adicionar área de interesse (ex: Ação Social, Juventude & Desporto)..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Suggested Interests */}
              <div className="pt-1">
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">Sugestões de Temas Partidários:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Juventude & Desporto (JMPLA)",
                    "Empoderamento Feminino (OMA)",
                    "Ação Social Comunitária",
                    "Tecnologia & Inovação Digital",
                    "Formação Política & Ideológica",
                    "Relações Internacionais & Diáspora",
                    "Cultura & Identidade Angolana",
                    "Empreendedorismo & Negócios"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={interests.includes(sug)}
                      onClick={() => handleAddInterest(sug)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                        interests.includes(sug)
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <span>+ {sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Social Media & Digital Presence */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Share2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">Redes Sociais & Presença Digital</h3>
                  <p className="text-[11px] text-slate-400">Conecte os seus canais digitais para fortalecer a rede de contactos com outros camaradas.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Visibilidade:</span>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.socialLinks || 'public'} 
                  onChange={(val) => updateVisibility('socialLinks', val)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LinkedIn */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks.linkedin || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/usuario"
                    className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white outline-none transition"
                  />
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-sky-600 transition"
                      title="Testar ligação"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Twitter / X */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-slate-900" />
                  <span>X / Twitter</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks.twitter || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://x.com/usuario"
                    className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 focus:bg-white outline-none transition"
                  />
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-900 transition"
                      title="Testar ligação"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Facebook</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks.facebook || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/usuario"
                    className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition"
                  />
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-blue-600 transition"
                      title="Testar ligação"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                  <span>Instagram</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks.instagram || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/usuario"
                    className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:bg-white outline-none transition"
                  />
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-pink-600 transition"
                      title="Testar ligação"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-800" />
                  <span>GitHub / Repositório de Código</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks.github || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="https://github.com/usuario"
                    className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 focus:bg-white outline-none transition"
                  />
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-900 transition"
                      title="Testar ligação"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Personal Website */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Website Pessoal / Blog</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks.website || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    placeholder="https://seusite.com"
                    className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition"
                  />
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-emerald-600 transition"
                      title="Testar ligação"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Global Contact Privacy Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Privacidade de Contactos e Ocupação</h3>
                <p className="text-[11px] text-slate-400">Defina quem pode ver o seu e-mail, número de telemóvel e profissão no directório do partido.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Correio Electrónico</span>
                  </span>
                </div>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.email || 'members'} 
                  onChange={(val) => updateVisibility('email', val)} 
                />
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Telemóvel / WhatsApp</span>
                  </span>
                </div>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.mobile || 'private'} 
                  onChange={(val) => updateVisibility('mobile', val)} 
                />
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Profissão & Emprego</span>
                  </span>
                </div>
                <VisibilityBadgeSelect 
                  value={visibilitySettings.occupation || 'public'} 
                  onChange={(val) => updateVisibility('occupation', val)} 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#D3122A] hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-200/50 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gravar Alterações do Perfil & Privacidade</span>
            </button>
          </div>
        </form>

        {/* Right Column: Account Security & Multi-Factor Settings */}
        <div className="xl:col-span-4 space-y-6">
          {/* Party Metadata Info */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC00]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#FFCC00]" />
              <h3 className="font-display font-extrabold text-sm tracking-tight text-white">Posicionamento no Partido</h3>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-slate-400">Cartão de Membro</span>
                <span className="font-mono font-bold text-[#FFCC00]">{member.membershipNo}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-slate-400">Comité Local</span>
                <span className="font-semibold text-slate-200 text-right">{member.committee}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-slate-400">Província / Categoria</span>
                <span className="font-semibold text-slate-200">{member.province} ({member.category})</span>
              </div>
              <div className="flex justify-between pb-1 items-start">
                <span className="text-slate-400">Funções de Liderança</span>
                <div className="text-right flex flex-col items-end gap-1">
                  {member.leadershipRoles && member.leadershipRoles.length > 0 ? (
                    member.leadershipRoles.map((role, idx) => (
                      <span key={idx} className="inline-block font-mono font-extrabold text-[9px] bg-[#D3122A]/30 border border-[#D3122A]/50 px-2 py-0.5 rounded text-red-200">{role}</span>
                    ))
                  ) : (
                    <span className="italic text-[10px] text-slate-500">Membro Geral</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Visibility Simulator Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Eye className="w-4.5 h-4.5 text-indigo-600" />
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Simulador de Visibilidade</h3>
                <p className="text-[10px] text-slate-400">Verifique como outros utilizadores visualizam o seu perfil.</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPrivacyPreviewRole('self')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  privacyPreviewRole === 'self'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Eu</span>
                <span className="text-[9px] opacity-60">(Total)</span>
              </button>
              <button
                type="button"
                onClick={() => setPrivacyPreviewRole('members')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  privacyPreviewRole === 'members'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Membros</span>
              </button>
              <button
                type="button"
                onClick={() => setPrivacyPreviewRole('public')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  privacyPreviewRole === 'public'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Público</span>
              </button>
            </div>

            {/* Simulator Output */}
            <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {/* Bio status */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-600 font-medium">Biografia:</span>
                {(() => {
                  const vis = visibilitySettings.bio || 'public';
                  const isVisible = privacyPreviewRole === 'self' || vis === 'public' || (vis === 'members' && privacyPreviewRole === 'members');
                  return isVisible ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="w-3 h-3" /> Visível ({vis})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" /> Oculta ({vis})
                    </span>
                  );
                })()}
              </div>

              {/* Skills status */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-600 font-medium">Competências ({skills.length}):</span>
                {(() => {
                  const vis = visibilitySettings.skills || 'public';
                  const isVisible = privacyPreviewRole === 'self' || vis === 'public' || (vis === 'members' && privacyPreviewRole === 'members');
                  return isVisible ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="w-3 h-3" /> Visíveis ({vis})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" /> Ocultas ({vis})
                    </span>
                  );
                })()}
              </div>

              {/* Interests status */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-600 font-medium">Áreas de Interesse ({interests.length}):</span>
                {(() => {
                  const vis = visibilitySettings.interests || 'members';
                  const isVisible = privacyPreviewRole === 'self' || vis === 'public' || (vis === 'members' && privacyPreviewRole === 'members');
                  return isVisible ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="w-3 h-3" /> Visíveis ({vis})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" /> Ocultas ({vis})
                    </span>
                  );
                })()}
              </div>

              {/* Social links status */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-600 font-medium">Redes Sociais:</span>
                {(() => {
                  const vis = visibilitySettings.socialLinks || 'public';
                  const isVisible = privacyPreviewRole === 'self' || vis === 'public' || (vis === 'members' && privacyPreviewRole === 'members');
                  return isVisible ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="w-3 h-3" /> Visíveis ({vis})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" /> Ocultas ({vis})
                    </span>
                  );
                })()}
              </div>

              {/* Contacts status */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Email / Telemóvel:</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {visibilitySettings.email === 'public' ? 'Email público' : visibilitySettings.email === 'members' ? 'Email para membros' : 'Email privado'} • {visibilitySettings.mobile === 'private' ? 'Tel. protegido' : visibilitySettings.mobile}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Lock className="w-4.5 h-4.5 text-[#D3122A]" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Alterar Palavra-Passe</h3>
            </div>

            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 text-[11px] font-semibold">
                Palavra-passe atualizada com sucesso.
              </div>
            )}
            {pwError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Palavra-Passe Actual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Nova Palavra-Passe</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Confirmar Nova Palavra-Passe</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {pwLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {pwLoading ? "A Atualizar..." : "Mudar Palavra-Passe"}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication & Biometrics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Smartphone className="w-4.5 h-4.5 text-[#D3122A]" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Dois Factores (2FA) & Biometria</h3>
            </div>

            <div className="space-y-4">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">Autenticação de 2 Factores (2FA)</p>
                  <p className="text-[10px] text-slate-400">Solicitar código OTP enviado por SMS ou E-mail a cada login.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-[#D3122A]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Biometric Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">Desbloqueio Biométrico</p>
                  <p className="text-[10px] text-slate-400">Permitir acesso rápido à carteira digital através de Face ID ou Touch ID.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBiometricEnabled(!biometricEnabled)}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    biometricEnabled ? 'bg-[#D3122A]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      biometricEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <History className="w-4.5 h-4.5 text-[#D3122A]" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Sessões Activas</h3>
            </div>

            <div className="space-y-3.5">
              {activeSessions.map((session, i) => (
                <div key={i} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-700">{session.device}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">IP: {session.ip} • {session.location}</p>
                  </div>
                  {session.active ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">Activo</span>
                  ) : (
                    <span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full border border-slate-200">Sessão</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
