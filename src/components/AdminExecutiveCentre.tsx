import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Users, Map, PieChart, CheckSquare, DollarSign, 
  Activity, Sparkles, AlertTriangle, Percent, ShieldCheck, 
  ChevronRight, Calendar, ArrowUpRight, BarChart3, HelpCircle 
} from "lucide-react";
import { Member } from "../types";

interface ExecutiveCentreProps {
  members: Member[];
}

export default function AdminExecutiveCentre({ members }: ExecutiveCentreProps) {
  // Analytical metrics derived from live members database
  const totalMembers = members.length;
  const activeCount = members.filter(m => m.status === "Active").length;
  const pendingCount = members.filter(m => m.status === "Pending Verification").length;
  const suspendedCount = members.filter(m => m.status === "Suspended").length;
  
  // Outstanding balances & financial metrics
  const totalOutstanding = members.reduce((sum, m) => sum + (m.outstandingBalance || 0), 0);
  const totalCollected = members.length * 150 - totalOutstanding; // Simulated subscription dues collected (R150 base annual renewal fee)
  
  // Provinces and Diaspora Countries list
  const provinces = ["África do Sul", "Portugal", "França", "Reino Unido", "Namíbia", "Bélgica", "Alemanha", "Espanha", "Brasil", "Cuba", "Canadá", "EUA", "Luanda (Angola)"];
  const provinceStats = provinces.map(prov => {
    const count = members.filter(m => m.province === prov || m.province?.includes(prov)).length;
    const percentage = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
    return { name: prov, count, percentage };
  }).sort((a, b) => b.count - a.count);

  // Demographics calculation
  // 1. Gender
  const maleCount = members.filter(m => (m.gender as string) === "Male" || (m.gender as string) === "Masculino").length;
  const femaleCount = members.filter(m => (m.gender as string) === "Female" || (m.gender as string) === "Feminino").length;
  const otherGenderCount = members.filter(m => (m.gender as string) === "Other" || (!["Male", "Female", "Masculino", "Feminino"].includes(m.gender as string))).length;
  
  // 2. Age Ranges (Using 2026 as current year)
  const currentYear = 2026;
  const ageRanges = {
    youth: 0, // 18-35
    middle: 0, // 36-50
    senior: 0 // 51+
  };
  
  members.forEach(m => {
    if (m.dob) {
      const birthYear = parseInt(m.dob.split("-")[0]);
      const age = currentYear - birthYear;
      if (age <= 35) ageRanges.youth++;
      else if (age <= 50) ageRanges.middle++;
      else ageRanges.senior++;
    } else {
      ageRanges.youth++; // Default fallback
    }
  });

  // 3. Top Occupations
  const occupationsMap: { [key: string]: number } = {};
  members.forEach(m => {
    const occ = m.occupation || "Independente";
    occupationsMap[occ] = (occupationsMap[occ] || 0) + 1;
  });
  const topOccupations = Object.entries(occupationsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Card production efficiency metrics
  const printingCount = members.filter(m => (m.physicalCardStatus as string) === "Printing" || (m.physicalCardStatus as string) === "Em Impressão").length;
  const collectedCount = members.filter(m => (m.physicalCardStatus as string) === "Collected" || (m.physicalCardStatus as string) === "Levantado").length;
  const readyCount = members.filter(m => ["Approved", "Ready for Dispatch", "Available for Collection", "Disponível p/ Levantamento"].includes(m.physicalCardStatus as string)).length;
  
  // Engagement and health scores
  const engagementScore = Math.min(100, Math.round((activeCount / (totalMembers || 1)) * 95 + (collectedCount / (totalMembers || 1)) * 5));
  const healthIndex = Math.min(100, Math.round(92 - (pendingCount * 5) - (suspendedCount * 8)));

  // Simulated alerts for Leadership attention
  const [alerts, setAlerts] = useState([
    { id: 1, type: "critical", title: "Verificação de B.I. / Documento de Identidade", desc: "Sistema detetou submissão em validação na fila regional do Comité de Pretória.", time: "há 10 min" },
    { id: 2, type: "warning", title: "Aumento de Inscrições em Western Cape", desc: "Aumento de 24.5% nas inscrições na região do Cabo. Monitorizar stock de cartões.", time: "há 4 horas" },
    { id: 3, type: "info", title: "Cópia de Segurança do Sistema Concluída", desc: "Registo central de dados sincronizado e verificado com 100% de integridade.", time: "Hoje, 06:00" }
  ]);

  return (
    <div className="space-y-6" id="executive-command-centre">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D3122A] animate-pulse" />
            Centro de Comando Executivo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Análise estratégica em tempo real, matrizes demográficas, modelos de distribuição geográfica e estatísticas partidárias.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-[#D3122A] font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-red-500 animate-spin" />
          Núcleo Preditivo Ativo
        </div>
      </div>

      {/* STRATEGIC KPIS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Índice de Engajamento", value: `${engagementScore}%`, desc: "Rácio de militantes ativos com cartão", icon: Activity, progress: engagementScore, color: "text-[#D3122A] bg-red-50" },
          { label: "Saúde Organizacional", value: `${healthIndex}/100`, desc: "Nível de conformidade e verificação", icon: ShieldCheck, progress: healthIndex, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total de Quotas Arrecadadas", value: `R${totalCollected}`, desc: "Fundo de quotas e contribuições", icon: DollarSign, progress: 100 - Math.round((totalOutstanding / (totalCollected + totalOutstanding || 1)) * 100), color: "text-[#D3122A] bg-red-50" },
          { label: "Taxa de Retenção de Militantes", value: "94.2%", desc: "Fidelidade anual dos militantes", icon: Percent, progress: 94.2, color: "text-amber-600 bg-amber-50" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">{kpi.label}</p>
                <h3 className="text-lg font-extrabold font-mono text-slate-800 mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color} shrink-0`}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#D3122A] rounded-full" style={{ width: `${kpi.progress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CORE STATISTICAL GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MEMBERSHIP GROWTH TIMELINE CHART */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
                Crescimento de Militantes (Últimos 6 Meses)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Inscrições agregadas em todas as regiões (Fev - Jul 2026)</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.2% Crescimento Q2
            </span>
          </div>

          {/* Interactive SVG Line Graph */}
          <div className="h-64 flex flex-col justify-between pt-4">
            <div className="relative flex-1">
              {/* SVG Drawing of the Area / Line */}
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D3122A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D3122A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4" />

                {/* Fill Area */}
                <path 
                  d="M0,180 C100,165 200,140 300,95 C400,105 500,60 600,25 L600,200 L0,200 Z" 
                  fill="url(#growthGrad)" 
                />

                {/* Growth Line */}
                <path 
                  d="M0,180 C100,165 200,140 300,95 C400,105 500,60 600,25" 
                  fill="none" 
                  stroke="#D3122A" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="100" cy="165" r="5" fill="#FFFFFF" stroke="#D3122A" strokeWidth="2.5" />
                <circle cx="200" cy="140" r="5" fill="#FFFFFF" stroke="#D3122A" strokeWidth="2.5" />
                <circle cx="300" cy="95" r="5" fill="#FFFFFF" stroke="#D3122A" strokeWidth="2.5" />
                <circle cx="400" cy="105" r="5" fill="#FFFFFF" stroke="#D3122A" strokeWidth="2.5" />
                <circle cx="500" cy="60" r="5" fill="#FFFFFF" stroke="#D3122A" strokeWidth="2.5" />
                <circle cx="580" cy="30" r="6" fill="#D3122A" />
              </svg>

              {/* Float value badge on graph */}
              <div className="absolute right-4 top-2 bg-slate-900 text-white font-mono font-bold text-[9px] px-2 py-1 rounded shadow-md">
                Total Ativo: {activeCount} (Em Direto)
              </div>
            </div>

            {/* Labels under graph */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold border-t border-slate-100 pt-3 px-2">
              <span>FEV (210)</span>
              <span>MAR (285)</span>
              <span>ABR (340)</span>
              <span>MAI (395)</span>
              <span>JUN (450)</span>
              <span>JUL (Atual: {totalMembers})</span>
            </div>
          </div>
        </div>

        {/* GEOGRAPHIC DISTRIBUTION MAP (PROVINCIAL MATRIX) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Map className="w-4.5 h-4.5 text-[#D3122A]" />
              Distribuição Geográfica de Militantes
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Regiões com maior concentração de membros</p>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {provinceStats.map((prov, i) => (
              <div key={prov.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 bg-[#D3122A] rounded-full" />
                    {prov.name}
                  </span>
                  <span className="text-slate-500 font-mono">{prov.count} militantes ({prov.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      i === 0 ? "bg-[#D3122A]" : i === 1 ? "bg-[#FFCC00]" : "bg-slate-400"
                    }`}
                    style={{ width: `${prov.percentage || 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center text-[10px] text-slate-500 leading-relaxed font-mono">
              <strong>Estratégia do Comité Central:</strong> As maiores províncias e comunidades concentram {provinceStats.slice(0, 2).reduce((sum, p) => sum + p.percentage, 0)}% dos delegados na Diáspora.
            </div>
          </div>
        </div>

      </div>

      {/* DEMOGRAPHICS & DISPATCH GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* DEMOGRAPHIC METRICS CARD */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-600" />
              Demografia de Idade e Género
            </h4>
          </div>

          <div className="space-y-4">
            {/* Age Split */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Faixa Etária</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50/50 rounded-lg text-center">
                  <p className="text-xs font-mono font-extrabold text-blue-600">{ageRanges.youth}</p>
                  <p className="text-[9px] text-slate-400 font-medium">Jovens (18-35)</p>
                </div>
                <div className="p-2.5 bg-slate-50/50 rounded-lg text-center">
                  <p className="text-xs font-mono font-extrabold text-indigo-600">{ageRanges.middle}</p>
                  <p className="text-[9px] text-slate-400 font-medium">Adultos (36-50)</p>
                </div>
                <div className="p-2.5 bg-slate-50/50 rounded-lg text-center">
                  <p className="text-xs font-mono font-extrabold text-slate-600">{ageRanges.senior}</p>
                  <p className="text-[9px] text-slate-400 font-medium">Seniores (51+)</p>
                </div>
              </div>
            </div>

            {/* Gender Progress segments */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Distribuição por Género</p>
              <div className="space-y-1.5">
                {[
                  { label: "Masculino", count: maleCount, color: "bg-blue-600" },
                  { label: "Feminino", count: femaleCount, color: "bg-pink-500" },
                  { label: "Outro / Não especificado", count: otherGenderCount, color: "bg-slate-400" }
                ].map((g, idx) => {
                  const percentage = totalMembers > 0 ? Math.round((g.count / totalMembers) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-slate-600 w-28 shrink-0 font-mono">{g.label}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${g.color}`} style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold w-10 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* OCCUPATIONAL DIVERSITY SUMMARY */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Profissões Principais dos Militantes
            </h4>
          </div>

          <div className="space-y-3">
            {topOccupations.map((occ, i) => {
              const pct = totalMembers > 0 ? Math.round((occ.count / totalMembers) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{occ.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Setor profissional</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-extrabold text-blue-700">{occ.count} militantes</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{pct}% do total</p>
                  </div>
                </div>
              );
            })}
            {topOccupations.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">Sem dados de profissão registados.</p>
            )}
          </div>
        </div>

        {/* COMMITTEE PERFORMANCE RANKINGS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D3122A]" />
              Classificação dos Comités Locais
            </h4>
          </div>

          <div className="space-y-2.5">
            {[
              { rank: "★ 1º Lugar", name: "Comité de Johannesburg Central", code: "MPLA-JHB-GP", score: "98.4 / 100", trend: "Em Alta" },
              { rank: "★ 2º Lugar", name: "Comité de Cape Town Central", code: "MPLA-CPT-WC", score: "94.2 / 100", trend: "Estável" },
              { rank: "★ 3º Lugar", name: "Comité de Pretória", code: "MPLA-PTA-TSH", score: "89.5 / 100", trend: "Atenção" }
            ].map((comm, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                    idx === 0 ? "bg-amber-100 text-amber-800" : idx === 1 ? "bg-slate-200 text-slate-700" : "bg-orange-100 text-orange-800"
                  }`}>
                    {comm.rank}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{comm.name}</h5>
                    <p className="text-[9px] text-slate-400 font-mono">{comm.code}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold font-mono text-slate-700">{comm.score}</p>
                  <span className={`text-[8px] font-bold font-mono ${
                    comm.trend === "Em Alta" ? "text-emerald-600" : comm.trend === "Estável" ? "text-blue-600" : "text-rose-500"
                  }`}>
                    {comm.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RE-ALIGNED ALERT CONSOLE & LOGISTICS DISPATCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CRITICAL BULLETIN ALERTS CENTER */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
              Boletins Executivos e Alertas da Direção
            </h3>
            <button 
              onClick={() => setAlerts([])}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Limpar Alertas
            </button>
          </div>

          <div className="space-y-3.5">
            {alerts.map((alt) => (
              <div 
                key={alt.id} 
                className={`p-3.5 rounded-lg border flex items-start gap-3.5 text-xs transition ${
                  alt.type === "critical"
                    ? "bg-rose-50/50 border-rose-100 text-rose-950"
                    : alt.type === "warning"
                    ? "bg-amber-50/50 border-amber-100 text-amber-950"
                    : "bg-slate-50/50 border-slate-100 text-slate-950"
                }`}
              >
                <div className={`p-1 rounded mt-0.5 shrink-0 ${
                  alt.type === "critical" 
                    ? "bg-rose-100 text-rose-700 animate-bounce" 
                    : alt.type === "warning" 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-slate-200 text-slate-700"
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <h4 className="font-extrabold tracking-tight">{alt.title}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">{alt.time}</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">{alt.desc}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-mono text-xs">
                Nenhum alerta crítico ativo no momento.
              </div>
            )}
          </div>
        </div>

        {/* CARD EFFICIENCY AND DISPATCH LATENCY */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <CheckSquare className="w-4.5 h-4.5 text-blue-600" />
              Eficiência e Prazos de Emissão de Cartões
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Métricas de tempo médio de processamento e entrega aos comités</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold">Tempo Médio de Impressão</span>
              <p className="text-xl font-extrabold font-mono text-slate-800 leading-none">1.8 dias</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold font-mono">
                <span>⚡ -12% do prazo previsto</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold">Taxa de Sucesso na Entrega</span>
              <p className="text-xl font-extrabold font-mono text-slate-800 leading-none">99.2%</p>
              <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold font-mono">
                <span>🛡️ Entregas no prazo</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold">Fases do Lote de Produção</p>
            <div className="space-y-2 text-xs font-semibold font-mono text-slate-600">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
                <span>Fila de Impressão Térmica</span>
                <span className="text-blue-600 font-bold">{printingCount} cartões pendentes</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
                <span>Inspeção e Controlo de Qualidade</span>
                <span className="text-indigo-600 font-bold">{readyCount} lotes aprovados</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
                <span>Cartões Levantados pelos Militantes</span>
                <span className="text-slate-600 font-bold">{collectedCount} entregas concluídas</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
