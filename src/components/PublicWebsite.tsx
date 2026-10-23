import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, Mail, Clock, Globe, ArrowRight, User, Shield, Users, 
  Calendar, MapPin, Award, BookOpen, Volume2, ShieldCheck, 
  Download, Search, Eye, Share2, HelpCircle, ChevronRight, 
  ChevronDown, ExternalLink, MessageSquare, Heart, Sparkles,
  Check, FileText, CheckCircle2, Moon, Sun, Type, Play, X,
  ArrowLeft, ChevronLeft, Send, Sparkle, Trophy, Youtube, QrCode
} from "lucide-react";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

import { WebsiteCMSConfig, LeadershipMember, MapProvinceStat } from "./AdminWebsiteCMS";
import { Announcement, PartyEvent, Member } from "../types";
import { showToast } from "../lib/notifications";
import { safePrintHtml } from "../lib/printUtils";
import { 
  LOCAL_SUPPORTERS_BACKGROUND as mplaSupportersImg, 
  LOCAL_PRESIDENTS_COLLAGE as mplaPresidentsImg,
  LOCAL_COMITEE_IMAGE as mplaComiteeImg,
  LOCAL_PPT_IMAGE as mplaPptImg,
  LOCAL_MPLA_PARTY_LOGO,
  MPLA_EMBLEM_SVG,
  HERO_SLIDE_1,
  HERO_SLIDE_2,
  HERO_SLIDE_3,
  GALLERY_IMAGES,
  getAllLocalGalleryImages,
  LocalGalleryItem,
  EVENT_CONFERENCE_COVER,
  EVENT_RALLY_COVER,
  EVENT_WORKSHOP_COVER,
  EVENT_FORUM_COVER,
  EVENT_SEMINAR_COVER,
  EVENT_COMMUNITY_COVER
} from "../images";

interface PublicWebsiteProps {
  onNavigateToAuth: (mode: "signin" | "signup") => void;
  websiteConfig?: WebsiteCMSConfig;
  announcements?: Announcement[];
  events?: PartyEvent[];
  leadership?: LeadershipMember[];
  mapStats?: Record<string, MapProvinceStat>;
  members?: Member[];
  onOpenScanner?: () => void;
}

export default function PublicWebsite({ 
  onNavigateToAuth,
  websiteConfig,
  announcements,
  events,
  leadership,
  mapStats,
  members = [],
  onOpenScanner
}: PublicWebsiteProps) {
  // Localization / Language
  const [language, setLanguage] = useState<"PT" | "EN" | "FR">("PT");

  // YouTube view mode: "live" for live stream, "archive" for channel uploads playlist
  const [youtubeTab, setYoutubeTab] = useState<"live" | "archive">("live");

  // Accessibility & Visual settings
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  // Navigation state (Transparent to Solid on scroll)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero slideshow auto-rotation
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      title_pt: "Construindo Unidade. Fortalecendo Comunidades.",
      title_en: "Building Unity. Empowering Communities.",
      sub_pt: "Promovendo a cidadania participativa, solidariedade e progresso dos angolanos na África do Sul.",
      sub_en: "Promoting participatory citizenship, solidarity and progress for Angolans in South Africa.",
      image: "https://cdn.dailymaverick.co.za/dailymaverick/wp-content/uploads/2022/01/000_9D84GG-1.jpg"
    },
    {
      title_pt: "Inovação, Disciplina e Liderança Jovem",
      title_en: "Innovation, Discipline and Youth Leadership",
      sub_pt: "A JMPLA liderando a formação académica, empreendedorismo e o futuro da nossa comunidade.",
      sub_en: "JMPLA leading academic training, entrepreneurship and the future of our community.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUaULF4VKz7AMPfCly9-Y4QQMctIz6BYkUBN80F38Q-w&s=10"
    },
    {
      title_pt: "Emancipação da Mulher e Ação Social OMA",
      title_en: "Women Empowerment and OMA Social Action",
      sub_pt: "Garantindo a igualdade de oportunidades e o amparo social a todas as famílias angolanas.",
      sub_en: "Ensuring equal opportunities and social support for all Angolan families.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title_pt: "Diplomacia Cívica e Preservação da Identidade",
      title_en: "Civic Diplomacy and Preserving Identity",
      sub_pt: "Sede central de coordenação unindo a nossa pátria aos desafios e conquistas na diáspora.",
      sub_en: "Central coordination headquarter linking our homeland to the challenges and achievements in diaspora.",
      image: "https://static.euronews.com/articles/stories/06/94/41/36/1024x538_cmsv2_cce1dd0f-274d-57f6-90e8-bdf685f81aae-6944136.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Dynamic news ticker rolling text
  const tickerText = {
    PT: "📢 AVISO: Campanha de Recadastramento Digital 2026 ativa • 📅 Fórum de Negócios em Sandton no próximo mês • 🌍 Nova linha de Apoio Consular 24h aberta • 💡 Faça parte da OMA e JMPLA hoje",
    EN: "📢 NOTICE: 2026 Digital Re-registration Campaign is Active • 📅 Business Forum in Sandton next month • 🌍 New 24h Consular Support Line open • 💡 Join OMA and JMPLA today"
  }[language];

  // About tabs: Mission, Vision, Values
  const [aboutTab, setAboutTab] = useState<"mission" | "vision" | "values">("mission");

  // Interactive horizontal timeline state
  const [activeYear, setActiveYear] = useState(2026);
  const timelineData = [
    {
      year: 1956,
      title_pt: "Fundação do MPLA",
      title_en: "MPLA Foundation",
      desc_pt: "Nascimento do Movimento Popular de Libertação de Angola, lançando as bases para a autodeterminação nacional.",
      desc_en: "Birth of the Popular Movement for the Liberation of Angola, laying the ground for national self-determination.",
      milestone: "Unidade e Luta",
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=500&q=80"
    },
    {
      year: 1975,
      title_pt: "Proclamação da Independência",
      title_en: "Proclamation of Independence",
      desc_pt: "O Presidente António Agostinho Neto proclama a independência nacional de Angola em 11 de Novembro.",
      desc_en: "President António Agostinho Neto proclaims Angola's national independence on November 11th.",
      milestone: "Independência Nacional",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80"
    },
    {
      year: 2002,
      title_pt: "Conquista da Paz Definitiva",
      title_en: "Achieving Definitive Peace",
      desc_pt: "Assinatura do Memorando de Entendimento do Luena, unificando a nação e abrindo caminho para a reconstrução.",
      desc_en: "Signing of the Luena Peace Accord, unifying the nation and paving the path for massive reconstruction.",
      milestone: "Reconstrução e Paz",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80"
    },
    {
      year: 2012,
      title_pt: "Expansão da Representação na SADC",
      title_en: "SADC Representation Expansion",
      desc_pt: "Criação do Círculo de Coordenação Nacional da África do Sul, formalizando apoio à imensa comunidade diáspora.",
      desc_en: "Creation of the South Africa National Coordination Circle, formalizing institutional support for the diaspora.",
      milestone: "Presença Internacional",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80"
    },
    {
      year: 2020,
      title_pt: "Transição e Modernização Tecnológica",
      title_en: "Transition & Technological Modernization",
      desc_pt: "Lançamento de bases digitais para acompanhamento consular, cursos académicos e integração comunitária.",
      desc_en: "Launch of online portals for consular assistance tracking, academic support and community integration.",
      milestone: "Modernização",
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=500&q=80"
    },
    {
      year: 2026,
      title_pt: "Filiação Digital Unificada",
      title_en: "Unified Digital Membership",
      desc_pt: "Integração total do sistema de cartões criptografados e carteiras virtuais de apoio a todos os angolanos na África do Sul.",
      desc_en: "Full rollout of encrypted digital cards and community support hubs across all South African provinces.",
      milestone: "Futuro e Conectividade",
      image: mplaSupportersImg
    }
  ];

  // Leadership state
  const [leadershipFilter, setLeadershipFilter] = useState("all");
  const [selectedLeader, setSelectedLeader] = useState<any | null>(null);

  const leaders = [
    {
      name: "Camarada Francisco Carlos",
      role_pt: "Primeiro Secretário do Comité do Partido MPLA na África do Sul",
      role_en: "First Secretary of the MPLA Party Committee in South Africa",
      committee: "national",
      bio_pt: "Líder supremo e Primeiro Secretário da comissão executiva do comité do Partido MPLA na África do Sul, guiando a integração, filiação digital e apoio consular.",
      bio_en: "Leader and First Secretary of the executive committee of the MPLA Party Committee in South Africa, guiding integration, digital enrollment, and consular support.",
      speech_pt: "A nossa missão em toda a África do Sul é fortalecer a unidade da comunidade angolana através de inovação, amparo social e cooperação patriótica. Contacto: +27 82 555 9011 | Email: contactar@mplaas.co.za",
      speech_en: "Our mission across South Africa is to strengthen the unity of the Angolan community through innovation, social support, and patriotic cooperation. Contact: +27 82 555 9011 | Email: contactar@mplaas.co.za",
      photo: mplaPptImg
    },
    {
      name: "Camarada Manuel Mateus",
      role_pt: "Segundo Secretário do Comité de MPLA Cape Town",
      role_en: "Second Secretary of the MPLA Cape Town Committee",
      committee: "national",
      bio_pt: "Apoio direto ao Primeiro Secretário na coordenação política, supervisão das atividades regionais e alinhamento do secretariado executivo do comité.",
      bio_en: "Direct support to the First Secretary in political coordination, supervision of regional activities, and alignment of the committee's executive secretariat.",
      speech_pt: "Trabalhar em conjunto com a comunidade para fortalecer os pilares do partido na África do Sul é o nosso objetivo constante. Contacto: +27 82 777 3344 | Email: manuel.mateus@mplacapetown.co.za",
      speech_en: "Working together with the community to strengthen the party's pillars in South Africa is our constant goal. Contact: +27 82 777 3344 | Email: manuel.mateus@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Raquel Correia",
      role_pt: "Tesoureira do Comité de MPLA Cape Town",
      role_en: "Treasurer of the MPLA Cape Town Committee",
      committee: "national",
      bio_pt: "Responsável pela gestão de quotas, contabilidade e financiamento das iniciativas de solidariedade social e auxílio a famílias em condições de vulnerabilidade.",
      bio_en: "Responsible for quota management, accounting, and funding of social solidarity initiatives and assistance to families in vulnerable conditions.",
      speech_pt: "A transparência administrativa e o rigor financeiro são essenciais para darmos sustentabilidade aos projetos sociais que apoiam os nossos irmãos angolanos. Contacto: +27 82 111 8899 | Email: raquel.correia@mplacapetown.co.za",
      speech_en: "Administrative transparency and financial rigor are essential to give sustainability to social projects supporting our Angolan brothers. Contact: +27 82 111 8899 | Email: raquel.correia@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Vânia da Cruz",
      role_pt: "Secretária para a Comissão de Organização e Mobilização",
      role_en: "Secretary for the Organization and Mobilization Commission",
      committee: "national",
      bio_pt: "Gestão da mobilização de militantes, dinamização do cadastro unificado e coordenação dos núcleos de ação do partido na África do Sul.",
      bio_en: "Management of member mobilization, promotion of unified enrollment, and coordination of party action cores in South Africa.",
      speech_pt: "A mobilização contínua e a organização comunitária são a força motriz que aproxima cada angolano na diáspora. Contacto: +27 83 666 4433 | Email: vania.cruz@mplacapetown.co.za",
      speech_en: "Continuous mobilization and community organization are the driving force bringing together every Angolan in the diaspora. Contact: +27 83 666 4433 | Email: vania.cruz@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Capenda Venâncio",
      role_pt: "Secretário da Comissão para Questões Políticas e das Comunidades",
      role_en: "Secretary of the Commission for Political and Community Affairs",
      committee: "national",
      bio_pt: "Acompanhamento de assuntos comunitários, mediação política e apoio às necessidades sociais e de integração dos cidadãos angolanos.",
      bio_en: "Monitoring community affairs, political mediation, and supporting social and integration needs of Angolan citizens.",
      speech_pt: "Garantir que a voz da nossa comunidade seja ouvida e apoiada com dignidade é a nossa prioridade permanente. Contacto: +27 81 555 2211 | Email: capenda.venancio@mplacapetown.co.za",
      speech_en: "Ensuring our community's voice is heard and supported with dignity is our permanent priority. Contact: +27 81 555 2211 | Email: capenda.venancio@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Raimundo Pereira",
      role_pt: "Secretário da Comissão para a Auditoria e Disciplina",
      role_en: "Secretary of the Audit and Discipline Commission",
      committee: "national",
      bio_pt: "Garantia do cumprimento dos estatutos do partido, integridade procedimental, ética e disciplina institucional em todos os níveis do comité.",
      bio_en: "Ensuring compliance with party statutes, procedural integrity, ethics, and institutional discipline at all levels of the committee.",
      speech_pt: "A transparência e o respeito rigoroso às normas estatutárias são a garantia de um comité coeso, exemplar e forte. Contacto: +27 82 444 7788 | Email: raimundo.pereira@mplacapetown.co.za",
      speech_en: "Transparency and strict respect for statutory norms guarantee a cohesive, exemplary, and strong committee. Contact: +27 82 444 7788 | Email: raimundo.pereira@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Aurélio Sekesseke",
      role_pt: "Secretário da Formação Militante e Educação Patriótica",
      role_en: "Secretary for Member Training and Patriotic Education",
      committee: "national",
      bio_pt: "Desenvolvimento de programas de formação política, capacitação ideológica e promoção de valores patrióticos para os militantes da diáspora.",
      bio_en: "Development of political training programs, ideological capacity building, and promotion of patriotic values for diaspora members.",
      speech_pt: "A formação cívica e patriótica fortalece a consciência de cidadania e o amor intransigente à nossa Pátria. Contacto: +27 83 222 6655 | Email: aurelio.sekesseke@mplacapetown.co.za",
      speech_en: "Civic and patriotic education strengthens citizenship consciousness and uncompromising love for our Homeland. Contact: +27 83 222 6655 | Email: aurelio.sekesseke@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Tunisia Sebastião",
      role_pt: "Secretária de Informação, Propaganda e Marketing",
      role_en: "Secretary of Information, Propaganda and Marketing",
      committee: "national",
      bio_pt: "Responsável pela comunicação institucional, difusão de campanhas, newsletters informativas e fortalecimento dos laços patrióticos da comunidade diáspora.",
      bio_en: "Responsible for institutional communication, campaign dissemination, informative newsletters, and strengthening the patriotic bonds of the diaspora community.",
      speech_pt: "Uma comunidade bem informada é uma comunidade forte. A nossa prioridade é manter cada militante sintonizado com os avanços e avisos do Comité. Contacto: +27 83 444 8922 | Email: tunisia.sebastiao@mplacapetown.co.za",
      speech_en: "A well-informed community is a strong community. Our priority is to keep every member tuned with the updates and notices from the Committee. Contact: +27 83 444 8922 | Email: tunisia.sebastiao@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop"
    },
    {
      name: "Camarada Lusimanadio Soki Simão",
      role_pt: "Estratégia de Comunicação, Mídia Digital e Suporte",
      role_en: "Communication Strategy, Digital Media and Technical Support",
      committee: "national",
      bio_pt: "Arquiteto de sistemas digitais do portal, responsável por toda infraestrutura de dados de militantes, emissão de credenciais eletrónicas e segurança.",
      bio_en: "Portal digital systems architect, responsible for all membership data infrastructure, electronic credential issuance, and technical security.",
      speech_pt: "Usar a tecnologia para conectar a nossa diáspora de forma segura e ágil é o nosso maior compromisso de modernização institucional. Contacto: +27 82 999 1234 | Email: lusimanadio.simao@mplacapetown.co.za",
      speech_en: "Using technology to safely and agilely connect our diaspora is our highest commitment to institutional modernization. Contact: +27 82 999 1234 | Email: lusimanadio.simao@mplacapetown.co.za",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop"
    }
  ];

  // Leadership team state
  const leadershipTeam = (leadership && leadership.length > 0) ? leadership : leaders;



  // Netflix-style Events Countdown & Category Filter State
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("all");
  const [eventCountdowns, setEventCountdowns] = useState<Record<string, string>>({});
  
  const eventList = useMemo(() => [
    {
      id: "evt-conf-1",
      category: "conference",
      badge_pt: "Conferência",
      badge_en: "Conference",
      badgeStyle: "bg-[#B5121B] text-white border-red-400/40",
      title_pt: "Conferência Provincial de Quadros e Militantes - Gauteng 2026",
      title_en: "Gauteng Provincial Officers and Members Conference 2026",
      location: "Sandton Convention Centre, Johannesburg",
      date_pt: "12 de Agosto de 2026",
      date_en: "August 12, 2026",
      time: "09:00 - 16:00",
      image: EVENT_CONFERENCE_COVER,
      rawDate: "2026-08-12T09:00:00"
    },
    {
      id: "evt-rally-1",
      category: "rally",
      badge_pt: "Comício",
      badge_en: "Rally",
      badgeStyle: "bg-amber-600 text-white border-amber-400/40",
      title_pt: "Comício da Juventude e Palestra sobre Integração e Liderança Cívica",
      title_en: "Youth Rally and Seminar on Civic Leadership and Integration",
      location: "Pretoria Town Hall, Tshwane",
      date_pt: "29 de Agosto de 2026",
      date_en: "August 29, 2026",
      time: "14:00 - 18:00",
      image: EVENT_RALLY_COVER,
      rawDate: "2026-08-29T14:00:00"
    },
    {
      id: "evt-workshop-1",
      category: "workshop",
      badge_pt: "Workshop",
      badge_en: "Workshop",
      badgeStyle: "bg-emerald-700 text-white border-emerald-400/40",
      title_pt: "Workshop Estratégico de Governação, Formação e Planeamento",
      title_en: "Strategic Workshop on Governance, Training and Planning",
      location: "Sede Executiva MPLA, Western Cape",
      date_pt: "04 de Setembro de 2026",
      date_en: "September 04, 2026",
      time: "09:30 - 15:00",
      image: EVENT_WORKSHOP_COVER,
      rawDate: "2026-09-04T09:30:00"
    },
    {
      id: "evt-forum-1",
      category: "forum",
      badge_pt: "Fórum",
      badge_en: "Forum",
      badgeStyle: "bg-blue-700 text-white border-blue-400/40",
      title_pt: "Fórum da Diáspora e Encontro de Negócios para Jovens Empreendedores",
      title_en: "Diaspora Forum & Business Linkage for Youth Entrepreneurs",
      location: "Cape Town ICC, Western Cape",
      date_pt: "08 de Setembro de 2026",
      date_en: "September 08, 2026",
      time: "10:00 - 14:00",
      image: EVENT_FORUM_COVER,
      rawDate: "2026-09-08T10:00:00"
    },
    {
      id: "evt-workshop-2",
      category: "workshop",
      badge_pt: "Workshop & Linhas",
      badge_en: "Workshop & Policy",
      badgeStyle: "bg-purple-700 text-white border-purple-400/40",
      title_pt: "Workshop de Linhas Orientadoras e Formação Política de Quadros",
      title_en: "Cadre Training Workshop & Political Policy Guidelines",
      location: "Auditório Central de Formação, Johannesburg",
      date_pt: "18 de Setembro de 2026",
      date_en: "September 18, 2026",
      time: "13:00 - 17:00",
      image: EVENT_SEMINAR_COVER,
      rawDate: "2026-09-18T13:00:00"
    },
    {
      id: "evt-rally-2",
      category: "rally",
      badge_pt: "Comício & Mobilização",
      badge_en: "Rally & Mobilization",
      badgeStyle: "bg-amber-600 text-white border-amber-400/40",
      title_pt: "Grande Comício e Acto de Mobilização Cívico-Patriótica da Comunidade",
      title_en: "Grand Rally & Civic-Patriotic Mobilization of the Community",
      location: "Pretoria Showground Arena, Gauteng",
      date_pt: "26 de Setembro de 2026",
      date_en: "September 26, 2026",
      time: "10:00 - 15:30",
      image: EVENT_COMMUNITY_COVER,
      rawDate: "2026-09-26T10:00:00"
    }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const updated: Record<string, string> = {};
      
      eventList.forEach((evt) => {
        const target = new Date(evt.rawDate).getTime();
        const diff = target - now;
        if (diff < 0) {
          updated[evt.id] = "EVENT LIVE";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          updated[evt.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setEventCountdowns(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [eventList]);

  const filteredEvents = useMemo(() => {
    if (eventCategoryFilter === "all") return eventList;
    return eventList.filter(e => e.category === eventCategoryFilter);
  }, [eventCategoryFilter, eventList]);

  // Community Gallery Lightbox, Webpage & Filter state
  const [showGalleryPage, setShowGalleryPage] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState("all");
  const [gallerySearchTerm, setGallerySearchTerm] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Synchronize hash with gallery page
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === "#gallery" || h === "#galeria") {
        setShowGalleryPage(true);
        setSelectedArticle(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleOpenGallery = () => {
    setShowGalleryPage(true);
    setSelectedArticle(null);
    window.location.hash = "gallery";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseGallery = () => {
    setShowGalleryPage(false);
    if (window.location.hash === "#gallery" || window.location.hash === "#galeria") {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const localGalleryItems = useMemo(() => getAllLocalGalleryImages(), []);

  const galleryImages = useMemo(() => {
    const fallbackPublicImages: LocalGalleryItem[] = [
      { 
        id: "pub-1", 
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUaULF4VKz7AMPfCly9-Y4QQMctIz6BYkUBN80F38Q-w&s=10", 
        filename: "jmpla_quadros.jpg",
        category: "events", 
        title_pt: "JMPLA - Reunião Geral de Quadros e Juventude", 
        title_en: "JMPLA - General Officers and Youth Meeting", 
        title_fr: "JMPLA - Réunion Générale des Cadres et de la Jeunesse", 
        tag_pt: "Juventude", 
        tag_en: "Youth", 
        tag_fr: "Jeunesse" 
      },
      { 
        id: "pub-2", 
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5dmmZOI1ueDakZtkqMPnmf0eiT0u1cSnhl0Y2VfhY9hQMfZ9Gld5iCJZv&s=10", 
        filename: "jmpla_academico.jpg",
        category: "education", 
        title_pt: "JMPLA - Fórum Académico e Formação em Gauteng", 
        title_en: "JMPLA - Academic Forum and Training in Gauteng", 
        title_fr: "JMPLA - Forum Académique et Formation à Gauteng", 
        tag_pt: "Educação", 
        tag_en: "Education", 
        tag_fr: "Éducation" 
      },
      { 
        id: "pub-3", 
        url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80", 
        filename: "oma_delegacao.jpg",
        category: "community", 
        title_pt: "OMA - Delegação Feminina no Congresso Regional", 
        title_en: "OMA - Women Delegation at Regional Congress", 
        title_fr: "OMA - Délégation Féminine au Congrès Régional", 
        tag_pt: "Solidariedade", 
        tag_en: "Solidarity", 
        tag_fr: "Solidarité" 
      },
      { 
        id: "pub-4", 
        url: "https://static.euronews.com/articles/stories/06/94/41/36/1024x538_cmsv2_cce1dd0f-274d-57f6-90e8-bdf685f81aae-6944136.jpg", 
        filename: "mpla_campanha.jpg",
        category: "events", 
        title_pt: "MPLA - Lançamento da Campanha Nacional de Mobilização", 
        title_en: "MPLA - National Mobilization Campaign Launch", 
        title_fr: "MPLA - Lancement de la Campagne Nationale de Mobilisation", 
        tag_pt: "Nacional", 
        tag_en: "National", 
        tag_fr: "National" 
      },
      { 
        id: "pub-5", 
        url: "https://cdn.dailymaverick.co.za/dailymaverick/wp-content/uploads/2022/01/000_9D84GG-1.jpg", 
        filename: "diaspora_apoio.jpg",
        category: "culture", 
        title_pt: "Militantes e Comunidade Angolana na Diáspora Sul-Africana", 
        title_en: "Members and Angolan Community in South African Diaspora", 
        title_fr: "Militants et Communauté Angolaise dans la Diaspora Sud-Africaine", 
        tag_pt: "Diáspora", 
        tag_en: "Diaspora", 
        tag_fr: "Diaspora" 
      }
    ];

    // Priority: All local uploaded images from src/assets/images, then fallback public images
    return [...localGalleryItems, ...fallbackPublicImages];
  }, [localGalleryItems]);

  const filteredGallery = useMemo(() => {
    let items = galleryImages;
    if (galleryCategory !== "all") {
      if (galleryCategory === "official") {
        items = items.filter(img => 
          img.id.toLowerCase().startsWith("img_") || 
          img.id.includes("640") || 
          img.id.includes("Comitee") || 
          img.id.includes("PPT") || 
          img.id.includes("supporters") || 
          img.id.includes("presidents")
        );
      } else {
        items = items.filter(img => img.category === galleryCategory);
      }
    }
    if (gallerySearchTerm.trim()) {
      const q = gallerySearchTerm.toLowerCase();
      items = items.filter(img => 
        (img.title_pt && img.title_pt.toLowerCase().includes(q)) ||
        (img.title_en && img.title_en.toLowerCase().includes(q)) ||
        (img.tag_pt && img.tag_pt.toLowerCase().includes(q)) ||
        (img.tag_en && img.tag_en.toLowerCase().includes(q)) ||
        (img.filename && img.filename.toLowerCase().includes(q))
      );
    }
    return items;
  }, [galleryCategory, galleryImages, gallerySearchTerm]);

  // Video Section state
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Donation Modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Al Jazeera News Article Modal state
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  useEffect(() => {
    if (selectedArticle) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedArticle]);

  // Curated current publicly available news about MPLA and the Diaspora
  const defaultArticles = [
    {
      title_pt: "Convocação Oficial do IX Congresso Ordinário do MPLA: Renovação de Mandatos e Rumo a 2027",
      title_en: "Official Call for MPLA's 9th Ordinary Congress: Mandate Renewal and Roadmap to 2027",
      category_pt: "CONGRESSO NACIONAL",
      category_en: "NATIONAL CONGRESS",
      date: "28 Set 2026",
      readTime: "5 min read",
      image: "/src/assets/images/IMG_6400.JPG",
      desc_pt: "O Bureau Político e o Comité Central confirmaram o IX Congresso Ordinário para 9 e 10 de Dezembro de 2026 em Luanda, reunindo mais de 3.000 delegados sob o lema 'MPLA – Compromisso com o Povo, Confiança no Futuro'.",
      desc_en: "The Political Bureau and Central Committee confirmed the 9th Ordinary Congress for December 9-10, 2026 in Luanda, gathering over 3,000 delegates under the motto 'MPLA – Commitment to the People, Trust in the Future'.",
      content_pt: "O Comité Central do MPLA anunciou formalmente a realização do seu IX Congresso Ordinário para os dias 9 e 10 de Dezembro de 2026, na capital do país, Luanda. Com a presença estimada de cerca de 3.000 delegados oriundos das 18 províncias angolanas e das diversas estruturas partidárias na diáspora internacional, o conclave decorrerá sob o lema 'MPLA – Compromisso com o Povo, Confiança no Futuro'.\n\nEntre as novidades centrais deste congresso destaca-se a directiva que reserva pelo menos 15% dos futuros membros do Comité Central diretamente para militantes provenientes das bases do partido. As conferências municipais e provinciais, incluindo a 14ª Conferência Provincial Ordinária de Luanda, marcam a renovação democrática e a consolidação programática com vista aos grandes desafios sociais, económicos e políticos de Angola.",
      content_en: "The MPLA Central Committee formally announced its 9th Ordinary Congress for December 9-10, 2026, in the capital city of Luanda. Bringing together approximately 3,000 delegates representing all 18 Angolan provinces and overseas diaspora structures, the congress is convened under the motto 'MPLA – Commitment to the People, Trust in the Future'.\n\nA key innovation is the directive ensuring that at least 15% of the next Central Committee will be elected directly from grassroots party branches. Municipal and provincial conferences—including the 14th Luanda Provincial Conference—reinforce democratic renewal and programmatic cohesion as the party shapes Angola's socio-economic and political priorities."
    },
    {
      title_pt: "João Lourenço Valida Recandidatura à Liderança do MPLA com Mais de 11 Mil Subscrições",
      title_en: "João Lourenço Formalizes Re-Election Bid for MPLA Presidency Backed by 11,000 Signatures",
      desc_pt: "Com ampla sustentação das estruturas provinciais e das bases militantes, o Presidente do partido formalizou a recandidatura com foco na estabilidade governativa e diversificação produtiva.",
      desc_en: "Backed by broad provincial endorsement and grassroots party members, the Party President formalized his re-election candidacy focusing on institutional stability and productive diversification.",
      category_pt: "LIDERANÇA",
      category_en: "LEADERSHIP",
      date: "26 Set 2026",
      readTime: "4 min read",
      image: "/src/assets/images/Comitee.jpg",
      content_pt: "A Comissão Nacional de Mandatos validou formalmente a candidatura de João Lourenço à presidência do MPLA para o próximo mandato, após a verificação rigorosa de mais de 11.000 assinaturas subscritas por militantes de todo o território nacional e das estruturas na diáspora.\n\nAo reafirmar a sua determinação em continuar a liderar a força política histórica de Angola, João Lourenço sublinhou a prioridade de preservar a coesão interna do partido, aprofundar as reformas económicas estruturais e acelerar o desenvolvimento de infraestruturas essenciais para a melhoria do nível de vida das populações.",
      content_en: "The National Mandates Commission officially validated João Lourenço's candidacy for the MPLA presidency for the forthcoming term, following the rigorous verification of more than 11,000 member endorsements nationwide and across foreign branches.\n\nReaffirming his commitment to guiding Angola's leading political movement, João Lourenço highlighted the preservation of internal cohesion, deepening structural economic reforms, and accelerating critical infrastructure development to enhance citizens' quality of life."
    },
    {
      title_pt: "Comité do MPLA na África do Sul Realiza Conferência de Balanço e Reforça Apoio Consular à Comunidade",
      title_en: "MPLA Committee in South Africa Holds Review Conference and Expands Consular Community Support",
      desc_pt: "Reunião plenária em Joanesburgo e Cidade do Cabo estrutura novas medidas para regularização documental, emissão do cartão digital e assistência a famílias e estudantes angolanos.",
      desc_en: "Plenary assembly across Johannesburg and Cape Town sets out key initiatives for residence visa regularizations, digital member card rollouts, and student assistance.",
      category_pt: "DIÁSPORA SADC",
      category_en: "SADC DIASPORA",
      date: "22 Set 2026",
      readTime: "4 min read",
      image: "/src/assets/images/IMG_6401.JPG",
      content_pt: "A Comunidade Angolana e o Comité do MPLA na África do Sul realizaram a sua V Conferência Ordinária de Balanço e Renovação de Mandatos, coordenada em articulação direta com a representação do Bureau Político do Comité Central para a Diáspora. A conferência elegeu os novos corpos diretivos e estabeleceu as metas prioritárias de apoio cívico.\n\nEntre as decisões centrais figura a criação de um gabinete permanente de auxílio à regularização de autorizações de residência e vistos sul-africanos, em estreita colaboração com os Consulados Gerais de Joanesburgo e da Cidade do Cabo, além do lançamento massivo da emissão do novo Cartão Digital de Militante com validação biométrica.",
      content_en: "The Angolan Community and MPLA Committee in South Africa held their 5th Ordinary Review and Mandate Renewal Conference, coordinated directly with the Central Committee Political Bureau Diaspora Oversight Group. The conference elected new leadership bodies and established priority targets for civic support.\n\nKey resolutions include creating a permanent desk to facilitate South African residence permits and visa paperwork in close partnership with the Consulates General in Johannesburg and Cape Town, alongside deploying the new Digital Membership Card with secure verification."
    },
    {
      title_pt: "Diplomacia Económica: Angola Defende na 81ª Assembleia Geral da ONU Parcerias na SADC e Corredor do Lobito",
      title_en: "Economic Diplomacy: Angola Advocates at 81st UN General Assembly for SADC Trade and Lobito Corridor",
      desc_pt: "Em Nova Iorque, a representação angolana apelou à reforma da arquitetura financeira internacional e destacou os corredores ferroviários como motor de integração da África Austral.",
      desc_en: "In New York, the Angolan representation called for international financial architecture reform and highlighted railway corridors as catalysts for Southern African integration.",
      category_pt: "RELAÇÕES EXTERNAS",
      category_en: "EXTERNAL RELATIONS",
      date: "20 Set 2026",
      readTime: "4 min read",
      image: "/src/assets/images/mpla_supporters_background_1784328681804.jpg",
      content_pt: "Durante o debate geral da 81ª Sessão da Assembleia Geral das Nações Unidas em Nova Iorque, a diplomacia de Angola enfatizou a necessidade imperativa de mecanismos de financiamento mais justos e acessíveis para as economias emergentes do continente africano.\n\nFoi sublinhado o papel estruturante de Angola como ponte comercial e logística da SADC, com destaque para a modernização do Corredor do Lobito, que liga o Oceano Atlântico ao cinturão mineiro da RDC e Zâmbia, potenciando oportunidades conjuntas de investimento com a África do Sul e outros parceiros estratégicos.",
      content_en: "Addressing the General Debate of the 81st UN General Assembly in New York, Angolan diplomacy emphasized the urgent necessity for more equitable and accessible financing mechanisms tailored to African developing economies.\n\nAngola's pivotal role as a commercial and logistics gateway for SADC was underscored, drawing attention to the modernization of the Lobito Corridor connecting the Atlantic Ocean to the regional copperbelt, unlocking bilateral investment synergies with South Africa and international partners."
    },
    {
      title_pt: "JMPLA e OMA Dinamizam Fórum de Empreendedorismo Juvenil e Assistência Social em Gauteng",
      title_en: "JMPLA and OMA Launch Youth Entrepreneurship and Social Support Forum in Gauteng",
      desc_pt: "Dezenas de estudantes e jovens profissionais participaram no ciclo de debates sobre inserção no mercado de trabalho sul-africano e projectos de desenvolvimento comunitário.",
      desc_en: "Dozens of students and young professionals participated in dialogue sessions addressing career access in South Africa and grassroots community development.",
      category_pt: "JUVENTUDE & OMA",
      category_en: "YOUTH & OMA",
      date: "15 Set 2026",
      readTime: "3 min read",
      image: "/src/assets/images/PPT.jpeg",
      content_pt: "As organizações de massa do MPLA na África do Sul (JMPLA e OMA) uniram esforços para realizar uma jornada multidisciplinar em Joanesburgo voltada para o empoderamento económico e cívico da juventude angolana residente no país.\n\nO encontro abordou estratégias práticas de validação de diplomas académicos nas universidades sul-africanas, criação de cooperativas juvenis de serviços digitais e campanhas solidárias para amparar famílias vulneráveis em situação de emergência habitacional e alimentar.",
      content_en: "The mass organizations of the MPLA in South Africa (JMPLA and OMA) joined forces in Johannesburg to hold a multi-faceted summit dedicated to the civic and economic empowerment of the resident Angolan youth.\n\nThe forum examined practical strategies for foreign academic degree equivalencies in South African tertiary institutions, establishing youth service cooperatives, and grassroots solidarity campaigns aiding vulnerable families with shelter and food security."
    },
    {
      title_pt: "MPLA e ANC Reafirmam Aliança Histórica e Compromisso com a Estabilidade na Região Austral",
      title_en: "MPLA and ANC Reaffirm Historic Alliance and Mutual Commitment to Southern African Stability",
      desc_pt: "Delegações partidárias de Angola e da África do Sul reuniram-se para estreitar os laços de fraternidade política e coordenação regional na SADC.",
      desc_en: "Party delegations from Angola and South Africa met to strengthen fraternal political bonds and regional coordination across the SADC block.",
      category_pt: "COOPERAÇÃO BILATERAL",
      category_en: "BILATERAL COOPERATION",
      date: "08 Set 2026",
      readTime: "3 min read",
      image: "/src/assets/images/IMG_6218.JPG",
      content_pt: "Representantes do MPLA e do African National Congress (ANC) reiteraram a profundidade das relações históricas que unem os dois movimentos de libertação desde a luta comum contra o regime do apartheid e o colonialismo na África Austral.\n\nO encontro enfatizou a importância da concertação política contínua para assegurar a paz na República Democrática do Congo e em Cabo Delgado, bem como o incremento do intercâmbio comercial e da livre circulação segura de cidadãos no espaço regional.",
      content_en: "Delegations from the MPLA and the African National Congress (ANC) reaffirmed their deep historical partnership rooted in their shared struggle against apartheid and colonialism across Southern Africa.\n\nThe meeting highlighted continuous political consultations to foster peace in the DRC and Cabo Delgado, while advancing cross-border commerce and safe mobility for citizens throughout the region."
    }
  ];

  const [newsArticles, setNewsArticles] = useState<any[]>(defaultArticles);
  const [tickerNews, setTickerNews] = useState<string>("");
  const [loadingNews, setLoadingNews] = useState<boolean>(false);
  const [geminiNewsRaw, setGeminiNewsRaw] = useState<any>(null);

  useEffect(() => {
    setLoadingNews(true);
    fetch("/api/news/gemini")
      .then(res => res.json())
      .then(data => {
        setGeminiNewsRaw(data);
        if (data.articles && data.articles.length > 0) {
          setNewsArticles(data.articles);
        }
        setLoadingNews(false);
      })
      .catch(err => {
        console.error("Error fetching Gemini news:", err);
        setLoadingNews(false);
      });
  }, []);

  useEffect(() => {
    if (geminiNewsRaw) {
      setTickerNews(language === "PT" ? geminiNewsRaw.ticker_pt : geminiNewsRaw.ticker_en);
    } else {
      setTickerNews(
        language === "PT" 
          ? "• IX Congresso Ordinário do MPLA agendado para 9-10 de Dezembro de 2026 em Luanda • João Lourenço formaliza recandidatura à liderança do partido • Comité do MPLA na África do Sul reforça assistência à regularização documental • Angola destaca na 81ª AG da ONU parcerias na SADC e Corredor do Lobito • JMPLA e OMA expandem acções sociais"
          : "• MPLA 9th Ordinary Congress scheduled for December 9-10, 2026 in Luanda • João Lourenço formalizes re-election bid for party leadership • MPLA South Africa Committee strengthens document regularization support • Angola highlights SADC partnerships and Lobito Corridor at 81st UN General Assembly • JMPLA and OMA expand diaspora social campaigns"
      );
    }
  }, [language, geminiNewsRaw]);

  // Dropdown for Sobre in navigation
  const [showSobreDropdown, setShowSobreDropdown] = useState(false);

  // Testimonials Auto-slide Carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      quote_pt: "O amparo e dedicação do Comitê de Solidariedade do MPLA na África do Sul permitiram-me renovar a minha documentação civil e encontrar um ambiente acolhedor e seguro para as minhas filhas estudarem em Gauteng.",
      quote_en: "The care and commitment of the MPLA Solidarity Committee in South Africa enabled me to renew my civil documents and find a welcoming and secure environment for my daughters to study in Gauteng.",
      author: "Maria de Lurdes Neto",
      role_pt: "Estudante e Mãe, Residente em Germiston",
      role_en: "Student and Mother, Residing in Germiston",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
    },
    {
      quote_pt: "O Fórum de Jovens Empreendedores da JMPLA foi o catalisador ideal para conectar a minha startup de consultoria de rede a investidores bilaterais em Luanda. Um ecossistema de excelência e amizade profunda.",
      quote_en: "The JMPLA Young Entrepreneurs Forum was the perfect catalyst to connect my networking startup to bilateral investors in Luanda. A community of excellence and deep solidarity.",
      author: "Camarada Dr. Mateus Simão",
      role_pt: "Engenheiro de Redes, Membro em Cape Town",
      role_en: "Network Engineer, Cape Town Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(slideTimer);
  }, [testimonials.length]);

  // Form handling
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Global search autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchAutocomplete, setShowSearchAutocomplete] = useState(false);
  const searchableItems = [
    { text_pt: "Registo Digital de Militantes 2026", text_en: "2026 Digital Membership Registration", link: "#membership" },
    { text_pt: "Calendário de Reuniões de Gauteng", text_en: "Gauteng Meeting Calendars", link: "#events" },
    { text_pt: "Estatutos Oficiais do Partido (PDF)", text_en: "Official Party Statutes (PDF)", link: "#infocenter" },
    { text_pt: "OMA Apoio Social e Cívico", text_en: "OMA Civic & Social Welfare Support", link: "#about" },
    { text_pt: "Apostila Consular e Bolsas JMPLA", text_en: "Consular Registration & JMPLA Bursaries", link: "#about" }
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchableItems.filter(item => 
      item.text_pt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.text_en.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div 
      className={`min-h-screen antialiased transition-all duration-300 ${
        highContrast ? "bg-black text-white" : "bg-[#FAF9F5] text-slate-900"
      } ${
        fontSize === "large" ? "text-lg" : fontSize === "xlarge" ? "text-xl" : "text-base"
      }`}
      id="portal-root"
    >
      {/* ACCESS ACCESSIBILITY & TICKER HEADER */}
      <div className="relative z-50 bg-[#151515] text-white border-b border-neutral-800 text-xs py-1.5 px-4 overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Dynamic News Ticker */}
          <div className="flex items-center gap-2 overflow-hidden w-full md:w-3/5">
            <span className="bg-[#B5121B] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
              LATEST
            </span>
            <div className="relative w-full overflow-hidden h-4">
              <motion.div 
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute whitespace-nowrap text-[11px] font-medium text-amber-400"
              >
                {tickerText}
              </motion.div>
            </div>
          </div>

          {/* Accessibility controls */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Font Scaling */}
            <div className="flex items-center gap-1.5 border-r border-neutral-800 pr-3">
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <button 
                onClick={() => setFontSize("normal")} 
                className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${fontSize === "normal" ? "bg-amber-400 text-black" : "text-slate-400 hover:text-white"}`}
                title="Normal Font"
              >
                A
              </button>
              <button 
                onClick={() => setFontSize("large")} 
                className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${fontSize === "large" ? "bg-amber-400 text-black" : "text-slate-400 hover:text-white"}`}
                title="Large Font"
              >
                A+
              </button>
              <button 
                onClick={() => setFontSize("xlarge")} 
                className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${fontSize === "xlarge" ? "bg-amber-400 text-black" : "text-slate-400 hover:text-white"}`}
                title="Extra Large Font"
              >
                A++
              </button>
            </div>

            {/* High Contrast */}
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white"
              aria-label="Toggle contrast theme"
            >
              {highContrast ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
              <span>{highContrast ? "NORMAL" : "CONTRAST"}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 font-bold text-[11px] pl-2 border-l border-neutral-800">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <button onClick={() => setLanguage("PT")} className={`hover:text-white ${language === "PT" ? "text-amber-400 underline" : "text-slate-400"}`}>PT</button>
              <span className="text-neutral-700">|</span>
              <button onClick={() => setLanguage("EN")} className={`hover:text-white ${language === "EN" ? "text-amber-400 underline" : "text-slate-400"}`}>EN</button>
              <span className="text-neutral-700">|</span>
              <button onClick={() => setLanguage("FR")} className={`hover:text-white ${language === "FR" ? "text-amber-400 underline" : "text-slate-400"}`}>FR</button>
            </div>
          </div>
        </div>
      </div>

      {/* LUXURIOUS FLOATING STICKY HEADER */}
      <header 
        className="sticky top-0 z-40 transition-all duration-300 w-full bg-[#B5121B] text-white shadow-xl py-4"
        id="navbar-site"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 flex items-center justify-between">
          {/* Logo Brand */}
          <a href="#portal-root" onClick={handleCloseGallery} className="flex items-center gap-3.5 group cursor-pointer">
            <div className="w-12 h-12 bg-transparent border-0 border-none outline-none ring-0 shadow-none flex items-center justify-center p-0 logo-transparent transform group-hover:scale-105 transition duration-300">
              <img 
                src={LOCAL_MPLA_PARTY_LOGO} 
                alt="MPLA Logo" 
                className="w-full h-full object-contain bg-transparent border-0 border-none outline-none ring-0 logo-transparent"
              />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white uppercase font-display">
                MPLA África do Sul
              </h2>
              <p className="text-[9px] text-[#D4AF37] font-mono font-black tracking-widest mt-1 uppercase">
                {language === "PT" ? "UNIDADE, LUTA, PROGRESSO" : language === "FR" ? "UNITÉ, LUTTE, PROGRÈS" : "UNITY, STRUGGLE, PROGRESS"}
              </p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-widest text-slate-100">
            {/* SOBRE DROPDOWN */}
            <div 
              className="relative"
              onMouseEnter={() => setShowSobreDropdown(true)}
              onMouseLeave={() => setShowSobreDropdown(false)}
            >
              <button 
                className="hover:text-amber-300 transition flex items-center gap-1 py-2 font-bold uppercase tracking-widest text-xs cursor-pointer bg-transparent border-0 text-slate-100"
              >
                {language === "PT" ? "Sobre" : language === "FR" ? "À Propos" : "About"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSobreDropdown ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {showSobreDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-48 bg-slate-900 border border-neutral-800 rounded-xl shadow-2xl p-2 flex flex-col z-50 text-left"
                  >
                    <a 
                      href="#about" 
                      onClick={() => { handleCloseGallery(); setShowSobreDropdown(false); }}
                      className="px-3 py-2 text-xs font-bold text-slate-100 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      MPLA
                    </a>
                    <a 
                      href="#jmpla" 
                      onClick={() => { handleCloseGallery(); setShowSobreDropdown(false); }}
                      className="px-3 py-2 text-xs font-bold text-slate-100 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      JMPLA
                    </a>
                    <a 
                      href="#oma" 
                      onClick={() => { handleCloseGallery(); setShowSobreDropdown(false); }}
                      className="px-3 py-2 text-xs font-bold text-slate-100 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      OMA
                    </a>
                    <a 
                      href="#secretariado" 
                      onClick={() => { handleCloseGallery(); setShowSobreDropdown(false); }}
                      className="px-3 py-2 text-xs font-bold text-slate-100 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      Secretariado
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#news" onClick={handleCloseGallery} className="hover:text-amber-300 transition">{language === "PT" ? "Notícias" : language === "FR" ? "Actualités" : "News"}</a>
            <a href="#events" onClick={handleCloseGallery} className="hover:text-amber-300 transition">{language === "PT" ? "Eventos" : language === "FR" ? "Événements" : "Events"}</a>
            
            <button 
              onClick={handleOpenGallery}
              className={`hover:text-amber-300 transition uppercase tracking-widest text-xs font-bold cursor-pointer bg-transparent border-0 p-0 ${
                showGalleryPage ? "text-[#FFCC00] font-black underline underline-offset-8 decoration-2" : "text-slate-100"
              }`}
            >
              {language === "PT" ? "Galeria" : language === "FR" ? "Galerie" : "Gallery"}
            </button>

            <a href="#membership" onClick={handleCloseGallery} className="hover:text-amber-300 transition">{language === "PT" ? "Filiação" : language === "FR" ? "Adhésion" : "Join"}</a>
            <a href="#contact" onClick={handleCloseGallery} className="hover:text-amber-300 transition">{language === "PT" ? "Contacto" : language === "FR" ? "Contact" : "Contact"}</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenScanner && (
              <button 
                onClick={onOpenScanner}
                className="px-3 py-2 text-xs font-bold bg-slate-950/80 border border-amber-400/40 text-amber-300 hover:bg-slate-900 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Validar Cartão de Militante com QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{language === "PT" ? "Verificar" : language === "FR" ? "Vérifier" : "Verify"}</span>
              </button>
            )}
            <button 
              onClick={() => onNavigateToAuth("signin")}
              className="px-4 py-2 text-xs font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 transition cursor-pointer shadow-md"
            >
              {language === "PT" ? "Entrar" : language === "FR" ? "Connexion" : "Login"}
            </button>
            <button 
              onClick={() => setShowDonationModal(true)}
              className="px-3.5 py-2 text-xs font-bold bg-[#D4AF37] text-slate-950 hover:bg-yellow-500 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              {language === "PT" ? "Doar" : language === "FR" ? "Faire un Don" : "Donate"}
            </button>
          </div>
        </div>
      </header>


      {selectedArticle ? (
        /* PREMIUM AND PROFESSIONALLY FORMATTED WEB ARTICLE WEBPAGE */
        <main className="min-h-screen bg-[#FAF9F5] dark:bg-[#0c0c0e] py-8 sm:py-12 animate-fade-in" id="web-article-container">
          <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
            
            {/* Breadcrumbs and Back Button Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5 mb-8">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <button onClick={() => setSelectedArticle(null)} className="hover:text-[#B5121B] transition font-bold uppercase cursor-pointer bg-transparent border-0 p-0">
                  {language === "PT" ? "Início" : "Home"}
                </button>
                <span>/</span>
                <span className="text-slate-400 uppercase">
                  {language === "PT" ? "Imprensa & Notícias" : "Press & News"}
                </span>
                <span>/</span>
                <span className="text-[#B5121B] dark:text-amber-400 font-bold uppercase truncate max-w-[200px]">
                  {language === "PT" ? selectedArticle.category_pt || "NOTÍCIA" : selectedArticle.category_en || "NEWS"}
                </span>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-[#B5121B] rounded-xl hover:text-[#B5121B] transition cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#B5121B]" />
                {language === "PT" ? "Voltar ao Início" : "Back to Home"}
              </button>
            </div>

            {/* Main Article Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Extensive Reading view */}
              <article className="lg:col-span-8 bg-white dark:bg-neutral-950 border border-slate-200/80 dark:border-neutral-900 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
                
                {/* Headline Info */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-[#B5121B] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-md shadow-xs">
                      {language === "PT" ? selectedArticle.category_pt || "NOTÍCIAS" : selectedArticle.category_en || "NEWS"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold font-mono">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {selectedArticle.date}
                    </span>
                    <span className="text-slate-300 dark:text-neutral-800">•</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold font-mono">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {selectedArticle.readTime || "4 min read"}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                    {language === "PT" ? selectedArticle.title_pt : selectedArticle.title_en}
                  </h1>

                  {/* Subheadline Summary Lead */}
                  <div className="border-l-4 border-amber-400 pl-4 py-1 italic font-serif text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-50 dark:bg-neutral-900/40 pr-3 rounded-r-xl">
                    {language === "PT" ? selectedArticle.summary_pt || selectedArticle.desc_pt : selectedArticle.summary_en || selectedArticle.desc_en}
                  </div>
                </div>

                {/* Primary Large Cover Image */}
                {selectedArticle.image && (
                  <div className="space-y-2">
                    <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-neutral-900 aspect-video w-full max-h-[460px]">
                      <img 
                        src={selectedArticle.image} 
                        alt="News Illustration" 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02] filter brightness-[0.98]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono italic text-center">
                      {language === "PT" 
                        ? `Foto: Serviço de Imprensa do Comité do MPLA na África do Sul • Cobertura oficial`
                        : `Photo: MPLA Committee South Africa Press Service • Official coverage`}
                    </p>
                  </div>
                )}

                {/* Shared Social & Download bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={LOCAL_MPLA_PARTY_LOGO} 
                      alt="MPLA Logo" 
                      className="w-5 h-5 object-contain bg-transparent"
                    />
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      {language === "PT" ? "Por: Gabinete de Imprensa MPLA SADC" : "By: MPLA SADC Press Office"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(language === "PT" ? selectedArticle.title_pt : selectedArticle.title_en);
                        showToast(language === "PT" ? "Título do artigo copiado para a área de transferência!" : "Article title copied to clipboard!", "success");
                      }}
                      className="p-2 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#B5121B]" />
                      <span className="hidden sm:inline">{language === "PT" ? "Partilhar" : "Share"}</span>
                    </button>
                    <button 
                      onClick={() => {
                        const articleTitle = language === "PT" ? selectedArticle.title_pt : selectedArticle.title_en;
                        const articleCategory = language === "PT" ? selectedArticle.category_pt : selectedArticle.category_en;
                        const articleContent = language === "PT" ? selectedArticle.content_pt : selectedArticle.content_en;
                        const printHtml = `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>${articleTitle}</title>
                              <style>
                                body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
                                .badge { background: #C8102E; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; }
                                h1 { color: #0f172a; font-size: 24px; margin-top: 15px; }
                                .meta { color: #64748b; font-size: 12px; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                                .content { font-size: 14px; white-space: pre-line; }
                              </style>
                            </head>
                            <body>
                              <span class="badge">${articleCategory}</span>
                              <h1>${articleTitle}</h1>
                              <div class="meta">${selectedArticle.date} • MPLA África do Sul</div>
                              <div class="content">${articleContent}</div>
                            </body>
                          </html>
                        `;
                        safePrintHtml(printHtml, articleTitle);
                      }}
                      className="p-2 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-500" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                {/* Professional Body Copy */}
                <div className="text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-serif space-y-6 whitespace-pre-line text-justify pt-2">
                  {language === "PT" ? selectedArticle.content_pt : selectedArticle.content_en}
                </div>

                {/* Pull-quote Highlight Block */}
                <div className="bg-slate-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-slate-200/50 dark:border-neutral-800/80 my-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      {language === "PT" ? "Compromisso de Trabalho" : "Working Commitment"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm italic font-serif text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === "PT" 
                      ? `"A força e a determinação da nossa diáspora na África do Sul refletem o espírito inabalável do povo angolano. Unidos sob as diretrizes do progresso, continuaremos a somar vitórias para a edificação de uma pátria próspera."`
                      : `"The strength and determination of our diaspora in South Africa reflect the unwavering spirit of the Angolan people. United under the directives of progress, we will continue to build a prosperous nation."`}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 font-bold text-right">
                    — {language === "PT" ? "Secretário das Comunidades, MPLA SADC" : "Communities Secretary, MPLA SADC"}
                  </p>
                </div>

                {/* Secondary Picture within content for highly rich format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800 h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=400&q=80" 
                      alt="Audience" 
                      className="w-full h-full object-cover filter saturate-75 brightness-95"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800 h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80" 
                      alt="Debate" 
                      className="w-full h-full object-cover filter saturate-75 brightness-95"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Bottom Back Nav Action */}
                <div className="pt-8 border-t border-slate-100 dark:border-neutral-900 flex justify-between items-center">
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#B5121B] hover:text-red-700 transition cursor-pointer bg-transparent border-0 p-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === "PT" ? "Voltar às Notícias" : "Back to News List"}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      {language === "PT" ? "PARTILHE ESTE CONTEÚDO" : "SHARE THIS ARTICLE"}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast(language === "PT" ? "Link copiado para partilhar!" : "Sharing link copied!", "info");
                      }}
                      className="p-2 bg-slate-50 dark:bg-neutral-900 rounded-full text-slate-500 hover:text-[#B5121B] transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>

              {/* Right Column: Premium Sidebar */}
              <aside className="lg:col-span-4 space-y-8">
                
                {/* Related Articles list */}
                <div className="bg-white dark:bg-neutral-950 border border-slate-200/80 dark:border-neutral-900 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-neutral-900 pb-3">
                    <div className="w-1.5 h-4 bg-[#B5121B] rounded-full" />
                    <h3 className="font-mono font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      {language === "PT" ? "Outras Notícias Recomendadas" : "Recommended News"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {newsArticles
                      .filter(item => (language === "PT" ? item.title_pt : item.title_en) !== (language === "PT" ? selectedArticle.title_pt : selectedArticle.title_en))
                      .slice(0, 4)
                      .map((newsItem, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setSelectedArticle(newsItem)}
                          className="group flex gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-900 transition items-start text-left"
                        >
                          {newsItem.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-neutral-800">
                              <img 
                                src={newsItem.image} 
                                alt={newsItem.title_pt} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className="space-y-1 min-w-0">
                            <span className="text-[8px] font-mono font-black text-[#B5121B] uppercase tracking-wider block">
                              {language === "PT" ? newsItem.category_pt : newsItem.category_en}
                            </span>
                            <h4 className="font-serif font-black text-slate-900 dark:text-slate-100 text-[11px] leading-snug line-clamp-2 group-hover:text-[#B5121B] transition">
                              {language === "PT" ? newsItem.title_pt : newsItem.title_en}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-mono block">{newsItem.date}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Premium Newsletter Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-4">
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/MPLA_Party_logo.svg/250px-MPLA_Party_logo.svg.png" 
                      className="w-24 h-24 object-contain transform translate-x-4 translate-y-4" 
                      alt="MPLA" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    {language === "PT" ? "BOLETIM INFORMATIVO" : "OFFICIAL NEWSLETTER"}
                  </span>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-serif font-black text-base text-white">
                      {language === "PT" ? "Subscreva a Nossa Imprensa" : "Subscribe to Our Press"}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-normal font-light">
                      {language === "PT" 
                        ? "Receba comunicados oficiais, notícias de interesse nacional e convocatórias diretamente no seu email."
                        : "Receive official statements, news of national interest, and assembly calls directly in your inbox."}
                    </p>
                  </div>

                  {newsletterSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs text-center">
                      ✓ {language === "PT" ? "Subscrição efetuada com sucesso!" : "Successfully subscribed!"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        type="email" 
                        required
                        placeholder="Ex: seuemail@dominio.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (newsletterEmail.trim()) setNewsletterSuccess(true);
                        }}
                        className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {language === "PT" ? "Subscrever Comunicados" : "Subscribe Now"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Instant Member Conversion CTA Card */}
                <div className="bg-gradient-to-br from-[#B5121B] to-red-900 text-white rounded-3xl p-6 shadow-lg space-y-4">
                  <span className="text-[9px] font-mono font-bold text-[#FFCC00] uppercase tracking-widest bg-black/20 border border-white/5 px-2.5 py-1 rounded-md">
                    {language === "PT" ? "FILIAÇÃO EXPEDITA" : "EXPRESS MEMBERSHIP"}
                  </span>
                  <div className="space-y-1.5">
                    <h4 className="font-display font-extrabold text-base text-white">
                      {language === "PT" ? "Faça Parte da Nossa História" : "Be Part of Our History"}
                    </h4>
                    <p className="text-[11px] text-red-100 leading-normal font-light">
                      {language === "PT" 
                        ? "Associe-se ao Comité de Especialidade e apoie a reconstrução e união das famílias na África do Sul."
                        : "Join our specialty committee and support the reconstruction and unity of families in South Africa."}
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigateToAuth("signup")}
                    className="w-full py-2.5 bg-[#FFCC00] hover:bg-yellow-400 text-slate-950 font-bold text-[10px] tracking-wider uppercase rounded-xl transition shadow-md cursor-pointer border-0"
                  >
                    {language === "PT" ? "Preencher Ficha de Militante" : "Complete Membership Form"}
                  </button>
                </div>

              </aside>
            </div>

          </div>
        </main>
      ) : showGalleryPage ? (
        /* DEDICATED SEPARATE FULL WEBPAGE FOR GALERIA */
        <main className="min-h-screen bg-[#FAF9F5] dark:bg-[#0c0c0e] py-8 sm:py-12 animate-fade-in text-left" id="gallery-webpage">
          <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
            
            {/* Top Breadcrumbs and Return Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5 mb-8">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <button 
                  onClick={handleCloseGallery} 
                  className="hover:text-[#B5121B] transition font-bold uppercase cursor-pointer bg-transparent border-0 p-0"
                >
                  {language === "PT" ? "Início" : "Home"}
                </button>
                <span>/</span>
                <span className="text-slate-400 uppercase">
                  {language === "PT" ? "Multimédia" : "Multimedia"}
                </span>
                <span>/</span>
                <span className="text-[#B5121B] dark:text-amber-400 font-bold uppercase">
                  {language === "PT" ? "Galeria Fotográfica Oficial" : language === "FR" ? "Galerie Photographique" : "Official Gallery"}
                </span>
              </div>
              <button 
                onClick={handleCloseGallery}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-[#B5121B] rounded-xl hover:text-[#B5121B] transition cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#B5121B]" />
                {language === "PT" ? "Voltar ao Início" : "Back to Home"}
              </button>
            </div>

            {/* Hero Header Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#7A0C12] text-white p-8 sm:p-12 mb-10 overflow-hidden shadow-xl border border-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-4xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {language === "PT" ? "ARQUIVO MULTIMÉDIA DO PARTIDO MPLA NA ÁFRICA DO SUL" : "MPLA PARTY SOUTH AFRICA OFFICIAL MULTIMEDIA ARCHIVE"}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight font-display">
                  {language === "PT" ? "Galeria Fotográfica Oficial" : language === "FR" ? "Galerie Photographique Officielle" : "Official Photo Gallery"}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                  {language === "PT" 
                    ? "Registo visual histórico das reuniões de quadros, conferências, actos cívico-patrióticos, apoio consular e acções sociais e comunitárias do Partido MPLA em todas as províncias sul-africanas."
                    : language === "FR"
                    ? "Registre visuel historique des réunions de cadres, conférences, actes civiques et patriotiques et actions sociales du Parti MPLA en Afrique du Sud."
                    : "Official visual archive of cadre conferences, civic events, consular assistance, and community solidarity actions by the MPLA Party across South Africa."}
                </p>

                {/* Quick metrics banner */}
                <div className="flex flex-wrap items-center gap-4 pt-3 text-xs font-mono">
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">{filteredGallery.length}</span>
                    <span className="text-slate-300 uppercase tracking-wider text-[10px]">{language === "PT" ? "Fotografias Catalogadas" : "Cataloged Photos"}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm">HD</span>
                    <span className="text-slate-300 uppercase tracking-wider text-[10px]">{language === "PT" ? "Resolução Arquivística" : "Archival Quality"}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-amber-300 font-bold text-sm">7</span>
                    <span className="text-slate-300 uppercase tracking-wider text-[10px]">{language === "PT" ? "Secções Temáticas" : "Thematic Sections"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-neutral-950 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-neutral-900 shadow-sm mb-8 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label_pt: "Todos os Registos", label_en: "All Records", label_fr: "Tous" },
                    { key: "official", label_pt: "📸 Fotos Oficiais (SA)", label_en: "📸 Official Photos (SA)", label_fr: "📸 Photos Officielles (AS)" },
                    { key: "leadership", label_pt: "Executivo & Direção", label_en: "Leadership", label_fr: "Direction" },
                    { key: "events", label_pt: "Conferências & Actos", label_en: "Conferences", label_fr: "Conférences" },
                    { key: "community", label_pt: "Solidariedade Social", label_en: "Solidarity", label_fr: "Solidarité" },
                    { key: "education", label_pt: "Formação Política", label_en: "Education", label_fr: "Formation" },
                    { key: "culture", label_pt: "Cultura & Juventude", label_en: "Culture", label_fr: "Culture" }
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => setGalleryCategory(btn.key)}
                      className={`px-3.5 py-2 text-[11px] font-bold rounded-xl uppercase tracking-wider border transition cursor-pointer flex items-center gap-1.5 ${
                        galleryCategory === btn.key 
                          ? "bg-[#B5121B] text-white border-[#B5121B] shadow-md shadow-red-900/25 font-black" 
                          : "bg-slate-50 dark:bg-neutral-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {language === "PT" ? btn.label_pt : language === "FR" ? btn.label_fr : btn.label_en}
                    </button>
                  ))}
                </div>

                {/* Quick Search in Gallery */}
                <div className="relative min-w-[220px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gallerySearchTerm}
                    onChange={(e) => setGallerySearchTerm(e.target.value)}
                    placeholder={language === "PT" ? "Filtrar por título ou tag..." : "Search photo title or tag..."}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#B5121B]"
                  />
                  {gallerySearchTerm && (
                    <button 
                      onClick={() => setGallerySearchTerm("")} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            {filteredGallery.length === 0 ? (
              <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-[#B5121B] rounded-2xl flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === "PT" ? "Nenhuma fotografia encontrada" : "No photos found"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {language === "PT" 
                    ? "Não foram encontradas imagens com os filtros ou termos pesquisados. Tente seleccionar outra categoria ou limpar a pesquisa." 
                    : "No photos matched your search criteria. Try choosing another category or clearing search."}
                </p>
                <button
                  onClick={() => { setGalleryCategory("all"); setGallerySearchTerm(""); }}
                  className="px-5 py-2.5 bg-[#B5121B] text-white text-xs font-bold rounded-xl hover:bg-red-700 transition cursor-pointer"
                >
                  {language === "PT" ? "Ver Todas as Fotografias" : "View All Photos"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGallery.map((img, idx) => {
                  const displayTitle = language === "PT" ? img.title_pt : language === "FR" ? (img.title_fr || img.title_pt) : (img.title_en || img.title_pt);
                  const displayTag = language === "PT" ? img.tag_pt : language === "FR" ? (img.tag_fr || img.tag_pt) : (img.tag_en || img.tag_pt);

                  return (
                    <div 
                      key={img.id || idx}
                      onClick={() => setLightboxIndex(idx)}
                      className="group bg-slate-900 rounded-2xl overflow-hidden relative cursor-pointer border border-slate-200/80 dark:border-neutral-800 shadow-sm hover:shadow-2xl transition-all duration-300 h-80 flex flex-col justify-end"
                    >
                      <img 
                        src={img.url} 
                        alt={displayTitle} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent group-hover:via-slate-950/45 transition-colors duration-300" />
                      
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30 rounded-lg text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          {displayTag}
                        </span>
                      </div>

                      <div className="relative z-10 p-5 space-y-1.5 transform group-hover:-translate-y-0.5 transition-transform duration-300 text-left">
                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-md">
                          {displayTitle}
                        </h3>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-amber-300 uppercase font-semibold tracking-wider flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {language === "PT" ? "Ampliar foto" : "Enlarge photo"}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">
                            {img.filename || `IMG #${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Archive Callout */}
            <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === "PT" ? "Deseja submeter registos fotográficos da sua província?" : "Want to submit photo records from your province?"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === "PT" 
                    ? "Envie as fotografias oficiais de actividades comunitárias para o Departamento de Comunicação e Imagem do MPLA." 
                    : "Send official photos of community activities to the MPLA Communications Department."}
                </p>
              </div>
              <button
                onClick={handleCloseGallery}
                className="px-5 py-2.5 bg-slate-900 dark:bg-neutral-800 text-white rounded-xl text-xs font-bold hover:bg-[#B5121B] transition cursor-pointer shrink-0"
              >
                {language === "PT" ? "Voltar ao Início" : "Back to Home"}
              </button>
            </div>

          </div>
        </main>
      ) : (
        <>
          {/* 100VH CINEMATIC HERO SECTION */}
          <section className="relative h-screen w-full bg-slate-950 overflow-hidden flex items-center justify-center text-white" id="hero-slider">
        {/* Carousel Background with Crossfades & Ken Burns effect */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={heroSlides[currentSlide].image} 
                alt="MPLA Diaspora background" 
                className="w-full h-full object-cover opacity-35"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          {/* Deep Luxurious Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-[#B5121B]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 relative z-10 flex flex-col justify-center items-start pt-16 max-w-5xl">
          <div className="text-left space-y-6">
            {/* Giant Bold Typography Animated Reveal */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white max-w-4xl drop-shadow-xl">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                {language === "PT" ? heroSlides[currentSlide].title_pt : heroSlides[currentSlide].title_en}
              </span>
            </h1>

            <motion.p 
              key={currentSlide + "-p"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base sm:text-lg text-slate-300 font-light max-w-2xl leading-relaxed"
            >
              {language === "PT" ? heroSlides[currentSlide].sub_pt : heroSlides[currentSlide].sub_en}
            </motion.p>

            <div className="flex flex-wrap gap-4 pt-3">
              <button 
                onClick={() => onNavigateToAuth("signup")}
                className="px-6 py-3.5 bg-[#B5121B] hover:bg-red-700 text-white font-bold text-xs rounded-xl tracking-widest uppercase transition-all shadow-xl shadow-red-900/40 hover:shadow-red-900/60 flex items-center gap-2 cursor-pointer"
              >
                {language === "PT" ? "Torne-se Militante" : "Become a Member"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#about"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl tracking-widest uppercase transition"
              >
                {language === "PT" ? "Explorar Nosso Trabalho" : "Explore Our Work"}
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-80">
          <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
            {language === "PT" ? "Deslize para Entrar" : "Scroll to Enter"}
          </span>
          <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
        </div>
      </section>

      {/* GLOBAL SEARCH SECTION */}
      <section className="relative z-20 max-w-2xl mx-auto px-6 -mt-8 mb-16" id="site-search">
        <div className="relative shadow-2xl rounded-2xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchAutocomplete(true);
            }}
            onFocus={() => setShowSearchAutocomplete(true)}
            placeholder={language === "PT" ? "Pesquisar notícias, eventos, documentos, ajuda..." : "Search news, events, documents, support..."}
            className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl shadow-lg text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#B5121B] transition ${
              highContrast ? "bg-[#111111] border-neutral-700 text-white" : "bg-white border-slate-200 text-slate-800"
            }`}
          />
          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSearchAutocomplete && searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-neutral-800 rounded-xl shadow-2xl z-50 p-2 text-left max-h-60 overflow-y-auto"
              >
                <p className="text-[9px] font-mono uppercase text-[#D4AF37] px-3 py-1 font-black">Suggested Results:</p>
                {searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <a 
                      key={idx} 
                      href={result.link}
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchAutocomplete(false);
                      }}
                      className="flex justify-between items-center px-3 py-2 hover:bg-slate-800 rounded-lg transition"
                    >
                      <span className="text-xs text-white font-medium">{language === "PT" ? result.text_pt : result.text_en}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 px-3 py-2">No results matching "{searchQuery}"</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* PRESIDENT'S WELCOME (A WOW FEATURE) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 text-left" id="president-message">
        <div className={`p-8 sm:p-12 rounded-3xl border ${
          highContrast ? "bg-[#111111] border-neutral-800 text-white" : "bg-white border-slate-200"
        } shadow-xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`}>
          <div className="absolute top-0 left-0 w-2 h-full bg-[#B5121B]" />
          
          {/* Executive Info Box with Official Portrait of First Secretary (PPT Image) */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-[#B5121B]/90 text-white border-2 border-[#D4AF37]/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest">
                  SECRETARIADO EXECUTIVO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Official Photo of Comrade Francisco Carlos */}
              <div className="relative rounded-xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-lg group-hover:border-[#D4AF37] transition">
                <img 
                  src={mplaPptImg} 
                  alt="Camarada Francisco Carlos - Primeiro Secretário do Comité do Partido MPLA na África do Sul" 
                  className="w-full h-64 object-cover object-top hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <h3 className="text-lg font-black text-white drop-shadow-md">Camarada Francisco Carlos</h3>
                  <p className="text-[11px] font-mono text-[#D4AF37] font-extrabold tracking-wide drop-shadow-sm">
                    {language === "PT" ? "Primeiro Secretário do Comité do Partido MPLA na África do Sul" : "First Secretary of the MPLA Party Committee in South Africa"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-white/10 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>+27 82 555 9011</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span className="truncate">contactar@mplaas.co.za</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>África do Sul</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="px-3 py-1 bg-amber-400/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg text-[10px] font-mono font-bold uppercase block text-center">
                  COMITÉ DO PARTIDO MPLA NA ÁFRICA DO SUL
                </span>
              </div>
            </div>
          </div>

          {/* Letter and signature */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-mono font-black uppercase text-[#B5121B] bg-red-50 px-3 py-1 rounded-full border border-red-100 leading-normal block w-fit">
              {language === "PT" ? "MENSAGEM DO PRIMEIRO SECRETÁRIO DO COMITÉ DO PARTIDO MPLA NA ÁFRICA DO SUL" : "MESSAGE FROM THE FIRST SECRETARY OF THE MPLA PARTY COMMITTEE IN SOUTH AFRICA"}
            </span>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              {language === "PT" ? "Liderança Que Inspira. Serviço Que Transforma." : "Leadership That Inspires. Service That Matters."}
            </h2>
            <p className="text-slate-600 leading-relaxed font-light text-sm italic border-l-4 border-[#D4AF37] pl-4">
              "{language === "PT" 
                ? "Benvindo ao portal cívico unificado dos militantes e amigos do MPLA na África do Sul. A nossa missão é aproximar cada angolano, fornecer representação autêntica, e contribuir diretamente para o desenvolvimento do nosso país." 
                : "Welcome to the unified civic portal of MPLA members and friends in South Africa. Our goal is to bring every Angolan closer, provide authentic representation, and contribute directly to the development of our country."}"
            </p>
            <p className="text-slate-500 leading-relaxed text-xs">
              {language === "PT"
                ? "Estamos focados em modernizar a nossa coordenação através de recursos digitais, apoio consular estruturado e programas sociais inovadores voltados para a formação de jovens, solidariedade de género e atracção de investimentos comerciais."
                : "We are focused on modernizing our coordination via advanced digital tools, structured consular backup and community programs aimed at training the youth, reinforcing gender equality and driving bilateral investments."}
            </p>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">Camarada Francisco Carlos</p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  {language === "PT" ? "Primeiro Secretário do Comité do Partido MPLA na África do Sul" : "First Secretary of the MPLA Party Committee in South Africa"}
                </p>
              </div>
              {/* handwritten simulation signature in gold */}
              <div className="text-[#D4AF37] font-serif italic text-2xl tracking-wider select-none pr-4">
                Francisco Carlos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION: TWO-COLUMN TABS */}
      <section className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-16 text-left" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Large Cinematic Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={mplaComiteeImg} 
                alt="Comité do MPLA na Diáspora" 
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-[#D4AF37] text-slate-950 p-5 rounded-2xl shadow-xl flex items-center gap-4">
              <Trophy className="w-8 h-8 text-slate-950" />
              <div>
                <p className="text-2xl font-black leading-none">20+</p>
                <p className="text-[9px] font-mono uppercase font-black tracking-widest mt-0.5">Anos de Diáspora Ativa</p>
              </div>
            </div>
          </div>

          {/* Right Column: Mission, Vision, Values Tab Display */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {language === "PT" ? "Unindo a Diáspora Angolana com Visão de Futuro" : "Unifying the Angolan Diaspora with a Vision for the Future"}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              {language === "PT" 
                ? "Como representação cívica e política unificada, apoiamos os imigrantes angolanos na sua regularização e inserção digna na sociedade sul-africana, ao mesmo tempo que cultivamos os valores patrióticos."
                : "As a unified civic and political representation body, we support Angolan immigrants in their formal integration into South African society, while preserving patriotic cultural values."}
            </p>

            {/* Tab Controls */}
            <div className="flex border-b border-slate-200">
              {["mission", "vision", "values"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAboutTab(tab as any)}
                  className={`py-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
                    aboutTab === tab 
                      ? "border-[#B5121B] text-[#B5121B]" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="min-h-32 bg-slate-100/50 p-5 rounded-2xl border border-slate-200">
              {aboutTab === "mission" && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>{language === "PT" ? "Missão:" : "Mission:"}</strong>{" "}
                  {language === "PT" 
                    ? "Unir a diáspora angolana na África do Sul sob os princípios de solidariedade, legalidade e participação cívica ativa, atuando como o canal oficial que faz ouvir a voz de nossos militantes na pátria."
                    : "To unite the Angolan diaspora in South Africa under the principles of solidarity, legality and active citizenship, serving as the official channel to let the voice of our members be heard."}
                </p>
              )}
              {aboutTab === "vision" && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>{language === "PT" ? "Visão:" : "Vision:"}</strong>{" "}
                  {language === "PT"
                    ? "Ser reconhecido como o comitê de diáspora mais organizado, moderno e transparente da SADC, garantindo pleno suporte à integração académica e financeira de todas as famílias angolanas."
                    : "To be recognized as the most organized, modern and transparent diaspora committee in the SADC, ensuring full support for the academic and financial integration of all Angolan families."}
                </p>
              )}
              {aboutTab === "values" && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>{language === "PT" ? "Valores Primordiais:" : "Core Values:"}</strong>{" "}
                  {language === "PT"
                    ? "Solidariedade Social • Patriotismo Construtivo • Transparência Administrativa • Democracia Interna • Respeito Pelas Leis da África do Sul"
                    : "Social Solidarity • Constructive Patriotism • Administrative Transparency • Participatory Democracy • Absolute Respect for South African Laws"}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* JMPLA SHOWCASE SECTION */}
      <section className="py-20 text-left border-t border-slate-150 bg-[#FAF9F5] dark:bg-[#111] dark:border-neutral-800" id="jmpla">
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Description & Initiatives */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                JMPLA
              </h2>
              <p className="text-sm font-semibold text-[#D4AF37] tracking-wider uppercase font-mono">
                {language === "PT" ? "Juventude do Movimento Popular de Libertação de Angola" : "Youth of the Popular Movement for the Liberation of Angola"}
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm font-light">
                {language === "PT" 
                  ? "A JMPLA na África do Sul é o motor dinâmico que mobiliza, capacita e integra a juventude angolana na diáspora. Focamo-nos no desenvolvimento de líderes do amanhã, através de programas académicos, mentorias de carreira, eventos culturais e integração tecnológica."
                  : "JMPLA in South Africa is the dynamic engine mobilizing, empowering, and integrating Angolan youth in the diaspora. We focus on developing the leaders of tomorrow through academic programs, career mentorship, cultural events, and technological integration."}
              </p>

              {/* Grid of Initiatives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 bg-[#D4AF37]/15 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    {language === "PT" ? "Suporte Académico" : "Academic Support"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === "PT" 
                      ? "Aconselhamento universitário, auxílio com matrículas, bolsas de estudo locais e grupos de estudo."
                      : "University advisory, application assistance, local bursary coordination, and study groups."}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 bg-[#B5121B]/15 rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-4 h-4 text-[#B5121B]" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    {language === "PT" ? "Liderança e Cidadania" : "Leadership & Citizenship"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === "PT" 
                      ? "Fóruns de debate, capacitação de quadros jovens e fortalecimento da consciência cívica e patriótica."
                      : "Debate forums, training of young leaders, and strengthening civic and patriotic awareness."}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center mb-3">
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    {language === "PT" ? "Empreendedorismo" : "Entrepreneurship"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === "PT" 
                      ? "Networking de jovens profissionais, workshops práticos de negócios e incentivo a startups cívicas."
                      : "Young professionals networking, business workshops, and boosting civic-oriented startups."}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-3">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    {language === "PT" ? "Cultura e Desporto" : "Culture & Sports"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === "PT" 
                      ? "Torneios de futebol comunitário, festivais culturais de música e dança integrando a pátria."
                      : "Community soccer tournaments, cultural music & dance festivals connecting to our homeland."}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => onNavigateToAuth("signup")}
                  className="px-6 py-3 bg-[#B5121B] hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition shadow-lg shadow-red-900/10 hover:shadow-red-900/20 cursor-pointer"
                >
                  {language === "PT" ? "Filiar-me na JMPLA" : "Join JMPLA"}
                </button>
              </div>
            </div>

            {/* Right Column: Images Grid using User Provided JMPLA Images */}
            <div className="lg:col-span-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-lg h-80 group relative">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUaULF4VKz7AMPfCly9-Y4QQMctIz6BYkUBN80F38Q-w&s=10" 
                    alt="JMPLA Youth Event" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end p-3">
                    <p className="text-[10px] text-slate-200 font-bold uppercase tracking-wider font-mono">
                      {language === "PT" ? "Organização e União" : "Organization & Unity"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-lg h-80 group relative">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5dmmZOI1ueDakZtkqMPnmf0eiT0u1cSnhl0Y2VfhY9hQMfZ9Gld5iCJZv&s=10" 
                    alt="JMPLA Assembly" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end p-3">
                    <p className="text-[10px] text-slate-200 font-bold uppercase tracking-wider font-mono">
                      {language === "PT" ? "Liderança Jovem" : "Youth Leadership"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Banner Block with provided Logo */}
              <div className="bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shrink-0">
                  <img 
                    src="https://logowik.com/content/uploads/images/mpla-angola8253.logowik.com.webp" 
                    alt="MPLA Brand" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">
                    {language === "PT" ? "Juventude do MPLA" : "MPLA Youth Wing"}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {language === "PT" ? "Por Angola ao encontro do futuro!" : "For Angola, towards the future!"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* OMA SHOWCASE SECTION */}
      <section className="py-20 text-left border-t border-slate-150 bg-white dark:bg-neutral-950 dark:border-neutral-800" id="oma">
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Image Showcase using User Provided OMA Image */}
            <div className="lg:col-span-5 space-y-6 order-last lg:order-first">
              <div className="rounded-3xl overflow-hidden border-4 border-slate-50 dark:border-neutral-900 shadow-2xl h-[400px] group relative">
                <img 
                  src="https://shutterstock.com/editorial/image-editorial/O1Tbk617M9TbI32cODU5Ng==/delegates-popular-movement-liberation-angola-mpla-show-440nw-9876929i.jpg" 
                  alt="OMA Delegates and Supporters" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-6">
                  <div>
                    <span className="px-2.5 py-1 bg-[#B5121B] text-white text-[9px] font-mono font-bold uppercase rounded-sm block mb-1.5 w-max">
                      {language === "PT" ? "DELEGADAS OMA" : "OMA DELEGATES"}
                    </span>
                    <h4 className="text-base font-serif font-bold text-white">
                      {language === "PT" ? "Organização da Mulher Angolana na Diáspora" : "Organization of Angolan Women in Diaspora"}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Decorative Stats Strip */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800 p-4 rounded-2xl text-center">
                <div>
                  <span className="block text-lg font-black text-[#B5121B]">4,500+</span>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">{language === "PT" ? "Filiadas" : "Members"}</span>
                </div>
                <div>
                  <span className="block text-lg font-black text-[#D4AF37]">9</span>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">{language === "PT" ? "Comités" : "Committees"}</span>
                </div>
                <div>
                  <span className="block text-lg font-black text-slate-900 dark:text-white">100%</span>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">{language === "PT" ? "Dedicadas" : "Dedicated"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Mission and Programs */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                OMA
              </h2>
              <p className="text-sm font-semibold text-[#B5121B] tracking-wider uppercase font-mono">
                {language === "PT" ? "Organização da Mulher Angolana" : "Organization of Angolan Women"}
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm font-light">
                {language === "PT" 
                  ? "A OMA é o pilar de solidariedade, igualdade e apoio social das famílias angolanas na África do Sul. A nossa missão reside em defender os direitos das mulheres, apoiar a inclusão financeira e garantir amparo direto a mães, crianças e compatriotas em situação de vulnerabilidade migratória."
                  : "OMA is the pillars of solidarity, equality, and social support for Angolan families in South Africa. Our mission lies in defending women's rights, supporting financial inclusion, and providing direct welfare to mothers, children, and compatriots in vulnerable migration states."}
              </p>

              {/* Core Programs Stack */}
              <div className="space-y-3">
                <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-neutral-900/60 rounded-2xl border border-transparent hover:border-slate-150 transition">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-0.5">
                      {language === "PT" ? "Apoio e Assistência Social" : "Welfare & Social Assistance"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {language === "PT" 
                        ? "Distribuição de donativos alimentares, vestuário, agasalhos de inverno e auxílio médico voluntário para famílias imigrantes vulneráveis."
                        : "Distribution of food hampers, clothing, winter blankets, and volunteer medical backup for vulnerable immigrant families."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-neutral-900/60 rounded-2xl border border-transparent hover:border-slate-150 transition">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-950/40 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#B5121B]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-0.5">
                      {language === "PT" ? "Empreendedorismo e Formação" : "Women Entrepreneurship & Training"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {language === "PT" 
                        ? "Aulas de costura, literacia financeira, workshops de culinária e incentivo à formalização de pequenos comércios comunitários."
                        : "Sewing classes, financial literacy, catering workshops, and support for formalizing small community-based retail trades."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-neutral-900/60 rounded-2xl border border-transparent hover:border-slate-150 transition">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-0.5">
                      {language === "PT" ? "Aconselhamento e Integração Legal" : "Advisory & Legal Integration"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {language === "PT" 
                        ? "Orientações práticas para mães solo sobre documentação de menores, processos consulares e inserção escolar regular de crianças."
                        : "Practical tips for single mothers on minors documentation, consular services, and formal school enrollment for children."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigateToAuth("signup")}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-xl transition shadow-lg cursor-pointer"
                >
                  {language === "PT" ? "Unir-se à OMA" : "Join OMA"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HORIZONTAL INTERACTIVE TIMELINE */}
      <section className="bg-slate-950 py-20 text-white text-left" id="timeline">
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-white mt-3">
              {language === "PT" ? "A Nossa História, O Nosso Legado" : "Our Journey, Our Proud Legacy"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explore os momentos e conquistas desde a fundação até aos desafios contemporâneos.
            </p>
          </div>

          {/* Timeline Bar Indicator */}
          <div className="relative flex justify-between items-center max-w-4xl mx-auto mb-12">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-800 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#B5121B] to-[#D4AF37] -translate-y-1/2 z-0 transition-all duration-500" 
              style={{
                width: `${(timelineData.findIndex(d => d.year === activeYear) / (timelineData.length - 1)) * 100}%`
              }}
            />
            {timelineData.map((d) => (
              <button
                key={d.year}
                onClick={() => setActiveYear(d.year)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all cursor-pointer ${
                  activeYear === d.year 
                    ? "bg-[#B5121B] text-white border-2 border-[#D4AF37] scale-110 shadow-lg" 
                    : "bg-neutral-900 text-slate-400 hover:text-white"
                }`}
              >
                {d.year}
              </button>
            ))}
          </div>

          {/* Active Milestone Card */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {timelineData.filter(d => d.year === activeYear).map((d) => (
                <motion.div
                  key={d.year}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl items-center"
                >
                  <div className="md:col-span-5 rounded-2xl overflow-hidden h-48 border border-neutral-800 shadow-md">
                    <img src={d.image} alt={d.title_pt} className="w-full h-full object-cover" />
                  </div>
                  <div className="md:col-span-7 space-y-4">
                    <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase bg-amber-400/10 px-3 py-1 rounded">
                      {d.milestone}
                    </span>
                    <h3 className="text-xl font-bold text-white">{language === "PT" ? d.title_pt : d.title_en}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {language === "PT" ? d.desc_pt : d.desc_en}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>



      {/* AL JAZEERA-STYLE NEWS CENTER */}
      <section className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-20 text-left" id="news">
        {/* Header Bar */}
        <div className="pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-8 bg-amber-500 rounded-xs shrink-0 block" />
            <div>
              <span className="text-[10px] font-sans font-black uppercase tracking-widest text-[#B5121B]">
                {language === "PT" ? "IMPRENSA E COMUNICADOS OFICIAIS" : "OFFICIAL PRESS & COVERAGE"}
              </span>
              <h2 className="text-3xl font-serif font-black text-slate-950 tracking-tight mt-1">
                {language === "PT" ? "Notícias & Atualidades" : "News & Coverage"}
              </h2>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {language === "PT" ? "Cobertura Oficial • Setembro 2026" : "Official Coverage • September 2026"}
          </div>
        </div>

        {/* BREAKING NEWS TICKER */}
        <div className="bg-slate-900 text-white rounded-xl overflow-hidden mb-8 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-md">
          <div className="bg-[#B5121B] text-white px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 select-none">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {language === "PT" ? "Última Hora" : "Breaking News"}
          </div>
          <div className="flex-1 text-xs sm:text-xs text-slate-300 overflow-hidden font-medium py-1">
            {loadingNews ? (
              <span className="text-slate-400 font-mono animate-pulse">
                {language === "PT" ? "A sincronizar notícias em tempo real..." : "Syncing real-time news..."}
              </span>
            ) : (
              <motion.div
                animate={{ x: [300, -900] }}
                transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                className="whitespace-nowrap inline-block"
              >
                {tickerNews}
              </motion.div>
            )}
          </div>
        </div>

        {/* 3-Column Editorial Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* COLUMN 1: THE LEAD EDITORIAL (6 Columns) */}
          {newsArticles[0] && (
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
              <div className="relative h-80 overflow-hidden bg-slate-100 shrink-0">
                <img 
                  src={newsArticles[0].image || "/src/assets/images/IMG_6400.JPG"} 
                  alt="MPLA news cover" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-700 filter brightness-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                <span className="absolute bottom-4 left-4 bg-[#B5121B] text-white text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-md">
                  {language === "PT" ? "DESTAQUE PRINCIPAL" : "TOP STORY"}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#B5121B] font-bold uppercase tracking-wider">
                    <span>{language === "PT" ? newsArticles[0].category_pt : newsArticles[0].category_en}</span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <span className="text-slate-400 font-normal">{newsArticles[0].date}</span>
                  </div>
                  <h3 
                    onClick={() => setSelectedArticle(newsArticles[0])}
                    className="text-2xl font-serif font-black text-slate-900 hover:text-[#B5121B] transition cursor-pointer leading-tight tracking-tight"
                  >
                    {language === "PT" ? newsArticles[0].title_pt : newsArticles[0].title_en}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-xs leading-relaxed font-light line-clamp-3">
                    {language === "PT" ? newsArticles[0].desc_pt : newsArticles[0].desc_en}
                  </p>
                </div>
                <div className="pt-4 flex justify-between items-center text-xs">
                  <button 
                    onClick={() => setSelectedArticle(newsArticles[0])}
                    className="font-black text-[#B5121B] hover:text-red-700 flex items-center gap-1 cursor-pointer uppercase tracking-wider text-[11px]"
                  >
                    {language === "PT" ? "Ler Comunicado Íntegro" : "Read Full Story"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[10px]">{newsArticles[0].readTime}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopiedField("news-share-lead");
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                      title={language === "PT" ? "Partilhar" : "Share"}
                    >
                      {copiedField === "news-share-lead" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 2: SECONDARY RECENT NEWS FEED (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col gap-5 justify-between px-0 text-left">
            {newsArticles.slice(1, 4).map((newsItem, index) => (
              <div 
                key={index} 
                className="group flex flex-col justify-between bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition text-left"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-[#B5121B] font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {language === "PT" ? newsItem.category_pt : newsItem.category_en}
                    </span>
                    <span className="text-slate-400 font-normal">{newsItem.date}</span>
                  </div>
                  <h4 
                    onClick={() => setSelectedArticle(newsItem)}
                    className="font-serif font-black text-slate-900 text-sm leading-snug hover:text-[#B5121B] cursor-pointer transition line-clamp-2"
                  >
                    {language === "PT" ? newsItem.title_pt : newsItem.title_en}
                  </h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 font-light">
                    {language === "PT" ? newsItem.desc_pt : newsItem.desc_en}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedArticle(newsItem)}
                  className="mt-3 text-[10px] font-black text-[#B5121B] hover:text-red-700 flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  {language === "PT" ? "Ver Artigo" : "Read More"}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* COLUMN 3: MOST READ & OPINION (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col space-y-6 text-left">
            <div className="bg-slate-50 rounded-2xl p-5 flex flex-col justify-between h-full shadow-xs">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4">
                  <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <h4 className="text-xs font-mono font-black text-slate-900 uppercase tracking-wider">
                    {language === "PT" ? "Destaques e Opinião" : "Trending & Opinion"}
                  </h4>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: "trend-1",
                      rank: "01",
                      title_pt: "O IX Congresso Ordinário e a Participação das Bases no Comité Central",
                      title_en: "The 9th Ordinary Congress and Grassroots Representation in the Central Committee",
                      author: "Dr. Adelino Chipanzenda",
                      authorTitle_pt: "Cientista Político e Especialista em Governação",
                      authorTitle_en: "Political Scientist & Governance Specialist",
                      content_pt: "A garantia de 15% das vagas do Comité Central atribuídas directamente às estruturas de base constitui uma viragem qualitativa profunda na representatividade partidária, oxigenando o debate de ideias com vista ao pleito de 2027.",
                      content_en: "Reserving 15% of Central Committee seats for grassroots militants marks a profound qualitative shift in party democracy, invigorating political dialogue toward the 2027 general elections."
                    },
                    {
                      id: "trend-2",
                      rank: "02",
                      title_pt: "A Diáspora Angolana na África do Sul como Ponte de Investimento na SADC",
                      title_en: "The Angolan Diaspora in South Africa as an Investment Gateway for SADC",
                      author: "Dra. Elisa dos Santos",
                      authorTitle_pt: "Economista e Coordenadora de Cooperação Regional",
                      authorTitle_en: "Economist & Regional Cooperation Lead",
                      content_pt: "O Corredor do Lobito e a consolidação do comércio bilateral abrem oportunidades sem paralelo para a comunidade empresarial angolana radicada em Gauteng e Western Cape participar na diversificação económica nacional.",
                      content_en: "The Lobito Corridor and expanding bilateral commerce unlock unparalleled opportunities for the Angolan business community across Gauteng and the Western Cape to fuel non-oil diversification."
                    },
                    {
                      id: "trend-3",
                      rank: "03",
                      title_pt: "Regularização Migratória e Cidadania Digital: Uma Vitória para a Comunidade",
                      title_en: "Immigration Regularization and Digital Citizenship: A Win for the Community",
                      author: "Militante Manuel Neto",
                      authorTitle_pt: "Assessor para Assuntos Comunitários",
                      authorTitle_en: "Advisor for Community Affairs",
                      content_pt: "A articulação estreita entre o Comité do MPLA na África do Sul e os serviços consulares demonstra como a proximidade institucional resolve problemas reais de passaportes, vistos e matrículas escolares.",
                      content_en: "Close coordination between the MPLA Committee in South Africa and consular teams demonstrates how responsive institutional presence resolves real issues regarding passports, visas, and school enrollments."
                    }
                  ].map((trend, i) => (
                    <div 
                      key={trend.id} 
                      className="group flex gap-3 text-left pb-3 last:pb-0"
                    >
                      <span className="text-xl font-serif font-black text-amber-500/80 tracking-tighter shrink-0">
                        {trend.rank}
                      </span>
                      <div className="space-y-1">
                        <h5 
                          onClick={() => setSelectedArticle({
                            title_pt: trend.title_pt,
                            title_en: trend.title_en,
                            category_pt: "OPINIÃO",
                            category_en: "OPINION",
                            date: "Setembro 2026",
                            readTime: "3 min read",
                            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
                            summary_pt: trend.content_pt,
                            summary_en: trend.content_en,
                            content_pt: `Artigo de Opinião assinado por ${trend.author} (${trend.authorTitle_pt}):\n\n${trend.content_pt}\n\nA participação ativa da nossa massa intelectual na diáspora sul-africana fortalece o prestígio e a competência organizativa das nossas instituições bilaterais, sedimentando canais inovadores de progresso mútuo e garantindo o retorno construtivo de conhecimentos à pátria mãe.`,
                            content_en: `Opinion article written by ${trend.author} (${trend.authorTitle_en}):\n\n${trend.content_en}\n\nThe active participation of our intellectual diaspora in South Africa solidifies the prestige and organizational depth of our bilateral institutions, fostering academic exchange and patriotic engagement.`
                          })}
                          className="font-serif font-bold text-slate-800 text-xs sm:text-xs leading-snug hover:text-[#B5121B] cursor-pointer transition line-clamp-2"
                        >
                          {language === "PT" ? trend.title_pt : trend.title_en}
                        </h5>
                        <div className="text-[9px] text-slate-400 font-semibold font-mono">
                          {trend.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NETFLIX-STYLE EVENTS SECTION */}
      <section className="bg-slate-950 text-white py-20 text-left" id="events">
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B5121B]/20 text-amber-400 border border-amber-400/30 mb-2">
                <Calendar className="w-3 h-3 text-amber-400" />
                {language === "PT" ? "Agenda Oficial de Actividades" : "Official Activities Agenda"}
              </div>
              <h2 className="text-3xl font-black text-white mt-1">
                {language === "PT" ? "Fóruns, Comícios e Workshops" : "Forums, Rallies and Workshops"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {language === "PT" 
                  ? "Acompanhe o cronograma de eventos em tempo real com fotografias oficiais das conferências, plenários e actos políticos na África do Sul."
                  : "Follow the event schedule in real time with official photography from conferences, rallies and workshops across South Africa."}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label_pt: "Todos", label_en: "All" },
                { key: "forum", label_pt: "Fóruns", label_en: "Forums" },
                { key: "rally", label_pt: "Comícios", label_en: "Rallies" },
                { key: "workshop", label_pt: "Workshops", label_en: "Workshops" },
                { key: "conference", label_pt: "Conferências", label_en: "Conferences" }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setEventCategoryFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    eventCategoryFilter === f.key
                      ? "bg-[#B5121B] text-white border-[#B5121B] shadow-md shadow-red-950/40"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {language === "PT" ? f.label_pt : f.label_en}
                </button>
              ))}
            </div>
          </div>

          {/* Events grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="h-52 bg-slate-950 overflow-hidden relative shrink-0">
                  <img 
                    src={evt.image} 
                    alt={evt.title_pt} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-md ${evt.badgeStyle}`}>
                      {language === "PT" ? evt.badge_pt : evt.badge_en}
                    </span>
                  </div>

                  {/* Live countdown timer overlay */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-amber-400 border border-amber-400/30 text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span>{eventCountdowns[evt.id] || "EM BREVE"}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-white text-base leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {language === "PT" ? evt.title_pt : evt.title_en}
                    </h4>
                    <div className="space-y-1.5 text-slate-300 text-xs">
                      <p className="flex items-center gap-2 font-bold text-amber-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{language === "PT" ? evt.date_pt : evt.date_en}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.time}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[11px] text-slate-400 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{evt.location}</span>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigateToAuth("signin")}
                    className="w-full py-2.5 bg-slate-800 hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl transition cursor-pointer uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 group-hover:bg-[#B5121B]"
                  >
                    <span>{language === "PT" ? "Inscrever-me Gratuitamente" : "Register For Event"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* COMPOSIÇÃO DO SECRETARIADO DO COMITÉ DO PARTIDO (PREMIUM TEXT-ONLY SECTION) */}
      <section className="relative py-24 bg-slate-950 text-white overflow-hidden border-t border-slate-900" id="secretariado">
        {/* Subtle atmospheric ambient lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-[#B5121B]/15 via-amber-500/5 to-transparent blur-3xl opacity-70" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl opacity-30" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          {/* Eyebrow / Organization */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            MPLA ÁFRICA DO SUL
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight">
            COMPOSIÇÃO DO SECRETARIADO
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-xs sm:text-sm md:text-base font-semibold text-slate-300 tracking-wide uppercase max-w-3xl mx-auto leading-relaxed">
            DO COMITÉ DO PARTIDO JUNTO À COMUNIDADE ANGOLANA NA ÁFRICA DO SUL
          </p>

          {/* Decorative Gold & Crimson Centerpiece (Borderless) */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-14">
            <div className="w-2.5 h-2.5 rotate-45 bg-amber-400 shadow-lg shadow-amber-400/50" />
          </div>

          {/* Leadership Cards (No Profile Images, Only Texts - Premium Styling) */}
          {/* Tier 1: Primeiro & Segundo Secretários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-slate-950 border border-amber-400/30 hover:border-amber-400/60 rounded-2xl p-7 sm:p-8 shadow-xl shadow-black/40 text-left transition-all duration-300 group overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all duration-500" />
              
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/25">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Primeiro Secretário
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                  Comité • África do Sul
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                Cda Francisco Carlos
              </h3>

              <p className="text-sm sm:text-base font-semibold text-amber-400/90 mt-2 leading-snug">
                Primeiro Secretário do Comité do MPLA na África do Sul
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-slate-950 border border-amber-400/30 hover:border-amber-400/60 rounded-2xl p-7 sm:p-8 shadow-xl shadow-black/40 text-left transition-all duration-300 group overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all duration-500" />
              
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/25">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Segundo Secretário
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                  Comité • África do Sul
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                Cda Gabriel Massuno
              </h3>

              <p className="text-sm sm:text-base font-semibold text-amber-400/90 mt-2 leading-snug">
                Segundo Secretário do Comité do MPLA na África do Sul
              </p>
            </div>
          </div>

          {/* Tier 2: Secretários Departamentais & Coordenador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* Cda António Gonsalves */}
            <div className="relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition-all duration-300 text-left group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    Organização & Mobilização
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Cda António Gonsalves
                </h4>

                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 leading-relaxed">
                  Secretário para Organização e Mobilização
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Comité MPLA • África do Sul
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
              </div>
            </div>

            {/* Cda Cristóvão A. Domingos */}
            <div className="relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition-all duration-300 text-left group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    Questões Comunitárias
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Cda Cristóvão A. Domingos
                </h4>

                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 leading-relaxed">
                  Secretário para as Questões da Comunidade
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Comité MPLA • África do Sul
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
              </div>
            </div>

            {/* Cda Vânia Cruz */}
            <div className="relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition-all duration-300 text-left group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    Política & Eleições
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Cda Vânia Cruz
                </h4>

                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 leading-relaxed">
                  Secretária para as Questões Políticas e Eleitorais
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Comité MPLA • África do Sul
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
              </div>
            </div>

            {/* Cda Lusimadio Simão */}
            <div className="relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition-all duration-300 text-left group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    Informação & Formação
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Cda Lusimadio Simão
                </h4>

                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 leading-relaxed">
                  Secretário para Informação, Propaganda e Formação Militante
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Comité MPLA • África do Sul
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
              </div>
            </div>

            {/* Cda Francisco Damas */}
            <div className="relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition-all duration-300 text-left group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    Administração & Finanças
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Cda Francisco Damas
                </h4>

                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 leading-relaxed">
                  Secretário para Administração e Finanças
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Comité MPLA • África do Sul
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
              </div>
            </div>

            {/* Cda Arnoldito Gomes */}
            <div className="relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-md transition-all duration-300 text-left group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                    Disciplina, Ética & Auditoria
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Cda Arnoldito Gomes
                </h4>

                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 leading-relaxed">
                  Coordenador da Comissão de Disciplina, Ética e Auditoria
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Comissão Especializada • SA
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO BANNER / SPEECHES FEATURE */}
      <section className="relative w-full py-28 text-center text-white overflow-hidden bg-slate-950" id="video-section">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80" 
            alt="Militantes em conferência regional" 
            className="w-full h-full object-cover opacity-20 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {language === "PT" ? "Assista nossos eventos Oficiais" : "Watch Our Official Events"}
          </h2>
          <p className="text-slate-400 font-light text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {language === "PT" 
              ? "Acompanhe as transmissões, discursos oficiais e resumos audiovisuais dos eventos e reuniões de coordenação do partido na África do Sul."
              : "Watch the transmissions, official speeches and video summaries of party events and leadership meetings in South Africa."}
          </p>

          {/* Mode Selector Tabs (Live Stream vs Video Archive) */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              onClick={() => setYoutubeTab("live")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
                youtubeTab === "live"
                  ? "bg-[#C8102E] text-white shadow-lg shadow-red-900/40"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>{language === "PT" ? "🔴 Transmissão em Direto / Ao Vivo" : "🔴 Watch Live Stream"}</span>
            </button>
            <button
              onClick={() => setYoutubeTab("archive")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
                youtubeTab === "archive"
                  ? "bg-[#D4AF37] text-slate-950 shadow-lg shadow-amber-900/20"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/50"
              }`}
            >
              <span>{language === "PT" ? "📹 Arquivo de Vídeos do Canal" : "📹 Channel Uploads Archive"}</span>
            </button>
          </div>

          <div className="max-w-3xl mx-auto mt-4 aspect-video rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-black relative group">
            <iframe
              width="100%"
              height="100%"
              src={
                youtubeTab === "live"
                  ? "https://www.youtube.com/embed/live_stream?channel=UCZHPr3QVs-CUMlxdTXmurgA&autoplay=0"
                  : "https://www.youtube.com/embed/videoseries?list=UUZHPr3QVs-CUMlxdTXmurgA"
              }
              title="Canal Oficial de Eventos do MPLA África do Sul"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          <div className="pt-3 flex flex-wrap justify-center items-center gap-4">
            <a 
              href="https://www.youtube.com/channel/UCZHPr3QVs-CUMlxdTXmurgA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#FF0000] hover:bg-[#D60000] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-xl hover:shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Youtube className="w-5 h-5" />
              <span>{language === "PT" ? "Inscrever-se no Canal Oficial no YouTube" : "Subscribe to Official YouTube Channel"}</span>
              <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>
      </section>

      {/* BUSINESS BANKING & DONATIONS MODAL */}
      <AnimatePresence>
        {showDonationModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className={`max-w-xl w-full rounded-3xl border shadow-2xl relative overflow-hidden text-left ${
                highContrast ? "bg-[#111] border-neutral-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Header styling */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-start bg-[#B5121B] text-white">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                    {language === "PT" ? "DADOS BANCÁRIOS OFICIAIS" : "OFFICIAL BANKING DETAILS"}
                  </span>
                  <h3 className="text-xl font-black mt-2">
                    {language === "PT" ? "Fundo de Apoio e Solidariedade" : "Support & Solidarity Fund"}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowDonationModal(false)}
                  className="p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {language === "PT" 
                    ? "As suas contribuições voluntárias e quotas apoiam diretamente os nossos programas sociais gratuitos, incluindo o Gabinete de Apoio Consular, as Aulas de Português, e a assistência a famílias em vulnerabilidade na África do Sul."
                    : "Your voluntary contributions and membership fees directly support our free social programs, including the Consular Support Office, Portuguese Classes, and assistance to vulnerable families in South Africa."}
                </p>

                {/* Premium FNB Card Layout */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-neutral-800 rounded-2xl p-6 text-white shadow-xl">
                  {/* Subtle decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#B5121B]/10 rounded-full blur-xl pointer-events-none" />

                  {/* FNB simulated logo */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">FIRST NATIONAL BANK (FNB)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded">
                      BUSINESS ACCOUNT
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Account Holder */}
                    <div className="flex justify-between items-center group">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                          {language === "PT" ? "Titular da Conta" : "Account Holder"}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-100">
                          MPLA COORDENACAO NACIONAL DELEGACAO
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy("MPLA COORDENACAO NACIONAL DELEGACAO", "holder")}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-amber-400 cursor-pointer shrink-0"
                        title="Copy Account Holder"
                      >
                        {copiedField === "holder" ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Account Number */}
                    <div className="flex justify-between items-center group">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                          {language === "PT" ? "Número da Conta" : "Account Number"}
                        </span>
                        <span className="text-base font-black text-white font-mono tracking-wide">
                          62908472910
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy("62908472910", "acc")}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-amber-400 cursor-pointer shrink-0"
                        title="Copy Account Number"
                      >
                        {copiedField === "acc" ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                      {/* Branch & Code */}
                      <div className="flex justify-between items-center group">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                            {language === "PT" ? "Agência / Código" : "Branch / Code"}
                          </span>
                          <span className="text-xs font-bold text-slate-100 font-mono">
                            Sandton City (254605)
                          </span>
                        </div>
                        <button 
                          onClick={() => handleCopy("254605", "branch")}
                          className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-amber-400 cursor-pointer shrink-0"
                          title="Copy Branch Code"
                        >
                          {copiedField === "branch" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* SWIFT / BIC */}
                      <div className="flex justify-between items-center group">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                            SWIFT / BIC Code
                          </span>
                          <span className="text-xs font-bold text-slate-100 font-mono uppercase">
                            FIRNZAJJ
                          </span>
                        </div>
                        <button 
                          onClick={() => handleCopy("FIRNZAJJ", "swift")}
                          className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-amber-400 cursor-pointer shrink-0"
                          title="Copy SWIFT"
                        >
                          {copiedField === "swift" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reference Guideline */}
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    {language === "PT" ? "IMPORTANTE: REFERÊNCIA DO DEPÓSITO" : "IMPORTANT: DEPOSIT REFERENCE"}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal font-light">
                    {language === "PT"
                      ? "Por favor, utilize o seu Nome Completo ou Número de Militante seguido de 'DOACAO' como referência (Ex: MANUEL NETO DOACAO) para permitir a conciliação e envio automático do recibo oficial."
                      : "Please use your Full Name or Member Number followed by 'DOACAO' as reference (e.g., MANUEL NETO DOACAO) to allow quick reconciliation and automatic official receipt delivery."}
                  </p>
                </div>
              </div>

              {/* Footer action */}
              <div className="p-6 pt-0 flex gap-3 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
                <button 
                  onClick={() => setShowDonationModal(false)}
                  className="w-full mt-4 py-2.5 bg-[#B5121B] hover:bg-red-700 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition cursor-pointer text-center"
                >
                  {language === "PT" ? "Concluído" : "Done"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* LUXURY TESTIMONIALS CAROUSEL */}
      <section className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-20 text-left" id="testimonials">
        <div className="bg-slate-50 p-8 sm:p-14 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/5 rounded-full blur-2xl" />
          
          <div className="mb-10 text-center sm:text-left">
            <span className="text-[10px] font-mono font-black uppercase text-[#B5121B] bg-red-50 border border-red-100 px-3 py-1 rounded-full">
              {language === "PT" ? "TESTEMUNHOS REAIS DE MILITANTES" : "REAL FEEDBACK FROM MEMBERS"}
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              {language === "PT" ? "A Voz da Nossa Comunidade" : "The Voice of Our Community"}
            </h2>
          </div>

          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-lg sm:text-2xl text-slate-700 leading-relaxed font-light italic font-serif">
                  "{language === "PT" ? testimonials[activeTestimonial].quote_pt : testimonials[activeTestimonial].quote_en}"
                </p>
                <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                  <img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].author} className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{testimonials[activeTestimonial].author}</h5>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                      {language === "PT" ? testimonials[activeTestimonial].role_pt : testimonials[activeTestimonial].role_en}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonials controls */}
            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-150">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3.5 h-1.5 rounded-full transition cursor-pointer ${
                    activeTestimonial === index ? "bg-[#B5121B] w-6" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL MEMBERSHIP SECTION */}
      <section className="bg-slate-900 text-white py-20 text-center relative overflow-hidden border-t border-b border-white/5" id="membership">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/mpla_supporters_background_1784328681804.jpg" 
            alt="Militantes do MPLA África do Sul" 
            className="w-full h-full object-cover opacity-15 filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-[#B5121B]/40" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {language === "PT" ? "Faça Parte da Nossa Força de Progresso" : "Be Part of Our Force for Progress"}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {language === "PT"
              ? "A sua filiação garante representação autêntica, acesso instantâneo ao seu Cartão Digital com chip virtual criptografado e amparo social nas delegações sul-africanas."
              : "Your membership guarantees authentic representation, instant access to your secure Digital Member Card and structural social support."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto my-8 text-left text-xs text-slate-300 bg-slate-950/60 p-6 rounded-2xl border border-white/5">
            <div className="flex items-start gap-2.5">
              <Check className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
              <span>{language === "PT" ? "Emissão de Cartão Digital Oficial com QR Code" : "Issuance of Official Digital Card with QR Code"}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
              <span>{language === "PT" ? "Acesso ao Gabinete de Apoio Jurídico e Documental" : "Access to the Free Legal & Visa Assistance Helpdesk"}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
              <span>{language === "PT" ? "Cursos Gratuitos de Língua Portuguesa e História" : "Free Saturday Portuguese & National History Classes"}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
              <span>{language === "PT" ? "Mentoria de Redes de Negócios e Bolsas JMPLA" : "Business Network Mentorship & Student Bursaries"}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => onNavigateToAuth("signup")}
              className="px-6 py-3 bg-[#B5121B] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition tracking-wider uppercase shadow-xl"
            >
              {language === "PT" ? "Registrar-me Hoje" : "Register Now"}
            </button>
            <button 
              onClick={() => onNavigateToAuth("signin")}
              className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition tracking-wider uppercase"
            >
              {language === "PT" ? "Já sou Militante" : "I am already a Member"}
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION: SPLIT LAYOUT WITH CUSTOM INTERACTIVE MAP */}
      <section className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-20 text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch" id="contact">
        {/* Left column: Physical Office and map */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-3xl flex flex-col justify-between border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B5121B]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-6">
            <span className="text-[10px] font-mono font-black text-amber-400 tracking-wider uppercase block">
              {language === "PT" ? "DELEGAÇÃO SEDE NA CIDADE DO CABO" : "HEADQUARTERS IN CAPE TOWN"}
            </span>
            <h3 className="text-2xl font-black">
              {language === "PT" ? "Nossa Sede na Cidade do Cabo" : "Our Cape Town Office"}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {language === "PT" 
                ? "Visite o nosso gabinete principal de coordenação consular e atendimento às famílias na África do Sul."
                : "Visit our primary coordination office and family helpdesk in the South Africa."}
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Goodwood, Cidade do Cabo, África do Sul</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>+27 11 555 0192</span>
              </p>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>contactar@mplaas.co.za</span>
                </p>
              </div>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{language === "PT" ? "Seg - Sex: 08:30 - 16:30" : "Mon - Fri: 08:30 - 16:30"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-8 rounded-3xl shadow-xs">
          <h3 className="text-2xl font-black text-slate-900 mt-4 mb-2">
            {language === "PT" ? "Fale Conosco" : "Get In Touch"}
          </h3>
          <p className="text-slate-500 text-xs mb-6">
            Preencha os dados e receba uma resposta formal do secretariado em menos de 24 horas.
          </p>

          {contactSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2 text-emerald-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 m-auto" />
              <h4 className="font-bold text-sm">✓ {language === "PT" ? "Mensagem Enviada!" : "Message Sent!"}</h4>
              <p className="text-xs">
                {language === "PT" 
                  ? "A sua mensagem foi registada e encaminhada ao Secretário das Relações Exteriores e Cooperação." 
                  : "Your message was successfully logged and forwarded to the Secretary of Foreign Affairs."}
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Seu Nome Completo</label>
                  <input type="text" required placeholder="Ex: Manuel Neto" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B5121B] focus:border-[#B5121B]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Correio Eletrónico</label>
                  <input type="email" required placeholder="Ex: manuel@neto.com" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B5121B] focus:border-[#B5121B]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Contacto de Telefone</label>
                  <input type="tel" required placeholder="Ex: +27 82 555 1234" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B5121B] focus:border-[#B5121B]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Assunto Principal</label>
                  <select className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B5121B] focus:border-[#B5121B]">
                    <option>{language === "PT" ? "Apoio Consular / Documental" : "Consular / Document Support"}</option>
                    <option>{language === "PT" ? "Dúvida sobre Filiação Partidária" : "Membership Inquiries"}</option>
                    <option>{language === "PT" ? "Cursos e Atividades JMPLA" : "JMPLA Academic Classes"}</option>
                    <option>{language === "PT" ? "Outros Assuntos" : "Other Matters"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Sua Mensagem Detalhada</label>
                <textarea rows={4} required placeholder={language === "PT" ? "Escreva pormenorizadamente a sua solicitação..." : "Write your detailed inquiry here..."} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B5121B] focus:border-[#B5121B]" />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-[#B5121B] hover:bg-red-700 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition cursor-pointer"
              >
                {language === "PT" ? "Enviar Mensagem Oficial" : "Send Official Inquiry"}
              </button>
            </form>
          )}
        </div>
      </section>
        </>
      )}

      {/* FULLSCREEN LIGHTBOX GALLERY VIEWER (GLOBAL) */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 select-none"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Toolbar */}
            <div 
              className="w-full max-w-5xl flex items-center justify-between mb-3 px-2 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#B5121B] text-white text-[10px] font-black uppercase rounded-lg tracking-wider">
                  {language === "PT" ? filteredGallery[lightboxIndex].tag_pt : language === "FR" ? filteredGallery[lightboxIndex].tag_fr : filteredGallery[lightboxIndex].tag_en}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {lightboxIndex + 1} / {filteredGallery.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={filteredGallery[lightboxIndex].url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3"
                  title="Abrir imagem original"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === "PT" ? "Ver Original" : language === "FR" ? "Original" : "Full View"}</span>
                </a>
                <button 
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Fechar (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div 
              className="relative max-w-5xl w-full flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-[65vh] max-h-[600px] bg-black/60 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center p-2 relative group">
                <img 
                  src={filteredGallery[lightboxIndex].url} 
                  alt={filteredGallery[lightboxIndex].title_pt} 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              {/* Caption */}
              <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base">
                    {language === "PT" 
                      ? filteredGallery[lightboxIndex].title_pt 
                      : language === "FR" 
                      ? (filteredGallery[lightboxIndex].title_fr || filteredGallery[lightboxIndex].title_pt) 
                      : (filteredGallery[lightboxIndex].title_en || filteredGallery[lightboxIndex].title_pt)}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === "PT" 
                      ? "Arquivo Fotográfico do Comité de Coordenação do MPLA na África do Sul" 
                      : language === "FR"
                      ? "Archives Photographiques du Comité de Coordination du MPLA en Afrique du Sud"
                      : "Photo Archive of the MPLA South Africa Coordination Committee"}
                  </p>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-400/20 shrink-0">
                  {filteredGallery[lightboxIndex].filename}
                </span>
              </div>

              {/* Navigation arrows */}
              <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev! - 1 + filteredGallery.length) % filteredGallery.length);
                  }}
                  className="p-3.5 rounded-full bg-slate-900/90 hover:bg-[#B5121B] text-white border border-white/10 transition pointer-events-auto cursor-pointer shadow-xl"
                  title="Anterior (Seta Esquerda)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev! + 1) % filteredGallery.length);
                  }}
                  className="p-3.5 rounded-full bg-slate-900/90 hover:bg-[#B5121B] text-white border border-white/10 transition pointer-events-auto cursor-pointer shadow-xl"
                  title="Seguinte (Seta Direita)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* LUXURIOUS INSTITUTIONAL FOOTER */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-neutral-800" id="main-footer">
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          
          {/* Col 1: Brand details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-transparent flex items-center justify-center p-0">
                <img 
                  src={LOCAL_MPLA_PARTY_LOGO} 
                  alt="MPLA Logo" 
                  className="w-full h-full object-contain bg-transparent"
                />
              </div>
              <h4 className="font-extrabold text-sm text-white tracking-wide">MPLA África do Sul Sede</h4>
            </div>
            <p className="text-xs text-slate-400 leading-normal max-w-xs">
              {language === "PT" 
                ? "Portal cívico e de serviços unificado dos angolanos organizados na diáspora global. Apoio consular, integração social e cooperação económica." 
                : "Unified civic and service portal for Angolans organized in the global diaspora. Consular assistance, social integration, and trade."}
            </p>
            <p className="text-[10px] font-mono text-[#D4AF37] font-bold">
              {language === "PT" ? "UNIDADE, LUTA, PROGRESSO" : "UNITY, STRUGGLE, PROGRESS"}
            </p>
          </div>

          {/* Col 2: Directory links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">{language === "PT" ? "Recursos" : "Resources"}</h5>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <a href="#about" className="hover:text-[#D4AF37]">{language === "PT" ? "Sobre Nós" : "About Us"}</a>
              <a href="#news" className="hover:text-[#D4AF37]">{language === "PT" ? "Comunicados de Imprensa" : "Press Releases"}</a>
              <a href="#events" className="hover:text-[#D4AF37]">{language === "PT" ? "Calendário de Eventos" : "Events Calendar"}</a>
            </div>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">{language === "PT" ? "Informações" : "Information"}</h5>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <a href="#contact" className="hover:text-[#D4AF37]">{language === "PT" ? "Entre em Contacto" : "Get In Touch"}</a>
              <a href="#membership" className="hover:text-[#D4AF37]">{language === "PT" ? "Filiação Partidária" : "Join Party"}</a>
              <button 
                onClick={() => showToast(language === "PT" ? "Estatuto Geral de Proteção de Dados - SADC em conformidade com as diretivas do MPLA." : "General Data Protection SADC Compliant with MPLA Directives.", "info")} 
                className="text-left hover:text-[#D4AF37] cursor-pointer"
              >
                {language === "PT" ? "Política de Privacidade" : "Privacy Policy"}
              </button>
              <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                GATEWAY COMPLIANCE VERIFIED
              </span>
            </div>
          </div>

          {/* Col 4: Newsletter sign-up */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">NEWSLETTER</h5>
            <p className="text-xs text-slate-400 leading-normal">
              Inscreva o seu e-mail para receber alertas consulares e novos cursos da Sede de Coordenação.
            </p>
            {newsletterSuccess ? (
              <p className="text-xs text-emerald-400 font-bold">✓ {language === "PT" ? "Subscrito com sucesso!" : "Subscribed successfully!"}</p>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setNewsletterSuccess(true); }} 
                className="flex gap-2"
              >
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  placeholder="seu@email.com" 
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-hidden focus:ring-1 focus:ring-[#B5121B] flex-1"
                />
                <button 
                  type="submit" 
                  className="px-3 bg-[#B5121B] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                >
                  OK
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Legal copyright bar */}
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[11px] font-medium text-slate-300">
            © 2026 MPLA AFRICA DO SUL. Todos os direitos reservados. Em conformidade com a Carta Constitucional.
          </span>
          <div className="text-xs font-medium text-slate-300 flex flex-wrap items-center justify-center gap-2">
            <span>Developed by <strong className="text-white">NeuroGrowth Labs</strong> <a href="https://www.neurogrowthlabs.co.za" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] font-mono hover:underline font-bold">www.neurogrowthlabs.co.za</a></span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="font-mono text-[10px] text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Portal ID: M-1791641184163-SSL-2026</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">
            SADC PORTAL AUTHORITY v3.0.0
          </span>
        </div>
      </footer>
    </div>
  );
}
