import axiosInstance from '@/config/axios';
import { io, Socket } from "socket.io-client";

// Tipos para las notificaciones
export interface Notification {
  id: string;
  type: 'support_message' | 'new_booking' | 'booking_canceled' | 'payment_success' | 'payment_failed' | 'driver_issue' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;   // ID del objeto relacionado (conversación, reserva, etc.)
  relatedType?: string; // Tipo del objeto relacionado
  icon?: string;        // Icono a mostrar (opcional)
  actionUrl?: string;   // URL a la que redireccionar al hacer clic
}

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const SOCKET_URL = API_URL;

// Singleton para socket
let socket: Socket | null = null;
const notificationCallbacks: Set<(notification: Notification) => void> = new Set();

/**
 * Servicio para gestionar las notificaciones del sistema
 */
export const notificationService = {
  // Inicializar socket para comunicaciones en tiempo real
  initSocket: (): Socket => {
    if (!socket) {
      socket = io(`${SOCKET_URL}/admin`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });
      
      console.log('[NotificationService] Iniciando conexión socket para notificaciones');
      
      socket.on('connect', () => {
        console.log('[NotificationService] Conexión establecida:', socket?.id);
        
        // Unirse a canal de admin al conectar
        if (socket) {
          socket.emit('join_admin_channel', { adminId: localStorage.getItem('adminId') || 'unknown' });
        }
      });
      
      socket.on('connect_error', (err: Error) => {
        console.error('[NotificationService] Error de conexión socket:', err);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('[NotificationService] Socket desconectado:', reason);
      });
      
      // Escuchar nuevas notificaciones
      socket.on('new_notification', (data: Notification) => {
        console.log('[NotificationService] Nueva notificación recibida:', data);
        
        // Mostrar notificación del navegador si está permitido
        if (Notification && Notification.permission === "granted") {
          try {
            // Crear título basado en el tipo de notificación
            let title = "Nueva notificación";
            if (data.type === 'support_message') title = "Nuevo mensaje de soporte";
            if (data.type === 'new_booking') title = "Nueva reserva";
            
            const notification = new Notification(title, {
              body: data.message,
              icon: '/favicon.ico'
            });
            
            // Al hacer clic, llevar a la página correspondie nte
            if (data.actionUrl) {
              notification.onclick = () => {
                window.focus();
                window.location.href = data.actionUrl || '';
              };
            }
          } catch (error) {
            console.error('[NotificationService] Error al mostrar notificación:', error);
          }
        }
        
        // Notificar a todos los callbacks registrados
        notificationCallbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('[NotificationService] Error en callback de notificación:', error);
          }
        });
      });
    }
    
    return socket;
  },
  
  // Solicitar permiso para notificaciones del navegador
  requestNotificationPermission: async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log('[NotificationService] Este navegador no soporta notificaciones');
      return false;
    }
    
    try {
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return true;
    } catch (error) {
      console.error('[NotificationService] Error al solicitar permiso de notificaciones:', error);
      return false;
    }
  },
  
  // Cerrar conexión de socket
  closeSocket: () => {
    if (socket) {
      if (socket.connected) {
        socket.disconnect();
      }
      socket = null;
      console.log('[NotificationService] Conexión socket cerrada');
      notificationCallbacks.clear();
    }
  },
  
  // Suscribirse a nuevas notificaciones
  onNewNotification: (callback: (notification: Notification) => void): void => {
    notificationService.initSocket();
    notificationCallbacks.add(callback);
  },
  
  // Cancelar suscripción a notificaciones
  offNewNotification: (callback?: (notification: Notification) => void): void => {
    if (callback) {
      notificationCallbacks.delete(callback);
    } else {
      notificationCallbacks.clear();
    }
  },
  
  /**
   * Obtener todas las notificaciones del usuario administrador
   */
  getNotifications: async (page: number = 1, limit: number = 20, unreadOnly: boolean = false): Promise<{ notifications: Notification[], total: number, unread: number }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unreadOnly: unreadOnly ? 'true' : 'false'
      });
      
      const response = await axiosInstance.get(`/api/notifications?${params}`);
      return response.data;
    } catch (error) {
      console.error('[NotificationService] Error al obtener notificaciones:', error);
      throw error;
    }
  },
  
  /**
   * Marcar una notificación como leída
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('[NotificationService] Error al marcar notificación como leída:', error);
      throw error;
    }
  },
  
  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead: async (): Promise<{ success: boolean, count: number }> => {
    try {
      const response = await axiosInstance.put(`/api/notifications/read-all`);
      return response.data;
    } catch (error) {
      console.error('[NotificationService] Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  },
  
  /**
   * Eliminar una notificación
   */
  deleteNotification: async (notificationId: string): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('[NotificationService] Error al eliminar notificación:', error);
      throw error;
    }
  },
  
  /**
   * Eliminar todas las notificaciones
   */
  deleteAllNotifications: async (): Promise<{ success: boolean, count: number }> => {
    try {
      const response = await axiosInstance.delete(`/api/notifications/all`);
      return response.data;
    } catch (error) {
      console.error('[NotificationService] Error al eliminar todas las notificaciones:', error);
      throw error;
    }
  },
  
  /**
   * Obtener el contador de notificaciones no leídas
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get(`/api/notifications/unread-count`);
      return response.data.count;
    } catch (error) {
      console.error('[NotificationService] Error al obtener contador de no leídas:', error);
      throw error;
    }
  }
};

export default notificationService; 