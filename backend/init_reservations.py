from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pymongo.errors import BulkWriteError
import datetime
from bson import ObjectId
import random

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']

# Colecciones
reservations_collection = db['reservations']
reservation_incidents_collection = db['reservation_incidents']
reservation_changes_collection = db['reservation_changes']
communication_logs_collection = db['communication_logs']
users_collection = db['users']
vehicles_collection = db['vehicles']
drivers_collection = db['drivers']

# Borrar datos existentes
def reset_collections():
    print("Eliminando datos existentes...")
    reservations_collection.delete_many({})
    reservation_incidents_collection.delete_many({})
    reservation_changes_collection.delete_many({})
    communication_logs_collection.delete_many({})

# Obtener IDs de usuarios, vehículos y conductores existentes
def get_existing_ids():
    user_ids = [str(u["_id"]) for u in users_collection.find({}, {"_id": 1}).limit(10)]
    vehicle_ids = [str(v["_id"]) for v in vehicles_collection.find({}, {"_id": 1}).limit(10)]
    driver_ids = [str(d["_id"]) for d in drivers_collection.find({}, {"_id": 1}).limit(10)]
    
    # Si no hay datos existentes, usar IDs de ejemplo
    if not user_ids:
        user_ids = [str(ObjectId()) for _ in range(5)]
    if not vehicle_ids:
        vehicle_ids = [str(ObjectId()) for _ in range(5)]
    if not driver_ids:
        driver_ids = [str(ObjectId()) for _ in range(5)]
        
    return user_ids, vehicle_ids, driver_ids

# Generar ubicaciones de ejemplo
pickup_locations = [
    {
        "location": "Aeropuerto Madrid Barajas T4",
        "coordinates": [-3.5675, 40.4839]
    },
    {
        "location": "Estación de Atocha",
        "coordinates": [-3.6922, 40.4068]
    },
    {
        "location": "Hotel Palace Madrid",
        "coordinates": [-3.6956, 40.4158]
    },
    {
        "location": "Hotel Ritz Madrid",
        "coordinates": [-3.6922, 40.4168]
    },
    {
                    "location": "Oficina Central Privyde",
        "coordinates": [-3.7038, 40.4168]
    }
]

dropoff_locations = [
    {
        "location": "Hotel Four Seasons Madrid",
        "coordinates": [-3.7038, 40.4200]
    },
    {
        "location": "Centro de Convenciones IFEMA",
        "coordinates": [-3.6167, 40.4672]
    },
    {
        "location": "Estadio Santiago Bernabéu",
        "coordinates": [-3.6883, 40.4530]
    },
    {
        "location": "Aeropuerto Madrid Barajas T4",
        "coordinates": [-3.5675, 40.4839]
    },
    {
        "location": "Restaurante DiverXO",
        "coordinates": [-3.6790, 40.4577]
    }
]

# Generar reservas de ejemplo
def generate_reservations(user_ids, vehicle_ids, driver_ids):
    reservations_data = []
    now = datetime.datetime.utcnow()
    
    # Generar 20 reservas
    for i in range(1, 21):
        # Determinar estado y fechas según secuencia
        if i <= 5:  # Reservas completadas (pasadas)
            status = "completed"
            pickup_date = now - datetime.timedelta(days=random.randint(5, 20))
            created_at = pickup_date - datetime.timedelta(days=random.randint(3, 10))
        elif i <= 10:  # Reservas en progreso (hoy)
            status = "in_progress"
            pickup_date = now - datetime.timedelta(hours=random.randint(1, 5))
            created_at = pickup_date - datetime.timedelta(days=random.randint(1, 5))
        elif i <= 15:  # Reservas confirmadas (futuras)
            status = "confirmed"
            pickup_date = now + datetime.timedelta(days=random.randint(1, 7))
            created_at = now - datetime.timedelta(days=random.randint(1, 5))
        else:  # Reservas pendientes (futuras)
            status = "pending"
            pickup_date = now + datetime.timedelta(days=random.randint(2, 14))
            created_at = now - datetime.timedelta(days=random.randint(1, 3))
            
        # Asignar valores aleatorios de los arreglos
        user_id = random.choice(user_ids)
        vehicle_id = random.choice(vehicle_ids) if status != "pending" else None
        driver_id = random.choice(driver_ids) if status != "pending" else None
        pickup = random.choice(pickup_locations).copy()
        dropoff = random.choice(dropoff_locations).copy()
        pickup["date"] = pickup_date
        
        # Calcular fecha estimada de llegada (45-90 min después de la recogida)
        dropoff["estimated_date"] = pickup_date + datetime.timedelta(minutes=random.randint(45, 90))
        
        # Generar tipo de servicio
        service_type = random.choice(["one_way", "round_trip", "hourly", "full_day"])
        
        # Generar código de reserva
        code = f"B{1000 + i}"
        
        # Crear la reserva
        reservation = {
            "_id": ObjectId(),
            "code": code,
            "user_id": ObjectId(user_id),
            "service_type": service_type,
            "status": status,
            "pickup": pickup,
            "dropoff": dropoff,
            "vehicle_id": ObjectId(vehicle_id) if vehicle_id else None,
            "driver_id": ObjectId(driver_id) if driver_id else None,
            "passengers": random.randint(1, 4),
            "luggage": f"{random.randint(1, 3)} maletas",
            "special_notes": "Cliente VIP" if random.random() < 0.3 else "",
            "special_requests": random.sample(
                ["Agua embotellada", "Asistencia con equipaje", "WiFi", "Música clásica", "Asiento infantil"], 
                k=random.randint(0, 3)
            ),
            "payment": {
                "method": random.choice(["credit_card", "transfer", "cash", "invoice"]),
                "status": "completed" if status in ["completed", "in_progress"] else "pending",
                "amount": round(random.uniform(100, 500), 2),
                "currency": "EUR"
            },
            "created_at": created_at,
            "updated_at": created_at + datetime.timedelta(hours=random.randint(1, 24)),
            "created_by": ObjectId(random.choice(user_ids)),
            "status_indicators": ["vip"] if random.random() < 0.2 else [],
            "estimated_duration": random.randint(30, 120),
            "actual_pickup_time": pickup_date if status in ["in_progress", "completed"] else None,
            "actual_dropoff_time": dropoff["estimated_date"] if status == "completed" else None
        }
        
        # Añadir datos de colaborador para algunas reservas
        if random.random() < 0.3:
            reservation["collaborator_id"] = ObjectId()
            
        reservations_data.append(reservation)
    
    return reservations_data

# Generar incidentes para algunas reservas
def generate_incidents(reservations):
    incidents_data = []
    reporter_types = ["driver", "client", "admin"]
    incident_types = ["delay", "technical_issue", "special_request", "change", "complaint", "other"]
    priorities = ["low", "medium", "high"]
    
    # Crear incidentes para ~30% de las reservas
    for reservation in reservations:
        if random.random() < 0.3:
            # Decidir el número de incidentes (1-2)
            num_incidents = random.randint(1, 2)
            
            for _ in range(num_incidents):
                incident_type = random.choice(incident_types)
                reporter_type = random.choice(reporter_types)
                
                # Generar descripción según el tipo
                if incident_type == "delay":
                    description = "El vuelo del cliente llega con retraso"
                elif incident_type == "technical_issue":
                    description = "Problema técnico con el vehículo"
                elif incident_type == "special_request":
                    description = "Cliente solicita botella de champagne"
                elif incident_type == "change":
                    description = "Cambio en la hora de recogida solicitado"
                elif incident_type == "complaint":
                    description = "Cliente insatisfecho con la limpieza del vehículo"
                else:
                    description = "Situación imprevista durante el servicio"
                
                # Determinar estado del incidente según el estado de la reserva
                if reservation["status"] == "completed":
                    status = "resolved"
                    created_at = reservation["actual_dropoff_time"] - datetime.timedelta(minutes=random.randint(30, 120))
                    resolved_at = created_at + datetime.timedelta(minutes=random.randint(15, 60))
                    resolution = "Incidente resuelto satisfactoriamente"
                elif reservation["status"] == "in_progress":
                    status = random.choice(["pending", "in_progress"])
                    created_at = reservation["actual_pickup_time"] + datetime.timedelta(minutes=random.randint(5, 30))
                    resolved_at = None
                    resolution = None
                else:
                    status = "pending"
                    created_at = reservation["created_at"] + datetime.timedelta(hours=random.randint(1, 24))
                    resolved_at = None
                    resolution = None
                
                incidents_data.append({
                    "_id": ObjectId(),
                    "reservation_id": reservation["_id"],
                    "type": incident_type,
                    "description": description,
                    "reported_by": {
                        "type": reporter_type,
                        "id": reservation["driver_id"] if reporter_type == "driver" else (
                            reservation["user_id"] if reporter_type == "client" else ObjectId()
                        )
                    },
                    "status": status,
                    "priority": random.choice(priorities),
                    "created_at": created_at,
                    "resolved_at": resolved_at,
                    "resolution": resolution,
                    "impact": f"Impacto {random.choice(['menor', 'moderado', 'significativo'])} en el servicio",
                    "compensation": {
                        "type": "discount",
                        "amount": round(random.uniform(10, 50), 2),
                        "description": "Descuento aplicado a futura reserva"
                    } if status == "resolved" and random.random() < 0.5 else None
                })
    
    return incidents_data

# Generar cambios para algunas reservas
def generate_changes(reservations):
    changes_data = []
    requester_types = ["client", "admin", "driver", "system"]
    
    # Crear cambios para ~25% de las reservas
    for reservation in reservations:
        if random.random() < 0.25:
            # Decidir el número de cambios (1-3)
            num_changes = random.randint(1, 3)
            
            for i in range(num_changes):
                # Elegir un campo a cambiar
                field_options = [
                    ("pickup.date", datetime.datetime, lambda: reservation["pickup"]["date"] + datetime.timedelta(hours=random.choice([-2, -1, 1, 2]))),
                    ("dropoff.location", str, lambda: random.choice(dropoff_locations)["location"]),
                    ("passengers", int, lambda: random.randint(1, 4)),
                    ("vehicle_id", ObjectId, lambda: ObjectId(random.choice(get_existing_ids()[1])))
                ]
                
                field, value_type, value_generator = random.choice(field_options)
                
                # Generar valores antiguo y nuevo
                if field == "pickup.date":
                    old_value = reservation["pickup"]["date"]
                    new_value = value_generator()
                    reason = "Cambio en el horario del vuelo"
                elif field == "dropoff.location":
                    old_value = reservation["dropoff"]["location"]
                    new_value = value_generator()
                    reason = "Cliente solicitó cambio de destino"
                elif field == "passengers":
                    old_value = reservation["passengers"]
                    new_value = value_generator()
                    reason = "Cambio en el número de pasajeros"
                else:  # vehicle_id
                    old_value = reservation.get("vehicle_id", ObjectId())
                    new_value = value_generator()
                    reason = "Cambio de vehículo por disponibilidad"
                
                # Determinar quién solicitó el cambio
                requester_type = random.choice(requester_types)
                requester_id = None
                if requester_type == "client":
                    requester_id = reservation["user_id"]
                elif requester_type == "driver" and reservation.get("driver_id"):
                    requester_id = reservation["driver_id"]
                elif requester_type == "admin":
                    requester_id = ObjectId(random.choice(get_existing_ids()[0]))
                else:  # system
                    requester_id = ObjectId()
                
                # Calcular fecha del cambio
                changed_at = reservation["created_at"] + datetime.timedelta(
                    hours=random.randint(1, max(1, int((reservation["pickup"]["date"] - reservation["created_at"]).total_seconds() / 3600)))
                )
                
                changes_data.append({
                    "_id": ObjectId(),
                    "reservation_id": reservation["_id"],
                    "field_changed": field,
                    "old_value": old_value,
                    "new_value": new_value,
                    "change_reason": reason,
                    "requested_by": {
                        "type": requester_type,
                        "id": requester_id
                    },
                    "approved_by": ObjectId(random.choice(get_existing_ids()[0])) if random.random() < 0.8 else None,
                    "changed_at": changed_at,
                    "notified": random.random() < 0.9  # 90% de los cambios se notifican
                })
    
    return changes_data

# Generar registros de comunicación para las reservas
def generate_communication_logs(reservations, incidents):
    logs_data = []
    communication_types = ["email", "sms", "call", "chat", "whatsapp"]
    
    # Crear registros de comunicación para cada reserva
    for reservation in reservations:
        # Confirmación de reserva (siempre existe)
        logs_data.append({
            "_id": ObjectId(),
            "reservation_id": reservation["_id"],
            "type": "email",
            "direction": "outgoing",
            "sender": {
                "type": "system",
                "id": ObjectId()
            },
            "recipient": {
                "type": "client",
                "id": reservation["user_id"]
            },
            "content": f"Confirmación de reserva {reservation['code']}",
            "sent_at": reservation["created_at"] + datetime.timedelta(minutes=random.randint(5, 30)),
            "status": "delivered",
            "related_to": "confirmación"
        })
        
        # Recordatorio 24h antes (para reservas confirmadas o completadas)
        if reservation["status"] in ["confirmed", "in_progress", "completed"]:
            reminder_time = reservation["pickup"]["date"] - datetime.timedelta(hours=24)
            if reminder_time > datetime.datetime.utcnow() - datetime.timedelta(days=30):  # Solo si es reciente
                logs_data.append({
                    "_id": ObjectId(),
                    "reservation_id": reservation["_id"],
                    "type": "sms",
                    "direction": "outgoing",
                    "sender": {
                        "type": "system",
                        "id": ObjectId()
                    },
                    "recipient": {
                        "type": "client",
                        "id": reservation["user_id"]
                    },
                    "content": f"Recordatorio: Su reserva {reservation['code']} está programada para mañana",
                    "sent_at": reminder_time,
                    "status": "delivered",
                    "related_to": "recordatorio"
                })
        
        # Comunicaciones adicionales aleatorias
        num_additional = random.randint(0, 3)
        for _ in range(num_additional):
            # Decidir tipo y dirección
            comm_type = random.choice(communication_types)
            direction = random.choice(["incoming", "outgoing"])
            
            # Determinar remitente y destinatario según dirección
            if direction == "outgoing":
                sender_type = random.choice(["admin", "system"])
                sender_id = ObjectId()
                recipient_type = "client"
                recipient_id = reservation["user_id"]
            else:
                sender_type = "client"
                sender_id = reservation["user_id"]
                recipient_type = "admin"
                recipient_id = ObjectId()
            
            # Generar contenido según tipo
            if comm_type == "email":
                content = random.choice([
                    "Solicitud de información adicional",
                    "Confirmación de detalles de pago",
                    "Consulta sobre servicios adicionales"
                ])
            elif comm_type == "sms":
                content = random.choice([
                    "Su conductor está en camino",
                    "El vehículo llegará en 10 minutos",
                    "¿Necesita ayuda con su equipaje?"
                ])
            elif comm_type == "call":
                content = random.choice([
                    "Llamada para confirmar detalles",
                    "Consulta sobre cambio de horario",
                    "Información sobre el conductor"
                ])
            else:  # chat/whatsapp
                content = random.choice([
                    "Pregunta sobre ubicación exacta",
                    "Confirmación de llegada",
                    "Detalles del vehículo"
                ])
            
            # Calcular tiempo de envío (entre creación y recogida)
            if reservation["pickup"]["date"] > datetime.datetime.utcnow():
                max_time = datetime.datetime.utcnow()
            else:
                max_time = reservation["pickup"]["date"]
            
            sent_at = reservation["created_at"] + datetime.timedelta(
                hours=random.randint(
                    1, 
                    max(1, int((max_time - reservation["created_at"]).total_seconds() / 3600))
                )
            )
            
            logs_data.append({
                "_id": ObjectId(),
                "reservation_id": reservation["_id"],
                "type": comm_type,
                "direction": direction,
                "sender": {
                    "type": sender_type,
                    "id": sender_id
                },
                "recipient": {
                    "type": recipient_type,
                    "id": recipient_id
                },
                "content": content,
                "sent_at": sent_at,
                "status": random.choice(["sent", "delivered", "read"]),
                "related_to": random.choice(["información", "cambio", "consulta", "confirmación"])
            })
    
    # Añadir comunicaciones para incidentes
    for incident in incidents:
        # Notificación del incidente
        logs_data.append({
            "_id": ObjectId(),
            "reservation_id": incident["reservation_id"],
            "type": random.choice(["email", "sms"]),
            "direction": "outgoing",
            "sender": {
                "type": "system",
                "id": ObjectId()
            },
            "recipient": {
                "type": "admin",
                "id": ObjectId(random.choice(get_existing_ids()[0]))
            },
            "content": f"Nuevo incidente reportado: {incident['description']}",
            "sent_at": incident["created_at"] + datetime.timedelta(minutes=random.randint(1, 5)),
            "status": "delivered",
            "related_to": "incidente"
        })
        
        # Comunicación de resolución (si está resuelto)
        if incident["status"] == "resolved":
            logs_data.append({
                "_id": ObjectId(),
                "reservation_id": incident["reservation_id"],
                "type": random.choice(["email", "call"]),
                "direction": "outgoing",
                "sender": {
                    "type": "admin",
                    "id": ObjectId(random.choice(get_existing_ids()[0]))
                },
                "recipient": {
                    "type": "client",
                    "id": incident["reported_by"]["id"] if incident["reported_by"]["type"] == "client" else ObjectId()
                },
                "content": f"Resolución del incidente: {incident['resolution']}",
                "sent_at": incident["resolved_at"] + datetime.timedelta(minutes=random.randint(5, 30)),
                "status": "delivered",
                "related_to": "resolución"
            })
    
    return logs_data

# Función principal
def init_reservations_data():
    try:
        # Obtener IDs existentes
        user_ids, vehicle_ids, driver_ids = get_existing_ids()
        
        # Generar datos
        reservations = generate_reservations(user_ids, vehicle_ids, driver_ids)
        print(f"Generados {len(reservations)} reservas")
        
        incidents = generate_incidents(reservations)
        print(f"Generados {len(incidents)} incidentes")
        
        changes = generate_changes(reservations)
        print(f"Generados {len(changes)} cambios")
        
        communication_logs = generate_communication_logs(reservations, incidents)
        print(f"Generados {len(communication_logs)} registros de comunicación")
        
        # Insertar datos
        if reservations:
            reservations_collection.insert_many(reservations)
        if incidents:
            reservation_incidents_collection.insert_many(incidents)
        if changes:
            reservation_changes_collection.insert_many(changes)
        if communication_logs:
            communication_logs_collection.insert_many(communication_logs)
            
        print("Inicialización de datos de reservas completada con éxito")
    except BulkWriteError as e:
        print(f"Error en escritura por lotes: {e.details}")
    except Exception as e:
        print(f"Error al inicializar datos: {e}")

# Ejecutar script
if __name__ == "__main__":
    reset_collections()
    init_reservations_data() 