export interface User {
  id: string;
  username: string;
  deviceId: string;
  createdAt: string;
  permissions: UserPermissions;
}

export interface UserPermissions {
  canLogin: boolean;
  canView: boolean;
  canUploadMedia: boolean;
  canDeleteOwnMedia: boolean;
  canSendMessage: boolean;
  canDeleteOwnMessage: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  uploaderId: string;
  uploaderName: string;
  caption: string;
  createdAt: string;
  pageId: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  pageId: string;
}

export interface MediaPage {
  id: string;
  name: string;
  purchaserName: string;
  purchaserEmail: string;
  remainingDays: number;
  purchaseHistory: PurchaseRecord[];
  discountRecords: DiscountRecord[];
  purchaserGender: 'male' | 'female' | 'other';
  usageScenario: string;
  uniqueLink: string;
  qrCode: string;
  internalCode: string;
  productDetails: ProductDetails;
  dbSizeLimit: number; // in MB
  dbUsage: number; // in MB
  usageDuration: number; // in days
  createdAt: string;
  isActive: boolean;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  amount: number;
  duration: number; // days
  description: string;
}

export interface DiscountRecord {
  id: string;
  date: string;
  type: string;
  value: number;
  description: string;
}

export interface ProductDetails {
  name: string;
  link: string;
  images: string[];
  description: string;
}

export interface Admin {
  id: string;
  username: string;
  level: 1 | 2 | 3; // 1=Super Admin, 2=Level 2, 3=Level 3
  createdBy: string;
  createdAt: string;
  permissions: AdminPermissions;
}

export interface AdminPermissions {
  canCreateAdmins: boolean;
  canManagePages: boolean;
  canManageUsers: boolean;
  canManageMedia: boolean;
  canViewAnalytics: boolean;
}

export interface AppState {
  currentUser: User | null;
  currentAdmin: Admin | null;
  currentPageId: string | null;
  mediaItems: MediaItem[];
  chatMessages: ChatMessage[];
  mediaPages: MediaPage[];
  admins: Admin[];
}