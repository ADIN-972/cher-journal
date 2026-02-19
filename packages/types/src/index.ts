// Generated Prisma types
export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export enum ChapterStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  PUBLISHED = "PUBLISHED",
}

export enum ChapterGenre {
  PASSIONS_CHARNELLES = "PASSIONS_CHARNELLES",
  ROMANCES_TENDRES = "ROMANCES_TENDRES",
  MYSTERIES_SENSUELS = "MYSTERIES_SENSUELS",
  INTERDITS = "INTERDITS",
  CONQUETES = "CONQUETES",
  REVES_SECRETS = "REVES_SECRETS",
  PASSION_BRUTALE = "PASSION_BRUTALE",
  AMOUR_COMPLIQUE = "AMOUR_COMPLIQUE",
  DESIR_NOCTURNE = "DESIR_NOCTURNE",
  LIBERATION = "LIBERATION",
  DECOUVERTE_DE_SOI = "DECOUVERTE_DE_SOI",
  INTIMITE_PSYCHOLOGIQUE = "INTIMITE_PSYCHOLOGIQUE",
  EVEIL_DU_DESIR = "EVEIL_DU_DESIR",
  RELATIONS_TRANSFORMATRICES = "RELATIONS_TRANSFORMATRICES",
  MEMOIRE_DU_CORPS = "MEMOIRE_DU_CORPS",
}

export enum Perspective {
  NARRATOR = "NARRATOR",
  PROTAGONIST = "PROTAGONIST",
}

export enum OrderType {
  CHAPTER = "CHAPTER",
  PREORDER = "PREORDER",
  BUNDLE = "BUNDLE",
  COLORING = "COLORING",
  VERSION_PACK = "VERSION_PACK",
}

export enum OrderStatus {
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  PENDING = "PENDING",
}

export enum EntitlementVersionScope {
  BASE = "BASE",
  ALL = "ALL",
}

export enum EntitlementSource {
  PURCHASE = "PURCHASE",
  PREORDER = "PREORDER",
  PACK = "PACK",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export enum UnlockTriggeredBy {
  WAIT = "WAIT",
  PURCHASE = "PURCHASE",
}

export enum PriceScope {
  VOLUME = "VOLUME",
  CHAPTER = "CHAPTER",
  EPILOGUE = "EPILOGUE",
  POV = "POV",
  COLORING = "COLORING",
  BUNDLE = "BUNDLE",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export enum PromotionType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
  FREE = "FREE",
}

export enum AssetKind {
  IMAGE = "IMAGE",
  COLORING_PAGE = "COLORING_PAGE",
}

// API Types
export interface User {
  id: string;
  publicId: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  protagonistName: string;
  status: ChapterStatus;
  description?: string | null;
  publishedAt?: Date | null;
  coverAssetId: string | null;
  coverAsset?: ChapterAsset | null;
  isArchived: boolean;
  createdAt: Date;
  volumes?: Volume[];
  genres?: ChapterGenreTag[];
  stats?: ChapterStats;
  pricing?: {
    priceFreeToRead: number;
    pricePaywall: number;
    priceEpilogue: number;
    priceProtagonistUnlock?: number;
    totalVolumes?: number;
    bundleOriginalPrice?: number;
    bundleDiscountedPrice?: number;
    nextVolumePrice?: number | null;
  };
  totalCharacterCount?: number;
  hasStartedReading?: boolean; // True if user has started reading any volume (progress > 0)
  hasAccess?: boolean; // True if user has entitlement to this chapter
  isFavorite?: boolean; // True if this chapter is marked as "Sélection du moment"
  versionScope?: EntitlementVersionScope | null; // Version scope of user's entitlement
  accroche_classic?: string | null;
  accroche_dark?: string | null;
  accroche_love?: string | null;
  accroche_marketing?: string | null;
  accroche_dark_collection?: string | null;
  niveau_intensite?: number;
  niveau_douceur?: number;
  niveau_danger?: number;
  niveau_transformation?: number;
  _count?: {
    volumes?: number;
  };
}

export interface ChapterStats {
  totalVolumes: number;
  volumesWithText: number;
  volumesWithIllustration: number;
  volumesWithProtagonist: number;
  coloringPagesCount: number;
}

export interface ChapterGenreTag {
  id: string;
  chapterId: string;
  genre: ChapterGenre;
  createdAt: Date;
}

export interface Volume {
  id: string;
  chapterId: string;
  volumeNumber: number;
  title: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PUBLISHED';
  waitDuration: number;
  isFinalPaywall: boolean;
  isFree: boolean;
  publishedAt?: Date | null;
  scheduledFor?: Date | null;
  illustrationAssetId: string | null;
  illustrationAsset?: ChapterAsset | null;
  versions?: VolumeVersion[];
  createdAt: Date;
}

export interface VolumeVersion {
  id: string;
  volumeId: string;
  perspective: Perspective;
  illustrationAssetId: string | null;
  textBlobId?: string | null; // Optional - only present in some admin endpoints
  hasText?: boolean; // Indicates if text exists without exposing the blob ID
  text?: string | null;
  isAutoText?: boolean; // Indicates if the text is auto-generated (lorem ipsum)
  createdAt?: Date;
  characterCount?: number;
}

export interface ChapterAsset {
  id: string;
  chapterId: string;
  kind: AssetKind;
  label: string | null;
  objectKey: string;
  thumbnailObjectKey?: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  sha256: string | null;
  version: number;
  originalAssetId: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: AssetTagging[];
  originalAsset?: ChapterAsset | null;
  versions?: ChapterAsset[];
}

export interface AssetTag {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  assets?: AssetTagging[];
  _count?: {
    assets: number;
  };
}

export interface AssetTagging {
  id: string;
  assetId: string;
  tagId: string;
  createdAt: Date;
  asset?: ChapterAsset;
  tag?: AssetTag;
}

export interface DuplicateGroup {
  sha256: string;
  count: number;
  assets: ChapterAsset[];
}

// Asset Tags DTOs
export interface CreateTagDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface TagAssetDto {
  tagId: string;
}

export interface BulkTagDto {
  assetIds: string[];
  tagIds: string[];
}

export interface AssetFilters {
  kind?: AssetKind;
  search?: string;
  tagIds?: string[];
  showDuplicates?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  status: OrderStatus;
  provider: string | null;
  providerSessionId: string | null;
  providerPaymentIntentId: string | null;
  currency: string | null;
  amountTotal: number | null;
  createdAt: Date;
}

export interface Entitlement {
  id: string;
  userId: string;
  chapterId: string;
  volumeFrom: number;
  volumeTo: number;
  versionScope: EntitlementVersionScope;
  source: EntitlementSource;
  grantedAt: Date;
}

export interface Unlock {
  id: string;
  userId: string;
  chapterId: string;
  volumeNumber: number;
  unlocksAt: Date;
  triggeredBy: UnlockTriggeredBy;
}

export interface VolumeRead {
  id: string;
  userId: string;
  chapterId: string;
  volumeNumber: number;
  perspective: Perspective;
  progress?: number;
  firstOpenedAt: Date;
  completedAt: Date | null;
  canStartWaitFrom?: Date | null;
}

// Auth DTOs
export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  sessionToken?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pricing & Promotions
export interface Price {
  id: string;
  scope: PriceScope;
  refId?: string | null;
  amountCents: number;
  currency: string;
  createdAt: Date;
  promotions?: Promotion[];
}

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  scope: PriceScope;
  refId?: string | null;
  type: PromotionType;
  value?: number | null;
  startsAt: Date;
  endsAt: Date;
  maxUses?: number | null;
  perUserLimit?: number | null;
  isActive: boolean;
  targetType?: string;
  targetUserIds?: string[];
  targetCriteria?: Record<string, any>;
  targetedUsersCount?: number;
  priceId?: string | null;
  price?: Price | null;
  _count?: {
    applied?: number;
    orders?: number;
  };
}

export interface AppliedPromotion {
  id: string;
  promotionId: string;
  userId: string;
  appliedAt: Date;
  promotion?: Promotion;
}

export interface PromotionCreateDto {
  name: string;
  description?: string;
  code?: string;
  scope: PriceScope;
  refId?: string;
  type: PromotionType;
  value?: number | null;
  startsAt: Date;
  endsAt: Date;
  maxUses?: number;
  perUserLimit?: number;
  isActive?: boolean;
  targetType?: string;
  targetUserIds?: string[];
  targetCriteria?: Record<string, any>;
  priceId?: string;
}

export interface PromotionUpdateDto {
  name?: string;
  description?: string;
  code?: string;
  type?: PromotionType;
  value?: number | null;
  startsAt?: Date;
  endsAt?: Date;
  maxUses?: number;
  perUserLimit?: number;
  isActive?: boolean;
  targetType?: string;
  targetUserIds?: string[];
  targetCriteria?: Record<string, any>;
}

export interface ApplicablePromotion {
  id: string;
  name: string;
  description: string | null;
  scope: PriceScope;
  type: PromotionType;
  value: number | null;
  startsAt: Date;
  endsAt: Date;
  code: string | null;
  content: {
    chapterId: string;
    chapterTitle: string;
    chapterCoverUrl: string | null;
    volumeNumber?: number;
    volumeTitle?: string;
  } | null;
  remainingUses: number | null;
  userRemainingUses: number | null;
}

// Wait-until-free
export interface WaitStatus {
  isActive: boolean;
  unlocksAt?: Date;
  remainingMs?: number;
}

export interface LibraryItem {
  chapter: Chapter;
  availableVolumes: number[];
  currentVolume?: number;
  waitStatus?: WaitStatus;
}

// V2 Pricing Architecture
export interface PriceSchema {
  id: string;
  name: string;
  description?: string | null;
  priceFreeToRead: number;
  pricePaywall: number;
  priceEpilogue: number;
  isActive: boolean;
  appliedFrom: Date;
  appliedTo?: Date | null;
  createdBy: string;
  createdAt: Date;
  chapterOverrides?: ChapterPriceOverride[];
}

export interface ChapterPriceOverride {
  id: string;
  chapterId: string;
  schemaId: string;
  priceFreeToRead?: number | null;
  pricePaywall?: number | null;
  priceEpilogue?: number | null;
  reason?: string | null;
  isActive: boolean;
  createdAt: Date;
  chapter?: Chapter;
  schema?: PriceSchema;
}

export enum PriceHistoryEntityType {
  SCHEMA = "SCHEMA",
  OVERRIDE = "OVERRIDE",
}

export interface PriceHistory {
  id: string;
  entityType: PriceHistoryEntityType;
  entityId: string;
  previousValues?: any;
  newValues?: any;
  changeReason?: string | null;
  changedBy: string;
  changedAt: Date;
}
