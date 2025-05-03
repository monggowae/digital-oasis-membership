
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCredits from "@/components/admin/AdminCredits";
import AdminPurchases from "@/components/admin/AdminPurchases";
import AdminNotifications from "@/components/admin/AdminNotifications";

const Admin = () => {
  // Use hooks at the top level before any conditional returns
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("products");

  // Show a loading state while we check authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // Redirect if not authenticated or not an admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage products, credit packages, purchases and notifications</p>

        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="credits">
            <AdminCredits />
          </TabsContent>

          <TabsContent value="purchases">
            <AdminPurchases />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
