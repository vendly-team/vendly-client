import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { customers as allCustomers } from '@/shared/data/customers';
import { Search } from 'lucide-react';

const AdminCustomersPage = () => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search) return allCustomers;
    const s = search.toLowerCase();
    return allCustomers.filter(c => c.firstName.toLowerCase().includes(s) || c.lastName.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.phone.includes(s));
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Customers</h1>
      <div className="mb-4"><div className="relative w-64"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9 pr-3 glass-input rounded-md text-sm w-full" /></div></div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Registered</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Orders</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(c.registeredAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3"><Link to={`/admin/customers/${c.id}`} className="text-accent hover:underline text-xs">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomersPage;
