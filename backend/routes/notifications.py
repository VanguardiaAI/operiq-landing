from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import uuid

# Crear blueprint para las rutas de notificaciones
notifications_bp = Blueprint("notifications", __name__)

# Obtener referencias a las colecciones en MongoDB (en producción)
def setup_collections(db):
    global notifications_collection
    notifications_collection = db['admin_notifications']

# Función para emitir notificación via WebSocket
def emit_notification(notification_data):
    """Emitir notificación a través de WebSocket"""
    from app import socketio
    
    try:
        print(f"[NOTIFICATIONS_API] Enviando notificación: {notification_data['title']}")
        
        # Emitir al namespace /admin para todos los clientes
        socketio.emit('new_notification', notification_data, namespace='/admin')
        
        print(f"[NOTIFICATIONS_API] Notificación enviada correctamente")
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al emitir notificación WebSocket: {str(e)}")

# Función para crear una nueva notificación
def create_notification(type, title, message, related_id=None, related_type=None, icon=None, action_url=None):
    """Crear y guardar una nueva notificación"""
    try:
        notification_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Crear objeto de notificación
        notification = {
            "id": notification_id,
            "type": type,
            "title": title,
            "message": message,
            "timestamp": timestamp,
            "read": False,
            "relatedId": related_id,
            "relatedType": related_type,
            "icon": icon,
            "actionUrl": action_url
        }
        
        # Guardar en la base de datos
        notifications_collection.insert_one(notification)
        
        # Emitir vía WebSocket
        emit_notification(notification)
        
        return notification
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al crear notificación: {str(e)}")
        return None

# Función para crear notificación de soporte
def create_support_notification(conversation_id, user_name, message_preview):
    """Crear una notificación específica para mensajes de soporte"""
    return create_notification(
        type="support_message",
        title=f"Nuevo mensaje de {user_name}",
        message=message_preview[:100] + ('...' if len(message_preview) > 100 else ''),
        related_id=conversation_id,
        related_type="support_conversation",
        action_url=f"/admin/support?conversation={conversation_id}"
    )

# RUTAS DE LA API

@notifications_bp.route("", methods=["GET"])
def get_notifications():
    """Obtener todas las notificaciones con paginación"""
    try:
        # Obtener parámetros de paginación
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        unread_only = request.args.get('unreadOnly', 'false').lower() == 'true'
        
        # Construir filtro
        query = {}
        if unread_only:
            query["read"] = False
        
        # Calcular skip para paginación
        skip = (page - 1) * limit
        
        # Obtener total de notificaciones
        total = notifications_collection.count_documents(query)
        
        # Obtener total de no leídas
        unread_count = notifications_collection.count_documents({"read": False})
        
        # Obtener notificaciones con paginación
        notifications_cursor = notifications_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        notifications_list = list(notifications_cursor)
        
        # Convertir ObjectId a string para serialización JSON
        for notif in notifications_list:
            if '_id' in notif and isinstance(notif['_id'], ObjectId):
                notif['_id'] = str(notif['_id'])
        
        return jsonify({
            "notifications": notifications_list,
            "total": total,
            "unread": unread_count,
            "page": page,
            "limit": limit
        })
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al obtener notificaciones: {str(e)}")
        return jsonify({"error": "Error al obtener notificaciones"}), 500

@notifications_bp.route("/unread-count", methods=["GET"])
def get_unread_count():
    """Obtener contador de notificaciones no leídas"""
    try:
        # Contar notificaciones no leídas
        count = notifications_collection.count_documents({"read": False})
        
        return jsonify({"count": count})
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al obtener contador de no leídas: {str(e)}")
        return jsonify({"error": "Error al obtener contador de no leídas"}), 500

@notifications_bp.route("/<notification_id>/read", methods=["PUT"])
def mark_as_read(notification_id):
    """Marcar una notificación como leída"""
    try:
        # Actualizar estado de la notificación
        result = notifications_collection.update_one(
            {"id": notification_id},
            {"$set": {"read": True}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Notificación no encontrada"}), 404
        
        # Obtener la notificación actualizada
        notification = notifications_collection.find_one({"id": notification_id})
        
        # Convertir ObjectId a string para serialización JSON
        if notification and '_id' in notification and isinstance(notification['_id'], ObjectId):
            notification['_id'] = str(notification['_id'])
        
        return jsonify(notification)
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al marcar notificación como leída: {str(e)}")
        return jsonify({"error": "Error al marcar notificación como leída"}), 500

@notifications_bp.route("/read-all", methods=["PUT"])
def mark_all_as_read():
    """Marcar todas las notificaciones como leídas"""
    try:
        # Actualizar todas las notificaciones no leídas
        result = notifications_collection.update_many(
            {"read": False},
            {"$set": {"read": True}}
        )
        
        return jsonify({
            "success": True,
            "count": result.modified_count
        })
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al marcar todas como leídas: {str(e)}")
        return jsonify({"error": "Error al marcar todas como leídas"}), 500

@notifications_bp.route("/<notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    """Eliminar una notificación"""
    try:
        # Eliminar la notificación
        result = notifications_collection.delete_one({"id": notification_id})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Notificación no encontrada"}), 404
        
        return jsonify({"success": True})
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al eliminar notificación: {str(e)}")
        return jsonify({"error": "Error al eliminar notificación"}), 500

@notifications_bp.route("/all", methods=["DELETE"])
def delete_all_notifications():
    """Eliminar todas las notificaciones"""
    try:
        # Contar antes de eliminar para devolver el número eliminado
        count = notifications_collection.count_documents({})
        
        # Eliminar todas las notificaciones
        notifications_collection.delete_many({})
        
        return jsonify({
            "success": True,
            "count": count
        })
    except Exception as e:
        print(f"[NOTIFICATIONS_API] Error al eliminar todas las notificaciones: {str(e)}")
        return jsonify({"error": "Error al eliminar todas las notificaciones"}), 500 