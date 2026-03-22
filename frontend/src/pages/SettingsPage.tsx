import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useReorderCategories } from '../hooks/useCategories';
import { authApi, householdApi } from '../lib/api';
import { ErrorMessage, Modal } from '../components/common';
import { SettingsSkeleton, ProfileSection, HouseholdSection, CategorySection } from '../components/settings';
import type { User } from '../types';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery<User[]>({
    queryKey: ['household', 'members'],
    queryFn: householdApi.getMembers,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const inviteMutation = useMutation({
    mutationFn: (email: string) => authApi.invite(email),
    onSuccess: () => {
      setInviteSuccess(true);
      setInviteEmail('');
    },
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(false);
    inviteMutation.mutate(inviteEmail);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteSuccess(false);
    inviteMutation.reset();
  };

  const isLoading = membersLoading || categoriesLoading;
  const error = membersError || categoriesError;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-[#f0ece4]">Settings</h1>

      {isLoading ? (
        <SettingsSkeleton />
      ) : error ? (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load settings'}
        />
      ) : (
        <>
          {user && <ProfileSection user={user} animationDelay={0} />}

          {members && user && (
            <HouseholdSection
              members={members}
              currentUserId={user.id}
              onInvite={() => setIsInviteModalOpen(true)}
              animationDelay={50}
            />
          )}

          {categories && (
            <CategorySection
              categories={categories}
              onCreateCategory={async (data) => {
                await createCategory.mutateAsync(data);
              }}
              onUpdateCategory={async (id, data) => {
                await updateCategory.mutateAsync({ id, data });
              }}
              onDeleteCategory={async (id) => {
                await deleteCategory.mutateAsync(id);
              }}
              onReorderCategories={async (items) => {
                await reorderCategories.mutateAsync(items);
              }}
              isCreatePending={createCategory.isPending}
              isUpdatePending={updateCategory.isPending}
              isDeletePending={deleteCategory.isPending}
              isReorderPending={reorderCategories.isPending}
              createError={createCategory.error}
              updateError={updateCategory.error}
              animationDelay={100}
            />
          )}
        </>
      )}

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal} title="Invite Member">
        {inviteSuccess ? (
          <div className="text-center py-4">
            <svg
              className="mx-auto h-12 w-12 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-[#f0ece4]">Invitation sent successfully!</p>
            <p className="mt-1 text-sm text-[#6b6560]">
              They will receive an email with instructions to join your household.
            </p>
            <button onClick={closeInviteModal} className="mt-4 btn-primary cursor-pointer">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            {inviteMutation.error && (
              <ErrorMessage
                message={
                  inviteMutation.error instanceof Error
                    ? inviteMutation.error.message
                    : 'Failed to send invitation'
                }
              />
            )}

            <div>
              <label htmlFor="inviteEmail" className="label">
                Email Address
              </label>
              <input
                id="inviteEmail"
                name="inviteEmail"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input-field"
                placeholder="spouse@example.com"
              />
              <p className="mt-1 text-xs text-[#6b6560]">
                An invitation link will be sent to this email address.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeInviteModal} className="btn-secondary cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="btn-primary cursor-pointer"
              >
                {inviteMutation.isPending ? 'Sending\u2026' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
