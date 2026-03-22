import type { User } from '../../types';

interface HouseholdSectionProps {
  members: User[];
  currentUserId: string;
  onInvite: () => void;
  animationDelay?: number;
}

export function HouseholdSection({ members, currentUserId, onInvite, animationDelay = 0 }: HouseholdSectionProps) {
  const count = members.length;

  return (
    <div
      className="motion-safe:animate-slide-up bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[#6b6560]">
          HOUSEHOLD
        </h2>
        <button onClick={onInvite} className="btn-primary text-sm">
          Invite Member
        </button>
      </div>
      <p className="text-sm text-[#a8a29e] mb-4">
        {count} {count === 1 ? 'member' : 'members'}
      </p>

      <div className="divide-y divide-white/[0.06]">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="py-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors motion-safe:animate-slide-up"
            style={{ animationDelay: `${(animationDelay || 0) + (index + 1) * 50}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/20 text-gold-400 font-display font-bold shrink-0">
              {member.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[#f0ece4]">
                {member.name}
                {member.id === currentUserId && (
                  <span className="ml-2 text-xs text-[#6b6560]">(You)</span>
                )}
              </p>
              <p className="text-sm text-[#a8a29e]">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
