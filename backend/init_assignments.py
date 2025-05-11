from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pymongo.errors import BulkWriteError
import datetime
from bson import ObjectId

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
vehicles_collection = db['vehicles']
drivers_collection = db['drivers']
assignments_collection = db['driver_vehicle_assignments']

# Función para obtener IDs de vehículos por tipo
def get_vehicle_ids_by_type(vehicle_type):
    vehicles = vehicles_collection.find({"type": vehicle_type})
    return [str(v["_id"]) for v in vehicles]

# Función para obtener IDs de conductores por tipos de vehículos
def get_driver_ids_by_vehicle_type(vehicle_type):
    drivers = drivers_collection.find({"vehicle_types": vehicle_type})
    return [str(d["_id"]) for d in drivers]

# Crear datos de asignaciones
def create_assignments_data():
    # Primero, eliminamos asignaciones existentes
    assignments_collection.delete_many({})
    
    # Lista para almacenar todas las asignaciones
    all_assignments = []
    
    # Tipos de vehículos en el sistema
    vehicle_types = ["sedan", "suv", "helicopter", "jet", "limousine"]
    
    # Para cada tipo de vehículo, crear asignaciones
    for vehicle_type in vehicle_types:
        vehicle_ids = get_vehicle_ids_by_type(vehicle_type)
        driver_ids = get_driver_ids_by_vehicle_type(vehicle_type)
        
        # Si no hay vehículos o conductores para este tipo, continuar
        if not vehicle_ids or not driver_ids:
            continue
        
        # Asignar cada conductor a vehículos apropiados
        for driver_id in driver_ids:
            # Un conductor puede estar asignado a múltiples vehículos
            for vehicle_id in vehicle_ids:
                # Verificar si ya existe esta asignación
                existing = assignments_collection.find_one({
                    "driver_id": driver_id,
                    "vehicle_id": vehicle_id
                })
                
                if not existing:
                    assignment = {
                        "driver_id": driver_id,
                        "vehicle_id": vehicle_id,
                        "status": "active",  # active, maintenance, unavailable
                        "assigned_at": datetime.datetime.utcnow(),
                        "schedule": {
                            "days": ["lunes", "martes", "miércoles", "jueves", "viernes"],
                            "hours": "08:00-20:00"
                        },
                        "primary_driver": len(all_assignments) < len(vehicle_ids)  # Los primeros conductores son primarios
                    }
                    
                    all_assignments.append(assignment)
    
    return all_assignments

# Inicializar asignaciones
def init_assignments():
    try:
        assignments_data = create_assignments_data()
        
        if assignments_data:
            result = assignments_collection.insert_many(assignments_data)
            print(f"Se han creado {len(result.inserted_ids)} asignaciones entre conductores y vehículos.")
        else:
            print("No se crearon asignaciones. Verifica que existan conductores y vehículos en la base de datos.")
    except BulkWriteError as bwe:
        print(f"Error al insertar asignaciones: {bwe.details}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Crear índice compuesto para búsquedas rápidas
    assignments_collection.create_index([
        ("driver_id", 1),
        ("vehicle_id", 1)
    ], unique=True)
    
    # Inicializar asignaciones
    init_assignments()
    print("Inicialización de asignaciones completada.") 