from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from bson import ObjectId

def create_extra_schedule_slot(db, extra_schedule_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Crea un horario extra en la agenda del conductor cuando acepta trabajar fuera de su horario habitual
    
    Args:
        db: Conexión a la base de datos
        extra_schedule_data: Datos del horario extra a crear
    
    Returns:
        Dict con el resultado de la creación
    """
    try:
        # Validar datos requeridos
        required_fields = ["driver_id", "date", "start_time", "end_time", "admin_id"]
        for field in required_fields:
            if not extra_schedule_data.get(field):
                return {"error": f"Campo requerido faltante: {field}"}
        
        driver_id = extra_schedule_data["driver_id"]
        date_str = extra_schedule_data["date"]
        start_time = extra_schedule_data["start_time"]
        end_time = extra_schedule_data["end_time"]
        
        # Convertir fecha y horas a objetos datetime
        start_datetime = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
        end_datetime = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
        
        # Validar que la hora de inicio sea antes que la de fin
        if start_datetime >= end_datetime:
            return {"error": "La hora de inicio debe ser anterior a la hora de fin"}
        
        # Validar que no sea en el pasado
        if start_datetime < datetime.now():
            return {"error": "No se puede crear un horario extra en el pasado"}
        
        # Verificar si ya existe un conflicto con horarios regulares o extras
        conflict = check_schedule_conflicts(db, driver_id, start_datetime, end_datetime)
        if conflict["has_conflict"]:
            return {"error": f"Conflicto de horario detectado: {conflict['reason']}"}
        
        # Crear el registro de horario extra
        extra_schedule_record = {
            "driver_id": driver_id,
            "admin_id": extra_schedule_data.get("admin_id"),
            "client_id": extra_schedule_data.get("client_id"),
            "vehicle_id": extra_schedule_data.get("vehicle_id"),
            "date": date_str,  # Guardar como string para evitar problemas de serialización
            "start_time": start_time,
            "end_time": end_time,
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
            "reason": extra_schedule_data.get("reason", "Horario especial solicitado por cliente"),
            "pickup_location": extra_schedule_data.get("pickup_location", ""),
            "dropoff_location": extra_schedule_data.get("dropoff_location", ""),
            "estimated_duration": int((end_datetime - start_datetime).total_seconds() / 60),
            "status": "active",
            "type": "extra_schedule",
            "notes": extra_schedule_data.get("notes", ""),
            "created_at": datetime.utcnow(),
            "created_by": extra_schedule_data.get("admin_id")
        }
        
        # Insertar en la colección de horarios extras
        result = db["driver_extra_schedules"].insert_one(extra_schedule_record)
        
        # También actualizar la agenda regular del conductor si es necesario
        update_driver_agenda_with_extra_slot(db, driver_id, extra_schedule_record)
        
        return {
            "success": True,
            "extra_schedule_id": str(result.inserted_id),
            "message": "Horario extra creado exitosamente",
            "schedule_details": {
                "date": date_str,
                "start_time": start_time,
                "end_time": end_time,
                "duration_minutes": extra_schedule_record["estimated_duration"]
            }
        }
        
    except Exception as e:
        print(f"Error creando horario extra: {str(e)}")
        return {"error": f"Error al crear horario extra: {str(e)}"}

def check_schedule_conflicts(db, driver_id: str, start_datetime: datetime, end_datetime: datetime) -> Dict[str, Any]:
    """
    Verifica si hay conflictos con horarios existentes del conductor
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
        start_datetime: Fecha y hora de inicio
        end_datetime: Fecha y hora de fin
    
    Returns:
        Dict indicando si hay conflicto y la razón
    """
    try:
        # Verificar conflictos con reservas existentes
        existing_reservations = db["reservations"].find({
            "driver_id": driver_id,
            "status": {"$in": ["confirmed", "in_progress"]},
            "$or": [
                {
                    "$and": [
                        {"pickup_datetime": {"$lte": start_datetime}},
                        {"estimated_dropoff_datetime": {"$gte": start_datetime}}
                    ]
                },
                {
                    "$and": [
                        {"pickup_datetime": {"$lte": end_datetime}},
                        {"estimated_dropoff_datetime": {"$gte": end_datetime}}
                    ]
                },
                {
                    "$and": [
                        {"pickup_datetime": {"$gte": start_datetime}},
                        {"pickup_datetime": {"$lte": end_datetime}}
                    ]
                }
            ]
        })
        
        reservation_conflict = list(existing_reservations)
        if reservation_conflict:
            return {
                "has_conflict": True,
                "reason": f"Ya existe una reserva confirmada en ese horario (ID: {reservation_conflict[0]['_id']})"
            }
        
        # Verificar conflictos con otros horarios extras
        existing_extra_schedules = db["driver_extra_schedules"].find({
            "driver_id": driver_id,
            "status": "active",
            "$or": [
                {
                    "$and": [
                        {"start_datetime": {"$lte": start_datetime}},
                        {"end_datetime": {"$gte": start_datetime}}
                    ]
                },
                {
                    "$and": [
                        {"start_datetime": {"$lte": end_datetime}},
                        {"end_datetime": {"$gte": end_datetime}}
                    ]
                },
                {
                    "$and": [
                        {"start_datetime": {"$gte": start_datetime}},
                        {"start_datetime": {"$lte": end_datetime}}
                    ]
                }
            ]
        })
        
        extra_schedule_conflict = list(existing_extra_schedules)
        if extra_schedule_conflict:
            return {
                "has_conflict": True,
                "reason": f"Ya existe un horario extra en ese período (ID: {extra_schedule_conflict[0]['_id']})"
            }
        
        return {"has_conflict": False, "reason": ""}
        
    except Exception as e:
        print(f"Error verificando conflictos de horario: {str(e)}")
        return {"has_conflict": True, "reason": f"Error verificando conflictos: {str(e)}"}

def update_driver_agenda_with_extra_slot(db, driver_id: str, extra_schedule: Dict[str, Any]) -> bool:
    """
    Actualiza la agenda del conductor agregando el horario extra
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
        extra_schedule: Datos del horario extra
    
    Returns:
        bool: True si se actualizó correctamente
    """
    try:
        # Buscar la agenda del conductor para la fecha
        agenda_date = extra_schedule["date"]
        
        # Buscar agenda existente para esa fecha
        existing_agenda = db["drivers_agenda"].find_one({
            "driver_id": driver_id,
            "date": agenda_date
        })
        
        if existing_agenda:
            # Agregar el horario extra a los horarios disponibles
            extra_slot = {
                "start_time": extra_schedule["start_time"],
                "end_time": extra_schedule["end_time"],
                "type": "extra",
                "created_by_admin": True,
                "extra_schedule_id": str(extra_schedule.get("_id"))
            }
            
            # Actualizar la agenda existente
            db["drivers_agenda"].update_one(
                {"_id": existing_agenda["_id"]},
                {
                    "$push": {"available_time_slots": extra_slot},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        else:
            # Crear nueva entrada de agenda con solo el horario extra
            new_agenda = {
                "driver_id": driver_id,
                "date": agenda_date,
                "available_time_slots": [{
                    "start_time": extra_schedule["start_time"],
                    "end_time": extra_schedule["end_time"],
                    "type": "extra",
                    "created_by_admin": True,
                    "extra_schedule_id": str(extra_schedule.get("_id"))
                }],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_by_admin": True
            }
            
            db["drivers_agenda"].insert_one(new_agenda)
        
        return True
        
    except Exception as e:
        print(f"Error actualizando agenda del conductor: {str(e)}")
        return False

def get_driver_extra_schedules(db, driver_id: str, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None) -> List[Dict[str, Any]]:
    """
    Obtiene los horarios extras de un conductor
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
        date_from: Fecha de inicio (opcional)
        date_to: Fecha de fin (opcional)
    
    Returns:
        Lista de horarios extras
    """
    try:
        query = {"driver_id": driver_id, "status": "active"}
        
        if date_from and date_to:
            query["date"] = {"$gte": date_from.date(), "$lte": date_to.date()}
        elif date_from:
            query["date"] = {"$gte": date_from.date()}
        elif date_to:
            query["date"] = {"$lte": date_to.date()}
        
        extra_schedules = list(db["driver_extra_schedules"].find(query).sort("date", 1))
        
        # Convertir ObjectId a string
        for schedule in extra_schedules:
            schedule["_id"] = str(schedule["_id"])
            if schedule.get("created_at"):
                schedule["created_at"] = schedule["created_at"].isoformat()
            # Convertir date a string si es necesario
            if hasattr(schedule.get("date"), 'isoformat'):
                schedule["date"] = schedule["date"].isoformat()
        
        return extra_schedules
        
    except Exception as e:
        print(f"Error obteniendo horarios extras: {str(e)}")
        return []

def cancel_extra_schedule(db, extra_schedule_id: str, admin_id: str, reason: str = "") -> Dict[str, Any]:
    """
    Cancela un horario extra
    
    Args:
        db: Conexión a la base de datos
        extra_schedule_id: ID del horario extra
        admin_id: ID del administrador que cancela
        reason: Motivo de la cancelación
    
    Returns:
        Dict con el resultado
    """
    try:
        # Convertir a ObjectId
        extra_id_obj = ObjectId(extra_schedule_id)
        
        # Buscar el horario extra
        extra_schedule = db["driver_extra_schedules"].find_one({"_id": extra_id_obj})
        if not extra_schedule:
            return {"error": "Horario extra no encontrado"}
        
        if extra_schedule.get("status") != "active":
            return {"error": "El horario extra ya no está activo"}
        
        # Actualizar estado a cancelado
        db["driver_extra_schedules"].update_one(
            {"_id": extra_id_obj},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_at": datetime.utcnow(),
                    "cancelled_by": admin_id,
                    "cancellation_reason": reason
                }
            }
        )
        
        # Remover de la agenda del conductor
        remove_extra_slot_from_agenda(db, extra_schedule["driver_id"], extra_schedule)
        
        return {
            "success": True,
            "message": "Horario extra cancelado exitosamente"
        }
        
    except Exception as e:
        print(f"Error cancelando horario extra: {str(e)}")
        return {"error": f"Error al cancelar horario extra: {str(e)}"}

def remove_extra_slot_from_agenda(db, driver_id: str, extra_schedule: Dict[str, Any]) -> bool:
    """
    Remueve un horario extra de la agenda del conductor
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
        extra_schedule: Datos del horario extra a remover
    
    Returns:
        bool: True si se removió correctamente
    """
    try:
        db["drivers_agenda"].update_one(
            {
                "driver_id": driver_id,
                "date": extra_schedule["date"]
            },
            {
                "$pull": {
                    "available_time_slots": {
                        "extra_schedule_id": str(extra_schedule["_id"])
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return True
        
    except Exception as e:
        print(f"Error removiendo horario extra de la agenda: {str(e)}")
        return False 