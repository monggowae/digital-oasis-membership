import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DigitalProduct, CreditPackage, PurchasedProduct, Purchase, StoreState, UserCredit } from '../models/types';
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
    expiryDays: 30
  },
  {
    id: 'credit-2',
    name: 'Pro Pack',
    description: '500 credits for regular users',
    credits: 500,
    price: 39.99,
    featured: true,
    expiryDays: 60
  },
  {
    id: 'credit-3',
    name: 'Ultimate Pack',
    description: '1200 credits with best value',
    credits: 1200,
    price: 79.99,
    expiryDays: 90
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

// Mock user credits
const MOCK_USER_CREDITS: UserCredit[] = [
  {
    id: 'usercredit-1',
    userId: 'user-1',
    amount: 300,
    purchaseDate: new Date('2023-05-05'),
    expiryDate: new Date('2023-08-05'),
    status: 'active',
    packageId: 'credit-2'
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
  checkCreditExpiry: () => void;
  getUserTotalCredits: () => number;
  getCreditUsageHistory: () => { action: string; amount: number; date: Date; productName?: string }[];
  renewProductAccess: (productId: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [state, setState] = useState<StoreState>({
    digitalProducts: MOCK_DIGITAL_PRODUCTS,
    creditPackages: MOCK_CREDIT_PACKAGES,
    purchases: MOCK_PURCHASES,
    userProducts: MOCK_USER_PRODUCTS,
    userCredits: MOCK_USER_CREDITS,
    loading: false,
    error: null
  });

  // Credit usage history to track all credit transactions
  const [creditUsageHistory, setCreditUsageHistory] = useState<
    { action: string; amount: number; date: Date; productName?: string }[]
  >([
    { action: 'Purchase', amount: -50, date: new Date('2023-05-15'), productName: 'Premium Design Templates' },
    { action: 'Credit Purchase', amount: 300, date: new Date('2023-05-05') },
  ]);

  // Check for product and credit expiry when user changes
  useEffect(() => {
    if (user) {
      checkProductExpiry();
      checkCreditExpiry();
    }
  }, [user]);

  const getUserTotalCredits = (): number => {
    if (!user) return 0;
    
    // Sum up all active user credits
    return state.userCredits
      .filter(credit => credit.userId === user.id && credit.status === 'active')
      .reduce((total, credit) => total + credit.amount, 0);
  };

  // Get the most recent credit usage history (limited to latest 6)
  const getCreditUsageHistory = () => {
    return creditUsageHistory
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  };

  const addCreditUsageRecord = (action: string, amount: number, productName?: string) => {
    setCreditUsageHistory(prev => [
      ...prev,
      { action, amount, date: new Date(), productName }
    ]);
  };

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

    // Check if user has enough credits
    const userCredits = getUserTotalCredits();
    if (userCredits < product.price) {
      toast.error('You don\'t have enough credits to purchase this product');
      return;
    }

    // Directly deduct credits from user (from oldest to newest)
    let remainingCost = product.price;
    const updatedUserCredits = [...state.userCredits]
      .filter(uc => uc.userId === user.id && uc.status === 'active')
      .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime())
      .map(credit => {
        if (remainingCost <= 0) return credit;
        
        if (credit.amount <= remainingCost) {
          remainingCost -= credit.amount;
          return { ...credit, amount: 0, status: 'expired' as const };
        } else {
          const newAmount = credit.amount - remainingCost;
          remainingCost = 0;
          return { ...credit, amount: newAmount };
        }
      });
    
    // Update user credits
    setState(prev => ({
      ...prev,
      userCredits: prev.userCredits.map(uc => {
        const updated = updatedUserCredits.find(updated => updated.id === uc.id);
        return updated || uc;
      })
    }));
    
    // Create purchased product
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + product.expiryDays);
    
    const newUserProduct: PurchasedProduct = {
      id: `user-prod-${Date.now()}`,
      productId: product.id,
      userId: user.id,
      purchaseDate: new Date(),
      expiryDate,
      product,
      status: 'active'
    };
    
    setState(prev => ({
      ...prev,
      userProducts: [...prev.userProducts, newUserProduct]
    }));

    // Add to credit usage history
    addCreditUsageRecord('Purchase', -product.price, product.name);

    // Notify user about successful purchase
    toast.success(`Successfully purchased ${product.name}`);
    addNotification({
      title: 'Product Purchased',
      message: `You have successfully purchased ${product.name} for ${product.price} credits. Your access will expire on ${expiryDate.toLocaleDateString()}.`,
      type: 'system'
    });
  };

  const renewProductAccess = (productId: string) => {
    if (!user) {
      toast.error('Please log in to renew your access');
      return;
    }

    const userProduct = state.userProducts.find(
      up => up.productId === productId && up.userId === user.id
    );

    if (!userProduct) {
      toast.error('Product not found in your purchases');
      return;
    }

    const product = state.digitalProducts.find(p => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    // Check if user has enough credits
    const userCredits = getUserTotalCredits();
    if (userCredits < product.price) {
      toast.error('You don\'t have enough credits to renew this product');
      return;
    }

    // Deduct credits from user (from oldest to newest)
    let remainingCost = product.price;
    const updatedUserCredits = [...state.userCredits]
      .filter(uc => uc.userId === user.id && uc.status === 'active')
      .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime())
      .map(credit => {
        if (remainingCost <= 0) return credit;
        
        if (credit.amount <= remainingCost) {
          remainingCost -= credit.amount;
          return { ...credit, amount: 0, status: 'expired' as const };
        } else {
          const newAmount = credit.amount - remainingCost;
          remainingCost = 0;
          return { ...credit, amount: newAmount };
        }
      });
    
    // Update user credits
    setState(prev => ({
      ...prev,
      userCredits: prev.userCredits.map(uc => {
        const updated = updatedUserCredits.find(updated => updated.id === uc.id);
        return updated || uc;
      })
    }));

    // Create new expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + product.expiryDays);

    // Update the product status and expiry
    setState(prev => ({
      ...prev,
      userProducts: prev.userProducts.map(up => 
        up.id === userProduct.id 
        ? { ...up, status: 'active', expiryDate }
        : up
      )
    }));

    // Add to credit usage history
    addCreditUsageRecord('Renewal', -product.price, product.name);

    // Notify user about successful renewal
    toast.success(`Successfully renewed access to ${product.name}`);
    addNotification({
      title: 'Product Access Renewed',
      message: `You have renewed access to ${product.name} for ${product.price} credits. Your access will now expire on ${expiryDate.toLocaleDateString()}.`,
      type: 'system'
    });
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

    // For credit purchases only (product purchases are now handled directly)
    if (purchase.type === 'credit') {
      const creditPackage = state.creditPackages.find(p => p.id === purchase.itemId);
      if (creditPackage) {
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + creditPackage.expiryDays);
        
        // Add credits to user
        const newUserCredit: UserCredit = {
          id: `usercredit-${Date.now()}`,
          userId: purchase.userId,
          amount: creditPackage.credits,
          purchaseDate: new Date(),
          expiryDate: expiryDate,
          status: 'active',
          packageId: creditPackage.id
        };
        
        setState(prev => ({
          ...prev,
          userCredits: [...prev.userCredits, newUserCredit]
        }));

        // Add to credit usage history
        addCreditUsageRecord('Credit Purchase', creditPackage.credits);

        // Notify user about approved purchase
        addNotification({
          title: 'Credit Purchase Approved',
          message: `Your purchase of ${creditPackage.name} has been approved. ${creditPackage.credits} credits have been added to your account.`,
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
    if (!user) return;
    
    const now = new Date();
    let expiredFound = false;
    let autoRenewed = false;
    
    // Check for expired products
    const updatedUserProducts = state.userProducts
      .filter(up => up.userId === user.id)
      .map(up => {
        if (up.status === 'active' && up.expiryDate < now) {
          expiredFound = true;
          
          // Try to auto-renew using available credits
          const product = state.digitalProducts.find(p => p.id === up.productId);
          if (product) {
            const userCredits = getUserTotalCredits();
            
            if (userCredits >= product.price) {
              // Enough credits, auto-renew
              const newExpiryDate = new Date();
              newExpiryDate.setDate(newExpiryDate.getDate() + product.expiryDays);
              
              // Process the credit deduction separately
              let remainingCost = product.price;
              const userActiveCredits = state.userCredits
                .filter(uc => uc.userId === user.id && uc.status === 'active')
                .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
              
              const updatedCredits = userActiveCredits.map(credit => {
                if (remainingCost <= 0) return credit;
                
                if (credit.amount <= remainingCost) {
                  remainingCost -= credit.amount;
                  return { ...credit, amount: 0, status: 'expired' as const };
                } else {
                  const newAmount = credit.amount - remainingCost;
                  remainingCost = 0;
                  return { ...credit, amount: newAmount };
                }
              });
              
              // Update credits
              setState(prev => ({
                ...prev,
                userCredits: prev.userCredits.map(uc => {
                  const updated = updatedCredits.find(u => u.id === uc.id);
                  return updated || uc;
                })
              }));
              
              // Add to credit usage history
              addCreditUsageRecord('Auto-Renewal', -product.price, product.name);
              
              autoRenewed = true;
              
              // Notify about the auto-renewal
              addNotification({
                title: 'Product Auto-Renewed',
                message: `Your access to ${product.name} has been automatically renewed for ${product.price} credits.`,
                type: 'system'
              });
              
              return { ...up, expiryDate: newExpiryDate }; // Return renewed product
            }
          }
          
          // Not enough credits or product not found
          return { ...up, status: 'expired' as const };
        }
        return up;
      });
    
    if (expiredFound) {
      setState(prev => ({
        ...prev,
        userProducts: prev.userProducts.map(up => {
          const updated = updatedUserProducts.find(u => u.id === up.id);
          return updated || up;
        })
      }));
      
      // Only notify if not auto-renewed
      if (!autoRenewed) {
        // Notify user about expired products
        addNotification({
          title: 'Products Expired',
          message: 'Some of your products have expired. You can renew them by purchasing again.',
          type: 'expiry'
        });
      }
    }
  };

  const checkCreditExpiry = () => {
    if (!user) return;
    
    const now = new Date();
    let expiredFound = false;
    
    // Check for expired credits
    const updatedUserCredits = state.userCredits
      .filter(uc => uc.userId === user.id)
      .map(uc => {
        if (uc.status === 'active' && uc.expiryDate < now) {
          expiredFound = true;
          
          // Add to credit usage history
          addCreditUsageRecord('Credits Expired', -uc.amount);
          
          return { ...uc, status: 'expired' as const };
        }
        return uc;
      });
      
    if (expiredFound) {
      setState(prev => ({
        ...prev,
        userCredits: prev.userCredits.map(uc => {
          const updated = updatedUserCredits.find(u => u.id === uc.id);
          return updated || uc;
        })
      }));
      
      // Notify user about expired credits
      addNotification({
        title: 'Credits Expired',
        message: 'Some of your credits have expired',
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
      checkProductExpiry,
      checkCreditExpiry,
      getUserTotalCredits,
      getCreditUsageHistory,
      renewProductAccess
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
