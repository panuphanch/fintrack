import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTransaction, useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions';
import { useCards } from '../hooks/useCards';
import { useTags, useCreateTag } from '../hooks/useTags';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { uploadsApi } from '../lib/api';

export default function TransactionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: transaction, isLoading, error } = useTransaction(id || '');
  const { data: cards } = useCards();
  const { data: tags } = useTags();
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const createTag = useCreateTag();

  // Get default category (OTHERS) ID
  const defaultCategoryId = categories?.find(c => c.name === 'OTHERS')?.id || '';

  const [formData, setFormData] = useState({
    cardId: '',
    amount: 0,
    merchant: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receiptUrl: '',
    isRecurring: false,
    tagIds: [] as string[],
  });

  const [newTagName, setNewTagName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        cardId: transaction.cardId,
        amount: transaction.amount,
        merchant: transaction.merchant,
        categoryId: transaction.categoryId,
        date: transaction.date.split('T')[0],
        notes: transaction.notes || '',
        receiptUrl: transaction.receiptUrl || '',
        isRecurring: transaction.isRecurring,
        tagIds: transaction.tags.map((t) => t.id),
      });
    }
  }, [transaction]);

  // Set default category if not editing and categories loaded
  useEffect(() => {
    if (!isEditing && defaultCategoryId && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: defaultCategoryId }));
    }
  }, [defaultCategoryId, isEditing, formData.categoryId]);

  // Set default card if only one card exists
  useEffect(() => {
    if (!isEditing && cards && cards.length === 1 && !formData.cardId) {
      setFormData((prev) => ({ ...prev, cardId: cards[0].id }));
    }
  }, [cards, isEditing, formData.cardId]);

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load transaction'}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTransaction.mutateAsync({ id, data: formData });
      } else {
        await createTransaction.mutateAsync(formData);
      }
      navigate('/transactions');
    } catch {
      // Error handled by mutation
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadsApi.uploadReceipt(file);
      setFormData({ ...formData, receiptUrl: url });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleScanReceipt = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await uploadsApi.scanReceipt(file);
      setFormData((prev) => ({
        ...prev,
        amount: result.amount || prev.amount,
        merchant: result.merchant || prev.merchant,
        date: result.date || prev.date,
      }));
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await createTag.mutateAsync({ name: newTagName.trim() });
      setFormData({ ...formData, tagIds: [...formData.tagIds, tag.id] });
      setNewTagName('');
    } catch {
      // Error handled by mutation
    }
  };

  const toggleTag = (tagId: string) => {
    if (formData.tagIds.includes(tagId)) {
      setFormData({ ...formData, tagIds: formData.tagIds.filter((id) => id !== tagId) });
    } else {
      setFormData({ ...formData, tagIds: [...formData.tagIds, tagId] });
    }
  };

  const isPending = createTransaction.isPending || updateTransaction.isPending;
  const mutationError = createTransaction.error || updateTransaction.error;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/transactions" className="text-sm text-[#6b6560] hover:text-[#a8a29e]">
          &larr; Back to Transactions
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#f0ece4]">
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {mutationError && (
          <ErrorMessage
            message={mutationError instanceof Error ? mutationError.message : 'Failed to save transaction'}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cardId" className="label">
              Card
            </label>
            <select
              id="cardId"
              required
              value={formData.cardId}
              onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
              className="input-field"
            >
              <option value="">Select a card</option>
              {cards?.filter((c) => c.isActive).map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} (•••• {card.lastFour})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="label">
              Amount (THB)
            </label>
            <input
              id="amount"
              type="number"
              required
              min={0}
              step={0.01}
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="merchant" className="label">
              Merchant
            </label>
            <input
              id="merchant"
              type="text"
              required
              autoComplete="off"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              className="input-field"
              placeholder="Store name"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="label">
              Category
            </label>
            <select
              id="categoryId"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="label">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="isRecurring"
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-5 w-5 rounded border-white/10"
            />
            <label htmlFor="isRecurring" className="text-sm text-[#a8a29e]">
              Recurring transaction
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="label">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input-field"
            placeholder="Additional details\u2026"
          />
        </div>

        {/* Tags */}
        <div>
          <span className="label">Tags</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  formData.tagIds.includes(tag.id)
                    ? 'bg-gold-400/20 border-gold-400/30 text-gold-400'
                    : 'bg-surface-alt border-white/10 text-[#a8a29e] hover:bg-surface-alt'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              name="newTag"
              aria-label="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="input-field flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTagName.trim() || createTag.isPending}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <span className="label">Receipt (optional)</span>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="input-field flex-1"
            />
            {fileInputRef.current?.files?.[0] && (
              <button
                type="button"
                onClick={handleScanReceipt}
                disabled={isScanning}
                className="btn-secondary"
              >
                {isScanning ? 'Scanning\u2026' : 'Scan OCR'}
              </button>
            )}
          </div>
          {isUploading && <p className="mt-1 text-sm text-[#6b6560]">Uploading\u2026</p>}
          {formData.receiptUrl && (
            <div className="mt-2">
              <img
                src={formData.receiptUrl}
                alt="Receipt"
                width={192}
                height={192}
                className="max-h-48 w-auto rounded border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/transactions" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? 'Saving\u2026' : isEditing ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
