import axiosInstance from '@/config/axios';

// Interfaces para las reservas
export interface BookingListItem {
  _id: string;
  code: string;
  clientName?: string;
  user_id?: string;
  pickup: {
    location: string;
    date: string;
    coordinates?: [number, number];
  };
  dropoff?: {
    location: string;
    estimated_date?: string;
    coordinates?: [number, number];
  };
  service_type: 'one_way' | 'round_trip' | 'hourly' | 'full_day';
  vehicle_id?: string;
  driver_id?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment: {
    amount: number;
    currency: string;
    method: string;
    status: string;
  };
  passengers: number;
  luggage?: string;
  special_notes?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales para la vista
  vehicleInfo?: {
    model: string;
    licensePlate: string;
  };
  driverInfo?: {
    name: string;
    phone?: string;
  };
  incidentHistory?: any[];
}

export interface BookingFilters {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface BookingsResponse {
  reservations: BookingListItem[];
  pagination: PaginationInfo;
}

// Función auxiliar para formatear fecha y hora
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
  
  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) return `Hoy, ${timeStr}`;
  if (isTomorrow) return `Mañana, ${timeStr}`;
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Función auxiliar para formatear el precio
const formatPrice = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency || 'EUR'
  }).format(amount);
};

class BookingService {
  /**
   * Obtiene todas las reservas con paginación y filtros
   */
  async getBookings(filters: BookingFilters = {}): Promise<BookingsResponse> {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros de consulta
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      const response = await axiosInstance.get(`/api/admin/bookings/list?${params.toString()}`);
      
      // Procesar las reservas para agregar información adicional necesaria para la vista
      const processedReservations = response.data.reservations.map((reservation: any) => ({
        ...reservation,
        // Formatear para la vista de tabla
        clientName: reservation.client_name || 'Cliente no especificado',
        date: formatDateTime(reservation.pickup.date),
        fromTo: `${reservation.pickup.location} → ${reservation.dropoff?.location || 'Por definir'}`,
        type: reservation.service_type,
        vehicle: reservation.vehicleInfo?.model || 'Pendiente asignar',
        driver: reservation.driverInfo?.name || 'Pendiente asignar',
        price: formatPrice(reservation.payment.amount, reservation.payment.currency),
        hasIncident: reservation.incidentHistory && reservation.incidentHistory.length > 0,
        incidentType: reservation.incidentHistory?.[0]?.type
      }));

      return {
        reservations: processedReservations,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una reserva específica por ID
   */
  async getBooking(bookingId: string): Promise<BookingListItem> {
    try {
      const response = await axiosInstance.get(`/api/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva reserva
   */
  async createBooking(bookingData: any): Promise<any> {
    try {
      const response = await axiosInstance.post(`/api/admin/bookings/create`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  }

  /**
   * Actualiza una reserva existente
   */
  async updateBooking(bookingId: string, bookingData: any): Promise<any> {
    try {
      const response = await axiosInstance.put(`/api/admin/bookings/${bookingId}/update`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una reserva
   */
  async updateBookingStatus(bookingId: string, status: string, additionalData?: any): Promise<any> {
    try {
      const payload = {
        status,
        ...additionalData
      };
      const response = await axiosInstance.put(`/api/admin/bookings/${bookingId}/status`, payload);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      throw error;
    }
  }

  /**
   * Elimina una reserva (solo para casos especiales)
   */
  async deleteBooking(bookingId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(`/api/admin/bookings/${bookingId}/delete`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      throw error;
    }
  }

  /**
   * Busca vehículos disponibles para una reserva
   */
  async searchAvailableVehicles(searchData: {
    pickup_address: string;
    pickup_date: string;
    pickup_time: string;
    estimated_duration?: number;
  }): Promise<any> {
    try {
      const response = await axiosInstance.post(`/api/admin/bookings/available-vehicles`, searchData);
      return response.data;
    } catch (error) {
      console.error('Error al buscar vehículos disponibles:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de reservas
   */
  async getBookingStats(): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/admin/bookings/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Return default stats if there's an error
      return {
        total: 0,
        active: 0,
        history: 0,
        today: 0,
        incidents: 0,
        by_status: {
          pending: 0,
          confirmed: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          no_show: 0
        }
      };
    }
  }

  /**
   * Cancela una reserva con motivo
   */
  async cancelBooking(bookingId: string, reason: string, notes?: string): Promise<any> {
    return this.updateBookingStatus(bookingId, 'cancelled', {
      reason,
      notes,
      by: 'admin'
    });
  }

  /**
   * Confirma una reserva
   */
  async confirmBooking(bookingId: string, notes?: string): Promise<any> {
    return this.updateBookingStatus(bookingId, 'confirmed', {
      notes,
      by: 'admin'
    });
  }

  /**
   * Marca una reserva como completada
   */
  async completeBooking(bookingId: string, data?: {
    rating?: number;
    notes?: string;
    actual_dropoff_time?: string;
  }): Promise<any> {
    return this.updateBookingStatus(bookingId, 'completed', {
      ...data,
      by: 'admin'
    });
  }
}

// Exportar una instancia única del servicio
export const bookingService = new BookingService();