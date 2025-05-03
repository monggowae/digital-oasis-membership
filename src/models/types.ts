
export interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  expiryDays: number;
  featured?: boolean;
  createdAt: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  expiryDays: number; // Adding expiry days for credit packages
  featured?: boolean;
}

export interface PurchasedProduct {
  id: string;
  productId: string;
  userId: string;
  purchaseDate: Date;
  expiryDate: Date;
  product: DigitalProduct;
  status: 'active' | 'expired' | 'pending';
}

export interface UserCredit {
  id: string;
  userId: string;
  amount: number;
  purchaseDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired';
  packageId: string;
}

export interface Purchase {
  id: string;
  userId: string;
  type: 'product' | 'credit';
  itemId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface CreditUsageRecord {
  id: string;
  userId: string;
  action: string;
  amount: number;
  date: Date;
  productId?: string;
  productName?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'purchase' | 'system' | 'expiry';
  variables: string[];
}

export interface StoreState {
  digitalProducts: DigitalProduct[];
  creditPackages: CreditPackage[];
  purchases: Purchase[];
  userProducts: PurchasedProduct[];
  userCredits: UserCredit[];
  loading: boolean;
  error: string | null;
}
