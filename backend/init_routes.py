from pymongo import MongoClient
from dotenv import load_dotenv
import os
import datetime

# Cargar variables de entorno
load_dotenv()

# Conexión a MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']

# Colecciones
fixed_routes_collection = db['fixed_routes']
flexible_zones_collection = db['flexible_zones']

# Eliminar datos existentes
fixed_routes_collection.delete_many({})
flexible_zones_collection.delete_many({})

print("Datos de rutas eliminados. Insertando nuevos datos...")

# Datos de ejemplo para rutas fijas
fixed_routes = [
    {
        "name": "AICM → Santa Fe",
        "origin": {
            "name": "Aeropuerto Internacional de la Ciudad de México",
            "location": {
                "type": "Point",
                "coordinates": [-99.0721, 19.4361]
            }
        },
        "destination": {
            "name": "Centro Santa Fe",
            "location": {
                "type": "Point",
                "coordinates": [-99.2618, 19.3659]
            }
        },
        "vehicle": {
            "id": "v1",  # ID ficticio, se actualizará después
            "licensePlate": "XYZ-123",
            "model": "Mercedes-Benz Clase S",
            "imageUrl": "https://images.unsplash.com/photo-1549925862-990918991bda?q=80&w=300"
        },
        "driver": {
            "id": "d1",  # ID ficticio, se actualizará después
            "name": "Carlos Rodríguez",
            "photo": "https://randomuser.me/api/portraits/men/32.jpg"
        },
        "pricing": {
            "standard": 1200,
            "night": 1500,
            "holiday": 1800,
            "currency": "MXN"
        },
        "availability": {
            "timeSlots": ["08:00-12:00", "14:00-20:00"],
            "days": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        },
        "status": "active",
        "distance": 23,
        "estimatedTime": 45,
        "collaboratorId": "c1",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    },
    {
        "name": "Polanco → Interlomas",
        "origin": {
            "name": "Polanco",
            "location": {
                "type": "Point",
                "coordinates": [-99.1892, 19.4284]
            }
        },
        "destination": {
            "name": "Interlomas",
            "location": {
                "type": "Point",
                "coordinates": [-99.2839, 19.3812]
            }
        },
        "vehicle": {
            "id": "v2",  # ID ficticio, se actualizará después
            "licensePlate": "ABC-456",
            "model": "BMW X5",
            "imageUrl": "https://images.unsplash.com/photo-1549027032-1966ef60d3cc?q=80&w=300"
        },
        "driver": {
            "id": "d2",  # ID ficticio, se actualizará después
            "name": "Laura Martínez",
            "photo": "https://randomuser.me/api/portraits/women/45.jpg"
        },
        "pricing": {
            "standard": 800,
            "night": 1000,
            "holiday": 1200,
            "currency": "MXN"
        },
        "availability": {
            "timeSlots": ["09:00-14:00", "16:00-22:00"],
            "days": ["Lunes", "Miércoles", "Viernes", "Sábado"]
        },
        "status": "active",
        "distance": 12,
        "estimatedTime": 25,
        "collaboratorId": "c2",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    },
    {
        "name": "Aeropuerto → Centro Histórico",
        "origin": {
            "name": "Aeropuerto Internacional de la Ciudad de México",
            "location": {
                "type": "Point",
                "coordinates": [-99.0721, 19.4361]
            }
        },
        "destination": {
            "name": "Zócalo, Centro Histórico",
            "location": {
                "type": "Point",
                "coordinates": [-99.1332, 19.4326]
            }
        },
        "vehicle": {
            "id": "v3",  # ID ficticio, se actualizará después
            "licensePlate": "MNO-789",
            "model": "Audi A8 L",
            "imageUrl": "https://plus.unsplash.com/premium_photo-1664300706064-316026925c90?q=80&w=300"
        },
        "pricing": {
            "standard": 950,
            "night": 1200,
            "holiday": 1400,
            "currency": "MXN"
        },
        "availability": {
            "timeSlots": ["00:00-23:59"],
            "days": ["Todos"]
        },
        "status": "inactive",
        "distance": 15,
        "estimatedTime": 35,
        "collaboratorId": "c3",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }
]

# Datos de ejemplo para zonas flexibles
flexible_zones = [
    {
        "name": "Zona Centro CDMX",
        "center": {
            "name": "Centro Histórico",
            "location": {
                "type": "Point",
                "coordinates": [-99.1332, 19.4326]
            }
        },
        "radius": 10,
        "vehicles": [
            {
                "id": "v1",  # ID ficticio, se actualizará después
                "licensePlate": "XYZ-123",
                "model": "Mercedes-Benz Clase S"
            },
            {
                "id": "v2",  # ID ficticio, se actualizará después
                "licensePlate": "ABC-456",
                "model": "BMW X5"
            }
        ],
        "pricing": {
            "perKm": 25,
            "minFare": 300,
            "nightSurcharge": 10,
            "holidaySurcharge": 15,
            "currency": "MXN"
        },
        "restrictions": {
            "minDistance": 2,
            "maxDistance": 30
        },
        "status": "active",
        "description": "Servicios flexibles en el centro de la Ciudad de México",
        "collaboratorId": "c1",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    },
    {
        "name": "Zona Polanco-Lomas",
        "center": {
            "name": "Polanco",
            "location": {
                "type": "Point",
                "coordinates": [-99.1892, 19.4284]
            }
        },
        "radius": 15,
        "vehicles": [
            {
                "id": "v3",  # ID ficticio, se actualizará después
                "licensePlate": "MNO-789",
                "model": "Audi A8 L"
            }
        ],
        "pricing": {
            "perKm": 30,
            "minFare": 350,
            "nightSurcharge": 12,
            "holidaySurcharge": 18,
            "currency": "MXN"
        },
        "status": "active",
        "description": "Servicios premium en la zona de Polanco y Las Lomas",
        "collaboratorId": "c2",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    },
    {
        "name": "Zona Santa Fe",
        "center": {
            "name": "Centro Santa Fe",
            "location": {
                "type": "Point",
                "coordinates": [-99.2618, 19.3659]
            }
        },
        "radius": 8,
        "vehicles": [
            {
                "id": "v2",  # ID ficticio, se actualizará después
                "licensePlate": "ABC-456",
                "model": "BMW X5"
            }
        ],
        "pricing": {
            "perKm": 28,
            "minFare": 320,
            "nightSurcharge": 11,
            "holidaySurcharge": 16,
            "currency": "MXN"
        },
        "restrictions": {
            "minDistance": 3,
            "maxDistance": 25
        },
        "status": "inactive",
        "description": "Servicio flexible para la zona de negocios de Santa Fe",
        "collaboratorId": "c3",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }
]

# Obtener vehículos reales para actualizar los IDs
# Esto asume que ya existen vehículos en la base de datos
vehicles = list(db['vehicles'].find({}, {"_id": 1, "details.model": 1, "licensePlate": 1}))

# Obtener conductores reales para actualizar los IDs
# Esto asume que ya existen conductores en la base de datos
drivers = list(db['drivers'].find({}, {"_id": 1, "first_name": 1, "last_name": 1, "photo": 1}))

# Obtener colaboradores reales para actualizar los IDs
# Esto asume que ya existen colaboradores en la base de datos
collaborators = list(db['collaborators'].find({}, {"_id": 1, "name": 1}))

# Actualizar IDs de vehículos, conductores y colaboradores si hay disponibles
if vehicles:
    # Actualizar rutas fijas
    for route in fixed_routes:
        for vehicle in vehicles:
            if route["vehicle"]["model"] in vehicle.get("details", {}).get("model", ""):
                route["vehicle"]["id"] = str(vehicle["_id"])
                break
        
        # Actualizar los IDs de conductores si hay información de conductor en la ruta
        if "driver" in route:
            for driver in drivers:
                # Crear el nombre completo del conductor para comparar
                driver_full_name = f"{driver.get('first_name', '')} {driver.get('last_name', '')}"
                
                if driver_full_name in route.get("driver", {}).get("name", ""):
                    route["driver"]["id"] = str(driver["_id"])
                    break
    
    # Actualizar zonas flexibles
    for zone in flexible_zones:
        for vehicle_data in zone["vehicles"]:
            for vehicle in vehicles:
                if vehicle_data["model"] in vehicle.get("details", {}).get("model", ""):
                    vehicle_data["id"] = str(vehicle["_id"])
                    break

# Actualizar IDs de colaboradores si hay disponibles
if collaborators:
    # Formato de mapeo de los IDs temporales a los reales
    collab_mapping = {
        "c1": collaborators[0]["_id"] if len(collaborators) > 0 else None,
        "c2": collaborators[1]["_id"] if len(collaborators) > 1 else None,
        "c3": collaborators[2]["_id"] if len(collaborators) > 2 else None
    }
    
    # Actualizar rutas fijas
    for route in fixed_routes:
        temp_id = route.get("collaboratorId")
        if temp_id in collab_mapping and collab_mapping[temp_id]:
            route["collaboratorId"] = str(collab_mapping[temp_id])
    
    # Actualizar zonas flexibles
    for zone in flexible_zones:
        temp_id = zone.get("collaboratorId")
        if temp_id in collab_mapping and collab_mapping[temp_id]:
            zone["collaboratorId"] = str(collab_mapping[temp_id])

# Insertar datos de rutas fijas
if fixed_routes:
    fixed_routes_collection.insert_many(fixed_routes)
    print(f"Se insertaron {len(fixed_routes)} rutas fijas de ejemplo")

# Insertar datos de zonas flexibles
if flexible_zones:
    flexible_zones_collection.insert_many(flexible_zones)
    print(f"Se insertaron {len(flexible_zones)} zonas flexibles de ejemplo")

print("Inicialización de datos de rutas completada") 