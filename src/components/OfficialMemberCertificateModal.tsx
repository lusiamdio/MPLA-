import React from "react";
import { Member, LearningCourse } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import { LOCAL_MPLA_PARTY_LOGO } from "../images";
import { Award, CheckCircle2, Lock, Printer, X, ShieldCheck, ArrowRight, Download, Check } from "lucide-react";

interface OfficialMemberCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  courses: LearningCourse[];
  onGoToCourse?: (courseId: string) => void;
}

export default function OfficialMemberCertificateModal({
  isOpen,
  onClose,
  member,
  courses,
  onGoToCourse
}: OfficialMemberCertificateModalProps) {
  if (!isOpen) return null;

  const totalAssignments = courses.length;
  const completedIds = member.completedCourses || [];
  const completedCount = courses.filter(c => 
    completedIds.includes(c.id) || 
    (c.id === "pilar-1" && (completedIds.includes("c-1") || completedIds.includes("c_1")))
  ).length;
  const hasPassedAll = totalAssignments > 0 && completedCount === totalAssignments;

  const completionDate = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const handlePrintCertificate = () => {
    if (!hasPassedAll) return;

    const partyLogoUrl = new URL(LOCAL_MPLA_PARTY_LOGO, window.location.origin).href;

    const certHtml = `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8" />
          <title>Certificado Oficial de Mérito e Formação Política - ${member.fullName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 20px;
              background-color: #fafafa;
              font-family: 'Times New Roman', Times, serif;
              color: #0f172a;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 95vh;
            }
            .cert-border-outer {
              border: 8px solid #C8102E;
              padding: 6px;
              background: #ffffff;
              width: 100%;
              max-width: 1040px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }
            .cert-border-inner {
              border: 2px solid #D4AF37;
              padding: 28px 40px;
              position: relative;
              background: radial-gradient(circle at center, #ffffff 60%, #fffbf0 100%);
              text-align: center;
            }
            .corner-deco {
              position: absolute;
              width: 24px;
              height: 24px;
              border: 3px solid #D4AF37;
            }
            .corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
            .corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
            .corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
            .corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

            .logo-top {
              width: 82px;
              height: 82px;
              object-fit: contain;
              margin: 0 auto 6px auto;
              display: block;
              background: transparent;
            }
            .header-org {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 11px;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: #64748b;
              margin: 0;
              font-weight: 800;
            }
            .header-party {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 14px;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #C8102E;
              margin: 4px 0 0 0;
              font-weight: 900;
            }
            .header-academy {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 10px;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              color: #D4AF37;
              margin: 2px 0 16px 0;
              font-weight: 700;
            }
            .title-main {
              font-size: 28px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin: 0;
              line-height: 1.1;
            }
            .subtitle-cert {
              font-size: 13px;
              font-style: italic;
              color: #475569;
              margin: 4px 0 18px 0;
            }
            .certify-intro {
              font-size: 13px;
              color: #334155;
              margin: 0 0 8px 0;
              letter-spacing: 0.5px;
            }
            .recipient-name {
              font-size: 30px;
              font-weight: 900;
              color: #C8102E;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 8px auto;
              display: inline-block;
              border-bottom: 2px solid #D4AF37;
              padding-bottom: 4px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .meta-box {
              display: flex;
              justify-content: center;
              gap: 28px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
              font-size: 11px;
              color: #475569;
              margin: 10px 0 16px 0;
            }
            .meta-item strong {
              color: #0f172a;
            }
            .congrats-paragraph {
              font-size: 13px;
              line-height: 1.7;
              color: #1e293b;
              max-width: 820px;
              margin: 0 auto 26px auto;
              text-align: justify;
              text-align-last: center;
              font-style: italic;
            }
            .signatures-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 20px;
              padding: 0 20px;
            }
            .signature-block {
              text-align: center;
              width: 280px;
            }
            .sig-cursive {
              font-family: 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive;
              font-size: 26px;
              color: #0f172a;
              height: 40px;
              line-height: 40px;
              margin-bottom: 4px;
            }
            .sig-line {
              border-top: 1.5px solid #0f172a;
              margin: 0 10px 6px 10px;
            }
            .sig-name {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 12px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              margin: 0;
            }
            .sig-title {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 10px;
              font-weight: 700;
              color: #C8102E;
              margin: 2px 0 0 0;
            }
            .sig-subtitle {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 9px;
              color: #64748b;
              margin: 1px 0 0 0;
            }
            .seal-center {
              text-align: center;
              width: 140px;
            }
            .seal-circle {
              width: 86px;
              height: 86px;
              border: 3px double #D4AF37;
              border-radius: 50%;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #fffdf5;
              box-shadow: 0 0 0 2px #C8102E;
            }
            .seal-star {
              color: #D4AF37;
              font-size: 18px;
              line-height: 1;
            }
            .seal-text {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 7px;
              font-weight: 900;
              color: #C8102E;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 2px;
              line-height: 1.1;
            }
            @media print {
              body {
                padding: 0;
                background: white;
              }
              .cert-border-outer {
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="cert-border-outer">
            <div class="cert-border-inner">
              <div class="corner-deco corner-tl"></div>
              <div class="corner-deco corner-tr"></div>
              <div class="corner-deco corner-bl"></div>
              <div class="corner-deco corner-br"></div>

              <!-- Top Emblem -->
              <img src="${partyLogoUrl}" alt="Logótipo Oficial MPLA" class="logo-top" />
              <p class="header-org">República de Angola</p>
              <h2 class="header-party">Movimento Popular de Libertação de Angola</h2>
              <p class="header-academy">Comité Central • Academia Política e Cívica de Quadros</p>

              <!-- Main Title -->
              <h1 class="title-main">Certificado de Mérito & Formação Política</h1>
              <p class="subtitle-cert">Acreditação Oficial de Formação Doutrinária, Cívica e de Liderança de Quadros</p>

              <!-- Recipient -->
              <p class="certify-intro">Certifica-se com honra e distinção que o(a) camarada</p>
              <div class="recipient-name">${member.fullName}</div>

              <!-- Metadata: Member number & Date -->
              <div class="meta-box">
                <span class="meta-item">Nº de Militante: <strong>${member.membershipNo}</strong></span>
                <span class="meta-item">B.I. / Passaporte: <strong>${member.nationalId || 'N/D'}</strong></span>
                <span class="meta-item">Data de Conclusão: <strong>${completionDate}</strong></span>
                <span class="meta-item">Estrutura: <strong>${member.organizationWing || 'Militante'}</strong></span>
              </div>

              <!-- Congratulations Paragraph -->
              <p class="congrats-paragraph">
                "O Comité Central e a Direção Nacional do MPLA felicitam calorosamente o(a) camarada pelo empenho exemplar, dedicação patriótica e aproveitamento com distinção em todas as tarefas e unidades curriculares da Academia Política e Cívica de Quadros. Este diploma confere plena acreditação para o exercício ativo da cidadania militante e liderança partidária na diáspora angolana e na pátria mãe."
              </p>

              <!-- Signatures: Secretário Geral do MPLA and Presidente João Lourenço -->
              <div class="signatures-row">
                <div class="signature-block">
                  <div class="sig-cursive">Paulo Pombolo</div>
                  <div class="sig-line"></div>
                  <p class="sig-name">Paulo Pombolo</p>
                  <p class="sig-title">Secretário-Geral do MPLA</p>
                  <p class="sig-subtitle">Comité Central do Partido</p>
                </div>

                <div class="seal-center">
                  <div class="seal-circle">
                    <span class="seal-star">★</span>
                    <span class="seal-text">Selo Oficial<br />Comité Central<br />MPLA</span>
                  </div>
                </div>

                <div class="signature-block">
                  <div class="sig-cursive">João Lourenço</div>
                  <div class="sig-line"></div>
                  <p class="sig-name">João Lourenço</p>
                  <p class="sig-title">Presidente da República de Angola</p>
                  <p class="sig-subtitle">Presidente do MPLA</p>
                </div>
              </div>

            </div>
          </div>
        </body>
      </html>
    `;

    safePrintHtml(certHtml, `Certificado Oficial MPLA - ${member.fullName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#990B21] via-[#C8102E] to-[#0f172a] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#FFCC00]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base tracking-tight">
                {hasPassedAll 
                  ? "Certificado Oficial de Mérito e Formação Política"
                  : "Certificado de Formação Política (Acesso Condicionado)"}
              </h3>
              <p className="text-[11px] text-amber-200 font-mono">
                {hasPassedAll
                  ? "Homologado pelo Secretário-Geral e Presidente João Lourenço"
                  : "Exige aprovação em todas as avaliações da Academia"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {!hasPassedAll ? (
            /* LOCKED / PROGRESS STATE */
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="font-display font-extrabold text-slate-900 text-lg">
                  Certificado Disponível Apenas Após Conclusão de Todas as Tarefas
                </h4>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Conforme as diretivas estatutárias da Direção Nacional, o <strong>Certificado Oficial da Academia Política do MPLA</strong> só é emitido quando o militante tiver completado com aproveitamento integral todas as <strong>{totalAssignments} unidades curriculares e respetivas avaliações</strong>.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-amber-200 text-xs font-mono font-bold text-amber-950">
                    <span>Progresso Atual:</span>
                    <span className="text-[#C8102E] font-black">{completedCount} de {totalAssignments} Módulos Concluídos</span>
                    <span>({totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>

              {/* Assignments Status Breakdown */}
              <div className="space-y-3">
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Estado das Avaliações Curriculares
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((course, idx) => {
                    const isDone = completedIds.includes(course.id) ||
                      (course.id === "pilar-1" && (completedIds.includes("c-1") || completedIds.includes("c_1")));
                    return (
                      <div 
                        key={course.id}
                        className={`p-4 rounded-2xl border text-left flex justify-between items-center transition ${
                          isDone 
                            ? "bg-emerald-50/50 border-emerald-200" 
                            : "bg-slate-50 border-slate-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="space-y-1 pr-3">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                            {course.pillarRoman || `Pilar ${idx + 1}`} • {course.category}
                          </span>
                          <h6 className="font-bold text-xs text-slate-800 leading-snug line-clamp-1">
                            {course.title}
                          </h6>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {course.quiz?.length || 0} questões de autoavaliação
                          </p>
                        </div>

                        <div>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onClose();
                                if (onGoToCourse) onGoToCourse(course.id);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#C8102E] hover:bg-red-700 text-white px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                            >
                              Fazer Exame <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED & GENERATED CERTIFICATE PREVIEW */
            <div className="space-y-6">
              {/* Congratulatory Alert */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm">Currículo 100% Concluído & Certificado Homologado!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Completou com sucesso todos os {totalAssignments} módulos e avaliações da Academia Política. O seu certificado oficial está assinado e pronto para impressão.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePrintCertificate}
                  className="px-4 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
              </div>

              {/* Visual Certificate Parchment Mockup */}
              <div className="border-4 border-[#C8102E] p-1.5 rounded-2xl bg-white shadow-xl max-w-3xl mx-auto overflow-hidden">
                <div className="border border-[#D4AF37] rounded-xl p-6 sm:p-8 text-center bg-radial from-white via-amber-50/20 to-amber-100/30 space-y-4 relative">
                  
                  {/* Logo on Top */}
                  <div className="w-16 h-16 mx-auto bg-transparent">
                    <img 
                      src={LOCAL_MPLA_PARTY_LOGO} 
                      alt="MPLA Logo" 
                      className="w-full h-full object-contain bg-transparent"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                      República de Angola • Movimento Popular de Libertação de Angola
                    </p>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold mt-0.5">
                      Comité Central • Academia Política e Cívica de Quadros
                    </p>
                    <h3 className="font-serif font-black text-xl sm:text-2xl text-slate-900 uppercase tracking-tight mt-2">
                      Certificado de Mérito & Formação Política
                    </h3>
                  </div>

                  {/* Recipient exact name */}
                  <div className="py-2">
                    <p className="text-xs text-slate-500 italic">Certifica-se com honra e distinção que o(a) camarada</p>
                    <h2 className="text-2xl sm:text-3xl font-display font-black text-[#C8102E] uppercase tracking-wide my-2 border-b-2 border-[#D4AF37] pb-1 inline-block">
                      {member.fullName}
                    </h2>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs font-mono text-slate-600">
                    <span>Nº de Militante: <strong className="text-slate-900">{member.membershipNo}</strong></span>
                    <span>B.I.: <strong className="text-slate-900">{member.nationalId || 'N/D'}</strong></span>
                    <span>Data de Conclusão: <strong className="text-slate-900">{completionDate}</strong></span>
                  </div>

                  {/* Congratulations Paragraph */}
                  <p className="text-xs leading-relaxed text-slate-700 max-w-xl mx-auto italic text-justify sm:text-center pt-2">
                    "O Comité Central e a Direção Nacional do MPLA felicitam calorosamente o(a) camarada pelo empenho exemplar, dedicação patriótica e aproveitamento com distinção em todas as tarefas e unidades curriculares da Academia Política e Cívica de Quadros. Este diploma confere plena acreditação para o exercício ativo da cidadania militante e liderança partidária na diáspora angolana e na pátria mãe."
                  </p>

                  {/* Signatures below: Secretário Geral do MPLA & Presidente João Lourenço */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-end pt-6 gap-4">
                    {/* Secretário Geral */}
                    <div className="text-center">
                      <p className="font-serif italic text-base text-slate-800 h-8 flex items-center justify-center font-bold">
                        Paulo Pombolo
                      </p>
                      <div className="border-t border-slate-400 w-36 mx-auto mt-1" />
                      <p className="font-bold text-xs text-slate-900 uppercase mt-1">Paulo Pombolo</p>
                      <p className="text-[10px] text-[#C8102E] font-bold">Secretário-Geral do MPLA</p>
                      <p className="text-[9px] text-slate-500 font-mono">Comité Central do Partido</p>
                    </div>

                    {/* Seal */}
                    <div className="text-center flex flex-col items-center justify-center py-2">
                      <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] ring-2 ring-[#C8102E] bg-white flex flex-col items-center justify-center shadow-xs">
                        <span className="text-[#D4AF37] text-sm">★</span>
                        <span className="text-[6.5px] font-mono font-black text-[#C8102E] uppercase leading-tight mt-0.5">
                          Selo Oficial<br />Comité Central<br />MPLA
                        </span>
                      </div>
                    </div>

                    {/* Presidente João Lourenço */}
                    <div className="text-center">
                      <p className="font-serif italic text-base text-slate-800 h-8 flex items-center justify-center font-bold">
                        João Lourenço
                      </p>
                      <div className="border-t border-slate-400 w-36 mx-auto mt-1" />
                      <p className="font-bold text-xs text-slate-900 uppercase mt-1">João Lourenço</p>
                      <p className="text-[10px] text-[#C8102E] font-bold">Presidente da República de Angola</p>
                      <p className="text-[9px] text-slate-500 font-mono">Presidente do MPLA</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <p className="text-slate-500 font-mono text-[11px]">
            {hasPassedAll
              ? "Autenticidade Criptográfica Verificada via Portal MPLA Sede"
              : `Módulos Concluídos: ${completedCount} de ${totalAssignments}`}
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
            {hasPassedAll && (
              <button
                onClick={handlePrintCertificate}
                className="px-5 py-2 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Imprimir Certificado (PDF)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
