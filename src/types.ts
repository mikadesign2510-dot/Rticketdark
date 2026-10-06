export type EventCategory = 
  | 'all'
  | 'gallery'
  | 'theater'
  | 'concert'
  | 'immersive'
  | 'comedy';

export type TicketingType = 'normal' | 'seated';

export interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  availableCount: number;
  perks: string[];
}

export interface CastMember {
  id: string;
  name: string;
  role: string; // e.g. "بازیگر نقش اصلی", "کارگردان", "نوازنده ویولنسل", "طراح لباس"
  characterName?: string; // e.g. "دکتر فاستوس", "هملت", "سولیست مهمان"
  avatarUrl?: string;
  bio?: string;
}

export interface EventSpec {
  label: string; // e.g. "مدت زمان اجرا", "رده سنی", "زبان اجرا", "نویسنده متن"
  value: string; // e.g. "۱۱۰ دقیقه (بدون تنفس)", "+۱۲ سال", "فارسی با زیرنویس انگلیسی"
}

export interface ArtEvent {
  id: string;
  title: string;
  subtitle: string;
  category: 'gallery' | 'theater' | 'concert' | 'immersive';
  categoryLabel: string;
  artist: string;
  artistRole: string; // e.g. "Lead Sculptor & Spatial Artist", "Concertmaster & Conductor"
  venue: string;
  city: string;
  country: string;
  address: string;
  startDate: string; // e.g. "Oct 18, 2026"
  endDate?: string;  // e.g. "Nov 24, 2026"
  time: string;      // e.g. "19:30 - 22:00"
  timeSlots: string[];
  imageUrl: string;
  wideBannerUrl?: string; // High-res cinematic panoramic wide banner
  galleryImages: string[];
  castAndCrew?: CastMember[]; // Actors, director, characters, orchestra performers
  specs?: EventSpec[]; // Complete execution specifications (duration, age limit, interval, etc.)
  priceFrom: number;
  status: 'Selling Fast' | 'Limited VIP' | 'Available' | 'Opening Gala' | 'در حال اتمام' | 'ظرفیت محدود VIP' | 'ظرفیت موجود' | 'شب افتتاحیه' | string;
  rating: number;
  reviewsCount: number;
  description: string;
  curatorStatement: string;
  highlightTags: string[];
  tiers: TicketTier[];
  isFeatured?: boolean;
  trendingRank?: number;
  isActive?: boolean;
  ticketingType?: 'normal' | 'seated'; // نوع فروش: عادی یا با انتخاب صندلی
  hallName?: string;
}

export interface SelectedSeat {
  id: string;
  row: number;
  seatNumber: number;
  section: string;
  price: number;
}

export interface PurchasedTicket {
  ticketId: string;
  bookingRef: string;
  event: ArtEvent;
  tier: TicketTier;
  quantity: number;
  selectedTime: string;
  selectedDate: string;
  purchasedAt: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  qrCodeSeed: string;
  ticketingType?: 'normal' | 'seated';
  selectedSeats?: SelectedSeat[];
}

export interface FilterState {
  searchQuery: string;
  artistQuery: string;
  category: EventCategory;
  city: string;
  dateFilter: 'all' | 'this-week' | 'this-month' | 'weekend';
  sortBy: 'date' | 'price-asc' | 'price-desc' | 'popularity';
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  applicableEventId?: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  hasSeatedMap: boolean;
  sections: string[];
  hallCount: number;
  contactPhone?: string;
}

export type UserAccountStatus = 'active' | 'blocked' | 'pending';

export interface SiteUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalCode?: string;
  joinedDate: string;
  status: UserAccountStatus;
  ticketsCount: number;
  totalSpent: number;
  walletBalance: number;
  notes?: string;
  lastLogin?: string;
  purchasedEventTitles?: string[];
  userRole?: 'producer' | 'director' | 'customer' | 'artist';
  avatarUrl?: string;
}

export type AdminRole = 
  | 'super_admin'
  | 'box_office_admin'
  | 'event_producer'
  | 'hall_manager'
  | 'gate_operator';

export interface AdminOrganizer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: AdminRole;
  roleLabel: string;
  status: 'active' | 'inactive';
  assignedEventIds: string[];
  assignedEventTitles?: string[];
  commissionRate?: number;
  totalRevenueGenerated?: number;
  settledAmount?: number;
  unsettledAmount?: number;
  iban?: string;
  lastActive?: string;
  notes?: string;
}

export type ProposalStatus = 'pending' | 'under_review' | 'approved' | 'published' | 'rejected';

export type ProposalDocumentType = 
  | 'ershad_license'       // مجوز رسمی وزارت فرهنگ و ارشاد اسلامی
  | 'amaken_permit'        // تاییدیه پلیس نظارت بر اماکن عمومی فراجا
  | 'venue_contract'       // قرارداد اجاره یا رزرو سالن و تالار
  | 'intellectual_property'// قرارداد واگذاری حق مولف و صاحب امتیاز اثر
  | 'national_card'        // کارت ملی یا مدارک ثبتی مدیرعامل / تهیه‌کننده
  | 'other';               // سایر ضمائم و مجوزها

export interface ProposalDocument {
  id: string;
  type: ProposalDocumentType;
  typeLabel: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  uploadedAt: string;
  licenseNumber?: string;
  issueDate?: string;
}

export interface LegalHostingRuleItem {
  id: string;
  title: string;
  content: string;
  category: 'legal' | 'license' | 'financial' | 'cancellation';
  isRequiredAck: boolean;
}

export interface EventProposal {
  id: string;
  trackingCode: string;
  producerName: string;
  producerRole: string;
  companyOrGroup?: string;
  phoneNumber: string;
  email: string;
  nationalCode?: string;
  eventTitle: string;
  eventSubtitle?: string;
  category: 'theater' | 'concert' | 'gallery' | 'immersive' | 'comedy';
  categoryLabel: string;
  proposedVenue: string;
  city: string;
  proposedStartDate: string;
  proposedEndDate?: string;
  proposedTimeSlots: string[];
  estimatedPriceFrom: number;
  estimatedCapacity?: number;
  posterUrl?: string;
  description: string;
  castAndCrewSummary?: string;
  licenseCode?: string;
  documents?: ProposalDocument[];
  termsAccepted?: boolean;
  termsAcceptedDate?: string;
  createdAt: string;
  status: ProposalStatus;
  adminNotes?: string;
  publishedEventId?: string;
}

export interface EventReview {
  id: string;
  eventId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  isVerifiedBuyer?: boolean;
  likesCount?: number;
  scores?: {
    performance?: number;
    soundAndMusic?: number;
    stageDesign?: number;
    venueQuality?: number;
  };
}

