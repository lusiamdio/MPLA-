import React, { useState } from "react";
import { Member, PartyEvent, LearningCourse } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import OfficialMemberCertificateModal from "./OfficialMemberCertificateModal";
import { 
  Calendar, MapPin, Users, CheckCircle, Clock, BookOpen, 
  Award, Play, CheckSquare, RefreshCw, X, ArrowRight, GraduationCap, Compass, Lock, ShieldCheck
} from "lucide-react";
import EventsMap from "./EventsMap";

interface MemberEventsProps {
  member: Member;
  events: PartyEvent[];
  courses: LearningCourse[];
  onRegisterEvent: (eventId: string) => void;
  onCompleteCourse: (courseId: string) => void;
}

export default function MemberEvents({
  member,
  events,
  courses,
  onRegisterEvent,
  onCompleteCourse
}: MemberEventsProps) {
  const [activeTab, setActiveTab] = useState<"events" | "academy">("events");
  const [selectedMapEventId, setSelectedMapEventId] = useState<string | null>(null);

  // Academy states
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id || null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const totalAssignments = courses.length;
  const completedCount = courses.filter(c => member.completedCourses?.includes(c.id)).length;
  const hasPassedAll = totalAssignments > 0 && completedCount === totalAssignments;

  const activeCourse = courses.find(c => c.id === selectedCourseId);
  const isCourseCompleted = member.completedCourses.includes(selectedCourseId || "");

  const handleQuizAnswer = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx });
  };

  const submitQuiz = () => {
    if (!activeCourse || !activeCourse.quiz) return;
    
    // Check if all answered
    if (Object.keys(quizAnswers).length < activeCourse.quiz.length) {
      setQuizError("Por favor, responda a todas as perguntas antes de submeter.");
      return;
    }

    setQuizError("");
    let passed = true;
    activeCourse.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] !== q.correctIndex) {
        passed = false;
      }
    });

    setQuizSubmitted(true);
    setQuizPassed(passed);

    if (passed) {
      onCompleteCourse(activeCourse.id);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
    setQuizError("");
  };

  return (
    <div className="space-y-6" id="events-academy-center">
      {/* Tab Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#D3122A]" />
            Eventos & Centro de Formação Política
          </h2>
          <p className="text-xs text-slate-500 mt-1">Inscreva-se em plenários democráticos, assembleias regionais ou obtenha certificações oficiais de liderança partidária.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
              activeTab === "events" 
                ? "bg-white text-[#D3122A] font-bold shadow-xs border border-slate-200/30" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4 text-red-600" />
            Assembleias & Eventos
          </button>
          <button
            onClick={() => {
              setActiveTab("academy");
              resetQuiz();
            }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
              activeTab === "academy" 
                ? "bg-white text-emerald-600 font-bold shadow-xs border border-slate-200/30" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Academia de Quadros
          </button>
        </div>
      </div>

      {activeTab === "events" ? (
        /* EVENTS & INTERACTIVE MAP COMPONENT */
        <div className="space-y-6 animate-fade-in">
          {/* Interactive Map */}
          <EventsMap 
            events={events}
            memberId={member.id}
            onRegisterEvent={onRegisterEvent}
            selectedEventId={selectedMapEventId}
            onSelectEvent={(id) => setSelectedMapEventId(id)}
          />

          {/* Events Grid */}
          <div className="space-y-3">
            <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wider font-mono border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Lista de Assembleias & Plenários Agendados</span>
              <span className="text-xs text-slate-500 font-normal">Total: {events.length} eventos</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((evt) => {
                const isReg = evt.registeredMemberIds.includes(member.id);
                const isFull = evt.registeredCount >= evt.capacity;
                const isSelectedOnMap = selectedMapEventId === evt.id;

                return (
                  <div 
                    key={evt.id} 
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition ${
                      isSelectedOnMap 
                        ? "border-[#D3122A] ring-2 ring-red-200 bg-red-50/20" 
                        : "border-slate-200 hover:border-[#D3122A]/35"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold tracking-wider uppercase border ${
                          evt.organizer === "National" 
                            ? "bg-red-50 text-[#D3122A] border-red-100" 
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {evt.organizer === "National" ? "Nacional" : "Provincial"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${
                          evt.status === "Upcoming" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {evt.status === "Upcoming" ? "Agendado" : "Concluído"}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-extrabold text-slate-900 text-sm leading-snug">{evt.title}</h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{evt.description}</p>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700">{new Date(evt.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-[#D3122A] shrink-0" />
                            <span className="truncate font-semibold text-slate-700" title={evt.location}>{evt.location}</span>
                          </div>
                          {evt.lat && evt.lng && (
                            <button
                              onClick={() => {
                                setSelectedMapEventId(evt.id);
                                const mapEl = document.getElementById("events-academy-center");
                                if (mapEl) mapEl.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="text-[10px] font-mono font-bold text-[#D3122A] bg-red-50 border border-red-100 hover:bg-red-100 px-2 py-1 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <Compass className="w-3 h-3" />
                              Mapa
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Capacidade: <strong className="text-slate-900">{evt.registeredCount} / {evt.capacity}</strong> delegados</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {evt.status === "Completed" ? (
                        <button className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed" disabled>
                          Assembleia Concluída
                        </button>
                      ) : (
                        <button
                          onClick={() => onRegisterEvent(evt.id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isReg
                              ? "bg-red-50 border border-red-200 hover:bg-red-100 text-[#D3122A] shadow-xs font-semibold"
                              : isFull
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-[#D3122A] hover:bg-red-700 active:bg-red-800 text-white shadow-md shadow-red-100/50"
                          }`}
                          disabled={!isReg && isFull}
                        >
                          {isReg ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-[#D3122A]" />
                              Cancelar Inscrição
                            </>
                          ) : isFull ? (
                            "Vagas Esgotadas"
                          ) : (
                            "Confirmar Presença"
                          )}
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
        /* VIRTUAL ACADEMY COMPONENT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Course Listing */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono px-1">Programas de Formação</h3>

            <div className="space-y-3">
              {courses.map((course) => {
                const isCompleted = member.completedCourses.includes(course.id) ||
                  (course.id === "pilar-1" && (member.completedCourses.includes("c-1") || member.completedCourses.includes("c_1")));
                const isSelected = selectedCourseId === course.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      resetQuiz();
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                      isSelected
                        ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200"
                        : "bg-white border-slate-200 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-[9px] font-mono font-bold uppercase rounded tracking-wider text-slate-600 border border-slate-200/50">
                        {course.pillarRoman || course.category}
                      </span>
                      {isCompleted && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Diplomado
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-extrabold text-slate-900 text-sm mt-3 leading-snug">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-3.5">
                      <Clock className="w-4 h-4 text-slate-400" /> Carga Horária: {course.duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Video lecture & quiz section */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {activeCourse ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">Modulo Teórico Virtual</span>
                  <h3 className="font-display font-extrabold text-slate-900 text-lg mt-3 leading-snug">{activeCourse.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{activeCourse.description}</p>
                </div>

                {/* Simulated Video Player */}
                {activeCourse.videoUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video relative group shadow-sm">
                    <video 
                      src={activeCourse.videoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=300&fit=crop"
                    />
                  </div>
                )}

                {/* Study Guide Content */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs leading-relaxed text-slate-600 space-y-3">
                  <h4 className="font-display font-bold text-slate-800 text-sm">Resumo da Unidade Curricular</h4>
                  <p>Os Planos de Desenvolvimento Municipal são estratégias fundamentais legalmente estabelecidas no ordenamento angolano para descentralização administrativa. Os coordenadores de secção local recolhem propostas públicas de infraestruturas no primeiro trimestre de cada ciclo orçamental e submetem ao Comité de Círculo.</p>
                  <ul className="list-disc pl-4 space-y-1.5 mt-2 font-medium">
                    <li>As comissões locais agregam as reclamações públicas mensais.</li>
                    <li>As rubricas financeiras são auditadas pela delegação de finanças.</li>
                  </ul>
                </div>

                {/* Quiz & Examination */}
                {activeCourse.quiz && (
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-[#D3122A]" />
                        Exame de Certificação
                      </h4>
                      {isCourseCompleted && (
                        <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded">
                          Aprovado
                        </span>
                      )}
                    </div>

                    {isCourseCompleted ? (
                      /* SHOW CERTIFICATE / MODULE PASSED SCREEN */
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 animate-scale-up">
                        {hasPassedAll ? (
                          <div className="space-y-4">
                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                              <Award className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                                100% dos Módulos & Avaliações Concluídos
                              </span>
                              <h5 className="font-display font-extrabold text-slate-900 text-base mt-2">Certificado Oficial Homologado!</h5>
                              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                                Parabéns camarada <strong>{member.fullName}</strong>! Completou com distinção todas as tarefas da Academia Política. O seu Certificado Oficial está assinado e pronto para emissão.
                              </p>
                            </div>
                            <button 
                              onClick={() => setIsCertModalOpen(true)}
                              className="px-6 py-3 bg-[#C8102E] hover:bg-[#A50D24] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-red-200 flex items-center gap-2 mx-auto"
                            >
                              <Award className="w-4 h-4 text-[#FFCC00]" />
                              <span>Emitir e Imprimir Certificado Oficial (PDF)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Módulo Concluído com Sucesso
                              </span>
                              <h5 className="font-display font-extrabold text-slate-900 text-sm mt-2">{activeCourse.title}</h5>
                              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                                Exame deste módulo aprovado! O <strong>Certificado Oficial da Academia</strong> só é emitido após aprovação em <strong>todas as {totalAssignments} tarefas curriculares</strong>.
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 max-w-sm mx-auto text-xs text-slate-600 space-y-2">
                              <div className="flex justify-between items-center text-[11px] font-bold">
                                <span>Progresso Geral da Formação:</span>
                                <span className="text-[#C8102E] font-mono">{completedCount} de {totalAssignments} Módulos</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-[#C8102E] h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${totalAssignments > 0 ? (completedCount / totalAssignments) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => setIsCertModalOpen(true)}
                              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 mx-auto"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Ver Requisitos do Certificado ({completedCount}/{totalAssignments})</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ACTIVE QUIZ FORM */
                      <div className="space-y-4">
                        {quizError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-semibold">
                            {quizError}
                          </div>
                        )}

                        {quizSubmitted && !quizPassed && (
                          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-center space-y-2">
                            <h5 className="font-display font-bold text-rose-800 text-xs">Exame Não Aprovado</h5>
                            <p className="text-[11px] text-rose-600 leading-relaxed">Algumas respostas estavam incorretas. Por favor, reveja os apontamentos teóricos e tente novamente.</p>
                            <button
                              onClick={resetQuiz}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                            >
                              Repetir Exame
                            </button>
                          </div>
                        )}

                        {activeCourse.quiz.map((q, qIdx) => (
                          <div key={qIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                            <p className="text-xs font-bold text-slate-800">{qIdx + 1}. {q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[qIdx] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                    className={`text-left p-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                      isSelected
                                        ? "bg-[#D3122A] text-white shadow-xs"
                                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                                    disabled={quizSubmitted}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {!quizSubmitted && (
                          <button
                            onClick={submitQuiz}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-100"
                          >
                            Submeter Respostas do Exame
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-medium">Seleccione um módulo de formação política na lista ao lado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Certificate Modal (Generates only after all assignments are passed) */}
      <OfficialMemberCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        member={member}
        courses={courses}
        onGoToCourse={(courseId) => {
          setSelectedCourseId(courseId);
          setIsCertModalOpen(false);
        }}
      />
    </div>
  );
}
