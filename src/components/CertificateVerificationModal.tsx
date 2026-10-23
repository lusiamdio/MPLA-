import React, { useState, useEffect } from "react";
import { Member, LearningCourse } from "../types";
import { LOCAL_MPLA_PARTY_LOGO, LOCAL_JOAO_LOURENCO_IMAGE } from "../images";
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Search, X, 
  Award, QrCode, ExternalLink, Calendar, User, FileText, Check
} from "lucide-react";

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  courses?: LearningCourse[];
  initialMilitantNo?: string;
}

export default function CertificateVerificationModal({
  isOpen,
  onClose,
  members,
  courses = [],
  initialMilitantNo = ""
}: CertificateVerificationModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialMilitantNo);
  const [verifiedMember, setVerifiedMember] = useState<Member | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialMilitantNo) {
      setSearchTerm(initialMilitantNo);
      handleVerify(initialMilitantNo);
    } else if (members.length > 0 && !verifiedMember) {
      // Find first certified member by default for demonstration
      const firstCertified = members.find(m => (m.completedCourses?.length || 0) >= (courses.length || 1));
      if (firstCertified) {
        setSearchTerm(firstCertified.membershipNo);
        setVerifiedMember(firstCertified);
        setSearched(true);
      }
    }
  }, [initialMilitantNo, members, courses]);

  if (!isOpen) return null;

  const handleVerify = (termToSearch: string) => {
    const clean = termToSearch.trim().toLowerCase();
    if (!clean) return;

    setSearched(true);
    const found = members.find(m => 
      m.membershipNo.toLowerCase() === clean ||
      m.membershipNo.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '') ||
      m.nationalId.toLowerCase() === clean ||
      clean.includes(m.membershipNo.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    setVerifiedMember(found || null);
  };

  const totalCourses = courses.length || 4;
  const isMemberCertified = verifiedMember 
    ? (verifiedMember.completedCourses?.length || 0) >= totalCourses
    : false;

  const certSerial = verifiedMember 
    ? `CERT-MPLA-2026-${verifiedMember.membershipNo.replace(/[^a-zA-Z0-9]/g, '')}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#990B21] via-[#C8102E] to-slate-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FFCC00]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                Validador Consular de Certificados
              </h3>
              <p className="text-[11px] text-white/80">
                Verificação Pública & Acreditação de Quadros • MPLA Diáspora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(searchTerm);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Insira o Nº de Identificação Militante (ex: ADL-2026-...) ou Código do Certificado"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold focus:outline-hidden focus:ring-2 focus:ring-[#C8102E]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#A50D24] text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Verificar</span>
            </button>
          </form>
        </div>

        {/* Verification Body */}
        <div className="p-6 space-y-6">
          {searched && verifiedMember ? (
            isMemberCertified ? (
              /* CERTIFICATE VALID & AUTHENTICATED */
              <div className="space-y-5 animate-scale-up">
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-emerald-600 text-white px-3 py-1 rounded-full shadow-2xs">
                      DOCUMENTO AUTÊNTICO & HOMOLOGADO
                    </span>
                    <h4 className="font-display font-black text-slate-900 text-lg mt-2">
                      Certificado Oficial de Mérito & Formação Política
                    </h4>
                    <p className="text-xs text-slate-600">
                      Emitido e assinado digitalmente pelas instâncias superiores do Partido.
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Militante Recipiente</p>
                    <p className="font-black text-slate-900 text-sm">{verifiedMember.fullName}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nº de Identificação Militante (ADL)</p>
                    <p className="font-mono font-black text-[#C8102E] text-sm">{verifiedMember.membershipNo}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Número de Série do Certificado</p>
                    <p className="font-mono font-bold text-slate-800">{certSerial}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">B.I. / Passaporte</p>
                    <p className="font-mono font-bold text-slate-800">{verifiedMember.nationalId}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Aproveitamento Académico</p>
                    <p className="font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600" /> 100% das Tarefas Curriculares Concluídas
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Comité de Filiação</p>
                    <p className="font-bold text-slate-800">{verifiedMember.committee}</p>
                  </div>
                </div>

                {/* Signatures Verified Badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img 
                      src={LOCAL_MPLA_PARTY_LOGO} 
                      alt="MPLA" 
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Signatários de Homologação:</p>
                      <p className="text-[11px] text-slate-500">
                        Paulo Pombolo (Secretário-Geral) & João Lourenço (Presidente da República)
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200 shrink-0">
                    Selo Central Validado
                  </span>
                </div>
              </div>
            ) : (
              /* MEMBER FOUND BUT ASSIGNMENTS NOT COMPLETED */
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                <h4 className="font-display font-black text-amber-950 text-sm">Certificado Não Emitido</h4>
                <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                  O camarada <strong>{verifiedMember.fullName}</strong> ({verifiedMember.membershipNo}) está registado, mas ainda possui unidades curriculares pendentes ({verifiedMember.completedCourses?.length || 0} de {totalCourses} concluídas). O certificado só é emitido após conclusão integral.
                </p>
              </div>
            )
          ) : searched ? (
            /* NOT FOUND */
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
              <h4 className="font-display font-black text-rose-950 text-sm">Registo Não Localizado</h4>
              <p className="text-xs text-rose-800 leading-relaxed max-w-md mx-auto">
                Não foi encontrado nenhum certificado ou militante correspondente ao número fornecido. Por favor, confirme o número de identificação militante ou contacte o Comité Consular.
              </p>
            </div>
          ) : (
            /* INITIAL INSTRUCTIONS */
            <div className="text-center py-8 text-slate-500 space-y-2">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Sistema Público de Consulta de Autenticidade</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Insira o Número de Identificação Militante (ex: ADL) ou escaneie o código QR no certificado oficial para validar a autenticidade perante autoridades consulares.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
