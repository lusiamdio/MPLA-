import React, { useState } from "react";
import { Member, SupportTicket, ChatChannel, ChatMessage } from "../types";
import { 
  Plus, MessageSquare, Clock, Send, ShieldAlert, CheckCircle, 
  User, RefreshCw, FileText, Search, CornerDownRight, Inbox, HelpCircle
} from "lucide-react";

interface MemberTicketsProps {
  member: Member;
  tickets: SupportTicket[];
  chatChannels: ChatChannel[];
  onSubmitTicket: (type: SupportTicket["type"], description: string) => void;
  onSubmitTicketReply: (ticketId: string, text: string) => void;
  onSubmitChatMessage: (channelId: string, text: string) => void;
}

export default function MemberTickets({
  member,
  tickets,
  chatChannels,
  onSubmitTicket,
  onSubmitTicketReply,
  onSubmitChatMessage
}: MemberTicketsProps) {
  // Navigation: Tickets vs Live Chat
  const [activePane, setActivePane] = useState<"tickets" | "livechat">("tickets");

  // Ticket states
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [newTicketType, setNewTicketType] = useState<SupportTicket["type"]>("General Inquiry");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Live Chat states
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(chatChannels[0]?.id || null);
  const [chatInputText, setChatInputText] = useState("");

  const activeTicket = tickets.find(t => t.id === selectedTicketId);
  const activeChannel = chatChannels.find(c => c.id === selectedChannelId);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketDesc.trim()) return;
    onSubmitTicket(newTicketType, newTicketDesc);
    setNewTicketDesc("");
    setTicketModalOpen(false);
  };

  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicketId) return;
    onSubmitTicketReply(selectedTicketId, ticketReplyText);
    setTicketReplyText("");
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedChannelId) return;
    onSubmitChatMessage(selectedChannelId, chatInputText);
    setChatInputText("");

    // Simulate an automatic response from the committee or helpdesk after 2 seconds!
    const channelType = activeChannel?.type;
    setTimeout(() => {
      let automatedResponse = "Recebemos a sua mensagem. Um coordenador irá rever o seu pedido em breve.";
      if (channelType === "Local Committee") {
        automatedResponse = `Olá, obrigado por contactar o Comité do Ward 117. O seu representante local já foi notificado da sua consulta: "${chatInputText.slice(0, 30)}...". Estamos disponíveis para atendimento presencial aos sábados!`;
      } else if (channelType === "National Helpdesk") {
        automatedResponse = `Auto-Resposta Helpdesk Nacional: Agradecemos o seu contacto. A sua consulta foi registada na fila de prioridade com o número de membro: ${member.membershipNo}.`;
      }
      // Push direct to mock channel
      if (activeChannel) {
        activeChannel.messages.push({
          sender: "admin",
          senderName: channelType === "Local Committee" ? "Líder de Comité (Naledi)" : "Oficial de Apoio HQ",
          text: automatedResponse,
          timestamp: new Date().toISOString()
        });
        // Force refresh state via an arbitrary trigger or let parent update
        onSubmitChatMessage(selectedChannelId, ""); // empty submit triggers update
      }
    }, 2000);
  };

  return (
    <div className="space-y-6" id="tickets-support-page">
      {/* Pane Switcher header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D3122A]" />
            Centro de Apoio & Comunicação
          </h2>
          <p className="text-xs text-slate-500 mt-1">Submeta pedidos de suporte, relate perda de cartões, ou converse directamente com representantes.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold self-stretch md:self-auto">
          <button
            onClick={() => setActivePane("tickets")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
              activePane === "tickets" 
                ? "bg-white text-[#D3122A] font-bold shadow-xs border border-slate-200/30" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Tickets de Suporte ({tickets.length})
          </button>
          <button
            onClick={() => setActivePane("livechat")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
              activePane === "livechat" 
                ? "bg-white text-emerald-600 font-bold shadow-xs border border-slate-200/30" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Mensagens Diretas ({chatChannels.length})
          </button>
        </div>
      </div>

      {activePane === "tickets" ? (
        /* SUPPORT TICKETS LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ticket Listing Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono">Meus Tickets Recentes</h3>
              <button
                onClick={() => setTicketModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-2 bg-[#D3122A] hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo Ticket
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedTicketId === t.id
                        ? "bg-red-50/50 border-[#D3122A]/30 ring-1 ring-[#D3122A]/20"
                        : "bg-white border-slate-200 hover:border-[#D3122A]/40"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{t.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                        t.status === "Open" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        t.status === "In Progress" ? "bg-red-50 text-[#D3122A] border border-red-100" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {t.status === "Open" ? "Aberto" : t.status === "In Progress" ? "Em Curso" : "Resolvido"}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-slate-800 text-sm mt-3 leading-snug">
                      {t.type}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
                      <span className="font-medium text-slate-500">Técnico: {t.assignedOfficer}</span>
                      <span className="flex items-center gap-1 text-[#D3122A] bg-red-50/50 px-2 py-0.5 rounded"><Clock className="w-3.5 h-3.5" /> SLA: {t.estResolutionTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Não possui nenhum ticket de suporte activo.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Dialogue Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[500px]">
            {activeTicket ? (
              <div className="flex flex-col h-full justify-between">
                {/* Dialogue Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Nº de Registo de Suporte: {activeTicket.id}</p>
                      <h3 className="font-display font-bold text-slate-900 mt-1.5 text-base">{activeTicket.type}</h3>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                      Criado em: {new Date(activeTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-600 mt-4 leading-relaxed relative">
                    <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#D3122A] rounded-full" />
                      Descrição do Problema Reportado
                    </p>
                    <p className="italic font-medium">"{activeTicket.description}"</p>
                  </div>
                </div>

                {/* Chat/Reply thread */}
                <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[300px]">
                  {activeTicket.replies.length > 0 ? (
                    activeTicket.replies.map((reply, i) => {
                      const isMe = reply.sender === "member";
                      return (
                        <div key={i} className={`flex gap-2.5 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe 
                              ? "bg-slate-800 text-white rounded-tr-none" 
                              : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50"
                          }`}>
                            <p className="text-[9px] opacity-75 font-mono mb-1 font-bold">{reply.senderName}</p>
                            <p className="font-medium">{reply.text}</p>
                            <p className="text-[8px] opacity-50 font-mono text-right mt-1.5">
                              {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2 h-full">
                      <Clock className="w-8 h-8 text-[#D3122A] animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">A aguardar resposta do oficial de registo...</p>
                      <p className="text-[10px] text-slate-400 font-mono">Standard SLA de resolução do comité: {activeTicket.estResolutionTime}</p>
                    </div>
                  )}
                </div>

                {/* Reply Input Form */}
                <form onSubmit={handleTicketReply} className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      placeholder="Escreva uma resposta para o técnico ou envie notas adicionais..."
                      className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D3122A] hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400 flex flex-col items-center justify-center gap-3 h-full">
                <FileText className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-bold text-slate-800">Nenhum Ticket Seleccionado</p>
                <p className="text-xs max-w-xs leading-relaxed">Seleccione um ticket de suporte na lista lateral para ver a conversa ou abra um novo pedido oficial.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LIVE COMMITTEE MESSAGING LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chat Channels Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono px-1">Canais Oficiais Disponíveis</h3>
            <div className="space-y-3">
              {chatChannels.map((ch) => {
                const lastMsg = ch.messages[ch.messages.length - 1];
                const isSelected = selectedChannelId === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChannelId(ch.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                      isSelected
                        ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200"
                        : "bg-white border-slate-200 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${ch.type === 'Local Committee' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                        {ch.type === 'Local Committee' ? 'Comité Local' : 'Helpdesk Nacional'}
                      </h4>
                      <span className="text-[8px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">Ligado</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2.5 truncate font-medium">
                      {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : "Sem mensagens ainda"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conversational thread */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[500px]">
            {activeChannel ? (
              <div className="flex flex-col h-full justify-between">
                {/* Channel Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm">
                        {activeChannel.type === 'Local Committee' ? 'Comité Local - Ward 117' : 'Helpdesk Nacional'}
                      </h4>
                      <p className="text-[10px] text-slate-500">Canal de comunicação directo e encriptado</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded">SSL Seguro</span>
                </div>

                {/* Messages Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[300px]">
                  {activeChannel.messages.map((msg, idx) => {
                    const isMe = msg.sender === "member";
                    return (
                      <div key={idx} className={`flex gap-2.5 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMe 
                            ? "bg-emerald-600 text-white rounded-br-none" 
                            : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50"
                        }`}>
                          <p className="text-[9px] opacity-75 font-mono mb-1 font-bold">{msg.senderName}</p>
                          <p className="font-medium">{msg.text}</p>
                          <p className="text-[8px] opacity-50 font-mono text-right mt-1.5">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Text box */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={`Escreva uma mensagem de consulta segura para o canal...`}
                      className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400 flex flex-col items-center justify-center gap-3 h-full">
                <MessageSquare className="w-12 h-12 text-slate-200 animate-bounce" />
                <p className="text-sm font-bold text-slate-800">Seleccione uma Conversa</p>
                <p className="text-xs">Escolha um dos canais activos ao lado para se corresponder com oficiais.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL WINDOW */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4 animate-scale-up">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-display font-extrabold text-slate-900 text-base">Abrir Novo Ticket de Suporte</h3>
              <p className="text-xs text-slate-500 mt-1">Envie o seu problema oficial. Um técnico de suporte nacional será designado.</p>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Categoria do Pedido</label>
                <select
                  value={newTicketType}
                  onChange={(e) => setNewTicketType(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition font-semibold text-slate-700"
                >
                  <option value="Profile Correction">Correcção de Dados do Perfil</option>
                  <option value="Lost Card Report">Relatar Cartão de Membro Perdido</option>
                  <option value="Card Replacement">Solicitar Segunda Via do Cartão Físico</option>
                  <option value="General Inquiry">Consulta Geral de Ajuda</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Detalhes & Explicações</label>
                <textarea
                  rows={4}
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  placeholder="Explique o seu problema de forma clara. Se houver dados incorretos no cartão, por favor especifique os corretos..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none resize-none transition"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 text-xs font-bold border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D3122A] hover:bg-red-700 text-white rounded-xl transition cursor-pointer shadow-md shadow-red-100"
                >
                  Submeter Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
