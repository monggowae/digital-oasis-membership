
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/contexts/StoreContext";
import { CreditPackage } from "@/models/types";
import { CheckCircle, CreditCard, Edit, Trash } from "lucide-react";

const AdminCredits = () => {
  const { creditPackages, addCreditPackage, updateCreditPackage, deleteCreditPackage } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<CreditPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    credits: 0,
    price: 0,
    featured: false,
  });

  const handleAddSubmit = () => {
    addCreditPackage({
      name: formData.name,
      description: formData.description,
      credits: formData.credits,
      price: formData.price,
      featured: formData.featured,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditSubmit = () => {
    if (!currentPackage) return;
    
    updateCreditPackage(currentPackage.id, {
      name: formData.name,
      description: formData.description,
      credits: formData.credits,
      price: formData.price,
      featured: formData.featured,
    });
    setIsEditDialogOpen(false);
    setCurrentPackage(null);
  };

  const handleEditClick = (pkg: CreditPackage) => {
    setCurrentPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      credits: pkg.credits,
      price: pkg.price,
      featured: !!pkg.featured,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (pkg: CreditPackage) => {
    setCurrentPackage(pkg);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!currentPackage) return;
    deleteCreditPackage(currentPackage.id);
    setIsDeleteDialogOpen(false);
    setCurrentPackage(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      credits: 0,
      price: 0,
      featured: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Credit Packages</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Credit Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Credit Package</DialogTitle>
              <DialogDescription>
                Create a new credit package for your users
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">
                  Credits
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <input
                  id="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubmit}>Add Package</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => (
          <Card key={pkg.id} className={pkg.featured ? "border-brand-400" : ""}>
            {pkg.featured && (
              <div className="bg-brand-600 text-white py-1 text-center text-xs font-medium">
                FEATURED PACKAGE
              </div>
            )}
            <CardHeader className={pkg.featured ? "bg-brand-50" : ""}>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-brand-600">{pkg.credits}</div>
                  <div className="text-sm text-gray-500">Credits</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${pkg.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">USD</div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <div className="flex space-x-1">
                  {pkg.featured && (
                    <span className="flex items-center text-xs text-brand-600">
                      <CheckCircle className="h-3 w-3 mr-1" /> Featured
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleEditClick(pkg)}
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteClick(pkg)}
                  >
                    <Trash className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Credit Package</DialogTitle>
            <DialogDescription>Make changes to the credit package</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-credits" className="text-right">
                Credits
              </Label>
              <Input
                id="edit-credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price (USD)
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-featured" className="text-right">
                Featured
              </Label>
              <input
                id="edit-featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{currentPackage?.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCredits;
