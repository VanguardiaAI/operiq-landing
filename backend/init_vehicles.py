from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pymongo.errors import BulkWriteError
from pymongo.collection import Collection
import pymongo

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
vehicles_collection = db['vehicles']

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
        "image": "/assets/cars/mercedes-e-class.png"
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
        "image": "/assets/cars/mercedes-s-class.png"
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
        "image": "/assets/cars/mercedes-v-class.png"
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
        "image": "/assets/cars/audi-a8-security.png"
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
        "image": "/assets/cars/maybach-limousine.png"
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
        "image": "/assets/air/bell-429.png"
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
        "image": "/assets/air/embraer-phenom-300.png"
    }
]

# Función para insertar o actualizar datos
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

if __name__ == "__main__":
    upsert_vehicles()
    print("Inicialización de vehículos completada.") 