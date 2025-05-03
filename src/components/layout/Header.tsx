
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Package } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-xl gradient-text">Digital Oasis</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
            Products
          </Link>
          <Link to="/credits" className="text-sm font-medium transition-colors hover:text-primary">
            Credits
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="mr-4 hidden md:block">
                <span className="px-2 py-1 bg-brand-100 text-brand-800 rounded-md text-sm font-medium">
                  {user.credits} Credits
                </span>
              </div>
              
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.name}}`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/purchases">My Purchases</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
