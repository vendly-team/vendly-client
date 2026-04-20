import { useState } from 'react';
import { adminUsers as initial } from '@/shared/data/users';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState(initial);
  const { user: currentUser } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'manager' as 'admin' | 'manager' });

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) { toast.error(t('users.errors.allRequired')); return; }
    if (form.password.length < 8) { toast.error(t('users.errors.minPassword')); return; }
    if (users.some(u => u.email === form.email)) { toast.error(t('users.errors.emailExists')); return; }
    setUsers([...users, { id: String(Date.now()), ...form, lastLogin: new Date().toISOString(), isBlocked: false }]);
    setModalOpen(false);
    toast.success(t('users.success.created'));
  };

  const toggleBlock = (id: string) => {
    if (id === currentUser?.id) { toast.error(t('users.errors.cantBlockSelf')); return; }
    setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
    toast.success(t('users.success.statusUpdated'));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{t('users.title')}</h1>
        <button onClick={() => { setForm({ firstName: '', lastName: '', email: '', password: '', role: 'manager' }); setModalOpen(true); }} className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium"><Plus size={16} /> {t('users.addUser')}</button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.name')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.email')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('users.role')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('users.lastLogin')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.status')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${u.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-info/10 text-info'}`}>{u.role}</span></td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(u.lastLogin).toLocaleDateString()}</td>
              <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${u.isBlocked ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>{u.isBlocked ? t('customers.blocked') : t('common.active')}</span></td>
              <td className="px-4 py-3"><button onClick={() => toggleBlock(u.id)} className="text-xs text-accent hover:underline">{u.isBlocked ? t('customers.unblock') : t('customers.block')}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{t('users.addUser')}</h3><button onClick={() => setModalOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder={`${t('auth.firstName')} *`} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="h-10 px-3 glass-input rounded-md text-sm" />
                <input placeholder={`${t('auth.lastName')} *`} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="h-10 px-3 glass-input rounded-md text-sm" />
              </div>
              <input placeholder={`${t('common.email')} *`} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <input placeholder={`${t('auth.password')} *`} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as any})} className="w-full h-10 px-3 glass-input rounded-md text-sm"><option value="manager">{t('users.manager')}</option><option value="admin">{t('users.admin')}</option></select>
            </div>
            <button onClick={handleSave} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm mt-4">{t('users.createUser')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
