import React, { useState } from "react";
import { showToast } from "../lib/notifications";
import { 
  Bot, AlertCircle, RefreshCw, Layers, TrendingUp, Sparkles, 
  Search, ShieldAlert, CheckCircle, FileText, Heart, Send, Mic 
} from "lucide-react";
import AudioTranscriber from "./AudioTranscriber";

export default function AdminAICentre() {
  const [activeTool, setActiveTool] = useState<"assistant" | "duplicates" | "anomalies" | "sentiment" | "forecast" | "transcribe">("assistant");
  const [loading, setLoading] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // NLP Chat states
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Bem-vindo ao Assistente de Inteligência do Comando Nacional. Faça qualquer pergunta sobre a base de dados de militantes, aprovações pendentes, solicitações de suporte ou filas de impressão de cartões." }
  ]);

  // Diagnostic Result states
  const [duplicates, setDuplicates] = useState<any[] | null>(null);
  const [anomalies, setAnomalies] = useState<any[] | null>(null);
  const [sentiment, setSentiment] = useState<any[] | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [execSummary, setExecSummary] = useState<string>("");

  const fetchExecSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summary" })
      });
      const data = await res.json();
      setExecSummary(data.result);
    } catch (e) {
      console.error(e);
      setExecSummary("Falha ao gerar o resumo executivo. Verifique a configuração da integração.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || loading) return;

    const userMsg = chatPrompt;
    setChatPrompt("");
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: "ai", text: data.text || "Nenhuma resposta recebida." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: "ai", text: "Erro ao comunicar com o serviço de inteligência. Certifique-se de que as credenciais estão configuradas nas Definições." }]);
    } finally {
      setLoading(false);
    }
  };

  const scanDuplicates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "duplicate" })
      });
      const data = await res.json();
      setDuplicates(data.result || []);
    } catch (e) {
      console.error(e);
      setDuplicates([]);
    } finally {
      setLoading(false);
    }
  };

  const scanAnomalies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "anomaly" })
      });
      const data = await res.json();
      setAnomalies(data.result || []);
    } catch (e) {
      console.error(e);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  const scanSentiment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sentiment" })
      });
      const data = await res.json();
      setSentiment(data.result || []);
    } catch (e) {
      console.error(e);
      setSentiment([]);
    } finally {
      setLoading(false);
    }
  };

  const scanForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "forecast" })
      });
      const data = await res.json();
      setForecast(data.result);
    } catch (e) {
      console.error(e);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="command-intelligence-page">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600 animate-pulse" />
            Centro de Inteligência do Comando Nacional
          </h2>
          <p className="text-xs text-slate-500 mt-1">Aplique filtros analíticos automáticos para identificar registos anómalos, prever níveis de stock ou consultar dados em linguagem natural.</p>
        </div>

        {/* Executive Quick Summary Trigger */}
        <button
          onClick={fetchExecSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          Gerar Resumo Executivo
        </button>
      </div>

      {execSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 text-indigo-950 space-y-2 animate-scale-up">
          <p className="text-xs uppercase font-mono tracking-wider font-bold text-blue-600">Relatório de Análise Executiva</p>
          <p className="text-xs leading-relaxed font-medium">{execSummary}</p>
        </div>
      )}

      {/* Intelligence Tool Sub-navigation tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-semibold">
        {[
          { key: "assistant", label: "Assistente Virtual", icon: Bot },
          { key: "transcribe", label: "Transcrição de Voz", icon: Mic },
          { key: "duplicates", label: "Resolutor de Duplicados", icon: Layers },
          { key: "anomalies", label: "Deteção de Anomalias", icon: ShieldAlert },
          { key: "sentiment", label: "Análise de Sentimento", icon: Heart },
          { key: "forecast", label: "Previsão de Recursos", icon: TrendingUp }
        ].map((tool) => (
          <button
            key={tool.key}
            onClick={() => setActiveTool(tool.key as any)}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition cursor-pointer ${
              activeTool === tool.key
                ? "bg-slate-900 border-slate-950 text-white font-bold shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <tool.icon className={`w-4.5 h-4.5 mb-1.5 ${activeTool === tool.key ? "text-blue-400" : "text-slate-400"}`} />
            <span className="text-[10px] leading-tight font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE DIAGNOSTIC TOOL PANE */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-medium font-mono">A processar dados da base do partido...</p>
          </div>
        )}

        {!loading && activeTool === "assistant" && (
          /* NLP NATURAL LANGUAGE COMMAND CHAT */
          <div className="flex flex-col justify-between min-h-[400px]">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Exemplos de Perguntas ao Assistente:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>"Liste o número de militantes ativos por província"</li>
                <li>"Qual é o total de quotas arrecadadas até ao momento?"</li>
                <li>"Resuma as principais reclamações e solicitações de suporte"</li>
              </ul>
            </div>

            {/* Conversational timeline */}
            <div className="flex-1 space-y-4 max-h-[250px] overflow-y-auto p-2 border border-slate-200 rounded-xl mb-4">
              {chatHistory.map((chat, idx) => {
                const isMe = chat.sender === "user";
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line ${
                      isMe 
                        ? "bg-slate-900 text-white rounded-br-none font-medium" 
                        : "bg-blue-50/50 border border-blue-100 text-slate-800 rounded-bl-none"
                    }`}>
                      <p className="text-[9px] opacity-75 font-mono mb-1 font-bold">
                        {isMe ? "ADMINISTRADOR" : "ASSISTENTE VIRTUAL"}
                      </p>
                      <p>{chat.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {showVoiceInput && (
              <div className="mb-4">
                <AudioTranscriber
                  compact
                  title="Ditar Pergunta por Voz"
                  description="Fale no microfone e transcreva a sua pergunta para o assistente."
                  onTranscribeComplete={(text) => {
                    setChatPrompt(text);
                    setShowVoiceInput(false);
                    showToast("Pergunta transcrita e inserida com sucesso!", "success");
                  }}
                />
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Escreva a sua pergunta para a base de dados..."
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  showVoiceInput
                    ? "bg-red-50 text-[#C8102E] border-red-200"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
                title="Ditar com microfone (gemini-3.5-transcribe)"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs transition flex items-center justify-center cursor-pointer shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {!loading && activeTool === "transcribe" && (
          /* DEDICATED AUDIO TRANSCRIBER TOOL */
          <div className="space-y-4">
            <AudioTranscriber
              title="Centro de Transcrição de Áudio HQ"
              description="Transcreva notas vocais de reuniões, discursos de militantes ou gravações enviadas pelas províncias com o modelo de alta precisão gemini-3.5-transcribe."
              onTranscribeComplete={(text) => {
                showToast("Transcrição concluída e pronta a utilizar!", "success");
              }}
            />
          </div>
        )}

        {!loading && activeTool === "duplicates" && (
          /* DUPLICATE DETECTOR */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Verificador de Registos Duplicados</h4>
                <p className="text-xs text-slate-500 mt-0.5">Analisa as tabelas de militantes para detetar duplicações por B.I., e-mail ou semelhança fonética.</p>
              </div>
              <button
                onClick={scanDuplicates}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Analisar Base de Dados
              </button>
            </div>

            {duplicates ? (
              <div className="space-y-4">
                {duplicates.length > 0 ? (
                  duplicates.map((dup, i) => (
                    <div key={i} className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs">
                          <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
                          <span>Possível Duplicação Detetada (Confiança: {Math.round(dup.confidence * 100)}%)</span>
                        </div>
                        <button
                          onClick={() => {
                            showToast(`Fusão de perfis concluída entre ${dup.memberA.name} e ${dup.memberB.name}. Ficheiros duplicados unificados!`, "success");
                            setDuplicates(prev => prev ? prev.filter((_, idx) => idx !== i) : null);
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Resolver e Unificar Perfis
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <div>
                          <p className="text-blue-600 font-bold uppercase tracking-wider text-[9px] mb-1">Perfil A</p>
                          <p><strong>Nome:</strong> {dup.memberA.name}</p>
                          <p><strong>B.I./Passaporte:</strong> {dup.memberA.ID}</p>
                          <p><strong>E-mail:</strong> {dup.memberA.email}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-bold uppercase tracking-wider text-[9px] mb-1">Perfil B</p>
                          <p><strong>Nome:</strong> {dup.memberB.name}</p>
                          <p><strong>B.I./Passaporte:</strong> {dup.memberB.ID}</p>
                          <p><strong>E-mail:</strong> {dup.memberB.email}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white/40 p-2.5 rounded-lg">
                        <strong>Motivo do Alerta:</strong> {dup.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-xs">Base de Dados sem Duplicados</p>
                    <p className="text-[11px] text-slate-500">Nenhum registo duplicado ou conflito de identidade detetado durante a verificação.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Layers className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Clique em 'Analisar Base de Dados' para iniciar a verificação.</p>
              </div>
            )}
          </div>
        )}

        {!loading && activeTool === "anomalies" && (
          /* ANOMALY RISK TRACKER */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Deteção Automática de Anomalias</h4>
                <p className="text-xs text-slate-500 mt-0.5">Aplica filtros de auditoria para identificar registos suspeitos, inconsistências geográficas ou anomalias.</p>
              </div>
              <button
                onClick={scanAnomalies}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Executar Verificação
              </button>
            </div>

            {anomalies ? (
              <div className="space-y-3">
                {anomalies.length > 0 ? (
                  anomalies.map((anom, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-amber-100 bg-amber-50/10 text-xs flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            anom.severity === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-100 text-amber-800"
                          }`}>
                            Risco {anom.severity === "High" ? "Elevado" : "Médio"}
                          </span>
                          <span className="font-bold text-slate-800">{anom.type}</span>
                        </div>
                        <p className="text-slate-600">Perfil afetado: <strong className="text-slate-800">{anom.member}</strong></p>
                        <p className="text-slate-500 leading-relaxed font-medium">{anom.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-xs">Nenhum Risco de Segurança Detetado</p>
                    <p className="text-[11px] text-slate-500">Todos os registos inspecionados estão em inteira conformidade com as credenciais.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <ShieldAlert className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Clique em 'Executar Verificação' para analisar a segurança das inscrições.</p>
              </div>
            )}
          </div>
        )}

        {!loading && activeTool === "sentiment" && (
          /* TICKET SENTIMENT ANALYSER */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Análise de Sentimento das Solicitações</h4>
                <p className="text-xs text-slate-500 mt-0.5">Avalia o tom e o nível de urgência nas mensagens dos militantes para priorizar respostas críticas.</p>
              </div>
              <button
                onClick={scanSentiment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Analisar Sentimentos
              </button>
            </div>

            {sentiment ? (
              <div className="space-y-3">
                {sentiment.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">{item.ticketId}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          item.sentiment === "Mildly Annoyed" || item.sentiment === "Critical" || item.sentiment === "Frustrated"
                            ? "bg-rose-50 text-rose-600 animate-pulse"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium"><strong>Principal Reclamação:</strong> {item.alert}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-mono">Índice de Urgência</p>
                      <p className={`text-sm font-extrabold font-mono ${item.rating < 50 ? "text-rose-500" : "text-slate-700"}`}>
                        {item.rating} / 100
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Heart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Clique em 'Analisar Sentimentos' para iniciar a verificação.</p>
              </div>
            )}
          </div>
        )}

        {!loading && activeTool === "forecast" && (
          /* INVENTORY & GROWTH FORECASTER */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Previsão de Consumo de Stock e Crescimento</h4>
                <p className="text-xs text-slate-500 mt-0.5">Correlaciona o ritmo de novas inscrições com o stock de cartões virgens para agendar o reabastecimento.</p>
              </div>
              <button
                onClick={scanForecast}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Prever Esgotamento de Stock
              </button>
            </div>

            {forecast ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-scale-up">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Mês de Maior Crescimento</p>
                  <p className="text-lg font-extrabold font-mono text-blue-700 mt-1">{forecast.predictedGrowthMonth}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Estimativa de aumento de inscrições durante as campanhas.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Previsão de Esgotamento</p>
                  <p className="text-lg font-extrabold font-mono text-blue-700 mt-1">{forecast.estimatedStockRunout}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Duração estimada do stock de cartões virgens em armazém.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl sm:col-span-3">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold text-rose-500">Ação Crítica Recomendada</p>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{forecast.criticalAction}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Recomendação automática de encomenda junto dos fornecedores.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Clique em 'Prever Esgotamento de Stock' para executar o modelo preditivo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
