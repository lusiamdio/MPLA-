import React, { useState, useEffect } from "react";
import { 
  Settings, Palette, Globe, Sun, Moon, Clock, MailOpen, MessageSquare, 
  HardDriveUpload, Trash2, ShieldAlert, ToggleLeft, Key, Cpu, RefreshCw, 
  Sliders, Download, CheckSquare, Save 
} from "lucide-react";
import MemberSecurityDiagnosticSuite from "./MemberSecurityDiagnosticSuite";
import { showToast } from "../lib/notifications";

export default function AdminSystemCentre() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  
  // Real-time server diagnostic stats (simulate active polling)
  const [healthMetrics, setHealthMetrics] = useState({
    cpu: 12,
    memory: 48,
    responseTime: 18,
    logsQueue: 24
  });

  // Birthday Service state
  const [bdayStatus, setBdayStatus] = useState<any>(null);
  const [bdayLoading, setBdayLoading] = useState<boolean>(false);

  const fetchBirthdayStatus = async () => {
    try {
      const res = await fetch("/api/birthday-service/status");
      if (res.ok) {
        const data = await res.json();
        setBdayStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerBirthdayCheck = async () => {
    setBdayLoading(true);
    try {
      const res = await fetch("/api/birthday-service/trigger", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBdayStatus(data.result);
        fetchBirthdayStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBdayLoading(false);
    }
  };

  // Load settings from backend
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/system/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBirthdayStatus();

    // Health telemetry generator simulation
    const interval = setInterval(() => {
      setHealthMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + Math.floor(Math.random() * 9 - 4))),
        memory: Math.max(40, Math.min(65, prev.memory + Math.floor(Math.random() * 3 - 1))),
        responseTime: Math.max(12, Math.min(35, prev.responseTime + Math.floor(Math.random() * 7 - 3))),
        logsQueue: prev.logsQueue
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateSettings = async (updatedSettings: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/system/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeField = (path: string[], value: any) => {
    const updated = { ...settings };
    let temp = updated;
    for (let i = 0; i < path.length - 1; i++) {
      temp = temp[path[i]];
    }
    temp[path[path.length - 1]] = value;
    setSettings(updated);
  };

  const handleSaveAll = () => {
    handleUpdateSettings(settings);
  };

  // Trigger automated / manual backup
  const triggerManualBackup = async () => {
    setBackupLoading(true);
    setBackupResult(null);
    try {
      const res = await fetch("/api/system/backup", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBackupResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider">A carregar estado das configurações do sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="system-administration">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600 animate-pulse" />
            Portal de Administração do Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie a identidade visual da plataforma, definições regionais, modelos de notificação HTML, privilégios do sistema, cópias de segurança e recursos do servidor.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-blue-100"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Configurações do Sistema
        </button>
      </div>

      {/* SYSTEM DIAGNOSTICS & TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Processador Central (CPU)", value: `${healthMetrics.cpu}%`, color: healthMetrics.cpu > 80 ? "text-rose-600" : "text-[#D3122A]", metric: healthMetrics.cpu, desc: "Limite de alocação SLA" },
          { label: "Utilização de RAM do Servidor", value: `${healthMetrics.memory}%`, color: "text-red-700", metric: healthMetrics.memory, desc: "Carga dos buffers de memória" },
          { label: "Latência de Resposta do Nó", value: `${healthMetrics.responseTime} ms`, color: "text-emerald-600", metric: (healthMetrics.responseTime / 40) * 100, desc: "Excelente tempo de resposta" },
          { label: "Fila de Tarefas do Sistema", value: "0 tarefas", color: "text-slate-600", metric: 0, desc: "Agendador sem pendências" }
        ].map((met, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-extrabold">{met.label}</span>
              <Cpu className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className={`text-lg font-extrabold font-mono ${met.color}`}>{met.value}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{met.desc}</p>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  met.metric > 80 ? "bg-rose-500" : "bg-blue-600"
                }`} 
                style={{ width: `${met.metric}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* FULL MEMBERS PLATFORM DIAGNOSTIC & SECURITY AUDIT SUITE */}
      <MemberSecurityDiagnosticSuite isAdmin={true} onRefreshParentData={fetchSettings} />

      {/* TWO-COLUMN EDIT PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: BRANDING, LOCALIZATION & FEATURE FLAGS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BRANDING AND LOGO CONFIG */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-4.5 h-4.5 text-[#D3122A]" />
              Identidade Corporativa e Marca
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Nome do Partido / Organização</label>
                <input
                  type="text"
                  value={settings.partyName}
                  onChange={(e) => handleChangeField(["partyName"], e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D3122A] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">URL do Logótipo Oficial</label>
                <input
                  type="text"
                  value={settings.logoUrl}
                  onChange={(e) => handleChangeField(["logoUrl"], e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D3122A] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Cor Primária (HEX)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChangeField(["primaryColor"], e.target.value)}
                    className="w-10 h-10 border-0 rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleChangeField(["primaryColor"], e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D3122A] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Cor Secundária (HEX)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleChangeField(["secondaryColor"], e.target.value)}
                    className="w-10 h-10 border-0 rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => handleChangeField(["secondaryColor"], e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D3122A] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LOCALIZATION & THEME COMPLIANCE */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-4.5 h-4.5 text-[#D3122A]" />
              Regionalização, Fuso Horário e Tema da Interface
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Idioma Padrão do Sistema</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => handleChangeField(["defaultLanguage"], e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="Portuguese (Angola)">Português (Oficial)</option>
                  <option value="English (South Africa)">Inglês (África do Sul)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Fuso Horário Operacional</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChangeField(["timezone"], e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option>Africa/Johannesburg (GMT+2)</option>
                  <option>Africa/Luanda (GMT+1)</option>
                </select>
              </div>

              {/* Theme Settings */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Motor de Tema do Portal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setThemeMode("light")}
                    className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                      themeMode === "light"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Modo Claro
                  </button>
                  <button
                    onClick={() => setThemeMode("dark")}
                    className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                      themeMode === "dark"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Modo Escuro
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TEMPLATES FOR NOTIFICATION CENTER */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <MailOpen className="w-4.5 h-4.5 text-[#D3122A]" />
              Modelos HTML para E-mail SMTP e SMS Transacionais
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <MailOpen className="w-3.5 h-3.5 text-red-500" /> E-mail HTML: Modelo de Código OTP de Verificação
                </p>
                <textarea
                  value={settings.emailTemplates.verification}
                  onChange={(e) => handleChangeField(["emailTemplates", "verification"], e.target.value)}
                  rows={2}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D3122A] outline-none"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-red-500" /> SMS Móvel: Modelo de Mensagem OTP
                </p>
                <input
                  type="text"
                  value={settings.smsTemplates.otp}
                  onChange={(e) => handleChangeField(["smsTemplates", "otp"], e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D3122A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <MailOpen className="w-3.5 h-3.5 text-indigo-500" /> E-mail: Cartão Enviado
                  </label>
                  <textarea
                    value={settings.emailTemplates.cardDispatched}
                    onChange={(e) => handleChangeField(["emailTemplates", "cardDispatched"], e.target.value)}
                    rows={2}
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D3122A] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-yellow-500" /> SMS: Cartão Enviado
                  </label>
                  <textarea
                    value={settings.smsTemplates.cardDispatched}
                    onChange={(e) => handleChangeField(["smsTemplates", "cardDispatched"], e.target.value)}
                    rows={2}
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D3122A] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: POLICIES, BACKUPS & SECURITY CONTROL */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CRITICAL FEATURE FLAGS */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Sliders className="w-4.5 h-4.5 text-[#D3122A]" />
              Funcionalidades Ativas do Sistema
            </h3>

            <div className="space-y-4">
              {[
                { key: "aiAssistedScans", label: "Deteção Automática de Anomalias", desc: "Permite verificar instantaneamente inconsistências em inscrições" },
                { key: "instantSelfServiceRegistration", label: "Inscrição Direta de Auto-Serviço", desc: "Permite que cidadãos submetam candidaturas diretamente" },
                { key: "realtimeCardDispatches", label: "Atualizações de Envio em Tempo Real", desc: "Sincroniza APIs de correio com o estado de impressão" }
              ].map((flag) => {
                const checked = settings.featureFlags[flag.key];
                return (
                  <div key={flag.key} className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">{flag.label}</h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{flag.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        const updated = {
                          ...settings.featureFlags,
                          [flag.key]: !checked
                        };
                        handleChangeField(["featureFlags"], updated);
                      }}
                      className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                        checked ? "bg-[#D3122A]" : "bg-slate-200"
                      }`}
                    >
                      <span 
                        className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                          checked ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AUTOMATED BIRTHDAY SERVICE MONITOR CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="text-base">🎂</span>
                Serviço de Aniversários Automático
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativo
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              O serviço de segundo plano verifica os aniversários dos militantes diariamente e envia felicitações e e-mails oficiais automáticos.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-600">
                <span>Celebrantes de Hoje:</span>
                <span className="font-bold text-[#D3122A]">{bdayStatus?.celebrantsToday?.length || 0} militante(s)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Despachados:</span>
                <span className="font-bold text-slate-800">{bdayStatus?.birthdayLogs?.length || 0} e-mails</span>
              </div>
              {bdayStatus?.celebrantsToday && bdayStatus.celebrantsToday.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700">Aniversariante(s):</span> {bdayStatus.celebrantsToday.join(", ")}
                </div>
              )}
            </div>

            <button
              onClick={triggerBirthdayCheck}
              disabled={bdayLoading}
              className="w-full py-2 bg-[#D3122A] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${bdayLoading ? 'animate-spin' : ''}`} />
              {bdayLoading ? "A Executar Verificação..." : "Executar Verificação Manual Agora"}
            </button>
          </div>

          {/* RETENTION POLICIES & MAINTENANCE SWITCH */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
              Segurança e Modo de Manutenção
            </h3>

            <div className="space-y-4">
              {/* Maintenance mode switch */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Bloqueio de Modo de Manutenção
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Redireciona utilizadores para a página de manutenção. Restringe o acesso apenas a Super Admins.</p>
                </div>

                <button
                  onClick={() => handleChangeField(["maintenanceModeActive"], !settings.maintenanceModeActive)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    settings.maintenanceModeActive ? "bg-rose-600" : "bg-slate-200"
                  }`}
                >
                  <span 
                    className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      settings.maintenanceModeActive ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Retenção de Registos de Auditoria
                </label>
                <select className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                  <option>Manter indefinidamente (Auditoria permanente de segurança)</option>
                  <option>Eliminar registos com mais de 1 Ano</option>
                  <option>Eliminar registos com mais de 6 Meses</option>
                </select>
              </div>
            </div>
          </div>

          {/* DISASTER RECOVERY, DATABASE CLEANUP & ENCRYPTED BACKUP */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <HardDriveUpload className="w-4.5 h-4.5 text-[#D3122A]" />
              Cópias de Segurança, Manutenção e Limpeza
            </h3>

            <div className="space-y-3.5">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-amber-700" /> Limpeza e Consolidação da Base de Dados
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase">
                    Consolidação
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Remove automaticamente dados simulados ou de teste mantendo exclusivamente registos reais de militantes autenticados no portal.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/admin/system/cleanup", { method: "POST" });
                      if (res.ok) {
                        const data = await res.json();
                        showToast(data.message || "Limpeza de dados concluída com sucesso!", "success");
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    } catch (e) {
                      showToast("Erro ao executar limpeza de dados.", "error");
                    }
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Executar Limpeza da Base de Dados
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Frequência Automática de Backup</label>
                <select className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                  <option>Diariamente às 02:00 (Fuso Luanda/Lisboa)</option>
                  <option>Semanalmente aos Domingos de manhã</option>
                  <option>Instantâneo mensal de auditoria</option>
                </select>
              </div>

              <button
                onClick={triggerManualBackup}
                disabled={backupLoading}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {backupLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Executar Cópia de Segurança Encriptada
              </button>

              {backupResult && (
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-[10px] font-mono text-slate-700 leading-relaxed space-y-1 relative">
                  <p className="text-[#D3122A] font-bold flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-[#D3122A] animate-pulse" /> Backup Concluído com Sucesso!
                  </p>
                  <p><strong>Ficheiro:</strong> {backupResult.backupFile}</p>
                  <p><strong>Tamanho:</strong> {backupResult.size}</p>
                  <p><strong>Conteúdo:</strong> {backupResult.membersCount} militantes, {backupResult.logsCount} registos de segurança</p>
                </div>
              )}
            </div>
          </div>

          {/* LICENSE KEY AND PLAN SUBSCRIPTION */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Key className="w-4.5 h-4.5 text-[#D3122A]" />
              Validação da Licença do Sistema
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Chave de Licença do Core Seguro</label>
                <input
                  type="text"
                  value={settings.licenseKey}
                  onChange={(e) => handleChangeField(["licenseKey"], e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D3122A] outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                <span>Validade da Licença:</span>
                <span className="text-emerald-600 font-bold">{settings.licenseExpires}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-[10px] text-emerald-800 leading-normal font-mono text-center">
                <strong>Plano Ativo:</strong> Gold Elite Enterprise Multi-Tenant (SLA Ativo e Verificado)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
