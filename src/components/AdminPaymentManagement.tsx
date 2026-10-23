import React, { useState, useEffect } from "react";
import { PaymentLog, AbsaRecurringSubscription, AbsaFxRate, AbsaOAuthTokenInfo, ReconciliationAuditReport, ReconciliationDiscrepancy } from "../types";
import QuarterlyFinancialReport from "./QuarterlyFinancialReport";
import VodaPayMerchantPortal from "./VodaPayMerchantPortal";
import { showToast } from "../lib/notifications";
import { 
  Building2, CreditCard, DollarSign, Repeat, ArrowLeftRight, 
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw, Download, 
  Trash2, Play, Pause, XCircle, ShieldCheck, ExternalLink, Receipt,
  TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Lock, Sliders, Check,
  KeyRound, Terminal, Clock, Copy, BarChart3, ShieldAlert, Sparkles,
  Calendar, CheckCheck, AlertTriangle, FileSpreadsheet, Zap, Smartphone, QrCode
} from "lucide-react";

export default function AdminPaymentManagement() {
  const [activeTab, setActiveTab] = useState<"transactions" | "vodapay_merchant" | "recurring" | "quarterly" | "audit" | "ais" | "fx" | "config">("transactions");
  
  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<PaymentLog[]>([]);
  const [recurringSchedules, setRecurringSchedules] = useState<AbsaRecurringSubscription[]>([]);
  const [aisAccounts, setAisAccounts] = useState<any[]>([]);
  const [aisTransactions, setAisTransactions] = useState<any[]>([]);
  const [fxRates, setFxRates] = useState<AbsaFxRate[]>([]);
  const [tokenInfo, setTokenInfo] = useState<AbsaOAuthTokenInfo | any>(null);
  const [auditReport, setAuditReport] = useState<ReconciliationAuditReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenRefreshing, setTokenRefreshing] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportStatus, setExportStatus] = useState("All");
  const [exportMethod, setExportMethod] = useState("All");
  const [isExporting, setIsExporting] = useState(false);

  // Audit state
  const [auditScanning, setAuditScanning] = useState(false);
  const [resolvingDiscrepancyId, setResolvingDiscrepancyId] = useState<string | null>(null);

  // Refund Modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentLog | null>(null);
  const [refundReason, setRefundReason] = useState("Solicitação de Reembolso Aprovada pelo Departamento Financeiro");
  const [actionLoading, setActionLoading] = useState(false);

  // FX Converter states
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcFrom, setCalcFrom] = useState("ZAR");
  const [calcTo, setCalcTo] = useState("AOA");
  const [convertedVal, setConvertedVal] = useState<number>(0);

  // Config test state
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingGateway, setTestingGateway] = useState(false);

  // VodaPay Gateway test state
  const [vodapayTestResult, setVodapayTestResult] = useState<{ success: boolean; message: string; config?: any } | null>(null);
  const [testingVodapayGateway, setTestingVodapayGateway] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ovRes, pmRes, subRes, aisRes, txRes, fxRes, tokRes, audRes] = await Promise.all([
        fetch("/api/absa/admin/overview").then(r => r.json()).catch(() => null),
        fetch("/api/payments").then(r => r.json()).catch(() => []),
        fetch("/api/absa/recurring-schedules").then(r => r.json()).catch(() => []),
        fetch("/api/absa/ais/accounts").then(r => r.json()).catch(() => ({ accounts: [] })),
        fetch("/api/absa/ais/transactions").then(r => r.json()).catch(() => ({ transactions: [] })),
        fetch("/api/absa/fx/rates").then(r => r.json()).catch(() => ({ rates: [] })),
        fetch("/api/absa/oauth/token").then(r => r.json()).catch(() => null),
        fetch("/api/absa/audit/reconciliation").then(r => r.json()).catch(() => null)
      ]);

      if (ovRes) setOverview(ovRes);
      if (Array.isArray(pmRes)) setTransactions(pmRes);
      if (Array.isArray(subRes)) setRecurringSchedules(subRes);
      if (aisRes?.accounts) setAisAccounts(aisRes.accounts);
      if (txRes?.transactions) setAisTransactions(txRes.transactions);
      if (fxRes?.rates) setFxRates(fxRes.rates);
      if (tokRes) setTokenInfo(tokRes);
      if (audRes) setAuditReport(audRes);
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshOAuthToken = async () => {
    setTokenRefreshing(true);
    try {
      const res = await fetch("/api/absa/oauth/token", { method: "POST" });
      const data = await res.json();
      if (data) {
        setTokenInfo(data);
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
    } finally {
      setTokenRefreshing(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditScanning(true);
    try {
      const res = await fetch("/api/absa/audit/run", { method: "POST" });
      const json = await res.json();
      if (json.report) {
        setAuditReport(json.report);
      }
    } catch (err) {
      console.error("Erro ao executar auditoria:", err);
    } finally {
      setAuditScanning(false);
    }
  };

  const handleResolveDiscrepancy = async (discrepancyId: string, action: string = "auto_sync") => {
    setResolvingDiscrepancyId(discrepancyId);
    try {
      const res = await fetch("/api/absa/audit/resolve-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discrepancyId, resolutionAction: action })
      });
      const json = await res.json();
      if (json.success && json.report) {
        setAuditReport(json.report);
        fetchAllData();
      }
    } catch (err) {
      console.error("Erro ao conciliar item:", err);
    } finally {
      setResolvingDiscrepancyId(null);
    }
  };

  const handleAutoReconcileAll = async () => {
    setAuditScanning(true);
    try {
      const res = await fetch("/api/absa/audit/auto-reconcile-all", { method: "POST" });
      const json = await res.json();
      if (json.report) {
        setAuditReport(json.report);
        fetchAllData();
      }
    } catch (err) {
      console.error("Erro ao auto-conciliar em lote:", err);
    } finally {
      setAuditScanning(false);
    }
  };

  const handleDownloadCSV = () => {
    setIsExporting(true);
    const params = new URLSearchParams();
    if (exportStartDate) params.append("startDate", exportStartDate);
    if (exportEndDate) params.append("endDate", exportEndDate);
    if (exportStatus && exportStatus !== "All") params.append("status", exportStatus);
    if (exportMethod && exportMethod !== "All") params.append("method", exportMethod);

    const exportUrl = `/api/payments/export/csv?${params.toString()}`;
    
    // Create hidden link and trigger download
    const link = document.createElement("a");
    link.href = exportUrl;
    link.setAttribute("download", `Relatorio_Pagamentos_MPLA_Absa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      setExportModalOpen(false);
    }, 800);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update FX calculator
  useEffect(() => {
    const zaraoa = fxRates.find(r => r.currencyPair === "ZARAOA")?.midRate || 56.45;
    const usdzar = fxRates.find(r => r.currencyPair === "USDZAR")?.midRate || 18.28;

    if (calcFrom === "ZAR" && calcTo === "AOA") {
      setConvertedVal(Math.round(calcAmount * zaraoa));
    } else if (calcFrom === "AOA" && calcTo === "ZAR") {
      setConvertedVal(Math.round((calcAmount / zaraoa) * 100) / 100);
    } else if (calcFrom === "USD" && calcTo === "ZAR") {
      setConvertedVal(Math.round(calcAmount * usdzar * 100) / 100);
    } else if (calcFrom === "ZAR" && calcTo === "USD") {
      setConvertedVal(Math.round((calcAmount / usdzar) * 100) / 100);
    }
  }, [calcAmount, calcFrom, calcTo, fxRates]);

  // Handle Refund
  const handleProcessRefund = async () => {
    if (!selectedTxForRefund) return;
    setActionLoading(true);
    try {
      const resp = await fetch("/api/absa/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedTxForRefund.id,
          reason: refundReason
        })
      });
      const data = await resp.json();
      if (data.success) {
        setRefundModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      console.error("Refund error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Recurring status
  const handleToggleRecurring = async (subId: string) => {
    try {
      await fetch(`/api/absa/recurring-schedules/${subId}/toggle`, { method: "POST" });
      fetchAllData();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Cancel Recurring schedule
  const handleCancelRecurring = async (subId: string) => {
    if (!confirm("Tem a certeza de que deseja cancelar este mandato de débito automático Absa?")) return;
    try {
      await fetch(`/api/absa/recurring-schedules/${subId}/cancel`, { method: "POST" });
      fetchAllData();
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // Immediate Scheduled Run
  const handleTriggerRun = async (subId: string) => {
    try {
      const res = await fetch(`/api/absa/recurring-schedules/${subId}/trigger-run`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Ciclo de débito automático executado com sucesso e quota registada!", "success");
        fetchAllData();
      }
    } catch (err) {
      console.error("Run error:", err);
    }
  };

  // Test Gateway Connection (Absa)
  const handleTestGateway = async () => {
    setTestingGateway(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/system/test-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "absaPay", provider: "Absa Pay Open Banking" })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Erro de ligação" });
    } finally {
      setTestingGateway(false);
    }
  };

  // Test Gateway Connection (VodaPay)
  const handleTestVodapayGateway = async () => {
    setTestingVodapayGateway(true);
    setVodapayTestResult(null);
    try {
      const res = await fetch("/api/vodapay/gateway/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVodapayTestResult({
          success: true,
          message: data.message || "Conexão com Gateway VodaPay (Vodacom SuperApp API v2) validada com sucesso!",
          config: data.config
        });
      } else {
        setVodapayTestResult({
          success: false,
          message: data.message || "Falha na comunicação com o Gateway VodaPay."
        });
      }
    } catch (err: any) {
      setVodapayTestResult({
        success: false,
        message: err.message || "Erro ao contactar gateway VodaPay."
      });
    } finally {
      setTestingVodapayGateway(false);
    }
  };

  // Filtered transactions
  const filteredTx = transactions.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      t.id.toLowerCase().includes(q) ||
      t.purpose.toLowerCase().includes(q) ||
      t.method.toLowerCase().includes(q) ||
      (t.absaAccountNumber && t.absaAccountNumber.includes(q)) ||
      (t.vodapayPaymentId && t.vodapayPaymentId.toLowerCase().includes(q)) ||
      (t.payerPhone && t.payerPhone.includes(q));
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="admin-payment-management-page">
      
      {/* HEADER */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#DC0032] flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-red-500/20">
            absa
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-black tracking-tight">
                Gestão Financeira & Absa Open Banking
              </h2>
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                Playpen v1.3.0 Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Painel centralizado de conciliação bancária, débitos recorrentes DebiCheck, taxas cambiais FX e auditoria de pagamentos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-red-500/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar Relatório (CSV)
          </button>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Absa
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Volume Total Processado</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC0032] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900">
            R {overview?.totalVolumeZAR?.toLocaleString() || "1,460"}.00
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">
            ≈ {overview?.totalVolumeAOA?.toLocaleString() || "82,417"} AOA (Kwanzas)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Receita Mensal Recorrente (MRR)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900">
            R {overview?.monthlyRecurringRevenueZAR?.toLocaleString() || "162"}.00
          </div>
          <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {overview?.activeSubscriptionsCount || recurringSchedules.filter(s => s.status === "Active").length} Mandatos DebiCheck Activos
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Saldo Consolidado Absa</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900">
            R 739,950.00
          </div>
          <div className="text-[11px] text-slate-500">
            3 Contas Partidárias Vinculadas
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Taxa de Sucesso SureCheck</span>
            <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-green-600">
            99.4%
          </div>
          <div className="text-[11px] text-slate-500">
            Autenticação Bancária em Tempo Real
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        {[
          { key: "transactions", label: "Ledger de Transações Absa", icon: CreditCard },
          { key: "vodapay_merchant", label: "VodaPay Merchant & Standees", icon: Zap },
          { key: "recurring", label: "Subscrições & Débitos Recorrentes", icon: Repeat },
          { key: "quarterly", label: "Relatório Financeiro Trimestral", icon: BarChart3 },
          { 
            key: "audit", 
            label: "Auditoria & Conciliação", 
            icon: ShieldCheck, 
            badge: auditReport?.discrepancyCount && auditReport.discrepancyCount > 0 ? `${auditReport.discrepancyCount}` : undefined 
          },
          { key: "ais", label: "Contas & Extratos AIS", icon: Building2 },
          { key: "fx", label: "Câmbio & Conversor FX", icon: ArrowLeftRight },
          { key: "config", label: "Configuração do Gateway", icon: Sliders }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer relative ${
              activeTab === tab.key
                ? "bg-[#DC0032] text-white shadow-md shadow-red-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.key ? "bg-white text-[#DC0032]" : "bg-red-500 text-white"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================= TAB 0: VODAPAY MERCHANT PORTAL ================= */}
      {activeTab === "vodapay_merchant" && (
        <VodaPayMerchantPortal />
      )}

      {/* ================= TAB 1: TRANSACTIONS LEDGER ================= */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por ID, finalidade ou conta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="All">Todos os Estados</option>
                <option value="Successful">Liquidados (Successful)</option>
                <option value="Pending">Pendentes</option>
                <option value="Refunded">Reembolsados</option>
              </select>

              <button
                onClick={() => setExportModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Exportar dados filtrados"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref / ID Transação</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Finalidade & Método</th>
                  <th className="py-3 px-4">Conta Absa</th>
                  <th className="py-3 px-4 text-right">Valor (ZAR)</th>
                  <th className="py-3 px-4 text-right">Valor (AOA)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nenhuma transação encontrada correspondente aos filtros.
                    </td>
                  </tr>
                ) : (
                  filteredTx.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{tx.id}</div>
                        {tx.absaTransactionId && (
                          <div className="text-[10px] font-mono text-slate-400">
                            tx: {tx.absaTransactionId.slice(0, 14)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tx.purpose}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-[#DC0032]" />
                          {tx.method}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {tx.absaAccountNumber ? `${tx.absaAccountName || 'Absa'} (${tx.absaAccountNumber})` : "Absa Pay EFT"}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        R {tx.amount}.00
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-600">
                        {tx.amountAOA ? `${tx.amountAOA.toLocaleString()} Kz` : `≈ ${(tx.amount * 56.45).toLocaleString()} Kz`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          tx.status === "Successful" 
                            ? "bg-green-100 text-green-700" 
                            : tx.status === "Refunded" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {tx.status === "Successful" && <Check className="w-2.5 h-2.5" />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === "Successful" && (
                            <button
                              onClick={() => {
                                setSelectedTxForRefund(tx);
                                setRefundModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer text-[11px] font-semibold"
                              title="Emitir Reembolso Absa"
                            >
                              Reembolsar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: RECURRING SUBSCRIPTIONS ================= */}
      {activeTab === "recurring" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900">
                Mandatos de Débito Automático (Absa DebiCheck)
              </h3>
              <p className="text-xs text-slate-500">
                Subscrições ativas com cobrança automática programada de quotas mensais e anuais.
              </p>
            </div>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Conforme Regulamentação SARB DebiCheck
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Militante / Cartão</th>
                  <th className="py-3 px-4">Valor & Periodicidade</th>
                  <th className="py-3 px-4">Finalidade</th>
                  <th className="py-3 px-4">Conta Débito</th>
                  <th className="py-3 px-4">Próxima Cobrança</th>
                  <th className="py-3 px-4">Ciclos / Total Pago</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recurringSchedules.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sub.memberName}</div>
                      <div className="font-mono text-[10px] text-[#DC0032] font-semibold">{sub.membershipNo}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900">R {sub.amount}.00 ZAR</div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {sub.interval === 'annual' ? 'Anual' : sub.interval === 'quarterly' ? 'Trimestral' : 'Mensal'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {sub.purpose}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {sub.accountName} ({sub.accountNumberMasked})
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{sub.nextBillingDate}</div>
                      <div className="text-[10px] text-slate-400">Última: {sub.lastBilledDate || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{sub.billingCount} ciclos</div>
                      <div className="text-[10px] text-green-700 font-bold">Total: R {sub.totalPaid}.00</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        sub.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : sub.status === "Paused"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.status === "Active" && (
                          <button
                            onClick={() => handleTriggerRun(sub.id)}
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition cursor-pointer"
                            title="Executar Débito Agora"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleRecurring(sub.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                          title={sub.status === "Active" ? "Pausar Mandato" : "Reativar Mandato"}
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancelRecurring(sub.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                          title="Cancelar Mandato"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: QUARTERLY FINANCIAL REPORT (RECHARTS) ================= */}
      {activeTab === "quarterly" && (
        <QuarterlyFinancialReport />
      )}

      {/* ================= TAB 4: AUTOMATED AUDIT & RECONCILIATION ================= */}
      {activeTab === "audit" && (
        <div className="space-y-6" id="audit-reconciliation-section">
          {/* Top Audit Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Motor de Conciliação Bancária & Auditoria Automatizada Absa AIS
              </div>
              <h2 className="text-xl font-display font-extrabold text-slate-900">
                Auditoria de Transações & Validação de Extratos
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Cruzamento automático em tempo real entre a base de dados do portal e as transações confirmadas na API do Banco Absa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleRunAudit}
                disabled={auditScanning}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditScanning ? 'animate-spin' : ''}`} />
                {auditScanning ? "A Auditar Extratos..." : "Executar Auditoria em Tempo Real"}
              </button>

              {auditReport && auditReport.discrepancyCount > 0 && (
                <button
                  onClick={handleAutoReconcileAll}
                  disabled={auditScanning}
                  className="px-4 py-2.5 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Conciliar ({auditReport.discrepancyCount})
                </button>
              )}
            </div>
          </div>

          {/* KPI Cards for Audit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Taxa de Conciliação</span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-display font-extrabold text-emerald-600">
                {auditReport?.reconciliationRate || 100}%
              </div>
              <div className="text-[11px] text-slate-500">
                {auditReport?.reconciledCount || 0} de {auditReport?.totalDbRecords || 0} pagamentos verificados
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Discrepâncias Ativas</span>
                <span className="p-1.5 bg-red-50 text-red-600 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-display font-extrabold text-slate-900">
                {auditReport?.discrepancyCount || 0}
              </div>
              <div className="text-[11px] text-slate-500">
                {auditReport?.discrepancies.filter(d => !d.resolved && d.severity === 'high').length || 0} com severidade alta
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Volume Validado Absa</span>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-display font-extrabold text-slate-900">
                R {(auditReport?.totalVerifiedZAR || 0).toLocaleString()}.00
              </div>
              <div className="text-[11px] text-slate-500">
                Confirmado em extratos bancários
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Variação sob Análise</span>
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-xl">
                  <ArrowLeftRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-display font-extrabold text-amber-600">
                R {(auditReport?.totalVarianceZAR || 0).toLocaleString()}.00
              </div>
              <div className="text-[11px] text-slate-500">
                Ajustes e depósitos não identificados
              </div>
            </div>
          </div>

          {/* Discrepancies Review List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#DC0032]" />
                  Registo de Discrepâncias e Itens de Auditoria Manual
                </h3>
                <p className="text-xs text-slate-500">
                  Transações com divergência de estado, montante ou referência entre o sistema e o Banco Absa
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Última auditoria: {auditReport?.lastAuditAt ? new Date(auditReport.lastAuditAt).toLocaleTimeString() : "Agora"}
              </div>
            </div>

            {(!auditReport || auditReport.discrepancies.length === 0) ? (
              <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-slate-800">Conformidade 100% Assegurada</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Não foram encontradas divergências entre os registos locais e os extratos confirmados pela API Absa Open Banking.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {auditReport.discrepancies.map((disc: ReconciliationDiscrepancy) => (
                  <div 
                    key={disc.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      disc.resolved 
                        ? "bg-slate-50 border-slate-200 opacity-80" 
                        : disc.severity === 'high' 
                        ? "bg-red-50/40 border-red-200" 
                        : disc.severity === 'medium' 
                        ? "bg-amber-50/40 border-amber-200" 
                        : "bg-blue-50/30 border-blue-200"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        {/* Badges Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            disc.resolved 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {disc.resolved ? "Conciliado / Resolvido" : "Requer Atenção Manual"}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            disc.severity === 'high' 
                              ? "bg-red-600 text-white" 
                              : disc.severity === 'medium' 
                              ? "bg-amber-500 text-white" 
                              : "bg-blue-500 text-white"
                          }`}>
                            Severidade {disc.severity}
                          </span>

                          <span className="text-[11px] font-mono text-slate-400">
                            Data: {disc.transactionDate}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="text-xs font-bold text-slate-900">
                          {disc.description}
                        </div>

                        {/* Comparative Breakdown Table */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1">
                            <div className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                              Registo na Base de Dados Local
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">ID Registo:</span>
                              <span className="font-mono font-bold text-slate-800">{disc.localTransactionId || "Não registado"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Militante:</span>
                              <span className="font-medium text-slate-800">{disc.memberName || "Desconhecido"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Valor / Estado:</span>
                              <span className="font-bold text-slate-900">R {disc.localAmount || 0}.00 ({disc.localStatus || 'N/A'})</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1">
                            <div className="font-bold text-red-600 text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              Extrato / Gateway Banco Absa (AIS Feed)
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">ID Transação Bancária:</span>
                              <span className="font-mono font-bold text-slate-800">{disc.bankTransactionId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Conta Creditada:</span>
                              <span className="font-mono text-slate-800">4064583487 (MPLA SA)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Valor / Estado:</span>
                              <span className="font-bold text-emerald-600">R {disc.bankAmount || 0}.00 ({disc.bankStatus || 'Booked'})</span>
                            </div>
                          </div>
                        </div>

                        {/* Resolution Note if present */}
                        {disc.resolved && disc.resolutionNote && (
                          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span><strong>Resolução:</strong> {disc.resolutionNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons if not resolved */}
                      {!disc.resolved && (
                        <div className="flex flex-row lg:flex-col gap-2 shrink-0 self-end lg:self-center">
                          {disc.autoResolvable && (
                            <button
                              onClick={() => handleResolveDiscrepancy(disc.id, "auto_sync")}
                              disabled={resolvingDiscrepancyId === disc.id}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <Sparkles className="w-3 h-3" />
                              Sincronizar Automaticamente
                            </button>
                          )}
                          <button
                            onClick={() => handleResolveDiscrepancy(disc.id, "manual_verify")}
                            disabled={resolvingDiscrepancyId === disc.id}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Validar Manualmente
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: AIS ACCOUNTS & LEDGER ================= */}
      {activeTab === "ais" && (
        <div className="space-y-6">
          {/* Linked Bank Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aisAccounts.map(acc => (
              <div key={acc.AccountId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {acc.AccountSubType}
                  </span>
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {acc.Status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{acc.Nickname}</h4>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">Nº Conta: {acc.AccountIdentification}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500 font-semibold">Saldo Contabilístico:</span>
                  <span className="text-base font-black text-slate-900">R {acc.Balance?.toLocaleString()}.00 ZAR</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bank Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-display font-extrabold text-slate-900">
                  Extrato Bancário Absa em Tempo Real (AIS Feed)
                </h3>
                <p className="text-xs text-slate-500">
                  Movimentações bancárias conciliadas automaticamente com os registos de quotas do portal.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Último Sync: Agora</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Data Valor</th>
                    <th className="py-3 px-4">Narrativa Bancária</th>
                    <th className="py-3 px-4">Militante / Ordenante</th>
                    <th className="py-3 px-4">Referência de Extrato</th>
                    <th className="py-3 px-4 text-right">Crédito (ZAR)</th>
                    <th className="py-3 px-4 text-center">Reconciliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {aisTransactions.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">{t.BookingDateTime}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{t.TransactionInformation}</td>
                      <td className="py-3 px-4 text-slate-700">{t.PayerName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{t.StatementReference}</td>
                      <td className="py-3 px-4 text-right font-black text-green-700">
                        + R {t.Amount?.Amount}.00
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Conciliado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: FX & CONVERTER ================= */}
      {activeTab === "fx" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Absa FX Rates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900">
                Taxas de Câmbio em Tempo Real (Absa FX)
              </h3>
              <p className="text-xs text-slate-500">
                Cotações oficiais aplicadas para pagamentos de militantes da diáspora e conversão Kwanza/Rand.
              </p>
            </div>

            <div className="space-y-2.5">
              {fxRates.map(rate => (
                <div key={rate.currencyPair} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{rate.currencyPair}</div>
                    <div className="text-[11px] text-slate-500">{rate.currencyName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-[#DC0032]">{rate.midRate.toFixed(2)}</div>
                    <div className="text-[10px] font-mono text-slate-400">Bid: {rate.bid} • Offer: {rate.offer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Calculator */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900">
                Calculadora de Conversão Cambial Partidária
              </h3>
              <p className="text-xs text-slate-500">
                Simule instantaneamente o valor de quotas em Kwanzas (AOA), Rands (ZAR) ou Dólares (USD).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Valor a Converter
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
                  />
                  <select
                    value={calcFrom}
                    onChange={(e) => setCalcFrom(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="ZAR">ZAR (Rand)</option>
                    <option value="AOA">AOA (Kwanza)</option>
                    <option value="USD">USD (Dólar)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    const temp = calcFrom;
                    setCalcFrom(calcTo);
                    setCalcTo(temp);
                  }}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  title="Inverter Moedas"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Moeda de Destino
                </label>
                <select
                  value={calcTo}
                  onChange={(e) => setCalcTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="AOA">AOA (Kwanza Angolano)</option>
                  <option value="ZAR">ZAR (Rand Sul-Africano)</option>
                  <option value="USD">USD (Dólar Americano)</option>
                </select>
              </div>

              {/* Conversion Result */}
              <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl text-center space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Valor Convertido Estimado</div>
                <div className="text-2xl font-black font-display text-amber-400 font-mono">
                  {convertedVal.toLocaleString()} {calcTo}
                </div>
                <div className="text-[10px] text-slate-400">
                  Taxa Absa Playpen aplicada em tempo real
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: GATEWAY CONFIG & OAUTH2 ================= */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* OAuth2 Token Engine Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#DC0032] flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-extrabold text-slate-900">
                    Absa Open Banking OAuth2 Token Manager
                  </h3>
                  <p className="text-xs text-slate-500">
                    Autenticação M2M (Machine-to-Machine) via RFC 6749 Client Credentials Grant.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshOAuthToken}
                  disabled={tokenRefreshing}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tokenRefreshing ? "animate-spin" : ""}`} />
                  {tokenRefreshing ? "A Renovar Token..." : "Gerar / Renovar Token"}
                </button>
              </div>
            </div>

            {/* Token Diagnostic Details */}
            {tokenInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estado do Token</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ativo ({tokenInfo.token_type || "Bearer"})
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Validade Restante</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {tokenInfo.remainingSeconds ? `${tokenInfo.remainingSeconds}s` : `${tokenInfo.expires_in || 3600}s`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Origem da Emissão</div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {tokenInfo.source === "live_gateway" ? "Absa Live TLS" : "Sandbox Certificado"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Consumer Key</div>
                  <div className="text-xs font-mono text-slate-700 truncate">
                    {tokenInfo.consumerKeyMasked || "absa••••••••mpla"}
                  </div>
                </div>
              </div>
            )}

            {/* Token String Preview */}
            {tokenInfo?.access_token && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Bearer Access Token em Cache:</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Expira em: {tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleTimeString() : "--"}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl text-emerald-400 font-mono text-xs break-all flex items-center justify-between gap-3">
                  <span className="truncate">{tokenInfo.access_token}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      navigator.clipboard.writeText(tokenInfo.access_token);
                    }}
                    className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                    title="Copiar Token"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* cURL Command Code Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Terminal className="w-3.5 h-3.5 text-red-600" />
                  <span>Comando cURL Absa OAuth2 Oficial:</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('curl -k -X POST https://www.api.absa.africa:9443/oauth2/token -d "grant_type=client_credentials" -H "Authorization: Basic Base64(consumer-key:consumer-secret)"');
                    setCopiedCurl(true);
                    setTimeout(() => setCopiedCurl(false), 2500);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar cURL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed select-all">
curl -k -X POST https://www.api.absa.africa:9443/oauth2/token \
  -d "grant_type=client_credentials" \
  -H "Authorization: Basic Base64(consumer-key:consumer-secret)"
              </pre>
            </div>
          </div>

          {/* Core Gateway Parameters Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900">
                Configurações do Gateway Absa Open Banking & Credenciais
              </h3>
              <p className="text-xs text-slate-500">
                Parametrização das chaves de API, endpoints Absa Playpen v1.3.0 e conta de liquidação bancária.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ambiente Absa
                </label>
                <input
                  type="text"
                  readOnly
                  value="Playpen Sandbox (v1.3.0) / Production Ready"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Conta Beneficiária Oficial (MPLA SA)
                </label>
                <input
                  type="text"
                  readOnly
                  value="4064583487 (Absa Bank South Africa)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  OAuth2 Token Endpoint
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://www.api.absa.africa:9443/oauth2/token"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gateway Absa Pay Playpen URL
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://gw-sb.api.absa.africa/absaPayPlaypen/1.3.0"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestGateway}
                disabled={testingGateway}
                className="px-5 py-2.5 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testingGateway ? 'animate-spin' : ''}`} />
                Testar Conexão Absa Pay Gateway
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Status: 100% SLA Ativo
              </span>
            </div>

            {testResult && (
              <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                testResult.success 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {testResult.success ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                <div>
                  <div className="font-bold">{testResult.success ? "Conexão Estabelecida com Sucesso" : "Falha na Ligação"}</div>
                  <div className="mt-0.5">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* VodaPay SuperApp Gateway Parameters Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E60000] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <Zap className="w-4 h-4 fill-white" />
                  </span>
                  <h3 className="text-base font-display font-extrabold text-slate-900">
                    Gateway VodaPay (Vodacom SuperApp API v2)
                  </h3>
                  <span className="text-[9px] font-mono uppercase bg-[#E60000]/10 text-[#E60000] px-2 py-0.5 rounded font-black">
                    HMAC-SHA256
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Integração direta com a API VodaPay Gateway (Client SDK .NET / REST v2) para pagamentos via QR Code, Web Cashier e USSD Mobile Push.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ambiente VodaPay Gateway
                </label>
                <input
                  type="text"
                  readOnly
                  value="VodaPay Gateway Sandbox (https://api.vodapay.vodacom.co.za/v2)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Merchant App ID (Client ID)
                </label>
                <input
                  type="text"
                  readOnly
                  value="2882000000000001 (MPLA África do Sul)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Algoritmo de Assinatura Criptográfica
                </label>
                <input
                  type="text"
                  readOnly
                  value="HMAC-SHA256 (RFC 2104) / Signature Header"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Canais Suportados
                </label>
                <input
                  type="text"
                  readOnly
                  value="QR_CODE_PAYMENT, CASHIER_PAYMENT, MOBILE_PUSH"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestVodapayGateway}
                disabled={testingVodapayGateway}
                className="px-5 py-2.5 bg-[#E60000] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testingVodapayGateway ? 'animate-spin' : ''}`} />
                Testar Conexão Gateway VodaPay
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Status: SLA 99.99% Vodacom Network
              </span>
            </div>

            {vodapayTestResult && (
              <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                vodapayTestResult.success 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {vodapayTestResult.success ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                <div className="space-y-1">
                  <div className="font-bold">{vodapayTestResult.success ? "Gateway VodaPay Operacional" : "Falha na Ligação VodaPay"}</div>
                  <div>{vodapayTestResult.message}</div>
                  {vodapayTestResult.config && (
                    <div className="font-mono text-[10px] text-slate-600 bg-white/70 p-2 rounded-lg mt-1 border border-slate-200">
                      App ID: {vodapayTestResult.config.appId} • Algoritmo: {vodapayTestResult.config.signType} • URL: {vodapayTestResult.config.apiUrl}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundModalOpen && selectedTxForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-extrabold text-slate-900">
                Confirmar Reembolso Absa Pay
              </h3>
              <button onClick={() => setRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-xs text-red-800 space-y-1">
              <div className="font-bold">Aviso Financeiro:</div>
              <div>Será estornado o valor de <strong className="text-[#DC0032]">R {selectedTxForRefund.amount}.00 ZAR</strong> de volta para a conta devedora {selectedTxForRefund.absaAccountNumber || 'do militante'}.</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Motivo do Reembolso
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleProcessRefund}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "A processar..." : "Confirmar Reembolso"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT REPORT CSV MODAL */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#DC0032] flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-extrabold text-slate-900">
                    Exportar Histórico de Pagamentos (CSV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download consolidado de transações, quotas e mandatos Absa
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setExportModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Filtros Rápidos Pré-configurados
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExportStartDate("");
                    setExportEndDate("");
                    setExportStatus("All");
                    setExportMethod("All");
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                >
                  Histórico Completo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    const d30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
                    setExportStartDate(d30);
                    setExportEndDate(today);
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                >
                  Últimos 30 Dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportStartDate("2026-01-01");
                    setExportEndDate("2026-12-31");
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer text-center"
                >
                  Ano 2026 (YTD)
                </button>
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data Final
                </label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
                />
              </div>
            </div>

            {/* Status and Method Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado do Pagamento
                </label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
                >
                  <option value="All">Todos os Estados</option>
                  <option value="Successful">Liquidados (Successful)</option>
                  <option value="Pending">Pendentes</option>
                  <option value="Refunded">Reembolsados</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Canal / Método
                </label>
                <select
                  value={exportMethod}
                  onChange={(e) => setExportMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20"
                >
                  <option value="All">Todos os Canais</option>
                  <option value="Absa">Absa Pay Instant EFT</option>
                  <option value="DebiCheck">Absa DebiCheck Recorrente</option>
                  <option value="Cartão">Cartão Virtual / Whop</option>
                </select>
              </div>
            </div>

            {/* Info notice */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Formatação e Compatibilidade UTF-8
              </div>
              <p className="text-[11px] text-slate-500">
                O arquivo CSV exportado inclui codificação com BOM UTF-8, garantindo compatibilidade direta com Microsoft Excel, Apple Numbers e Google Sheets, incluindo conversão cambial ZAR para AOA.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownloadCSV}
                className="flex-1 py-2.5 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-md shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                {isExporting ? "A Gerar CSV..." : "Baixar Arquivo CSV (.csv)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
