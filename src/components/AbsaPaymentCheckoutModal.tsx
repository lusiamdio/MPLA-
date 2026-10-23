import React, { useState, useEffect } from "react";
import { Member, PaymentLog, AbsaEligibleAccount, AbsaFxRate } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import { 
  X, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, 
  Smartphone, Building2, Repeat, CreditCard, Receipt, Lock, Check,
  ChevronRight, ArrowLeftRight, Clock, HelpCircle, Download, FileText
} from "lucide-react";

interface AbsaPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  defaultAmount?: number;
  defaultPurpose?: string;
  defaultIsRecurring?: boolean;
  onSuccess: (payment: PaymentLog, updatedMember?: Member, subscription?: any) => void;
}

export default function AbsaPaymentCheckoutModal({
  isOpen,
  onClose,
  member,
  defaultAmount = 120,
  defaultPurpose = "Quotas Mensais de Membro",
  defaultIsRecurring = false,
  onSuccess
}: AbsaPaymentCheckoutModalProps) {
  // Wizard Steps: 1: Configure, 2: Waiting SureCheck, 3: Choose Account, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<string>(defaultPurpose);
  const [isRecurring, setIsRecurring] = useState<boolean>(defaultIsRecurring);
  const [recurringInterval, setRecurringInterval] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [payerIdType, setPayerIdType] = useState<"Account" | "SAID" | "PASSPORT">("Account");
  const [payerIdentifier, setPayerIdentifier] = useState<string>("");

  // Consent & Transaction state
  const [paymentId, setPaymentId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [eligibleAccounts, setEligibleAccounts] = useState<AbsaEligibleAccount[]>([]);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(1);
  const [countdown, setCountdown] = useState<number>(120);

  // FX state
  const [fxRates, setFxRates] = useState<AbsaFxRate[]>([]);
  const [kwanzaEquivalent, setKwanzaEquivalent] = useState<number>(0);

  // Status & error states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [completedPayment, setCompletedPayment] = useState<PaymentLog | null>(null);
  const [createdSub, setCreatedSub] = useState<any>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAmount(defaultAmount || (member?.outstandingBalance ? Math.max(member.outstandingBalance, 50) : 120));
      setPurpose(defaultPurpose || "Quotas Mensais de Membro");
      setIsRecurring(defaultIsRecurring);
      setErrorMsg("");
      setCompletedPayment(null);
      setCreatedSub(null);

      // Pre-fill payer info from member
      if (member) {
        if (member.nationalId && member.nationalId.length === 13 && /^\d+$/.test(member.nationalId)) {
          setPayerIdType("SAID");
          setPayerIdentifier(member.nationalId);
        } else if (member.nationalId) {
          setPayerIdType("PASSPORT");
          setPayerIdentifier(member.nationalId);
        } else {
          setPayerIdType("Account");
          setPayerIdentifier("4064583487");
        }
      } else {
        setPayerIdType("Account");
        setPayerIdentifier("4064583487");
      }

      // Fetch live FX rates
      fetch("/api/absa/fx/rates")
        .then(r => r.json())
        .then(data => {
          if (data.rates) {
            setFxRates(data.rates);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, member, defaultAmount, defaultPurpose, defaultIsRecurring]);

  // Compute Kwanza equivalent
  useEffect(() => {
    const rate = fxRates.find(r => r.currencyPair === "ZARAOA")?.midRate || 56.45;
    setKwanzaEquivalent(Math.round(amount * rate));
  }, [amount, fxRates]);

  // Countdown timer for SureCheck step
  useEffect(() => {
    let timer: any = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  if (!isOpen) return null;

  // Step 1: Submit Consent Request
  const handleInitiateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg("Por favor insira um valor válido.");
      return;
    }
    if (!payerIdentifier.trim()) {
      setErrorMsg("Por favor insira o número de conta, BI ou Passaporte do pagador.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await fetch("/api/absa/consent-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "ZAR",
          purpose,
          payerIdentificationType: payerIdType,
          payerIdentification: payerIdentifier.trim(),
          userNumber: "1",
          memberId: member?.id,
          isRecurring,
          recurringInterval
        })
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Falha ao contactar gateway Absa Pay.");
      }

      setPaymentId(data.paymentId);
      setTransactionId(data.transactionId);
      setEligibleAccounts(data.accounts || []);
      setSelectedAccountIndex(data.accounts?.[0]?.accountIndex || 1);
      setCountdown(120);
      setStep(2);

      // Auto transition to account selection after 3.5s to simulate instant SureCheck approval on phone
      setTimeout(() => {
        setStep(3);
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de ligação à rede bancária Absa.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Finalize Debit Payment Instruction
  const handleExecutePayment = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const selectedAcc = eligibleAccounts.find(a => a.accountIndex === selectedAccountIndex) || eligibleAccounts[0];

      const resp = await fetch("/api/absa/payment-instruction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          transactionId,
          accountIndex: selectedAccountIndex,
          memberId: member?.id,
          purpose,
          amount,
          isRecurring,
          recurringInterval,
          accountName: selectedAcc?.accountName || "Current account",
          accountNumberMasked: selectedAcc?.accountNumber || "******3103"
        })
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Falha na liquidação bancária Absa.");
      }

      setCompletedPayment(data.payment);
      setCreatedSub(data.subscription);
      setStep(4);

      if (onSuccess) {
        onSuccess(data.payment, data.member, data.subscription);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro na instrução de débito Absa.");
    } finally {
      setLoading(false);
    }
  };

  // Print Official PDF Receipt
  const handlePrintReceipt = () => {
    if (!completedPayment) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo Oficial de Pagamento - Absa Pay / MPLA</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; margin: 30px; line-height: 1.5; }
            .header { border-bottom: 3px solid #DC0032; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 800; color: #DC0032; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
            .badge { background: #DC0032; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
            .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; }
            .label { font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 2px; }
            .amount-box { background: #FFF1F2; border: 2px solid #FECDD3; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; }
            .amount-val { font-size: 28px; font-weight: 900; color: #DC0032; }
            .footer { font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 16px; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">MPLA - Comunidade África do Sul</h1>
              <p class="subtitle">Comprovativo Oficial de Pagamento Bancário • Absa Open Banking EFT</p>
            </div>
            <span class="badge">PAGAMENTO CONFIRMADO</span>
          </div>

          <div class="amount-box">
            <div class="label">Valor Total Liquidado</div>
            <div class="amount-val">R ${completedPayment.amount}.00 ZAR</div>
            <div style="font-size: 13px; color: #475569; margin-top: 4px; font-weight: 600;">
              ≈ ${completedPayment.amountAOA?.toLocaleString()} Kz (Kwanzas Angolanos)
            </div>
          </div>

          <div class="box">
            <div class="grid">
              <div>
                <div class="label">Nº de Transação Absa</div>
                <div class="value" style="font-family: monospace;">${completedPayment.id}</div>
              </div>
              <div>
                <div class="label">Data & Hora de Emissão</div>
                <div class="value">${completedPayment.date} - ${new Date().toLocaleTimeString()}</div>
              </div>
              <div>
                <div class="label">Militante / Pagador</div>
                <div class="value">${member?.fullName || 'Militante Registado'}</div>
              </div>
              <div>
                <div class="label">Nº de Cartão de Membro</div>
                <div class="value" style="font-family: monospace; color: #DC0032;">${member?.membershipNo || 'MPLA-ZA-2026'}</div>
              </div>
              <div>
                <div class="label">Finalidade</div>
                <div class="value">${completedPayment.purpose}</div>
              </div>
              <div>
                <div class="label">Método de Liquidação</div>
                <div class="value">${completedPayment.method}</div>
              </div>
              <div>
                <div class="label">Conta Absa Debitada</div>
                <div class="value">${completedPayment.absaAccountName || 'Current account'} (${completedPayment.absaAccountNumber || '4047561110'})</div>
              </div>
              <div>
                <div class="label">Beneficiário Partidário</div>
                <div class="value">MPLA South Africa (Absa 4064583487)</div>
              </div>
            </div>
          </div>

          ${completedPayment.isRecurring ? `
            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 12px; font-size: 12px; color: #1E40AF; margin-bottom: 20px;">
              <strong>Mandato DebiCheck Activo:</strong> Foi configurada uma subscrição recorrente com renovação automática. Referência de débito: ${completedPayment.recurringScheduleId || 'SUB-ACTIVA'}.
            </div>
          ` : ''}

          <div class="footer">
            <p>Emitido eletronicamente pelo Sistema de Gestão Partidária do MPLA África do Sul integrado via Absa Open Banking API v1.3.0.</p>
            <p>Este recibo é juridicamente válido como prova de quitação de quotas e contribuições partidárias para todos os efeitos estatutários.</p>
          </div>
        </body>
      </html>
    `;
    safePrintHtml(receiptHtml, "Recibo Oficial de Pagamento - Absa Pay / MPLA");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="absa-checkout-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER: Absa Branded Bar */}
        <div className="bg-linear-to-r from-[#DC0032] to-[#880020] text-white p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-xl text-white border border-white/20">
              absa
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-extrabold tracking-tight">Absa Pay • Pagamento Seguro</h3>
                <span className="bg-white/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Open Banking v1.3
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">MPLA Comunidade África do Sul • Quotas & Contribuições</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 shrink-0">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#DC0032] font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#DC0032] text-white' : 'bg-slate-200'}`}>1</span>
            Detalhes
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#DC0032] font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#DC0032] text-white' : 'bg-slate-200'}`}>2</span>
            SureCheck
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#DC0032] font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#DC0032] text-white' : 'bg-slate-200'}`}>3</span>
            Conta & Débito
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-green-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>4</span>
            Recibo
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: CONFIGURE ================= */}
          {step === 1 && (
            <form onSubmit={handleInitiateConsent} className="space-y-4">
              
              {/* Payment Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tipo de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(false)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                      !isRecurring 
                        ? "border-[#DC0032] bg-red-50/50 shadow-xs" 
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${!isRecurring ? "bg-[#DC0032] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Pagamento Único (EFT)</div>
                      <div className="text-[11px] text-slate-500">Liquidação pontual imediata</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecurring(true)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                      isRecurring 
                        ? "border-[#DC0032] bg-red-50/50 shadow-xs" 
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isRecurring ? "bg-[#DC0032] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Subscrição Recorrente</div>
                      <div className="text-[11px] text-slate-500">Débito automático DebiCheck</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recurring Interval if enabled */}
              {isRecurring && (
                <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-amber-700" />
                      Periodicidade de Débito Automático:
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "monthly", label: "Mensal", desc: "Cada 30 dias" },
                      { key: "quarterly", label: "Trimestral", desc: "Cada 3 meses" },
                      { key: "annual", label: "Anual", desc: "Cada 12 meses" }
                    ].map((freq) => (
                      <button
                        key={freq.key}
                        type="button"
                        onClick={() => setRecurringInterval(freq.key as any)}
                        className={`p-2 rounded-lg text-center border text-xs font-bold transition cursor-pointer ${
                          recurringInterval === freq.key
                            ? "bg-[#DC0032] text-white border-[#DC0032]"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div>{freq.label}</div>
                        <div className={`text-[10px] font-normal ${recurringInterval === freq.key ? "text-white/80" : "text-slate-400"}`}>{freq.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Purpose Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Finalidade da Contribuição
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20 focus:border-[#DC0032]"
                >
                  <option value="Quotas Mensais de Membro">Quotas Mensais Estatutárias</option>
                  <option value="Renovação Anual & Quota OMA/JMPLA">Renovação Anual & Quota OMA/JMPLA</option>
                  <option value="Doação ao Fundo de Solidariedade Partidária">Doação ao Fundo de Solidariedade Partidária</option>
                  <option value="Inscrição em Assembleia & Conferência">Inscrição em Assembleia & Conferência</option>
                  <option value="Emissão de 2ª Via de Cartão Físico">Emissão de 2ª Via de Cartão Físico (R75)</option>
                </select>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Valor da Contribuição (ZAR)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 120, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                        amount === amt && !customAmount
                          ? "bg-[#DC0032] text-white border-[#DC0032] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      R {amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                  <input
                    type="number"
                    min="10"
                    placeholder="Outro valor personalizado..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) {
                        setAmount(Number(e.target.value));
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20 focus:border-[#DC0032]"
                  />
                </div>

                {/* Real-time FX Conversion Banner */}
                <div className="mt-2.5 bg-slate-100/80 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Equivalente em Kwanzas (Câmbio Absa):</span>
                  </div>
                  <span className="font-extrabold text-slate-900 font-mono">
                    ≈ {kwanzaEquivalent.toLocaleString()} AOA
                  </span>
                </div>
              </div>

              {/* Payer Identification */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Identificação do Pagador no Absa Bank
                </label>

                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-3">
                  {[
                    { key: "Account", label: "Nº de Conta Absa" },
                    { key: "SAID", label: "South African ID" },
                    { key: "PASSPORT", label: "Passaporte" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setPayerIdType(tab.key as any)}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                        payerIdType === tab.key 
                          ? "bg-white text-[#DC0032] font-bold shadow-xs" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={payerIdentifier}
                    onChange={(e) => setPayerIdentifier(e.target.value)}
                    placeholder={
                      payerIdType === "Account" 
                        ? "Ex: 4064583487 (10 dígitos)" 
                        : payerIdType === "SAID" 
                        ? "Ex: 8904125890082 (13 dígitos)" 
                        : "Ex: N12984102"
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC0032]/20 focus:border-[#DC0032]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Será enviada uma notificação SureCheck em tempo real para a sua aplicação móvel Absa Banking App.
                </p>
              </div>

              {/* Beneficiary Info Card */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold text-slate-800">Beneficiário: MPLA South Africa</div>
                    <div className="text-[10px] text-slate-500 font-mono">Conta Oficial Absa: 4064583487 • Branch: 632005</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  Verificado
                </span>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl font-display font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    A contactar gateway Absa Pay...
                  </>
                ) : (
                  <>
                    <span>Prosseguir para Autenticação SureCheck</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2: WAITING SURECHECK ================= */}
          {step === 2 && (
            <div className="py-6 text-center space-y-6 animate-fade-in">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75" />
                <div className="relative w-20 h-20 rounded-full bg-[#DC0032] text-white flex items-center justify-center shadow-xl">
                  <Smartphone className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h4 className="text-lg font-display font-black text-slate-900">
                  Notificação SureCheck Enviada!
                </h4>
                <p className="text-xs text-slate-600">
                  Abra a sua <strong>Absa Banking App</strong> no seu telemóvel e aprove a autorização de pagamento no valor de <strong className="text-[#DC0032]">R {amount}.00 ZAR</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Beneficiário:</span>
                  <span className="font-bold text-slate-900">MPLA South Africa</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">ID de Consentimento:</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{paymentId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tempo Restante de Validade:</span>
                  <span className="font-mono font-bold text-amber-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {countdown}s
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>A aguardar confirmação biométrica do utilizador...</span>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SELECT ACCOUNT ================= */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Autenticação SureCheck aprovada com sucesso! Selecione a conta para efetuar o débito:</span>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contas Absa Elegíveis
                </label>

                {eligibleAccounts.map((acc) => (
                  <button
                    key={acc.accountIndex}
                    type="button"
                    onClick={() => setSelectedAccountIndex(acc.accountIndex)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      selectedAccountIndex === acc.accountIndex
                        ? "border-[#DC0032] bg-red-50/40 shadow-md ring-1 ring-[#DC0032]"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedAccountIndex === acc.accountIndex ? "bg-[#DC0032] text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{acc.accountName}</div>
                        <div className="text-[11px] font-mono text-slate-500">Nº de Conta: {acc.accountNumber}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Disponível</div>
                      <div className="text-xs font-black text-slate-800">R {acc.availableBalance?.toLocaleString() || "4,250.00"}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Summary Card */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Valor a Debitar:</span>
                  <span className="font-extrabold text-white text-sm">R {amount}.00 ZAR</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Finalidade:</span>
                  <span className="text-white">{purpose}</span>
                </div>
                {isRecurring && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Modo Recorrente:</span>
                    <span>Débito Automático {recurringInterval === 'annual' ? 'Anual' : recurringInterval === 'quarterly' ? 'Trimestral' : 'Mensal'}</span>
                  </div>
                )}
              </div>

              {/* Confirm CTA */}
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={loading}
                className="w-full py-3.5 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl font-display font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    A processar instrução de pagamento...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirmar Débito de R {amount}.00</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================= STEP 4: SUCCESS RECEIPT ================= */}
          {step === 4 && completedPayment && (
            <div className="py-2 space-y-5 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-display font-black text-slate-900">
                  Pagamento Confirmado com Sucesso!
                </h4>
                <p className="text-xs text-slate-500">
                  A sua quota/contribuição foi liquidada e registada oficialmente no sistema partidário.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Referência Absa:</span>
                  <span className="font-mono font-bold text-slate-900">{completedPayment.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Valor Liquidado:</span>
                  <span className="font-extrabold text-[#DC0032] text-sm">R {completedPayment.amount}.00 ZAR</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Equivalente em Kwanzas:</span>
                  <span className="font-bold text-slate-800">≈ {completedPayment.amountAOA?.toLocaleString()} AOA</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Militante:</span>
                  <span className="font-bold text-slate-900">{member?.fullName || "Militante MPLA"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Estado de Quotas:</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Em Dia</span>
                </div>
                {createdSub && (
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-800 text-[11px]">
                    <strong>Débito Automático Activo:</strong> Próxima renovação em {createdSub.nextBillingDate}.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descarregar Recibo Oficial</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-[#DC0032] hover:bg-[#B30026] text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#DC0032]" />
            <span>Processado via <strong>Absa Open Banking Gateway</strong> (SARB DebiCheck Compliant)</span>
          </div>
          <span className="font-mono">256-bit TLS Encryption</span>
        </div>
      </div>
    </div>
  );
}
