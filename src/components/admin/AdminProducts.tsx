
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
import { DigitalProduct } from "@/models/types";
import { format } from "date-fns";
import { CheckCircle, Edit, Package, Trash } from "lucide-react";

const AdminProducts = () => {
  const { digitalProducts, addProduct, updateProduct, deleteProduct } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<DigitalProduct | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    expiryDays: 30,
    featured: false,
  });

  const handleAddSubmit = () => {
    addProduct({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      image: formData.image || `https://picsum.photos/seed/${Date.now()}/300/200`,
      expiryDays: formData.expiryDays,
      featured: formData.featured,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditSubmit = () => {
    if (!currentProduct) return;
    
    updateProduct(currentProduct.id, {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      image: formData.image,
      expiryDays: formData.expiryDays,
      featured: formData.featured,
    });
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
  };

  const handleEditClick = (product: DigitalProduct) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      expiryDays: product.expiryDays,
      featured: !!product.featured,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: DigitalProduct) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!currentProduct) return;
    deleteProduct(currentProduct.id);
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      image: "",
      expiryDays: 30,
      featured: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Digital Products</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Digital Product</DialogTitle>
              <DialogDescription>
                Create a new digital product to offer in your marketplace
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
                <Label htmlFor="price" className="text-right">
                  Price (Credits)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="col-span-3"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiryDays" className="text-right">
                  Expiry (Days)
                </Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({ ...formData, expiryDays: Number(e.target.value) })}
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
              <Button onClick={handleAddSubmit}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {digitalProducts.map((product) => (
          <Card key={product.id}>
            <div className="flex">
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-l-md"
              />
              <div className="flex-1 min-w-0">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {product.description}
                      </CardDescription>
                    </div>
                    <span className="font-bold text-brand-600">{product.price} Credits</span>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>{" "}
                      {product.category}
                    </div>
                    <div>
                      <span className="text-gray-500">Expires after:</span>{" "}
                      {product.expiryDays} days
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-gray-500">
                      Added: {format(product.createdAt, "MMM d, yyyy")}
                    </div>
                    <div className="flex space-x-2">
                      {product.featured && (
                        <span className="flex items-center text-xs text-brand-600">
                          <CheckCircle className="h-3 w-3 mr-1" /> Featured
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Digital Product</DialogTitle>
            <DialogDescription>Make changes to the product information</DialogDescription>
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
              <Label htmlFor="edit-price" className="text-right">
                Price (Credits)
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expiryDays" className="text-right">
                Expiry (Days)
              </Label>
              <Input
                id="edit-expiryDays"
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: Number(e.target.value) })}
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
              <span className="font-medium">{currentProduct?.name}</span>? This action
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

export default AdminProducts;
