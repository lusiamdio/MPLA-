export type FieldVisibilityLevel = 'public' | 'members' | 'private';

export interface MemberSocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  website?: string;
}

export interface MemberFieldVisibility {
  bio?: FieldVisibilityLevel;
  skills?: FieldVisibilityLevel;
  interests?: FieldVisibilityLevel;
  socialLinks?: FieldVisibilityLevel;
  email?: FieldVisibilityLevel;
  mobile?: FieldVisibilityLevel;
  occupation?: FieldVisibilityLevel;
}

export interface Member {
  id: string;
  membershipNo: string;
  nationalId: string;
  fullName: string;
  email: string;
  mobile: string;
  photo: string;
  coverPhoto?: string;
  photoPositionX?: number;
  photoPositionY?: number;
  trackingCode?: string;
  canUpdatePhoto?: boolean;
  lastRenewalDate?: string;
  isRealData?: boolean;
  role?: 'member' | 'admin';
  status: 'Pending Verification' | 'Active' | 'Inactive' | 'Suspended';
  membershipLevel: 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'Committee';
  category: 'Youth' | 'Senior' | 'General' | 'Associate';
  province: string;
  municipality: string;
  committee: string;
  branch?: string;
  address?: string;
  duesStatus?: string;
  duesBalance?: number;
  digitalCardIssued?: boolean;
  physicalCardRequested?: boolean;
  registrationDate: string;
  physicalCardStatus: 'Submitted' | 'Verification' | 'Approved' | 'Printing' | 'Quality Check' | 'Ready for Dispatch' | 'In Transit' | 'Available for Collection' | 'Collected';
  physicalCardEstDate: string;
  issuingOffice?: string;
  outstandingBalance: number;
  paymentHistory?: { id: string; date: string; amount: number; purpose: string; status: string }[];
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  placeOfBirth?: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  emergencyContact: { name: string; phone: string };
  occupation: string;
  employer: string;
  education: string;
  leadershipRoles: string[];
  registeredEvents: string[]; // event IDs
  completedCourses: string[]; // course IDs
  votedPolls: { [pollId: string]: string }; // pollId -> votedOption

  // Expanded Profile, Community & Visibility
  bio?: string;
  skills?: string[];
  interests?: string[];
  socialLinks?: MemberSocialLinks;
  visibilitySettings?: MemberFieldVisibility;

  // Identification and Organization Wings
  idType?: 'BI' | 'Passport';
  organizationWing?: 'Militante' | 'JMPLA' | 'OMA';
  militancyLevel?: string;

  // Individual Virtual Debit Card (Whop Payment Integration)
  virtualCardNumber?: string;
  virtualCardExpiry?: string;
  virtualCardCvv?: string;
  virtualCardBalance?: number;
  virtualCardStatus?: 'Active' | 'Blocked';

  // Security & Cryptographic Authenticity
  passwordHash?: string;
  cardSignature?: string;
}

export interface OfficialDocument {
  id: string;
  title: string;
  category: 'Membership' | 'Certificates' | 'Receipts' | 'AdminDispatch' | 'AIGeneral';
  size: string;
  date: string;
  sender: 'member' | 'admin' | 'system';
  recipientId?: string; // member ID if specific
  fileName: string;
  status: 'Approved' | 'Pending' | 'Delivered';
  fileContent?: string;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  source: 'National' | 'Regional' | 'Local';
  date: string;
  author: string;
  category: 'Campaign' | 'News' | 'Press Release' | 'Notice' | 'Emergency';
}

export interface PartyEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  venue?: string;
  province?: string;
  lat?: number;
  lng?: number;
  organizer: 'National' | 'Provincial' | 'Municipal' | 'Local';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  registeredCount: number;
  capacity: number;
  registeredMemberIds: string[];
}

export interface ChatMessage {
  sender: 'member' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatChannel {
  id: string;
  memberId: string;
  type: 'Local Committee' | 'Regional Office' | 'National Helpdesk';
  messages: ChatMessage[];
}

export interface SupportTicketReply {
  sender: 'member' | 'officer';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  memberId: string;
  type: 'Profile Correction' | 'Lost Card Report' | 'Card Replacement' | 'General Inquiry';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedOfficer: string;
  estResolutionTime: string;
  createdAt: string;
  replies: SupportTicketReply[];
}

export interface SurveyPoll {
  id: string;
  title: string;
  description: string;
  options: string[];
  votes: { [option: string]: number }; // optionName -> voteCount
  votedMemberIds: string[];
  isAnonymous: boolean;
}

export interface PaymentLog {
  id: string;
  memberId: string;
  amount: number;
  currency?: string;
  date: string;
  method: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
  purpose: string;
  payerPhone?: string;
  
  // ABSA Open Banking metadata
  absaPaymentId?: string;
  absaTransactionId?: string;
  absaAccountNumber?: string;
  absaAccountName?: string;
  absaPayerType?: 'Account' | 'SAID' | 'PASSPORT';
  absaPayerIdentifier?: string;
  absaStatementRef?: string;
  absaSureCheckStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  isRecurring?: boolean;
  recurringScheduleId?: string;
  receiptUrl?: string;
  fxRateApplied?: number;
  amountAOA?: number;

  // VodaPay Gateway metadata
  vodapayPaymentId?: string;
  vodapayPaymentRequestId?: string;
  vodapayStatus?: 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
  vodapayQrCode?: string;
  vodapayCashierUrl?: string;
  vodapayPayerPhone?: string;
  vodapayMaskedWallet?: string;
  vodapayProductCode?: 'CASHIER_PAYMENT' | 'IN_APP_PAYMENT' | 'QR_CODE_PAYMENT' | 'MOBILE_PUSH';
  vodapayTraceNo?: string;
}

// ==========================================
// VODAPAY GATEWAY INTERFACES
// ==========================================
export interface VodaPayPaymentRequestPayload {
  paymentRequestId: string;
  paymentAmount: {
    currency: string;
    value: string | number;
  };
  order: {
    orderId: string;
    orderDescription: string;
    orderTitle?: string;
    goods?: Array<{
      referenceGoodsId: string;
      goodsName: string;
      goodsCategory?: string;
      price: { currency: string; value: string };
      quantity: string;
    }>;
  };
  paymentNotifyUrl?: string;
  paymentRedirectUrl?: string;
  productCode?: 'CASHIER_PAYMENT' | 'IN_APP_PAYMENT' | 'QR_CODE_PAYMENT' | 'MOBILE_PUSH';
  salesCode?: string;
  memberId?: string;
  payerPhone?: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'annual';
}

export interface VodaPayPaymentResponseData {
  paymentId: string;
  paymentRequestId: string;
  paymentUrl: string;
  qrCodeData: string;
  qrCodeUrl?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  resultInfo: {
    resultCode: string;
    resultStatus: 'S' | 'A' | 'F' | 'U';
    resultMessage: string;
  };
  timestamp: string;
  traceNo?: string;
}

export interface VodaPayInquiryResponseData {
  paymentId: string;
  paymentRequestId: string;
  paymentAmount: {
    currency: string;
    value: string;
  };
  status: 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'FAILED';
  resultInfo?: {
    resultCode: string;
    resultMessage: string;
  };
  paidTime?: string;
  payerInfo?: {
    payerId?: string;
    payerPhone?: string;
    maskedWallet?: string;
    payerName?: string;
  };
}

export interface VodaPayRefundPayload {
  paymentId: string;
  refundRequestId: string;
  refundAmount: {
    currency: string;
    value: string | number;
  };
  refundReason: string;
}

export interface VodaPayGatewayConfig {
  clientId: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  notifyUrl: string;
  status: 'Online' | 'Offline';
  supportedCurrencies: string[];
  features: string[];
  lastPingAt: string;
  latencyMs: number;
}

export interface AbsaPaymentConsentPayload {
  amount: number | string;
  currency?: string;
  purpose: string;
  payerIdentificationType: 'Account' | 'SAID' | 'PASSPORT';
  payerIdentification: string;
  payerDisplayNarrative?: string;
  payerStatementReference?: string;
  userNumber?: string;
  memberId?: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'annual';
}

export interface AbsaEligibleAccount {
  accountName: string;
  accountNumber: string;
  accountIndex: number;
  availableBalance?: number;
}

export interface AbsaConsentResponseData {
  paymentId: string;
  transactionId: string;
  resultCode: number;
  resultMessage?: string;
  accounts?: AbsaEligibleAccount[];
  timestamp?: string;
}

export interface AbsaPaymentInstructionPayload {
  paymentId: string;
  transactionId: string;
  accountIndex: number;
  memberId?: string;
  purpose?: string;
  amount?: number;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'annual';
  accountName?: string;
  accountNumberMasked?: string;
}

export interface AbsaRecurringSubscription {
  id: string;
  memberId: string;
  memberName: string;
  membershipNo: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'annual';
  purpose: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  payerIdentificationType: 'Account' | 'SAID' | 'PASSPORT';
  payerIdentification: string;
  absaPaymentId: string;
  absaTransactionId: string;
  accountIndex: number;
  accountName: string;
  accountNumberMasked: string;
  createdAt: string;
  nextBillingDate: string;
  lastBilledDate?: string;
  billingCount: number;
  totalPaid: number;
}

export interface AbsaFxRate {
  currencyPair: string;
  bid: number;
  offer: number;
  midRate: number;
  timestamp: string;
  currencyName: string;
}

export interface CourseMediaLink {
  title: string;
  platform: 'youtube' | 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'linkedin' | 'archive' | 'portal';
  url: string;
  description?: string;
  badge?: string;
}

export interface PreviousClass {
  id: string;
  title: string;
  date: string;
  speaker: string;
  topic: string;
  duration: string;
  youtubeId?: string;
  youtubeUrl?: string;
  recordingUrl?: string;
  slidesUrl?: string;
  summary: string;
}

export interface LearningCourse {
  id: string;
  pillarNumber?: number;
  pillarRoman?: string;
  pillarTitle?: string;
  title: string;
  description: string;
  targetAudience?: string;
  essentialContent?: string[];
  formatDescription?: string;
  category: string;
  duration: string;
  videoUrl?: string;
  contentMarkdown?: string;
  studyCase?: {
    scenario: string;
    reflectionQuestion: string;
    practicalTask: string;
  };
  resources?: {
    title: string;
    type: "pdf" | "manual" | "video" | "link" | "doc";
    description: string;
    url?: string;
    size?: string;
  }[];
  previousClasses?: PreviousClass[];
  socialChannels?: CourseMediaLink[];
  extraMaterials?: {
    title: string;
    type: string;
    format: string;
    url: string;
    size?: string;
    description: string;
    category?: string;
  }[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  device: string;
  location: string;
  ip: string;
  details: string;
}

export interface InventoryStats {
  blankCards: number;
  printersStatus: 'Online' | 'Offline' | 'Maintenance';
  inkPercent: number;
  ribbonPercent: number;
  packagingEnvelopes: number;
  holograms: number;
}

export interface AdminNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  meta?: {
    memberName?: string;
    membershipNo?: string;
    eventTitle?: string;
    eventDate?: string;
    eventLocation?: string;
    senderName?: string;
    ticketId?: string;
    ticketType?: string;
    amount?: number;
    purpose?: string;
    txId?: string;
    [key: string]: any;
  };
}

export interface AbsaOAuthTokenInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  cachedAt?: number;
  expiresAt?: string;
  source: 'live_gateway' | 'sandbox_simulation';
  endpoint: string;
  consumerKeyMasked: string;
}

export interface ReconciliationDiscrepancy {
  id: string;
  type: 'status_mismatch' | 'unbooked_in_db' | 'amount_difference' | 'missing_statement_ref' | 'pending_bank_settled';
  severity: 'high' | 'medium' | 'low';
  description: string;
  localTransactionId?: string;
  bankTransactionId?: string;
  memberId?: string;
  memberName?: string;
  localAmount?: number;
  bankAmount?: number;
  localStatus?: string;
  bankStatus?: string;
  transactionDate: string;
  resolved: boolean;
  resolutionNote?: string;
  resolvedAt?: string;
  autoResolvable: boolean;
}

export interface ReconciliationAuditReport {
  lastAuditAt: string;
  totalDbRecords: number;
  totalBankTransactions: number;
  reconciledCount: number;
  discrepancyCount: number;
  reconciliationRate: number;
  totalVerifiedZAR: number;
  totalVarianceZAR: number;
  discrepancies: ReconciliationDiscrepancy[];
}

export interface QuarterlyTrendData {
  month: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  absaPayEFT: number;
  absaDebiCheck: number;
  virtualCard: number;
  totalZAR: number;
  totalAOA: number;
  targetZAR: number;
  militantesPaid: number;
}

export interface VodaPayMerchantOverview {
  merchantId: string;
  merchantName: string;
  tradingName: string;
  mccCode: string;
  settlementAccount: string;
  settlementBank: string;
  dailyGrossVolume: number;
  monthlyGrossVolume: number;
  pendingSettlement: number;
  totalSettled: number;
  settlementCycle: string;
  nextPayoutDate: string;
  interchangeFeeRate: number;
  qrFeeRate: number;
  activeTerminals: number;
  todayTransactionsCount: number;
}

export interface VodaPaySettlementBatch {
  id: string;
  batchNumber: string;
  date: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  transactionCount: number;
  status: 'SETTLED' | 'PROCESSING' | 'PENDING';
  bankReference: string;
}

export interface VodaPayPaymentLink {
  id: string;
  linkCode: string;
  title: string;
  amount: number;
  purpose: string;
  recipientMemberId?: string;
  recipientName?: string;
  recipientPhone?: string;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'PAID' | 'EXPIRED';
  qrUrl: string;
  paymentUrl: string;
}


