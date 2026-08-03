export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  is_featured: boolean;
  is_trending: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface SiteSettings {
  logo_text: string;
  top_announcement_enabled?: string;
  top_announcement_text?: string;
  hero_headline: string;
  hero_subheading: string;
  hero_image_url: string;
  hero_cta_text: string;
  marquee_enabled?: string;
  marquee_text?: string;
  sale_banner_enabled?: string;
  sale_banner_heading?: string;
  sale_banner_percent: string;
  sale_banner_text: string;
  sale_banner_cta?: string;
  feature1_enabled?: string;
  feature1_heading: string;
  feature1_text: string;
  feature1_image: string;
  feature2_enabled?: string;
  feature2_heading: string;
  feature2_text: string;
  feature2_image: string;
  newsletter_heading: string;
  footer_email: string;
  footer_phone: string;
  social_instagram: string;
  social_twitter: string;
  social_facebook: string;
  social_youtube: string;
  offer_popup_enabled?: string;
  offer_popup_title?: string;
  offer_popup_text?: string;
  offer_popup_code?: string;
  [key: string]: string;
}

export interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role?: string;
  review: string;
  rating: number;
  avatar_url?: string;
  is_visible: boolean;
  created_at?: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  sender_type: 'customer' | 'admin';
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  last_message: string;
  last_time: string;
  unread_count: number;
  customer_name: string;
}

export interface AdminUser {
  id: number;
  email: string;
}
