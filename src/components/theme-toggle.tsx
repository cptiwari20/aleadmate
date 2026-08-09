"use client";

/**
 * No React state at all: the `dark` class on <html> is the single source of
 * truth, and CSS picks the icon. That removes the hydration mismatch, the
 * setState-in-effect cascade, and the flash of the wrong icon in one go.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <svg
        viewBox="0 0 20 20"
        className="hidden size-4 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.5" />
        <path
          d="M10 2v1.5M10 16.5V18M18 10h-1.5M3.5 10H2M15.7 4.3l-1 1M5.3 14.7l-1 1M15.7 15.7l-1-1M5.3 5.3l-1-1"
          strokeLinecap="round"
        />
      </svg>
      <svg
        viewBox="0 0 20 20"
        className="size-4 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M17 12.5A7.5 7.5 0 017.5 3a7.5 7.5 0 109.5 9.5z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * Runs before paint so the theme never flashes. Kept as a string because it has
 * to execute synchronously in <head>, ahead of React hydration.
 */
export const themeScript = `
(function(){try{
  var t = localStorage.getItem('theme');
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (t === 'dark') document.documentElement.classList.add('dark');
}catch(e){}})();
`;
