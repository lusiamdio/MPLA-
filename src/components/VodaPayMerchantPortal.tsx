import React, { useState, useEffect } from "react";
import { VodaPayMerchantOverview, VodaPaySettlementBatch, VodaPayPaymentLink, PaymentLog } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import { 
  Building2, CreditCard, DollarSign, Repeat, ArrowLeftRight, 
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw, Download, 
  Trash2, Play, Pause, XCircle, ShieldCheck, ExternalLink, Receipt,
  TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Lock, Sliders, Check,
  KeyRound, Terminal, Clock, Copy, BarChart3, ShieldAlert, Sparkles,
  Calendar, CheckCheck, AlertTriangle, FileSpreadsheet, Zap, Smartphone, QrCode,
  Share2, Printer, Plus, Send, ChevronRight, Store, PhoneCall
} from "lucide-react";

export default function VodaPayMerchantPortal() {
  const [overview, setOverview] = useState<VodaPayMerchantOverview | null>(null);
  const [settlements, setSettlements] = useState<VodaPaySettlementBatch[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<VodaPayPaymentLink[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "standees" | "links" | "transactions">("overview");

  // Create Link Modal
  const [createLinkModalOpen, setCreateLinkModalOpen] = useState<boolean>(false);
  const [newLinkTitle, setNewLinkTitle] = useState<string>("Liquidação de Quota Mensal");
  const [newLinkAmount, setNewLinkAmount] = useState<number>(120);
  const [newLinkPurpose, setNewLinkPurpose] = useState<string>("Quotas Mensais de Membro (VodaPay)");
  const [newLinkRecipientName, setNewLinkRecipientName] = useState<string>("");
  const [newLinkRecipientPhone, setNewLinkRecipientPhone] = useState<string>("");
  const [creatingLink, setCreatingLink] = useState<boolean>(false);

  // Standee Selection for Print
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchMerchantData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vodapay/merchant/overview");
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
        setSettlements(data.settlementBatches || []);
        setPaymentLinks(data.paymentLinks || []);
        setBranches(data.branches || []);
        setRecentTransactions(data.recentTransactions || []);
        if (data.branches && data.branches.length > 0 && !selectedBranch) {
          setSelectedBranch(data.branches[0]);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do VodaPay Merchant:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLink(true);
    try {
      const res = await fetch("/api/vodapay/merchant/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLinkTitle,
          amount: newLinkAmount,
          purpose: newLinkPurpose,
          recipientName: newLinkRecipientName,
          recipientPhone: newLinkRecipientPhone
        })
      });
      const data = await res.json();
      if (data.success && data.link) {
        setPaymentLinks([data.link, ...paymentLinks]);
        setCreateLinkModalOpen(false);
        setNewLinkRecipientName("");
        setNewLinkRecipientPhone("");
      }
    } catch (err) {
      console.error("Erro ao criar link VodaPay:", err);
    } finally {
      setCreatingLink(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handlePrintStandee = (branch: any) => {
    const standeeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Standee Oficial VodaPay Chop-Chop - ${branch.branchName}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; text-align: center; margin: 0; padding: 20px; }
            .card { border: 4px solid #E60000; border-radius: 24px; padding: 30px; background: #FFFFFF; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
            .badge { background: #E60000; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; }
            h1 { color: #0F172A; font-size: 26px; font-weight: 900; margin: 8px 0; }
            h2 { color: #E60000; font-size: 18px; font-weight: 800; margin: 4px 0 20px 0; }
            .qr-frame { background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 20px; padding: 20px; display: inline-block; margin: 15px 0; }
            .qr-img { width: 260px; height: 260px; display: block; margin: 0 auto; }
            .steps { text-align: left; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 14px; padding: 14px 20px; margin: 20px 0; font-size: 13px; color: #881337; }
            .steps ol { margin: 0; padding-left: 20px; }
            .steps li { margin-bottom: 4px; font-weight: 600; }
            .footer { font-size: 11px; color: #64748B; margin-top: 25px; border-top: 1px solid #E2E8F0; padding-top: 15px; }
            .till { font-family: monospace; font-size: 15px; font-weight: 900; color: #0F172A; background: #F1F5F9; padding: 4px 12px; border-radius: 8px; display: inline-block; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">VODAPAY CHOP-CHOP • SCAN TO PAY</span>
            <h1>MPLA ÁFRICA DO SUL</h1>
            <h2>${branch.branchName}</h2>
            
            <p style="font-size: 14px; color: #475569; margin: 0;">Pague as suas quotas de militante, emissão de cartão e donativos instantaneamente.</p>
            
            <div class="qr-frame">
              <img src="${branch.qrUrl}" class="qr-img" alt="QR Code VodaPay" />
              <div class="till">TILL NO: ${branch.tillNumber} • TERM: ${branch.terminalId}</div>
            </div>

            <div class="steps">
              <ol>
                <li>Abra o SuperApp <strong>VodaPay</strong> no seu telemóvel.</li>
                <li>Toque no botão <strong>"Scan to Pay"</strong>.</li>
                <li>Aponte a câmara para este código e digite o valor da sua quota.</li>
              </ol>
            </div>

            <div class="footer">
              <strong>Comité do MPLA na África do Sul • Delegação Oficial</strong><br />
              Endereço: ${branch.address}<br />
              Processamento seguro via Vodacom Financial Services (Pty) Ltd.
            </div>
          </div>
        </body>
      </html>
    `;
    safePrintHtml(standeeHtml, `Standee Oficial VodaPay Chop-Chop - ${branch.branchName}`);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="vodapay-merchant-portal">
      
      {/* VODAPAY MERCHANT HEADER BANNER */}
      <div className="bg-linear-to-r from-[#E60000] via-[#C8102E] to-[#990000] text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white text-[#E60000] flex items-center justify-center font-black text-sm shadow-md">
              <Zap className="w-5 h-5 fill-[#E60000]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full font-black">
                  Vodacom Financial Services
                </span>
                <span className="text-[10px] font-mono text-white/80">Merchant ID: MERCH_VPAY_MPLA_ZA_2026</span>
              </div>
              <h2 className="text-xl font-display font-black tracking-tight text-white">
                VodaPay Merchant Portal & Gestão de Arrecadação
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/85 max-w-2xl">
            Gestão integrada da conta de comerciante VodaPay do MPLA África do Sul, liquidação diária de quotas, geração de standees Chop-Chop e emissão de links de pagamento.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => setCreateLinkModalOpen(true)}
            className="px-4 py-2.5 bg-white text-[#E60000] hover:bg-slate-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Link de Pagamento
          </button>

          <button
            onClick={fetchMerchantData}
            disabled={loading}
            className="px-4 py-2.5 bg-black/40 hover:bg-black/60 text-white border border-white/30 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sincronizar VodaPay
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Volume Arrecadado Hoje</span>
            <span className="p-2 rounded-xl bg-red-50 text-[#E60000]"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-display font-black text-slate-900">
            R {(overview?.dailyGrossVolume || 0).toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{overview?.todayTransactionsCount || 0} transações registadas hoje</span>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Próxima Liquidação (T+1)</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-display font-black text-amber-600">
            R {(overview?.pendingSettlement || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Previsão: <strong>{overview?.nextPayoutDate || "2026-02-20"}</strong> (Absa Bank SA)
          </div>
        </div>

        {/* Tile 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Liquidado na Conta</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-display font-black text-slate-900">
            R {(overview?.totalSettled || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Conciliado via Clearing Vodacom</span>
          </div>
        </div>

        {/* Tile 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Terminais Chop-Chop Ativos</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600"><Store className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-display font-black text-slate-900">
            {branches.length || 4} Delegações
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Taxa QR: <strong className="text-emerald-600">0% (Isento)</strong> • Taxa Cartão: <strong>1.0%</strong>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "overview"
              ? "border-[#E60000] text-[#E60000]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral & Batches de Liquidação</span>
        </button>

        <button
          onClick={() => setActiveSubTab("standees")}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "standees"
              ? "border-[#E60000] text-[#E60000]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Standees Regionais Chop-Chop (QR Físico)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("links")}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "links"
              ? "border-[#E60000] text-[#E60000]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Links de Pagamento & Cobrança ({paymentLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("transactions")}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "transactions"
              ? "border-[#E60000] text-[#E60000]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Transações VodaPay ({recentTransactions.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW & SETTLEMENT BATCHES ================= */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Merchant Credentials & Bank Clearing Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Credenciamento Oficial de Comerciante Vodacom</h3>
                <p className="text-xs text-slate-500">Dados contratuais com a Vodacom Financial Services (Pty) Ltd</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                CONTA ATIVA & HOMOLOGADA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Entidade Titular</span>
                <p className="font-bold text-slate-800">{overview?.merchantName || "MPLA - Delegação Regional África do Sul"}</p>
                <p className="text-[11px] text-slate-500">MCC: {overview?.mccCode || "8699"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Conta Bancária de Liquidação</span>
                <p className="font-bold text-slate-800 font-mono">{overview?.settlementAccount || "4064583487 (Absa Bank)"}</p>
                <p className="text-[11px] text-slate-500">Ciclo: {overview?.settlementCycle || "T+1 Diário"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Taxas de Intercâmbio VodaPay</span>
                <p className="font-bold text-slate-800">QR Code: <span className="text-emerald-600 font-bold">0.0% (Grátis)</span></p>
                <p className="text-[11px] text-slate-500">Cartões / Carteira: 1.0% flat</p>
              </div>
            </div>
          </div>

          {/* Daily Settlement Batches Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lotes de Liquidação Bancária (Settlement Batches)</h3>
                <p className="text-xs text-slate-500">Transferências diárias automáticas enviadas para a conta Absa da Sede</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[9px]">
                    <th className="pb-3">Lote ID</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Transações</th>
                    <th className="pb-3">Valor Bruto</th>
                    <th className="pb-3">Taxas Vodacom</th>
                    <th className="pb-3">Valor Líquido</th>
                    <th className="pb-3">Referência Absa</th>
                    <th className="pb-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {settlements.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-mono text-[11px] font-bold text-slate-900">{st.batchNumber}</td>
                      <td className="py-3.5 font-mono text-slate-500">{st.date}</td>
                      <td className="py-3.5 font-mono">{st.transactionCount}</td>
                      <td className="py-3.5 font-mono font-bold text-slate-900">R {st.grossAmount.toFixed(2)}</td>
                      <td className="py-3.5 font-mono text-red-600">-R {st.feeAmount.toFixed(2)}</td>
                      <td className="py-3.5 font-mono font-bold text-emerald-600">R {st.netAmount.toFixed(2)}</td>
                      <td className="py-3.5 font-mono text-[10px] text-slate-500">{st.bankReference}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase ${
                          st.status === "SETTLED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {st.status === "SETTLED" ? "Depositado" : "Em Processamento"}
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

      {/* ================= TAB 2: REGIONAL STANDEES GENERATOR ================= */}
      {activeSubTab === "standees" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Branch Selector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Selecione a Delegação Regional</h3>
                <p className="text-xs text-slate-500">
                  Gere e imprima o standee oficial de balcão com o QR Code Chop-Chop VodaPay configurado para cada comité.
                </p>

                <div className="space-y-2 pt-2">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBranch(b)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                        selectedBranch?.id === b.id
                          ? "bg-[#E60000]/5 border-[#E60000] ring-1 ring-[#E60000]"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{b.branchName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Till: {b.tillNumber} • {b.terminalId}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${selectedBranch?.id === b.id ? "text-[#E60000]" : "text-slate-400"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Instruções para a Secretaria:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Imprima em formato A4 ou A5 em papel cartão de alta gramatura e coloque sobre a mesa de atendimento da receção. Os militantes podem aproximar o telemóvel e efetuar o pagamento diretamente na sua carteira VodaPay.
                </p>
              </div>
            </div>

            {/* Standee Preview Card */}
            <div className="lg:col-span-7">
              {selectedBranch ? (
                <div className="bg-white p-8 rounded-3xl border-2 border-[#E60000] shadow-xl text-center space-y-5 max-w-md mx-auto relative overflow-hidden">
                  <div className="inline-block bg-[#E60000] text-white text-[11px] font-black uppercase px-4 py-1.5 rounded-full tracking-wider">
                    VodaPay Chop-Chop • Scan to Pay
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-black text-slate-900">MPLA ÁFRICA DO SUL</h3>
                    <h4 className="text-sm font-bold text-[#E60000]">{selectedBranch.branchName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Liquidação Oficial de Quotas & Donativos</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                    <img 
                      src={selectedBranch.qrUrl} 
                      alt="QR Standee" 
                      className="w-48 h-48 object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-2 text-xs font-mono font-bold text-slate-800 bg-white py-1 px-3 rounded-lg border border-slate-200 inline-block">
                      TILL: {selectedBranch.tillNumber} • TERM: {selectedBranch.terminalId}
                    </div>
                  </div>

                  <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-left text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-[#E60000]">Passos para o Militante:</p>
                    <ol className="list-decimal pl-4 text-[11px] space-y-0.5 text-slate-600">
                      <li>Abra o SuperApp <strong>VodaPay</strong>.</li>
                      <li>Clique em <strong>"Scan to Pay"</strong>.</li>
                      <li>Aponte a câmara e confirme o valor.</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => handlePrintStandee(selectedBranch)}
                    className="w-full py-3 bg-[#E60000] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Standee Oficial ({selectedBranch.branchName})</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PAYMENT LINKS GENERATOR ================= */}
      {activeSubTab === "links" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Links de Pagamento Personalizados VodaPay</h3>
                <p className="text-xs text-slate-500">Envie cobranças diretas por WhatsApp, SMS ou Email para militantes</p>
              </div>
              <button
                onClick={() => setCreateLinkModalOpen(true)}
                className="px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Link de Cobrança
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {paymentLinks.map((link) => (
                <div key={link.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:bg-white hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-red-100 text-[#E60000] px-2 py-0.5 rounded font-bold">
                        {link.linkCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{link.title}</h4>
                      <p className="text-xs text-slate-500">{link.purpose}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-mono font-black text-[#E60000]">R {link.amount.toFixed(2)}</span>
                      <span className="text-[9px] font-mono block text-emerald-600 font-bold uppercase">Ativo</span>
                    </div>
                  </div>

                  {link.recipientName && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between font-mono">
                      <span>Destinatário: <strong>{link.recipientName}</strong></span>
                      <span className="text-slate-400">{link.recipientPhone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleCopyLink(link.paymentUrl, link.id)}
                      className="flex-1 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedLink === link.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === link.id ? "Copiado!" : "Copiar Link"}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Olá camarada! Segue o link seguro para liquidação da quota do MPLA na África do Sul via VodaPay (R${link.amount}.00): ${link.paymentUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title="Enviar via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TRANSACTIONS FEED ================= */}
      {activeSubTab === "transactions" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Feed de Transações do Gateway VodaPay</h3>
              <p className="text-xs text-slate-500">Transações em tempo real com identificador VodaPay Order ID e Trace No.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[9px]">
                  <th className="pb-3">ID Interno</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Finalidade</th>
                  <th className="pb-3">Telemóvel / Carteira</th>
                  <th className="pb-3">VodaPay Order ID</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-mono text-[11px] text-slate-500">{tx.id}</td>
                      <td className="py-3.5 font-mono text-slate-500">{tx.date}</td>
                      <td className="py-3.5 font-mono font-bold text-slate-900">R {tx.amount.toFixed(2)}</td>
                      <td className="py-3.5 truncate max-w-[150px]">{tx.purpose}</td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-700">{tx.vodapayPayerPhone || "VodaPay App"}</td>
                      <td className="py-3.5 font-mono text-[10px] text-slate-500">{tx.vodapayPaymentId || "VPAY-001"}</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-mono text-xs">
                      Nenhuma transação VodaPay registada até ao momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PAYMENT LINK MODAL */}
      {createLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E60000] text-white">
                  <Zap className="w-4 h-4 fill-white" />
                </span>
                <h3 className="font-display font-black text-slate-900 text-sm">Criar Link de Cobrança VodaPay</h3>
              </div>
              <button onClick={() => setCreateLinkModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentLink} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Título da Cobrança</label>
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Ex: Quotas Mensais de Membro"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#E60000]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Valor (ZAR)</label>
                  <input
                    type="number"
                    value={newLinkAmount}
                    onChange={(e) => setNewLinkAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-[#E60000]/20"
                    min="10"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Finalidade</label>
                  <select
                    value={newLinkPurpose}
                    onChange={(e) => setNewLinkPurpose(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="Quotas Mensais de Membro (VodaPay)">Quotas Mensais</option>
                    <option value="Quotas Anuais Antecipadas (VodaPay)">Quotas Anuais</option>
                    <option value="Inscrição de Evento / Gala (VodaPay)">Evento / Gala</option>
                    <option value="Fundo de Solidariedade Diáspora (VodaPay)">Solidariedade</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nome do Militante (Opcional)</label>
                <input
                  type="text"
                  value={newLinkRecipientName}
                  onChange={(e) => setNewLinkRecipientName(e.target.value)}
                  placeholder="Ex: João Baptista"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E60000]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Telemóvel Vodacom (Opcional)</label>
                <input
                  type="text"
                  value={newLinkRecipientPhone}
                  onChange={(e) => setNewLinkRecipientPhone(e.target.value)}
                  placeholder="+27 82 000 0000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#E60000]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateLinkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingLink}
                  className="px-5 py-2 bg-[#E60000] text-white font-bold rounded-xl cursor-pointer shadow-md hover:bg-red-700 transition flex items-center gap-1.5"
                >
                  {creatingLink ? "A Criar..." : "Gerar Link VodaPay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
