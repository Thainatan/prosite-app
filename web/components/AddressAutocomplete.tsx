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
  }
}

// ─── Google Places ────────────────────────────────────────────────────────────
function parseGooglePlace(place: any): AddressResult {
  const comp = (type: string) =>
    place.address_components?.find((c: any) => c.types.includes(type))?.long_name || '';
  const compShort = (type: string) =>
    place.address_components?.find((c: any) => c.types.includes(type))?.short_name || '';
  const street = [comp('street_number'), comp('route')].filter(Boolean).join(' ');
  const city = comp('locality') || comp('sublocality') || comp('administrative_area_level_2');
  return {
    street,
    city,
    state: compShort('administrative_area_level_1'),
    zip: comp('postal_code'),
    fullAddress: place.formatted_address || '',
  };
}

// ─── Nominatim fallback ───────────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

function parseNominatim(r: NominatimResult): AddressResult {
  const a = r.address;
  const street = [a.house_number, a.road].filter(Boolean).join(' ');
  const city = a.city || a.town || a.village || '';
  // Convert full state name to abbreviation (common US states)
  const STATE_ABBR: Record<string, string> = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
    'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA',
    'Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT',
    'Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM',
    'New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
    'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
    'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT',
    'Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY',
  };
  const state = STATE_ABBR[a.state || ''] || a.state || '';
  return { street, city, state, zip: a.postcode || '', fullAddress: r.display_name };
}

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return [];
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddressAutocomplete({
  value, onChange, onSelect, placeholder = 'Street address', className, style,
}: Props) {
  const [suggestions, setSuggestions] = useState<{ label: string; sub: string; onPick: () => void }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Check if Google Maps is loaded
  useEffect(() => {
    const check = () => {
      if (window.google?.maps?.places) { setMapsReady(true); return true; }
      return false;
    };
    if (check()) return;
    const interval = setInterval(() => { if (check()) clearInterval(interval); }, 500);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);

    if (mapsReady && window.google?.maps?.places) {
      // ── Google Places path ──────────────────────────────────────────────
      if (!autocompleteRef.current) {
        autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      }
      autocompleteRef.current.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'us' }, types: ['address'] },
        (predictions: any[], status: string) => {
          setLoading(false);
          if (status === 'OK' && predictions) {
            setSuggestions(predictions.map(pred => ({
              label: pred.structured_formatting?.main_text || pred.description,
              sub: pred.structured_formatting?.secondary_text || '',
              onPick: () => {
                setOpen(false);
                if (!window.google?.maps?.places) return;
                if (!placesServiceRef.current) {
                  placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'));
                }
                placesServiceRef.current.getDetails(
                  { placeId: pred.place_id, fields: ['address_components', 'formatted_address'] },
                  (place: any, st: string) => {
                    if (st === 'OK' && place) {
                      const result = parseGooglePlace(place);
                      onChange(result.street || result.fullAddress);
                      onSelect?.(result);
                    }
                  }
                );
              },
            })));
            setOpen(true);
          } else {
            setSuggestions([]); setOpen(false);
          }
        }
      );
    } else {
      // ── Nominatim fallback ──────────────────────────────────────────────
      try {
        const results = await nominatimSearch(query);
        setLoading(false);
        if (results.length > 0) {
          setSuggestions(results.map(r => {
            const parsed = parseNominatim(r);
            const mainText = [parsed.street, parsed.city].filter(Boolean).join(', ') || r.display_name.split(',')[0];
            const subText = [parsed.city, parsed.state, parsed.zip].filter(Boolean).join(', ');
            return {
              label: mainText,
              sub: subText,
              onPick: () => {
                setOpen(false);
                onChange(parsed.street || mainText);
                onSelect?.(parsed);
              },
            };
          }));
          setOpen(true);
        } else {
          setSuggestions([]); setOpen(false);
        }
      } catch {
        setLoading(false);
        setSuggestions([]); setOpen(false);
      }
    }
  }, [mapsReady, onChange, onSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), mapsReady ? 300 : 500);
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
          {loading
            ? <Loader2 size={14} color="#9CA3AF" className="animate-spin"/>
            : <MapPin size={14} color="#9CA3AF"/>}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'white', border: '1px solid #E8E4DF', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
        }}>
          {!mapsReady && (
            <div style={{ padding: '6px 14px', fontSize: 10, color: '#9CA3AF', background: '#FAF9F7', borderBottom: '1px solid #F0EDE9' }}>
              Powered by OpenStreetMap · Add Google Maps key for enhanced results
            </div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => s.onPick()}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: i < suggestions.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAF9F7')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <MapPin size={13} color="#E8834A" style={{ flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>{s.label}</div>
                {s.sub && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
