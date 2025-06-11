import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Check, 
  X, 
  ChevronDown, 
  MessageSquare,
  User,
  Users,
  Clock,
  SendHorizonal,
  RefreshCw
} from "lucide-react";
import axios from "axios";
import supportService, { SupportMessageDTO } from "@/services/supportService";

// Definir tipos para los mensajes de soporte
interface SupportMessage {
  id: string;
  conversationId: string;
  subject: string;
  message: string;
  sender: {
    id: string;
    name: string;
    role: 'client' | 'driver' | 'admin' | 'system' | 'collaborator';
    userType?: 'individual' | 'company';
    companyName?: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    name: string;
    role: 'client' | 'driver' | 'admin' | 'system' | 'collaborator';
    userType?: 'individual' | 'company';
    companyName?: string;
    avatar?: string;
  };
  timestamp: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  read: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'booking' | 'payment' | 'complaint' | 'feedback' | 'driver' | 'other';
  source: 'web' | 'app_client' | 'app_driver' | 'email' | 'internal';
}

interface Conversation {
  id: string;
  title: string;
  participants: {
    id: string;
    name: string;
    role: 'client' | 'driver' | 'admin' | 'system' | 'collaborator';
    userType?: 'individual' | 'company';
    companyName?: string;
    avatar?: string;
  }[];
  lastMessage: {
    message: string;
    timestamp: string;
    sender: {
      id: string;
      name: string;
      role: 'client' | 'driver' | 'admin' | 'system' | 'collaborator';
      userType?: 'individual' | 'company';
    };
  };
  unreadCount: number;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'booking' | 'payment' | 'complaint' | 'feedback' | 'driver' | 'other';
  created: string;
  updated: string;
  source: 'web' | 'app_client' | 'app_driver' | 'email' | 'internal';
}

// Componente para mostrar el estado de un mensaje
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  );
};

// Componente para mostrar la prioridad de un mensaje
const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Componente para mostrar la fuente del mensaje
const SourceBadge = ({ source }: { source: string }) => {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'web':
        return 'bg-indigo-100 text-indigo-800';
      case 'app_client':
        return 'bg-blue-100 text-blue-800';
      case 'app_driver':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-purple-100 text-purple-800';
      case 'internal':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'web':
        return 'Web';
      case 'app_client':
        return 'App Cliente';
      case 'app_driver':
        return 'App Conductor';
      case 'email':
        return 'Email';
      case 'internal':
        return 'Interno';
      default:
        return source;
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(source)}`}>
      {getSourceLabel(source)}
    </span>
  );
};

// Componente para mostrar el tipo de usuario
const UserTypeBadge = ({ userType, companyName }: { userType?: string, companyName?: string }) => {
  if (!userType) return null;
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${
      userType === 'company' ? 'bg-violet-100 text-violet-800' : 'bg-teal-100 text-teal-800'
    }`}>
      {userType === 'company' ? `Empresa${companyName ? ': ' + companyName : ''}` : 'Particular'}
    </span>
  );
};

// Componente principal
interface SupportSectionProps {
  selectedConversationId?: string | null;
}

const SupportSection: React.FC<SupportSectionProps> = ({ selectedConversationId }) => {
  // Estados para gestionar la interfaz
  const [activeView, setActiveView] = useState<'inbox' | 'conversation'>('inbox');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, SupportMessage[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Nuevos estados para manejar el tiempo real
  const [socketConnected, setSocketConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollingTimestampRef = useRef<string | null>(null);

  // API URL base
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Inicializar Socket para comunicación en tiempo real
  useEffect(() => {
    // Inicializar socket
    const socket = supportService.initSocket();

    socket.on('connect', () => {
      console.log("[SupportSection] Socket conectado correctamente");
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log("[SupportSection] Socket desconectado");
      setSocketConnected(false);
    });

    // Limpiar al desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Cargar conversaciones al inicio y periódicamente
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setLoadingError(null);
    try {
      const response = await axios.get(`${API_URL}/support/conversations`);
      console.log("Conversaciones obtenidas:", response.data);
      
      // Transformar los datos al formato esperado por el componente
      const formattedConversations: Conversation[] = response.data.map((conv: any) => ({
        id: conv._id || conv.id,
        title: conv.title || "Sin título",
      participants: [
        {
            id: conv.userId || "user-id",
            name: conv.userName || "Usuario",
            role: 'client',
            userType: conv.userType || "individual",
            companyName: conv.companyName,
            avatar: conv.userAvatar
          },
          {
            id: "admin",
          name: "Soporte Operiq",
            role: 'admin',
          avatar: "https://ui-avatars.com/api/?name=Soporte+Operiq&background=f44336&color=fff"
        }
      ],
      lastMessage: {
          message: conv.lastMessage?.message || "Sin mensajes",
          timestamp: conv.lastMessage?.timestamp || new Date().toISOString(),
        sender: {
            id: conv.lastMessage?.senderId || "user-id",
            name: conv.lastMessage?.senderName || "Usuario",
            role: conv.lastMessage?.isAdmin ? 'admin' : 'client',
          userType: "individual"
        }
      },
        unreadCount: conv.unreadCount || 0,
        status: conv.status || "open",
        priority: conv.priority || "medium",
        category: conv.category || "general",
        created: conv.createdAt || new Date().toISOString(),
        updated: conv.updatedAt || new Date().toISOString(),
        source: conv.source || "web"
      }));
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
      setLoadingError("No se pudieron cargar las conversaciones. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [API_URL]);

  // Seleccionar conversación automáticamente cuando se recibe un ID desde las notificaciones
  useEffect(() => {
    if (selectedConversationId && conversations.length > 0) {
      console.log(`[SupportSection] Seleccionando conversación automáticamente: ${selectedConversationId}`);
      
      // Buscar la conversación por ID
      const conversation = conversations.find(c => c.id === selectedConversationId);
      
      if (conversation) {
        // Seleccionar la conversación encontrada
        handleSelectConversation(conversation);
      } else {
        console.warn(`[SupportSection] No se encontró la conversación con ID: ${selectedConversationId}`);
      }
    }
  }, [selectedConversationId, conversations]);

  // Cargar mensajes de una conversación
  const fetchMessagesForConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await axios.get(`${API_URL}/support/conversations/${conversationId}/messages`);
      console.log(`Mensajes para conversación ${conversationId}:`, response.data);
      
      // Transformar los datos al formato esperado por el componente
      const formattedMessages: SupportMessage[] = response.data.map((msg: any) => ({
        id: msg._id || msg.id,
        conversationId: conversationId,
        subject: msg.subject || "Sin asunto",
        message: msg.message,
        sender: {
          id: msg.sender?.id || "sender-id",
          name: msg.sender?.name || "Usuario",
          role: msg.sender?.isAdmin ? 'admin' : 'client',
          userType: msg.sender?.userType || "individual",
          companyName: msg.sender?.companyName,
          avatar: msg.sender?.avatar
        },
        recipient: {
          id: msg.recipient?.id || "recipient-id",
          name: msg.recipient?.name || "Soporte Operiq",
          role: msg.recipient?.isAdmin ? 'admin' : 'client',
          avatar: msg.recipient?.avatar
        },
        timestamp: msg.timestamp || new Date().toISOString(),
        attachments: msg.attachments,
        read: msg.read || false,
        status: msg.status || "open",
        priority: msg.priority || "medium",
        category: msg.category || "general",
        source: msg.source || "web"
      }));
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: formattedMessages
      }));
      
      return formattedMessages;
    } catch (error) {
      console.error(`Error al cargar mensajes para la conversación ${conversationId}:`, error);
      return [];
    }
  }, [API_URL]);

  // Función para implementar polling de mensajes como respaldo
  const startPollingMessages = (conversationId: string) => {
    // Detener polling anterior si existe
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    console.log(`[SupportSection] Iniciando polling para conversación ${conversationId}`);
    setIsPolling(true);
    
    // Función para verificar mensajes nuevos
    const checkNewMessages = async () => {
      try {
        // Determinar desde qué timestamp buscar
        let lastTimestamp;
        
        if (messages[conversationId] && messages[conversationId].length > 0) {
          // Usar el último mensaje de la conversación
          const msgList = [...messages[conversationId]].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          lastTimestamp = msgList[0].timestamp;
        } else {
          // Usar el último timestamp de polling o uno muy antiguo
          lastTimestamp = lastPollingTimestampRef.current || new Date(0).toISOString();
        }
        
        console.log(`[SupportSection] Buscando mensajes más recientes que ${new Date(lastTimestamp).toLocaleTimeString()}`);
        
        // Solicitar mensajes nuevos
        const newMessages = await supportService.getNewMessages(conversationId, lastTimestamp);
        lastPollingTimestampRef.current = new Date().toISOString();
        
        if (newMessages && newMessages.length > 0) {
          console.log(`[SupportSection] Polling encontró ${newMessages.length} mensajes nuevos`);
          
          // Transformar los datos al formato esperado por el componente
          const formattedMessages: SupportMessage[] = newMessages.map((msg: any) => ({
            id: msg._id || msg.id,
            conversationId: conversationId,
            subject: msg.subject || "Sin asunto",
            message: msg.message,
            sender: {
              id: msg.sender?.id || "sender-id",
              name: msg.sender?.name || "Usuario",
              role: msg.sender?.isAdmin ? 'admin' : 'client',
              userType: msg.sender?.userType || "individual",
              companyName: msg.sender?.companyName,
              avatar: msg.sender?.avatar
            },
            recipient: {
              id: msg.recipient?.id || "recipient-id",
              name: msg.recipient?.name || "Soporte Operiq",
              role: msg.recipient?.isAdmin ? 'admin' : 'client',
              avatar: msg.recipient?.avatar
            },
            timestamp: msg.timestamp || new Date().toISOString(),
            attachments: msg.attachments,
            read: msg.read || false,
            status: msg.status || "open",
            priority: msg.priority || "medium",
            category: msg.category || "general",
            source: msg.source || "web"
          }));
          
          // Actualizar mensajes, evitando duplicados
          setMessages(prev => {
            const currentMessages = prev[conversationId] || [];
            
            // Filtrar solo mensajes que no existan ya
            const newUniqueMessages = formattedMessages.filter(newMsg => 
              !currentMessages.some(existing => 
                existing.id === newMsg.id || 
                (existing.message === newMsg.message && 
                 existing.sender.name === newMsg.sender.name &&
                 Math.abs(new Date(existing.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 5000)
              )
            );
            
            if (newUniqueMessages.length === 0) {
              return prev; // No hay mensajes nuevos únicos
            }
            
            console.log('[SupportSection] Añadiendo nuevos mensajes a la UI:', newUniqueMessages);
            
            // Ordenar todos los mensajes por timestamp
            const allMessages = [...currentMessages, ...newUniqueMessages].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            return {
              ...prev,
              [conversationId]: allMessages
            };
          });
        }
      } catch (error) {
        console.error('[SupportSection] Error al hacer polling de mensajes:', error);
      }
    };
    
    // Ejecutar inmediatamente y configurar intervalo (cada 2 segundos en lugar de 3)
    checkNewMessages();
    pollingIntervalRef.current = setInterval(checkNewMessages, 2000);
  };

  // Configurar escucha de WebSocket para la conversación seleccionada
  useEffect(() => {
    if (selectedConversation && activeView === 'conversation') {
      console.log(`[SupportSection] Configurando escucha WebSocket para conversación: ${selectedConversation.id}`);
      
      // Inicializar socket (asegurarse de que esté conectado)
      const socket = supportService.initSocket();
      socket.connect();
      
      // Unirse a la sala de conversación
      supportService.joinConversation(selectedConversation.id);
      
      // Limpiar suscripciones previas para evitar duplicados
      supportService.offNewMessage();
      
      // Configurar escucha para nuevos mensajes de esta conversación
      const handleNewMessage = (data: any) => {
        console.log('[SupportSection] Nuevo mensaje recibido por WebSocket:', data);
        
        // Si el mensaje no es para esta conversación, ignorarlo
        if (!data || !data.conversationId || data.conversationId !== selectedConversation.id) {
          console.log('[SupportSection] Mensaje ignorado - no corresponde a la conversación actual');
          return;
        }
        
        // Extraer el mensaje según el formato
        let messageData;
        if (data.message && typeof data.message === 'object') {
          // Formato normal: data.message contiene el mensaje
          messageData = data.message;
        } else if (typeof data === 'object' && data.id) {
          // Formato alternativo: data es el mensaje directamente
          messageData = data;
        } else {
          console.error('[SupportSection] Formato de mensaje no reconocido:', data);
          return;
        }
        
        // Verificar que tengamos datos mínimos para procesar
        if (!messageData || !messageData.message) {
          console.error('[SupportSection] Mensaje sin contenido:', messageData);
          return;
        }
        
        // Construir objeto de mensaje según el formato disponible
        let newMsg: SupportMessage;
        
        // Formato 1: {message: {id, senderId, senderName, isAdmin, message, timestamp}}
        if (messageData.id && messageData.senderId) {
          newMsg = {
            id: messageData.id,
            conversationId: selectedConversation.id,
            subject: "Mensaje nuevo",
            message: messageData.message,
            sender: {
              id: messageData.senderId,
              name: messageData.senderName,
              role: messageData.isAdmin ? 'admin' : 'client',
              avatar: undefined
            },
            recipient: {
              id: messageData.isAdmin ? selectedConversation.participants[0].id : "admin",
              name: messageData.isAdmin ? selectedConversation.participants[0].name : "Soporte Operiq",
              role: messageData.isAdmin ? 'client' : 'admin'
            },
            timestamp: messageData.timestamp || new Date().toISOString(),
            read: true,
            status: selectedConversation.status,
            priority: selectedConversation.priority,
            category: selectedConversation.category,
            source: selectedConversation.source
          };
        } 
        // Formato 2: El mensaje completo está en data.message o es el propio data
        else if (typeof messageData === 'object' && (messageData.sender || messageData.message)) {
          const msg = messageData;
          newMsg = {
            id: msg.id || msg._id || `ws-${Date.now()}`,
            conversationId: selectedConversation.id,
            subject: msg.subject || "Sin asunto",
            message: msg.message,
            sender: {
              id: msg.sender?.id || "sender-id",
              name: msg.sender?.name || "Usuario",
              role: msg.sender?.isAdmin ? 'admin' : 'client',
              userType: msg.sender?.userType || "individual",
              companyName: msg.sender?.companyName,
              avatar: msg.sender?.avatar
            },
            recipient: {
              id: msg.recipient?.id || "recipient-id",
              name: msg.recipient?.name || "Soporte Operiq",
              role: msg.recipient?.isAdmin ? 'admin' : 'client',
              avatar: msg.recipient?.avatar
            },
            timestamp: msg.timestamp || new Date().toISOString(),
            attachments: msg.attachments,
            read: msg.read || false,
            status: msg.status || selectedConversation.status,
            priority: msg.priority || selectedConversation.priority,
            category: msg.category || selectedConversation.category,
            source: msg.source || selectedConversation.source
          };
        } else {
          console.error('[SupportSection] Formato de mensaje no procesable:', messageData);
          return;
        }
        
        // Verificar si ya tenemos este mensaje para evitar duplicados
        setMessages(prev => {
          const currentMessages = prev[selectedConversation.id] || [];
          
          // Verificar si ya existe este mensaje (por ID o contenido similar)
          const messageExists = currentMessages.some(m => 
            m.id === newMsg.id || 
            (m.message === newMsg.message && 
             m.sender.name === newMsg.sender.name &&
             Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 5000)
          );
          
          if (messageExists) {
            console.log('[SupportSection] Mensaje ignorado - ya existe en la conversación');
            return prev; // No actualizar si el mensaje ya existe
          }
          
          console.log('[SupportSection] Añadiendo nuevo mensaje vía WebSocket a la UI:', newMsg);
          
          // Ordenar mensajes por timestamp
          const allMessages = [...currentMessages, newMsg].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          // Actualizar con el nuevo mensaje
          return {
            ...prev,
            [selectedConversation.id]: allMessages
          };
        });
      };
      
      // Registrar callback para mensajes nuevos usando diferentes canales
      supportService.onNewMessage(handleNewMessage);
      supportService.onConversationMessage(selectedConversation.id, handleNewMessage);
      
      // Configurar canal específico manualmente
      socket.on(`conversation:${selectedConversation.id}`, handleNewMessage);
      socket.on('new_message', handleNewMessage);
      
      // Iniciar polling como respaldo
      startPollingMessages(selectedConversation.id);
      
      // Limpiar al cambiar de conversación
      return () => {
        supportService.offNewMessage();
        supportService.offConversationMessage(selectedConversation.id);
        socket.off(`conversation:${selectedConversation.id}`);
        socket.off('new_message');
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [selectedConversation, activeView]);

  // Efecto para cargar las conversaciones al inicio
  useEffect(() => {
    fetchConversations();
    
    // Configurar actualización periódica (cada 30 segundos)
    const intervalId = setInterval(fetchConversations, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  // Métodos para manejar las conversaciones
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setActiveView('conversation');
    
    // Cargar mensajes si no están cargados
    if (!messages[conversation.id] || messages[conversation.id].length === 0) {
      await fetchMessagesForConversation(conversation.id);
    }
    
    // Marcar mensajes como leídos
    if (messages[conversation.id]) {
      try {
        // Llamada al API para marcar como leídos
        await axios.put(`${API_URL}/support/conversations/${conversation.id}/read`);
        
      const updatedMessages = messages[conversation.id].map(msg => ({
        ...msg,
        read: true
      }));
      
      setMessages({
        ...messages,
        [conversation.id]: updatedMessages
      });
      
      // Actualizar contador de no leídos
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversation.id) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      } catch (error) {
        console.error("Error al marcar mensajes como leídos:", error);
      }
    }
  };

  const handleBackToInbox = () => {
    // Detener polling al volver al inbox
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
    
    setActiveView('inbox');
    setSelectedConversation(null);
    
    // Desuscribirse de eventos de socket
    supportService.offNewMessage();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    setIsSendingMessage(true);
    
    try {
      // Preparar mensaje para enviar al API
      const messageData: SupportMessageDTO = {
        message: newMessage.trim(),
        sender: {
          name: "Soporte Operiq",
          email: "soporte@operiq.com",
          isAdmin: true
        },
        conversationId: selectedConversation.id,
        category: selectedConversation.category,
        source: "web"
      };
      
      // Enviar mensaje al backend
      const response = await supportService.sendMessage(messageData);
      console.log("Mensaje enviado:", response);
      
      // Crear objeto de mensaje para UI
    const newMsg: SupportMessage = {
        id: response._id || response.id || `admin-${Date.now()}`,
      conversationId: selectedConversation.id,
      subject: `RE: ${selectedConversation.title}`,
        message: newMessage.trim(),
      sender: {
        id: "a1",
        name: "Soporte Operiq",
        role: "admin",
        avatar: "https://ui-avatars.com/api/?name=Soporte+Operiq&background=f44336&color=fff"
      },
      recipient: selectedConversation.participants.find(p => p.role !== 'admin') || {
        id: "",
        name: "",
        role: "client"
      },
      timestamp: new Date().toISOString(),
      read: true,
      status: "in_progress",
      priority: selectedConversation.priority,
      category: selectedConversation.category,
      source: "web"
    };
    
    // Actualizar mensajes
    const conversationMessages = messages[selectedConversation.id] || [];
    setMessages({
      ...messages,
      [selectedConversation.id]: [...conversationMessages, newMsg]
    });
    
    // Actualizar última actividad en la conversación
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          lastMessage: {
              message: newMessage.trim(),
            timestamp: new Date().toISOString(),
            sender: {
              id: "a1",
              name: "Soporte Operiq",
              role: "admin" as 'admin',
              userType: 'individual' as 'individual'
            }
          },
          status: "in_progress" as 'in_progress',
          updated: new Date().toISOString()
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setNewMessage("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      // Mostrar notificación de error
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateConversationStatus = async (conversationId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      // Llamada al API para actualizar estado
      await axios.put(`${API_URL}/support/conversations/${conversationId}/status`, { status: newStatus });
      
      // Actualizar estado de la conversación en la UI
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, status: newStatus };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    
    if (selectedConversation && selectedConversation.id === conversationId) {
      setSelectedConversation({ ...selectedConversation, status: newStatus });
      }
    } catch (error) {
      console.error("Error al actualizar estado de la conversación:", error);
      // Mostrar notificación de error
    }
  };

  const handleRefreshConversations = () => {
    fetchConversations();
  };
  
  // Función para refrescar manualmente los mensajes de la conversación actual
  const handleRefreshMessages = async () => {
    if (selectedConversation) {
      console.log(`[SupportSection] Refrescando mensajes para conversación ${selectedConversation.id}`);
      await fetchMessagesForConversation(selectedConversation.id);
    }
  };

  // Filtrado de conversaciones
  const filteredConversations = conversations.filter(conv => {
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || conv.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || conv.category === filterCategory;
    const matchesSource = filterSource === 'all' || conv.source === filterSource;
    const matchesUserType = filterUserType === 'all' || 
      conv.participants.some(p => p.role !== 'admin' && p.userType === filterUserType);
    const matchesSearch = searchQuery === '' || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (messages[conv.id] && messages[conv.id].some(m => 
        m.message.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSource && matchesUserType && matchesSearch;
  });

  // Renderizado de la UI
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {activeView === 'inbox' ? 'Soporte' : selectedConversation?.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeView === 'inbox' 
              ? 'Gestiona todas las conversaciones de soporte' 
              : `Conversación con ${selectedConversation?.participants.find(p => p.role !== 'admin')?.name}`}
          </p>
        </div>
        
        {activeView === 'inbox' ? (
          <Button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <PlusCircle size={18} className="mr-2" />
            Nueva conversación
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleBackToInbox}
              className="flex items-center"
            >
              Volver
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshMessages}
              className="flex items-center"
            >
              <RefreshCw size={16} className={`mr-1 ${isPolling ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              value={selectedConversation?.status}
              onChange={(e) => handleUpdateConversationStatus(
                selectedConversation?.id || "", 
                e.target.value as 'open' | 'in_progress' | 'resolved' | 'closed'
              )}
            >
              <option value="open">Abierto</option>
              <option value="in_progress">En proceso</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
        )}
      </div>
      
      {activeView === 'inbox' && (
        <>
          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center border rounded-lg bg-gray-50 px-3 py-2 flex-1">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar en soporte..." 
                  className="bg-transparent border-0 flex-1 focus:outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="open">Abierto</option>
                  <option value="in_progress">En proceso</option>
                  <option value="resolved">Resuelto</option>
                  <option value="closed">Cerrado</option>
                </select>
                
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
                
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  <option value="general">General</option>
                  <option value="technical">Técnico</option>
                  <option value="booking">Reservas</option>
                  <option value="payment">Pagos</option>
                  <option value="complaint">Quejas</option>
                  <option value="feedback">Sugerencias</option>
                  <option value="driver">Conductor</option>
                  <option value="other">Otros</option>
                </select>
                
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                >
                  <option value="all">Todas las fuentes</option>
                  <option value="web">Web</option>
                  <option value="app_client">App Cliente</option>
                  <option value="app_driver">App Conductor</option>
                  <option value="email">Email</option>
                  <option value="internal">Interno</option>
                </select>
                
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                >
                  <option value="all">Todos los tipos de usuario</option>
                  <option value="individual">Particulares</option>
                  <option value="company">Empresas</option>
                </select>
                
                <Button variant="outline" size="sm" className="flex items-center">
                  <RefreshCw size={16} className="mr-1" />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
          
          {/* Lista de conversaciones */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">No hay conversaciones</h3>
                <p className="text-gray-500 mt-1">No se encontraron conversaciones con los filtros actuales.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${conversation.unreadCount > 0 ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {conversation.participants.find(p => p.role !== 'admin')?.avatar ? (
                            <img 
                              src={conversation.participants.find(p => p.role !== 'admin')?.avatar} 
                              alt="Avatar" 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              <User size={20} />
                            </div>
                          )}
                          
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                          
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            conversation.participants.find(p => p.role !== 'admin')?.role === 'client' 
                              ? 'bg-blue-500' 
                              : conversation.participants.find(p => p.role !== 'admin')?.role === 'driver'
                                ? 'bg-green-500'
                                : 'bg-purple-500'
                          }`}></span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.participants.find(p => p.role !== 'admin')?.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 my-1">
                            <UserTypeBadge 
                              userType={conversation.participants.find(p => p.role !== 'admin')?.userType}
                              companyName={conversation.participants.find(p => p.role !== 'admin')?.companyName}
                            />
                            <SourceBadge source={conversation.source} />
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conversation.title}</p>
                          <p className="text-sm text-gray-700 truncate">{conversation.lastMessage.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={conversation.status} />
                        <PriorityBadge priority={conversation.priority} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {activeView === 'conversation' && selectedConversation && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-220px)]">
          {/* Información de la conversación */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {selectedConversation.participants.find(p => p.role !== 'admin')?.avatar ? (
                <img 
                  src={selectedConversation.participants.find(p => p.role !== 'admin')?.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User size={20} />
                </div>
              )}
              
              <div>
                <div className="flex items-center flex-wrap gap-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {selectedConversation.participants.find(p => p.role !== 'admin')?.name}
                  </h3>
                  <span className={`ml-2 w-2 h-2 rounded-full ${
                    selectedConversation.participants.find(p => p.role !== 'admin')?.role === 'client' 
                      ? 'bg-blue-500' 
                      : selectedConversation.participants.find(p => p.role !== 'admin')?.role === 'driver'
                        ? 'bg-green-500'
                        : 'bg-purple-500'
                  }`}></span>
                  <span className="text-xs text-gray-500 ml-2">
                    {selectedConversation.participants.find(p => p.role !== 'admin')?.role === 'client' 
                      ? 'Cliente' 
                      : selectedConversation.participants.find(p => p.role !== 'admin')?.role === 'driver'
                        ? 'Conductor'
                        : 'Colaborador'}
                  </span>
                  <UserTypeBadge 
                    userType={selectedConversation.participants.find(p => p.role !== 'admin')?.userType}
                    companyName={selectedConversation.participants.find(p => p.role !== 'admin')?.companyName}
                  />
                  <SourceBadge source={selectedConversation.source} />
                </div>
                <p className="text-xs text-gray-500">{selectedConversation.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <StatusBadge status={selectedConversation.status} />
              <PriorityBadge priority={selectedConversation.priority} />
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {selectedConversation.category.charAt(0).toUpperCase() + selectedConversation.category.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages[selectedConversation.id]?.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.sender.role === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-lg p-4 ${
                  message.sender.role === 'admin' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${message.sender.role === 'admin' ? 'text-white' : 'text-gray-900'}`}>
                      {message.sender.name}
                    </span>
                    <span className={`text-xs ${message.sender.role === 'admin' ? 'text-red-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${message.sender.role === 'admin' ? 'text-white' : 'text-gray-800'}`}>
                    {message.message}
                  </p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className={`text-xs flex items-center px-2 py-1 rounded ${
                            message.sender.role === 'admin' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span className="truncate">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Campo de entrada de mensajes */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <textarea 
                  placeholder="Escribe tu mensaje aquí..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()} 
                className="bg-red-600 hover:bg-red-700 text-white h-full"
              >
                <SendHorizonal size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportSection; 