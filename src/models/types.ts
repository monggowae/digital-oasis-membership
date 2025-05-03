
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

export interface Purchase {
  id: string;
  userId: string;
  type: 'product' | 'credit';
  itemId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface StoreState {
  digitalProducts: DigitalProduct[];
  creditPackages: CreditPackage[];
  purchases: Purchase[];
  userProducts: PurchasedProduct[];
  loading: boolean;
  error: string | null;
}
