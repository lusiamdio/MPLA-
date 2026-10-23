// Centralized image library with reliable SVG Data URIs and high-availability Unsplash fallbacks
// Prevents broken images, missing logos, or external hotlinking blocks across PDF generation and UI components.

// 1. MPLA Official Vector Emblem (100% vector SVG Data URI - 0ms load time, guaranteed in PDF/Print Popups)
export const MPLA_EMBLEM_SVG = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20500%20500%22%20width%3D%22500%22%20height%3D%22500%22%3E%3Cdefs%3E%3CclipPath%20id%3D%22c%22%3E%3Ccircle%20cx%3D%22250%22%20cy%3D%22250%22%20r%3D%22240%22%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3Ccircle%20cx%3D%22250%22%20cy%3D%22250%22%20r%3D%22240%22%20fill%3D%22%23C8102E%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%22250%22%20width%3D%22500%22%20height%3D%22250%22%20fill%3D%22%23000000%22%20clip-path%3D%22url(%23c)%22%2F%3E%3Ccircle%20cx%3D%22250%22%20cy%3D%22250%22%20r%3D%22234%22%20fill%3D%22none%22%20stroke%3D%22%23FFCC00%22%20stroke-width%3D%2214%22%2F%3E%3Cg%20transform%3D%22translate(250%2C%20250)%22%3E%3Cpolygon%20points%3D%220%2C-100%2022.5%2C-31%2095%2C-31%2036.3%2C11.8%2058.8%2C80.9%200%2C38.2%20-58.8%2C80.9%20-36.3%2C11.8%20-95%2C-31%20-22.5%2C-31%22%20fill%3D%22%23FFCC00%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";

// 2. Default Profile / Avatar Fallbacks
export const DEFAULT_MEMBER_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=400&q=80";
export const DEFAULT_AVATAR_SQUARE = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80";

// 3. Local High-Res Assets
import mplaSupportersImg from "./assets/images/mpla_supporters_background_1784328681804.jpg";
import mplaPresidentsImg from "./assets/images/mpla_presidents_collage_1784384603231.jpg";
import comiteeImg from "./assets/images/Comitee.jpg";
import pptImg from "./assets/images/PPT.jpeg";
import firstSecretaryImg from "./assets/images/ChatGPT Image Aug 22, 2026, 09_30_52 PM.png";
import joaoLourencoImg from "./assets/images/Joao-Lourenco-president-Angola-2023-removebg-preview.png";
import mplaPartyLogoImg from "./assets/images/MPLA_Party_logo.svg.webp";
import img6400 from "./assets/images/IMG_6400.JPG";
import img6401 from "./assets/images/IMG_6401.JPG";
import img6602 from "./assets/images/IMG_6602.JPG";
import img6218 from "./assets/images/IMG_6218.JPG";

export const LOCAL_SUPPORTERS_BACKGROUND = mplaSupportersImg;
export const LOCAL_PRESIDENTS_COLLAGE = mplaPresidentsImg;
export const LOCAL_COMITEE_IMAGE = comiteeImg;
export const LOCAL_PPT_IMAGE = firstSecretaryImg;
export const LOCAL_FIRST_SECRETARY_IMAGE = firstSecretaryImg;
export const LOCAL_JOAO_LOURENCO_IMAGE = joaoLourencoImg;
export const LOCAL_MPLA_PARTY_LOGO = mplaPartyLogoImg;
export const LOCAL_IMG_6400 = img6400;
export const LOCAL_IMG_6401 = img6401;

// Curated authentic MPLA Conference, Rally, Workshop and Forum covers from assets
export const EVENT_CONFERENCE_COVER = img6400; // Authentic MPLA Conference / Solemn Cadres Assembly
export const EVENT_RALLY_COVER = mplaSupportersImg; // Authentic MPLA Militants & Supporters Mass Rally
export const EVENT_WORKSHOP_COVER = comiteeImg; // Authentic MPLA Executive Committee Workshop & Strategy Table
export const EVENT_FORUM_COVER = img6401; // Authentic MPLA Regional Forum & Delegation Meeting
export const EVENT_SEMINAR_COVER = pptImg; // Authentic Cadres Training & Political Presentation
export const EVENT_COMMUNITY_COVER = img6602; // Authentic MPLA Gathering & Community Session
export const EVENT_ASSEMBLY_COVER = img6218; // Authentic Conference Hall Assembly

// Dynamic loader for all images placed in src/assets/images
const globImageModules = import.meta.glob<{ default: string }>('./assets/images/*.{jpg,jpeg,png,JPG,JPEG,PNG,webp,WEBP}', { eager: true });

export interface LocalGalleryItem {
  id: string;
  url: string;
  filename: string;
  title_pt: string;
  title_en: string;
  title_fr: string;
  category: "leadership" | "events" | "community" | "education" | "culture";
  tag_pt: string;
  tag_en: string;
  tag_fr: string;
}

export function getAllLocalGalleryImages(): LocalGalleryItem[] {
  const items: LocalGalleryItem[] = [];
  
  for (const path in globImageModules) {
    const mod = globImageModules[path];
    const url = mod?.default || (typeof mod === "string" ? mod : "");
    if (!url) continue;
    
    const filename = path.split("/").pop() || "";
    
    // Custom metadata based on filename
    let title_pt = "Actividade e Sessão de Trabalho do MPLA";
    let title_en = "MPLA Activity and Working Session";
    let title_fr = "Activité et Session de Travail du MPLA";
    let category: LocalGalleryItem["category"] = "events";
    let tag_pt = "Actividade";
    let tag_en = "Activity";
    let tag_fr = "Activité";

    if (filename.includes("6400")) {
      title_pt = "Comité do MPLA na África do Sul - Reunião Solene de Quadros e Militantes";
      title_en = "MPLA South Africa Committee - Solemn Meeting of Cadres and Members";
      title_fr = "Comité du MPLA en Afrique du Sud - Réunion Solennelle des Cadres et Membres";
      category = "leadership";
      tag_pt = "Executivo Oficial";
      tag_en = "Official Executive";
      tag_fr = "Exécutif Officiel";
    } else if (filename.includes("6401")) {
      title_pt = "Comité de Coordenação Regional - Encontro de Militantes e Delegação Provincial";
      title_en = "Regional Coordination Committee - Meeting of Members and Provincial Delegation";
      title_fr = "Comité de Coordination Régionale - Rencontre des Membres et Délégation Provinciale";
      category = "community";
      tag_pt = "Mobilização Regional";
      tag_en = "Regional Mobilization";
      tag_fr = "Mobilisation Régionale";
    } else if (filename.includes("Comitee")) {
      title_pt = "Comissão Executiva do MPLA - Reunião Plenária e Planeamento";
      title_en = "MPLA Executive Committee - Plenary Meeting and Strategic Planning";
      title_fr = "Comité Exécutif du MPLA - Réunion Plénière et Planification Stratégique";
      category = "leadership";
      tag_pt = "Liderança";
      tag_en = "Leadership";
      tag_fr = "Direction";
    } else if (filename.includes("PPT")) {
      title_pt = "Apresentação de Linhas Orientadoras e Formação Política de Quadros";
      title_en = "Presentation of Policy Guidelines and Political Cadre Training";
      title_fr = "Présentation des Lignes Directrices et Formation Politique des Cadres";
      category = "education";
      tag_pt = "Formação";
      tag_en = "Training";
      tag_fr = "Formation";
    } else if (filename.includes("presidents_collage")) {
      title_pt = "Galeria Histórica dos Presidentes e Líderes do MPLA";
      title_en = "Historical Gallery of MPLA Presidents and Leaders";
      title_fr = "Galerie Historique des Présidents et Dirigeants du MPLA";
      category = "leadership";
      tag_pt = "História";
      tag_en = "History";
      tag_fr = "Histoire";
    } else if (filename.includes("supporters_background")) {
      title_pt = "Mobilização Cívica e Apoio Popular da Comunidade Angolana";
      title_en = "Civic Mobilization and Community Popular Support";
      title_fr = "Mobilisation Civique et Soutien Populaire de la Communauté Angolaise";
      category = "community";
      tag_pt = "Comunidade";
      tag_en = "Community";
      tag_fr = "Communauté";
    } else if (filename.toLowerCase().startsWith("img_")) {
      const numMatch = filename.match(/\d+/);
      const numStr = numMatch ? numMatch[0] : "";
      title_pt = `Registo Fotográfico Oficial da Diáspora #${numStr || filename}`;
      title_en = `Official Diaspora Photo Record #${numStr || filename}`;
      title_fr = `Enregistrement Photographique Officiel de la Diaspora #${numStr || filename}`;
      category = "events";
      tag_pt = "Sessão Fotográfica";
      tag_en = "Photo Session";
      tag_fr = "Session Photo";
    }

    // Skip logo with removebg from main photography gallery
    if (filename.includes("removebg")) continue;

    items.push({
      id: filename,
      url,
      filename,
      title_pt,
      title_en,
      title_fr,
      category,
      tag_pt,
      tag_en,
      tag_fr
    });
  }

  return items;
}

// 4. Curated Reliable Public & Hero Images
export const HERO_SLIDE_1 = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80";
export const HERO_SLIDE_2 = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80";
export const HERO_SLIDE_3 = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80";

// 5. Registration Profile Photo Samples
export const PHOTO_SAMPLES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80"
];

// 6. Registration Cover Photo Samples
export const COVER_SAMPLES = [
  "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
];

// 7. Gallery & Event Images
export const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80", title: "Acção Solidária e Apoio à Comunidade" },
  { url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", title: "Encontro de Quadros e Seminário de Liderança" },
  { url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80", title: "Concertação Política e Organização de Membros" },
  { url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80", title: "OMA - Delegação no Congresso Regional" },
  { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80", title: "JMPLA - Reunião Geral de Quadros" },
  { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", title: "Militantes e Apoiantes na Diáspora" }
];
