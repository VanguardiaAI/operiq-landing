from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from flask_socketio import emit, join_room, leave_room
from dateutil import parser
from bson import ObjectId
from routes.notifications import create_support_notification

# Crear blueprint para las rutas de soporte
support_bp = Blueprint("support", __name__)

# Obtener referencias a las colecciones en MongoDB (en producción)
def setup_collections(db):
    global support_conversations_collection, support_messages_collection
    support_conversations_collection = db['support_conversations']
    support_messages_collection = db['support_messages']

# Lista para mantener conexiones WebSocket activas (para notificaciones en tiempo real)
active_connections = []

# Función para emitir notificación de nuevo mensaje via WebSocket
def notify_new_message(message_data):
    """Emitir notificación de nuevo mensaje a través de WebSocket"""
    from app import socketio
    
    try:
        # Obtener información importante del mensaje
        conversation_id = message_data['conversationId']
        sender_is_admin = message_data['sender'].get('isAdmin', False)
        sender_name = message_data['sender']['name']
        message_content = message_data['message']
        
        print(f"[SUPPORT_API] Enviando mensaje de {'admin' if sender_is_admin else 'usuario'} a conversación {conversation_id}")
        print(f"[SUPPORT_API] Contenido: '{message_content[:30]}{'...' if len(message_content) > 30 else ''}'")
        
        # Preparar datos para el evento WebSocket
        notification_data = {
            'conversationId': conversation_id,
            'message': {
                'id': message_data['id'],
                'senderId': message_data['sender']['id'],
                'senderName': sender_name,
                'isAdmin': sender_is_admin,
                'message': message_content,
                'timestamp': message_data['timestamp']
            }
        }
        
        # 1. Emitir al canal general de notificaciones
        print(f"[SUPPORT_API] Emitiendo evento 'new_support_message' a namespace '/support'")
        socketio.emit('new_support_message', notification_data, namespace='/support')
        
        # 2. Emitir específicamente a canal de esa conversación
        conversation_event = f'conversation:{conversation_id}'
        print(f"[SUPPORT_API] Emitiendo evento '{conversation_event}' a namespace '/support'")
        socketio.emit(conversation_event, notification_data, namespace='/support')
        
        # 3. Emitir mensaje en formato alternativo (para compatibilidad)
        print(f"[SUPPORT_API] Emitiendo formato alternativo a sala '{conversation_id}'")
        socketio.emit(conversation_event, {'message': message_data}, namespace='/support', room=conversation_id)
        
        # 4. Emitir mensajes a la sala específica
        print(f"[SUPPORT_API] Emitiendo mensaje directo a sala '{conversation_id}'")
        socketio.emit('new_message', notification_data, namespace='/support', room=conversation_id)
        
        # 5. Si el mensaje es de un cliente, crear notificación para administradores
        if not sender_is_admin:
            print(f"[SUPPORT_API] Creando notificación para administradores")
            create_support_notification(
                conversation_id=conversation_id,
                user_name=sender_name,
                message_preview=message_content
            )
        
        print(f"[SUPPORT_API] Mensaje enviado correctamente")
        
    except Exception as e:
        print(f"[SUPPORT_API] Error al emitir mensaje WebSocket: {str(e)}")

# Función para notificar sobre nueva conversación
def notify_new_conversation(conversation_data):
    """Emitir notificación de nueva conversación a través de WebSocket"""
    from app import socketio
    
    try:
        conversation_id = conversation_data['id']
        print(f"[SUPPORT_API] Enviando notificación de nueva conversación: {conversation_id}")
        
        socketio.emit('new_support_conversation', {
            'conversation': conversation_data
        }, namespace='/support')
        
        print(f"[SUPPORT_API] Notificación de nueva conversación enviada")
    except Exception as e:
        print(f"[SUPPORT_API] Error al notificar nueva conversación: {str(e)}")

# DECLARACIÓN DE TODAS LAS RUTAS DEL BLUEPRINT
@support_bp.route("/conversations", methods=["GET"])
def get_conversations():
    """Obtener todas las conversaciones de soporte"""
    try:
        # Obtener todas las conversaciones de la base de datos
        conversations_cursor = support_conversations_collection.find().sort("updatedAt", -1)
        conversations_list = list(conversations_cursor)
        
        # Convertir ObjectId a string para la serialización JSON
        for conv in conversations_list:
            if '_id' in conv and isinstance(conv['_id'], ObjectId):
                conv['_id'] = str(conv['_id'])
            
            # Si no tiene un ID convencional, usar _id
            if 'id' not in conv:
                conv['id'] = conv.get('_id')
        
        return jsonify(conversations_list)
    except Exception as e:
        print(f"[SUPPORT_API] Error al obtener conversaciones: {str(e)}")
        return jsonify({"error": "Error al obtener conversaciones"}), 500

@support_bp.route("/conversations/<conversation_id>", methods=["GET"])
def get_conversation(conversation_id):
    """Obtener una conversación específica"""
    try:
        # Buscar conversación por ID
        conversation = support_conversations_collection.find_one({"id": conversation_id})
        
        # Si no se encuentra, verificar si el ID es un ObjectId
        if not conversation and ObjectId.is_valid(conversation_id):
            conversation = support_conversations_collection.find_one({"_id": ObjectId(conversation_id)})
        
        if not conversation:
            return jsonify({"error": "Conversación no encontrada"}), 404
        
        # Convertir ObjectId a string para serialización JSON
        if '_id' in conversation and isinstance(conversation['_id'], ObjectId):
            conversation['_id'] = str(conversation['_id'])
        
        # Asegurar que tenga un ID convencional
        if 'id' not in conversation:
            conversation['id'] = conversation.get('_id')
        
        return jsonify(conversation)
    except Exception as e:
        print(f"[SUPPORT_API] Error al obtener conversación: {str(e)}")
        return jsonify({"error": "Error al obtener conversación"}), 500

@support_bp.route("/conversations", methods=["POST"])
def create_conversation():
    """Iniciar una nueva conversación de soporte"""
    try:
        data = request.json
        
        if not data or not data.get("name") or not data.get("email"):
            return jsonify({"error": "Se requieren nombre y email"}), 400
        
        conversation_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        # Crear nueva conversación
        new_conversation = {
            "id": conversation_id,
            "_id": conversation_id,
            "title": f"Soporte para {data['name']}",
            "userId": f"user-{conversation_id[:8]}",
            "userName": data["name"],
            "userEmail": data["email"],
            "userType": data.get("userType", "individual"),
            "companyName": data.get("companyName"),
            "userAvatar": data.get("avatar"),
            "lastMessage": {
                "message": "Hola, ¿en qué podemos ayudarte?",
                "timestamp": current_time,
                "isAdmin": True,
                "senderId": "admin",
                "senderName": "Soporte Privyde"
            },
            "unreadCount": 0,
            "status": "open",
            "priority": "medium",
            "category": "general",
            "createdAt": current_time,
            "updatedAt": current_time,
            "source": data.get("source", "web")
        }
        
        # Crear primer mensaje de bienvenida
        welcome_message = {
            "id": str(uuid.uuid4()),
            "_id": str(uuid.uuid4()),
            "conversationId": conversation_id,
            "message": "Hola, ¿en qué podemos ayudarte?",
            "timestamp": current_time,
            "sender": {
                "id": "admin",
                "name": "Soporte Privyde",
                "isAdmin": True
            },
            "recipient": {
                "id": new_conversation["userId"],
                "name": data["name"],
                "email": data["email"]
            },
            "read": True,
            "status": "open",
            "category": "general",
            "source": data.get("source", "web")
        }
        
        # Guardar conversación y mensaje en la base de datos
        support_conversations_collection.insert_one(new_conversation)
        support_messages_collection.insert_one(welcome_message)
        
        # Notificar a los administradores sobre la nueva conversación
        notify_new_conversation(new_conversation)
        
        return jsonify({"conversationId": conversation_id, "message": "Conversación iniciada exitosamente"})
    except Exception as e:
        print(f"[SUPPORT_API] Error al crear conversación: {str(e)}")
        return jsonify({"error": "Error al crear conversación"}), 500

@support_bp.route("/conversations/<conversation_id>/messages", methods=["GET"])
def get_conversation_messages(conversation_id):
    """Obtener todos los mensajes de una conversación"""
    try:
        # Obtener parámetro 'after' de la query string (opcional)
        after_timestamp = request.args.get('after', None)
        
        # Construir el filtro para la consulta
        query = {"conversationId": conversation_id}
        
        # Si se proporciona after_timestamp, filtrar solo mensajes posteriores
        if after_timestamp:
            try:
                # Convertir marca de tiempo a objeto datetime para comparación
                after_datetime = parser.parse(after_timestamp)
                
                # Agregar condición de timestamp al filtro
                query["timestamp"] = {"$gt": after_datetime.isoformat()}
                
                print(f"[SUPPORT_API] Filtrando mensajes después de {after_timestamp}")
            except Exception as e:
                print(f"[SUPPORT_API] Error al procesar timestamp: {str(e)}")
        
        # Ejecutar la consulta
        messages_cursor = support_messages_collection.find(query).sort("timestamp", 1)
        messages_list = list(messages_cursor)
        
        # Convertir ObjectId a string para serialización JSON
        for msg in messages_list:
            if '_id' in msg and isinstance(msg['_id'], ObjectId):
                msg['_id'] = str(msg['_id'])
            
            # Asegurar que tenga un ID convencional
            if 'id' not in msg:
                msg['id'] = msg.get('_id')
        
        print(f"[SUPPORT_API] Encontrados {len(messages_list)} mensajes")
        return jsonify(messages_list)
    except Exception as e:
        print(f"[SUPPORT_API] Error al obtener mensajes: {str(e)}")
        return jsonify({"error": "Error al obtener mensajes"}), 500

@support_bp.route("/messages", methods=["POST"])
def send_message():
    """Enviar un nuevo mensaje"""
    try:
        data = request.json
        
        if not data or not data.get("message") or not data.get("sender") or not data.get("conversationId"):
            return jsonify({"error": "Faltan datos requeridos para el mensaje"}), 400
        
        conversation_id = data["conversationId"]
        
        # Verificar si la conversación existe
        conversation = support_conversations_collection.find_one({"id": conversation_id})
        
        if not conversation:
            return jsonify({"error": "Conversación no encontrada"}), 404
        
        message_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Crear nuevo mensaje
        new_message = {
            "id": message_id,
            "_id": message_id,
            "conversationId": conversation_id,
            "message": data["message"],
            "timestamp": timestamp,
            "sender": {
                "id": data["sender"].get("id", "user" if not data["sender"].get("isAdmin") else "admin"),
                "name": data["sender"]["name"],
                "email": data["sender"].get("email", ""),  # Asegurar que email tenga valor por defecto
                "isAdmin": data["sender"].get("isAdmin", False)
            },
            "recipient": {
                "id": "admin" if not data["sender"].get("isAdmin") else conversation["userId"],
                "name": "Soporte Privyde" if not data["sender"].get("isAdmin") else conversation["userName"],
            },
            "read": False,
            "status": data.get("status", conversation["status"]),
            "category": data.get("category", conversation["category"]),
            "source": data.get("source", "web")
        }
        
        # Guardar mensaje en la base de datos
        support_messages_collection.insert_one(new_message)
        
        # Crear base para la actualización
        update_data = {
            "lastMessage": {
                "message": data["message"],
                "timestamp": timestamp,
                "isAdmin": data["sender"].get("isAdmin", False),
                "senderId": new_message["sender"]["id"],
                "senderName": new_message["sender"]["name"]
            },
            "updatedAt": timestamp
        }
        
        # Actualizar estado si se proporciona
        if data.get("status"):
            update_data["status"] = data["status"]
        
        # Primero, actualizar con $set
        support_conversations_collection.update_one(
            {"id": conversation_id},
            {"$set": update_data}
        )
        
        # Luego, incrementar contador de no leídos en operación separada si es mensaje del cliente
        if not data["sender"].get("isAdmin", False):
            support_conversations_collection.update_one(
                {"id": conversation_id},
                {"$inc": {"unreadCount": 1}}
            )
        
        # Imprimir mensaje para debug
        is_admin = data["sender"].get("isAdmin", False)
        sender_name = data["sender"]["name"]
        print(f"[SUPPORT_API] Recibido mensaje de {'administrador' if is_admin else 'usuario'} ({sender_name}): {data['message'][:30]}...")
        
        # Notificar a los destinatarios sobre el nuevo mensaje
        notify_new_message(new_message)
        
        return jsonify({"id": message_id, "timestamp": timestamp, "status": "sent"})
    except Exception as e:
        print(f"[SUPPORT_API] Error al enviar mensaje: {str(e)}")
        return jsonify({"error": "Error al enviar mensaje"}), 500

@support_bp.route("/conversations/<conversation_id>/read", methods=["PUT"])
def mark_as_read(conversation_id):
    """Marcar todos los mensajes de una conversación como leídos"""
    try:
        # Verificar si la conversación existe
        conversation = support_conversations_collection.find_one({"id": conversation_id})
        
        if not conversation:
            return jsonify({"error": "Conversación no encontrada"}), 404
        
        # Marcar mensajes como leídos
        support_messages_collection.update_many(
            {"conversationId": conversation_id, "read": False},
            {"$set": {"read": True}}
        )
        
        # Restablecer contador de no leídos
        support_conversations_collection.update_one(
            {"id": conversation_id},
            {"$set": {"unreadCount": 0}}
        )
        
        return jsonify({"status": "success", "message": "Mensajes marcados como leídos"})
    except Exception as e:
        print(f"[SUPPORT_API] Error al marcar mensajes como leídos: {str(e)}")
        return jsonify({"error": "Error al marcar mensajes como leídos"}), 500

@support_bp.route("/conversations/<conversation_id>/status", methods=["PUT"])
def update_conversation_status(conversation_id):
    """Actualizar el estado de una conversación"""
    try:
        data = request.json
        
        if not data or not data.get("status"):
            return jsonify({"error": "Se requiere el estado"}), 400
        
        valid_statuses = ["open", "in_progress", "resolved", "closed"]
        if data["status"] not in valid_statuses:
            return jsonify({"error": f"Estado no válido. Debe ser uno de: {valid_statuses}"}), 400
        
        # Verificar si la conversación existe
        conversation = support_conversations_collection.find_one({"id": conversation_id})
        
        if not conversation:
            return jsonify({"error": "Conversación no encontrada"}), 404
        
        # Actualizar estado
        support_conversations_collection.update_one(
            {"id": conversation_id},
            {
                "$set": {
                    "status": data["status"],
                    "updatedAt": datetime.now().isoformat()
                }
            }
        )
        
        return jsonify({"status": "success", "message": "Estado actualizado correctamente"})
    except Exception as e:
        print(f"[SUPPORT_API] Error al actualizar estado: {str(e)}")
        return jsonify({"error": "Error al actualizar estado"}), 500

@support_bp.route("/conversations/<conversation_id>/verify", methods=["GET"])
def verify_conversation(conversation_id):
    """Verificar si una conversación existe y es válida"""
    try:
        # Buscar conversación por ID
        conversation = support_conversations_collection.find_one({"id": conversation_id})
        
        if not conversation:
            return jsonify({
                "exists": False,
                "message": "La conversación no existe o ha sido eliminada"
            }), 404
        
        # Verificar si la conversación está cerrada o resuelta
        if conversation.get("status") in ["closed", "resolved"]:
            return jsonify({
                "exists": True,
                "valid": False,
                "status": conversation.get("status"),
                "message": f"La conversación está {conversation.get('status')}"
            })
        
        return jsonify({
            "exists": True,
            "valid": True,
            "status": conversation.get("status"),
            "message": "Conversación activa"
        })
    except Exception as e:
        print(f"[SUPPORT_API] Error al verificar conversación: {str(e)}")
        return jsonify({"error": "Error al verificar conversación"}), 500

@support_bp.route("/conversations/<conversation_id>/new-messages", methods=["GET"])
def get_new_messages(conversation_id):
    """Obtener solo los mensajes nuevos de una conversación después de un timestamp"""
    try:
        # Obtener timestamp desde el que se quieren mensajes
        since_timestamp = request.args.get('since', None)
        
        if not since_timestamp:
            return jsonify({"error": "Se requiere parámetro 'since' con timestamp"}), 400
        
        # Verificar si la conversación existe
        conversation = support_conversations_collection.find_one({"id": conversation_id})
        
        if not conversation:
            return jsonify({"error": "Conversación no encontrada"}), 404
        
        # Consultar mensajes posteriores al timestamp
        try:
            # Convertir timestamp a formato ISO
            since_datetime = parser.parse(since_timestamp)
            since_iso = since_datetime.isoformat()
            
            # Buscar mensajes posteriores
            query = {
                "conversationId": conversation_id,
                "timestamp": {"$gt": since_iso}
            }
            
            messages_cursor = support_messages_collection.find(query).sort("timestamp", 1)
            new_messages = list(messages_cursor)
            
            # Convertir ObjectId a string para serialización JSON
            for msg in new_messages:
                if '_id' in msg and isinstance(msg['_id'], ObjectId):
                    msg['_id'] = str(msg['_id'])
                
                # Asegurar que tenga un ID convencional
                if 'id' not in msg:
                    msg['id'] = msg.get('_id')
            
            print(f"[SUPPORT_API] Encontrados {len(new_messages)} mensajes nuevos desde {since_timestamp}")
            return jsonify(new_messages)
        except Exception as e:
            print(f"[SUPPORT_API] Error al procesar timestamp: {str(e)}")
            return jsonify({"error": f"Formato de timestamp inválido: {since_timestamp}"}), 400
    except Exception as e:
        print(f"[SUPPORT_API] Error al obtener mensajes nuevos: {str(e)}")
        return jsonify({"error": "Error al obtener mensajes nuevos"}), 500 