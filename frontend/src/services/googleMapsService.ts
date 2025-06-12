import { PlaceResult } from "@/hooks/useBookingManagement";

/**
 * Servicio para manejar las llamadas a la API de Google Maps
 */
class GoogleMapsService {
  private apiKey: string;
  private placesAutocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  
  constructor() {
    // La API_KEY debe estar en las variables de entorno
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.initServices();
  }

  /**
   * Inicializa los servicios de Google Maps cuando el script esté cargado
   */
  private initServices(): void {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.placesAutocompleteService = new google.maps.places.AutocompleteService();
      
      // El servicio de Places necesita un elemento HTML, creamos uno temporal
      const placesDiv = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(placesDiv);
      
      this.geocoder = new google.maps.Geocoder();
    } else {
      // Si la API aún no está cargada, intentamos más tarde
      window.addEventListener('google-maps-loaded', () => {
        this.initServices();
      });
    }
  }

  /**
   * Carga el script de Google Maps si aún no está cargado
   */
  public loadMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        resolve();
        return;
      }

      // Evitar cargar el script múltiples veces
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        const checkIfLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkIfLoaded);
            resolve();
          }
        }, 100);
        return;
      }

      // Crear el script de Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.initServices();
        const event = new Event('google-maps-loaded');
        window.dispatchEvent(event);
        resolve();
      };
      
      script.onerror = (error) => {
        reject(new Error('No se pudo cargar el script de Google Maps: ' + error));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Búsqueda de lugares con autocompletado
   * @param query Texto de búsqueda
   * @param countries Lista opcional de códigos de país ISO para restringir la búsqueda (ej. 'mx', 'es')
   */
  public async searchPlaces(query: string, countries?: string[]): Promise<PlaceResult[]> {
    if (!query || query.length < 3) {
      return [];
    }
    
    if (!this.placesAutocompleteService) {
      await this.loadMapsScript();
      if (!this.placesAutocompleteService) {
        throw new Error('No se pudo inicializar el servicio de autocompletado');
      }
    }
    
    return new Promise((resolve) => {
      // Configurar la solicitud de autocompletado
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
      };

      // Si se especifican países, añadir restricciones
      if (countries && countries.length > 0) {
        // Para un solo país
        if (countries.length === 1) {
          request.componentRestrictions = { country: countries[0] };
        }
        // Para múltiples países, no hay una opción directa en la API
        // Se maneja a través de filtrado posterior o solicitudes separadas
      }
      
      this.placesAutocompleteService!.getPlacePredictions(
        request, 
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([]);
            return;
          }
          
          // Convertir a nuestro formato
          const results: PlaceResult[] = predictions.map(prediction => ({
            place_id: prediction.place_id,
            description: prediction.description,
            structured_formatting: prediction.structured_formatting
              ? {
                  main_text: prediction.structured_formatting.main_text,
                  secondary_text: prediction.structured_formatting.secondary_text
                }
              : undefined
          }));
          
          resolve(results);
        }
      );
    });
  }

  /**
   * Obtiene detalles de un lugar a partir de su place_id
   */
  public async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
    if (!this.placesService) {
      await this.loadMapsScript();
      if (!this.placesService) {
        throw new Error('No se pudo inicializar el servicio de lugares');
      }
    }
    
    return new Promise((resolve) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry']
      };
      
      this.placesService!.getDetails(
        request,
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            resolve(null);
            return;
          }
          
          resolve(place);
        }
      );
    });
  }

  /**
   * Geocodificar una dirección (obtener coordenadas)
   */
  public async geocodeAddress(address: string): Promise<google.maps.GeocoderResult | null> {
    if (!this.geocoder) {
      await this.loadMapsScript();
      if (!this.geocoder) {
        throw new Error('No se pudo inicializar el servicio de geocodificación');
      }
    }
    
    return new Promise((resolve) => {
      this.geocoder!.geocode(
        { address },
        (results, status) => {
          if (status !== google.maps.GeocoderStatus.OK || !results || results.length === 0) {
            resolve(null);
            return;
          }
          
          resolve(results[0]);
        }
      );
    });
  }
}

// Exportar una instancia del servicio
export const googleMapsService = new GoogleMapsService();

// Definición global para TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
} 