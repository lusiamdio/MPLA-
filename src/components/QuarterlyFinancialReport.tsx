import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { 
  TrendingUp, Calendar, ArrowUpRight, DollarSign, Wallet, 
  PieChart as PieIcon, BarChart3, CheckCircle2, Target, Download,
  Layers, RefreshCw, Filter, Sparkles, Building2
} from "lucide-react";

interface QuarterlyReportData {
  year: number;
  fxRateApplied: number;
  totalYearZAR: number;
  totalYearAOA: number;
  totalYearTargetZAR: number;
  overallAchievementRate: number;
  quarters: {
    quarter: string;
    label: string;
    totalZAR: number;
    totalAOA: number;
    targetZAR: number;
    targetAOA: number;
    achievementRate: number;
    absaPay: number;
    debiCheck: number;
    card: number;
    militantesCount: number;
    growthQoQ: number;
  }[];
  monthlyTrends: {
    month: string;
    quarter: string;
    year: number;
    absaPayEFT: number;
    absaDebiCheck: number;
    virtualCard: number;
    totalZAR: number;
    totalAOA: number;
    targetZAR: number;
    militantesPaid: number;
    achievementPercent: number;
  }[];
  provincialShare: {
    province: string;
    totalZAR: number;
    percentage: number;
    color: string;
  }[];
  syncedAt: string;
}

const COLORS = ["#DC0032", "#F59E0B", "#10B981", "#6366F1", "#8B5CF6"];

export default function QuarterlyFinancialReport() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>("ALL");
  const [data, setData] = useState<QuarterlyReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/absa/reports/quarterly?year=${selectedYear}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Erro ao carregar relatório trimestral:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedYear]);

  if (loading || !data) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#DC0032] animate-spin" />
        <p className="text-sm font-bold text-slate-700">A processar dados trimestrais da API Absa...</p>
      </div>
    );
  }

  // Filtered monthly trend data based on selected quarter
  const displayedMonthlyTrends = selectedQuarterFilter === "ALL" 
    ? data.monthlyTrends 
    : data.monthlyTrends.filter(m => m.quarter === selectedQuarterFilter);

  // Method distribution for pie chart
  const totalAbsaPay = data.quarters.reduce((acc, q) => acc + q.absaPay, 0);
  const totalDebiCheck = data.quarters.reduce((acc, q) => acc + q.debiCheck, 0);
  const totalCard = data.quarters.reduce((acc, q) => acc + q.card, 0);

  const methodDistribution = [
    { name: "Absa Pay (Instant EFT)", value: totalAbsaPay, color: "#DC0032" },
    { name: "DebiCheck Recorrente", value: totalDebiCheck, color: "#F59E0B" },
    { name: "Cartão Virtual / Whop", value: totalCard, color: "#3B82F6" }
  ];

  return (
    <div className="space-y-6" id="quarterly-financial-report-section">
      {/* SECTION HEADER WITH FILTERS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-[#DC0032] rounded-full text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Análise Financeira Trimestral & Tendências Absa
          </div>
          <h2 className="text-xl font-display font-extrabold text-slate-900">
            Relatório de Arrecadação de Quotas Partidárias ({selectedYear})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualização consolidada de receitas via Absa Pay EFT, Débito Direto DebiCheck e canais digitais. Câmbio médio: 1 ZAR = {data.fxRateApplied} AOA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {["2026", "2025"].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedYear === yr
                    ? "bg-[#DC0032] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Quarter Filter Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {[
              { id: "ALL", label: "Ano Todo" },
              { id: "Q1", label: "Q1" },
              { id: "Q2", label: "Q2" },
              { id: "Q3", label: "Q3" },
              { id: "Q4", label: "Q4" }
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuarterFilter(q.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedQuarterFilter === q.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchReport}
            title="Atualizar Dados"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#DC0032] flex items-center justify-center font-bold mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Arrecadado ({selectedYear})
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
            R {data.totalYearZAR.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            ≈ Kz {data.totalYearAOA.toLocaleString()} AOA
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +21.4% vs ano anterior
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cumprimento da Meta Global
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
            {data.overallAchievementRate}%
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Meta Anual: R {data.totalYearTargetZAR.toLocaleString()}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, data.overallAchievementRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Canal Absa Pay & DebiCheck
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
            {Math.round(((totalAbsaPay + totalDebiCheck) / data.totalYearZAR) * 100)}%
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            R {(totalAbsaPay + totalDebiCheck).toLocaleString()} via Absa direto
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            SureCheck EFT Ativo
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Militantes Contribuintes
          </div>
          <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
            810
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Quotas regulares no Western Cape & ZA
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            94% Retenção Anual
          </div>
        </div>
      </div>

      {/* CHARTS GRID: 1. MONTHLY EVOLUTION (AREA) & 2. QUARTERLY COMPARISON (BAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: MONTHLY EVOLUTION AREA CHART */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#DC0032]" />
                Evolução Mensal de Arrecadação por Canal (ZAR)
              </h3>
              <p className="text-xs text-slate-500">
                Segmentação entre Absa Pay EFT, DebiCheck Recorrente e Cartão Virtual
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedMonthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAbsaPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC0032" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DC0032" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDebiCheck" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(v) => `R${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`R ${Number(value).toLocaleString()}`, ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="absaPayEFT" name="Absa Pay EFT" stroke="#DC0032" fillOpacity={1} fill="url(#colorAbsaPay)" strokeWidth={2} />
                <Area type="monotone" dataKey="absaDebiCheck" name="DebiCheck Recorrente" stroke="#F59E0B" fillOpacity={1} fill="url(#colorDebiCheck)" strokeWidth={2} />
                <Area type="monotone" dataKey="virtualCard" name="Cartão Virtual" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCard)" strokeWidth={2} />
                <Line type="monotone" dataKey="targetZAR" name="Meta Prevista" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: QUARTERLY TARGET VS ACTUAL BAR CHART */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                Arrecadação Trimestral vs Meta Partidária (ZAR)
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo de desempenho por trimestre e percentagem de execução
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.quarters} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(v) => `R${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`R ${Number(value).toLocaleString()}`, ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="totalZAR" name="Arrecadado Real" fill="#DC0032" radius={[8, 8, 0, 0]} />
                <Bar dataKey="targetZAR" name="Meta Estabelecida" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECOND ROW CHARTS: METHOD DISTRIBUTION & PROVINCIAL SHARE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PIE 1: PAYMENT METHOD BREAKDOWN */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-display font-extrabold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#DC0032]" />
            Canais de Pagamento
          </h3>
          <p className="text-xs text-slate-500">
            Distribuição percentual do volume anual
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(v: any) => [`R ${Number(v).toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {methodDistribution.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-600 font-medium">{m.name}</span>
                </div>
                <span className="font-bold text-slate-800">
                  {Math.round((m.value / data.totalYearZAR) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PIE 2: PROVINCIAL ARRECADAÇÃO SHARE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            Distribuição por Província
          </h3>
          <p className="text-xs text-slate-500">
            Western Cape lidera a arrecadação na RSA
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.provincialShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="totalZAR"
                >
                  {data.provincialShare.map((entry, index) => (
                    <Cell key={`cell-prov-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(v: any) => [`R ${Number(v).toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {data.provincialShare.slice(0, 3).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-600 font-medium truncate max-w-[140px]">{p.province}</span>
                </div>
                <span className="font-bold text-slate-800">{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUARTERLY BREAKDOWN TABLE CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Resumo dos Trimestres
          </h3>
          <p className="text-xs text-slate-500">
            Taxa de execução e crescimento QoQ
          </p>

          <div className="space-y-3 pt-2">
            {data.quarters.map((q) => (
              <div key={q.quarter} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{q.label}</span>
                  <span className="text-xs font-extrabold text-[#DC0032]">
                    R {q.totalZAR.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Execução: {q.achievementRate}%</span>
                  <span className="font-semibold text-emerald-600">+{q.growthQoQ}% QoQ</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#DC0032] h-full rounded-full" 
                    style={{ width: `${Math.min(100, q.achievementRate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
