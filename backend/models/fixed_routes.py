from flask import current_app
from pymongo.collection import Collection
from bson import ObjectId
from datetime import datetime
from typing import Dict, List, Optional, Any

# Variable para la colección, se inicializará en setup_collection
fixed_routes_collection: Optional[Collection] = None

def setup_collection(db):
    """Inicializa la colección fixed_routes y sus índices"""
    global fixed_routes_collection
    
    # Inicializar la colección
    fixed_routes_collection = db['fixed_routes']
    
    # Crear índices
    fixed_routes_collection.create_index("collaboratorId")
    fixed_routes_collection.create_index("status")
    
    # Añadir índice geoespacial para consultas espaciales
    fixed_routes_collection.create_index([("center.location", "2dsphere")])
    
    return fixed_routes_collection

def get_fixed_route(route_id: str) -> Optional[Dict[str, Any]]:
    """Obtiene una ruta fija por su ID"""
    if fixed_routes_collection is None:
        raise Exception("La colección fixed_routes no está inicializada")
    
    try:
        route_id_obj = ObjectId(route_id)
        return fixed_routes_collection.find_one({"_id": route_id_obj})
    except Exception as e:
        print(f"Error al obtener ruta fija: {str(e)}")
        return None

def get_active_fixed_routes() -> List[Dict[str, Any]]:
    """Obtiene todas las rutas fijas activas"""
    if fixed_routes_collection is None:
        raise Exception("La colección fixed_routes no está inicializada")
    
    try:
        return list(fixed_routes_collection.find({"status": "active"}))
    except Exception as e:
        print(f"Error al obtener rutas fijas activas: {str(e)}")
        return []

def find_routes_containing_point(coordinates: List[float]) -> List[Dict[str, Any]]:
    """
    Encuentra rutas fijas que contienen un punto específico
    
    Args:
        coordinates: Coordenadas del punto [longitud, latitud]
    
    Returns:
        List[Dict[str, Any]]: Lista de rutas que contienen el punto
    """
    if fixed_routes_collection is None:
        raise Exception("La colección fixed_routes no está inicializada")
    
    try:
        # Usar consulta geoespacial con $geoWithin para encontrar rutas que incluyan las coordenadas
        routes = list(fixed_routes_collection.find({
            "center.location": {
                "$geoWithin": {
                    "$centerSphere": [
                        coordinates,
                        0  # Este valor se ajustará en la función de servicio
                    ]
                }
            },
            "status": "active"
        }))
        
        return routes
    except Exception as e:
        print(f"Error al buscar rutas que contienen el punto: {str(e)}")
        return [] 