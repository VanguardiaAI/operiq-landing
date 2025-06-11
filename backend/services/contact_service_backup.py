from datetime import datetime
from typing import Dict, Any, List, Optional
from bson import ObjectId

def get_driver_contact_info(db, driver_id: str) -> Dict[str, Any]:
    """
    Obtiene información de contacto completa de un conductor
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
    
    Returns:
        Dict con información de contacto del conductor
    """
    try:
        # Convertir a ObjectId si es necesario
        if not isinstance(driver_id, ObjectId):
            driver_id_obj = ObjectId(driver_id)
        else:
            driver_id_obj = driver_id
            
        driver = db["drivers"].find_one({"_id": driver_id_obj})
        if not driver:
            return {"error": "Conductor no encontrado"}
            
        contact_info = {
            "driver_id": str(driver.get("_id")),
            "name": f"{driver.get('first_name', '')} {driver.get('last_name', '')}".strip(),
            "photo": driver.get("profile_image", ""),
                        "phone": driver.get("phone", ""),            "email": driver.get("email", ""),            "whatsapp": driver.get("whatsapp", "") or driver.get("phone", ""),            "license_number": driver.get("licenses", {}).get("driving", {}).get("number", ""),            "rating": driver.get("ratings", {}).get("average", 0),            "total_trips": driver.get("ratings", {}).get("count", 0),            "experience_years": driver.get("years_experience", 0),
            "languages": driver.get("languages", []),
            "status": driver.get("status", "active"),
            "last_active": driver.get("last_active", ""),
            "preferred_contact_method": driver.get("preferred_contact_method", "phone")
        }
        
        # Verificar qué métodos de contacto están disponibles
        available_contact_methods = []
        if contact_info["phone"]:
            available_contact_methods.append("phone")
        if contact_info["whatsapp"]:
            available_contact_methods.append("whatsapp")
        if contact_info["email"]:
            available_contact_methods.append("email")
            
        contact_info["available_contact_methods"] = available_contact_methods
        
        return contact_info
        
    except Exception as e:
        print(f"Error obteniendo información de contacto del conductor {driver_id}: {str(e)}")
        return {"error": f"Error al obtener información de contacto: {str(e)}"}

def get_client_contact_info(db, client_id: str) -> Dict[str, Any]:
    """
    Obtiene información de contacto de un cliente
    
    Args:
        db: Conexión a la base de datos
        client_id: ID del cliente
    
    Returns:
        Dict con información de contacto del cliente
    """
    try:
        # Convertir a ObjectId si es necesario
        if not isinstance(client_id, ObjectId):
            client_id_obj = ObjectId(client_id)
        else:
            client_id_obj = client_id
            
        client = db["users"].find_one({"_id": client_id_obj})
        if not client:
            return {"error": "Cliente no encontrado"}
            
        contact_info = {
            "client_id": str(client.get("_id")),
            "name": client.get("name", "") or f"{client.get('first_name', '')} {client.get('last_name', '')}".strip(),
            "phone": client.get("phone", ""),
            "email": client.get("email", ""),
            "whatsapp": client.get("whatsapp", "") or client.get("phone", ""),
            "contact_preferences": client.get("contact_preferences", ["phone", "email"]),
            "preferred_language": client.get("preferred_language", "es"),
            "timezone": client.get("timezone", "Europe/Madrid")
        }
        
        return contact_info
        
    except Exception as e:
        print(f"Error obteniendo información de contacto del cliente {client_id}: {str(e)}")
        return {"error": f"Error al obtener información de contacto: {str(e)}"}

def create_contact_log(db, contact_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Registra un contacto realizado entre admin y conductor
    
    Args:
        db: Conexión a la base de datos
        contact_data: Datos del contacto a registrar
    
    Returns:
        Dict con el resultado del registro
    """
    try:
        contact_record = {
            "admin_id": contact_data.get("admin_id"),
            "driver_id": contact_data.get("driver_id"),
            "client_id": contact_data.get("client_id"),
            "contact_method": contact_data.get("contact_method"),
            "contact_reason": contact_data.get("contact_reason", "vehicle_inquiry"),
            "notes": contact_data.get("notes", ""),
            "pickup_date": contact_data.get("pickup_date"),
            "pickup_location": contact_data.get("pickup_location"),
            "vehicle_id": contact_data.get("vehicle_id"),
            "created_at": datetime.utcnow(),
            "status": "completed"
        }
        
        result = db["contact_logs"].insert_one(contact_record)
        
        return {
            "success": True,
            "contact_id": str(result.inserted_id),
            "message": "Contacto registrado exitosamente"
        }
        
    except Exception as e:
        print(f"Error registrando contacto: {str(e)}")
        return {"error": f"Error al registrar contacto: {str(e)}"}

def create_schedule_suggestion(db, suggestion_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Crea una sugerencia de horario alternativo para un cliente
    
    Args:
        db: Conexión a la base de datos
        suggestion_data: Datos de la sugerencia
    
    Returns:
        Dict con el resultado de la creación
    """
    try:
        suggestion_record = {
            "admin_id": suggestion_data.get("admin_id"),
            "client_id": suggestion_data.get("client_id"),
            "driver_id": suggestion_data.get("driver_id"),
            "vehicle_id": suggestion_data.get("vehicle_id"),
            "original_pickup_date": suggestion_data.get("original_pickup_date"),
            "suggested_pickup_date": suggestion_data.get("suggested_pickup_date"),
            "pickup_location": suggestion_data.get("pickup_location"),
            "dropoff_location": suggestion_data.get("dropoff_location"),
            "reason": suggestion_data.get("reason", ""),
            "alternative_time_slots": suggestion_data.get("alternative_time_slots", []),
            "contact_method": suggestion_data.get("contact_method", "phone"),
            "message": suggestion_data.get("message", ""),
            "created_at": datetime.utcnow(),
            "status": "pending",
            "client_response": None,
            "response_date": None
        }
        
        result = db["schedule_suggestions"].insert_one(suggestion_record)
        
        # Opcionalmente, enviar notificación al cliente aquí
        # send_schedule_suggestion_notification(suggestion_record)
        
        return {
            "success": True,
            "suggestion_id": str(result.inserted_id),
            "message": "Sugerencia de horario creada exitosamente"
        }
        
    except Exception as e:
        print(f"Error creando sugerencia de horario: {str(e)}")
        return {"error": f"Error al crear sugerencia: {str(e)}"}

def get_contact_history(db, driver_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Obtiene el historial de contactos de un conductor
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
        limit: Número máximo de registros a retornar
    
    Returns:
        Lista con el historial de contactos
    """
    try:
        contacts = list(db["contact_logs"].find(
            {"driver_id": driver_id}
        ).sort("created_at", -1).limit(limit))
        
        # Convertir ObjectId a string
        for contact in contacts:
            contact["_id"] = str(contact["_id"])
            if contact.get("created_at"):
                contact["created_at"] = contact["created_at"].isoformat()
        
        return contacts
        
    except Exception as e:
        print(f"Error obteniendo historial de contactos: {str(e)}")
        return []

def format_whatsapp_message(driver_name: str, client_name: str, pickup_date: str, pickup_location: str, alternative_slots: List[str] = None) -> str:
    """
    Formatea un mensaje de WhatsApp para sugerir horarios alternativos
    
    Args:
        driver_name: Nombre del conductor
        client_name: Nombre del cliente
        pickup_date: Fecha original solicitada
        pickup_location: Ubicación de recogida
        alternative_slots: Horarios alternativos disponibles
    
    Returns:
        Mensaje formateado para WhatsApp
    """
    base_message = f"""¡Hola {driver_name}!

📞 Consulta de servicio VIP:
👤 Cliente: {client_name}
📅 Fecha original: {pickup_date}
📍 Ubicación: {pickup_location}

⚠️ El horario solicitado no está disponible."""

    if alternative_slots:
        base_message += f"\n\n✅ Horarios alternativos disponibles:"
        for slot in alternative_slots:
            base_message += f"\n• {slot}"
        
        base_message += "\n\n¿Podrías contactar al cliente para ofrecer estos horarios alternativos?"
    else:
        base_message += "\n\n¿Cuándo estarías disponible para este servicio?"
    
    base_message += "\n\nGracias por tu colaboración 🚗✨"
    
    return base_message 