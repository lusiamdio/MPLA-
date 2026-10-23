import React, { useState, useEffect } from "react";
import { Member, PaymentLog, AbsaFxRate } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import { 
  X, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, 
  Smartphone, QrCode, CreditCard, Receipt, Lock, Check,
  ChevronRight, ArrowLeftRight, Clock, HelpCircle, Download, FileText,
  Sparkles, ExternalLink, Send, Wallet, Radio, Zap
} from "lucide-react";

interface VodaPayPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  defaultAmount?: number;
  defaultPurpose?: string;
  defaultIsRecurring?: boolean;
  onSuccess: (payment: PaymentLog, updatedMember?: Member) => void;
}

export default function VodaPayPaymentCheckoutModal({
  isOpen,
  onClose,
  member,
  defaultAmount = 120,
  defaultPurpose = "Quotas Mensais de Membro (VodaPay)",
  defaultIsRecurring = false,
  onSuccess
}: VodaPayPaymentCheckoutModalProps) {
  // Wizard Steps: 1: Configure, 2: Checkout / Payment Channel, 3: Success Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<string>(defaultPurpose);
  const [payerPhone, setPayerPhone] = useState<string>("");
  const [productCode, setProductCode] = useState<"QR_CODE_PAYMENT" | "CASHIER_PAYMENT" | "MOBILE_PUSH">("QR_CODE_PAYMENT");
  const [isRecurring, setIsRecurring] = useState<boolean>(defaultIsRecurring);
  const [recurringInterval, setRecurringInterval] = useState<"monthly" | "quarterly" | "annual">("monthly");

  // VodaPay API Response states
  const [paymentId, setPaymentId] = useState<string>("");
  const [paymentRequestId, setPaymentRequestId] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [traceNo, setTraceNo] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes

  // Interactive Cashier Simulation States
  const [cashierPin, setCashierPin] = useState<string>("");
  const [cashierOtp, setCashierOtp] = useState<string>("");
  const [pushSent, setPushSent] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  // FX & Equivalents
  const [fxRate, setFxRate] = useState<number>(56.45);
  const [kwanzaEquivalent, setKwanzaEquivalent] = useState<number>(0);

  // Loading & Feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [completedPayment, setCompletedPayment] = useState<PaymentLog | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const initialAmt = defaultAmount || (member?.outstandingBalance ? Math.max(member.outstandingBalance, 50) : 120);
      setAmount(initialAmt);
      setPurpose(defaultPurpose || "Quotas Mensais de Membro (VodaPay)");
      setIsRecurring(defaultIsRecurring);
      setErrorMsg("");
      setCompletedPayment(null);
      setPushSent(false);
      setCashierPin("");
      setCashierOtp("");

      // Pre-fill payer phone
      if (member?.mobile) {
        setPayerPhone(member.mobile);
      } else {
        setPayerPhone("+27 82 890 4120");
      }

      // Fetch live FX rates
      fetch("/api/absa/fx/rates")
        .then(r => r.json())
        .then(data => {
          if (data.rates) {
            const zr = data.rates.find((r: AbsaFxRate) => r.currencyPair === "ZARAOA");
            if (zr) setFxRate(zr.midRate);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, member, defaultAmount, defaultPurpose, defaultIsRecurring]);

  // Compute Kwanza equivalent
  useEffect(() => {
    setKwanzaEquivalent(Math.round(amount * fxRate));
  }, [amount, fxRate]);

  // Countdown timer for VodaPay order
  useEffect(() => {
    let timer: any = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  if (!isOpen) return null;

  // Step 1: Create VodaPay Payment Order via /v2/payments/pay
  const handleInitiateVodaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg("Por favor indique um montante válido.");
      return;
    }
    if (!payerPhone.trim()) {
      setErrorMsg("Por favor indique o número de telefone Vodacom do pagador.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const orderReqId = `VPAY-REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const resp = await fetch("/api/vodapay/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRequestId: orderReqId,
          paymentAmount: {
            currency: "ZAR",
            value: amount.toFixed(2)
          },
          order: {
            orderId: `ORD-MPLA-${Date.now().toString().slice(-6)}`,
            orderDescription: purpose,
            orderTitle: `MPLA África do Sul - ${purpose}`,
            goods: [
              {
                referenceGoodsId: "MPLA-QUOTA-ITEM",
                goodsName: purpose,
                goodsCategory: "MEMBERSHIP_DUES",
                price: { currency: "ZAR", value: amount.toFixed(2) },
                quantity: "1"
              }
            ]
          },
          productCode,
          salesCode: "MPLA_ZA_2026",
          memberId: member?.id,
          payerPhone: payerPhone.trim(),
          isRecurring,
          recurringInterval
        })
      });

      const data = await resp.json();
      if (!resp.ok || data.resultInfo?.resultStatus === "F") {
        throw new Error(data.resultInfo?.resultMessage || "Falha ao contactar o Gateway VodaPay.");
      }

      setPaymentId(data.paymentId);
      setPaymentRequestId(data.paymentRequestId);
      setQrCodeData(data.qrCodeData);
      setQrCodeUrl(data.qrCodeUrl);
      setTraceNo(data.traceNo || `TRC-${Date.now().toString().slice(-6)}`);
      setCountdown(900);
      setStep(2);

      if (productCode === "MOBILE_PUSH") {
        setPushSent(true);
      }
    } catch (err: any) {
      console.error("VodaPay initiation error:", err);
      setErrorMsg(err.message || "Erro de comunicação com o Gateway VodaPay.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Payment (Simulates user completing scan / cashier / mobile push)
  const handleConfirmPayment = async (authMethod: string = "SUPERAPP_QR_SCAN") => {
    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await fetch("/api/vodapay/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          paymentRequestId,
          payerPhone,
          amount,
          memberId: member?.id,
          purpose,
          authMethod
        })
      });

      const data = await resp.json();
      if (!resp.ok || data.resultCode !== "SUCCESS") {
        throw new Error(data.resultMessage || "Falha na liquidação do pagamento VodaPay.");
      }

      setCompletedPayment(data.payment);
      setStep(3);
      onSuccess(data.payment, data.member);
    } catch (err: any) {
      console.error("VodaPay confirmation error:", err);
      setErrorMsg(err.message || "Erro ao autorizar a transação VodaPay.");
    } finally {
      setLoading(false);
    }
  };

  // Print receipt function
  const handlePrintReceipt = () => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo Oficial VodaPay Gateway - MPLA Diáspora</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; margin: 30px; }
            .header { border-bottom: 3px solid #E60000; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            h1 { color: #E60000; font-size: 18px; margin: 0; text-transform: uppercase; font-weight: 900; }
            .box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 10px; margin: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #CBD5E1; font-size: 13px; }
            .total { font-size: 22px; font-weight: 900; color: #E60000; text-align: center; padding: 14px; background: #FFF1F2; border-radius: 8px; margin: 16px 0; border: 1px solid #FECDD3; }
            .footer { font-size: 11px; color: #64748B; text-align: center; margin-top: 30px; }
            .badge { display: inline-block; background: #E60000; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span class="badge">VODAPAY SUPERAPP GATEWAY</span>
              <h1>Comprovativo Oficial de Pagamento</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">Comité do MPLA na África do Sul • Registo Digital 2026</p>
            </div>
            <div style="text-align: right;">
              <span style="font-family: monospace; font-size: 12px; font-weight: bold;">REC-${paymentId}</span>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B;">${new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="total">
            TOTAL PAGO: R${amount.toFixed(2)} ZAR
            <div style="font-size: 13px; font-weight: normal; color: #475569; margin-top: 4px;">Equivalente em Kwanzas: ${kwanzaEquivalent.toLocaleString('pt-AO')} AOA</div>
          </div>

          <div class="box">
            <div class="row"><strong>Militante:</strong> <span>${member?.fullName || "Militante MPLA"}</span></div>
            <div class="row"><strong>Nº de Membro / Cartão:</strong> <span style="font-family: monospace;">${member?.membershipNo || "MPLA-ZA-2026"}</span></div>
            <div class="row"><strong>Telefone / Carteira VodaPay:</strong> <span style="font-family: monospace;">${payerPhone}</span></div>
            <div class="row"><strong>Finalidade:</strong> <span>${purpose}</span></div>
            <div class="row"><strong>ID VodaPay (Order ID):</strong> <span style="font-family: monospace;">${paymentId}</span></div>
            <div class="row"><strong>Referência Merchant:</strong> <span style="font-family: monospace;">${paymentRequestId}</span></div>
            <div class="row"><strong>Trace Number:</strong> <span style="font-family: monospace;">${traceNo}</span></div>
            <div class="row"><strong>Canal de Pagamento:</strong> <span>VodaPay SuperApp (${productCode})</span></div>
            <div class="row"><strong>Estado da Transação:</strong> <span style="color: #16A34A; font-weight: bold;">Liquidado & Confirmado (SUCCESS)</span></div>
          </div>

          <div class="footer">
            <p>Documento autenticado eletronicamente através do Gateway VodaPay Vodacom v2 e motor de conciliação MPLA África do Sul.</p>
          </div>
        </body>
      </html>
    `;
    safePrintHtml(receiptHtml, "Recibo Oficial VodaPay Gateway - MPLA Diáspora");
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        
        {/* Modal Header with VodaPay Red Identity */}
        <div className="bg-gradient-to-r from-[#E60000] via-[#C8102E] to-[#990000] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#E60000] flex items-center justify-center font-black shadow-md">
              <Zap className="w-6 h-6 fill-[#E60000]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest font-black uppercase bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Vodacom SuperApp
                </span>
                <span className="text-[10px] font-mono text-white/80">API Gateway v2</span>
              </div>
              <h2 className="text-xl font-display font-black text-white tracking-tight">VodaPay Gateway</h2>
            </div>
          </div>
          <p className="text-xs text-white/85 max-w-md">
            Liquidação instantânea de quotas e donativos via carteira digital VodaPay, QR Code ou Mobile Push.
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/20">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 1 ? "text-white" : "text-white/40"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-white text-[#E60000]" : "bg-white/20 text-white"}`}>1</div>
              <span>Configuração</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 2 ? "text-white" : "text-white/40"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-white text-[#E60000]" : "bg-white/20 text-white"}`}>2</div>
              <span>Pagamento VodaPay</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 3 ? "text-white" : "text-white/40"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? "bg-white text-[#E60000]" : "bg-white/20 text-white"}`}>3</div>
              <span>Recibo Digital</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: CONFIGURE PAYMENT ================= */}
          {step === 1 && (
            <form onSubmit={handleInitiateVodaPay} className="space-y-5">
              {/* Member Profile Summary */}
              {member && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E60000]/10 text-[#E60000] flex items-center justify-center font-bold text-xs">
                      {member.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{member.fullName}</p>
                      <p className="text-[10px] font-mono text-slate-500">{member.membershipNo || "MPLA-ZA-2026"} • {member.province || "Gauteng"}</p>
                    </div>
                  </div>
                  {member.outstandingBalance ? (
                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Saldo Pendente</span>
                      <span className="text-xs font-mono font-bold text-[#E60000]">R{member.outstandingBalance}.00</span>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Montante da Quota / Pagamento (ZAR)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 120, 250, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        setCustomAmount("");
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        amount === val && customAmount === ""
                          ? "bg-[#E60000] border-[#E60000] text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      R{val}.00
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <span className="absolute left-3 top-2.5 text-xs font-bold font-mono text-slate-400">R</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) setAmount(Number(e.target.value));
                    }}
                    placeholder="Ou digite outro montante customizado..."
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E60000]/20 font-mono font-bold"
                  />
                </div>

                {/* Kwanza Equivalent pill */}
                <div className="flex items-center justify-between px-3 py-2 bg-amber-50/60 border border-amber-200/60 rounded-xl text-[11px] text-amber-900">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cotação Estimada Absa (1 ZAR ≈ {fxRate.toFixed(2)} AOA):</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800">
                    {kwanzaEquivalent.toLocaleString('pt-AO')} AOA
                  </span>
                </div>
              </div>

              {/* Purpose Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Finalidade do Pagamento</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium text-slate-800"
                >
                  <option value="Quotas Mensais de Membro (VodaPay)">Quotas Mensais de Membro</option>
                  <option value="Quotas Anuais Antecipadas (VodaPay)">Quotas Anuais Antecipadas (Desconto Quotas)</option>
                  <option value="Fundo de Solidariedade Diáspora (VodaPay)">Fundo de Solidariedade Comunitária</option>
                  <option value="Emissão de Novo Cartão Físico (VodaPay)">Taxa de Emissão de Cartão Físico</option>
                  <option value="Inscrição de Evento / Gala (VodaPay)">Inscrição de Evento / Gala Oficial</option>
                </select>
              </div>

              {/* Payer Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Número de Telefone Vodacom (África do Sul)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400"><Smartphone className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E60000]/20 font-mono font-bold"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400">Associado à sua conta Vodacom / VodaPay SuperApp.</p>
              </div>

              {/* Preferred VodaPay Payment Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Canal VodaPay Preferido</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProductCode("QR_CODE_PAYMENT")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      productCode === "QR_CODE_PAYMENT" 
                        ? "bg-[#E60000]/5 border-[#E60000] text-slate-900 ring-1 ring-[#E60000]" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <QrCode className={`w-5 h-5 ${productCode === "QR_CODE_PAYMENT" ? "text-[#E60000]" : "text-slate-400"}`} />
                    <div className="mt-2">
                      <p className="text-[11px] font-bold">QR Code</p>
                      <p className="text-[9px] text-slate-500">Scan to Pay</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductCode("CASHIER_PAYMENT")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      productCode === "CASHIER_PAYMENT" 
                        ? "bg-[#E60000]/5 border-[#E60000] text-slate-900 ring-1 ring-[#E60000]" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${productCode === "CASHIER_PAYMENT" ? "text-[#E60000]" : "text-slate-400"}`} />
                    <div className="mt-2">
                      <p className="text-[11px] font-bold">Web Cashier</p>
                      <p className="text-[9px] text-slate-500">In-App Checkout</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductCode("MOBILE_PUSH")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      productCode === "MOBILE_PUSH" 
                        ? "bg-[#E60000]/5 border-[#E60000] text-slate-900 ring-1 ring-[#E60000]" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Send className={`w-5 h-5 ${productCode === "MOBILE_PUSH" ? "text-[#E60000]" : "text-slate-400"}`} />
                    <div className="mt-2">
                      <p className="text-[11px] font-bold">Mobile Push</p>
                      <p className="text-[9px] text-slate-500">Notificação USSD</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recurring Auto-Debit Option */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E60000] focus:ring-[#E60000]"
                  />
                  <span className="text-xs font-bold text-slate-800">Ativar Débito Automático Recorrente VodaPay</span>
                </label>

                {isRecurring && (
                  <div className="pt-2 pl-6 border-t border-slate-200/60 flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 font-medium">Frequência:</span>
                    <div className="flex gap-2">
                      {(["monthly", "quarterly", "annual"] as const).map(interval => (
                        <button
                          key={interval}
                          type="button"
                          onClick={() => setRecurringInterval(interval)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase transition cursor-pointer ${
                            recurringInterval === interval
                              ? "bg-[#E60000] text-white"
                              : "bg-white border border-slate-200 text-slate-600"
                          }`}
                        >
                          {interval === "monthly" ? "Mensal" : interval === "quarterly" ? "Trimestral" : "Anual"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#E60000] hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-red-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>A Iniciar VodaPay...</span>
                    </>
                  ) : (
                    <>
                      <span>Prosseguir para Pagamento</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: COMPLETE PAYMENT CHANNELS ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Order Banner */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#E60000]">Ordem VodaPay Gerada</span>
                  <h4 className="text-sm font-bold text-slate-900">{purpose}</h4>
                  <p className="text-[11px] font-mono text-slate-500">ID: {paymentId} • Ref: {paymentRequestId}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-[#E60000]">R{amount.toFixed(2)}</span>
                  <span className="text-[10px] font-mono text-slate-500 block">({kwanzaEquivalent.toLocaleString('pt-AO')} AOA)</span>
                </div>
              </div>

              {/* Channel Tabs View */}
              <div className="space-y-4">
                {/* 1. QR Code Scan to Pay Mode */}
                {productCode === "QR_CODE_PAYMENT" && (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-mono text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-[#E60000]" />
                      <span>Expira em: <strong className="text-[#E60000]">{formatSeconds(countdown)}</strong></span>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm relative group">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="VodaPay QR Code" 
                          className="w-48 h-48 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-400">
                          QR Code Loading...
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#E60000]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                        <span className="bg-[#E60000] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">SuperApp QR</span>
                      </div>
                    </div>

                    <div className="space-y-1 max-w-sm">
                      <p className="text-xs font-bold text-slate-800">Como pagar com o VodaPay:</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        1. Abra o SuperApp <strong>VodaPay</strong> no seu telemóvel.<br />
                        2. Selecione a opção <strong>"Scan to Pay"</strong>.<br />
                        3. Aponte a câmara para este código e confirme com a sua biometria/PIN.
                      </p>
                    </div>

                    {/* Instant Simulated Authorization button */}
                    <div className="pt-2 w-full">
                      <button
                        onClick={() => handleConfirmPayment("VODAPAY_QR_BIOMETRIC_AUTH")}
                        disabled={loading}
                        className="w-full py-3 bg-[#E60000] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-red-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>A Validar Transação no SuperApp...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Confirmar Pagamento no VodaPay SuperApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Web Cashier Checkout Mode */}
                {productCode === "CASHIER_PAYMENT" && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#E60000]" />
                        <h4 className="text-xs font-bold text-slate-900">VodaPay Web Cashier Portal</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Sessão Segura SSL 256-bit
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">Número de Carteira / Telemóvel</label>
                        <input
                          type="text"
                          value={payerPhone}
                          readOnly
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">PIN VodaPay (4 Dígitos)</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cashierPin}
                            onChange={(e) => setCashierPin(e.target.value)}
                            placeholder="••••"
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center tracking-widest text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">OTP SMS de Validação</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={cashierOtp}
                            onChange={(e) => setCashierOtp(e.target.value)}
                            placeholder="Ex: 890124"
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center tracking-wider text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmPayment("VODAPAY_WEB_CASHIER_PIN")}
                      disabled={loading}
                      className="w-full py-3 bg-[#E60000] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>A Processar Débito VodaPay...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Autorizar Débito de R{amount.toFixed(2)} na Carteira</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 3. Mobile Push Notification Mode */}
                {productCode === "MOBILE_PUSH" && (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#E60000]/10 text-[#E60000] flex items-center justify-center mx-auto animate-pulse">
                      <Smartphone className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Notificação Push Enviada</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Enviámos uma solicitação de autorização VodaPay para o telemóvel <strong>{payerPhone}</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl inline-flex items-center gap-2 text-xs text-slate-600 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E60000]" />
                      <span>A aguardar aprovação no telemóvel...</span>
                    </div>

                    <button
                      onClick={() => handleConfirmPayment("VODAPAY_MOBILE_PUSH_APPROVED")}
                      disabled={loading}
                      className="w-full py-3 bg-[#E60000] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>A Sincronizar com Vodacom Network...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirmar Autorização do Telemóvel</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Back */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Alterar Montante ou Canal
                </button>
                <span className="text-[10px] font-mono text-slate-400">Trace: {traceNo}</span>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SUCCESSFUL RECEIPT ================= */}
          {step === 3 && completedPayment && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Transação VodaPay Aprovada
                </span>
                <h3 className="text-xl font-display font-black text-slate-900">Pagamento Confirmado!</h3>
                <p className="text-xs text-slate-500">
                  As suas quotas foram liquidadas com sucesso através da Gateway VodaPay.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Total Liquidado:</span>
                  <span className="font-bold text-[#E60000] text-sm">R{completedPayment.amount.toFixed(2)} ZAR</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Valor em Kwanzas:</span>
                  <span className="font-bold text-slate-800">{(completedPayment.amountAOA || kwanzaEquivalent).toLocaleString('pt-AO')} AOA</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">ID Transação:</span>
                  <span className="font-bold text-slate-800">{completedPayment.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">VodaPay Order ID:</span>
                  <span className="font-bold text-slate-800">{completedPayment.vodapayPaymentId || paymentId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Carteira / Contacto:</span>
                  <span className="font-bold text-slate-800">{payerPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Data & Hora:</span>
                  <span className="font-bold text-slate-800">{new Date().toLocaleString('pt-PT')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descarregar / Imprimir Recibo</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                >
                  Concluir & Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
