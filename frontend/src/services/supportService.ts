import axios from "axios";
import { io, Socket } from "socket.io-client";

// Interfaces para la comunicación con la API
export interface SupportMessageDTO {
  id?: string;
  message: string;
  sender: {
    name: string;
    email: string;
    isAdmin?: boolean;
  };
  timestamp?: string;
  conversationId?: string;
  read?: boolean;
  category?: string;
  source?: string;
}

// Interfaces para WebSocket
export interface SupportSocketMessage {
  conversationId: string;
  message: {
    id: string;
    senderId: string;
    senderName: string;
    isAdmin: boolean;
    message: string;
    timestamp: string;
  };
}

export interface SupportSocketConversation {
  conversation: {
    id: string;
    title: string;
    userId: string;
    userName: string;
    status: string;
    unreadCount: number;
    updatedAt: string;
    [key: string]: any;
  };
}

// Interfaces para verificación de conversación
export interface ConversationVerificationResult {
  exists: boolean;
  valid?: boolean;
  status?: string;
  message?: string;
}

// Tipo para callbacks de eventos de WebSocket
export type MessageCallback = (message: SupportSocketMessage) => void;
export type ConversationCallback = (conversation: SupportSocketConversation) => void;

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SUPPORT_API_URL = `${API_URL}/support`;
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"; 

// Singleton para socket
let socket: Socket | null = null;
let socketConnected: boolean = false;
let messageCallbacks: Map<string, Set<MessageCallback>> = new Map();
let conversationCallbacks: Set<ConversationCallback> = new Set();
let generalMessageCallbacks: Set<MessageCallback> = new Set();

/**
 * Servicio para gestionar la comunicación con el soporte
 */
export const supportService = {
  // Inicializar socket para comunicaciones en tiempo real
  initSocket: (): Socket => {
    if (!socket) {
      socket = io(`${SOCKET_URL}/support`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });
      
      console.log('Iniciando conexión socket para soporte');
      
      socket.on('connect', () => {
        console.log('Conexión de soporte establecida con el servidor:', socket?.id);
        socketConnected = true;
        
        // Reestablecer suscripciones después de reconexión
        supportService._resubscribeAll();
      });
      
      socket.on('connect_error', (err: Error) => {
        console.error('Error de conexión socket:', err);
        socketConnected = false;
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Socket desconectado:', reason);
        socketConnected = false;
      });
      
      // Escuchar eventos de mensajes generales
      socket.on('new_support_message', (data: SupportSocketMessage) => {
        console.log('Nuevo mensaje recibido (general):', data);
        // Notificar a todos los callbacks registrados para mensajes generales
        generalMessageCallbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en callback de mensaje general:', error);
          }
        });
      });
    }
    
    return socket;
  },
  
  // Método interno para reestablecer todas las suscripciones
  _resubscribeAll: () => {
    if (!socket || !socketConnected) return;
    
    // Reestablecer salas de conversaciones
    messageCallbacks.forEach((_, conversationId) => {
      console.log(`Re-uniendo a conversación: ${conversationId}`);
      socket?.emit('join_conversation', { conversation_id: conversationId });
    });
  },
  
  // Cerrar conexión de socket
  closeSocket: () => {
    if (socket) {
      if (socket.connected) {
        socket.disconnect();
      }
      socket = null;
      socketConnected = false;
      console.log('Conexión socket cerrada');
      
      // Limpiar callbacks
      messageCallbacks.clear();
      conversationCallbacks.clear();
      generalMessageCallbacks.clear();
    }
  },
  
  // Unirse a una sala de conversación específica
  joinConversation: (conversationId: string): void => {
    const s = supportService.initSocket();
    s.emit('join_conversation', { conversation_id: conversationId });
    console.log(`Unido a la conversación: ${conversationId}`);
  },
  
  // Suscribirse a nuevos mensajes (general)
  onNewMessage: (callback: MessageCallback): void => {
    supportService.initSocket();
    generalMessageCallbacks.add(callback);
  },
  
  // Cancelar suscripción a mensajes generales
  offNewMessage: (callback?: MessageCallback): void => {
    if (callback) {
      generalMessageCallbacks.delete(callback);
    } else {
      generalMessageCallbacks.clear();
    }
  },
  
  // Suscribirse a nuevas conversaciones
  onNewConversation: (callback: ConversationCallback): void => {
    const s = supportService.initSocket();
    conversationCallbacks.add(callback);
    
    // Registrar el callback en el socket
    s.on('new_support_conversation', (data: SupportSocketConversation) => {
      console.log('Nueva conversación recibida:', data);
      callback(data);
    });
  },
  
  // Cancelar suscripción a conversaciones
  offNewConversation: (callback: ConversationCallback): void => {
    conversationCallbacks.delete(callback);
  },
  
  // Suscribirse a mensajes de una conversación específica
  onConversationMessage: (conversationId: string, callback: MessageCallback): void => {
    const s = supportService.initSocket();
    
    // Registrar el callback para esta conversación
    if (!messageCallbacks.has(conversationId)) {
      messageCallbacks.set(conversationId, new Set());
    }
    messageCallbacks.get(conversationId)?.add(callback);
    
    // Unirse manualmente a la sala de conversación 
    s.emit('join_conversation', { conversation_id: conversationId });
    
    // Configurar el listener para este canal de conversación
    const eventName = `conversation:${conversationId}`;
    
    // Evitar duplicados eliminando listeners previos
    s.off(eventName);
    
    // Registrar el nuevo listener
    s.on(eventName, (data: any) => {
      console.log(`[SupportService] Mensaje para conversación ${conversationId}:`, data);
      messageCallbacks.get(conversationId)?.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[SupportService] Error en callback de conversación ${conversationId}:`, error);
        }
      });
    });
    
    // También escuchar el canal de mensajes generales
    s.on('new_message', (data: any) => {
      // Sólo procesar mensajes para esta conversación
      if (data && data.conversationId === conversationId) {
        console.log(`[SupportService] Mensaje general para conversación ${conversationId}:`, data);
        messageCallbacks.get(conversationId)?.forEach(cb => {
          try {
            cb(data);
          } catch (error) {
            console.error(`[SupportService] Error en callback de mensaje general ${conversationId}:`, error);
          }
        });
      }
    });
  },
  
  // Cancelar suscripción a mensajes de una conversación
  offConversationMessage: (conversationId: string, callback?: MessageCallback): void => {
    if (callback && messageCallbacks.has(conversationId)) {
      // Eliminar un callback específico
      messageCallbacks.get(conversationId)?.delete(callback);
    } else if (!callback) {
      // Eliminar todos los callbacks para esta conversación
      messageCallbacks.delete(conversationId);
    }
  },
  
  /**
   * Enviar un mensaje de soporte
   */
  sendMessage: async (messageData: SupportMessageDTO): Promise<any> => {
    try {
      console.log("Enviando mensaje de soporte:", messageData);
      const response = await axios.post(`${SUPPORT_API_URL}/messages`, messageData);
      console.log("Respuesta del servidor:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al enviar mensaje de soporte:", error);
      throw error;
    }
  },

  /**
   * Iniciar una nueva conversación de soporte
   */
  startConversation: async (userData: { name: string; email: string }): Promise<any> => {
    try {
      console.log("Iniciando nueva conversación de soporte:", userData);
      const response = await axios.post(`${SUPPORT_API_URL}/conversations`, userData);
      console.log("Conversación iniciada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al iniciar conversación de soporte:", error);
      throw error;
    }
  },

  /**
   * Obtener el historial de mensajes de una conversación
   */
  getConversationMessages: async (conversationId: string, forceRefresh: boolean = false): Promise<any[]> => {
    try {
      // Generar una URL única con un parámetro timestamp para evitar caché del navegador si es necesario
      const url = forceRefresh 
        ? `${SUPPORT_API_URL}/conversations/${conversationId}/messages?t=${Date.now()}` 
        : `${SUPPORT_API_URL}/conversations/${conversationId}/messages`;
      
      console.log(`[SupportService] Obteniendo mensajes de conversación ${conversationId}${forceRefresh ? ' (forzando actualización)' : ''}`);
      const response = await axios.get(url);
      console.log(`[SupportService] ${response.data.length} mensajes recibidos`);
      return response.data;
    } catch (error) {
      console.error("[SupportService] Error al obtener mensajes de conversación:", error);
      throw error;
    }
  },
  
  /**
   * Obtener solo los mensajes nuevos (después de una marca de tiempo)
   */
  getNewMessages: async (conversationId: string, afterTimestamp: string): Promise<any[]> => {
    try {
      console.log(`[SupportService] Buscando mensajes nuevos después de ${afterTimestamp}`);
      const url = `${SUPPORT_API_URL}/conversations/${conversationId}/new-messages?since=${encodeURIComponent(afterTimestamp)}&t=${Date.now()}`;
      
      const response = await axios.get(url);
      console.log(`[SupportService] ${response.data.length} mensajes nuevos encontrados`);
      return response.data;
    } catch (error) {
      console.error("[SupportService] Error al obtener mensajes nuevos:", error);
      throw error;
    }
  },

  /**
   * Verificar si una conversación existe y es válida
   */
  verifyConversation: async (conversationId: string): Promise<ConversationVerificationResult> => {
    try {
      console.log(`[SupportService] Verificando conversación ${conversationId}`);
      const url = `${SUPPORT_API_URL}/conversations/${conversationId}/verify`;
      
      const response = await axios.get(url);
      console.log(`[SupportService] Verificación de conversación:`, response.data);
      return response.data;
    } catch (error) {
      console.error("[SupportService] Error al verificar conversación:", error);
      
      // Si obtenemos un 404, la conversación no existe
      const err = error as any;
      if (err.response && err.response.status === 404) {
        return {
          exists: false,
          message: "La conversación no existe o ha sido eliminada"
        };
      }
      
      throw error;
    }
  }
};

export default supportService; 