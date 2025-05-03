
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { CreditCard, Clock, User, History, Phone, Lock } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const Account = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { userCredits, getUserTotalCredits, getCreditUsageHistory } = useStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Move the conditional return after all hook declarations
  // Create form schemas
  const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string().min(10, "Phone number must be valid").optional(),
  });

  const passwordSchema = z.object({
    currentPassword: z.string().min(4, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Create form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form submit handlers
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile(data);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      setIsChangingPassword(false);
      passwordForm.reset();
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  // Now check if user exists and redirect if not
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
                {!isEditingProfile ? (
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
                        Phone Number
                      </h3>
                      <p>{user.phoneNumber || "Not provided"}</p>
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
                ) : (
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+1234567890"
                        {...profileForm.register("phoneNumber")}
                      />
                      {profileForm.formState.errors.phoneNumber && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                )}

                {!isEditingProfile && !isChangingPassword && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                    <div className="space-x-4">
                      <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                        Change Password
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                        Update Profile
                      </Button>
                    </div>
                  </div>
                )}

                {isChangingPassword && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          {...passwordForm.register("currentPassword")}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          {...passwordForm.register("newPassword")}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...passwordForm.register("confirmPassword")}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsChangingPassword(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Update Password</Button>
                      </div>
                    </form>
                  </div>
                )}
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
