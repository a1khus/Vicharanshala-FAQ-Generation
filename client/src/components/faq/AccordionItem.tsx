import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
}

export const AccordionItem = ({ question, answer }: AccordionItemProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-on-surface">{question}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform ${open ? 'rotate-180' : ''} text-on-surface-variant`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 text-on-surface-variant"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
