
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { CreditCard, Clock, Package, User, History } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { Navigate } from "react-router-dom";

const Account = () => {
  const { user } = useAuth();
  const { userCredits, getUserTotalCredits, getCreditUsageHistory } = useStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Get user's active credits
  const activeCredits = userCredits.filter(credit => 
    credit.userId === user.id && credit.status === 'active'
  );

  const totalCredits = getUserTotalCredits();

  // Get credit usage history
  const creditUsageHistory = getCreditUsageHistory();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Account</h1>

        <Tabs defaultValue="profile" className="max-w-4xl">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="credits">Credit History</TabsTrigger>
            <TabsTrigger value="usage">Credit Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-brand-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your personal information and account details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Full Name
                    </h3>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Email Address
                    </h3>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Account Type
                    </h3>
                    <p className="capitalize">{user.role}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Member Since
                    </h3>
                    <p>{format(user.joinedAt, "MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Update Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-brand-100 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <CardTitle>Credit Balance</CardTitle>
                    <CardDescription>
                      Your current credit balance and transaction history
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-brand-50 border border-brand-100 p-6 rounded-md text-center">
                  <h3 className="text-xl font-medium mb-1">Current Balance</h3>
                  <p className="text-3xl font-bold text-brand-700">{totalCredits} Credits</p>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Your Credits</h3>
                  
                  {activeCredits.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded text-center">
                      <p className="text-gray-600">You don't have any active credits</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeCredits.map(credit => (
                        <div key={credit.id} className="bg-gray-50 border rounded-md p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{credit.amount} Credits</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Expires on {format(credit.expiryDate, "MMM d, yyyy")}</span>
                            </div>
                            <div className="text-xs text-amber-600 mt-1">
                              {formatDistance(credit.expiryDate, new Date(), { addSuffix: true })}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-center">
                  <Button variant="default" asChild>
                    <a href="/credits">Purchase More Credits</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-brand-100 p-3 rounded-full">
                    <History className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <CardTitle>Credit Usage</CardTitle>
                    <CardDescription>
                      Recent credit transactions and activities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {creditUsageHistory.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <p className="text-gray-600">No credit usage history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditUsageHistory.map((record, index) => (
                      <div key={index} className="bg-gray-50 border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{record.action}</p>
                            {record.productName && (
                              <p className="text-sm text-gray-600">{record.productName}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-semibold ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {record.amount > 0 ? '+' : ''}{record.amount} Credits
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(record.date, "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Account;
