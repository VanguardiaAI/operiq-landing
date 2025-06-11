"""
Modelos para las colecciones de reservas en MongoDB.
Incluye:
- reservations (principal)
- reservation_incidents
- reservation_changes
- communication_logs
"""

from pymongo import MongoClient, GEOSPHERE
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Referencia global a las colecciones (se inicializarán en setup_collections)
reservations_collection = None
reservation_incidents_collection = None
reservation_changes_collection = None
communication_logs_collection = None


def setup_collections(db):
    """Inicializa las colecciones y crea los índices necesarios"""
    global reservations_collection, reservation_incidents_collection
    global reservation_changes_collection, communication_logs_collection

    # Inicializar colecciones
    reservations_collection = db['reservations']
    reservation_incidents_collection = db['reservation_incidents']
    reservation_changes_collection = db['reservation_changes']
    communication_logs_collection = db['communication_logs']

    # Crear índices
    reservations_collection.create_index("code", unique=True)
    reservations_collection.create_index("user_id")
    reservations_collection.create_index("status")
    reservations_collection.create_index([("pickup.coordinates", GEOSPHERE)])
    reservations_collection.create_index([("dropoff.coordinates", GEOSPHERE)])
    reservations_collection.create_index("created_at")
    reservations_collection.create_index("pickup.date")
    
    reservation_incidents_collection.create_index("reservation_id")
    reservation_incidents_collection.create_index("type")
    reservation_incidents_collection.create_index("status")
    reservation_incidents_collection.create_index("priority")

    reservation_changes_collection.create_index("reservation_id")
    reservation_changes_collection.create_index("changed_at")

    communication_logs_collection.create_index("reservation_id")
    communication_logs_collection.create_index("sent_at")
    communication_logs_collection.create_index(["sender.type", "sender.id"])
    communication_logs_collection.create_index(["recipient.type", "recipient.id"])


# Funciones de utilidad para validación

def validate_reservation(data):
    """Valida los datos de una reserva antes de insertar o actualizar"""
    required_fields = [
        "code", "user_id", "service_type", "status",
        "pickup", "passengers", "payment"
    ]
    
    for field in required_fields:
        if field not in data:
            return False, f"Campo requerido faltante: {field}"
    
    # Validar campos anidados obligatorios
    if "pickup" in data:
        if not all(k in data["pickup"] for k in ["location", "date"]):
            return False, "Los campos location y date son obligatorios en pickup"
    
    if "dropoff" in data and data["service_type"] != "hourly":
        if "location" not in data["dropoff"]:
            return False, "El campo location es obligatorio en dropoff"
    
    if "payment" in data:
        if not all(k in data["payment"] for k in ["method", "status", "amount", "currency"]):
            return False, "Faltan campos requeridos en payment"
    
    # Validar que service_type sea uno de los valores permitidos
    allowed_service_types = ["one_way", "round_trip", "hourly", "full_day"]
    if data.get("service_type") not in allowed_service_types:
        return False, f"service_type debe ser uno de: {', '.join(allowed_service_types)}"
    
    # Validar que status sea uno de los valores permitidos
    allowed_statuses = ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]
    if data.get("status") not in allowed_statuses:
        return False, f"status debe ser uno de: {', '.join(allowed_statuses)}"
    
    return True, "Validación exitosa"


def validate_incident(data):
    """Valida los datos de un incidente antes de insertar o actualizar"""
    required_fields = [
        "reservation_id", "type", "description", "reported_by", "status", "priority"
    ]
    
    for field in required_fields:
        if field not in data:
            return False, f"Campo requerido faltante: {field}"
    
    # Validar reported_by
    if "reported_by" in data:
        if not all(k in data["reported_by"] for k in ["type", "id"]):
            return False, "Los campos type e id son obligatorios en reported_by"
    
    # Validar que type sea uno de los valores permitidos
    allowed_types = ["delay", "technical_issue", "special_request", "cancellation", "change", "complaint", "other"]
    if data.get("type") not in allowed_types:
        return False, f"type debe ser uno de: {', '.join(allowed_types)}"
    
    # Validar que status sea uno de los valores permitidos
    allowed_statuses = ["pending", "in_progress", "resolved"]
    if data.get("status") not in allowed_statuses:
        return False, f"status debe ser uno de: {', '.join(allowed_statuses)}"
    
    # Validar que priority sea uno de los valores permitidos
    allowed_priorities = ["low", "medium", "high"]
    if data.get("priority") not in allowed_priorities:
        return False, f"priority debe ser uno de: {', '.join(allowed_priorities)}"
    
    return True, "Validación exitosa"


def validate_change(data):
    """Valida los datos de un cambio antes de insertar"""
    required_fields = [
        "reservation_id", "field_changed", "old_value", "new_value", "requested_by"
    ]
    
    for field in required_fields:
        if field not in data:
            return False, f"Campo requerido faltante: {field}"
    
    # Validar requested_by
    if "requested_by" in data:
        if not all(k in data["requested_by"] for k in ["type", "id"]):
            return False, "Los campos type e id son obligatorios en requested_by"
    
    # Validar que requested_by.type sea uno de los valores permitidos
    allowed_requester_types = ["client", "admin", "system", "driver"]
    if data.get("requested_by", {}).get("type") not in allowed_requester_types:
        return False, f"requested_by.type debe ser uno de: {', '.join(allowed_requester_types)}"
    
    return True, "Validación exitosa"


def validate_communication_log(data):
    """Valida los datos de un registro de comunicación antes de insertar"""
    required_fields = [
        "reservation_id", "type", "direction", "sender", "recipient", "content", "sent_at"
    ]
    
    for field in required_fields:
        if field not in data:
            return False, f"Campo requerido faltante: {field}"
    
    # Validar sender y recipient
    for field in ["sender", "recipient"]:
        if field in data:
            if not all(k in data[field] for k in ["type", "id"]):
                return False, f"Los campos type e id son obligatorios en {field}"
    
    # Validar que type sea uno de los valores permitidos
    allowed_types = ["email", "sms", "call", "chat", "push", "whatsapp"]
    if data.get("type") not in allowed_types:
        return False, f"type debe ser uno de: {', '.join(allowed_types)}"
    
    # Validar que direction sea uno de los valores permitidos
    allowed_directions = ["outgoing", "incoming"]
    if data.get("direction") not in allowed_directions:
        return False, f"direction debe ser uno de: {', '.join(allowed_directions)}"
    
    # Validar que status sea uno de los valores permitidos
    if "status" in data:
        allowed_statuses = ["sent", "delivered", "read", "failed"]
        if data.get("status") not in allowed_statuses:
            return False, f"status debe ser uno de: {', '.join(allowed_statuses)}"
    
    return True, "Validación exitosa"


# Funciones para generar ID de reserva
def generate_reservation_code():
    """Genera un código único para una reserva en formato 'B1001'"""
    # Buscar el último código utilizado
    last_reservation = reservations_collection.find_one(
        sort=[("code", -1)]
    )
    
    if last_reservation and "code" in last_reservation:
        try:
            # Extraer el número del código y aumentarlo en 1
            last_number = int(last_reservation["code"][1:])
            new_number = last_number + 1
        except (ValueError, IndexError):
            # Si hay error al parsear, empezar desde 1001
            new_number = 1001
    else:
        # Si no hay reservas previas, empezar desde 1001
        new_number = 1001
    
    return f"B{new_number}"


# Ejemplo de documento para cada colección (para documentación)

RESERVATION_EXAMPLE = {
    "_id": ObjectId(),
    "code": "B1001",                      # Código público
    "user_id": ObjectId(),                # Cliente
    "service_type": "one_way",            # "one_way", "round_trip", "hourly"
    "status": "pending",                  # "pending", "confirmed", "in_progress", "completed", "cancelled"
    "pickup": {
        "location": "Aeropuerto Madrid Barajas T4",
        "coordinates": [-3.5675, 40.4839],  # [longitud, latitud]
        "date": datetime.utcnow(),       # Fecha y hora programada
    },
    "dropoff": {
        "location": "Hotel Ritz Madrid",
        "coordinates": [-3.6922, 40.4168],
        "estimated_date": datetime.utcnow(),  # Estimación de llegada
    },
    "route_id": ObjectId(),               # Opcional, referencia a ruta fija
    "vehicle_id": ObjectId(),             # Opcional, vehículo asignado
    "driver_id": ObjectId(),              # Opcional, conductor asignado
    "collaborator_id": ObjectId(),        # Opcional, empresa colaboradora
    "passengers": 2,                      # Número de pasajeros
    "luggage": "2 maletas",               # Detalles de equipaje
    "special_notes": "Cliente VIP",       # Notas especiales
    "special_requests": ["Agua embotellada", "Asistencia con equipaje"],
    "payment": {
        "method": "credit_card",          # "credit_card", "transfer", etc.
        "status": "pending",              # "pending", "completed", "failed"
        "amount": 150.00,                 # Importe total
        "currency": "EUR",                # "EUR", "USD", etc.
    },
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow(),
    "created_by": ObjectId(),             # Usuario admin que creó la reserva
    "status_indicators": ["vip"],         # ["delayed", "changed", etc.]
    "estimated_duration": 45,             # En minutos
    "actual_pickup_time": None,           # Hora real de recogida
    "actual_dropoff_time": None,          # Hora real de llegada
}

INCIDENT_EXAMPLE = {
    "_id": ObjectId(),
    "reservation_id": ObjectId(),
    "type": "delay",                     # "delay", "technical_issue", "special_request", etc.
    "description": "El vuelo del cliente llega con retraso",
    "reported_by": {
        "type": "driver",                # "driver", "client", "admin"
        "id": ObjectId()                 # ID del usuario que reportó
    },
    "status": "pending",                 # "pending", "in_progress", "resolved"
    "priority": "medium",                # "low", "medium", "high"
    "created_at": datetime.utcnow(),
    "resolved_at": None,
    "resolution": None,
    "impact": "Retraso en servicio",     # Impacto en el servicio
    "compensation": None                 # Compensación si aplica
}

CHANGE_EXAMPLE = {
    "_id": ObjectId(),
    "reservation_id": ObjectId(),
    "field_changed": "pickup.date",      # Campo modificado
    "old_value": datetime(2023, 6, 15, 14, 30),  # Valor anterior
    "new_value": datetime(2023, 6, 15, 16, 0),   # Nuevo valor
    "change_reason": "Retraso en vuelo",  # Motivo del cambio
    "requested_by": {
        "type": "client",                # "client", "admin", "system", "driver"
        "id": ObjectId()
    },
    "approved_by": ObjectId(),           # Usuario que aprobó el cambio
    "changed_at": datetime.utcnow(),
    "notified": True                     # Si el cliente fue notificado
}

COMMUNICATION_LOG_EXAMPLE = {
    "_id": ObjectId(),
    "reservation_id": ObjectId(),
    "type": "email",                     # "email", "sms", "call", "chat"
    "direction": "outgoing",             # "outgoing", "incoming"
    "sender": {
        "type": "system",                # "client", "driver", "admin", "system"
        "id": ObjectId()
    },
    "recipient": {
        "type": "client",                # "client", "driver", "admin"
        "id": ObjectId()
    },
    "content": "Confirmación de reserva enviada",  # Contenido o resumen
    "sent_at": datetime.utcnow(),
    "status": "sent",                    # "sent", "delivered", "read", "failed"
    "related_to": "confirmación"         # Asunto relacionado
} 