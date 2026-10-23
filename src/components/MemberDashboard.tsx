import React, { useState } from "react";
import { Member, Announcement, PartyEvent, SurveyPoll } from "../types";
import { 
  Bell, Newspaper, Calendar, Vote, CreditCard, Users, 
  MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle, 
  AlertTriangle, DollarSign, Send, HelpCircle, Award, LayoutDashboard, ChevronRight
} from "lucide-react";

interface MemberDashboardProps {
  member: Member;
  announcements: Announcement[];
  events: PartyEvent[];
  polls: SurveyPoll[];
  onRegisterEvent: (eventId: string) => void;
  onCastVote: (pollId: string, option: string) => void;
  onMakePayment: (amount: number, purpose: string, method: string) => void;
  onChangeTab: (tab: string) => void;
}

export default function MemberDashboard({
  member,
  announcements,
  events,
  polls,
  onRegisterEvent,
  onCastVote,
  onMakePayment,
  onChangeTab
}: MemberDashboardProps) {
  // Payment states
  const [payAmount, setPayAmount] = useState<number>(member.outstandingBalance);
  const [payPurpose, setPayPurpose] = useState<string>("Monthly Dues");
  const [payMethod, setPayMethod] = useState<string>("Credit Card");
  const [paySuccess, setPaySuccess] = useState<boolean>(false);
  const [activeAnnFilter, setActiveAnnFilter] = useState<string>("All");

  const filteredAnnouncements = announcements.filter(a => {
    if (activeAnnFilter === "All") return true;
    return a.source === activeAnnFilter;
  });

  const isBirthdayToday = (() => {
    if (!member.dob) return false;
    const today = new Date();
    const currentMMDD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const dobParts = member.dob.split("-");
    let memberMMDD = "";
    if (dobParts.length === 3) memberMMDD = `${dobParts[1]}-${dobParts[2]}`;
    else if (dobParts.length === 2) memberMMDD = `${dobParts[0]}-${dobParts[1]}`;
    return memberMMDD === currentMMDD;
  })();

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    onMakePayment(payAmount, payPurpose, payMethod);
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setPayAmount(member.outstandingBalance);
    }, 4000);
  };

  return (
    <div className="space-y-8" id="member-dashboard">
      {/* Birthday Congratulatory Banner */}
      {isBirthdayToday && (
        <div className="bg-gradient-to-r from-amber-500 via-red-600 to-amber-600 p-5 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-300/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="text-3xl bg-white/20 p-3 rounded-2xl backdrop-blur-xs shrink-0">🎂</div>
            <div>
              <h3 className="font-display font-black text-lg">Parabéns, Camarada {member.fullName}! 🎉</h3>
              <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
                O Comité do MPLA CAPE deseja-lhe um Feliz Aniversário repleto de saúde, paz e sucessos. A sua carta oficial de felicitações foi emitido pelo Serviço Automático de Aniversários!
              </p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("documents")}
            className="px-4 py-2.5 bg-white text-[#D3122A] hover:bg-amber-50 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
          >
            Ver Carta de Felicitações
          </button>
        </div>
      )}

      {/* Welcome & Member HUD Card */}
      <div className="bg-gradient-to-br from-slate-900 via-[#121A2A] to-red-950 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800 animate-fade-in">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-[#D3122A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-64 h-64 bg-[#FFCC00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
            <div className="relative">
              <img 
                src={member.photo} 
                alt={member.fullName} 
                className="w-24 h-24 rounded-full object-cover border-4 border-[#FFCC00] shadow-xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-5.5 h-5.5 bg-emerald-500 border-3 border-slate-900 rounded-full flex items-center justify-center shadow-md" title="Membro Ativo">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-2xl font-display font-black tracking-tight text-white">{member.fullName}</h2>
                <span className="px-3 py-1 bg-[#D3122A] text-white border border-[#D3122A]/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  Nível {member.membershipLevel}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-mono tracking-medium">Cartão de Membro: {member.membershipNo} • Registado: {member.registrationDate}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-300 justify-center sm:justify-start">
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg"><MapPin className="w-3.5 h-3.5 text-[#FFCC00]" /> {member.committee}</span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg"><ShieldCheck className="w-3.5 h-3.5 text-[#FFCC00]" /> Província: {member.province}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            {member.outstandingBalance > 0 ? (
              <div className="bg-[#FFCC00]/10 border border-[#FFCC00]/30 rounded-2xl p-4.5 flex items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] text-[#FFCC00] font-mono tracking-wider uppercase font-bold">Quotas em Atraso</p>
                  <p className="text-2xl font-display font-black text-[#FFCC00] font-mono">R{member.outstandingBalance}</p>
                </div>
                <button 
                  onClick={() => {
                    const el = document.getElementById("payment-section");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 bg-[#FFCC00] hover:bg-yellow-500 active:bg-yellow-600 transition-all text-slate-950 rounded-xl text-xs font-black shadow-md shadow-yellow-500/20 cursor-pointer"
                >
                  Pagar Quotas
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4.5 flex items-center gap-3.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Mensalidades em Dia</p>
                  <p className="text-xs font-bold text-slate-200">Sem pagamentos pendentes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Ver Cartão Digital", icon: CreditCard, color: "text-[#D3122A] bg-red-50 hover:bg-red-100/70 border-red-100", tab: "dashboard" },
          { label: "Editar Meu Perfil", icon: Users, color: "text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200", tab: "profile" },
          { label: "Suporte Técnico", icon: HelpCircle, color: "text-amber-700 bg-amber-50 hover:bg-amber-100/70 border-amber-100", tab: "tickets" },
          { label: "Módulos de Estudo", icon: Award, color: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100", tab: "learning" },
          { label: "Mensagem ao Comité", icon: Send, color: "text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200", tab: "tickets" },
          { label: "Consultas Públicas", icon: Vote, color: "text-[#D3122A] bg-red-50 hover:bg-red-100/70 border-red-100", actionId: "consult-grid" }
        ].map((act, index) => (
          <button
            key={index}
            onClick={() => {
              if (act.tab) {
                onChangeTab(act.tab);
                if (act.tab === "dashboard") {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              } else if (act.actionId) {
                const el = document.getElementById(act.actionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200 group hover:-translate-y-1 hover:shadow-xs cursor-pointer ${act.color}`}
          >
            <act.icon className="w-5 h-5 mb-2.5 group-hover:scale-110 transition duration-300" />
            <span className="text-xs font-bold text-slate-800 leading-tight">{act.label}</span>
          </button>
        ))}
      </div>

      {/* Announcements and Consultations Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Announcements & News */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#D3122A]" />
              <h3 className="text-lg font-display font-extrabold text-slate-900">Anúncios & Comunicados Oficiais</h3>
            </div>
            {/* Source Filters */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {["All", "National", "Regional", "Local"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveAnnFilter(lvl)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeAnnFilter === lvl 
                      ? "bg-white text-[#D3122A] font-bold shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lvl === "All" ? "Todos" : lvl === "National" ? "Nacional" : lvl === "Regional" ? "Regional" : "Local"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((ann) => (
                <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#D3122A]/35 transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${
                        ann.category === "Emergency" ? "bg-rose-50 text-rose-700 border-rose-100" :
                        ann.category === "Campaign" ? "bg-red-50 text-[#D3122A] border-red-100" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {ann.category === "Emergency" ? "Urgente" : ann.category === "Campaign" ? "Campanha" : "Informativo"}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {ann.date}
                      </p>
                    </div>
                    <h4 className="font-display font-black text-slate-900 text-base mt-3 leading-snug">{ann.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3.5 mt-5 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span className="text-[#D3122A] font-extrabold bg-red-50 px-2.5 py-0.5 rounded border border-red-100/50">Origem: Comité {ann.source === "National" ? "Nacional" : ann.source === "Regional" ? "Regional" : "Local"}</span>
                    <span className="font-medium text-slate-500">Autor: {ann.author}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-500 font-medium">Nenhum anúncio encontrado com os filtros activos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Consultation Polls & Quick Payments */}
        <div className="lg:col-span-4 space-y-6">
          {/* Consultation Polls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4" id="consult-grid">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Vote className="w-5 h-5 text-[#D3122A]" />
              <h3 className="font-display font-extrabold text-slate-900 text-base">Sondagens Activas</h3>
            </div>

            <div className="space-y-6">
              {polls.map((poll) => {
                const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                const hasVoted = poll.votedMemberIds.includes(member.id);
                const votedOption = member.votedPolls?.[poll.id];

                return (
                  <div key={poll.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{poll.title}</h4>
                      {poll.isAnonymous && (
                        <span className="text-[8px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-400 uppercase font-mono font-bold tracking-wider shrink-0">
                          Anónima
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">{poll.description}</p>

                    <div className="mt-4 space-y-2.5">
                      {poll.options.map((opt) => {
                        const optVotes = poll.votes[opt] || 0;
                        const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        const isSelected = votedOption === opt;

                        return (
                          <div key={opt}>
                            {hasVoted ? (
                              /* Voted State (Results view) */
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                                  <span className={isSelected ? "font-extrabold text-[#D3122A]" : ""}>{opt}</span>
                                  <span className="font-mono">{percent}% ({optVotes})</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isSelected ? "bg-[#D3122A]" : "bg-slate-300"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              /* Active Voting Buttons */
                              <button
                                onClick={() => onCastVote(poll.id, opt)}
                                className="w-full text-left px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 transition rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex justify-between items-center group"
                              >
                                <span>{opt}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D3122A] group-hover:translate-x-0.5 transition" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4 pt-2">
                      <span>Total Votos: {totalVotes}</span>
                      {hasVoted ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3.5 h-3.5" /> Submetido
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">Pendente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Payments Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4" id="payment-section">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-[#D3122A]" />
              <h3 className="font-display font-extrabold text-slate-900 text-base">Pagamento de Mensalidades</h3>
            </div>

            {paySuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center text-emerald-800 space-y-2 animate-fade-in">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold">Pagamento Efectuado!</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Recibo gerado com sucesso. Foi enviado um comprovativo detalhado para o seu e-mail registado.</p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold mb-1.5">Finalidade</label>
                  <select 
                    value={payPurpose} 
                    onChange={(e) => setPayPurpose(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none font-semibold text-slate-700"
                  >
                    <option value="Monthly Dues">Quotas Mensais de Membro</option>
                    <option value="Annual Membership Renewal">Renovação de Inscrição Anual</option>
                    <option value="Donation">Doação ao Fundo Geral do Partido</option>
                    <option value="Event Contribution">Contribuição para Plenário Nacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold mb-1.5">Valor (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-xs font-bold">R</span>
                    <input 
                      type="number" 
                      value={payAmount} 
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none font-mono font-bold text-slate-800"
                      placeholder="Valor"
                      min="10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold mb-1.5">Método de Pagamento</label>
                  <select 
                    value={payMethod} 
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none font-semibold text-slate-700"
                  >
                    <option value="Credit Card">Cartão de Crédito / Débito</option>
                    <option value="EFT">Transferência Bancária Directa (EFT)</option>
                    <option value="Mobile Money">Dinheiro Móvel (M-Pesa / MTN)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={member.outstandingBalance === 0 && payPurpose !== "Donation"}
                  className="w-full py-3 bg-[#D3122A] hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-100/50 cursor-pointer"
                >
                  Confirmar e Pagar Online
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
