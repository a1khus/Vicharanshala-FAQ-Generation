import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { faqs } from '../data/faqs';

// ----- Search Bar -----
const SearchBar = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [term, setTerm] = useState('');
  const [suggestions] = useState([
    'What documents are needed for NOC?',
    'How to write an internship offer letter?',
    'Where can I find internship guidelines?',
  ]);

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6">
      <div className="flex items-center bg-surface-container-lowest rounded-full shadow-sm px-4 py-2">
        <Search size={20} className="text-on-surface-variant mr-2" />
        <input
          type="text"
          placeholder="Search Anything..."
          className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-secondary"
          value={term}
          onChange={e => {
            setTerm(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>
      {/* Mock AI suggestions */}
      {term.length === 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-surface-container-lowest rounded-md shadow-lg z-10">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-surface-container-low cursor-pointer"
              onClick={() => setTerm(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ----- Category Tabs -----
const categories = ['All', 'NOC', 'Offer Letter', 'Internship'];
const CategoryTabs = ({ selected, onSelect }: { selected: string; onSelect: (cat: string) => void }) => (
  <div className="flex justify-center gap-4 my-4">
    {categories.map(cat => (
      <button
        key={cat}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === cat
            ? 'bg-primary-fixed text-primary'
            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
        }`}
        onClick={() => onSelect(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

// ----- Accordion Item -----
interface AccordionProps {
  question: string;
  answer: string;
}
const AccordionItem = ({ question, answer }: AccordionProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/30 py-4">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-base font-medium text-on-surface">{question}</span>
        <span className="text-on-surface-variant">{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-sm text-on-surface-variant"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----- FAQ Page -----
const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = faqs.filter(f => {
    const matchesCat = activeCat === 'All' || f.category === activeCat;
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section className="page-container py-12">
      <SearchBar onSearch={setSearchTerm} />
      <CategoryTabs selected={activeCat} onSelect={setActiveCat} />
      <div className="max-w-2xl mx-auto mt-6 space-y-2">
        {filtered.map(item => (
          <AccordionItem key={item.id} question={item.question} answer={item.answer} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-on-surface-variant mt-8">No FAQs match your criteria.</p>
        )}
      </div>
    </section>
  );
};

export default FAQPage;
