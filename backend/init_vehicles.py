from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pymongo.errors import BulkWriteError
from pymongo.collection import Collection
import pymongo
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
vehicles_collection = db['vehicles']
routes_collection = db['fixed_routes']

# Crear índice geoespacial para búsquedas por ubicación
vehicles_collection.create_index([("location", pymongo.GEOSPHERE)])

# Datos de vehículos de ejemplo
vehicles_data = [
    # Autos de lujo
    {
        "type": "sedan",
        "category": "business_class",
        "name": "Mercedes Benz E-Class",
        "description": "Coche ejecutivo cómodo y elegante",
        "details": {
            "brand": "Mercedes-Benz",
            "model": "E-Class",
            "year": 2023,
            "color": "Negro",
            "features": ["Asientos de cuero", "Climatizador", "WiFi", "Agua embotellada"],
            "armored": False
        },
        "capacity": {
            "passengers": 3,
            "luggage": 2
        },
        "pricing": {
            "base_fare": 132.45,
            "per_km": 2.5,
            "per_hour": 45.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.1332, 19.4326]  # CDMX
        },
        "availability_radius": 25.0,  # Radio en km
        "available": True,
        "image": "/assets/cars/mercedes-e-class.png",
        # Campos adicionales
        "licensePlate": "1234ABC",
        "ownerType": "company",
                    "ownerName": "Privyde Transport",
        "ownerCountry": "ES",
        "availabilityType": "zone",
        "availabilityDetails": "Madrid Centro",
        "associatedDrivers": ["driver_101", "driver_102"],
        "insurancePolicyNumber": "INS-001-12345",
        "lastMaintenanceDate": "2024-05-15",
        "contractEndDate": "2025-12-31",
        "notes": "Vehículo principal para ejecutivos. Revisar estado semanalmente."
    },
    {
        "type": "sedan",
        "category": "first_class",
        "name": "Mercedes Benz S-Class",
        "description": "La máxima experiencia de lujo para viajes ejecutivos",
        "details": {
            "brand": "Mercedes-Benz",
            "model": "S-Class",
            "year": 2023,
            "color": "Negro",
            "features": ["Asientos con masaje", "Minibar", "WiFi", "Pantallas traseras", "Champagne"],
            "armored": False
        },
        "capacity": {
            "passengers": 3,
            "luggage": 2
        },
        "pricing": {
            "base_fare": 205.25,
            "per_km": 3.2,
            "per_hour": 65.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.1309, 19.4241]  # CDMX
        },
        "availability_radius": 30.0,
        "available": True,
        "image": "/assets/cars/mercedes-s-class.png",
        # Campos adicionales
        "licensePlate": "5678DEF",
        "ownerType": "company",
        "ownerName": "Luxury Fleet SL",
        "ownerCountry": "ES",
        "availabilityType": "zone",
        "availabilityDetails": "Madrid Capital y aeropuerto",
        "associatedDrivers": ["driver_201", "driver_203"],
        "insurancePolicyNumber": "INS-002-67890",
        "lastMaintenanceDate": "2024-06-01",
        "contractEndDate": "2025-12-31",
        "notes": "Vehículo reservado para clientes premium. Mantener siempre con agua y refrescos."
    },
    # SUVs y Vans
    {
        "type": "suv",
        "category": "business_van",
        "name": "Mercedes Benz V-Class",
        "description": "Van espaciosa ideal para grupos",
        "details": {
            "brand": "Mercedes-Benz",
            "model": "V-Class",
            "year": 2022,
            "color": "Negro",
            "features": ["Asientos de cuero", "Climatizador", "WiFi", "Espacio amplio"],
            "armored": False
        },
        "capacity": {
            "passengers": 6,
            "luggage": 5
        },
        "pricing": {
            "base_fare": 186.71,
            "per_km": 2.8,
            "per_hour": 55.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.1567, 19.4201]  # CDMX
        },
        "availability_radius": 20.0,
        "available": True,
        "image": "/assets/cars/mercedes-v-class.png",
        # Campos adicionales
        "licensePlate": "9012GHI",
        "ownerType": "private_driver",
        "ownerName": "Carlos Gómez",
        "ownerCountry": "ES",
        "availabilityType": "flexible",
        "availabilityDetails": "Disponible para toda España, viajes cortos y largos",
        "associatedDrivers": ["driver_301"],
        "insurancePolicyNumber": "INS-003-24680",
        "lastMaintenanceDate": "2024-04-20",
        "contractEndDate": "2026-06-30",
        "notes": "Van para grupos corporativos y familias. Incluye sistema multimedia completo."
    },
    # Vehículos blindados
    {
        "type": "sedan",
        "category": "armored_class",
        "name": "Audi A8 Security",
        "description": "Vehículo blindado nivel VR9 con máxima seguridad",
        "details": {
            "brand": "Audi",
            "model": "A8 Security",
            "year": 2022,
            "color": "Negro",
            "features": ["Blindaje VR9", "Compartimentos secretos", "Sistema de oxígeno", "Comunicación segura"],
            "armored": True,
            "armor_level": "VR9"
        },
        "capacity": {
            "passengers": 3,
            "luggage": 1
        },
        "pricing": {
            "base_fare": 450.00,
            "per_km": 5.0,
            "per_hour": 120.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.1622, 19.4400]  # CDMX
        },
        "availability_radius": 40.0,
        "available": True,
        "image": "/assets/cars/audi-a8-security.png",
        # Campos adicionales
        "licensePlate": "3456JKL",
        "ownerType": "company",
        "ownerName": "Security Transport Ltd.",
        "ownerCountry": "ES",
        "availabilityType": "route",
        "availabilityDetails": "Aeropuerto - Embajadas - Centros financieros",
        "associatedDrivers": ["driver_401", "driver_402"],
        "insurancePolicyNumber": "INS-004-13579",
        "lastMaintenanceDate": "2024-03-10",
        "contractEndDate": "2026-12-31",
        "notes": "Vehículo de alta seguridad. Requiere autorización especial para reservas."
    },
    # Limusinas
    {
        "type": "limousine",
        "category": "limousine_class",
        "name": "Limusina Mercedes Benz Maybach",
        "description": "Limusina de lujo para ocasiones especiales",
        "details": {
            "brand": "Mercedes-Benz",
            "model": "Maybach",
            "year": 2023,
            "color": "Negro",
            "features": ["Bar completo", "Sistema de sonido premium", "Luces ambientales", "TV", "Champagne"],
            "armored": False
        },
        "capacity": {
            "passengers": 7,
            "luggage": 3
        },
        "pricing": {
            "base_fare": 350.00,
            "per_km": 4.0,
            "per_hour": 95.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.1702, 19.4170]  # CDMX
        },
        "availability_radius": 35.0,
        "available": True,
        "image": "/assets/cars/maybach-limousine.png",
        # Campos adicionales
        "licensePlate": "7890MNO",
        "ownerType": "company",
        "ownerName": "VIP Events SL",
        "ownerCountry": "ES",
        "availabilityType": "zone",
        "availabilityDetails": "Madrid y Barcelona, eventos especiales",
        "associatedDrivers": ["driver_501", "driver_502", "driver_503"],
        "insurancePolicyNumber": "INS-005-97531",
        "lastMaintenanceDate": "2024-02-25",
        "contractEndDate": "2025-12-31",
        "notes": "Limousina para eventos premium, bodas y ceremonias. Incluye decoración a solicitud."
    },
    # Aeronaves
    {
        "type": "helicopter",
        "category": "air_transfer",
        "name": "Helicóptero Bell 429",
        "description": "Helicóptero ejecutivo para traslados rápidos",
        "details": {
            "brand": "Bell",
            "model": "429",
            "year": 2021,
            "color": "Blanco/Azul",
            "features": ["Interiores de lujo", "Aire acondicionado", "Auriculares Bose", "Refrigerador"],
            "armored": False
        },
        "capacity": {
            "passengers": 6,
            "luggage": 2
        },
        "pricing": {
            "base_fare": 2500.00,
            "per_km": 15.0,
            "per_hour": 1200.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.0882, 19.4360]  # CDMX - Helipuerto
        },
        "availability_radius": 150.0,
        "available": True,
        "image": "/assets/air/bell-429.png",
        # Campos adicionales
        "licensePlate": "HELI-001",
        "ownerType": "company",
        "ownerName": "Sky Executive SL",
        "ownerCountry": "ES",
        "availabilityType": "flexible",
        "availabilityDetails": "Disponible en toda España peninsular",
        "associatedDrivers": ["pilot_101", "pilot_102"],
        "insurancePolicyNumber": "INS-AIR-12345",
        "lastMaintenanceDate": "2024-01-15",
        "contractEndDate": "2026-01-31",
        "notes": "Helicóptero para traslados ejecutivos. Solicitar con 48h de antelación."
    },
    {
        "type": "jet",
        "category": "air_transfer",
        "name": "Jet Privado Embraer Phenom 300",
        "description": "Jet privado para viajes ejecutivos de larga distancia",
        "details": {
            "brand": "Embraer",
            "model": "Phenom 300",
            "year": 2022,
            "color": "Blanco/Dorado",
            "features": ["Cabina de lujo", "Dormitorio", "Baño completo", "Cocina equipada", "Entretenimiento a bordo"],
            "armored": False
        },
        "capacity": {
            "passengers": 9,
            "luggage": 6
        },
        "pricing": {
            "base_fare": 15000.00,
            "per_km": 25.0,
            "per_hour": 3500.00,
            "currency": "EUR"
        },
        "location": {
            "type": "Point",
            "coordinates": [-99.0721, 19.4360]  # CDMX - Aeropuerto
        },
        "availability_radius": 500.0,
        "available": True,
        "image": "/assets/air/embraer-phenom-300.png",
        # Campos adicionales
        "licensePlate": "JET-001",
        "ownerType": "company",
        "ownerName": "Global Executive Jets",
        "ownerCountry": "ES",
        "availabilityType": "flexible",
        "availabilityDetails": "Rutas internacionales, vuelos intercontinentales",
        "associatedDrivers": ["pilot_201", "pilot_202", "pilot_203"],
        "insurancePolicyNumber": "INS-JET-67890",
        "lastMaintenanceDate": "2024-04-05",
        "contractEndDate": "2027-12-31",
        "notes": "Jet para viajes intercontinentales. Reserva con mínimo 72h de antelación."
    }
]

# Datos de rutas fijas con múltiples vehículos
fixed_routes_data = [
    {
        "name": "AICM → Santa Fe (Fleet)",
        "description": "Servicio corporativo para grupos y VIPs desde el aeropuerto a Santa Fe",
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
        "collaboratorId": "collab_001",
        # Nueva estructura: lista de vehículos
        "vehicles": [
            {
                "id": "v1",
                "licensePlate": "1234ABC",
                "model": "Mercedes-Benz E-Class",
                "imageUrl": "/assets/cars/mercedes-e-class.png"
            },
            {
                "id": "v2",
                "licensePlate": "5678DEF",
                "model": "Mercedes-Benz S-Class",
                "imageUrl": "/assets/cars/mercedes-s-class.png"
            },
            {
                "id": "v3",
                "licensePlate": "9012GHI",
                "model": "Mercedes-Benz V-Class",
                "imageUrl": "/assets/cars/mercedes-v-class.png"
            }
        ],
        # Para compatibilidad con sistemas antiguos
        "vehicle": {
            "id": "v1",
            "licensePlate": "1234ABC",
            "model": "Mercedes-Benz E-Class",
            "imageUrl": "/assets/cars/mercedes-e-class.png"
        },
        # Lista de conductores asociados a estos vehículos
        "drivers": [
            {
                "id": "driver_101",
                "name": "Carlos Rodríguez",
                "photo": "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
                "id": "driver_102",
                "name": "Laura Martínez",
                "photo": "https://randomuser.me/api/portraits/women/45.jpg"
            }
        ],
        # Para compatibilidad con sistemas antiguos
        "driver": {
            "id": "driver_101",
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
            "timeSlots": ["08:00-20:00"],
            "days": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        },
        "status": "active",
        "distance": 23,
        "estimatedTime": 45,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Polanco → Interlomas (Servicio Premium)",
        "description": "Servicio premium con opciones de vehículos exclusivos",
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
        "collaboratorId": "collab_002",
        # Nueva estructura: lista de vehículos
        "vehicles": [
            {
                "id": "v2",
                "licensePlate": "5678DEF",
                "model": "Mercedes-Benz S-Class",
                "imageUrl": "/assets/cars/mercedes-s-class.png"
            },
            {
                "id": "v4",
                "licensePlate": "3456JKL",
                "model": "Audi A8 Security",
                "imageUrl": "/assets/cars/audi-a8-security.png"
            }
        ],
        # Para compatibilidad con sistemas antiguos
        "vehicle": {
            "id": "v2",
            "licensePlate": "5678DEF",
            "model": "Mercedes-Benz S-Class",
            "imageUrl": "/assets/cars/mercedes-s-class.png"
        },
        # Lista de conductores asociados a estos vehículos
        "drivers": [
            {
                "id": "driver_201",
                "name": "Eduardo Pérez",
                "photo": "https://randomuser.me/api/portraits/men/45.jpg"
            },
            {
                "id": "driver_401",
                "name": "Miguel Ángel Sánchez",
                "photo": "https://randomuser.me/api/portraits/men/60.jpg"
            }
        ],
        # Para compatibilidad con sistemas antiguos
        "driver": {
            "id": "driver_201",
            "name": "Eduardo Pérez",
            "photo": "https://randomuser.me/api/portraits/men/45.jpg"
        },
        "pricing": {
            "standard": 950,
            "night": 1200,
            "holiday": 1400,
            "currency": "MXN"
        },
        "availability": {
            "timeSlots": ["09:00-22:00"],
            "days": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        },
        "status": "active",
        "distance": 12,
        "estimatedTime": 25,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "name": "Servicio Corporativo Aeropuerto",
        "description": "Flota completa para servicios corporativos desde/hacia el aeropuerto",
        "origin": {
            "name": "Aeropuerto Internacional de la Ciudad de México",
            "location": {
                "type": "Point",
                "coordinates": [-99.0721, 19.4361]
            }
        },
        "destination": {
            "name": "Zona Hotelera Reforma",
            "location": {
                "type": "Point",
                "coordinates": [-99.1732, 19.4254]
            }
        },
        "collaboratorId": "collab_003",
        # Nueva estructura: lista de vehículos
        "vehicles": [
            {
                "id": "v1",
                "licensePlate": "1234ABC",
                "model": "Mercedes-Benz E-Class",
                "imageUrl": "/assets/cars/mercedes-e-class.png"
            },
            {
                "id": "v2",
                "licensePlate": "5678DEF",
                "model": "Mercedes-Benz S-Class",
                "imageUrl": "/assets/cars/mercedes-s-class.png"
            },
            {
                "id": "v3",
                "licensePlate": "9012GHI",
                "model": "Mercedes-Benz V-Class",
                "imageUrl": "/assets/cars/mercedes-v-class.png"
            },
            {
                "id": "v5",
                "licensePlate": "7890MNO",
                "model": "Limusina Mercedes-Benz Maybach",
                "imageUrl": "/assets/cars/maybach-limousine.png"
            }
        ],
        # Para compatibilidad con sistemas antiguos
        "vehicle": {
            "id": "v1",
            "licensePlate": "1234ABC",
            "model": "Mercedes-Benz E-Class",
            "imageUrl": "/assets/cars/mercedes-e-class.png"
        },
        "drivers": [
            {
                "id": "driver_101",
                "name": "Carlos Rodríguez",
                "photo": "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
                "id": "driver_201",
                "name": "Eduardo Pérez",
                "photo": "https://randomuser.me/api/portraits/men/45.jpg"
            },
            {
                "id": "driver_301",
                "name": "Javier López",
                "photo": "https://randomuser.me/api/portraits/men/53.jpg"
            }
        ],
        # Para compatibilidad con sistemas antiguos
        "driver": {
            "id": "driver_101",
            "name": "Carlos Rodríguez",
            "photo": "https://randomuser.me/api/portraits/men/32.jpg"
        },
        "pricing": {
            "standard": 1100,
            "night": 1350,
            "holiday": 1600,
            "currency": "MXN"
        },
        "availability": {
            "timeSlots": ["00:00-23:59"],
            "days": ["Todos"]
        },
        "status": "active",
        "distance": 18,
        "estimatedTime": 35,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

# Función para insertar o actualizar datos de vehículos
def upsert_vehicles():
    try:
        # Eliminar vehículos existentes y cargar los nuevos
        vehicles_collection.delete_many({})
        result = vehicles_collection.insert_many(vehicles_data)
        print(f"Se han insertado {len(result.inserted_ids)} vehículos en la base de datos.")
    except BulkWriteError as bwe:
        print(f"Error al insertar vehículos: {bwe.details}")
    except Exception as e:
        print(f"Error: {e}")

# Función para insertar o actualizar datos de rutas fijas
def upsert_fixed_routes():
    try:
        # Eliminar rutas existentes y cargar las nuevas
        routes_collection.delete_many({})
        result = routes_collection.insert_many(fixed_routes_data)
        print(f"Se han insertado {len(result.inserted_ids)} rutas fijas en la base de datos.")
    except BulkWriteError as bwe:
        print(f"Error al insertar rutas fijas: {bwe.details}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upsert_vehicles()
    upsert_fixed_routes()
    print("Inicialización de vehículos y rutas fijas completada.") 