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
  hero_headline: string;
  hero_subheading: string;
  hero_image_url: string;
  hero_cta_text: string;
  sale_banner_percent: string;
  sale_banner_text: string;
  newsletter_heading: string;
  footer_email: string;
  footer_phone: string;
  social_instagram: string;
  social_twitter: string;
  social_facebook: string;
  social_youtube: string;
  feature1_heading: string;
  feature1_text: string;
  feature1_image: string;
  feature2_heading: string;
  feature2_text: string;
  feature2_image: string;
  logo_text: string;
  [key: string]: string;
}

export interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
}
