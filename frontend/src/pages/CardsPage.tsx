import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCards, useDeleteCard } from '../hooks/useCards';
import { ErrorMessage, ConfirmDialog } from '../components/common';
import { CreditCardVisual, CardStats, CardSkeleton } from '../components/cards';
import type { CreditCard } from '../types';

export default function CardsPage() {
  const { data: cards, isLoading, error, refetch } = useCards();
  const deleteCard = useDeleteCard();
  const navigate = useNavigate();
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Credit Cards</h1>
          <Link to="/cards/new" className="btn-primary">
            Add Card
          </Link>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load cards'}
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = async () => {
    if (!cardToDelete) return;
    const idToDelete = cardToDelete.id;
    setCardToDelete(null);
    try {
      await deleteCard.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const activeCards = cards?.filter((c) => c.isActive) || [];
  const inactiveCards = cards?.filter((c) => !c.isActive) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Credit Cards</h1>
        <Link to="/cards/new" className="btn-primary">
          Add Card
        </Link>
      </div>

      {activeCards.length === 0 && inactiveCards.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-[#6b6560]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#f0ece4]">No credit cards</h3>
          <p className="mt-1 text-sm text-[#6b6560]">Get started by adding your first card.</p>
          <div className="mt-6">
            <Link to="/cards/new" className="btn-primary">
              Add Card
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <CardStats cards={activeCards} />

          {/* Active cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCards.map((card, i) => (
              <CreditCardVisual
                key={card.id}
                card={card}
                onEdit={(id) => navigate(`/cards/${id}/edit`)}
                onDelete={(c) => setCardToDelete(c)}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>

          {/* Inactive cards */}
          {inactiveCards.length > 0 && (
            <details open>
              <summary className="flex items-center gap-2 cursor-pointer text-lg font-medium text-[#6b6560] select-none group list-none [&::-webkit-details-marker]:hidden">
                <svg
                  className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                Inactive Cards ({inactiveCards.length})
              </summary>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveCards.map((card, i) => (
                  <CreditCardVisual
                    key={card.id}
                    card={card}
                    onEdit={(id) => navigate(`/cards/${id}/edit`)}
                    onDelete={(c) => setCardToDelete(c)}
                    isInactive
                    style={{ animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Card"
        message={`Are you sure you want to delete \u201C${cardToDelete?.name}\u201D? This will mark the card as inactive.`}
        confirmText="Delete"
        isLoading={deleteCard.isPending}
      />
    </div>
  );
}
