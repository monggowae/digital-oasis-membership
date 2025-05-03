
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/contexts/StoreContext";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Products = () => {
  const { digitalProducts, purchaseProduct } = useStore();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(
    new Set(digitalProducts.map((product) => product.category))
  );

  // Filter products based on search term and category
  const filteredProducts = digitalProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (productId: string) => {
    if (!user) {
      toast.error("Please log in to make purchases");
      return;
    }
    purchaseProduct(productId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Digital Products</h1>
            <p className="text-gray-600">Browse our collection of premium digital content</p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-60"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
                  <div className="mb-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="text-xs bg-brand-100 text-brand-800 px-2 py-1 rounded ml-2">
                      {product.expiryDays} days access
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{product.price} Credits</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePurchase(product.id)}
                      >
                        Purchase
                      </Button>
                      <Link to={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
