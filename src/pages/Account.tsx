
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Package, User } from "lucide-react";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

const Account = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Account</h1>

        <Tabs defaultValue="profile" className="max-w-4xl">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="credits">Credit History</TabsTrigger>
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
                  <p className="text-3xl font-bold text-brand-700">{user.credits} Credits</p>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                  
                  {/* This would be populated from real data in a full implementation */}
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <p className="text-gray-600">Transaction history will appear here</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <Button variant="default" asChild>
                    <a href="/credits">Purchase More Credits</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Account;
