from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId
from models.drivers_agenda import check_driver_availability, get_driver_available_time_slots
from services.timezone_service import TimezoneService
from utils.geo_utils import (
    find_zones_for_location,
    find_nearby_vehicles,
    check_reservation_conflicts
)

def get_vehicle_details(db, vehicle_id: str) -> Dict[str, Any]:
    """
    Obtiene los detalles completos de un vehículo incluyendo imagen
    
    Args:
        db: Conexión a la base de datos
        vehicle_id: ID del vehículo
    
    Returns:
        Dict con los datos del vehículo o None si no se encuentra
    """
    try:
        # Convertir a ObjectId si es necesario
        if not isinstance(vehicle_id, ObjectId):
            vehicle_id_obj = ObjectId(vehicle_id)
        else:
            vehicle_id_obj = vehicle_id
            
        vehicle = db["vehicles"].find_one({"_id": vehicle_id_obj})
        if not vehicle:
            return {}
            
        return {
            "id": str(vehicle.get("_id")),
            "name": vehicle.get("name", ""),
            "model": vehicle.get("details", {}).get("model", "") or vehicle.get("name", ""),
            "licensePlate": vehicle.get("licensePlate", ""),
            "image": vehicle.get("image", ""),
            "imageUrl": vehicle.get("imageUrl", ""),
            "capacity": vehicle.get("details", {}).get("capacity", 4),
            "type": vehicle.get("details", {}).get("type", "sedan"),
            "color": vehicle.get("details", {}).get("color", ""),
            "year": vehicle.get("details", {}).get("year", "")
        }
    except Exception as e:
        print(f"Error obteniendo detalles del vehículo {vehicle_id}: {str(e)}")
        return {}

def get_driver_details(db, driver_id: str) -> Dict[str, Any]:
    """
    Obtiene los detalles completos de un conductor incluyendo datos de contacto
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del conductor
    
    Returns:
        Dict con los datos del conductor o None si no se encuentra
    """
    try:
        # Convertir a ObjectId si es necesario
        if not isinstance(driver_id, ObjectId):
            driver_id_obj = ObjectId(driver_id)
        else:
            driver_id_obj = driver_id
            
        driver = db["drivers"].find_one({"_id": driver_id_obj})
        if not driver:
            return {}
            
        return {
            "id": str(driver.get("_id")),
            "name": f"{driver.get('first_name', '')} {driver.get('last_name', '')}".strip(),
            "first_name": driver.get("first_name", ""),
            "last_name": driver.get("last_name", ""),
            "photo": driver.get("profile_image", ""),
            "phone": driver.get("phone", ""),
            "email": driver.get("email", ""),
            "whatsapp": driver.get("whatsapp", "") or driver.get("phone", ""),
            "license_number": driver.get("licenses", {}).get("driving", {}).get("number", ""),
            "experience_years": driver.get("years_experience", 0),
            "rating": driver.get("ratings", {}).get("average", 0),
            "total_trips": driver.get("ratings", {}).get("count", 0),
            "languages": driver.get("languages", []),
            "specialties": driver.get("specialties", [])
        }
    except Exception as e:
        print(f"Error obteniendo detalles del conductor {driver_id}: {str(e)}")
        return {}

def get_available_vehicles_in_zones(db, coordinates: List[float], pickup_date: datetime, estimated_duration: int = 60, address: str = None) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Obtiene vehículos disponibles en zonas fijas que incluyen las coordenadas dadas
    
    Args:
        db: Conexión a la base de datos
        coordinates: Coordenadas del punto de recogida [longitud, latitud]
        pickup_date: Fecha y hora de recogida (en zona horaria local)
        estimated_duration: Duración estimada en minutos
        address: Dirección para determinar zona horaria
    
    Returns:
        tuple: (vehículos_disponibles, vehículos_con_horarios_alternativos)
    """
    # Calcular fecha estimada de fin del servicio
    dropoff_date = pickup_date + timedelta(minutes=estimated_duration)
    
    # Paso 1: Encontrar zonas fijas que incluyen las coordenadas
    zones = find_zones_for_location(db, coordinates)
    
    available_vehicles = []
    alternative_schedule_vehicles = []
    
    # Paso 2: Para cada zona, verificar vehículos asignados
    for zone in zones:
        # Verificar si la zona tiene vehículos asignados
        if "vehicles" not in zone or not isinstance(zone["vehicles"], list):
            continue
        
        for vehicle_data in zone["vehicles"]:
            # Extraer datos del vehículo y chofer
            vehicle_id = vehicle_data.get("id")
            driver_id = vehicle_data.get("driver", {}).get("id")
            
            if not vehicle_id or not driver_id:
                continue
            
            # Paso 3: Verificar disponibilidad del chofer (con zona horaria)
            driver_available = check_driver_availability(
                str(driver_id), 
                pickup_date, 
                dropoff_date,
                address  # Pasar la dirección para conversión de zona horaria
            )
            
            if address:
                print(f"🌍 [ZONA FIJA] Verificando conductor {driver_id} para {address} desde {pickup_date.strftime('%H:%M')} hasta {dropoff_date.strftime('%H:%M')}: {'✅ Disponible' if driver_available else '❌ No disponible'}")
            
            # Paso 4: Verificar conflictos con reservas existentes
            has_conflicts = check_reservation_conflicts(
                db, 
                str(driver_id), 
                str(vehicle_id), 
                pickup_date, 
                dropoff_date
            )
            
            # Paso 5: Obtener datos completos del vehículo y conductor
            vehicle_details = get_vehicle_details(db, str(vehicle_id))
            driver_details = get_driver_details(db, str(driver_id))
            
            # Combinar datos del vehículo de la zona con datos completos de la BD
            enhanced_vehicle_data = vehicle_data.copy()
            if vehicle_details:
                enhanced_vehicle_data.update({
                    "image": vehicle_details.get("image", ""),
                    "imageUrl": vehicle_details.get("imageUrl", ""),
                    "capacity": vehicle_details.get("capacity", 4),
                    "type": vehicle_details.get("type", "sedan"),
                    "color": vehicle_details.get("color", ""),
                    "year": vehicle_details.get("year", "")
                })
            
            # Actualizar datos del conductor con información completa
            if driver_details and "driver" in enhanced_vehicle_data:
                enhanced_vehicle_data["driver"].update({
                    "phone": driver_details.get("phone", ""),
                    "email": driver_details.get("email", ""),
                    "whatsapp": driver_details.get("whatsapp", ""),
                    "license_number": driver_details.get("license_number", ""),
                    "experience_years": driver_details.get("experience_years", 0),
                    "rating": driver_details.get("rating", 0),
                    "total_trips": driver_details.get("total_trips", 0),
                    "languages": driver_details.get("languages", []),
                    "specialties": driver_details.get("specialties", [])
                })
            elif driver_details:
                # Si no existe driver en vehicle_data, crearlo
                enhanced_vehicle_data["driver"] = driver_details
            
            # Datos base del vehículo
            vehicle_info = {
                "vehicle_id": str(vehicle_id),
                "driver_id": str(driver_id),
                "vehicle_data": enhanced_vehicle_data,
                "zone_name": zone.get("name"),
                "zone_id": str(zone.get("_id")),
                "pricing": zone.get("pricing", {}),
                "availability_type": "fixed_zone",
                "available_duration": estimated_duration,  # Confirmamos que está disponible para toda la duración
                "estimated_end_time": dropoff_date.strftime("%H:%M")  # Hora estimada de fin
            }
            
            # Si el chofer está disponible y no hay conflictos, agregar a disponibles
            if driver_available and not has_conflicts:
                available_vehicles.append(vehicle_info)
            else:
                # Si no está disponible, agregar a horarios alternativos
                alternative_info = vehicle_info.copy()
                
                # Determinar motivo de no disponibilidad
                if has_conflicts:
                    alternative_info["unavailable_reason"] = "En otro viaje programado"
                elif not driver_available:
                    alternative_info["unavailable_reason"] = "Fuera del horario de trabajo"
                
                # Obtener horarios alternativos del conductor para el día
                try:
                    date_start = pickup_date.replace(hour=0, minute=0, second=0, microsecond=0)
                    date_end = date_start + timedelta(days=1)
                    
                    print(f"🔄 [DEBUG ZONA FIJA] Obteniendo horarios alternativos para conductor {driver_id}")
                    alternative_slots = get_driver_available_time_slots(
                        str(driver_id),
                        date_start,
                        date_end,
                        address  # Pasar la dirección para conversión de zona horaria
                    )
                    
                    print(f"📊 [DEBUG ZONA FIJA] Alternative slots obtenidos: {len(alternative_slots)}")
                    
                    if alternative_slots:
                        alternative_info["alternative_time_slots"] = alternative_slots
                        print(f"✅ [DEBUG ZONA FIJA] alternative_time_slots asignado con {len(alternative_slots)} slots")
                        
                        # Encontrar la próxima disponibilidad
                        future_slots = [slot for slot in alternative_slots 
                                      if datetime.strptime(slot["start_time"], "%H:%M").time() > pickup_date.time()]
                        
                        if future_slots:
                            next_slot = min(future_slots, key=lambda x: x["start_time"])
                            alternative_info["next_available_time"] = f"Hoy a las {next_slot['start_time']}"
                        else:
                            alternative_info["next_available_time"] = "Mañana (consultar horarios)"
                    else:
                        print(f"⚠️ [DEBUG ZONA FIJA] No se obtuvieron alternative_slots para conductor {driver_id}")
                    
                    print(f"🔍 [DEBUG ZONA FIJA] Claves en alternative_info antes de agregar: {list(alternative_info.keys())}")
                    alternative_schedule_vehicles.append(alternative_info)
                    
                except Exception as e:
                    print(f"❌ [ERROR ZONA FIJA] Error obteniendo horarios alternativos para conductor {driver_id}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    # Aún agregar el vehículo pero sin horarios alternativos
                    alternative_schedule_vehicles.append(alternative_info)
    
    return available_vehicles, alternative_schedule_vehicles

def get_available_vehicles_flexible(db, coordinates: List[float], pickup_date: datetime, estimated_duration: int = 60, max_distance_km: float = 10, address: str = None) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Obtiene vehículos disponibles con ruta flexible cercanos a las coordenadas dadas
    
    Args:
        db: Conexión a la base de datos
        coordinates: Coordenadas del punto de recogida [longitud, latitud]
        pickup_date: Fecha y hora de recogida (en zona horaria local)
        estimated_duration: Duración estimada en minutos
        max_distance_km: Distancia máxima de búsqueda en kilómetros
        address: Dirección para determinar zona horaria
    
    Returns:
        tuple: (vehículos_disponibles, vehículos_con_horarios_alternativos)
    """
    # Calcular fecha estimada de fin del servicio
    dropoff_date = pickup_date + timedelta(minutes=estimated_duration)
    
    # Paso 1: Encontrar vehículos cercanos a las coordenadas
    nearby_vehicles = find_nearby_vehicles(db, coordinates, max_distance_km)
    
    available_vehicles = []
    alternative_schedule_vehicles = []
    
    # Paso 2: Para cada vehículo, verificar disponibilidad del chofer
    for vehicle in nearby_vehicles:
        vehicle_id = vehicle.get("_id")
        
        # Verificar si el vehículo tiene choferes asociados
        associated_drivers = vehicle.get("associatedDrivers", [])
        if not associated_drivers:
            continue
        
        # Verificar cada conductor asociado
        vehicle_processed = False
        for driver_id in associated_drivers:
            if vehicle_processed:
                break
                
            # Paso 3: Verificar disponibilidad del chofer (con zona horaria)
            driver_available = check_driver_availability(
                str(driver_id), 
                pickup_date, 
                dropoff_date,
                address  # Pasar la dirección para conversión de zona horaria
            )
            
            if address:
                print(f"🌍 [RUTA FLEXIBLE] Verificando conductor {driver_id} para {address} desde {pickup_date.strftime('%H:%M')} hasta {dropoff_date.strftime('%H:%M')}: {'✅ Disponible' if driver_available else '❌ No disponible'}")
            
            # Paso 4: Verificar conflictos con reservas existentes
            has_conflicts = check_reservation_conflicts(
                db, 
                str(driver_id), 
                str(vehicle_id), 
                pickup_date, 
                dropoff_date
            )
            
            # Obtener detalles completos del vehículo y conductor
            try:
                # Obtener datos completos del vehículo
                vehicle_details = get_vehicle_details(db, str(vehicle_id))
                
                # Obtener datos completos del conductor
                driver_details = get_driver_details(db, str(driver_id))
                if not driver_details:
                    continue
                
                # Combinar datos del vehículo existente con datos completos de la BD
                enhanced_vehicle_data = {
                    "model": vehicle_details.get("model", "") or vehicle.get("details", {}).get("model", "") or vehicle.get("name", ""),
                    "name": vehicle_details.get("name", "") or vehicle.get("name", ""),
                    "licensePlate": vehicle_details.get("licensePlate", "") or vehicle.get("licensePlate", ""),
                    "image": vehicle_details.get("image", ""),
                    "imageUrl": vehicle_details.get("imageUrl", ""),
                    "capacity": vehicle_details.get("capacity", 4),
                    "type": vehicle_details.get("type", "sedan"),
                    "color": vehicle_details.get("color", ""),
                    "year": vehicle_details.get("year", ""),
                    "driver": driver_details
                }
                
                # Datos base del vehículo
                vehicle_info = {
                    "vehicle_id": str(vehicle_id),
                    "driver_id": str(driver_id),
                    "vehicle_data": enhanced_vehicle_data,
                    "pricing": vehicle.get("pricing", {}),
                    "availability_type": "flexible_route",
                    "distance_km": vehicle.get("distance_calculated", 0),
                    "available_duration": estimated_duration,  # Confirmamos que está disponible para toda la duración
                    "estimated_end_time": dropoff_date.strftime("%H:%M")  # Hora estimada de fin
                }
                
                # Si el chofer está disponible y no hay conflictos, agregar a disponibles
                if driver_available and not has_conflicts:
                    available_vehicles.append(vehicle_info)
                    vehicle_processed = True
                else:
                    # Si no está disponible, agregar a horarios alternativos
                    alternative_info = vehicle_info.copy()
                    
                    # Determinar motivo de no disponibilidad
                    if has_conflicts:
                        alternative_info["unavailable_reason"] = "En otro viaje programado"
                    elif not driver_available:
                        alternative_info["unavailable_reason"] = "Fuera del horario de trabajo"
                    
                    # Obtener horarios alternativos del conductor para el día
                    try:
                        date_start = pickup_date.replace(hour=0, minute=0, second=0, microsecond=0)
                        date_end = date_start + timedelta(days=1)
                        
                        print(f"🔄 [DEBUG] Obteniendo horarios alternativos para conductor {driver_id}")
                        alternative_slots = get_driver_available_time_slots(
                            str(driver_id),
                            date_start,
                            date_end,
                            address  # Pasar la dirección para conversión de zona horaria
                        )
                        
                        print(f"📊 [DEBUG] Alternative slots obtenidos: {len(alternative_slots)}")
                        
                        if alternative_slots:
                            alternative_info["alternative_time_slots"] = alternative_slots
                            print(f"✅ [DEBUG] alternative_time_slots asignado con {len(alternative_slots)} slots")
                            
                            # Encontrar la próxima disponibilidad
                            future_slots = [slot for slot in alternative_slots 
                                          if datetime.strptime(slot["start_time"], "%H:%M").time() > pickup_date.time()]
                            
                            if future_slots:
                                next_slot = min(future_slots, key=lambda x: x["start_time"])
                                alternative_info["next_available_time"] = f"Hoy a las {next_slot['start_time']}"
                            else:
                                alternative_info["next_available_time"] = "Mañana (consultar horarios)"
                        else:
                            print(f"⚠️ [DEBUG] No se obtuvieron alternative_slots para conductor {driver_id}")
                        
                        print(f"🔍 [DEBUG] Claves en alternative_info antes de agregar: {list(alternative_info.keys())}")
                        alternative_schedule_vehicles.append(alternative_info)
                        vehicle_processed = True
                        
                    except Exception as e:
                        print(f"❌ [ERROR] Error obteniendo horarios alternativos para conductor {driver_id}: {str(e)}")
                        import traceback
                        traceback.print_exc()
                        # Aún agregar el vehículo pero sin horarios alternativos
                        alternative_schedule_vehicles.append(alternative_info)
                        vehicle_processed = True
                        
            except Exception as e:
                print(f"Error al obtener detalles del chofer {driver_id}: {str(e)}")
                continue
    
    return available_vehicles, alternative_schedule_vehicles

def check_vehicle_availability_for_location(db, address: str, coordinates: List[float], pickup_date: datetime, estimated_duration: int = 60) -> Dict[str, Any]:
    """
    Verifica la disponibilidad de vehículos para una ubicación específica
    
    Args:
        db: Conexión a la base de datos
        address: Dirección legible del punto de recogida
        coordinates: Coordenadas del punto de recogida [longitud, latitud]
        pickup_date: Fecha y hora de recogida
        estimated_duration: Duración estimada en minutos
    
    Returns:
        Dict[str, Any]: Resultado de la búsqueda con vehículos disponibles y alternativos
    """
    # Paso 1: Buscar en zonas fijas (prioridad)
    fixed_zone_vehicles, fixed_zone_alternatives = get_available_vehicles_in_zones(
        db, 
        coordinates, 
        pickup_date, 
        estimated_duration,
        address  # Pasar la dirección para conversión de zona horaria
    )
    
    # Paso 2: Si no hay resultados en zonas fijas, buscar con ruta flexible
    flexible_route_vehicles = []
    flexible_route_alternatives = []
    
    if not fixed_zone_vehicles:
        flexible_route_vehicles, flexible_route_alternatives = get_available_vehicles_flexible(
            db, 
            coordinates, 
            pickup_date, 
            estimated_duration,
            10.0,  # max_distance_km por defecto
            address  # Pasar la dirección para conversión de zona horaria
        )
    
    # Combinar resultados
    all_available_vehicles = fixed_zone_vehicles + flexible_route_vehicles
    all_alternative_vehicles = fixed_zone_alternatives + flexible_route_alternatives
    
    # Ordenar por tipo de disponibilidad (primero zonas fijas)
    all_available_vehicles.sort(key=lambda x: 0 if x["availability_type"] == "fixed_zone" else 1)
    all_alternative_vehicles.sort(key=lambda x: 0 if x["availability_type"] == "fixed_zone" else 1)
    
    result = {
        "address": address,
        "coordinates": coordinates,
        "pickup_date": pickup_date.isoformat(),
        "estimated_duration": estimated_duration,
        "total_vehicles_found": len(all_available_vehicles),
        "fixed_zone_count": len(fixed_zone_vehicles),
        "flexible_route_count": len(flexible_route_vehicles),
        "available_vehicles": all_available_vehicles
    }
    
    # Agregar vehículos con horarios alternativos si los hay
    if all_alternative_vehicles:
        result["vehicles_with_alternative_schedules"] = all_alternative_vehicles
        result["alternative_vehicles_count"] = len(all_alternative_vehicles)
    
    return result 