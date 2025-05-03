
import { useState } from "react";
import { format } from "date-fns";
import { useStore } from "@/contexts/StoreContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Purchase } from "@/models/types";
import { CheckCircle, XCircle } from "lucide-react";

const AdminPurchases = () => {
  const { purchases, creditPackages, approvePurchase, rejectPurchase } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Filter to only show credit purchases (no digital product purchases)
  const creditPurchases = purchases.filter(purchase => purchase.type === 'credit');

  const getPackageName = (purchase: Purchase) => {
    return creditPackages.find(p => p.id === purchase.itemId)?.name || 'Unknown Package';
  };

  const filteredPurchases = filter === 'all' 
    ? creditPurchases 
    : creditPurchases.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Credit Purchase Requests</h2>
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'pending' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={filter === 'approved' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
          <Button 
            variant={filter === 'rejected' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      {filteredPurchases.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No credit purchases found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <Card key={purchase.id} className={
              purchase.status === 'pending' 
                ? 'border-amber-300' 
                : purchase.status === 'approved'
                ? 'border-green-300'
                : 'border-red-300'
            }>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Credit Package Purchase
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {getPackageName(purchase)}
                    </div>
                  </div>
                  <Badge
                    className={
                      purchase.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        : purchase.status === 'approved'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                  >
                    {purchase.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Purchase ID:</span> {purchase.id}
                  </div>
                  <div>
                    <span className="text-muted-foreground">User ID:</span> {purchase.userId}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span> ${purchase.amount}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    {format(purchase.createdAt, 'MMM d, yyyy h:mm a')}
                  </div>
                </div>

                {purchase.status === 'pending' && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                      size="sm"
                      onClick={() => approvePurchase(purchase.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      size="sm"
                      onClick={() => rejectPurchase(purchase.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPurchases;
