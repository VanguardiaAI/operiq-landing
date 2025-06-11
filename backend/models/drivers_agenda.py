from flask import current_app
from pymongo.collection import Collection
from bson import ObjectId
from datetime import datetime
from typing import Dict, List, Optional, Any
from services.timezone_service import TimezoneService

# Variable para la colección, se inicializará en setup_collection
drivers_agenda_collection: Optional[Collection] = None

def setup_collection(db):
    """Inicializa la colección drivers_agenda y sus índices"""
    global drivers_agenda_collection
    
    # Inicializar la colección
    drivers_agenda_collection = db['drivers_agenda']
    
    # Crear índices
    drivers_agenda_collection.create_index("driver_id")
    drivers_agenda_collection.create_index([
        ("availability.start_date", 1),
        ("availability.end_date", 1)
    ])
    
    return drivers_agenda_collection

def validate_driver_agenda(data: Dict[str, Any]) -> tuple[bool, str]:
    """Valida los datos de una agenda de chofer"""
    required_fields = ['driver_id', 'availability']
    
    # Verificar campos requeridos
    for field in required_fields:
        if field not in data:
            return False, f"El campo '{field}' es requerido"
    
    # Validar que availability sea una lista
    if not isinstance(data['availability'], list):
        return False, "El campo 'availability' debe ser una lista"
    
    # Validar cada elemento de availability
    for slot in data['availability']:
        if not isinstance(slot, dict):
            return False, "Cada elemento de 'availability' debe ser un objeto"
        
        # Verificar campos requeridos para cada slot
        slot_required = ['start_date', 'end_date', 'status']
        for field in slot_required:
            if field not in slot:
                return False, f"Cada elemento de 'availability' debe tener el campo '{field}'"
        
        # Validar status
        valid_statuses = ['available', 'busy', 'off']
        if slot['status'] not in valid_statuses:
            return False, f"El status debe ser uno de: {', '.join(valid_statuses)}"
    
    return True, ""

def get_driver_agenda(driver_id: str) -> Optional[Dict[str, Any]]:
    """Obtiene la agenda de un chofer específico"""
    if drivers_agenda_collection is None:
        raise Exception("La colección drivers_agenda no está inicializada")
    
    try:
        driver_id_obj = ObjectId(driver_id)
        return drivers_agenda_collection.find_one({"driver_id": driver_id_obj})
    except Exception as e:
        print(f"Error al obtener agenda del chofer: {str(e)}")
        return None

def create_driver_agenda(data: Dict[str, Any]) -> tuple[bool, str, Optional[str]]:
    """Crea una nueva agenda para un chofer"""
    if drivers_agenda_collection is None:
        raise Exception("La colección drivers_agenda no está inicializada")
    
    # Validar datos
    is_valid, message = validate_driver_agenda(data)
    if not is_valid:
        return False, message, None
    
    # Convertir driver_id a ObjectId
    try:
        data['driver_id'] = ObjectId(data['driver_id'])
    except:
        return False, "ID de chofer inválido", None
    
    # Convertir fechas de string a datetime si son string
    for slot in data['availability']:
        for date_field in ['start_date', 'end_date']:
            if isinstance(slot[date_field], str):
                slot[date_field] = datetime.fromisoformat(slot[date_field].replace('Z', '+00:00'))
    
    # Añadir fechas de creación/actualización
    current_time = datetime.utcnow()
    data['created_at'] = current_time
    data['updated_at'] = current_time
    
    # Insertar en la base de datos
    try:
        result = drivers_agenda_collection.insert_one(data)
        return True, "Agenda de chofer creada con éxito", str(result.inserted_id)
    except Exception as e:
        return False, f"Error al crear agenda de chofer: {str(e)}", None

def update_driver_agenda(driver_id: str, data: Dict[str, Any]) -> tuple[bool, str]:
    """Actualiza la agenda de un chofer existente"""
    if drivers_agenda_collection is None:
        raise Exception("La colección drivers_agenda no está inicializada")
    
    try:
        driver_id_obj = ObjectId(driver_id)
        
        # Verificar si existe
        existing = drivers_agenda_collection.find_one({"driver_id": driver_id_obj})
        if not existing:
            return False, "Agenda de chofer no encontrada"
        
        # Actualizar fecha de modificación
        data['updated_at'] = datetime.utcnow()
        
        # Convertir fechas de string a datetime si son string
        if 'availability' in data:
            for slot in data['availability']:
                for date_field in ['start_date', 'end_date']:
                    if date_field in slot and isinstance(slot[date_field], str):
                        slot[date_field] = datetime.fromisoformat(slot[date_field].replace('Z', '+00:00'))
        
        # Actualizar en la base de datos
        result = drivers_agenda_collection.update_one(
            {"driver_id": driver_id_obj},
            {"$set": data}
        )
        
        if result.modified_count == 0:
            return False, "No se realizaron cambios"
        
        return True, "Agenda de chofer actualizada con éxito"
    except Exception as e:
        return False, f"Error al actualizar agenda de chofer: {str(e)}"

def check_driver_availability(driver_id: str, start_date: datetime, end_date: datetime, address: str = None) -> bool:
    """
    Verifica si un chofer está disponible en un rango de fechas específico
    
    Args:
        driver_id: ID del chofer
        start_date: Fecha y hora de inicio (en zona horaria local)
        end_date: Fecha y hora de fin (en zona horaria local)
        address: Dirección para determinar zona horaria (opcional)
    
    Returns:
        bool: True si está disponible, False si no
    """
    if drivers_agenda_collection is None:
        raise Exception("La colección drivers_agenda no está inicializada")
    
    try:
        # Convertir a ObjectId si es un string
        if not isinstance(driver_id, ObjectId):
            try:
                driver_id_obj = ObjectId(driver_id)
            except:
                print(f"Error al convertir driver_id a ObjectId: {driver_id}")
                return False
        else:
            driver_id_obj = driver_id
        
        # Obtener la agenda del conductor
        agenda = drivers_agenda_collection.find_one({"driver_id": driver_id_obj})
        
        if not agenda:
            print(f"❌ No se encontró agenda para el conductor {driver_id}")
            return False
        
        # 🔍 LOGGING DETALLADO PARA DEBUGGING
        print(f"\n🔍 === DEBUG VERIFICACIÓN DISPONIBILIDAD ===")
        print(f"📋 Conductor: {driver_id}")
        print(f"📍 Dirección: {address}")
        print(f"🕐 Inicio solicitado (input): {start_date.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🕑 Fin solicitado (input): {end_date.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Convertir fechas solicitadas a UTC para comparar con los datos de la BD
        if address:
            print(f"🌍 Verificando disponibilidad con zona horaria para: {address}")
            # Convertir fechas locales a UTC
            start_date_utc = TimezoneService.convert_local_to_utc(start_date, address)
            end_date_utc = TimezoneService.convert_local_to_utc(end_date, address)
            
            # Convertir a datetime naive para comparar con la BD
            start_date_naive = start_date_utc.replace(tzinfo=None) if start_date_utc.tzinfo else start_date_utc
            end_date_naive = end_date_utc.replace(tzinfo=None) if end_date_utc.tzinfo else end_date_utc
            
            print(f"🌐 Inicio en UTC (converted): {start_date_naive.strftime('%Y-%m-%d %H:%M:%S.%f')}")
            print(f"🌐 Fin en UTC (converted): {end_date_naive.strftime('%Y-%m-%d %H:%M:%S.%f')}")
        else:
            # Método anterior (compatibilidad hacia atrás)
            print("⚠️ Verificando disponibilidad sin conversión de zona horaria (método legado)")
            start_date_naive = start_date
            end_date_naive = end_date
        
        print(f"📊 Número de slots en agenda: {len(agenda.get('availability', []))}")
        
        # Buscar en los slots de disponibilidad
        slot_number = 1
        for slot in agenda.get("availability", []):
            slot_start = slot.get("start_date")
            slot_end = slot.get("end_date")
            status = slot.get("status")
            
            print(f"\n📋 Slot #{slot_number}:")
            print(f"   Status: {status}")
            print(f"   Inicio BD: {slot_start.strftime('%Y-%m-%d %H:%M:%S.%f') if slot_start else 'N/A'}")
            print(f"   Fin BD: {slot_end.strftime('%Y-%m-%d %H:%M:%S.%f') if slot_end else 'N/A'}")
            
            if not slot_start or not slot_end or status != "available":
                print(f"   ❌ Slot descartado: {'Sin fechas' if not slot_start or not slot_end else f'Status {status}'}")
                slot_number += 1
                continue
            
            # 🔍 COMPARACIÓN DETALLADA
            print(f"   🔍 Comparando:")
            print(f"      slot_start <= start_date_naive: {slot_start} <= {start_date_naive}")
            print(f"      slot_end >= end_date_naive: {slot_end} >= {end_date_naive}")
            
            start_fits = slot_start <= start_date_naive
            end_fits = slot_end >= end_date_naive
            
            print(f"      Inicio encaja: {start_fits}")
            print(f"      Fin encaja: {end_fits}")
            
            # Verificar si el slot cubre completamente el período solicitado
            if start_fits and end_fits:
                print(f"   ✅ SLOT VÁLIDO ENCONTRADO!")
                print(f"=== FIN DEBUG VERIFICACIÓN ===\n")
                return True
            else:
                print(f"   ❌ Slot no válido")
                if not start_fits:
                    diff_seconds = (start_date_naive - slot_start).total_seconds()
                    print(f"      • Solicitud empieza {diff_seconds:.3f} segundos DESPUÉS del inicio del slot")
                if not end_fits:
                    diff_seconds = (end_date_naive - slot_end).total_seconds()
                    print(f"      • Solicitud termina {diff_seconds:.3f} segundos DESPUÉS del fin del slot")
            
            slot_number += 1
        
        print(f"❌ NINGÚN SLOT VÁLIDO ENCONTRADO")
        print(f"=== FIN DEBUG VERIFICACIÓN ===\n")
        return False
        
    except Exception as e:
        print(f"Error al verificar disponibilidad del chofer: {str(e)}")
        return False

def get_driver_available_time_slots(driver_id: str, date_start: datetime, date_end: datetime, address: str = None) -> List[Dict[str, str]]:
    """
    Obtiene los horarios disponibles de un chofer para un rango de fechas específico
    
    Args:
        driver_id: ID del chofer
        date_start: Fecha de inicio (inicio del día) 
        date_end: Fecha de fin (fin del día)
        address: Dirección para determinar zona horaria (opcional)
    
    Returns:
        List[Dict[str, str]]: Lista de horarios disponibles en formato {"start_time": "HH:MM", "end_time": "HH:MM"}
    """
    if drivers_agenda_collection is None:
        raise Exception("La colección drivers_agenda no está inicializada")
    
    try:
        # Convertir a ObjectId si es un string
        if not isinstance(driver_id, ObjectId):
            try:
                driver_id_obj = ObjectId(driver_id)
            except:
                print(f"Error al convertir driver_id a ObjectId: {driver_id}")
                return []
        else:
            driver_id_obj = driver_id
        
        # Buscar agenda del chofer
        agenda = drivers_agenda_collection.find_one({"driver_id": driver_id_obj})
        
        if not agenda:
            return []
        
        available_slots = []
        
        # Si tenemos dirección, convertir la agenda a tiempo local
        if address:
            print(f"🌍 Convirtiendo horarios a zona horaria local para: {address}")
            local_agenda = TimezoneService.get_driver_availability_in_local_time(agenda, address)
        else:
            print("⚠️ Obteniendo horarios sin conversión de zona horaria")
            local_agenda = agenda
        
        # Normalizar fechas de entrada para comparación
        if address:
            # Si se usa zona horaria, convertir fechas de entrada a UTC naive para comparar
            date_start_utc = TimezoneService.convert_local_to_utc(date_start, address)
            date_end_utc = TimezoneService.convert_local_to_utc(date_end, address)
            
            date_start_naive = date_start_utc.replace(tzinfo=None) if date_start_utc.tzinfo else date_start_utc
            date_end_naive = date_end_utc.replace(tzinfo=None) if date_end_utc.tzinfo else date_end_utc
        else:
            date_start_naive = date_start
            date_end_naive = date_end
        
        # Verificar cada slot de disponibilidad  
        for slot in agenda.get("availability", []):  # Usar agenda original, no local_agenda
            slot_start = slot.get("start_date")
            slot_end = slot.get("end_date")
            status = slot.get("status")
            
            if not slot_start or not slot_end or status != "available":
                continue
            
            # Asegurar que slot_start y slot_end sean naive para comparar
            slot_start_naive = slot_start.replace(tzinfo=None) if hasattr(slot_start, 'tzinfo') and slot_start.tzinfo else slot_start
            slot_end_naive = slot_end.replace(tzinfo=None) if hasattr(slot_end, 'tzinfo') and slot_end.tzinfo else slot_end
            
            # Verificar si el slot se superpone con el rango solicitado
            if slot_start_naive <= date_end_naive and slot_end_naive >= date_start_naive:
                # Obtener las horas específicas del slot o usar horas por defecto
                time_slots = slot.get("time_slots", [])
                
                if time_slots:
                    # Si hay horarios específicos definidos, usarlos
                    for time_slot in time_slots:
                        if isinstance(time_slot, dict) and "start_time" in time_slot and "end_time" in time_slot:
                            available_slots.append({
                                "start_time": time_slot["start_time"],
                                "end_time": time_slot["end_time"]
                            })
                else:
                    # Convertir las fechas del slot a horas locales
                    if address:
                        # Convertir fechas UTC a zona horaria local
                        slot_start_local = TimezoneService.convert_utc_to_local(slot_start, address)
                        slot_end_local = TimezoneService.convert_utc_to_local(slot_end, address)
                        
                        # Usar las horas convertidas a tiempo local
                        start_time = slot_start_local.strftime("%H:%M")
                        end_time = slot_end_local.strftime("%H:%M")
                        
                        # Para display, formatear con zona horaria
                        start_time_display = TimezoneService.format_time_for_display(slot_start, address)
                        end_time_display = TimezoneService.format_time_for_display(slot_end, address)
                        
                        available_slots.append({
                            "start_time": start_time,
                            "end_time": end_time,
                            "start_time_display": start_time_display,
                            "end_time_display": end_time_display
                        })
                    else:
                        # Horarios por defecto sin conversión
                        default_slots = [
                            {"start_time": "08:00", "end_time": "12:00"},
                            {"start_time": "14:00", "end_time": "18:00"},
                            {"start_time": "19:00", "end_time": "22:00"}
                        ]
                        available_slots.extend(default_slots)
        
        # Eliminar duplicados y ordenar por hora de inicio
        unique_slots = []
        seen = set()
        
        for slot in available_slots:
            slot_key = f"{slot['start_time']}-{slot['end_time']}"
            if slot_key not in seen:
                seen.add(slot_key)
                unique_slots.append(slot)
        
        # Ordenar por hora de inicio
        unique_slots.sort(key=lambda x: x["start_time"])
        
        return unique_slots
        
    except Exception as e:
        print(f"Error al obtener horarios del chofer {driver_id}: {str(e)}")
        return [] 