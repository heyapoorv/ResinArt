import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Settings, LogOut, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const links = [
  { to: '/admin',            label: 'Overview',   icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Inventory',  icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/settings',   label: 'Settings',   icon: Settings },
];

export default function AdminSidebar() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/admin/login');
  };

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low
                    flex flex-col p-md gap-sm z-40 border-r border-outline-variant/30">
      {/* Brand */}
      <div className="mb-xl px-sm">
        <h1 className="font-playfair text-headline-md text-primary">Aura Admin</h1>
        <p className="text-caption font-inter text-on-surface-variant">Resin Art Studio</p>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-xs flex-grow">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={20} />
            <span className="font-inter text-body-md">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-auto border-t border-outline-variant pt-md flex flex-col gap-sm">
        <NavLink to="/admin/products"
          className="w-full py-sm bg-primary text-on-primary rounded-full font-inter text-label-md
                     shadow-lg hover:opacity-80 transition-all active:scale-95 flex items-center justify-center gap-xs">
          <Plus size={16} />
          New Product
        </NavLink>
        <div className="flex items-center gap-sm px-sm mt-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-playfair text-primary font-bold">A</span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-inter text-label-md truncate">Admin</p>
            <p className="text-caption font-inter text-on-surface-variant truncate">{admin?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="text-on-surface-variant hover:text-error transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
