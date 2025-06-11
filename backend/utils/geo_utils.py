import math
import os
import requests
from typing import List, Dict, Tuple, Any, Optional
from bson import ObjectId

def calculate_distance(point1: List[float], point2: List[float]) -> float:
    """
    Calcula la distancia en kilómetros entre dos puntos geográficos usando la fórmula de Haversine
    
    Args:
        point1: Coordenadas del primer punto [longitud, latitud]
        point2: Coordenadas del segundo punto [longitud, latitud]
    
    Returns:
        float: Distancia en kilómetros
    """
    # Radio de la Tierra en kilómetros
    earth_radius = 6371.0
    
    # Convertir coordenadas de grados a radianes
    lon1 = math.radians(point1[0])
    lat1 = math.radians(point1[1])
    lon2 = math.radians(point2[0])
    lat2 = math.radians(point2[1])
    
    # Diferencias de coordenadas
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    
    # Fórmula de Haversine
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = earth_radius * c
    
    return distance

def is_point_in_circle(point: List[float], center: List[float], radius_km: float) -> bool:
    """
    Verifica si un punto está dentro de un círculo definido por un centro y radio
    
    Args:
        point: Coordenadas del punto a verificar [longitud, latitud]
        center: Coordenadas del centro del círculo [longitud, latitud]
        radius_km: Radio del círculo en kilómetros
    
    Returns:
        bool: True si el punto está dentro del círculo, False si no
    """
    distance = calculate_distance(point, center)
    return distance <= radius_km

def find_zones_for_location(db, coordinates: List[float]) -> List[Dict[str, Any]]:
    """
    Encuentra zonas fijas que incluyen las coordenadas dadas
    
    Args:
        db: Conexión a la base de datos
        coordinates: Coordenadas a buscar [longitud, latitud]
    
    Returns:
        List[Dict[str, Any]]: Lista de documentos de zonas que incluyen las coordenadas
    """
    fixed_routes_collection = db['fixed_routes']
    
    try:
        # Método 1: Utilizar consulta geoespacial $geoWithin con $centerSphere
        zones = list(fixed_routes_collection.find({
            "center.location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": coordinates
                    }
                }
            },
            "status": "active"
        }))
        
        # Filtrar manualmente para verificar si el punto está dentro del radio de cada zona
        filtered_zones = []
        for zone in zones:
            # Obtener centro y radio
            center_coordinates = zone.get("center", {}).get("location", {}).get("coordinates", [0, 0])
            radius_km = zone.get("radius", 0)
            
            # Verificar si las coordenadas están dentro del círculo
            if is_point_in_circle(coordinates, center_coordinates, radius_km):
                filtered_zones.append(zone)
        
        return filtered_zones
        
    except Exception as e:
        print(f"Error en consulta geoespacial $near: {str(e)}")
        
        # Método alternativo: Obtener todas las zonas activas y filtrar manualmente
        try:
            all_zones = list(fixed_routes_collection.find({"status": "active"}))
            
            # Filtrar zonas que incluyen las coordenadas
            filtered_zones = []
            for zone in all_zones:
                # Obtener centro y radio
                center_coordinates = zone.get("center", {}).get("location", {}).get("coordinates", [0, 0])
                radius_km = zone.get("radius", 0)
                
                # Verificar si las coordenadas están dentro del círculo
                if is_point_in_circle(coordinates, center_coordinates, radius_km):
                    filtered_zones.append(zone)
            
            return filtered_zones
            
        except Exception as e2:
            print(f"Error en método alternativo para buscar zonas: {str(e2)}")
            return []

def find_nearby_vehicles(db, coordinates: List[float], max_distance_km: float = 10) -> List[Dict[str, Any]]:
    """
    Encuentra vehículos cercanos a las coordenadas dadas dentro de un radio específico
    
    Args:
        db: Conexión a la base de datos
        coordinates: Coordenadas a buscar [longitud, latitud]
        max_distance_km: Distancia máxima en kilómetros (default: 10km)
    
    Returns:
        List[Dict[str, Any]]: Lista de documentos de vehículos cercanos
    """
    vehicles_collection = db['vehicles']
    
    try:
        # Convertir km a metros para la consulta
        max_distance_m = max_distance_km * 1000
        
        # Utilizar $nearSphere para encontrar vehículos cercanos
        vehicles = list(vehicles_collection.find({
            "location": {
                "$nearSphere": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": coordinates
                    },
                    "$maxDistance": max_distance_m
                }
            },
            "available": True,
            "availabilityType": "flexible_route"
        }))
        
        # Calcular y añadir la distancia exacta a cada vehículo
        for vehicle in vehicles:
            vehicle_coordinates = vehicle.get("location", {}).get("coordinates", coordinates)
            distance = calculate_distance(coordinates, vehicle_coordinates)
            vehicle["distance_calculated"] = distance
        
        # Filtrar vehículos que están dentro del radio de disponibilidad específico del vehículo
        vehicles = [v for v in vehicles if v.get("distance_calculated", 0) <= v.get("availability_radius", max_distance_km)]
        
        return vehicles
    except Exception as e:
        print(f"Error al buscar vehículos cercanos con $nearSphere: {str(e)}")
        
        # Método alternativo si falla la consulta geoespacial
        try:
            # Obtener todos los vehículos disponibles
            vehicles = list(vehicles_collection.find({
                "available": True,
                "availabilityType": "flexible_route"
            }))
            
            # Filtrar por distancia manualmente
            filtered_vehicles = []
            for vehicle in vehicles:
                vehicle_coordinates = vehicle.get("location", {}).get("coordinates", [0, 0])
                if not vehicle_coordinates or len(vehicle_coordinates) != 2:
                    continue
                
                # Calcular distancia
                distance = calculate_distance(coordinates, vehicle_coordinates)
                
                # Verificar si está dentro del radio de disponibilidad
                vehicle_radius = vehicle.get("availability_radius", max_distance_km)
                if distance <= vehicle_radius:
                    vehicle["distance_calculated"] = distance
                    filtered_vehicles.append(vehicle)
            
            # Ordenar por distancia
            filtered_vehicles.sort(key=lambda v: v.get("distance_calculated", float('inf')))
            
            return filtered_vehicles
        except Exception as e2:
            print(f"Error en método alternativo para buscar vehículos: {str(e2)}")
            return []

def check_reservation_conflicts(db, driver_id: str, vehicle_id: str, start_date, end_date) -> bool:
    """
    Verifica si existen conflictos de reservas para un chofer y vehículo en un período dado
    
    Args:
        db: Conexión a la base de datos
        driver_id: ID del chofer
        vehicle_id: ID del vehículo
        start_date: Fecha y hora de inicio
        end_date: Fecha y hora de fin estimada
    
    Returns:
        bool: True si hay conflictos, False si está disponible
    """
    reservations_collection = db['reservations']
    
    try:
        # Convertir IDs a ObjectId si no son ya ObjectId
        if isinstance(driver_id, str):
            driver_id = ObjectId(driver_id)
        if isinstance(vehicle_id, str):
            vehicle_id = ObjectId(vehicle_id)
            
        # Verificar reservas existentes que se solapan con el período solicitado
        conflicts = reservations_collection.find_one({
            "$or": [
                {"driver_id": driver_id},
                {"vehicle_id": vehicle_id}
            ],
            "$or": [
                {
                    "pickup.date": {"$lte": start_date},
                    "dropoff.estimated_date": {"$gte": start_date}
                },
                {
                    "pickup.date": {"$lte": end_date},
                    "dropoff.estimated_date": {"$gte": end_date}
                },
                {
                    "pickup.date": {"$gte": start_date},
                    "dropoff.estimated_date": {"$lte": end_date}
                }
            ],
            "status": {"$nin": ["cancelled", "rejected"]}
        })
        
        return conflicts is not None
    except Exception as e:
        print(f"Error al verificar conflictos de reservas: {str(e)}")
        return True  # Por seguridad, considerar que hay conflicto si hay error 

def get_coordinates_from_address(address):
    """
    Obtiene coordenadas [longitud, latitud] a partir de una dirección usando Google Maps Geocoding API
    
    Args:
        address: Dirección en texto
    
    Returns:
        List[float]: Coordenadas [longitud, latitud] o None si no se encontraron
    """
    try:
        # Obtener API key de Google Maps desde variables de entorno
        api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
        
        if not api_key:
            print("No se encontró la API key de Google Maps")
            return None
        
        # Hacer request a Google Maps Geocoding API
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
        response = requests.get(url)
        data = response.json()
        
        # Verificar si se encontraron resultados
        if data['status'] == 'OK' and data['results']:
            location = data['results'][0]['geometry']['location']
            # Nota: Google Maps devuelve [latitud, longitud], pero MongoDB usa [longitud, latitud]
            return [location['lng'], location['lat']]
        else:
            print(f"No se encontraron coordenadas para la dirección: {address}")
            return None
            
    except Exception as e:
        print(f"Error al obtener coordenadas: {str(e)}")
        return None 