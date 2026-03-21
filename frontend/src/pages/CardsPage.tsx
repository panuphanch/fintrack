import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCards, useDeleteCard } from '../hooks/useCards';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../components/common';
import { formatTHB } from '../lib/format';
import type { CreditCard } from '../types';

export default function CardsPage() {
  const { data: cards, isLoading, error, refetch } = useCards();
  const deleteCard = useDeleteCard();
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
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
    setCardToDelete(null); // Close dialog first
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
        <h1 className="text-2xl font-bold text-[#f0ece4]">Credit Cards</h1>
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
          {/* Active Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCards.map((card) => (
              <div
                key={card.id}
                className="card relative overflow-hidden"
                style={{ borderTopColor: card.color, borderTopWidth: '4px' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[#f0ece4]">{card.name}</h3>
                    <p className="text-sm text-[#6b6560]">
                      {card.bank} •••• {card.lastFour}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/cards/${card.id}/edit`}
                      className="text-[#6b6560] hover:text-[#a8a29e]"
                      aria-label="Edit card"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setCardToDelete(card)}
                      className="text-[#6b6560] hover:text-red-400"
                      aria-label="Delete card"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#6b6560]">Credit Limit</p>
                    <p className="font-medium text-[#f0ece4]">{formatTHB(card.creditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-[#6b6560]">Due Day</p>
                    <p className="font-medium text-[#f0ece4]">Day {card.dueDay}</p>
                  </div>
                  <div>
                    <p className="text-[#6b6560]">Cutoff Day</p>
                    <p className="font-medium text-[#f0ece4]">Day {card.cutoffDay}</p>
                  </div>
                  {card.owner && (
                    <div>
                      <p className="text-[#6b6560]">Owner</p>
                      <p className="font-medium text-[#f0ece4]">{card.owner.name}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Inactive Cards */}
          {inactiveCards.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-[#6b6560] mb-4">Inactive Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveCards.map((card) => (
                  <div
                    key={card.id}
                    className="card opacity-60"
                    style={{ borderTopColor: card.color, borderTopWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[#f0ece4]">{card.name}</h3>
                        <p className="text-sm text-[#6b6560]">
                          {card.bank} •••• {card.lastFour}
                        </p>
                        <span className="mt-2 inline-block px-2 py-1 text-xs font-medium text-[#a8a29e] bg-surface-alt rounded">
                          Inactive
                        </span>
                      </div>
                      <Link
                        to={`/cards/${card.id}/edit`}
                        className="text-[#6b6560] hover:text-[#a8a29e]"
                        aria-label="Edit card"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Card"
        message={`Are you sure you want to delete "${cardToDelete?.name}"? This will mark the card as inactive.`}
        confirmText="Delete"
        isLoading={deleteCard.isPending}
      />
    </div>
  );
}
