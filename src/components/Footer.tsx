import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container-custom">
        <div className="flex flex-col items-center space-y-6">
          <img
            src="/placeholder.svg"
            alt="ONI Digital"
            className="h-12 w-auto"
          />
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white/80 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
          </div>
          <p className="text-center text-sm text-white/80">
            © 2024 ONI Digital. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};