'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export interface AddressResult {
  street: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: AddressResult) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

function parsePlace(place: any): AddressResult {
  const comp = (type: string) =>
    place.address_components?.find((c: any) => c.types.includes(type))?.long_name || '';
  const compShort = (type: string) =>
    place.address_components?.find((c: any) => c.types.includes(type))?.short_name || '';

  const streetNumber = comp('street_number');
  const route = comp('route');
  const street = [streetNumber, route].filter(Boolean).join(' ');
  const city = comp('locality') || comp('sublocality') || comp('administrative_area_level_2');
  const state = compShort('administrative_area_level_1');
  const zip = comp('postal_code');
  const fullAddress = place.formatted_address || '';

  return { street, city, state, zip, fullAddress };
}

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder = 'Street address', className, style }: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Check if Google Maps is loaded
  useEffect(() => {
    if (window.google?.maps?.places) {
      setMapsReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        setMapsReady(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback((query: string) => {
    if (!mapsReady || !window.google?.maps?.places || query.length < 3) {
      setSuggestions([]); setOpen(false); return;
    }
    if (!autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
    }
    setLoading(true);
    autocompleteRef.current.getPlacePredictions(
      { input: query, componentRestrictions: { country: 'us' }, types: ['address'] },
      (predictions: any[], status: string) => {
        setLoading(false);
        if (status === 'OK' && predictions) {
          setSuggestions(predictions);
          setOpen(true);
        } else {
          setSuggestions([]); setOpen(false);
        }
      }
    );
  }, [mapsReady]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 300);
  };

  const handleSelect = (prediction: any) => {
    setOpen(false);
    if (!window.google?.maps?.places) return;
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    placesService.getDetails(
      { placeId: prediction.place_id, fields: ['address_components', 'formatted_address'] },
      (place: any, status: string) => {
        if (status === 'OK' && place) {
          const result = parsePlace(place);
          onChange(result.street || result.fullAddress);
          onSelect?.(result);
        }
      }
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 40, background: '#FAF9F7', border: '1px solid #E8E4DF',
    borderRadius: 9, padding: '0 36px 0 12px', fontSize: 13, color: '#1A1A2E',
    outline: 'none', boxSizing: 'border-box',
    ...style,
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} className={className}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e => {
            e.target.style.borderColor = '#E8834A';
            e.target.style.boxShadow = '0 0 0 3px rgba(232,131,74,0.15)';
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={e => {
            e.target.style.borderColor = '#E8E4DF';
            e.target.style.boxShadow = 'none';
          }}
        />
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          {loading ? <Loader2 size={14} color="#9CA3AF" className="animate-spin"/> : <MapPin size={14} color="#9CA3AF"/>}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'white', border: '1px solid #E8E4DF', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
        }}>
          {suggestions.map(pred => (
            <button
              key={pred.place_id}
              type="button"
              onMouseDown={() => handleSelect(pred)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid #F3F4F6',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAF9F7')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <MapPin size={13} color="#E8834A" style={{ flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>
                  {pred.structured_formatting?.main_text}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {pred.structured_formatting?.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!mapsReady && value.length > 0 && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>
          Smart suggestions require Google Maps API key in Settings → Integrations
        </p>
      )}
    </div>
  );
}
