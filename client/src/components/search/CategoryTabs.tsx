import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define the categories displayed as tabs. Adjust as needed.
const categories = [
  { name: 'All', value: '' },
  { name: 'NOC', value: 'NOC' },
  { name: 'Offer Letter', value: 'Offer Letter' },
  { name: 'Internship', value: 'Internship' },
];

/**
 * CategoryTabs renders a set of navigation tabs for filtering search results by category.
 * It preserves existing query parameters (e.g., the search term) while updating the `cat` param.
 */
const CategoryTabs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentCategory = searchParams.get('cat') || '';

  const handleClick = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('cat', value);
    } else {
      newParams.delete('cat');
    }
    // Preserve the search query (`q`) if present
    const q = newParams.get('q') ?? '';
    const path = `/search${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    const final = q ? `${path}&${newParams.toString()}` : `${path}?${newParams.toString()}`;
    // Use navigate to push new URL without reloading the page
    navigate(final);
  };

  return (
    <nav className="flex gap-4 overflow-x-auto pb-2 border-b border-outline-variant/30">
      {categories.map((cat) => {
        const isActive = cat.value === currentCategory;
        return (
          <motion.button
            key={cat.name}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(cat.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-t-lg transition-colors duration-200 focus:outline-none ${isActive
              ? 'bg-primary-fixed text-on-primary-fixed border-b-2 border-primary'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}
            `}
          >
            {cat.name}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default CategoryTabs;
