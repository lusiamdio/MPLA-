import React, { useState } from "react";
import { Member, SystemAuditLog, AdminNotification, SupportTicket } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import { 
  Users, CheckCircle, ShieldAlert, Clock, Search, MapPin, 
  Trash2, ShieldOff, CheckSquare, XCircle, ChevronRight, 
  AlertTriangle, Filter, FolderPlus, Compass, Bell, Check,
  Download, FileText, Printer, QrCode, HelpCircle, MessageSquare,
  Send, CheckCircle2
} from "lucide-react";

interface AdminDashboardProps {
  members: Member[];
  auditLogs: SystemAuditLog[];
  notifications?: AdminNotification[];
  tickets?: SupportTicket[];
  onMarkNotificationAsRead?: (id: string) => void;
  onUpdateMember: (id: string, updatedData: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onReplyTicket?: (ticketId: string, text: string) => void;
  onUpdateTicketStatus?: (ticketId: string, status: SupportTicket["status"], assignedOfficer?: string) => void;
  onOpenScanner?: () => void;
}

export default function AdminDashboard({
  members,
  auditLogs,
  notifications = [],
  tickets = [],
  onMarkNotificationAsRead,
  onUpdateMember,
  onDeleteMember,
  onReplyTicket,
  onUpdateTicketStatus,
  onOpenScanner
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"members" | "registration" | "tickets" | "notifications" | "hierarchy" | "audit">("members");

  // Filter/Search states for Member Management
  const [memberSearch, setMemberSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Ticket management state
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"All" | "Open" | "In Progress" | "Resolved" | "Closed">("All");
  const [ticketSearch, setTicketSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [officerReplyText, setOfficerReplyText] = useState("");

  // Selected region in geographic explorer
  const [selectedProvince, setSelectedProvince] = useState<string>("Gauteng (África do Sul)");
  const [selectedMuni, setSelectedMuni] = useState<string>("Johannesburgo");

  // KPI Calculations
  const totalMembers = members.length;
  const activeCount = members.filter(m => m.status === "Active").length;
  const pendingCount = members.filter(m => m.status === "Pending Verification").length;
  const suspendedCount = members.filter(m => m.status === "Suspended").length;
  const totalOutstanding = members.reduce((sum, m) => sum + m.outstandingBalance, 0);

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          m.membershipNo.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.nationalId.includes(memberSearch);
    const matchesProvince = provinceFilter === "All" || m.province === provinceFilter;
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesProvince && matchesStatus;
  });

  const pendingRegistrations = members.filter(m => m.status === "Pending Verification");
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const openTicketsCount = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length;

  // Export functions
  const exportMembersCSV = () => {
    const headers = ["ID", "N_Militante", "Nome_Completo", "BI_Passaporte", "Tipo_Doc", "Email", "Telemovel", "Estrutura", "Nivel_Militancia", "Provincia", "Estado", "Quota_Atraso_ZAR"];
    const rows = filteredMembers.map(m => [
      m.id,
      m.membershipNo,
      `"${m.fullName.replace(/"/g, '""')}"`,
      m.nationalId,
      m.idType || "BI",
      m.email,
      m.mobile,
      m.organizationWing || "Militante",
      m.militancyLevel || "Militante",
      m.province,
      m.status,
      m.outstandingBalance
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mpla_lista_militantes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMembersPDF = () => {
    const todayStr = new Date().toLocaleDateString("pt-PT");
    const memberRows = filteredMembers.map((m, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold; font-family: monospace; color: #C8102E;">${m.membershipNo}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">${m.fullName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-family: monospace;">${m.idType || 'BI'}: ${m.nationalId}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${m.organizationWing || 'Militante'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${m.province}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">${m.status}</td>
      </tr>
    `).join("");

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Oficial de Militantes - MPLA</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #0f172a; margin: 20px; }
            .header { border-bottom: 2px solid #C8102E; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            h1 { color: #C8102E; font-size: 18px; margin: 0; text-transform: uppercase; }
            p { margin: 4px 0; font-size: 11px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f8fafc; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>MPLA • Relatório Oficial de Militantes</h1>
              <p>Comité do Partido • Seção de Gestão de Ficheiro de Membros</p>
            </div>
            <div style="text-align: right;">
              <p>Data do Relatório: <strong>${todayStr}</strong></p>
              <p>Total de Registos: <strong>${filteredMembers.length}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nº Militante</th>
                <th>Nome Completo</th>
                <th>Documento</th>
                <th>Estrutura</th>
                <th>Província</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${memberRows}
            </tbody>
          </table>
          <div class="footer">
            Documento Oficial Emitido pelo Sistema Central do MPLA. Desenvolvido por NeuroGrowth Labs (www.ai.neurogrowthlabs.co.za).
          </div>
        </body>
      </html>
    `;
    safePrintHtml(reportHtml, "Relatório Oficial de Militantes - MPLA");
  };

  const exportAuditLogsCSV = () => {
    const headers = ["ID", "Data_Hora", "Utilizador", "Role", "Acao", "Detalhes"];
    const rows = auditLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${(l.user || '').replace(/"/g, '""')}"`,
      l.role || '',
      l.action || '',
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mpla_logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAuditLogsPDF = () => {
    const todayStr = new Date().toLocaleDateString("pt-PT");
    const logRows = auditLogs.map((l, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-family: monospace;">${new Date(l.timestamp).toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold;">${l.user} (${l.role})</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #C8102E; font-weight: bold;">${l.action}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px;">${l.details}</td>
      </tr>
    `).join("");

    const auditHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Oficial de Auditoria e Segurança - MPLA</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #0f172a; margin: 20px; }
            .header { border-bottom: 2px solid #C8102E; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            h1 { color: #C8102E; font-size: 18px; margin: 0; text-transform: uppercase; }
            p { margin: 4px 0; font-size: 11px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f8fafc; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>MPLA • Relatório de Auditoria & Segurança</h1>
              <p>Livro de Registos Imutáveis do Sistema Central</p>
            </div>
            <div style="text-align: right;">
              <p>Data do Relatório: <strong>${todayStr}</strong></p>
              <p>Total de Registos: <strong>${auditLogs.length}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Data & Hora</th>
                <th>Utilizador</th>
                <th>Ação</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              ${logRows}
            </tbody>
          </table>
          <div class="footer">
            Relatório Criptográfico de Auditoria Gerado pelo Sistema MPLA CAPE.
          </div>
        </body>
      </html>
    `;
    safePrintHtml(auditHtml, "Relatório Oficial de Auditoria e Segurança - MPLA");
  };

  // Geographic hierarchy structure
  const geoHierarchy: { [prov: string]: { [muni: string]: string[] } } = {
    "Gauteng (África do Sul)": {
      "Johannesburgo": ["Comité de Johannesburg Central", "Núcleo de Rosebank", "Comité Local de Hillbrow"],
      "Pretória / Tshwane": ["Comité de Pretória", "Núcleo de Hatfield"],
      "Ekurhuleni": ["Comité de Germiston", "Núcleo de Kempton Park"]
    },
    "Western Cape (África do Sul)": {
      "Cidade do Cabo": ["Comité de Cape Town Central", "Núcleo de Woodstock", "Núcleo de Bellville"],
      "Stellenbosch": ["Comité de Stellenbosch"]
    },
    "Luanda (Angola - Sede)": {
      "Luanda Central": ["Comité Provincial de Luanda", "Comité de Belas", "Comité de Talatona"],
      "Viana": ["Comité Municipal de Viana", "Núcleo de Zango"]
    }
  };

  return (
    <div className="space-y-8" id="admin-dashboard-panel">
      {/* Super Admin KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: "Total de Militantes", count: totalMembers, desc: "Registados a nível nacional e diáspora", icon: Users, color: "text-[#D3122A] bg-red-50" },
          { label: "Estado Ativo", count: activeCount, desc: "Credenciais verificadas", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Aprovações Pendentes", count: pendingCount, desc: "Fila de validação", icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Registos Suspensos", count: suspendedCount, desc: "Sinalizados ou arquivados", icon: ShieldAlert, color: "text-rose-600 bg-rose-50" },
          { label: "Quotas Pendentes", count: `R${totalOutstanding}`, desc: "Saldos em atraso", icon: AlertTriangle, color: "text-[#D3122A] bg-red-50" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">{kpi.label}</p>
                <p className="text-xl lg:text-2xl font-display font-extrabold text-slate-800 tracking-tight mt-1 font-mono">{kpi.count}</p>
              </div>
              <div className={`p-2 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-mono">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Admin Operations Sub-Tab Navigation */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 pt-2 text-xs font-semibold">
        {[
          { key: "members", label: "Gestão de Militantes", icon: Users },
          { key: "registration", label: "Aprovações Pendentes", badge: pendingRegistrations.length, icon: CheckSquare },
          { key: "tickets", label: "Apoio & Reclamações", badge: openTicketsCount, icon: HelpCircle },
          { key: "notifications", label: "Notificações do Sistema", badge: unreadNotifCount, icon: Bell },
          { key: "hierarchy", label: "Estrutura Geográfica", icon: Compass },
          { key: "audit", label: "Registo de Auditoria", icon: Clock }
        ].map((subTab) => (
          <button
            key={subTab.key}
            onClick={() => setActiveSubTab(subTab.key as any)}
            className={`px-4 py-2.5 border-b-2 font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === subTab.key
                ? "border-[#D3122A] text-[#D3122A] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <subTab.icon className="w-4 h-4" />
            {subTab.label}
            {subTab.badge !== undefined && subTab.badge > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-bold font-mono">
                {subTab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeSubTab === "members" && (
        /* MEMBER REGISTRY MANAGEMENT PANEL */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Header & Export Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-sm">Ficheiro Geral de Militantes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Gestão centralizada de dados, atribuição de estatuto e emissão de relatórios fisicos.</p>
            </div>
            
            <div className="flex items-center gap-2">
              {onOpenScanner && (
                <button
                  onClick={onOpenScanner}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#FFCC00]" />
                  Validar Cartão QR
                </button>
              )}
              <button
                onClick={exportMembersCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                Exportar CSV
              </button>
              <button
                onClick={exportMembersPDF}
                className="px-3 py-2 bg-[#C8102E] hover:bg-[#a60c24] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                Relatório PDF
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar por nome do militante, nº de cartão ou B.I..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#D3122A] outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              {/* Province Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Província / Região:</span>
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="All">Todas as Províncias</option>
                  <option value="Gauteng">Gauteng (África do Sul)</option>
                  <option value="Western Cape">Western Cape (África do Sul)</option>
                  <option value="Luanda">Luanda (Angola)</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal (África do Sul)</option>
                </select>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="All">Todos os Estados</option>
                  <option value="Active">Ativo</option>
                  <option value="Pending Verification">Verificação Pendente</option>
                  <option value="Suspended">Suspenso</option>
                  <option value="Inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members Grid Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-mono font-bold border-b border-slate-200">
                  <th className="p-4">Informação do Militante</th>
                  <th className="p-4">Comité / Localização</th>
                  <th className="p-4">Nível e Estrutura</th>
                  <th className="p-4">Estado do Cartão</th>
                  <th className="p-4 text-center">Ações de Estado</th>
                  <th className="p-4 text-right">Eliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={m.photo}
                        alt={m.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{m.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">No: {m.membershipNo} • ID: {m.nationalId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{m.committee}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.province} • {m.municipality}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[#D3122A] bg-red-50 px-2 py-0.5 rounded text-[10px] font-mono border border-red-100">
                        {m.membershipLevel}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{m.category} Branch</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 font-mono">
                        <span className="w-1.5 h-1.5 bg-[#D3122A] rounded-full" />
                        {m.physicalCardStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        {m.status === "Suspended" ? (
                          <button
                            onClick={() => onUpdateMember(m.id, { status: "Active" })}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition rounded-lg font-bold text-[10px] cursor-pointer"
                          >
                            Reativar
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateMember(m.id, { status: "Suspended" })}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 transition rounded-lg font-bold text-[10px] cursor-pointer"
                          >
                            Suspender
                          </button>
                        )}

                        <select
                          value={m.committee}
                          onChange={(e) => onUpdateMember(m.id, { committee: e.target.value })}
                          className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] outline-none"
                        >
                          <option value="Comité de Johannesburg">Comité de Johannesburg</option>
                          <option value="Comité de Cape Town">Comité de Cape Town</option>
                          <option value="Comité de Pretoria">Comité de Pretoria</option>
                          <option value="Comité de Luanda">Comité de Luanda</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Tem a certeza de que deseja eliminar permanentemente o registo de ${m.fullName}?`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-600 transition p-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "registration" && (
        /* REGISTRATION APPROVALS QUEUE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Candidaturas Pendentes de Verificação</h3>
            <p className="text-xs text-slate-500 mt-1">Análise os novos militantes registados, verifique os dados biográficos e autorize a emissão de cartões.</p>
          </div>

          <div className="space-y-4">
            {pendingRegistrations.length > 0 ? (
              pendingRegistrations.map((m) => (
                <div key={m.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.photo}
                      alt={m.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm">{m.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">E-mail: {m.email} • Tel: {m.mobile}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[9px] bg-red-50 text-[#D3122A] font-bold px-2 py-0.5 rounded-md font-mono border border-red-100">B.I.: {m.nationalId}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md font-mono">Nascimento: {m.dob} • {m.gender}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md font-mono">Comité: {m.committee} ({m.province})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 w-full md:w-auto text-xs font-semibold shrink-0">
                    <button
                      onClick={() => onUpdateMember(m.id, { status: "Active", physicalCardStatus: "Approved" })}
                      className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow cursor-pointer"
                    >
                      Verificar e Aprovar
                    </button>
                    <button
                      onClick={() => onUpdateMember(m.id, { status: "Suspended" })}
                      className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition cursor-pointer"
                    >
                      Rejeitar Pedido
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-sm">Fila de Aprovações Vazia</p>
                <p className="text-xs text-slate-500">Todas as candidaturas de militantes foram devidamente verificadas e aprovadas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "hierarchy" && (
        /* GEOGRAPHIC HIERARCHY EXPLORER */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Estrutura Orgânica e Geográfica</h3>
            <p className="text-xs text-slate-500 mt-1">Navegue pelas estruturas partidárias desde as províncias/regiões até aos comités e núcleos locais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Province Selection */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 border-b border-slate-200 pb-2">Províncias / Regiões</h4>
              <div className="space-y-1.5">
                {Object.keys(geoHierarchy).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => {
                      setSelectedProvince(prov);
                      setSelectedMuni(Object.keys(geoHierarchy[prov])[0]);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      selectedProvince === prov
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{prov}</span>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Municipality selection */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 border-b border-slate-200 pb-2">Municípios ({selectedProvince})</h4>
              <div className="space-y-1.5">
                {Object.keys(geoHierarchy[selectedProvince] || {}).map((muni) => (
                  <button
                    key={muni}
                    onClick={() => setSelectedMuni(muni)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      selectedMuni === muni
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{muni}</span>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Local Ward Branches */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 border-b border-slate-200 pb-2">Comités e Núcleos Locais ({selectedMuni})</h4>
              <div className="space-y-1.5">
                {(geoHierarchy[selectedProvince]?.[selectedMuni] || []).map((branch, idx) => {
                  const mCount = members.filter(m => m.committee === branch).length;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 flex justify-between items-center"
                    >
                      <span className="font-semibold">{branch}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded font-mono font-bold text-[9px] text-slate-500">
                        {mCount} Militantes Ativos
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "tickets" && (
        /* SUPPORT & TICKETS RESOLUTION DESK */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-sm">Gabinete Central de Apoio & Tickets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Atendimento e resolução de pedidos, emissão de cartões e esclarecimentos de militantes em sincronização contínua.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-50 text-[#C8102E] border border-rose-200 rounded-lg text-xs font-bold font-mono">
                {openTicketsCount} Pendentes
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-mono">
                Total: {tickets.length}
              </span>
            </div>
          </div>

          {/* Ticket Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar por ID do ticket, nome ou descrição..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#D3122A] outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs w-full md:w-auto">
              {(["All", "Open", "In Progress", "Resolved", "Closed"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${
                    ticketStatusFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "All" ? "Todos" : st === "Open" ? "Abertos" : st === "In Progress" ? "Em Análise" : st === "Resolved" ? "Resolvidos" : "Fechados"}
                </button>
              ))}
            </div>
          </div>

          {/* Split view: Tickets List & Active Resolution Pane */}
          {(() => {
            const filteredTickets = tickets.filter(t => {
              const matchesFilter = ticketStatusFilter === "All" || t.status === ticketStatusFilter;
              const matchesQuery = 
                t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                t.description.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                t.type.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                (members.find(m => m.id === t.memberId)?.fullName.toLowerCase().includes(ticketSearch.toLowerCase()) ?? false);
              return matchesFilter && matchesQuery;
            });

            const currentTicket = filteredTickets.find(t => t.id === selectedTicketId) || filteredTickets[0];
            const currentMember = currentTicket ? members.find(m => m.id === currentTicket.memberId) : null;

            if (filteredTickets.length === 0) {
              return (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Nenhum Pedido Encontrado</p>
                  <p className="text-xs text-slate-500">Não existem tickets de apoio no critério selecionado.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Tickets List */}
                <div className="lg:col-span-5 space-y-3 max-h-[620px] overflow-y-auto pr-1">
                  {filteredTickets.map((t) => {
                    const m = members.find(mem => mem.id === t.memberId);
                    const isSelected = currentTicket?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? "border-[#D3122A] bg-red-50/20 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-[#D3122A]">{t.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "Open"
                              ? "bg-amber-100 text-amber-800"
                              : t.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : t.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {t.status === "Open" ? "Aberto" : t.status === "In Progress" ? "Em Análise" : t.status === "Resolved" ? "Resolvido" : "Fechado"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          {m?.photo && (
                            <img src={m.photo} alt={m.fullName} className="w-5 h-5 rounded-full object-cover" />
                          )}
                          <p className="font-bold text-slate-800 truncate">{m?.fullName || "Militante"}</p>
                          <span className="text-[10px] text-slate-400 font-mono">({m?.membershipNo || t.memberId})</span>
                        </div>

                        <p className="text-slate-600 line-clamp-2 text-[11px] mb-2">{t.description}</p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{t.type}</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Active Ticket Resolution Desk */}
                {currentTicket && (
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
                    {/* Header with ticket details & status changer */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-[#D3122A] text-sm">{currentTicket.id}</span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">
                            {currentTicket.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Criado a {new Date(currentTicket.createdAt).toLocaleString()}</p>
                      </div>

                      {/* Status quick toggle */}
                      {onUpdateTicketStatus && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => onUpdateTicketStatus(currentTicket.id, "In Progress")}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                              currentTicket.status === "In Progress"
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Em Análise
                          </button>
                          <button
                            onClick={() => onUpdateTicketStatus(currentTicket.id, "Resolved")}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                              currentTicket.status === "Resolved"
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Resolvido
                          </button>
                          <button
                            onClick={() => onUpdateTicketStatus(currentTicket.id, "Closed")}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                              currentTicket.status === "Closed"
                                ? "bg-slate-800 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Fechar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Member Information Strip */}
                    {currentMember && (
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={currentMember.photo} alt={currentMember.fullName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{currentMember.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {currentMember.membershipNo} • {currentMember.province}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-[11px] space-y-0.5">
                          <p className="font-bold text-slate-700">{currentMember.mobile}</p>
                          <p className="text-[10px] text-slate-500">{currentMember.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Initial Description */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                      <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Descrição do Pedido:</p>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{currentTicket.description}</p>
                    </div>

                    {/* Replies Thread */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Histórico de Mensagens & Respostas:</p>
                      
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {currentTicket.replies && currentTicket.replies.length > 0 ? (
                          currentTicket.replies.map((r, i) => (
                            <div 
                              key={i} 
                              className={`p-3 rounded-xl text-xs space-y-1 ${
                                r.sender === "officer"
                                  ? "bg-red-50/70 border border-red-100 text-slate-800 ml-4"
                                  : "bg-white border border-slate-200 text-slate-800 mr-4"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] font-bold ${r.sender === "officer" ? "text-[#C8102E]" : "text-slate-700"}`}>
                                  {r.sender === "officer" ? "🛡️ Oficial Central HQ" : r.senderName}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed">{r.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Ainda não foram registadas respostas neste ticket.</p>
                        )}
                      </div>
                    </div>

                    {/* Reply Input Box */}
                    {onReplyTicket && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <textarea
                          placeholder="Escrever resposta oficial do Comando Central ao camarada..."
                          value={officerReplyText}
                          onChange={(e) => setOfficerReplyText(e.target.value)}
                          rows={3}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#D3122A] outline-none"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (!officerReplyText.trim()) return;
                              onReplyTicket(currentTicket.id, officerReplyText.trim());
                              setOfficerReplyText("");
                            }}
                            disabled={!officerReplyText.trim()}
                            className="px-4 py-2 bg-[#C8102E] hover:bg-[#a60c24] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Enviar Resposta Oficial
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {activeSubTab === "notifications" && (
        /* REAL-TIME REGISTRATION NOTIFICATIONS PANEL */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Notificações e Registos de Eventos</h3>
              <p className="text-xs text-slate-500 mt-1">Acompanhe as inscrições, confirmações e cancelamentos de militantes em tempo real.</p>
            </div>
            {notifications.length > 0 && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 font-mono">
                {unreadNotifCount} Por Ler
              </span>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    notif.read 
                      ? "border-slate-150 bg-slate-50/30" 
                      : "border-red-100 bg-red-50/10 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        notif.type === "event_registration"
                          ? "bg-emerald-50 text-emerald-600"
                          : notif.type === "event_cancellation"
                          ? "bg-amber-50 text-amber-600"
                          : notif.type === "support_ticket"
                          ? "bg-rose-50 text-rose-600"
                          : notif.type === "support_reply"
                          ? "bg-purple-50 text-purple-600"
                          : notif.type === "member_payment"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        <Bell className="w-5 h-5 animate-pulse" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                            notif.type === "event_registration"
                              ? "bg-emerald-100 text-emerald-800"
                              : notif.type === "event_cancellation"
                              ? "bg-amber-100 text-amber-800"
                              : notif.type === "support_ticket"
                              ? "bg-rose-100 text-rose-800"
                              : notif.type === "support_reply"
                              ? "bg-purple-100 text-purple-800"
                              : notif.type === "member_payment"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {notif.type === "event_registration" ? "Inscrição" : 
                             notif.type === "event_cancellation" ? "Cancelamento" : 
                             notif.type === "support_ticket" ? "Ticket de Apoio" :
                             notif.type === "support_reply" ? "Resposta ao Ticket" :
                             notif.type === "member_payment" ? "Pagamento Quotas" : "Sistema"}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                          )}
                        </div>
                        <p className="font-display font-bold text-slate-800 text-xs leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!notif.read && onMarkNotificationAsRead && (
                      <button
                        onClick={() => onMarkNotificationAsRead(notif.id)}
                        className="px-4 py-2 bg-slate-800 hover:bg-black text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Marcar como lido
                      </button>
                    )}
                  </div>

                  {notif.meta && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-150 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-mono block text-[9px] uppercase font-bold">Militante</span>
                        <span className="font-bold text-slate-800">{notif.meta.memberName || notif.meta.senderName || "N/A"}</span>
                        {notif.meta.membershipNo && (
                          <span className="text-slate-500 font-mono block text-[10px]">{notif.meta.membershipNo}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono block text-[9px] uppercase font-bold">Referência / Detalhe</span>
                        <span className="font-bold text-slate-800">{notif.meta.eventTitle || notif.meta.ticketId || (notif.meta.amount ? `R${notif.meta.amount} - ${notif.meta.purpose}` : "N/A")}</span>
                        {notif.meta.eventDate && (
                          <span className="text-slate-500 block text-[10px]">Data: {notif.meta.eventDate}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-sm">Sem Novas Notificações</p>
                <p className="text-xs text-slate-500">Não há registos de eventos ou actividades recentes por ler.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "audit" && (
        /* IMMUTABLE AUDIT CENTER LOGS */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-sm">Registos de Auditoria e Segurança</h3>
              <p className="text-xs text-slate-500 mt-0.5">Livro de registo imutável com todas as atualizações administrativas, emissões de cartões e modificações de sistema.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportAuditLogsCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                Exportar Logs CSV
              </button>
              <button
                onClick={exportAuditLogsPDF}
                className="px-3 py-2 bg-[#C8102E] hover:bg-[#a60c24] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                Relatório PDF
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-mono rounded">
                      {log.role}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>

                <div className="text-right shrink-0 text-[10px] text-slate-400 font-mono space-y-0.5">
                  <p>{new Date(log.timestamp).toLocaleString()}</p>
                  <p>User: {log.user} • IP: {log.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
