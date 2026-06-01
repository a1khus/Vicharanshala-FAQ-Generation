import { Link } from 'react-router-dom';

const Footer = () => {
  const links = [
    { to: '/questions', label: 'Browse FAQs' },
    { to: '/community', label: 'Community Guidelines' },
    { to: '/questions/ask', label: 'Ask a Question' },
    { to: '/privacy', label: 'Privacy Policy' },
  ];

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/40 mt-24">
      <div className="page-container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-primary text-[28px]">hub</span>
              <span className="text-headline-md font-bold text-on-surface">WiseFlow</span>
            </Link>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              © {new Date().getFullYear()} WiseFlow Wisdom Collective. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-label-md text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
