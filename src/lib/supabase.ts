import { createClient } from '@supabase/supabase-js';
import { 
  Member, 
  PartyEvent, 
  Announcement, 
  SupportTicket, 
  LearningCourse, 
  PaymentLog, 
  SystemAuditLog, 
  SurveyPoll 
} from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yuykjagarpubbwpxsush.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1eWtqYWdhcnB1YmJ3cHhzdXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTc0MTEsImV4cCI6MjEwMDk5MzQxMX0.A6fgO8uhIhgY8YCauhvOglL4HrMdXlkVFhsBh1Pxt_k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ====================================================================================
// AUTHENTICATION ENGINE
// ====================================================================================

export async function signUpMilitante(params: {
  email: string;
  password: string;
  fullName: string;
  nationalId: string;
  mobile?: string;
  province?: string;
  organizationWing?: 'Militante' | 'JMPLA' | 'OMA';
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        national_id: params.nationalId,
        mobile: params.mobile || '+27 82 000 0000',
        province: params.province || 'Western Cape',
        organization_wing: params.organizationWing || 'Militante',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInUser(params: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentMemberProfile(): Promise<Member | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbMemberToFrontend(data);
}

// ====================================================================================
// MEMBER MANAGEMENT & VERIFICATION
// ====================================================================================

export async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbMemberToFrontend);
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`id.eq.${id},membership_no.eq.${id}`)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbMemberToFrontend(data);
}

export async function updateMemberProfile(memberId: string, updates: Partial<Member>) {
  const dbPayload: any = {};
  if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
  if (updates.mobile !== undefined) dbPayload.mobile = updates.mobile;
  if (updates.photo !== undefined) dbPayload.photo = updates.photo;
  if (updates.coverPhoto !== undefined) dbPayload.cover_photo = updates.coverPhoto;
  if (updates.bio !== undefined) dbPayload.bio = updates.bio;
  if (updates.skills !== undefined) dbPayload.skills = updates.skills;
  if (updates.interests !== undefined) dbPayload.interests = updates.interests;
  if (updates.socialLinks !== undefined) dbPayload.social_links = updates.socialLinks;
  if (updates.visibilitySettings !== undefined) dbPayload.visibility_settings = updates.visibilitySettings;
  if (updates.physicalCardStatus !== undefined) dbPayload.physical_card_status = updates.physicalCardStatus;
  if (updates.status !== undefined) dbPayload.status = updates.status;
  if (updates.outstandingBalance !== undefined) dbPayload.outstanding_balance = updates.outstandingBalance;

  const { data, error } = await supabase
    .from('members')
    .update(dbPayload)
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return mapDbMemberToFrontend(data);
}

export async function verifyMemberCardHMAC(membershipNo: string, signature: string) {
  const { data, error } = await supabase.rpc('verify_member_card', {
    p_membership_no: membershipNo,
    p_signature: signature,
  });

  if (error) throw error;
  return data;
}

// ====================================================================================
// EVENTS, ANNOUNCEMENTS & FORMATION
// ====================================================================================

export async function fetchEvents(): Promise<PartyEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) throw error;
  return (data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.event_date,
    location: e.location,
    venue: e.venue,
    province: e.province,
    lat: e.lat ? Number(e.lat) : undefined,
    lng: e.lng ? Number(e.lng) : undefined,
    organizer: e.organizer || 'National',
    status: e.status || 'Upcoming',
    registeredCount: e.registered_count || 0,
    capacity: e.capacity || 500,
    registeredMemberIds: e.registered_member_ids || [],
  }));
}

export async function registerForEvent(eventId: string, memberId: string) {
  const { error } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, member_id: memberId });

  if (error && error.code !== '23505') throw error; // Ignore duplicate registrations
  return true;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    source: a.source || 'National',
    date: a.date || a.created_at?.split('T')[0],
    author: a.author || 'Secretariado Executivo',
    category: a.category || 'Campaign',
  }));
}

export async function fetchCourses(): Promise<LearningCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('pillar_number', { ascending: true });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    pillarNumber: c.pillar_number,
    pillarRoman: c.pillar_roman,
    pillarTitle: c.pillar_title,
    title: c.title,
    description: c.description,
    targetAudience: c.target_audience,
    essentialContent: c.essential_content,
    formatDescription: c.format_description,
    category: c.category,
    duration: c.duration,
    videoUrl: c.video_url,
    contentMarkdown: c.content_markdown,
    studyCase: c.study_case,
    resources: c.resources,
    quiz: c.quiz,
  }));
}

// ====================================================================================
// SUPPORT TICKETS & REALTIME
// ====================================================================================

export async function fetchSupportTickets(memberId?: string): Promise<SupportTicket[]> {
  let query = supabase
    .from('support_tickets')
    .select('*, ticket_replies(*)')
    .order('created_at', { ascending: false });

  if (memberId) {
    query = query.eq('member_id', memberId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((t: any) => ({
    id: t.id,
    memberId: t.member_id,
    type: t.type,
    description: t.description,
    status: t.status,
    assignedOfficer: t.assigned_officer,
    estResolutionTime: t.est_resolution_time,
    createdAt: t.created_at,
    replies: (t.ticket_replies || []).map((r: any) => ({
      sender: r.sender_type,
      senderName: r.sender_name,
      text: r.text,
      timestamp: r.created_at,
    })),
  }));
}

export async function createSupportTicket(ticket: {
  memberId: string;
  type: string;
  description: string;
}) {
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      id: ticketId,
      member_id: ticket.memberId,
      type: ticket.type,
      description: ticket.description,
      status: 'Open',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addTicketReply(ticketId: string, reply: {
  senderType: 'member' | 'officer';
  senderName: string;
  text: string;
}) {
  const { data, error } = await supabase
    .from('ticket_replies')
    .insert({
      ticket_id: ticketId,
      sender_type: reply.senderType,
      sender_name: reply.senderName,
      text: reply.text,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ====================================================================================
// PAYMENTS & FINANCIAL AUDIT
// ====================================================================================

export async function fetchPayments(memberId?: string): Promise<PaymentLog[]> {
  let query = supabase
    .from('payment_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (memberId) {
    query = query.eq('member_id', memberId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    memberId: p.member_id,
    amount: Number(p.amount),
    currency: p.currency || 'ZAR',
    date: p.date,
    method: p.method,
    status: p.status,
    purpose: p.purpose,
    payerPhone: p.payer_phone,
    absaPaymentId: p.absa_payment_id,
    absaTransactionId: p.absa_transaction_id,
    receiptUrl: p.receipt_url,
  }));
}

export async function recordPayment(payment: {
  memberId: string;
  amount: number;
  method: string;
  purpose: string;
  currency?: string;
}) {
  const txId = `PAY-${Date.now().toString().slice(-8)}`;
  const { data, error } = await supabase
    .from('payment_logs')
    .insert({
      id: txId,
      member_id: payment.memberId,
      amount: payment.amount,
      currency: payment.currency || 'ZAR',
      method: payment.method,
      purpose: payment.purpose,
      status: 'Successful',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ====================================================================================
// WEBSITE CMS & CONFIGURATION
// ====================================================================================

export async function fetchWebsiteCMS() {
  const { data, error } = await supabase
    .from('website_cms_config')
    .select('*')
    .eq('id', 'current_cms')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateWebsiteCMS(updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('website_cms_config')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'current_cms')
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ====================================================================================
// STORAGE: AVATARS & ID CARDS
// ====================================================================================

export async function uploadMemberAvatar(file: File, memberId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${memberId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  await updateMemberProfile(memberId, { photo: publicUrl });
  return publicUrl;
}

// ====================================================================================
// MAPPER HELPER: DATABASE ROW -> FRONTEND MEMBER MODEL
// ====================================================================================

function mapDbMemberToFrontend(row: any): Member {
  return {
    id: row.id,
    membershipNo: row.membership_no,
    nationalId: row.national_id,
    idType: row.id_type || 'BI',
    fullName: row.full_name,
    email: row.email || '',
    mobile: row.mobile || '',
    photo: row.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    coverPhoto: row.cover_photo,
    photoPositionX: row.photo_position_x ? Number(row.photo_position_x) : 50,
    photoPositionY: row.photo_position_y ? Number(row.photo_position_y) : 50,
    trackingCode: row.tracking_code,
    canUpdatePhoto: row.can_update_photo ?? true,
    lastRenewalDate: row.last_renewal_date,
    isRealData: row.is_real_data ?? true,
    role: row.role || 'member',
    status: row.status || 'Active',
    membershipLevel: row.membership_level || 'Standard',
    category: row.category || 'General',
    organizationWing: row.organization_wing || 'Militante',
    militancyLevel: row.militancy_level || 'Militante',
    province: row.province || 'Western Cape',
    municipality: row.municipality || 'City of Cape Town',
    committee: row.committee || 'Comité do MPLA na Cidade do Cabo',
    branch: row.branch,
    address: row.address,
    duesStatus: row.dues_status || 'Em Dia',
    duesBalance: Number(row.dues_balance || 0),
    outstandingBalance: Number(row.outstanding_balance || 0),
    registrationDate: row.registration_date || '2026-01-01',
    physicalCardStatus: row.physical_card_status || 'Submitted',
    physicalCardEstDate: row.physical_card_est_date || '2026-08-15',
    issuingOffice: row.issuing_office || 'Comité da Cidade do Cabo',
    gender: row.gender || 'Male',
    dob: row.dob || '1995-01-01',
    placeOfBirth: row.place_of_birth,
    maritalStatus: row.marital_status || 'Single',
    emergencyContact: row.emergency_contact || { name: 'Contacto de Emergência', phone: '+27 82 000 0000' },
    occupation: row.occupation || 'Profissional',
    employer: row.employer || 'Empresa / Organização',
    education: row.education || 'Ensino Superior',
    leadershipRoles: row.leadership_roles || [],
    registeredEvents: row.registered_events || [],
    completedCourses: row.completed_courses || [],
    votedPolls: row.voted_polls || {},
    paymentHistory: row.payment_history || [],
    bio: row.bio,
    skills: row.skills || [],
    interests: row.interests || [],
    socialLinks: row.social_links || {},
    visibilitySettings: row.visibility_settings || {
      bio: 'public',
      skills: 'public',
      interests: 'members',
      socialLinks: 'public',
      email: 'members',
      mobile: 'private',
      occupation: 'public',
    },
    virtualCardNumber: row.virtual_card_number,
    virtualCardExpiry: row.virtual_card_expiry,
    virtualCardCvv: row.virtual_card_cvv,
    virtualCardBalance: Number(row.virtual_card_balance || 0),
    virtualCardStatus: row.virtual_card_status || 'Active',
    cardSignature: row.card_signature,
  };
}
