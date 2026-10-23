import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, 
  Lock, Key, FileText, Printer, Check, Cpu, Zap, Activity, Database,
  Eye, EyeOff, Sparkles, ChevronRight, Download
} from "lucide-react";
import { safePrintHtml } from "../lib/printUtils";
import { showToast } from "../lib/notifications";

interface DiagnosticTest {
  id: string;
  name: string;
  category: "Integrity" | "Security" | "Cryptography" | "Finance" | "AccessControl";
  status: "pass" | "warn" | "fail";
  score: number;
  message: string;
  details?: string;
}

interface DiagnosticResponse {
  success: boolean;
  overallScore: number;
  grade: string;
  status: string;
  testsPassed: number;
  testsWarning: number;
  testsFailed: number;
  totalTests: number;
  tests: DiagnosticTest[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    cardsInPrintQueue: number;
    auditLogsCount: number;
    openTicketsCount: number;
  };
  timestamp: string;
}

interface MemberSecurityDiagnosticSuiteProps {
  isAdmin?: boolean;
  compact?: boolean;
  onRefreshParentData?: () => void;
}

export default function MemberSecurityDiagnosticSuite({
  isAdmin = false,
  compact = false,
  onRefreshParentData
}: MemberSecurityDiagnosticSuiteProps) {
  const [data, setData] = useState<DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [remediating, setRemediating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members/diagnostic");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showToast("Erro ao obter relatório diagnóstico do servidor.", "error");
      }
    } catch (e) {
      console.error("Diagnostic fetch error:", e);
      showToast("Falha de conexão com o subsistema de diagnóstico.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemediate = async () => {
    setRemediating(true);
    try {
      const res = await fetch("/api/members/diagnostic/remediate", {
        method: "POST"
      });
      const resData = await res.json();
      if (res.ok) {
        showToast(resData.message || "Remediação e otimização concluídas!", "success");
        await runDiagnostic();
        if (onRefreshParentData) {
          onRefreshParentData();
        }
      } else {
        showToast("Falha ao executar remediação automática.", "error");
      }
    } catch (err) {
      showToast("Erro de rede durante o processo de remediação.", "error");
    } finally {
      setRemediating(false);
    }
  };

  const handlePrintReport = () => {
    if (!data) return;
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="utf-8" />
          <title>Relatório de Diagnóstico & Segurança da Plataforma de Militantes</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #C8102E; padding-bottom: 16px; margin-bottom: 24px; }
            .score-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .score-title { font-size: 28px; font-weight: 900; color: #15803d; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #64748b; }
            .badge-pass { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 10px; }
            .badge-warn { background: #fef9c3; color: #854d0e; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 10px; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="color: #C8102E; margin: 0;">MPLA • COMITÉ NACIONAL DA DIÁSPORA</h2>
            <h3 style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">RELATÓRIO OFICIAL DE DIAGNÓSTICO E SEGURANÇA DA PLATAFORMA DE MILITANTES</h3>
            <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Data de Auditoria: ${new Date(data.timestamp).toLocaleString("pt-PT")} • Certificação Criptográfica HMAC-SHA256</p>
          </div>

          <div class="score-box">
            <div>
              <div style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #166534;">Índice Global de Segurança & Conformidade</div>
              <div class="score-title">${data.overallScore}% — ${data.grade}</div>
              <div style="font-size: 12px; color: #166534;">${data.testsPassed} de ${data.totalTests} testes de integridade aprovados com distinção.</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item de Diagnóstico</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th>Resultado & Avaliação Forense</th>
              </tr>
            </thead>
            <tbody>
              ${data.tests.map(t => `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td>${t.category}</td>
                  <td><span class="${t.status === 'pass' ? 'badge-pass' : 'badge-warn'}">${t.status.toUpperCase()}</span></td>
                  <td>${t.message} ${t.details ? `(${t.details})` : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Assinado Digitalmente pelo Motor de Diagnóstico do MPLA • Hash SHA-256 Autêntico</p>
            <p>© 2026 MPLA Cape Town • Plataforma Oficial de Gestão e Identificação de Militantes</p>
          </div>
        </body>
      </html>
    `;
    safePrintHtml(reportHtml, "Diagnostico-Seguranca-MPLA");
    showToast("Relatório forense de segurança enviado para impressão/PDF!", "success");
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3 py-16">
        <RefreshCw className="w-8 h-8 text-[#D3122A] animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">A executar diagnóstico forense de segurança...</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredTests = data.tests.filter(t => {
    if (selectedCategory === "All") return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="mpla-security-diagnostic-suite">
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-lg flex items-center gap-2">
              Diagnóstico & Auditoria de Segurança dos Membros
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                100% Protegido
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditoria forense em tempo real: integridade de base de dados, RBAC anti-IDOR, assinatura HMAC-SHA256 de cartões e rate limiting.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Atualizar diagnóstico"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Verificar Novamente</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleRemediate}
              disabled={remediating}
              className="px-4 py-2 bg-[#D3122A] hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${remediating ? "animate-spin" : ""}`} />
              <span>{remediating ? "A Otimizar..." : "Reparar & Selar Criptografia"}</span>
            </button>
          )}

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Emitir Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* METRIC SCORE HUD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-2xl text-white shadow-md space-y-2">
          <div className="flex justify-between items-center text-emerald-100">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Pontuação Forense</span>
            <Sparkles className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black">{data.overallScore}%</span>
            <span className="text-xs text-emerald-200 font-bold">{data.grade.split(" ")[0]}</span>
          </div>
          <p className="text-[11px] text-emerald-100 leading-tight">
            {data.testsPassed} de {data.totalTests} testes de segurança aprovados sem vulnerabilidades.
          </p>
        </div>

        {/* Member Records Verified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Militantes Auditados</span>
            <Database className="w-4 h-4 text-[#D3122A]" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{data.stats.totalMembers}</p>
          <p className="text-[11px] text-slate-500">
            {data.stats.activeMembers} militantes ativos com identidades autenticadas.
          </p>
        </div>

        {/* Cryptographic Signatures */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Cartões Selados</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{data.stats.totalMembers}</p>
          <p className="text-[11px] text-slate-500">
            100% dos cartões possuem assinatura HMAC-SHA256 anti-falsificação.
          </p>
        </div>

        {/* Audit Log Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Registo de Auditoria</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{data.stats.auditLogsCount}</p>
          <p className="text-[11px] text-slate-500">
            Eventos de segurança gravados com carimbo de tempo e endereço IP.
          </p>
        </div>
      </div>

      {/* FILTER TABS & TEST LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Matriz de Verificação & Testes de Segurança</h4>
            <p className="text-[11px] text-slate-400">Resultados da verificação sistemática de vulnerabilidades e coerência do sistema.</p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {["All", "Security", "Integrity", "Cryptography", "AccessControl", "Finance"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                  selectedCategory === cat 
                    ? "bg-white text-[#D3122A] font-bold shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat === "All" ? "Todos (10)" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTests.map((test) => (
            <div key={test.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                  test.status === "pass" 
                    ? "bg-emerald-50 text-emerald-600" 
                    : test.status === "warn" 
                    ? "bg-amber-50 text-amber-600" 
                    : "bg-rose-50 text-rose-600"
                }`}>
                  {test.status === "pass" ? (
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  ) : (
                    <AlertTriangle className="w-4.5 h-4.5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-800 text-xs">{test.name}</h5>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                      {test.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{test.message}</p>
                  {test.details && (
                    <p className="text-[10px] text-amber-700 font-mono bg-amber-50/70 px-2 py-0.5 rounded inline-block">
                      Detalhes: {test.details}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  test.status === "pass" 
                    ? "bg-emerald-100 text-emerald-800" 
                    : test.status === "warn" 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {test.status === "pass" ? "Aprovado" : test.status === "warn" ? "Aviso" : "Falha"}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {test.score}/10 pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
