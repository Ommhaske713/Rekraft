export interface ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  pagination?: PaginationInfo;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string; 
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export enum MaterialCategory {
  LUMBER = 'LUMBER',
  BRICK = 'BRICK',
  CONCRETE = 'CONCRETE',
  METAL = 'METAL',
  GLASS = 'GLASS',
  TILES = 'TILES',
  DOORS = 'DOORS',
  WINDOWS = 'WINDOWS',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  FIXTURES = 'FIXTURES',
  PAINT = 'PAINT',
  TOOLS = 'TOOLS',
  OTHER = 'OTHER'
}

export enum MaterialCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  SALVAGE = 'SALVAGE'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED'
}

export interface Location {
  address?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Material {
  id: string;
  title: string;
  description: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  price: number;
  quantity: number;
  unit: string;
  location: Location;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  images: string[];
  sellerId: string;
  sellerInfo?: Pick<User, 'id' | 'username' | 'name' | 'avatar' | 'rating'>;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  featured?: boolean;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  materialId: string;
  materialTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  deliveryMethod: 'PICKUP' | 'SHIPPING';
  deliveryDetails?: {
    address?: Location;
    contactPerson: string;
    contactPhone: string;
    instructions?: string;
    estimatedDeliveryDate?: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface MaterialsResponseData {
  materials: Material[];
}

export interface MaterialDetailResponseData {
  material: Material;
  similarMaterials?: Material[];
}

export interface OrderResponseData {
  order: Order;
}

export interface SearchFilters {
  query?: string;
  categories?: MaterialCategory[];
  conditions?: MaterialCondition[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number;
  };
  sortBy?: 'price_asc' | 'price_desc' | 'date_newest' | 'date_oldest' | 'popularity';
}

export interface SearchResponseData {
  results: Material[];
  filters: SearchFilters;
}

export interface Review {
  id: string;
  userId: string;
  targetId: string; 
  targetType: 'MATERIAL' | 'SELLER';
  rating: number;
  comment: string;
  createdAt: string;
}
