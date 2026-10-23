import React, { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  Loader2, ArrowLeft, Camera, Upload, Check, ShieldCheck, Award, Sparkles, Compass,
  MapPin, Calendar, Briefcase, CreditCard
} from "lucide-react";
import { PHOTO_SAMPLES, COVER_SAMPLES, LOCAL_MPLA_PARTY_LOGO } from "../images";

// Global Diaspora regional mapping for adaptive dropdowns
const PROVINCE_MAPPING: { 
  [key: string]: { municipalities: string[]; committees: string[] } 
} = {
  "África do Sul": {
    municipalities: ["Cidade do Cabo", "Joanesburgo", "Pretória", "Durban"],
    committees: ["Comité do MPLA na Cidade do Cabo", "Comité de Joanesburgo", "Comité de Pretória"]
  },
  "Portugal": {
    municipalities: ["Lisboa", "Porto", "Coimbra", "Faro"],
    committees: ["Comité do MPLA em Lisboa", "Comité do Porto", "Comité de Coimbra"]
  },
  "França": {
    municipalities: ["Paris", "Lyon", "Marseille"],
    committees: ["Comité do MPLA em Paris", "Comité de Lyon"]
  },
  "Reino Unido": {
    municipalities: ["Londres", "Manchester", "Birmingham"],
    committees: ["Comité do MPLA em Londres", "Comité de Manchester"]
  },
  "Namíbia": {
    municipalities: ["Windhoek", "Walvis Bay", "Rundu"],
    committees: ["Comité do MPLA em Windhoek", "Comité de Walvis Bay"]
  },
  "Brasil & América": {
    municipalities: ["São Paulo", "Rio de Janeiro", "Brasília"],
    committees: ["Comité do MPLA em São Paulo", "Comité do Rio de Janeiro"]
  }
};

interface AuthPortalProps {
  onLoginSuccess: (user: any, role: "member" | "admin") => void;
  onBackToWeb?: () => void;
  initialMode?: "signin" | "signup";
}

export default function AuthPortal({ onLoginSuccess, onBackToWeb, initialMode }: AuthPortalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "otp" | "forgot" | "success">(initialMode || "signin");

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  const [role, setRole] = useState<"member" | "admin">("member");
  
  // Sign in fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("PT");

  // OTP Fields
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [otpSentTo, setOtpSentTo] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpInputRefs = useRef<HTMLInputElement[]>([]);

  // Sign up fields (Progressive steps)
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    nationalId: "",
    idType: "BI" as "BI" | "Passport",
    organizationWing: "Militante" as "Militante" | "JMPLA" | "OMA",
    membershipNo: "",
    placeOfBirth: "",
    dob: "",
    occupation: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    province: "África do Sul",
    municipality: "Cidade do Cabo",
    committee: "Comité do MPLA na Cidade do Cabo",
    photo: "",
    coverPhoto: "",
    photoPositionX: 50,
    photoPositionY: 50,
    kinName: "",
    kinPhone: ""
  });

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...signUpData, photo: reader.result as string };
        setSignUpData(updated);
        saveSignUpDraft(updated, 4);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...signUpData, coverPhoto: reader.result as string };
        setSignUpData(updated);
        saveSignUpDraft(updated, 4);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated webcam / custom camera capture
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);

  // Load persistent draft sign-up data
  useEffect(() => {
    const savedDraft = localStorage.getItem("mpla_signup_draft") || localStorage.getItem("nda_signup_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setSignUpData(prev => ({ ...prev, ...parsed.data }));
        if (parsed.step) {
          setSignUpStep(parsed.step);
        }
      } catch (e) {
        console.error("Error parsing sign-up draft", e);
      }
    }
  }, []);

  // Save draft on change
  const saveSignUpDraft = (updatedData: typeof signUpData, step: number) => {
    localStorage.setItem(
      "mpla_signup_draft", 
      JSON.stringify({ data: updatedData, step, timestamp: Date.now() })
    );
  };

  // Clear draft
  const clearSignUpDraft = () => {
    localStorage.removeItem("mpla_signup_draft");
    localStorage.removeItem("nda_signup_draft");
  };

  // Live Password Strength calculations
  const checkPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "Fraca", score: 0, color: "bg-red-500", requirements: {
      length: false, upper: false, lower: false, num: false, sym: false
    }};
    
    const requirements = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      num: /[0-9]/.test(pwd),
      sym: /[^A-Za-z0-9]/.test(pwd)
    };

    const metCount = Object.values(requirements).filter(Boolean).length;
    let label = "Fraca";
    let color = "bg-red-500";
    if (metCount === 5) {
      label = "Muito Forte";
      color = "bg-green-500";
    } else if (metCount >= 3) {
      label = "Boa";
      color = "bg-emerald-500";
    } else if (metCount >= 2) {
      label = "Razoável";
      color = "bg-amber-500";
    }

    return { label, score: metCount, color, requirements };
  };

  const strength = checkPasswordStrength(signUpData.password);

  // OTP Countdown handling
  useEffect(() => {
    let timer: any;
    if (mode === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [mode, countdown]);

  // Handle Login submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg("Por favor, introduza o seu Número de Militante, E-mail ou Telefone.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "A autenticação falhou. Verifique as credenciais.");
      }

      // Success
      if (rememberMe) {
        localStorage.setItem("mpla_remembered_identifier", identifier);
      } else {
        localStorage.removeItem("mpla_remembered_identifier");
        localStorage.removeItem("nda_remembered_identifier");
      }

      onLoginSuccess(data.user, data.role);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro inesperado durante o início de sessão.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill remembered identifier
  useEffect(() => {
    const remembered = localStorage.getItem("mpla_remembered_identifier") || localStorage.getItem("nda_remembered_identifier");
    if (remembered) {
      setIdentifier(remembered);
    }
  }, []);

  // Handle Sign In with OTP requested
  const handleRequestOTP = async () => {
    if (!identifier) {
      setErrorMsg("Por favor, introduza o seu Telefone ou E-mail para receber um código de segurança.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      // Simulate sending OTP to identifier
      const maskPhone = identifier.includes("@") 
        ? identifier 
        : identifier.replace(/.(?=.{4})/g, "X");

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: identifier })
      });

      if (!response.ok) throw new Error("Falha ao enviar código de segurança OTP.");

      setOtpSentTo(maskPhone);
      setCountdown(59);
      setOtpCode(Array(6).fill(""));
      setMode("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Falha na transmissão do código de validação.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Submission
  const handleVerifyOTP = async () => {
    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setErrorMsg("Por favor, introduza o código de verificação de 6 dígitos completo.");
      return;
    }

    setErrorMsg("");
    setOtpLoading(true);

    try {
      // Direct API authentication with cryptographic OTP verification
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otpCode: fullCode, role })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Código de verificação OTP inválido ou expirado.");
      }

      onLoginSuccess(data.user, data.role);
    } catch (err: any) {
      setErrorMsg(err.message || "Rejeição do código de verificação.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Paste handler for OTP inputs
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted.length === 6 && /^\d+$/.test(pasted)) {
      const codeArray = pasted.split("");
      setOtpCode(codeArray);
      otpInputRefs.current[5]?.focus();
    }
  };

  // OTP character change
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpCode];
    updated[index] = val;
    setOtpCode(updated);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Backspace key
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Progressive Step Continue
  const handleSignUpStepContinue = () => {
    setErrorMsg("");
    if (signUpStep === 1) {
      if (!signUpData.fullName || !signUpData.nationalId || !signUpData.mobile || !signUpData.kinName || !signUpData.kinPhone) {
        setErrorMsg("Por favor, preencha o seu nome, BI/passaporte, telefone e contacto de emergência.");
        return;
      }
      if (!signUpData.placeOfBirth || !signUpData.dob || !signUpData.occupation) {
        setErrorMsg("Por favor, preencha o Lugar de Nascimento, Data de Nascimento e a sua Profissão.");
        return;
      }
      if (signUpData.nationalId.length < 6) {
        setErrorMsg("Por favor, introduza um Número de Documento de Identificação válido.");
        return;
      }
      setSignUpStep(2);
      saveSignUpDraft(signUpData, 2);
    } else if (signUpStep === 2) {
      if (!signUpData.email || !signUpData.password || !signUpData.confirmPassword) {
        setErrorMsg("Por favor, preencha todos os campos de e-mail e palavra-passe.");
        return;
      }
      if (signUpData.password !== signUpData.confirmPassword) {
        setErrorMsg("As palavras-passe não coincidem.");
        return;
      }
      if (strength.score < 3) {
        setErrorMsg("Por favor, escolha uma palavra-passe mais forte de acordo com os critérios de segurança.");
        return;
      }
      setSignUpStep(3);
      saveSignUpDraft(signUpData, 3);
    } else if (signUpStep === 3) {
      setSignUpStep(4);
      saveSignUpDraft(signUpData, 4);
    } else if (signUpStep === 4) {
      // Ensure photo is selected or captured
      if (!signUpData.photo) {
        // Assign a default sample photo if empty
        const defaultPhoto = PHOTO_SAMPLES[Math.floor(Math.random() * PHOTO_SAMPLES.length)];
        const updated = { ...signUpData, photo: defaultPhoto };
        setSignUpData(updated);
        saveSignUpDraft(updated, 5);
      }
      setSignUpStep(5);
    }
  };

  // Final Registration Submission
  const handleSignUpSubmit = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration rejected.");
      }

      clearSignUpDraft();
      setMode("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize registration.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Simulated Webcam Camera Snapshot
  const triggerCameraCapture = () => {
    setIsCameraActive(true);
    setCameraCountdown(3);

    const interval = setInterval(() => {
      setCameraCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          // Snapshot completed!
          const chosen = PHOTO_SAMPLES[Math.floor(Math.random() * PHOTO_SAMPLES.length)];
          setSignUpData(prevData => {
            const nextData = { ...prevData, photo: chosen };
            saveSignUpDraft(nextData, signUpStep);
            return nextData;
          });
          setIsCameraActive(false);
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  // Handle forgot password request
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) {
      setErrorMsg("Please enter your Email or Membership Number.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setForgotSent(true);
    }, 1200);
  };

  return (
    <div id="auth_portal_root" className="min-h-screen bg-[#0F172A] flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Full-screen Background Image of MPLA members/supporters */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/src/assets/images/mpla_supporters_background_1784328681804.jpg" 
          alt="Militantes do MPLA" 
          className="w-full h-full object-cover opacity-30 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/95 via-[#580714]/80 to-[#0F172A]/95" />
      </div>

      {/* Dynamic Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
        {onBackToWeb ? (
          <button
            onClick={onBackToWeb}
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-slate-800 hover:text-black hover:bg-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {language === "PT" ? "Voltar ao Website" : "Back to Website"}
          </button>
        ) : <div />}
        <select 
          id="auth_lang_select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-[#111827] text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer shadow-xs focus:ring-1 focus:ring-[#C8102E] focus:outline-hidden"
        >
          <option value="EN">English (ZA)</option>
          <option value="PT">Português</option>
          <option value="XH">IsiXhosa</option>
          <option value="ZU">IsiZulu</option>
        </select>
      </div>

      {/* Main Grid Wrapper */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 min-h-screen relative z-10">
        
        {/* Left Panel: 45% (Cols 1-4) - Branding & Features (No separating line, transparent background) */}
        <div className="hidden lg:flex lg:col-span-4 bg-transparent flex-col justify-between p-12 relative overflow-hidden">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-transparent flex items-center justify-center shadow-none p-0 text-white">
              <img 
                src={LOCAL_MPLA_PARTY_LOGO} 
                alt="MPLA Logo" 
                className="w-full h-full object-contain bg-transparent"
              />
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg text-white tracking-tight leading-none">
                MPLA Portal Unificado
              </h2>
              <p className="text-[10px] text-[#FFCC00] font-mono uppercase tracking-wider mt-1 font-bold">Sede África do Sul</p>
            </div>
          </div>

          {/* Core Branding Message & High-Fidelity Illustration */}
          <div className="my-auto space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-mono bg-red-950/60 text-red-200 border border-red-800/40 font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                Portal de Membros Oficial (SA)
              </span>
              <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                Bem-vindo ao <span className="text-[#FFCC00]">MPLA</span>
              </h1>
              <p className="text-slate-300 leading-relaxed text-sm max-w-sm">
                Gerencie sua filiação, cartão digital de membro, eventos e comunicações com segurança a partir de um único local.
              </p>
            </div>

            {/* Semi-transparent Glassmorphism Illustration Block */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg max-w-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/20 rounded-full blur-3xl opacity-60" />
              
              <div className="space-y-4 relative z-10">
                {/* Simulated Digital Card UI */}
                <div className="border border-[#FFCC00] rounded-xl p-4 bg-gradient-to-br from-[#D3122A] via-[#D3122A] to-slate-950 text-white space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-[#FFCC00]/30 rounded-full" />
                    <span className="text-[9px] font-bold text-[#FFCC00]">★ MPLA</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/MPLA_Party_logo.svg/250px-MPLA_Party_logo.svg.png" 
                        alt="MPLA" 
                        className="w-5 h-5 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-24 bg-white/80 rounded-full" />
                      <div className="h-1.5 w-16 bg-[#FFCC00]/70 rounded-full" />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <div className="h-2 w-12 bg-green-500 rounded-full" />
                    <div className="text-[8px] font-mono text-[#FFCC00]">Sede África do Sul</div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-semibold text-center">
                  Identidade Digital Criptografada e Sincronização em Tempo Real
                </p>
              </div>
            </div>

            {/* Features small icon checklist */}
            <div className="space-y-3">
              {[
                "Acesso Seguro e Proteção Multi-factor",
                "Cartão de Membro Digital com Código QR",
                "Inscrição em Eventos Regionais e Presenças",
                "Notificações em tempo real da Sede Central",
                "Gestão de Perfil e Atribuição de Comités"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#FFCC00]/15 border border-[#FFCC00]/30 flex items-center justify-center text-[#FFCC00] shrink-0 font-bold">
                    ✓
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Left Panel Footer info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/10 pt-4">
            <span>MPLA CENTRAL GATEWAY SECURITY v2.2</span>
            <span className="text-[#FFCC00] font-bold">CONSTITUCIONAL</span>
          </div>
        </div>

        {/* Right Panel: 55% (Cols 5-10) - Authenticating Forms (Semi-transparent background for seamless integration) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-white/95 backdrop-blur-md">
          
          {/* Logo on mobile only */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 self-start">
            <div className="w-10 h-10 bg-transparent p-0 flex items-center justify-center text-white">
              <img 
                src={LOCAL_MPLA_PARTY_LOGO} 
                alt="MPLA Logo" 
                className="w-full h-full object-contain bg-transparent"
              />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm text-[#111827]">
                MPLA Sede África do Sul
              </h2>
            </div>
          </div>

          {/* Main Centered Authentication Card Container */}
          <div className="w-full max-w-[460px] py-4">

            {/* SIGN IN SCREEN */}
            {mode === "signin" && (
              <div className="space-y-6">
                {/* Secure Portal Separator Checkbox */}
                <div className="bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E5E7EB] grid grid-cols-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRole("member")}
                    className={`py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      role === "member"
                        ? "bg-white text-[#111827] shadow-xs font-bold border border-[#E5E7EB]"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Acesso Militante
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      role === "admin"
                        ? "bg-white text-[#111827] shadow-xs font-bold border border-[#E5E7EB]"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Portal Super Admin
                  </button>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-100 flex items-start gap-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Smart Identifier Input */}
                  <div className="space-y-2">
                    <label htmlFor="signin_identifier" className="block text-xs font-semibold text-[#111827]">
                      {role === "admin" ? "Utilizador ou E-mail do Super Administrador" : "Nº de Militante, E-mail ou Telemóvel"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                        {role === "admin" ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <input
                        id="signin_identifier"
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={role === "admin" ? "Introduza o utilizador ou e-mail" : "Introduza o nº de militante, e-mail ou telemóvel"}
                        className="block w-full pl-11 pr-4 py-3.5 h-[52px] bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="signin_password" className="block text-xs font-semibold text-[#111827]">
                        Palavra-passe
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs text-[#6B7280] hover:text-[#C8102E] font-medium"
                      >
                        Esqueceu-se da palavra-passe?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="signin_password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-11 pr-11 py-3.5 h-[52px] bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280] hover:text-[#111827]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center">
                    <input
                      id="signin_remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-[#C8102E] focus:ring-[#C8102E] border-[#E5E7EB] rounded-sm cursor-pointer"
                    />
                    <label htmlFor="signin_remember" className="ml-2 block text-xs text-[#6B7280] font-medium cursor-pointer">
                      Lembrar os meus dados de acesso
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="signin_submit_btn"
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-[#C8102E] hover:bg-[#A50D24] text-white font-semibold text-sm rounded-xl flex items-center justify-center transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Iniciar Sessão"
                    )}
                  </button>

                  {/* OR Quick OTP Line */}
                  {role !== "admin" && (
                    <>
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-[#E5E7EB]"></div>
                        <span className="flex-shrink mx-4 text-[10px] text-[#6B7280] font-mono">OU ACESSO RÁPIDO</span>
                        <div className="flex-grow border-t border-[#E5E7EB]"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={loading}
                        className="w-full h-14 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-slate-100 text-[#111827] font-semibold text-sm rounded-xl flex items-center justify-center transition active:scale-[0.99] cursor-pointer"
                      >
                        Entrar com Código Único (OTP)
                      </button>
                    </>
                  )}
                </form>

                {role !== "admin" && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-[#6B7280]">
                      Ainda não tem conta?{" "}
                      <button
                        onClick={() => {
                          setErrorMsg("");
                          setMode("signup");
                        }}
                        className="text-[#C8102E] font-semibold hover:underline"
                      >
                        Criar Conta / Recensear
                      </button>
                    </p>
                  </div>
                )}

                {/* Security Trust Note */}
                <p className="text-[10px] text-[#6B7280] text-center font-medium bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E5E7EB]">
                  🔒 As suas informações estão criptografadas e protegidas sob os regulamentos internos do MPLA Sede África do Sul.
                </p>
              </div>
            )}

            {/* PROGRESSIVE SIGN UP SCREEN */}
            {mode === "signup" && (
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    if (signUpStep > 1) {
                      setSignUpStep(signUpStep - 1);
                    } else {
                      setMode("signin");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {signUpStep === 1 ? "Voltar ao início de sessão" : "Passo Anterior"}
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-[#111827] tracking-tight mb-1">Recenseamento Central de Militantes</h1>
                  <p className="text-[#6B7280] text-xs">Conclua 5 passos rápidos para credenciar o seu perfil no partido.</p>
                </div>

                {/* Progressive Bar Indicator: ●────○────○────○────○ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold font-mono text-[#6B7280]">
                    <span className="text-[#C8102E]">Passo {signUpStep} de 5</span>
                    <span>
                      {signUpStep === 1 && "Identificação Pessoal"}
                      {signUpStep === 2 && "Segurança e Palavra-passe"}
                      {signUpStep === 3 && "Afetação Regional"}
                      {signUpStep === 4 && "Fotografia e Credenciação"}
                      {signUpStep === 5 && "Revisão e Submissão"}
                    </span>
                  </div>

                  {/* Dot line indicator */}
                  <div className="flex items-center gap-1 justify-between py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <React.Fragment key={s}>
                        <div 
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                            s <= signUpStep 
                              ? "bg-[#C8102E] text-white shadow-xs" 
                              : "bg-[#E5E7EB] text-[#6B7280]"
                          }`}
                        >
                          {s < signUpStep ? "✓" : s}
                        </div>
                        {s < 5 && (
                          <div 
                            className={`h-0.5 w-full rounded-full ${
                              s < signUpStep ? "bg-[#C8102E]" : "bg-[#E5E7EB]"
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-100 flex items-start gap-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* STEP 1: Personal Credentials */}
                {signUpStep === 1 && (
                  <div className="space-y-4">
                    {/* Número de Identificação Militante (Opcional - Ex: Número ADL) */}
                    <div className="space-y-1.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-[#111827] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#C8102E]" />
                          Número de Identificação Militante (Exemplo: Número ADL)
                        </label>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                          Opcional
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={signUpData.membershipNo}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            const updated = { ...signUpData, membershipNo: val };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 1);
                          }}
                          placeholder="Ex: ADL-2026-98421 (ou deixe em branco para gerar com prefixo ADL)"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C8102E] font-mono uppercase font-bold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1">
                        Informe o seu <strong>Número de Identificação Militante</strong> (ex.: número ADL). Este campo é <strong>opcional</strong>. Caso não forneça, o sistema gerará automaticamente o seu número iniciando com a sigla <strong>ADL</strong>.
                      </p>
                    </div>

                    {/* Organization Wing Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Estrutura / Organização de Massas</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "Militante", label: "Apenas Militante" },
                          { id: "JMPLA", label: "Juntar-se à JMPLA" },
                          { id: "OMA", label: "Juntar-se à OMA" }
                        ].map(wingOption => (
                          <button
                            key={wingOption.id}
                            type="button"
                            onClick={() => {
                              const updated = { ...signUpData, organizationWing: wingOption.id as any };
                              setSignUpData(updated);
                              saveSignUpDraft(updated, 1);
                            }}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                              signUpData.organizationWing === wingOption.id
                                ? "bg-[#C8102E] text-white border-[#C8102E] shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {wingOption.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Nome Completo de Militante</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type="text"
                          required
                          placeholder="ex: Manuel António Neto"
                          value={signUpData.fullName}
                          onChange={(e) => {
                            const updated = { ...signUpData, fullName: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 1);
                          }}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* ID Type Selection (BI or Passport) & Number */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-[#111827]">Tipo de Documento de Identificação</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...signUpData, idType: "BI" as const };
                              setSignUpData(updated);
                              saveSignUpDraft(updated, 1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              signUpData.idType === "BI"
                                ? "bg-[#C8102E] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Bilhete de Identidade (B.I.)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...signUpData, idType: "Passport" as const };
                              setSignUpData(updated);
                              saveSignUpDraft(updated, 1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              signUpData.idType === "Passport"
                                ? "bg-[#C8102E] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Passaporte
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <ShieldCheck className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type="text"
                          required
                          placeholder={signUpData.idType === "Passport" ? "ex: N1234567 (Passaporte)" : "ex: 004928172LA042 (B.I.)"}
                          value={signUpData.nationalId}
                          onChange={(e) => {
                            const updated = { ...signUpData, nationalId: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 1);
                          }}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* Lugar de Nascimento & Data de Nascimento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#111827]">Lugar de Nascimento</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                          <input
                            type="text"
                            required
                            placeholder="ex: Luanda, Angola"
                            value={signUpData.placeOfBirth}
                            onChange={(e) => {
                              const updated = { ...signUpData, placeOfBirth: e.target.value };
                              setSignUpData(updated);
                              saveSignUpDraft(updated, 1);
                            }}
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#111827]">Data de Nascimento</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                          <input
                            type="date"
                            required
                            value={signUpData.dob}
                            onChange={(e) => {
                              const updated = { ...signUpData, dob: e.target.value };
                              setSignUpData(updated);
                              saveSignUpDraft(updated, 1);
                            }}
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profissão */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Profissão</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type="text"
                          required
                          placeholder="ex: Engenheiro de Software / Médico / Professor"
                          value={signUpData.occupation}
                          onChange={(e) => {
                            const updated = { ...signUpData, occupation: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 1);
                          }}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Número de Telefone Telemóvel</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type="text"
                          required
                          placeholder="ex: +27 82 555 1234"
                          value={signUpData.mobile}
                          onChange={(e) => {
                            const updated = { ...signUpData, mobile: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 1);
                          }}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200/50 my-2 pt-2">
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Contacto de Emergência</p>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#111827]">Nome Completo do Contacto</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                            <input
                              type="text"
                              required
                              placeholder="ex: Maria Lusimadio"
                              value={signUpData.kinName}
                              onChange={(e) => {
                                const updated = { ...signUpData, kinName: e.target.value };
                                setSignUpData(updated);
                                saveSignUpDraft(updated, 1);
                              }}
                              className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#111827]">Telefone do Contacto</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                            <input
                              type="text"
                              required
                              placeholder="ex: +27 82 987 6543"
                              value={signUpData.kinPhone}
                              onChange={(e) => {
                                const updated = { ...signUpData, kinPhone: e.target.value };
                                setSignUpData(updated);
                                saveSignUpDraft(updated, 1);
                              }}
                              className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Password & Email */}
                {signUpStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Endereço de Correio Eletrónico (E-mail)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type="email"
                          required
                          placeholder="ex: nome@dominio.com"
                          value={signUpData.email}
                          onChange={(e) => {
                            const updated = { ...signUpData, email: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 2);
                          }}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Escolha a Palavra-passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={signUpData.password}
                          onChange={(e) => {
                            const updated = { ...signUpData, password: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 2);
                          }}
                          className="block w-full pl-11 pr-11 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Confirmar Palavra-passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={signUpData.confirmPassword}
                          onChange={(e) => {
                            const updated = { ...signUpData, confirmPassword: e.target.value };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 2);
                          }}
                          className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Real-time Password Strength Indicator */}
                    {signUpData.password && (
                      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[#6B7280]">Força da Palavra-passe:</span>
                          <span className={strength.score >= 4 ? "text-green-600" : strength.score >= 2 ? "text-amber-500" : "text-red-500"}>
                            {strength.label}
                          </span>
                        </div>
                        {/* Progress Bar of Strength */}
                        <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <div 
                              key={idx} 
                              className={`h-full w-1/5 transition ${
                                idx <= strength.score ? strength.color : "bg-transparent"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Checklist */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-[#6B7280]">
                          <div className="flex items-center gap-1.5">
                            <span className={strength.requirements.length ? "text-[#16A34A]" : "text-[#6B7280]"}>
                              {strength.requirements.length ? "✔" : "○"} Mínimo 8 Caracteres
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strength.requirements.upper ? "text-[#16A34A]" : "text-[#6B7280]"}>
                              {strength.requirements.upper ? "✔" : "○"} Letra Maiúscula (A-Z)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strength.requirements.lower ? "text-[#16A34A]" : "text-[#6B7280]"}>
                              {strength.requirements.lower ? "✔" : "○"} Letra Minúscula (a-z)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strength.requirements.num ? "text-[#16A34A]" : "text-[#6B7280]"}>
                              {strength.requirements.num ? "✔" : "○"} Número (0-9)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strength.requirements.sym ? "text-[#16A34A]" : "text-[#6B7280]"}>
                              {strength.requirements.sym ? "✔" : "○"} Símbolo Especial
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Province, Municipality, Committee */}
                {signUpStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Província / País da Diáspora</label>
                      <select
                        value={signUpData.province}
                        onChange={(e) => {
                          const prov = e.target.value;
                          const mapped = PROVINCE_MAPPING[prov];
                          const updated = { 
                            ...signUpData, 
                            province: prov,
                            municipality: mapped?.municipalities[0] || "",
                            committee: mapped?.committees[0] || ""
                          };
                          setSignUpData(updated);
                          saveSignUpDraft(updated, 3);
                        }}
                        className="block w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden cursor-pointer"
                      >
                        {Object.keys(PROVINCE_MAPPING).map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    {/* Adaptive Municipality Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Município / Cidade</label>
                      <select
                        value={signUpData.municipality}
                        onChange={(e) => {
                          const updated = { ...signUpData, municipality: e.target.value };
                          setSignUpData(updated);
                          saveSignUpDraft(updated, 3);
                        }}
                        className="block w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden cursor-pointer"
                      >
                        {PROVINCE_MAPPING[signUpData.province]?.municipalities.map((muni) => (
                          <option key={muni} value={muni}>{muni}</option>
                        ))}
                      </select>
                    </div>

                    {/* Adaptive Committee Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#111827]">Comité de Afiliação</label>
                      <select
                        value={signUpData.committee}
                        onChange={(e) => {
                          const updated = { ...signUpData, committee: e.target.value };
                          setSignUpData(updated);
                          saveSignUpDraft(updated, 3);
                        }}
                        className="block w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden cursor-pointer"
                      >
                        {PROVINCE_MAPPING[signUpData.province]?.committees.map((comm) => (
                          <option key={comm} value={comm}>{comm}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 4: Photo & Cover Image Upload for Cartão de Militante */}
                {signUpStep === 4 && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <label className="block text-xs font-bold text-[#111827]">
                        Fotos do Cartão Oficial de Militante
                      </label>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        Carregue a sua foto de perfil e a imagem de capa. Serão capturadas automaticamente no seu Cartão de Militante.
                      </p>
                    </div>

                    {/* Hidden file inputs */}
                    <input 
                      type="file" 
                      ref={profileFileInputRef} 
                      accept="image/*" 
                      onChange={handleProfileFileUpload} 
                      className="hidden" 
                    />
                    <input 
                      type="file" 
                      ref={coverFileInputRef} 
                      accept="image/*" 
                      onChange={handleCoverFileUpload} 
                      className="hidden" 
                    />

                    {/* Live Card Preview Mockup */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-md">
                      {/* Cover Image Banner */}
                      <div className="relative h-24 bg-gradient-to-r from-red-800 to-amber-600 overflow-hidden">
                        {signUpData.coverPhoto ? (
                          <img 
                            src={signUpData.coverPhoto} 
                            alt="Cover Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/60 text-xs font-mono font-semibold italic">
                            [Imagem de Capa do Cartão]
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <Upload className="w-3 h-3" />
                          Alterar Capa
                        </button>
                      </div>

                      {/* Profile Photo Overlapping Cover */}
                      <div className="px-4 pb-4 flex justify-between items-end -mt-8 relative z-10">
                        <div className="relative">
                          {isCameraActive ? (
                            <div className="w-20 h-20 rounded-xl bg-slate-900 border-4 border-white flex flex-col items-center justify-center text-white text-[10px] font-mono animate-pulse shadow-lg">
                              <span>SNAP</span>
                              <span className="text-xl font-black text-[#C8102E]">{cameraCountdown}</span>
                            </div>
                          ) : signUpData.photo ? (
                            <div className="relative">
                              <img 
                                src={signUpData.photo} 
                                alt="Profile Avatar" 
                                className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg bg-white"
                                style={{ objectPosition: `${signUpData.photoPositionX}% ${signUpData.photoPositionY}%` }}
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs">
                                <Check className="w-3 h-3" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-200 border-4 border-white flex items-center justify-center text-slate-500 shadow-lg">
                              <User className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <div className="text-right pb-1">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                            {signUpData.fullName || "Nome do Militante"}
                          </p>
                          <p className="text-[10px] font-mono font-bold text-[#C8102E] uppercase">
                            MPLA • Cartão de Militante
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls for Profile Photo */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">1. Foto de Perfil (Rosto)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => profileFileInputRef.current?.click()}
                          className="py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#C8102E]" />
                          Carregar Ficheiro
                        </button>

                        <button
                          type="button"
                          onClick={triggerCameraCapture}
                          disabled={isCameraActive}
                          className="py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#C8102E]" />
                          Câmara
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const sample = PHOTO_SAMPLES[Math.floor(Math.random() * PHOTO_SAMPLES.length)];
                            const updated = { ...signUpData, photo: sample };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 4);
                          }}
                          className="py-2.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          Modelo Exemplo
                        </button>
                      </div>

                      {/* Directional position controls */}
                      {signUpData.photo && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <p className="text-[10px] font-mono font-bold text-slate-600 uppercase flex items-center gap-1">
                            <Compass className="w-3 h-3 text-[#C8102E]" /> Enquadramento da Foto do Rosto
                          </p>
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <button
                              type="button"
                              onClick={() => setSignUpData({ ...signUpData, photoPositionX: Math.max(0, signUpData.photoPositionX - 10) })}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                            >
                              ⬅️ Esquerda
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignUpData({ ...signUpData, photoPositionY: Math.max(0, signUpData.photoPositionY - 10) })}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                            >
                              ⬆️ Subir
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignUpData({ ...signUpData, photoPositionY: Math.min(100, signUpData.photoPositionY + 10) })}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                            >
                              ⬇️ Baixar
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignUpData({ ...signUpData, photoPositionX: Math.min(100, signUpData.photoPositionX + 10) })}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                            >
                              ➡️ Direita
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Controls for Cover Photo */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">2. Imagem de Capa do Cartão</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          Carregar Foto de Capa
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const sample = COVER_SAMPLES[Math.floor(Math.random() * COVER_SAMPLES.length)];
                            const updated = { ...signUpData, coverPhoto: sample };
                            setSignUpData(updated);
                            saveSignUpDraft(updated, 4);
                          }}
                          className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          Capa Oficial MPLA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Final Review & Submit */}
                {signUpStep === 5 && (
                  <div className="space-y-4 text-xs">
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB] space-y-3">
                      <p className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB] pb-1">
                        Ficha de Recenseamento e Credenciação
                      </p>
                      
                      {/* Preview with Cover and Profile */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <div className="h-16 bg-slate-800 overflow-hidden relative">
                          <img 
                            src={signUpData.coverPhoto || COVER_SAMPLES[0]} 
                            alt="Cover" 
                            className="w-full h-full object-cover opacity-80" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-3 flex items-center gap-3 -mt-6 relative z-10">
                          <img 
                            src={signUpData.photo || PHOTO_SAMPLES[0]} 
                            alt="Review avatar" 
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md bg-white"
                            referrerPolicy="no-referrer"
                          />
                          <div className="pt-4">
                            <p className="font-extrabold text-[#111827] text-sm">{signUpData.fullName}</p>
                            <p className="text-[#6B7280] text-[11px]">BI: {signUpData.nationalId}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-[#E5E7EB]">
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">LUGAR DE NASCIMENTO</p>
                          <p className="font-bold text-[#111827] truncate">{signUpData.placeOfBirth || "Luanda, Angola"}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">DATA DE NASCIMENTO</p>
                          <p className="font-bold text-[#111827]">{signUpData.dob ? signUpData.dob.split("-").reverse().join("/") : "N/D"}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">PROFISSÃO</p>
                          <p className="font-bold text-[#111827] truncate">{signUpData.occupation || "N/D"}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">TELEMÓVEL</p>
                          <p className="font-bold text-[#111827]">{signUpData.mobile}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">CORREIO ELETRÓNICO</p>
                          <p className="font-bold text-[#111827] truncate">{signUpData.email}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">PROVÍNCIA CONSULAR</p>
                          <p className="font-bold text-[#111827]">{signUpData.province}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">MUNICÍPIO</p>
                          <p className="font-bold text-[#111827] truncate">{signUpData.municipality}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E5E7EB]">
                        <p className="text-[#6B7280] font-medium text-[10px]">COMITÉ DE AFILIAÇÃO</p>
                        <p className="font-bold text-[#111827]">{signUpData.committee}</p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center">
                        <div>
                          <p className="text-[#6B7280] font-medium text-[10px]">NÚMERO DE IDENTIFICAÇÃO MILITANTE</p>
                          <p className="font-bold text-[#111827] font-mono text-xs">
                            {signUpData.membershipNo.trim() ? signUpData.membershipNo.trim().toUpperCase() : "Será gerado automaticamente com prefixo ADL"}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-red-50 text-[#C8102E] px-2 py-0.5 rounded border border-red-100">
                          {signUpData.membershipNo.trim() ? "Informado" : "Auto-Geração ADL"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#6B7280] leading-relaxed">
                      Ao submeter esta ficha de recenseamento, declara sob compromisso de honra que os dados prestados são verdadeiros e autênticos.
                    </p>
                  </div>
                )}

                {/* Continue / Submit triggers */}
                {signUpStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleSignUpStepContinue}
                    className="w-full h-14 bg-[#C8102E] hover:bg-[#A50D24] text-white font-semibold text-sm rounded-xl flex items-center justify-center transition active:scale-[0.99] cursor-pointer"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignUpSubmit}
                    disabled={loading}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Finalizar e Submeter Recenseamento
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* OTP VERIFICATION SCREEN */}
            {mode === "otp" && (
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setMode("signin");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Início de Sessão
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-[#111827] tracking-tight mb-2">Verificação de Identidade</h1>
                  <p className="text-[#6B7280] text-sm">
                    Enviámos um código de segurança encriptado para <strong className="text-[#111827]">{otpSentTo}</strong>.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-100 flex items-start gap-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 6 Digit Individual boxes */}
                <div className="flex justify-between gap-2.5 py-4">
                  {otpCode.map((char, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      ref={(el) => {
                        if (el) otpInputRefs.current[index] = el;
                      }}
                      value={char}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center font-bold text-lg border border-[#E5E7EB] bg-white text-[#111827] rounded-xl focus:ring-2 focus:ring-[#C8102E] focus:outline-hidden"
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7280]">
                    {countdown > 0 ? (
                      `Reenviar código em ${countdown}s`
                    ) : (
                      "Não recebeu o código?"
                    )}
                  </span>
                  
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleRequestOTP}
                    className="text-[#C8102E] font-semibold hover:underline disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Reenviar Código
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={otpLoading}
                  className="w-full h-14 bg-[#C8102E] hover:bg-[#A50D24] text-white font-semibold text-sm rounded-xl flex items-center justify-center transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {otpLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verificar Identidade"
                  )}
                </button>
              </div>
            )}

            {/* FORGOT PASSWORD SCREEN */}
            {mode === "forgot" && (
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setForgotSent(false);
                    setMode("signin");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Início de Sessão
                </button>

                {!forgotSent ? (
                  <>
                    <div>
                      <h1 className="text-2xl font-bold text-[#111827] tracking-tight mb-2">Redefinir Palavra-passe</h1>
                      <p className="text-[#6B7280] text-sm">
                        Introduza as suas credenciais para receber um hiperligação de redefinição encriptada.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-100 flex items-start gap-2.5 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#111827]">
                          E-mail, Número de Militante ou Telefone
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                          <input
                            type="text"
                            required
                            placeholder="Introduza a sua credencial"
                            value={forgotIdentifier}
                            onChange={(e) => setForgotIdentifier(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#6B7280] focus:ring-1 focus:ring-[#C8102E] h-[52px] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-[#C8102E] hover:bg-[#A50D24] text-white font-semibold text-sm rounded-xl flex items-center justify-center transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Enviar Ligação de Redefinição"
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-[#111827]">Ligação de Redefinição Enviada</h2>
                    <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                      Foi enviada uma mensagem de redefinição segura para o seu e-mail de contacto. Por favor verifique a sua caixa de entrada nos próximos 10 minutos.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        setMode("signin");
                      }}
                      className="px-6 py-2.5 bg-white border border-[#E5E7EB] rounded-xl font-semibold text-xs text-[#111827] hover:bg-[#F8FAFC]"
                    >
                      Voltar ao Início de Sessão
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUCCESS SCREEN */}
            {mode === "success" && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto animate-bounce shadow-lg shadow-green-100">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-[#111827]">Inscrição Efetuada com Sucesso!</h1>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                    O seu registo central de militante foi submetido na base de dados segura do partido. A fila de emissão do seu cartão digital está ativa.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] text-left space-y-2.5 max-w-sm mx-auto">
                  <p className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">Credenciais de Acesso</p>
                  <div>
                    <span className="text-[10px] text-[#6B7280] block">IDENTIFICADOR</span>
                    <span className="font-bold text-xs text-[#111827]">{signUpData.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] block">Nº DE MILITANTE</span>
                    <span className="font-mono text-xs font-bold text-[#C8102E]">MPLA-2026-GERADO</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setIdentifier(signUpData.email);
                    setPassword("");
                    setMode("signin");
                  }}
                  className="w-full h-14 bg-[#C8102E] hover:bg-[#A50D24] text-white font-semibold text-sm rounded-xl flex items-center justify-center transition active:scale-[0.99] cursor-pointer"
                >
                  Continuar para Início de Sessão
                </button>
              </div>
            )}

          </div>

          {/* Right Panel Footer - Responsive & accessible links */}
          <div className="w-full max-w-[460px] border-t border-[#E5E7EB] pt-6 mt-8 space-y-3">
            <div className="flex flex-wrap justify-between items-center text-[11px] text-[#6B7280] font-medium gap-2">
              <div className="flex gap-4">
                <a href="#privacy" className="hover:text-[#111827] hover:underline">Política de Privacidade</a>
                <a href="#terms" className="hover:text-[#111827] hover:underline">Termos de Serviço</a>
                <a href="#help" className="hover:text-[#111827] hover:underline">Ajuda e Suporte</a>
              </div>
              <div className="font-mono text-[10px]">
                Gateway v2.2 AA
              </div>
            </div>
            <div className="text-center sm:text-left text-xs font-medium text-slate-500 pt-1 flex flex-wrap items-center gap-2">
              <span>Developed by <strong className="text-slate-800">NeuroGrowth Labs</strong> <a href="https://www.neurogrowthlabs.co.za" target="_blank" rel="noopener noreferrer" className="text-[#C8102E] font-bold hover:underline font-mono">www.neurogrowthlabs.co.za</a></span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[10px] text-slate-500">Portal ID: M-1791641184163-SSL-2026</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
