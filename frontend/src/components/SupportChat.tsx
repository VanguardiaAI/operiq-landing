import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import supportService, { SupportMessageDTO } from '../services/supportService';

interface SupportMessage {
  id: string;
  message: string;
  sender: {
    name: string;
    email: string;
    isAdmin?: boolean;
  };
  timestamp: string;
  pending?: boolean; // Indicador para mensajes pendientes de confirmación
  tempId?: string;   // ID temporal para relacionar mensajes locales con confirmaciones
  error?: boolean;   // Indicador de error al enviar
}

const SupportChat: React.FC = () => {
  // Estados para el chat
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [conversationStarted, setConversationStarted] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set()); // Para rastrear mensajes enviados
  const [conversationStatus, setConversationStatus] = useState<'active' | 'invalid' | 'nonexistent'>('active');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastPollingTimestampRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Test de conexión WebSocket para depuración
  useEffect(() => {
    // Iniciar un test de conexión al montar el componente
    const socket = supportService.initSocket();
    
    setSocketStatus('connecting');
    
    socket.on('connect', () => {
      console.log('[SupportChat] Socket conectado en montaje inicial, enviando test...');
      setSocketStatus('connected');
      
      // Enviar mensaje de prueba
      socket.emit('test_connection', { 
        clientTime: new Date().toISOString(),
        clientInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
    });
    
    socket.on('test_response', (data) => {
      console.log('[SupportChat] Respuesta a test recibida:', data);
    });
    
    socket.on('disconnect', () => {
      console.log('[SupportChat] Socket desconectado');
      setSocketStatus('disconnected');
    });
    
    return () => {
      socket.off('test_response');
    };
  }, []);

  // Validar formulario de inicio
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsFormValid(name.trim().length > 0 && emailRegex.test(email));
  }, [name, email]);

  // Cargar conversación existente si hay una en localStorage
  useEffect(() => {
    const savedConversationId = localStorage.getItem('supportConversationId');
    if (savedConversationId) {
      loadStoredUserInfo();
      // Verificar si la conversación sigue siendo válida
      verifyConversation(savedConversationId);
    }
  }, []);

  // Verificar si una conversación existe y es válida
  const verifyConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      console.log(`[SupportChat] Verificando estado de la conversación ${conversationId}`);
      
      const response = await supportService.verifyConversation(conversationId);
      
      if (!response.exists) {
        console.log('[SupportChat] La conversación ya no existe');
        setConversationStatus('nonexistent');
        setError('La conversación anterior ya no existe. Por favor inicia una nueva.');
        resetConversation();
        return;
      }
      
      if (!response.valid) {
        console.log(`[SupportChat] La conversación no es válida: ${response.status}`);
        setConversationStatus('invalid');
        setError(`La conversación anterior está ${response.status}. Por favor inicia una nueva.`);
        resetConversation();
        return;
      }
      
      // La conversación existe y es válida, cargarla
      console.log('[SupportChat] Conversación válida, cargando...');
      setConversationId(conversationId);
      setConversationStarted(true);
      setConversationStatus('active');
      loadConversationHistory(conversationId);
    } catch (error) {
      console.error('[SupportChat] Error al verificar conversación:', error);
      setError('No se pudo verificar la conversación. Por favor inicia una nueva.');
      resetConversation();
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reiniciar el estado del chat
  const resetConversation = () => {
    localStorage.removeItem('supportConversationId');
    setConversationId(null);
    setConversationStarted(false);
    setMessages([]);
    
    // Detener polling si está activo
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Implementar polling para garantizar recepción de mensajes (fallback principal)
  useEffect(() => {
    // Limpiar intervalo anterior si existe
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Solo iniciar polling si hay una conversación activa
    if (!conversationId || conversationStatus !== 'active') return;
    
    console.log('[SupportChat] Iniciando polling de mensajes');
    
    // Función para verificar nuevos mensajes
    const checkNewMessages = async () => {
      try {
        if (!conversationId) return;
        
        // Determinar desde qué timestamp buscar mensajes nuevos
        let lastTimestamp;
        
        if (messages.length > 0) {
          // Usar el timestamp del último mensaje confirmado (no pendiente)
          const confirmedMessages = messages.filter(m => !m.pending);
          if (confirmedMessages.length > 0) {
            lastTimestamp = confirmedMessages[confirmedMessages.length - 1].timestamp;
          }
        }
        
        // Si no hay timestamp, usar el último usado en polling o un timestamp muy antiguo
        if (!lastTimestamp) {
          lastTimestamp = lastPollingTimestampRef.current || new Date(0).toISOString();
        }
        
        console.log(`[SupportChat] Buscando mensajes más recientes que ${new Date(lastTimestamp).toLocaleTimeString()}`);
        
        // Solicitar solo mensajes nuevos directamente del endpoint optimizado
        const newMessages = await supportService.getNewMessages(conversationId, lastTimestamp);
        lastPollingTimestampRef.current = new Date().toISOString();
        
        if (newMessages.length > 0) {
          console.log(`[SupportChat] Polling encontró ${newMessages.length} mensajes nuevos`);
          
          // Transformar mensajes al formato del componente
          const formattedNewMessages = newMessages.map((msg: any) => ({
            id: msg.id || msg._id,
            message: msg.message,
            sender: {
              name: msg.sender?.name || 'Usuario',
              email: msg.sender?.email || '',
              isAdmin: msg.sender?.isAdmin || false
            },
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          
          // Verificar que no estemos añadiendo duplicados usando ID o contenido+remitente
          updateMessagesWithoutDuplicates(formattedNewMessages);
          
          // Reproducir sonido o notificación si está implementado
          if (!isOpen && formattedNewMessages.some(msg => msg.sender.isAdmin)) {
            console.log('[SupportChat] Nuevas respuestas del soporte recibidas mientras el chat está cerrado');
            // TODO: Implementar notificación visual/sonora
          }
        }
      } catch (error) {
        console.error('[SupportChat] Error en polling de mensajes:', error);
        
        // Si obtenemos un 404, la conversación ya no existe
        const err = error as any;
        if (err.response && err.response.status === 404) {
          console.log('[SupportChat] La conversación ya no existe en el servidor');
          setConversationStatus('nonexistent');
          setError('La conversación ya no existe. Por favor inicia una nueva.');
          resetConversation();
          return;
        }
      }
    };
    
    // Ejecutar inmediatamente y luego configurar intervalo cada 3 segundos
    checkNewMessages();
    pollingIntervalRef.current = setInterval(checkNewMessages, 3000);
    
    // Limpiar intervalo al desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('[SupportChat] Polling de mensajes detenido');
      }
    };
  }, [conversationId, messages, conversationStatus]);

  // Función para actualizar mensajes evitando duplicados
  const updateMessagesWithoutDuplicates = (newMsgs: SupportMessage[]) => {
    setMessages(prevMessages => {
      // Crear mapas para buscar duplicados por ID y por contenido+remitente+timestamp
      const existingIds = new Set(prevMessages.map(m => m.id));
      const existingTempIds = new Set(prevMessages.filter(m => m.tempId).map(m => m.tempId));
      const existingSignatures = new Set(
        prevMessages.map(m => `${m.message}|${m.sender.name}|${m.sender.isAdmin}`)
      );

      // Filtrar mensajes que no sean duplicados
      const uniqueNewMessages = newMsgs.filter(msg => {
        const messageSignature = `${msg.message}|${msg.sender.name}|${msg.sender.isAdmin}`;
        return !existingIds.has(msg.id) && 
               !existingTempIds.has(msg.id) && 
               !existingSignatures.has(messageSignature);
      });

      if (uniqueNewMessages.length > 0) {
        console.log('[SupportChat] Añadiendo mensajes nuevos a la UI:', uniqueNewMessages);
        
        // Actualizar mensajes pendientes si hay confirmaciones del servidor
        const updatedPrevMessages = prevMessages.map(msg => {
          if (msg.pending) {
            // Buscar si hay algún mensaje del servidor que coincida con este pendiente
            const serverConfirmation = uniqueNewMessages.find(
              newMsg => newMsg.message === msg.message && 
                       newMsg.sender.name === msg.sender.name &&
                       newMsg.sender.isAdmin === msg.sender.isAdmin
            );
            
            // Si encontramos confirmación, actualizar el mensaje pendiente
            if (serverConfirmation) {
              return {
                ...msg,
                id: serverConfirmation.id,
                pending: false,
                timestamp: serverConfirmation.timestamp
              };
            }
          }
          return msg;
        });
        
        // Filtrar los mensajes nuevos para quitar los que ya se han actualizado
        const filteredNewMessages = uniqueNewMessages.filter(newMsg => {
          return !updatedPrevMessages.some(
            updatedMsg => updatedMsg.id === newMsg.id
          );
        });
        
        // Combinar los mensajes actualizados con los nuevos filtrados
        const result = [...updatedPrevMessages, ...filteredNewMessages];
        
        // Ordenar por timestamp para mantener la secuencia correcta
        result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        // Actualizar sentMessageIds con los IDs de mensajes confirmados
        setSentMessageIds(prev => {
          const newSet = new Set(prev);
          uniqueNewMessages.forEach(msg => newSet.add(msg.id));
          return newSet;
        });
        
        // Hacer scroll al final
        setTimeout(scrollToBottom, 100);
        
        return result;
      }
      
      return prevMessages;
    });
  };

  // Scroll automático a los mensajes más recientes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Ya no usamos WebSockets como principal método, solo como complemento
  useEffect(() => {
    if (conversationId && conversationStatus === 'active') {
      console.log(`[SupportChat] Configurando escucha WebSocket para conversación: ${conversationId}`);
      
      // Inicializar el socket
      const socket = supportService.initSocket();
      
      // Unirse a la sala de conversación
      supportService.joinConversation(conversationId);
      
      // Limpiar suscripciones previas para evitar duplicados
      supportService.offNewMessage();
      
      // Suscribirse a mensajes generales (para compatibilidad)
      supportService.onNewMessage((data) => {
        if (data.conversationId === conversationId) {
          console.log('[SupportChat] Mensaje WebSocket recibido:', data);
          handleNewMessage(data);
        }
      });
      
      return () => {
        // Limpiar socket al desmontar
        console.log('[SupportChat] Limpiando suscripciones de socket...');
        supportService.offNewMessage();
      };
    }
  }, [conversationId, conversationStatus]);

  const loadStoredUserInfo = () => {
    const storedName = localStorage.getItem('supportUserName');
    const storedEmail = localStorage.getItem('supportUserEmail');
    
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  };

  const loadConversationHistory = async (conversationId: string) => {
    try {
      setIsLoading(true);
      console.log(`[SupportChat] Cargando historial de mensajes para conversación ${conversationId}`);
      const history = await supportService.getConversationMessages(conversationId);
      
      // Transformar los mensajes al formato del componente
      const formattedMessages = history.map((msg: any) => ({
        id: msg.id || msg._id,
        message: msg.message,
        sender: {
          name: msg.sender?.name || 'Usuario',
          email: msg.sender?.email || '',
          isAdmin: msg.sender?.isAdmin || false
        },
        timestamp: msg.timestamp || new Date().toISOString()
      }));
      
      console.log(`[SupportChat] Historial cargado: ${formattedMessages.length} mensajes`);
      
      // Actualizar sentMessageIds con todos los mensajes del historial
      const newSentIds = new Set(formattedMessages.map(msg => msg.id));
      setSentMessageIds(newSentIds);
      
      // Guardar el timestamp del mensaje más reciente para comenzar el polling desde ahí
      if (formattedMessages.length > 0) {
        const sortedMessages = [...formattedMessages].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        lastPollingTimestampRef.current = sortedMessages[0].timestamp;
      }
      
      setMessages(formattedMessages);
      setError(null);
    } catch (error) {
      console.error('[SupportChat] Error al cargar historial:', error);
      
      // Si obtenemos un 404, la conversación ya no existe
      const err = error as any;
      if (err.response && err.response.status === 404) {
        setConversationStatus('nonexistent');
        setError('La conversación ya no existe. Por favor inicia una nueva.');
        resetConversation();
      } else {
        setError('No se pudo cargar el historial de conversación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (messageData: any) => {
    console.log('[SupportChat] Mensaje recibido por WebSocket:', messageData);
    
    try {
      // Extraer el ID del mensaje (manejar diferentes formatos)
      const messageId = 
        messageData.message?.id || 
        (messageData.message?.message?.id) || 
        `ws-${Date.now()}`;
      
      // Verificar si ya tenemos este mensaje (por ID)
      if (sentMessageIds.has(messageId)) {
        console.log('[SupportChat] Mensaje ya procesado, ignorando:', messageId);
        return;
      }
      
      let newMsg: SupportMessage;
      
      // Manejar diferentes formatos de datos que puede enviar el servidor
      if (messageData.message && typeof messageData.message === 'object') {
        // Formato 1: {message: {id, senderId, senderName, isAdmin, message, timestamp}}
        if (messageData.message.id && messageData.message.message) {
          newMsg = {
            id: messageData.message.id,
            message: messageData.message.message,
            sender: {
              name: messageData.message.senderName || 'Soporte',
              email: '',
              isAdmin: messageData.message.isAdmin
            },
            timestamp: messageData.message.timestamp || new Date().toISOString()
          };
        } 
        // Formato 2: {message: {...datos completos del mensaje}}
        else if (messageData.message.sender) {
          newMsg = {
            id: messageData.message.id || messageData.message._id || `ws-${Date.now()}`,
            message: messageData.message.message,
            sender: {
              name: messageData.message.sender.name || 'Soporte',
              email: messageData.message.sender.email || '',
              isAdmin: messageData.message.sender.isAdmin || false
            },
            timestamp: messageData.message.timestamp || new Date().toISOString()
          };
        } else {
          console.error('[SupportChat] Formato de mensaje no reconocido:', messageData);
          return;
        }
      } else {
        console.error('[SupportChat] Formato de mensaje no válido:', messageData);
        return;
      }
      
      // Actualizar los mensajes evitando duplicados
      updateMessagesWithoutDuplicates([newMsg]);
      
      // Notificar al usuario si el chat está cerrado
      if (!isOpen && newMsg.sender.isAdmin) {
        console.log('[SupportChat] Nuevo mensaje de soporte recibido mientras el chat está cerrado');
        // Aquí se podría implementar una notificación visual/sonora
      }
    } catch (error) {
      console.error('[SupportChat] Error al procesar mensaje:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Guardar información del usuario en localStorage
      localStorage.setItem('supportUserName', name);
      localStorage.setItem('supportUserEmail', email);
      
      // Iniciar conversación con el backend
      const response = await supportService.startConversation({ name, email });
      
      // Guardar ID de conversación
      if (response && response.conversationId) {
        localStorage.setItem('supportConversationId', response.conversationId);
        setConversationId(response.conversationId);
        
        // Unirse a la sala de la conversación (para WebSocket)
        supportService.joinConversation(response.conversationId);
        
        // Actualizar estado
        setConversationStarted(true);
        setConversationStatus('active');
        
        // Cargar mensajes iniciales si hay
        await loadConversationHistory(response.conversationId);
      }
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
      setError('No se pudo iniciar la conversación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || conversationStatus !== 'active') return;
    
    try {
      const tempId = `temp-${Date.now()}`;
      const messageText = newMessage.trim();
      
      // Agregar mensaje a la interfaz inmediatamente como "pendiente"
      const userMessage: SupportMessage = {
        id: tempId,
        tempId: tempId, // Para poder relacionarlo con la confirmación del servidor
        message: messageText,
        sender: {
          name,
          email,
          isAdmin: false
        },
        timestamp: new Date().toISOString(),
        pending: true // Marcar como pendiente hasta confirmación del servidor
      };
      
      // Limpiar el input antes de enviar
      setNewMessage('');
      
      // Agregar mensaje pendiente a la UI
      setMessages(prev => [...prev, userMessage]);
      scrollToBottom();
      
      // Enviar mensaje al backend
      const messageData: SupportMessageDTO = {
        message: messageText,
        sender: {
          name,
          email,
          isAdmin: false
        },
        conversationId
      };
      
      const response = await supportService.sendMessage(messageData);
      console.log('[SupportChat] Mensaje enviado con éxito, respuesta:', response);
      
      // Actualizar el mensaje pendiente con la confirmación del servidor
      if (response && response.id) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { 
                  ...msg, 
                  id: response.id, 
                  pending: false,
                  timestamp: response.timestamp || msg.timestamp
                }
              : msg
          )
        );
        
        // Agregar el ID confirmado a los mensajes enviados
        setSentMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.add(response.id);
          return newSet;
        });
        
        // Limpiar cualquier error previo
        setError(null);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Manejar diferentes tipos de errores
      const err = error as any;
      
      if (err.response && err.response.status === 404) {
        setConversationStatus('nonexistent');
        setError('La conversación ya no existe. Por favor inicia una nueva.');
        resetConversation();
      } else {
        setError('No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.');
        
        // Marcar el mensaje como fallido en la UI
        setMessages(prev => 
          prev.map(msg => 
            msg.pending && msg.message === newMessage.trim()
              ? { ...msg, error: true }
              : msg
          )
        );
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  // Renderizar estado de conversación cerrada o inválida
  const renderConversationStatus = () => {
    if (conversationStatus === 'nonexistent' || conversationStatus === 'invalid') {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg mb-4">
          <AlertCircle className="text-black mb-2" size={24} />
          <p className="text-sm text-center text-gray-700">
            {conversationStatus === 'nonexistent' 
              ? 'La conversación anterior ya no existe.' 
              : 'La conversación anterior ha sido cerrada.'}
          </p>
          <p className="text-sm text-center text-gray-700 mt-1">
            Por favor inicia una nueva conversación.
          </p>
          <button
            onClick={resetConversation}
            className="mt-3 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm"
          >
            Iniciar nueva conversación
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón para abrir el chat */}
      <button
        onClick={toggleChat}
        className="bg-black hover:bg-gray-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center relative"
        aria-label="Soporte"
      >
        <MessageSquare size={24} />
        {/* Indicador de estado del socket */}
        <span 
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
            socketStatus === 'connected' ? 'bg-gray-600' : 
            socketStatus === 'connecting' ? 'bg-gray-500' : 'bg-gray-1000'
          }`}
          aria-label={`Estado de conexión: ${socketStatus}`}
        ></span>
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          style={{ height: '480px', maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Cabecera del chat */}
          <div className="bg-black text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">Soporte Privyde</h3>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido del chat */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {renderConversationStatus()}
            
            {!conversationStarted ? (
              // Formulario inicial para obtener nombre y email
              <div className="flex flex-col space-y-4">
                <p className="text-gray-700">
                  Para iniciar una conversación con nuestro equipo de soporte, por favor proporciona los siguientes datos:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-gray-500"
                      placeholder="Tu nombre"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-gray-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-black text-sm">{error}</p>
                )}
                
                <button
                  onClick={startConversation}
                  disabled={!isFormValid || isLoading}
                  className={`mt-2 w-full py-2 px-4 rounded-md text-white font-medium ${
                    isFormValid && !isLoading
                      ? 'bg-black hover:bg-gray-800' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Iniciando...
                    </span>
                  ) : (
                    'Iniciar conversación'
                  )}
                </button>
              </div>
            ) : (
              // Mensajes de la conversación
              <div className="space-y-4">
                {isLoading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 size={24} className="animate-spin text-gray-600" />
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender.isAdmin ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            msg.sender.isAdmin
                              ? 'bg-gray-200 text-gray-800'
                              : msg.pending 
                                ? 'bg-red-400 text-white' // Color más claro para mensajes pendientes
                                : msg.error
                                  ? 'bg-red-300 text-white border border-gray-500' // Estilo para mensajes con error
                                  : 'bg-black text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold">
                              {msg.sender.isAdmin ? 'Soporte Privyde' : 'Tú'}
                            </span>
                            <div className="flex items-center ml-2">
                              {msg.pending && (
                                <Loader2 size={10} className="animate-spin mr-1" aria-label="Enviando..." />
                              )}
                              {msg.error && (
                                <AlertCircle size={10} className="text-gray-800 mr-1" aria-label="Error al enviar" />
                              )}
                              <span className="text-xs opacity-75">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                          {msg.error && (
                            <div className="mt-1 flex justify-end">
                              <button 
                                onClick={() => sendMessage()} 
                                className="text-xs text-gray-800 bg-white bg-opacity-30 rounded px-2 py-0.5"
                              >
                                Reintentar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Elemento invisible para scroll */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Input para enviar mensajes (solo visible si la conversación ha comenzado y está activa) */}
          {conversationStarted && conversationStatus === 'active' && (
            <div className="border-t border-gray-200 p-3 bg-white">
              {error && (
                <p className="text-black text-xs mb-1">{error}</p>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-md ${
                    newMessage.trim()
                      ? 'bg-black hover:bg-gray-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportChat; 