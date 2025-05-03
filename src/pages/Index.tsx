
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { Package, CreditCard } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { digitalProducts, creditPackages } = useStore();

  // Get featured products and packages
  const featuredProducts = digitalProducts.filter(p => p.featured).slice(0, 3);
  const featuredPackages = creditPackages.filter(p => p.featured).slice(0, 1);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-900 to-brand-700 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Digital Content Marketplace
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Access premium digital products with flexible credit packages. Purchase once, use everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-white text-brand-800 hover:bg-gray-100">
                  Browse Products
                </Button>
              </Link>
              <Link to="/credits">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-brand-100 p-4 rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Buy Credits</h3>
              <p className="text-gray-600">
                Purchase credit packages that fit your needs. More credits means better value.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-brand-100 p-4 rounded-full mb-4">
                <Package className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select Products</h3>
              <p className="text-gray-600">
                Browse our digital marketplace and choose products that match your requirements.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-brand-100 p-4 rounded-full mb-4">
                <Package className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Access Content</h3>
              <p className="text-gray-600">
                Instantly access your purchased content for the duration of the license period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{product.price} Credits</span>
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Credit Package */}
      {featuredPackages.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Featured Credit Package</h2>
              <div className="bg-gradient-to-r from-brand-600 to-brand-400 rounded-lg p-1">
                <div className="bg-white rounded-md p-8">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{featuredPackages[0].name}</h3>
                      <p className="text-gray-600 mb-4">{featuredPackages[0].description}</p>
                      <div className="text-3xl font-bold text-brand-600">
                        {featuredPackages[0].credits} Credits
                      </div>
                      <div className="text-lg mt-1">${featuredPackages[0].price.toFixed(2)}</div>
                    </div>
                    <Link to="/credits" className="mt-4 md:mt-0">
                      <Button size="lg">Get Credits</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-brand-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join our platform today and get access to premium digital content with flexible options.
          </p>
          {!user ? (
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-800 hover:bg-gray-100">
                Create an Account
              </Button>
            </Link>
          ) : (
            <Link to="/products">
              <Button size="lg" className="bg-white text-brand-800 hover:bg-gray-100">
                Browse Products
              </Button>
            </Link>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
