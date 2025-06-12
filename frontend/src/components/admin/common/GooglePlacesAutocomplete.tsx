import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import axios from "axios";

// Tipos
export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GooglePlacesAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (prediction: PlacePrediction | null) => void;
  onSelect?: (details: PlaceDetails) => void;
  className?: string;
}

const GooglePlacesAutocomplete = ({
  label = "",
  placeholder = "Buscar ubicación...",
  value = "",
  onChange,
  onSelect,
  className = ""
}: GooglePlacesAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // API URL desde .env o fallback a localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Efecto para manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Actualizar query cuando cambia el valor
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Manejar búsqueda de lugares
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Limpiar predicciones si la consulta es muy corta
    if (searchQuery.length < 3) {
      setPredictions([]);
      onChange(null);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/places/autocomplete`, {
        params: { query: searchQuery }
      });
      setPredictions(response.data);
      setShowPredictions(true);
    } catch (error) {
      console.error("Error al obtener predicciones:", error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de lugar
  const handleSelect = async (prediction: PlacePrediction) => {
    setQuery(prediction.description);
    setShowPredictions(false);
    onChange(prediction);
    
    // Si se proporciona onSelect, obtener detalles del lugar
    if (onSelect) {
      try {
        const response = await axios.get(`${API_URL}/places/details`, {
          params: { place_id: prediction.place_id }
        });
        
        if (response.data && response.data.result) {
          onSelect(response.data.result);
        }
      } catch (error) {
        console.error("Error al obtener detalles del lugar:", error);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
      <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-background">
        {label && <label className="text-xs text-gray-500 mb-0 text-left">{label}</label>}
        <Input 
          className="border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-gray-400 bg-transparent"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setShowPredictions(true);
          }}
          style={{ boxShadow: 'none' }}
        />
      </div>
      
      {/* Predicciones */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {predictions.map((prediction) => (
            <div 
              key={prediction.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(prediction)}
            >
              <div className="font-medium">{prediction.structured_formatting.main_text}</div>
              <div className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete; 