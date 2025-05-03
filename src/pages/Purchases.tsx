
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

const Purchases = () => {
  const { user } = useAuth();
  const { userProducts, purchases, userCredits, getUserTotalCredits } = useStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Calculate total active credits
  const totalCredits = getUserTotalCredits();

  // Filter purchases for current user
  const userPurchases = purchases.filter((purchase) => purchase.userId === user.id);
  
  // Get active credits for the user
  const activeCredits = userCredits.filter(
    (credit) => credit.userId === user.id && credit.status === 'active'
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>

        {/* Credit Summary */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Credits</h2>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h3 className="text-lg font-medium text-gray-700">Total Credits Available</h3>
                  <p className="text-3xl font-bold text-brand-600">{totalCredits}</p>
                </div>
                <Button asChild>
                  <Link to="/credits">Purchase More Credits</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {activeCredits.length > 0 && (
            <div className="bg-gray-50 border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeCredits.map((credit) => (
                    <tr key={credit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {credit.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(credit.purchaseDate, "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(credit.expiryDate, "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Active Products</h2>

          {userProducts.filter((up) => up.status === 'active').length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <p className="text-gray-600 mb-4">You don't have any active products yet.</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts
                .filter((up) => up.status === 'active')
                .map((userProduct) => (
                  <Card key={userProduct.id} className="overflow-hidden">
                    <img
                      src={userProduct.product.image}
                      alt={userProduct.product.name}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">
                          {userProduct.product.name}
                        </h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {userProduct.product.description}
                      </p>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          <span>Purchased: {format(userProduct.purchaseDate, "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-amber-600" />
                          <span>Expires: {format(userProduct.expiryDate, "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Access Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Expired Products */}
        {userProducts.filter((up) => up.status === 'expired').length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Expired Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts
                .filter((up) => up.status === 'expired')
                .map((userProduct) => (
                  <Card key={userProduct.id} className="overflow-hidden border-gray-200 opacity-80">
                    <img
                      src={userProduct.product.image}
                      alt={userProduct.product.name}
                      className="w-full h-40 object-cover filter grayscale"
                    />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-700">
                          {userProduct.product.name}
                        </h3>
                        <Badge variant="outline" className="text-gray-500 border-gray-300">
                          Expired
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {userProduct.product.description}
                      </p>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Purchased: {format(userProduct.purchaseDate, "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Expired: {format(userProduct.expiryDate, "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Renew Access
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Pending Purchases */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Pending Purchases</h2>

          {userPurchases.filter((p) => p.status === 'pending').length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-600">You don't have any pending purchases.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userPurchases
                    .filter((purchase) => purchase.status === 'pending')
                    .map((purchase) => {
                      // Get item details based on type
                      const item = purchase.type === 'product'
                        ? userProducts.find((p) => p.productId === purchase.itemId)?.product
                        : null;

                      return (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                            {purchase.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item?.name || 'Credit Package'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {purchase.amount} {purchase.type === 'credit' ? 'USD' : 'Credits'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {format(purchase.createdAt, "MMM d, yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                              Pending
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Purchases;
