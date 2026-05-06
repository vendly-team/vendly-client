import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useAddresses, AddressForm } from '@/features/addresses';
import type { Address, CreateAddressRequest } from '@/features/addresses';

const ProfileAddressesPage = () => {
  const { t } = useTranslation();
  const { addresses, loading, createAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddresses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setModalOpen(true);
  };

  const handleSave = async (request: CreateAddressRequest) => {
    setSubmitting(true);
    const ok = editing
      ? await updateAddress(editing.id, request)
      : await createAddress(request);
    setSubmitting(false);
    if (ok) setModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteAddress(id);
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
          {t('addresses.title')}
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-[14px] font-semibold tracking-[-0.011em]"
        >
          <Plus size={16} /> {t('addresses.addAddress')}
        </button>
      </div>

      {loading && addresses.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-[14px]">
          {t('common.loading')}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">
            {t('addresses.noAddresses')}
          </h3>
          <button
            onClick={openAdd}
            className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline"
          >
            {t('addresses.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-4 relative">
              {a.isDefault && (
                <span className="absolute top-3 right-3 text-[11px] font-semibold tracking-[-0.005em] uppercase bg-success/10 text-success px-2 py-0.5 rounded">
                  {t('common.default')}
                </span>
              )}
              <p className="text-[15px] font-semibold tracking-[-0.011em] text-foreground pr-16 break-words">
                {a.label}
              </p>
              <p className="text-[14px] font-normal tracking-[-0.006em] text-foreground mt-1 break-words">
                {a.city}, {a.district}
              </p>
              <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground break-words">
                {a.street}, {a.house}
              </p>
              {a.extra && (
                <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-1 break-words">
                  {a.extra}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {!a.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(a.id)}
                    className="text-[12px] font-medium tracking-[-0.003em] text-accent hover:underline"
                  >
                    {t('addresses.setDefault')}
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="text-foreground hover:text-accent">
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(a.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display">
                {editing ? t('addresses.editAddress') : t('addresses.addAddress')}
              </h3>
              <button onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <AddressForm
              initialAddress={editing}
              onSubmit={handleSave}
              loading={submitting}
              submitLabel={t('common.save')}
            />
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">
              {t('addresses.deleteConfirm')}
            </h3>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
              {t('addresses.deleteWarning')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-10 border border-border rounded-md text-[14px] font-medium tracking-[-0.011em]"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 h-10 bg-destructive text-destructive-foreground rounded-md text-[14px] font-semibold tracking-[-0.011em]"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAddressesPage;
