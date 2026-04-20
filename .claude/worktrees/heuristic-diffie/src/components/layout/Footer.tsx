import { Link } from "react-router-dom";
import { categories } from "@/shared/data/categories";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-lg">B</span>
              </div>
              <span className="font-display font-bold text-xl">baytech</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Your trusted destination for premium home appliances. Quality products, competitive prices.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/50">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/50">
              Customer Service
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/profile/orders" className="hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-accent transition-colors">Shopping Cart</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/50">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>📞 +1 (800) 123-4567</li>
              <li>✉️ support@baytech.com</li>
              <li>📍 123 Tech Avenue, Suite 100</li>
            </ul>
            <div className="flex gap-3 mt-4">
              {["Facebook", "Instagram", "Twitter"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-xs text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} baytech. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
