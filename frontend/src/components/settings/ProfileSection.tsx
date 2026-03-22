import type { User } from '../../types';

interface ProfileSectionProps {
  user: User;
  animationDelay?: number;
}

export function ProfileSection({ user, animationDelay = 0 }: ProfileSectionProps) {
  return (
    <div
      className="motion-safe:animate-slide-up bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-[#6b6560] mb-4">
        PROFILE
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/20 text-gold-400 font-display font-bold text-lg shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-medium text-[#f0ece4]">{user.name}</p>
          <p className="text-sm text-[#a8a29e]">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
