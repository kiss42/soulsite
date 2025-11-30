import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ theme = 'dark', onToggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false); // State to control mobile menu toggle

  const navItems = [
    { href: '#tarot', label: 'Tarot', icon: '🔮' },
    { href: '#numerology', label: 'Numerology', icon: '🔢' },
    { href: '#chakra', label: 'Chakra', icon: '🧘' },
    { href: '#angel-number', label: 'Angels', icon: '✨' },
    { href: '#journal', label: 'Shadow', icon: '📖' },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-30 pointer-events-none">
      <div className="container mx-auto px-4 pt-4">
        <div className="backdrop-blur-xl bg-slate-950/60 border border-white/10 rounded-full shadow-lg shadow-yellow-200/10 px-4 py-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-[var(--accent)] font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/15 shadow-inner shadow-black/40">
                ✺
              </span>
              <Link to="/" className="hover:opacity-90 transition-opacity">SoulSite</Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleTheme}
                className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/80 border border-white/15 rounded-full px-3 py-2 hover:bg-white/5 transition"
              >
                <span>{theme === 'dark' ? '🌞' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>

              <div className="md:hidden">
                <button onClick={toggleMenu} className="text-white focus:outline-none border border-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                  </svg>
                </button>
              </div>
            </div>

            <ul className="hidden md:flex items-center gap-6 text-sm text-white">
              {navItems.map(item => (
                <li key={item.label} className="group">
                  <a
                    href={item.href}
                    className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl border border-transparent hover:border-white/15 hover:bg-white/5 transition"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/80 group-hover:text-[var(--accent)]">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/90 backdrop-blur-lg border-t border-white/10 pointer-events-auto">
          <ul className="px-6 py-4 space-y-3 text-sm">
            {navItems.map(item => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 text-white hover:text-[var(--accent)]"
                  onClick={toggleMenu}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="uppercase tracking-[0.15em]">{item.label}</span>
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => { onToggleTheme?.(); toggleMenu(); }}
                className="w-full flex items-center gap-3 text-white hover:text-[var(--accent)] uppercase tracking-[0.15em] border border-white/15 rounded-lg px-3 py-2"
              >
                <span>{theme === 'dark' ? '🌞' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
