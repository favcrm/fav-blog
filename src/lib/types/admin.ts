// Admin entity types — mirrors merchant portal API types

// ── i18n ──

export interface TranslationFields {
  name?: string;
  description?: string;
}

export type Translations = Record<string, TranslationFields>;

// ── Pagination ──

export interface ListParams {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
  status?: string;
}

export interface AdminPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// ── Auth ──

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AdminAuthResponse {
  token: string;
  refreshToken: string;
  user: AdminUser;
  company: { id: string; name: string; slug: string };
  modules: string[];
  subscription: {
    planCode: string;
    status: string;
    trialEndsAt: string | null;
  };
}

// ── Products ──

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  price: string;
  discountPrice: string | null;
  memberPrice: string | null;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  stockQuantity: number;
  stockStatus: "in_stock" | "out_of_stock" | "low_stock";
  trackInventory: boolean;
  categoryId: number | null;
  categoryName: string | null;
  imageUrl: string | null;
  productType: string | null;
  gatewayProductId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  description: string | null;
  visibility: "public" | "private" | "members_only";
  allowedTierIds: string[];
  images: ProductImage[];
  options: ProductOption[];
  variations: ProductVariationAdmin[];
  translations?: Translations;
}

export interface ProductImage {
  id: number;
  productId: number;
  src: string;
  alt: string | null;
  thumbUrl: string | null;
  mediumUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductOptionValue {
  id: number;
  optionId: number;
  value: string;
  position: number;
  createdAt: string | null;
}

export interface ProductOption {
  id: number;
  productId: number;
  name: string;
  position: number;
  required: boolean;
  createdAt: string;
  values: ProductOptionValue[];
}

export interface CreateProductInput {
  name: string;
  price: string;
  description?: string;
  discountPrice?: string;
  memberPrice?: string;
  sku?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  stockQuantity?: number;
  stockStatus?: "in_stock" | "out_of_stock" | "low_stock";
  trackInventory?: boolean;
  categoryId?: number;
  imageUrl?: string;
  productType?: "one_time" | "subscription";
}

export interface UpdateProductInput {
  name?: string;
  price?: string;
  description?: string | null;
  discountPrice?: string | null;
  memberPrice?: string | null;
  sku?: string | null;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  stockQuantity?: number;
  stockStatus?: "in_stock" | "out_of_stock" | "low_stock";
  trackInventory?: boolean;
  categoryId?: number | null;
  imageUrl?: string | null;
  productType?: "one_time" | "subscription";
  translations?: Translations;
}

export interface UpdateImageInput {
  alt?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CreateOptionInput {
  name: string;
  position?: number;
  required?: boolean;
  values: string[];
}

export interface UpdateOptionInput {
  name?: string;
  position?: number;
  required?: boolean;
  values?: string[];
}

// ── Variations ──

export interface ProductVariationAdmin {
  id: number;
  productId: number;
  name: string | null;
  sku: string | null;
  price: string;
  discountPrice: string | null;
  memberPrice: string | null;
  stockQuantity: number;
  stockStatus: string;
  selectedOptions: Record<string, string> | null;
  createdAt: string;
}

export interface CreateVariationInput {
  name?: string;
  sku?: string;
  price: string;
  discountPrice?: string | null;
  memberPrice?: string | null;
  stockQuantity?: number;
  stockStatus?: string;
  selectedOptions?: Record<string, string>;
}

export type UpdateVariationInput = Partial<CreateVariationInput>;

// ── Payment Methods ──

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
  isActive: boolean;
  position: number;
  gatewayConfigId: string | null;
  gatewayName: string | null;
  bookingEnabled: boolean;
  shopEnabled: boolean;
  eventEnabled: boolean;
  membershipEnabled: boolean;
}

export interface CreatePaymentMethodInput {
  name: string;
  type: string;
  instructions?: string | null;
  isActive?: boolean;
  position?: number;
  gatewayConfigId?: string | null;
  bookingEnabled?: boolean;
  shopEnabled?: boolean;
  eventEnabled?: boolean;
  membershipEnabled?: boolean;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> {
  instructions?: string | null;
  gatewayConfigId?: string | null;
}

// ── Shipping Methods ──

export interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  price: number;
  freeShippingThreshold: number | null;
  estimatedDays: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingMethodInput {
  name: string;
  description?: string;
  price: number;
  freeShippingThreshold?: number | null;
  estimatedDays?: string | null;
  position?: number;
  isActive?: boolean;
}

export type UpdateShippingMethodInput = Partial<CreateShippingMethodInput>;

// ── Categories ──

export interface Category {
  id: number;
  name: string;
  slug: string;
  onlineEnabled: boolean;
  sortOrder: number;
  productCount: number;
  translations?: Translations;
}

export interface CreateCategoryInput {
  name: string;
  onlineEnabled?: boolean;
  sortOrder?: number;
  translations?: Translations;
}

export interface UpdateCategoryInput {
  name?: string;
  onlineEnabled?: boolean;
  sortOrder?: number;
  translations?: Translations;
}

// ── Orders ──

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
}

export interface Order {
  id: number;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string | null;
  shippingCost: string | null;
  totalAmount: string;
  customerInfo: CustomerInfo | null;
  createdAt: string;
}

export interface OrderDetail extends Order {
  promotionCode: string | null;
  shippingAddress: ShippingAddress | null;
  items: OrderItem[];
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productName: string;
  variantName?: string | null;
  variationName?: string | null;
  variationId?: number | null;
  sku?: string | null;
  variationDetails?: Record<string, unknown> | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

// ── Customers (Accounts) ──

export type AccountType = "individual" | "business" | "household";
export type LifeStage = "lead" | "active" | "churned" | "vip";
export type AccountSource =
  | "walk_in"
  | "online"
  | "pos"
  | "whatsapp"
  | "referral"
  | "import"
  | "api";

export interface CreateAccountInput {
  name: string;
  type?: AccountType;
  phone?: string;
  email?: string;
  lifeStage?: LifeStage;
  source?: AccountSource;
  notes?: string;
  enrollMembership?: boolean;
  tierId?: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  phone?: string;
  email?: string;
  lifeStage?: LifeStage;
  source?: AccountSource;
  notes?: string;
}

export interface Account {
  id: string;
  type: string;
  name: string;
  phone: string | null;
  email: string | null;
  lifeStage: string;
  source: string;
  referredBy: { id: string; name: string } | null;
  membership: MembershipSummary | null;
  createdAt: string;
}

export interface MembershipSummary {
  id: string;
  tierName: string | null;
  status: string;
  loyaltyPoints: number;
}

export interface AccountDetail extends Account {
  assignedTo: string | null;
  notes: string | null;
  contacts: ContactRef[];
  membership: MembershipDetail | null;
  updatedAt: string;
}

export interface MembershipDetail extends MembershipSummary {
  tierId: string | null;
  memberSince: string;
  expiresAt: string | null;
  lifetimePoints: number;
  lifetimeSpend: number;
  credits: string;
  creditsLifetime: string;
  stamps: number;
  stampsLifetime: number;
}

export interface ContactRef {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  jobTitle: string | null;
  isPrimary: boolean;
  createdAt: string;
}

// ── Dashboard ──

export interface DashboardStats {
  memberCount: number;
  newMembersThisWeek: number;
  activeSubscriptions: number;
  totalPointsIssued: number;
  activePromotions: number;
  rewardsRedeemed: number;
  messagesSent: number;
}

export interface AcquisitionChannel {
  source: string | null;
  count: number;
}

// ── Invoices ──

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "VOID"
  | "CANCELLED";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  accountId: string | null;
  accountName: string | null;
  accountEmail: string | null;
  accountPhone: string | null;
  amount: string;
  taxAmount: string;
  total: string;
  currency: string;
  status: InvoiceStatus;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  sortOrder: number;
  createdAt: string;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface InvoiceDetail extends Invoice {
  invoiceSeq: number;
  notes: string | null;
  paymentMethod: string | null;
  billingAddress: BillingAddress | null;
  updatedAt: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceStats {
  totalInvoiced: string;
  totalPaid: string;
  totalOutstanding: string;
  overdueCount: number;
}

export interface CreateLineItemInput {
  description: string;
  quantity?: number;
  unitPrice?: string;
  total?: string;
  sortOrder?: number;
}

export interface CreateInvoiceInput {
  accountId?: string | null;
  amount?: string;
  taxAmount?: string;
  total?: string;
  currency?: string;
  status?: InvoiceStatus;
  dueDate?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  billingAddress?: BillingAddress | null;
  lineItems?: CreateLineItemInput[];
}

export interface UpdateInvoiceInput {
  accountId?: string | null;
  amount?: string;
  taxAmount?: string;
  total?: string;
  currency?: string;
  status?: InvoiceStatus;
  dueDate?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  billingAddress?: BillingAddress | null;
  lineItems?: CreateLineItemInput[];
}

// ── Payment Transactions ──

export interface PaymentTransaction {
  id: string;
  companyId: string;
  gatewayConfigId: string | null;
  bookingId: string | null;
  gatewayType: string;
  gatewayTransactionId: string | null;
  gatewaySessionId: string | null;
  amount: string;
  currency: string;
  status: string;
  errorMessage: string | null;
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundInput {
  amount?: string;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  status: string;
}

// ── Membership Tiers ──

export interface CreateTierInput {
  name: string;
  status?: "ACTIVE" | "INACTIVE";
  price?: number;
  validPeriodValue?: number;
  validPeriodUnit?: "MONTHS" | "YEARS";
  discount?: number;
  multiplier?: number;
  isUpgradeable?: boolean;
  isPopular?: boolean;
  benefits?: string[];
}

export interface UpdateTierInput {
  name?: string;
  status?: "ACTIVE" | "INACTIVE";
  price?: number;
  validPeriodValue?: number;
  validPeriodUnit?: "MONTHS" | "YEARS";
  discount?: number;
  multiplier?: number;
  isUpgradeable?: boolean;
  isPopular?: boolean;
  benefits?: string[];
}

export interface MembershipTier {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  price: number;
  validPeriodValue: number;
  validPeriodUnit: "MONTHS" | "YEARS";
  discount: number;
  multiplier: number;
  isUpgradeable: boolean;
  isPopular: boolean;
  sortOrder: number;
  memberCount: number;
  benefits: string[];
  createdAt: string;
}

// ── Promotions ──

export type PromotionType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "FREE_SHIPPING"
  | "BOGO"
  | "TIERED";
export type PromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED";

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: PromotionType;
  value: string;
  status: PromotionStatus;
  startsAt: string | null;
  endsAt: string | null;
  usageLimitTotal: number | null;
  usageCount: number;
  bookingEnabled: boolean;
  eventEnabled: boolean;
  onlineEnabled: boolean;
  posEnabled: boolean;
  createdAt: string;
}

export interface PromotionDetail extends Promotion {
  description: string | null;
  maximumDiscount: string | null;
  usageLimitPerCustomer: number | null;
  minimumAmount: string | null;
  minimumQuantity: number | null;
  updatedAt: string;
}

export interface CreatePromotionInput {
  name: string;
  code: string;
  description?: string;
  type?: PromotionType;
  value: string;
  maximumDiscount?: string | null;
  status?: PromotionStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimitTotal?: number | null;
  usageLimitPerCustomer?: number | null;
  minimumAmount?: string | null;
  minimumQuantity?: number | null;
  bookingEnabled?: boolean;
  eventEnabled?: boolean;
  onlineEnabled?: boolean;
  posEnabled?: boolean;
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

export interface PromotionUsage {
  id: string;
  promotionId: string;
  accountId: string;
  channel: string;
  orderId: string | null;
  discountAmount: string;
  createdAt: string;
}

// ── Announcements ──

export type AnnouncementStatus = "DRAFT" | "PUBLISHED";

export interface Announcement {
  id: string;
  title: string;
  status: AnnouncementStatus;
  featuredImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementDetail extends Announcement {
  content: string | null;
}

export interface CreateAnnouncementInput {
  title: string;
  content?: string;
  status?: AnnouncementStatus;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string | null;
  status?: AnnouncementStatus;
}

// ── Reward Schemes ──

export type RewardSchemeType = "FIXED" | "VARIABLE";

export interface RewardScheme {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  points: number;
  stamps: number;
  maxPoints: number | null;
  maxStamps: number | null;
  rewardSchemeType: RewardSchemeType;
  stampAmount: number | null;
  sku: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardSchemeInput {
  name: string;
  description?: string;
  amount?: number;
  points?: number;
  stamps?: number;
  maxPoints?: number | null;
  maxStamps?: number | null;
  rewardSchemeType?: RewardSchemeType;
  stampAmount?: number | null;
  sku?: string | null;
  isDefault?: boolean;
}

export type UpdateRewardSchemeInput = Partial<CreateRewardSchemeInput>;

// ── Automatic Rewards ──

export type AutomaticRewardStatus = "ACTIVE" | "EXECUTED" | "DISABLED";
export type AutomaticRewardTrigger =
  | "NEW_MEMBER_REGISTERED"
  | "NEW_MEMBER_REGISTERED_REFERRAL"
  | "MEMBER_BIRTHDAY"
  | "MEMBER_BIRTHMONTH"
  | "MEMBER_ANNIVERSARY"
  | "D30_INACTIVE_MEMBER"
  | "D60_INACTIVE_MEMBER"
  | "D90_INACTIVE_MEMBER"
  | "SERVICE_PACKAGE_PURCHASE"
  | "NEW_REFERRAL"
  | "MEMBERSHIP_TIER_UPGRADE"
  | "POINT_STAMP_REACHED";
export type AutomaticRewardRepeat =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export interface AutomaticReward {
  id: string;
  name: string;
  status: AutomaticRewardStatus;
  trigger: AutomaticRewardTrigger;
  repeat: AutomaticRewardRepeat;
  targetTierIds: string[];
  bonusPoints: number;
  bonusStamps: number;
  bonusPointMultiplier: number;
  bonusStampMultiplier: number;
  createdAt: string;
}

export interface AutomaticRewardDetail extends AutomaticReward {
  minimumSpendingAmount: number | null;
  minimumSpendingCount: number | null;
  minimumMembershipAge: number | null;
  totalReferralCount: number | null;
  referenceId: string | null;
  bonusGiftOfferId: string | null;
  bonusGiftOfferQuantity: number | null;
  updatedAt: string;
}

export interface CreateAutomaticRewardInput {
  name: string;
  status?: AutomaticRewardStatus;
  trigger: AutomaticRewardTrigger;
  repeat?: AutomaticRewardRepeat;
  targetTierIds?: string[];
  minimumSpendingAmount?: number | null;
  minimumSpendingCount?: number | null;
  minimumMembershipAge?: number | null;
  totalReferralCount?: number | null;
  referenceId?: string | null;
  bonusPoints?: number;
  bonusStamps?: number;
  bonusPointMultiplier?: number;
  bonusStampMultiplier?: number;
  bonusGiftOfferId?: string | null;
  bonusGiftOfferQuantity?: number | null;
}

export type UpdateAutomaticRewardInput = Partial<CreateAutomaticRewardInput>;

// ── Gift Offers ──

export type GiftOfferStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface GiftOffer {
  id: string;
  name: string;
  description: string | null;
  status: GiftOfferStatus;
  points: number;
  stamps: number;
  isRedeemable: boolean;
  membershipTierId: string | null;
  quota: number | null;
  quotaPerMember: number | null;
  faceValue: number | null;
  faceValueType: "PERCENTAGE" | "AMOUNT" | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GiftOfferDetail extends GiftOffer {
  termsAndConditions: string | null;
  expiryPeriod: number | null;
  expiryPeriodUnit: string | null;
  startDate: string | null;
  endDate: string | null;
  couponCodePattern: string | null;
  syncExternal: boolean;
}

export interface CreateGiftOfferInput {
  name: string;
  description?: string;
  status?: GiftOfferStatus;
  points?: number;
  stamps?: number;
  isRedeemable?: boolean;
  membershipTierId?: string | null;
  termsAndConditions?: string;
  expiryPeriod?: number | null;
  expiryPeriodUnit?: string | null;
  quota?: number | null;
  quotaPerMember?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  faceValue?: number | null;
  faceValueType?: "PERCENTAGE" | "AMOUNT" | null;
}

export type UpdateGiftOfferInput = Partial<CreateGiftOfferInput>;

// ── Reward Redemptions ──

export type RewardRedemptionStatus = "VALID" | "USED" | "EXPIRED" | "VOIDED";

export interface RewardRedemption {
  id: string;
  accountId: string;
  accountName: string | null;
  giftOfferId: string;
  giftOfferName: string | null;
  status: RewardRedemptionStatus;
  couponCode: string | null;
  points: number | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateRewardRedemptionInput {
  accountId: string;
  giftOfferId: string;
  expiresAt?: string | null;
}

export interface IssueRewardsInput {
  giftOfferId: string;
  memberIds: string[];
  expiresAt?: string | null;
}

// ── Loyalty / Points Transactions ──

export interface LoyaltySummary {
  loyaltyPoints: number;
  lifetimePoints: number;
  stamps: number;
  credits: string;
  tier: {
    id: string;
    name: string;
    multiplier: number;
    discount: number;
  } | null;
  memberSince: string | null;
  expiresAt: string | null;
}

export interface RewardTransaction {
  id: string;
  transactionType: string;
  points: string;
  stamps: number;
  credit: string;
  pointBalance: string;
  stampBalance: number;
  creditBalance: string;
  reference: string | null;
  createdAt: string;
}

export interface ManualEarnInput {
  points?: number;
  stamps?: number;
  credit?: string;
  reference?: string;
  transactionType?: string;
}

export interface BlogCategoryAdmin {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPostAdmin {
  id: string;
  type: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  visibility: "public" | "private" | "members_only";
  featuredImage: string | null;
  authorId: string | null;
  parentId: string | null;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categories?: BlogCategoryAdmin[];
}

export interface BlogPostDetailAdmin extends BlogPostAdmin {
  blocks: string;
  seoTitle: string | null;
  seoDescription: string | null;
  meta: Record<string, unknown> | null;
}

export interface CreateBlogPostInput {
  type?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  blocks?: string; // JSON string of blocks, or HTML
  status: "draft" | "scheduled" | "published" | "archived";
  visibility?: "public" | "private" | "members_only";
  publishedAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];
  tagIds?: string[];
  parentId?: string | null;
}

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;
