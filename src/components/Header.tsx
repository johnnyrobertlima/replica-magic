import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <li><Link to="/about" className="hover:text-primary">About</Link></li>
          <li><Link to="/services" className="hover:text-primary">Services</Link></li>
          <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          <li><Link to="/client-area" className="hover:text-primary">Client Area</Link></li>
        </ul>
      </nav>
    </header>
  );
};