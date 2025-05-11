from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pymongo.errors import BulkWriteError
import datetime

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
drivers_collection = db['drivers']

# Datos de choferes de ejemplo
drivers_data = [
    {
        "first_name": "Carlos",
        "last_name": "Rodríguez",
        "email": "carlos.rodriguez@ejemplo.com",
        "phone": "+34612345678",
        "profile_image": "/assets/drivers/driver1.jpg",
        "date_of_birth": datetime.datetime(1985, 5, 10),
        "languages": ["Español", "Inglés"],
        "vehicle_types": ["sedan", "suv"],
        "specialties": ["ejecutivo", "aeropuerto"],
        "ratings": {
            "average": 4.8,
            "count": 156
        },
        "licenses": {
            "driving": {
                "number": "DRIV12345678",
                "expiration": datetime.datetime(2026, 3, 15),
                "type": "Profesional"
            },
            "professional": ["Transporte de pasajeros VIP"]
        },
        "security_clearance": True,
        "background_check": {
            "status": "aprobado",
            "date": datetime.datetime(2023, 1, 5)
        },
        "years_experience": 8,
        "available": True,
        "active": True,
        "location": {
            "type": "Point",
            "coordinates": [-99.1332, 19.4326]  # CDMX
        }
    },
    {
        "first_name": "Laura",
        "last_name": "Fernández",
        "email": "laura.fernandez@ejemplo.com",
        "phone": "+34698765432",
        "profile_image": "/assets/drivers/driver2.jpg",
        "date_of_birth": datetime.datetime(1988, 9, 22),
        "languages": ["Español", "Inglés", "Francés"],
        "vehicle_types": ["sedan", "limousine"],
        "specialties": ["eventos", "turismo"],
        "ratings": {
            "average": 4.9,
            "count": 203
        },
        "licenses": {
            "driving": {
                "number": "DRIV87654321",
                "expiration": datetime.datetime(2025, 8, 10),
                "type": "Profesional"
            },
            "professional": ["Transporte de pasajeros VIP", "Guía turístico"]
        },
        "security_clearance": True,
        "background_check": {
            "status": "aprobado",
            "date": datetime.datetime(2023, 2, 10)
        },
        "years_experience": 10,
        "available": True,
        "active": True,
        "location": {
            "type": "Point",
            "coordinates": [-99.1309, 19.4241]  # CDMX
        }
    },
    {
        "first_name": "Miguel",
        "last_name": "Torres",
        "email": "miguel.torres@ejemplo.com",
        "phone": "+34633445566",
        "profile_image": "/assets/drivers/driver3.jpg",
        "date_of_birth": datetime.datetime(1979, 3, 15),
        "languages": ["Español", "Inglés", "Portugués"],
        "vehicle_types": ["sedan", "armored"],
        "specialties": ["seguridad", "ejecutivo"],
        "ratings": {
            "average": 4.7,
            "count": 89
        },
        "licenses": {
            "driving": {
                "number": "DRIV56789012",
                "expiration": datetime.datetime(2026, 5, 20),
                "type": "Profesional"
            },
            "professional": ["Transporte de pasajeros VIP", "Escolta personal", "Manejo defensivo"]
        },
        "security_clearance": True,
        "security_training": ["Escolta VIP", "Respuesta a amenazas"],
        "background_check": {
            "status": "aprobado",
            "date": datetime.datetime(2022, 11, 15)
        },
        "years_experience": 15,
        "available": True,
        "active": True,
        "location": {
            "type": "Point",
            "coordinates": [-99.1622, 19.4400]  # CDMX
        }
    },
    {
        "first_name": "Ana",
        "last_name": "Martínez",
        "email": "ana.martinez@ejemplo.com",
        "phone": "+34644556677",
        "profile_image": "/assets/drivers/driver4.jpg",
        "date_of_birth": datetime.datetime(1990, 11, 8),
        "languages": ["Español", "Inglés", "Alemán"],
        "vehicle_types": ["suv", "van"],
        "specialties": ["grupos", "turismo", "eventos"],
        "ratings": {
            "average": 4.9,
            "count": 112
        },
        "licenses": {
            "driving": {
                "number": "DRIV98765432",
                "expiration": datetime.datetime(2025, 10, 8),
                "type": "Profesional"
            },
            "professional": ["Transporte de pasajeros", "Guía turístico"]
        },
        "security_clearance": True,
        "background_check": {
            "status": "aprobado",
            "date": datetime.datetime(2023, 3, 5)
        },
        "years_experience": 7,
        "available": True,
        "active": True,
        "location": {
            "type": "Point",
            "coordinates": [-99.1567, 19.4201]  # CDMX
        }
    },
    {
        "first_name": "Javier",
        "last_name": "López",
        "email": "javier.lopez@ejemplo.com",
        "phone": "+34677889900",
        "profile_image": "/assets/drivers/driver5.jpg",
        "date_of_birth": datetime.datetime(1982, 7, 3),
        "languages": ["Español", "Inglés", "Italiano"],
        "vehicle_types": ["helicopter", "jet"],
        "specialties": ["piloto", "vuelos privados"],
        "ratings": {
            "average": 4.9,
            "count": 67
        },
        "licenses": {
            "driving": {
                "number": "DRIV34567890",
                "expiration": datetime.datetime(2026, 7, 15),
                "type": "Profesional"
            },
            "flying": {
                "number": "PIL12345678",
                "expiration": datetime.datetime(2025, 6, 10),
                "type": "Comercial",
                "ratings": ["Helicóptero", "Jet privado"]
            },
            "professional": ["Piloto comercial", "Transporte VIP"]
        },
        "security_clearance": True,
        "background_check": {
            "status": "aprobado",
            "date": datetime.datetime(2022, 12, 10)
        },
        "years_experience": 12,
        "flight_hours": 5000,
        "available": True,
        "active": True,
        "location": {
            "type": "Point",
            "coordinates": [-99.0882, 19.4360]  # CDMX - Helipuerto
        }
    }
]

# Función para insertar o actualizar datos
def upsert_drivers():
    try:
        # Eliminar choferes existentes y cargar los nuevos
        drivers_collection.delete_many({})
        result = drivers_collection.insert_many(drivers_data)
        print(f"Se han insertado {len(result.inserted_ids)} choferes en la base de datos.")
    except BulkWriteError as bwe:
        print(f"Error al insertar choferes: {bwe.details}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Crear índice geoespacial para búsquedas por ubicación
    drivers_collection.create_index([("location", "2dsphere")])
    
    upsert_drivers()
    print("Inicialización de choferes completada.") 