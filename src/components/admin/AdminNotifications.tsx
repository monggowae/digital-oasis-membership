
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type NotificationTemplate = {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'purchase' | 'system' | 'expiry';
};

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Product Purchase',
    title: 'Product Purchase Confirmation',
    message: 'Thank you for purchasing {product_name}. Your access will expire on {expiry_date}.',
    type: 'purchase'
  },
  {
    id: 'template-2',
    name: 'Credit Purchase',
    title: 'Credits Added',
    message: '{credit_amount} credits have been added to your account.',
    type: 'system'
  },
  {
    id: 'template-3',
    name: 'Product Expiry',
    title: 'Product Access Expiring',
    message: 'Your access to {product_name} will expire soon.',
    type: 'expiry'
  },
  {
    id: 'template-4',
    name: 'Credit Expiry',
    title: 'Credits Expiring',
    message: '{credit_amount} credits will expire soon.',
    type: 'expiry'
  }
];

const AdminNotifications = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    message: '',
    type: 'system' as 'purchase' | 'system' | 'expiry'
  });

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      message: template.message,
      type: template.type
    });
    setEditMode(false);
  };

  const handleEditTemplate = () => {
    setEditMode(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate.id 
        ? { ...template, ...formData }
        : template
    );
    
    setTemplates(updatedTemplates);
    setSelectedTemplate({ ...selectedTemplate, ...formData });
    setEditMode(false);
    toast.success("Template updated successfully");
  };

  const handleCancel = () => {
    if (!selectedTemplate) return;
    setFormData({
      name: selectedTemplate.name,
      title: selectedTemplate.title,
      message: selectedTemplate.message,
      type: selectedTemplate.type
    });
    setEditMode(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
          <TabsTrigger value="settings">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Template List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 rounded cursor-pointer ${selectedTemplate?.id === template.id 
                        ? 'bg-brand-100 border-l-4 border-brand-500' 
                        : 'bg-slate-100 hover:bg-brand-50'}`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {selectedTemplate ? `${editMode ? 'Edit' : 'View'} Template` : 'Select a template'}
                  </CardTitle>
                  {selectedTemplate && !editMode && (
                    <Button size="sm" onClick={handleEditTemplate}>Edit</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedTemplate ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a template to view or edit
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Notification Title</Label>
                      <Input 
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message Body</Label>
                      <Textarea 
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={!editMode}
                        rows={5}
                      />
                      {editMode && (
                        <div className="text-sm text-muted-foreground">
                          Use placeholders like {"{product_name}"}, {"{expiry_date}"}, {"{credit_amount}"} in your message.
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Notification Type</Label>
                      <select 
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange as any}
                        disabled={!editMode}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="purchase">Purchase</option>
                        <option value="system">System</option>
                        <option value="expiry">Expiry</option>
                      </select>
                    </div>

                    {editMode && (
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications to user email</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="email-notifications" className="rounded" />
                    <Label htmlFor="email-notifications">Enabled</Label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Expiry Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications before credits or products expire</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="expiry-notifications" className="rounded" defaultChecked />
                    <Label htmlFor="expiry-notifications">Enabled</Label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Purchase Confirmation</h4>
                    <p className="text-sm text-muted-foreground">Send confirmation for all purchases</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="purchase-notifications" className="rounded" defaultChecked />
                    <Label htmlFor="purchase-notifications">Enabled</Label>
                  </div>
                </div>

                <Button className="mt-4" onClick={() => toast.success("Settings saved successfully")}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotifications;
