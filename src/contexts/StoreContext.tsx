
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DigitalProduct, CreditPackage, PurchasedProduct, Purchase, StoreState } from '../models/types';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';

// Mock data for digital products
const MOCK_DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'prod-1',
    name: 'Premium Design Templates',
    description: 'Access to 500+ premium design templates for your projects',
    price: 50,
    category: 'Design',
    image: 'https://picsum.photos/seed/templates/300/200',
    expiryDays: 30,
    featured: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'prod-2',
    name: 'Stock Photo Collection',
    description: 'High-quality stock photos for commercial use',
    price: 75,
    category: 'Photography',
    image: 'https://picsum.photos/seed/photos/300/200',
    expiryDays: 45,
    createdAt: new Date('2023-02-10')
  },
  {
    id: 'prod-3',
    name: 'Icon Package Pro',
    description: '2000+ professional icons in various formats',
    price: 30,
    category: 'Design',
    image: 'https://picsum.photos/seed/icons/300/200',
    expiryDays: 60,
    createdAt: new Date('2023-03-05')
  },
  {
    id: 'prod-4',
    name: 'Business Proposal Templates',
    description: 'Professional templates for business proposals',
    price: 40,
    category: 'Business',
    image: 'https://picsum.photos/seed/business/300/200',
    expiryDays: 30,
    createdAt: new Date('2023-04-20')
  }
];

// Mock data for credit packages
const MOCK_CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credit-1',
    name: 'Starter Pack',
    description: '100 credits to get you started',
    credits: 100,
    price: 9.99,
  },
  {
    id: 'credit-2',
    name: 'Pro Pack',
    description: '500 credits for regular users',
    credits: 500,
    price: 39.99,
    featured: true
  },
  {
    id: 'credit-3',
    name: 'Ultimate Pack',
    description: '1200 credits with best value',
    credits: 1200,
    price: 79.99
  }
];

// Mock user purchased products
const MOCK_USER_PRODUCTS: PurchasedProduct[] = [
  {
    id: 'purchase-1',
    productId: 'prod-1',
    userId: 'user-1',
    purchaseDate: new Date('2023-05-10'),
    expiryDate: new Date('2023-06-10'),
    product: MOCK_DIGITAL_PRODUCTS[0],
    status: 'active'
  }
];

// Mock purchases
const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'purchase-1',
    userId: 'user-1',
    type: 'product',
    itemId: 'prod-1',
    amount: 50,
    status: 'pending',
    createdAt: new Date('2023-06-01')
  }
];

interface StoreContextType extends StoreState {
  purchaseProduct: (productId: string) => void;
  purchaseCredits: (packageId: string) => void;
  addProduct: (product: Omit<DigitalProduct, 'id' | 'createdAt'>) => void;
  updateProduct: (productId: string, product: Partial<DigitalProduct>) => void;
  deleteProduct: (productId: string) => void;
  addCreditPackage: (pkg: Omit<CreditPackage, 'id'>) => void;
  updateCreditPackage: (packageId: string, pkg: Partial<CreditPackage>) => void;
  deleteCreditPackage: (packageId: string) => void;
  approvePurchase: (purchaseId: string) => void;
  rejectPurchase: (purchaseId: string) => void;
  checkProductExpiry: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user, addCredits, deductCredits } = useAuth();
  const { addNotification } = useNotifications();
  
  const [state, setState] = useState<StoreState>({
    digitalProducts: MOCK_DIGITAL_PRODUCTS,
    creditPackages: MOCK_CREDIT_PACKAGES,
    purchases: MOCK_PURCHASES,
    userProducts: MOCK_USER_PRODUCTS,
    loading: false,
    error: null
  });

  // Check for product expiry when user changes
  useEffect(() => {
    if (user) {
      checkProductExpiry();
    }
  }, [user]);

  const purchaseProduct = (productId: string) => {
    if (!user) {
      toast.error('Please log in to make a purchase');
      return;
    }

    const product = state.digitalProducts.find(p => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      userId: user.id,
      type: 'product',
      itemId: productId,
      amount: product.price,
      status: 'pending',
      createdAt: new Date()
    };

    setState(prev => ({
      ...prev,
      purchases: [...prev.purchases, newPurchase]
    }));

    // Notify admin about the purchase
    addNotification({
      title: 'New Purchase Request',
      message: `User ${user.name} has requested to purchase ${product.name}`,
      type: 'purchase',
      actionRequired: true,
      purchaseId: newPurchase.id
    });

    toast.success('Purchase request submitted');
  };

  const purchaseCredits = (packageId: string) => {
    if (!user) {
      toast.error('Please log in to make a purchase');
      return;
    }

    const creditPackage = state.creditPackages.find(p => p.id === packageId);
    if (!creditPackage) {
      toast.error('Credit package not found');
      return;
    }

    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      userId: user.id,
      type: 'credit',
      itemId: packageId,
      amount: creditPackage.price,
      status: 'pending',
      createdAt: new Date()
    };

    setState(prev => ({
      ...prev,
      purchases: [...prev.purchases, newPurchase]
    }));

    // Notify admin about the purchase
    addNotification({
      title: 'New Credit Purchase Request',
      message: `User ${user.name} has requested to purchase ${creditPackage.name}`,
      type: 'purchase',
      actionRequired: true,
      purchaseId: newPurchase.id
    });

    toast.success('Credit purchase request submitted');
  };

  const addProduct = (product: Omit<DigitalProduct, 'id' | 'createdAt'>) => {
    const newProduct: DigitalProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date()
    };

    setState(prev => ({
      ...prev,
      digitalProducts: [...prev.digitalProducts, newProduct]
    }));

    toast.success('Product added successfully');
  };

  const updateProduct = (productId: string, product: Partial<DigitalProduct>) => {
    setState(prev => ({
      ...prev,
      digitalProducts: prev.digitalProducts.map(p => 
        p.id === productId ? { ...p, ...product } : p
      )
    }));

    toast.success('Product updated successfully');
  };

  const deleteProduct = (productId: string) => {
    setState(prev => ({
      ...prev,
      digitalProducts: prev.digitalProducts.filter(p => p.id !== productId)
    }));

    toast.success('Product deleted successfully');
  };

  const addCreditPackage = (pkg: Omit<CreditPackage, 'id'>) => {
    const newPackage: CreditPackage = {
      ...pkg,
      id: `credit-${Date.now()}`
    };

    setState(prev => ({
      ...prev,
      creditPackages: [...prev.creditPackages, newPackage]
    }));

    toast.success('Credit package added successfully');
  };

  const updateCreditPackage = (packageId: string, pkg: Partial<CreditPackage>) => {
    setState(prev => ({
      ...prev,
      creditPackages: prev.creditPackages.map(p => 
        p.id === packageId ? { ...p, ...pkg } : p
      )
    }));

    toast.success('Credit package updated successfully');
  };

  const deleteCreditPackage = (packageId: string) => {
    setState(prev => ({
      ...prev,
      creditPackages: prev.creditPackages.filter(p => p.id !== packageId)
    }));

    toast.success('Credit package deleted successfully');
  };

  const approvePurchase = (purchaseId: string) => {
    const purchase = state.purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    // Update purchase status
    setState(prev => ({
      ...prev,
      purchases: prev.purchases.map(p => 
        p.id === purchaseId ? { ...p, status: 'approved' } : p
      )
    }));

    // Handle based on purchase type
    if (purchase.type === 'credit') {
      const creditPackage = state.creditPackages.find(p => p.id === purchase.itemId);
      if (creditPackage) {
        addCredits(creditPackage.credits);
      }
    } else if (purchase.type === 'product') {
      const product = state.digitalProducts.find(p => p.id === purchase.itemId);
      if (product && deductCredits(product.price)) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + product.expiryDays);
        
        const newUserProduct: PurchasedProduct = {
          id: `user-prod-${Date.now()}`,
          productId: product.id,
          userId: purchase.userId,
          purchaseDate: new Date(),
          expiryDate,
          product,
          status: 'active'
        };
        
        setState(prev => ({
          ...prev,
          userProducts: [...prev.userProducts, newUserProduct]
        }));

        // Notify user about approved purchase
        addNotification({
          title: 'Purchase Approved',
          message: `Your purchase of ${product.name} has been approved`,
          type: 'system'
        });
      }
    }
  };

  const rejectPurchase = (purchaseId: string) => {
    const purchase = state.purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    // Update purchase status
    setState(prev => ({
      ...prev,
      purchases: prev.purchases.map(p => 
        p.id === purchaseId ? { ...p, status: 'rejected' } : p
      )
    }));

    // Notify user about rejected purchase
    const item = purchase.type === 'product' 
      ? state.digitalProducts.find(p => p.id === purchase.itemId)?.name 
      : state.creditPackages.find(p => p.id === purchase.itemId)?.name;
    
    addNotification({
      title: 'Purchase Rejected',
      message: `Your purchase of ${item || 'item'} has been rejected`,
      type: 'system'
    });
  };

  const checkProductExpiry = () => {
    const now = new Date();
    let expiredFound = false;
    
    // Check for expired products
    const updatedUserProducts = state.userProducts.map(up => {
      if (up.status === 'active' && up.expiryDate < now) {
        expiredFound = true;
        return { ...up, status: 'expired' };
      }
      return up;
    });
    
    if (expiredFound) {
      setState(prev => ({
        ...prev,
        userProducts: updatedUserProducts
      }));
      
      // Notify user about expired products
      addNotification({
        title: 'Products Expired',
        message: 'Some of your products have expired',
        type: 'expiry'
      });
    }
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      purchaseProduct,
      purchaseCredits,
      addProduct,
      updateProduct,
      deleteProduct,
      addCreditPackage,
      updateCreditPackage,
      deleteCreditPackage,
      approvePurchase,
      rejectPurchase,
      checkProductExpiry
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
