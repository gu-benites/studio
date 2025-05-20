// Mock for lucide-react icons
const createMockIcon = (name) => {
  const MockIcon = ({ className, ...props }) => {
    return (
      <span className={`lucide lucide-${name} ${className || ''}`} {...props}>
        {name}
      </span>
    );
  };
  MockIcon.displayName = name;
  return MockIcon;
};

// Mock specific icons used in your components
const Plus = createMockIcon('Plus');
const X = createMockIcon('X');
const ChevronDown = createMockIcon('ChevronDown');
const Check = createMockIcon('Check');
const Loader2 = createMockIcon('Loader2');
const AlertCircle = createMockIcon('AlertCircle');
const Search = createMockIcon('Search');

export {
  Plus,
  X,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Search,
  // Add other icons as needed
};
