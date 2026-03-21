import { useState } from 'react';

// Available icons using simple SVG paths
// These are simplified heroicons-style icons
const AVAILABLE_ICONS = [
  { name: 'home', label: 'Home' },
  { name: 'heart', label: 'Heart' },
  { name: 'device-mobile', label: 'Device' },
  { name: 'shopping-bag', label: 'Shopping' },
  { name: 'truck', label: 'Car' },
  { name: 'wrench', label: 'Tools' },
  { name: 'cake', label: 'Cake' },
  { name: 'fire', label: 'Food' },
  { name: 'film', label: 'Entertainment' },
  { name: 'globe', label: 'Travel' },
  { name: 'calendar', label: 'Calendar' },
  { name: 'dots-horizontal', label: 'Other' },
  { name: 'credit-card', label: 'Card' },
  { name: 'currency-dollar', label: 'Money' },
  { name: 'gift', label: 'Gift' },
  { name: 'light-bulb', label: 'Utilities' },
  { name: 'academic-cap', label: 'Education' },
  { name: 'briefcase', label: 'Work' },
  { name: 'music-note', label: 'Music' },
  { name: 'sparkles', label: 'Special' },
  { name: 'game-controller', label: 'Games' },
  { name: 'paw', label: 'Pets' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'dumbbell', label: 'Fitness' },
  { name: 'book', label: 'Books' },
  { name: 'camera', label: 'Camera' },
  { name: 'airplane', label: 'Flight' },
  { name: 'star', label: 'Star' },
  { name: 'shopping-cart', label: 'Cart' },
  { name: 'utensils', label: 'Dining' },
  { name: 'laptop', label: 'Computer' },
  { name: 'baby', label: 'Baby' },
  { name: 'scissors', label: 'Grooming' },
  { name: 'ticket', label: 'Tickets' },
  { name: 'wifi', label: 'Internet' },
];

// SVG path data for each icon
const iconPaths: Record<string, string> = {
  'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'heart': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'device-mobile': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'shopping-bag': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  'truck': 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  'wrench': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'cake': 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z',
  'fire': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
  'film': 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
  'globe': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'dots-horizontal': 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
  'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  'currency-dollar': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'gift': 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
  'light-bulb': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'academic-cap': 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
  'briefcase': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  'music-note': 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  'sparkles': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'game-controller': 'M15 7h2a5 5 0 015 5v0a5 5 0 01-5 5h-2m-6 0H7a5 5 0 01-5-5v0a5 5 0 015-5h2m0 0h6m-6 0v6m6-6v6m-3-6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01',
  'paw': 'M12 18c-2.5 0-4.5-1.5-4.5-3.5 0-1.5 1-3 2.5-4s2-2.5 2-4c0 1.5.5 3 2 4s2.5 2.5 2.5 4c0 2-2 3.5-4.5 3.5zM6.5 10a2 2 0 100-4 2 2 0 000 4zM17.5 10a2 2 0 100-4 2 2 0 000 4zM4.5 15a2 2 0 100-4 2 2 0 000 4zM19.5 15a2 2 0 100-4 2 2 0 000 4z',
  'coffee': 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-5v3m4-3v3m4-3v3',
  'dumbbell': 'M6.5 6.5h-2a1 1 0 00-1 1v9a1 1 0 001 1h2m0-11v11m0-11h2v11h-2m11-11h2a1 1 0 011 1v9a1 1 0 01-1 1h-2m0-11v11m0-11h-2v11h2m-9-5.5h6',
  'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'camera': 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  'airplane': 'M12 19l-2-6-7-1 7-1 2-6 2 6 7 1-7 1-2 6zM12 5v1m0 12v1',
  'star': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  'shopping-cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  'utensils': 'M3 3v18M7 3v8a4 4 0 01-4 4m4-12v12m0-12a4 4 0 014 4v8M17 3l2 9h-4l2-9zm0 9v9',
  'laptop': 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  'baby': 'M12 8a3 3 0 100-6 3 3 0 000 6zm0 0v2m-4 4c0-2.21 1.79-4 4-4s4 1.79 4 4v1H8v-1zm-4 3h16v2H4v-2z',
  'scissors': 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
  'ticket': 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  'wifi': 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
};

interface IconPickerProps {
  value: string | null | undefined;
  onChange: (icon: string | null) => void;
  color?: string;
}

export function CategoryIcon({ name, className = '', color }: { name: string | null | undefined; className?: string; color?: string }) {
  const path = name ? iconPaths[name] : null;
  if (!path) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth={1.5}>
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg hover:border-white/20 bg-surface-alt focus:outline-none focus:ring-2 focus:ring-gold-400/50"
      >
        <CategoryIcon name={value} className="h-6 w-6" color={color} />
        <span className="text-sm text-[#a8a29e]">
          {value ? AVAILABLE_ICONS.find(i => i.name === value)?.label || value : 'Select icon'}
        </span>
        <svg className="h-4 w-4 text-[#6b6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 bottom-full mb-2 p-3 bg-surface-elevated border border-white/10 rounded-xl shadow-lg w-72">
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    onChange(icon.name);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg hover:bg-surface-alt flex items-center justify-center ${
                    value === icon.name ? 'bg-gold-400/20 ring-2 ring-gold-400' : ''
                  }`}
                  title={icon.label}
                >
                  <CategoryIcon name={icon.name} className="h-6 w-6" color={color} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="mt-2 w-full text-sm text-[#6b6560] hover:text-[#a8a29e]"
            >
              Clear icon
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default IconPicker;
