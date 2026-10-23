import React from "react";
import { Award, CheckCircle2, Lock, Sparkles, BookOpen } from "lucide-react";
import { LearningCourse } from "../types";

interface CertificationProgressBarProps {
  courses: LearningCourse[];
  completedCourseIds: string[];
  onOpenCertificateModal: () => void;
  onSelectCourse?: (courseId: string) => void;
}

export default function CertificationProgressBar({
  courses,
  completedCourseIds = [],
  onOpenCertificateModal,
  onSelectCourse,
}: CertificationProgressBarProps) {
  const totalRequired = courses.length;
  const completedCount = courses.filter((c) => completedCourseIds.includes(c.id)).length;
  const percentage = totalRequired > 0 ? Math.min(100, Math.round((completedCount / totalRequired) * 100)) : 0;
  const isCertified = totalRequired > 0 && completedCount === totalRequired;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 transition-all">
      {/* Top Header & Stat Badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-[#C8102E]">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="font-display font-black text-slate-900 text-sm sm:text-base tracking-tight">
              Progresso de Formação & Certificação Oficial
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Acompanhamento curricular obrigatório para obtenção do Certificado Oficial de Mérito do MPLA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs ${
              isCertified
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
          >
            {isCertified ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Certificação Aprovada (100%)
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                {completedCount} de {totalRequired} Cursos ({percentage}%)
              </>
            )}
          </span>
        </div>
      </div>

      {/* Numerical Visualizer */}
      <div className="flex justify-between items-end text-xs font-mono">
        <div>
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Módulos Concluídos</span>
          <span className="text-slate-900 font-bold text-sm">
            <strong className="text-[#C8102E] text-base">{completedCount}</strong> / {totalRequired} Cursos
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Requisito para Certificação</span>
          <span className={`font-bold ${isCertified ? "text-emerald-700 font-black" : "text-slate-600"}`}>
            {isCertified ? "✓ Cumprido na Totalidade" : `${totalRequired - completedCount} Módulo(s) Restante(s)`}
          </span>
        </div>
      </div>

      {/* Main CSS Progress Bar */}
      <div className="space-y-1.5">
        <div className="certification-progress-track">
          <div
            className={`certification-progress-fill ${isCertified ? "completed" : "in-progress"}`}
            style={{ width: `${percentage}%` }}
          >
            {/* Animated CSS Stripes */}
            <div className="certification-progress-striped" />
            {/* Shimmer Sweep Animation */}
            <div className="certification-progress-shimmer" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-0.5">
          <span>0% Início</span>
          <span>50% Intermédio</span>
          <span className="font-bold text-[#C8102E]">100% Homologação</span>
        </div>
      </div>

      {/* Individual Course Milestones */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-2.5">
          Os 5 Pilares da Academia Política do MPLA:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {courses.map((course, idx) => {
            const isDone = completedCourseIds.includes(course.id) || 
              (course.id === "pilar-1" && (completedCourseIds.includes("c-1") || completedCourseIds.includes("c_1")));
            const pillarBadge = course.pillarRoman || `PILAR ${idx + 1}`;
            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse && onSelectCourse(course.id)}
                className={`p-2.5 rounded-xl border text-xs transition flex flex-col justify-between gap-2 cursor-pointer ${
                  isDone
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                    isDone ? "bg-emerald-200/70 text-emerald-900" : "bg-slate-200 text-slate-700"
                  }`}>
                    {pillarBadge}
                  </span>
                  {isDone ? (
                    <span className="text-[8px] uppercase font-mono font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluído
                    </span>
                  ) : (
                    <span className="text-[8px] uppercase font-mono text-slate-400">Pendente</span>
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-[11px] leading-tight line-clamp-2 text-slate-900">
                    {course.title.replace(/^Pilar [I|V|X]+ — /, "")}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono truncate">{course.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Prompt */}
      <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs text-slate-600">
          {isCertified ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 inline" />
              Parabéns! Todas as etapas foram concluídas. O seu Certificado Oficial já pode ser visualizado e descarregado.
            </span>
          ) : (
            <span>
              Conclua os testes e estudos de caso de todos os módulos para homologar a certificação pelo Bureau Político.
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={onOpenCertificateModal}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs ${
            isCertified
              ? "bg-[#C8102E] hover:bg-[#A50D24] text-white shadow-red-200"
              : "bg-slate-900 hover:bg-slate-950 text-white"
          }`}
        >
          {isCertified ? (
            <>
              <Award className="w-4 h-4 text-[#FFCC00]" />
              <span>Emitir Certificado Oficial</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Requisitos ({completedCount}/{totalRequired})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
