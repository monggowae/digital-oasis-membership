
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container px-5 py-8 mx-auto flex flex-col md:flex-row items-center">
        <div className="flex flex-col md:flex-row items-center md:items-start md:text-left">
          <div className="flex-shrink-0 flex items-center mb-4 md:mb-0 md:mr-8">
            <Package className="h-6 w-6 mr-2 text-brand-600" />
            <span className="text-lg font-bold gradient-text">Digital Oasis</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">
            A platform for digital creators and consumers
          </p>
        </div>
        <div className="flex flex-grow justify-center md:justify-end mt-4 md:mt-0">
          <nav className="flex flex-wrap items-center justify-center text-sm">
            <Link to="/" className="mr-5 hover:text-brand-600">Home</Link>
            <Link to="/products" className="mr-5 hover:text-brand-600">Products</Link>
            <Link to="/credits" className="mr-5 hover:text-brand-600">Credits</Link>
            <Link to="/about" className="hover:text-brand-600">About</Link>
          </nav>
        </div>
      </div>
      <div className="bg-gray-200">
        <div className="container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Digital Oasis — All Rights Reserved
          </p>
          <span className="sm:ml-auto sm:mt-0 mt-2 sm:w-auto w-full text-sm text-center text-gray-500">
            Privacy Policy • Terms of Service
          </span>
        </div>
      </div>
    </footer>
  );
};
