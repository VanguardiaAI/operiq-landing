/**
 * Servicio para el cálculo de tarifas basado en distancias, rutas y precios de vehículos
 */

// Interfaz para las coordenadas geográficas
interface Coordinates {
  lat: number;
  lng: number;
}

// Interfaz para la información de ruta
export interface RouteInfo {
  distance: number; // Distancia en metros
  duration: number; // Duración en segundos
  polyline?: string; // Línea de ruta codificada para visualización en mapas
}

// Interfaz para la estructura de precios de vehículos
export interface VehiclePricing {
  base_fare: number;
  per_km: number;
  per_hour: number;
  currency: string;
}

// Interfaz para el desglose de precios
export interface PriceBreakdown {
  base_fare: number;
  distance_charge: number;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  currency: string;
  // Nuevos campos para ida y vuelta
  total_distance_km: number;
  is_round_trip: boolean;
  one_way_distance_km?: number;
}

// Tipo para el servicio de transporte
export type ServiceType = 'one_way' | 'round_trip' | 'hourly' | 'full_day';

/**
 * Servicio para el cálculo de precios
 */
class PriceCalculationService {
  private directionsService: google.maps.DirectionsService | null = null;
  private cachedRoutes: Map<string, RouteInfo> = new Map();
  
  constructor() {
    this.initServices();
  }

  /**
   * Inicializa los servicios de Google Maps
   */
  private initServices(): void {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.directionsService = new google.maps.DirectionsService();
    } else {
      // Si la API aún no está cargada, intentamos más tarde
      window.addEventListener('google-maps-loaded', () => {
        this.initServices();
      });
    }
  }

  /**
   * Genera una clave de caché para las rutas
   */
  private generateCacheKey(origin: Coordinates, destination: Coordinates): string {
    return `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`;
  }

  /**
   * Calcula la ruta entre dos puntos usando Google Maps Directions API
   */
  public async calculateRoute(origin: Coordinates, destination: Coordinates): Promise<RouteInfo> {
    if (!this.directionsService) {
      throw new Error('El servicio de direcciones no está disponible');
    }

    // Verificar si tenemos esta ruta en caché
    const cacheKey = this.generateCacheKey(origin, destination);
    if (this.cachedRoutes.has(cacheKey)) {
      return this.cachedRoutes.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.DirectionsRequest = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        // Optimizar para tráfico real si está disponible
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      };

      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          // Extraer la información relevante de la ruta
          const route = result.routes[0].legs[0];
          const routeInfo: RouteInfo = {
            distance: route.distance?.value || 0, // en metros
            duration: route.duration?.value || 0, // en segundos
            polyline: this.encodePolyline(result.routes[0])
          };

          // Guardar en caché para futuras consultas
          this.cachedRoutes.set(cacheKey, routeInfo);
          
          resolve(routeInfo);
        } else {
          reject(new Error(`Error al calcular la ruta: ${status}`));
        }
      });
    });
  }

  /**
   * Codifica la polilínea de la ruta para visualización
   */
  private encodePolyline(route: google.maps.DirectionsRoute): string {
    if (!route.overview_path) return '';
    
    // Utilizamos el codificador de polilíneas de Google Maps
    const path = route.overview_path;
    const encodedPath = google.maps.geometry.encoding.encodePath(path);
    
    return encodedPath;
  }

  /**
   * Calcula el precio basado en la ruta, estructura de precios del vehículo y tipo de servicio
   */
  public calculatePrice(routeInfo: RouteInfo, pricing: VehiclePricing, serviceType: ServiceType = 'one_way'): PriceBreakdown {
    // Convertir distancia de metros a kilómetros (solo ida)
    const oneWayDistanceInKm = routeInfo.distance / 1000;
    
    // Determinar la distancia total según el tipo de servicio
    let totalDistanceInKm = oneWayDistanceInKm;
    const isRoundTrip = serviceType === 'round_trip';
    
    if (isRoundTrip) {
      // Para ida y vuelta, multiplicar por 2
      totalDistanceInKm = oneWayDistanceInKm * 2;
    }
    
    // Cálculo del precio base
    const baseFare = pricing.base_fare;
    
    // Cargo por distancia (precio por km × distancia total en km)
    const distanceCharge = pricing.per_km * totalDistanceInKm;
    
    // Subtotal antes de impuestos
    const subtotal = baseFare + distanceCharge;
    
    // IVA en España (21%)
    const taxPercentage = 21;
    const taxAmount = (subtotal * taxPercentage) / 100;
    
    // Total final
    const total = subtotal + taxAmount;
    
    return {
      base_fare: Number(baseFare.toFixed(2)),
      distance_charge: Number(distanceCharge.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      tax_percentage: taxPercentage,
      tax_amount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      currency: pricing.currency,
      // Nuevos campos para ida y vuelta
      total_distance_km: Number(totalDistanceInKm.toFixed(2)),
      is_round_trip: isRoundTrip,
      one_way_distance_km: Number(oneWayDistanceInKm.toFixed(2))
    };
  }

  /**
   * Método de conveniencia para calcular el precio directamente desde coordenadas
   */
  public async calculatePriceFromCoordinates(
    origin: Coordinates, 
    destination: Coordinates, 
    pricing: VehiclePricing,
    serviceType: ServiceType = 'one_way'
  ): Promise<{ routeInfo: RouteInfo, priceBreakdown: PriceBreakdown }> {
    try {
      const routeInfo = await this.calculateRoute(origin, destination);
      const priceBreakdown = this.calculatePrice(routeInfo, pricing, serviceType);
      
      return {
        routeInfo,
        priceBreakdown
      };
    } catch (error) {
      console.error("Error al calcular el precio desde coordenadas:", error);
      throw error;
    }
  }

  /**
   * Formatea un precio para mostrar con la moneda correspondiente
   */
  public formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  }

  /**
   * Formatea la distancia de manera legible
   */
  public formatDistance(kilometers: number): string {
    return `${kilometers.toFixed(1)} km`;
  }
}

// Exportar una instancia del servicio
export const priceCalculationService = new PriceCalculationService(); 