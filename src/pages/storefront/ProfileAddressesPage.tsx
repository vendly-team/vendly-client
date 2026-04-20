import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddressStore } from '@/shared/store/addressStore';
import { MapPin, Plus, Trash2, Edit2, X } from 'lucide-react';

const ProfileAddressesPage = () => {
  const { t } = useTranslation();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefault } = useAddressStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ city: '', district: '', street: '', house: '', notes: '', isDefault: false });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => { setForm({ city: '', district: '', street: '', house: '', notes: '', isDefault: false }); setEditId(null); setModalOpen(true); };
  const openEdit = (id: string) => {
    const a = addresses.find(a => a.id === id);
    if (a) { setForm({ city: a.city, district: a.district, street: a.street, house: a.house, notes: a.notes || '', isDefault: a.isDefault }); setEditId(id); setModalOpen(true); }
  };
  const handleSave = () => {
    if (!form.city || !form.street || !form.house) return;
    if (editId) updateAddress(editId, form);
    else addAddress(form);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('addresses.title')}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium"><Plus size={16} /> {t('addresses.addAddress')}</button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-20"><MapPin className="mx-auto mb-4 text-muted-foreground" size={48} /><h3 className="text-lg font-semibold mb-2">{t('addresses.noAddresses')}</h3><button onClick={openAdd} className="text-accent hover:underline">{t('addresses.addFirst')}</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-4 relative">
              {a.isDefault && <span className="absolute top-3 right-3 text-xs bg-success/10 text-success px-2 py-0.5 rounded font-medium">{t('common.default')}</span>}
              <p className="font-medium text-foreground">{a.city}, {a.district}</p>
              <p className="text-sm text-muted-foreground">{a.street}, {a.house}</p>
              {a.notes && <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>}
              <div className="flex items-center gap-3 mt-3">
                {!a.isDefault && <button onClick={() => setDefault(a.id)} className="text-xs text-accent hover:underline">{t('addresses.setDefault')}</button>}
                <button onClick={() => openEdit(a.id)} className="text-xs text-foreground hover:text-accent"><Edit2 size={14} /></button>
                <button onClick={() => setConfirmDelete(a.id)} className="text-xs text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{editId ? t('addresses.editAddress') : t('addresses.addAddress')}</h3><button onClick={() => setModalOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <input placeholder={`${t('addresses.city')} *`} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <input placeholder={t('addresses.district')} value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <input placeholder={`${t('addresses.street')} *`} value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <input placeholder={`${t('addresses.house')} *`} value={form.house} onChange={e => setForm({ ...form, house: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <textarea placeholder={t('addresses.notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full h-20 p-3 glass-input rounded-md text-sm resize-none" />
            </div>
            <button onClick={handleSave} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm mt-4">{t('common.save')}</button>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">{t('addresses.deleteConfirm')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('addresses.deleteWarning')}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 border border-border rounded-md text-sm">{t('common.cancel')}</button>
              <button onClick={() => { deleteAddress(confirmDelete); setConfirmDelete(null); }} className="flex-1 h-10 bg-destructive text-destructive-foreground rounded-md text-sm font-medium">{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAddressesPage;
