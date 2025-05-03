
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Check } from "lucide-react";
import { toast } from "sonner";

const Credits = () => {
  const { creditPackages, purchaseCredits } = useStore();
  const { user, profile } = useAuth();

  const handlePurchase = (packageId: string) => {
    if (!user) {
      toast.error("Please log in to make purchases");
      return;
    }
    purchaseCredits(packageId);
  };

  const getBestValuePackage = () => {
    if (creditPackages.length === 0) return null;
    
    return creditPackages.reduce((best, current) => {
      const bestValue = best.credits / best.price;
      const currentValue = current.credits / current.price;
      return currentValue > bestValue ? current : best;
    });
  };

  const bestValue = getBestValuePackage();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-4">Credit Packages</h1>
          <p className="text-gray-600">
            Purchase credits to unlock premium digital content. The more credits you buy, the better the value.
          </p>
          {profile && (
            <div className="mt-4 inline-block bg-brand-50 border border-brand-200 px-4 py-2 rounded-md">
              <span className="font-medium">Your Balance: </span>
              <span className="font-bold text-brand-700">{profile.credits} Credits</span>
            </div>
          )}
        </div>

        {/* Credit Packages */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`overflow-hidden ${pkg.featured ? 'border-brand-400 shadow-lg' : ''}`}
              >
                {pkg.featured && (
                  <div className="bg-brand-600 text-white py-2 text-center text-sm font-medium">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="bg-brand-50 border-b border-brand-100">
                  <h3 className="text-2xl font-bold text-center">{pkg.name}</h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-brand-600">
                      {pkg.credits}
                    </div>
                    <div className="text-gray-500 text-sm">Credits</div>
                    <div className="text-2xl font-bold mt-4">
                      ${pkg.price.toFixed(2)}
                    </div>
                    {bestValue?.id === pkg.id && (
                      <div className="text-xs text-brand-600 font-medium mt-1 flex items-center justify-center">
                        <Check className="h-3 w-3 mr-1" /> Best value
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 text-center">
                    {pkg.description}
                  </p>
                  
                  <Button 
                    className="w-full"
                    variant={pkg.featured ? "default" : "outline"}
                    onClick={() => handlePurchase(pkg.id)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">How do credits work?</h3>
              <p className="text-gray-600">
                Credits are our virtual currency that you can use to purchase digital products on our platform. 
                Once purchased, credits are added to your account balance.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Do credits expire?</h3>
              <p className="text-gray-600">
                No, your credits do not expire and will remain in your account until you use them.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Can I get a refund for unused credits?</h3>
              <p className="text-gray-600">
                We do not provide refunds for purchased credits. However, credits stay in your account indefinitely.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">How long do I have access to purchased products?</h3>
              <p className="text-gray-600">
                Each product has its own access period, which is clearly displayed on the product page before purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Credits;
