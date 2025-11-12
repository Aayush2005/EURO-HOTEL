# UI Components

## CountryCodeDropdown

A comprehensive searchable dropdown component for selecting country codes with phone number input.

### Features

- **Complete Country List**: 240+ countries alphabetically sorted
- **Keyboard Navigation**: Use arrow keys to navigate through countries with smooth scrolling
- **Type-to-Search**: Start typing to filter countries by name, code, or dial code
- **Flag Display**: Visual country flags for easy identification
- **Scroll to Selected**: Automatically scrolls to currently selected country when opened
- **Proper Scrolling**: Full scrollable list with 300px max height
- **Search Counter**: Shows number of countries found/available
- **Accessibility**: Full keyboard support with proper focus management
- **Default India**: Defaults to India (+91) as the primary country
- **Enhanced Hover Effects**: Beautiful hover animations on country selector and dropdown items
- **Smooth Animations**: Flag scaling, color transitions, and dropdown slide-in effects

### Usage

```tsx
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';

const [countryCode, setCountryCode] = useState('+91'); // Defaults to India

<CountryCodeDropdown
  value={countryCode}
  onChange={setCountryCode}
  className="flex-shrink-0"
/>
```

### Keyboard Shortcuts

- **Arrow Keys**: Navigate up/down through countries with auto-scroll
- **Enter**: Select highlighted country
- **Escape**: Close dropdown
- **Type letters**: Filter countries by typing (no double typing issues)

### Props

- `value`: Current selected dial code (e.g., '+91')
- `onChange`: Callback when country is selected
- `className`: Additional CSS classes

### Technical Details

- **Countries**: 240+ countries from Afghanistan to Zimbabwe
- **Sorting**: Alphabetically sorted by country name
- **Performance**: Efficient filtering and rendering
- **Scrolling**: Smooth scroll to selected item and keyboard navigation
- **Search**: Real-time filtering with result count