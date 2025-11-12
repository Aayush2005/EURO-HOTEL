'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { countryCodes, CountryCode } from '@/data/countryCodes';

interface CountryCodeDropdownProps {
  value: string;
  onChange: (dialCode: string) => void;
  className?: string;
}

const CountryCodeDropdown: React.FC<CountryCodeDropdownProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find selected country, default to India if not found
  const selectedCountry = countryCodes.find(country => country.dialCode === value) || 
                          countryCodes.find(country => country.code === 'IN') || 
                          countryCodes[0];

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Don't handle if the search input is focused (to prevent double typing)
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
        } else {
          return; // Let the input handle normal typing
        }
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => {
            const newIndex = prev < filteredCountries.length - 1 ? prev + 1 : 0;
            // Scroll to highlighted item
            setTimeout(() => {
              if (listRef.current) {
                const itemHeight = 48;
                const scrollTop = newIndex * itemHeight - 100;
                listRef.current.scrollTop = Math.max(0, scrollTop);
              }
            }, 0);
            return newIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : filteredCountries.length - 1;
            // Scroll to highlighted item
            setTimeout(() => {
              if (listRef.current) {
                const itemHeight = 48;
                const scrollTop = newIndex * itemHeight - 100;
                listRef.current.scrollTop = Math.max(0, scrollTop);
              }
            }, 0);
            return newIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCountries[highlightedIndex]) {
            handleSelect(filteredCountries[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        default:
          // For letter keys, focus search input (but don't add the character manually)
          if (e.key.length === 1 && searchInputRef.current && document.activeElement !== searchInputRef.current) {
            searchInputRef.current.focus();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, filteredCountries, highlightedIndex]);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: CountryCode) => {
    onChange(country.dialCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      // Focus search input when opening and scroll to selected country
      setTimeout(() => {
        searchInputRef.current?.focus();
        
        // Scroll to selected country
        if (listRef.current && selectedCountry) {
          const selectedIndex = countryCodes.findIndex(country => country.dialCode === selectedCountry.dialCode);
          if (selectedIndex >= 0) {
            const itemHeight = 48; // Approximate height of each item
            const scrollTop = selectedIndex * itemHeight - 100; // Offset to show some context
            listRef.current.scrollTop = Math.max(0, scrollTop);
          }
        }
      }, 100);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Country Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="group flex items-center gap-2 px-3 py-3 border border-soft-gray rounded-lg hover:border-gold-500 hover:bg-gold-50 hover:shadow-md focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 bg-off-white min-w-[120px]"
      >
        <span className="text-lg group-hover:scale-110 transition-transform duration-200">{selectedCountry.flag}</span>
        <span className="text-sm font-medium text-charcoal-700 group-hover:text-gold-700 transition-colors duration-200">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-charcoal-600 group-hover:text-gold-600 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-off-white border border-soft-gray rounded-lg shadow-2xl z-50 overflow-hidden min-w-[320px] w-max max-w-sm animate-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-muted-beige sticky top-0 bg-off-white">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-3 py-2 text-sm border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white text-charcoal-700"
            />
          </div>

          {/* Countries List */}
          <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gold-50 hover:shadow-sm transition-all duration-150 ${
                    index === highlightedIndex ? 'bg-gold-100 shadow-sm' : ''
                  } ${country.dialCode === value ? 'bg-gold-50 font-medium shadow-sm' : ''}`}
                >
                  <span className="text-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-150">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-charcoal-700 group-hover:text-gold-700 pr-2 transition-colors duration-150" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {country.name}
                      </span>
                      <span className="text-xs text-charcoal-500 group-hover:text-gold-600 font-mono flex-shrink-0 transition-colors duration-150">
                        {country.dialCode}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-charcoal-500 text-center">
                No countries found
              </div>
            )}
          </div>
          
          {/* Show count */}
          {/* <div className="px-3 py-2 border-t border-muted-beige bg-muted-beige text-xs text-charcoal-600 text-center">
            {searchTerm 
              ? `${filteredCountries.length} countries found` 
              : `${countryCodes.length} countries available`
            }
          </div> */}
        </div>
      )}
    </div>
  );
};

export default CountryCodeDropdown;