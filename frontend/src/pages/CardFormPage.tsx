import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCard, useCreateCard, useUpdateCard } from '../hooks/useCards';
import { LoadingSpinner, ErrorMessage } from '../components/common';

const CARD_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#1f2937', // dark gray
];

export default function CardFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: card, isLoading, error } = useCard(id || '');
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    lastFour: '',
    color: CARD_COLORS[4], // default blue
    cutoffDay: 25,
    dueDay: 10,
    creditLimit: 0,
    isActive: true,
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        bank: card.bank,
        lastFour: card.lastFour,
        color: card.color,
        cutoffDay: card.cutoffDay,
        dueDay: card.dueDay,
        creditLimit: card.creditLimit,
        isActive: card.isActive,
      });
    }
  }, [card]);

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
        message={error instanceof Error ? error.message : 'Failed to load card'}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCard.mutateAsync({ id, data: formData });
      } else {
        await createCard.mutateAsync(formData);
      }
      navigate('/cards');
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createCard.isPending || updateCard.isPending;
  const mutationError = createCard.error || updateCard.error;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/cards" className="text-sm text-[#6b6560] hover:text-[#a8a29e]">
          &larr; Back to Cards
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#f0ece4]">
          {isEditing ? 'Edit Card' : 'Add New Card'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {mutationError && (
          <ErrorMessage
            message={mutationError instanceof Error ? mutationError.message : 'Failed to save card'}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="label">
              Card Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="My Credit Card"
            />
          </div>

          <div>
            <label htmlFor="bank" className="label">
              Bank
            </label>
            <input
              id="bank"
              type="text"
              required
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              className="input-field"
              placeholder="Bangkok Bank"
            />
          </div>

          <div>
            <label htmlFor="lastFour" className="label">
              Last 4 Digits
            </label>
            <input
              id="lastFour"
              type="text"
              required
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              value={formData.lastFour}
              onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
              className="input-field"
              placeholder="1234"
            />
          </div>

          <div>
            <label htmlFor="creditLimit" className="label">
              Credit Limit (THB)
            </label>
            <input
              id="creditLimit"
              type="number"
              required
              min={0}
              step={1000}
              value={formData.creditLimit || ''}
              onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
              className="input-field"
              placeholder="100000"
            />
          </div>

          <div>
            <label htmlFor="cutoffDay" className="label">
              Statement Cutoff Day
            </label>
            <input
              id="cutoffDay"
              type="number"
              required
              min={1}
              max={31}
              value={formData.cutoffDay}
              onChange={(e) => setFormData({ ...formData, cutoffDay: Number(e.target.value) })}
              className="input-field"
            />
            <p className="mt-1 text-xs text-[#6b6560]">Day of month when statement closes</p>
          </div>

          <div>
            <label htmlFor="dueDay" className="label">
              Payment Due Day
            </label>
            <input
              id="dueDay"
              type="number"
              required
              min={1}
              max={31}
              value={formData.dueDay}
              onChange={(e) => setFormData({ ...formData, dueDay: Number(e.target.value) })}
              className="input-field"
            />
            <p className="mt-1 text-xs text-[#6b6560]">Day of month when payment is due</p>
          </div>
        </div>

        <div>
          <span className="label">Card Color</span>
          <div className="flex flex-wrap gap-2">
            {CARD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select color ${color}`}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  formData.color === color ? 'border-gold-400 ring-2 ring-gold-400/30 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-5 w-5 rounded border-white/10"
            />
            <label htmlFor="isActive" className="text-sm text-[#a8a29e]">
              Card is active
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/cards" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? 'Saving\u2026' : isEditing ? 'Update Card' : 'Add Card'}
          </button>
        </div>
      </form>
    </div>
  );
}
