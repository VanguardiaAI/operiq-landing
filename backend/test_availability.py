import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId

# Cargar variables de entorno
load_dotenv()

# Configurar MongoDB
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    print("Error: No se encontró la variable de entorno MONGO_URI")
    sys.exit(1)

print(f"Conectando a MongoDB...")
client = MongoClient(MONGO_URI)
db = client['operiq']

# Importar módulos después de configurar la base de datos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models.drivers_agenda import setup_collection as setup_drivers_agenda_collection
from models.fixed_routes import setup_collection as setup_fixed_routes_collection
from models.vehicles import setup_collection as setup_vehicles_collection
from services.availability import check_vehicle_availability_for_location

# Inicializar colecciones
print("Inicializando colecciones...")
setup_drivers_agenda_collection(db)
setup_fixed_routes_collection(db)
setup_vehicles_collection(db)

# Datos de prueba
TEST_COORDINATES = [-99.087107, 19.436169]  # [longitud, latitud] (orden para MongoDB)
TEST_ADDRESS = "Ubicación de prueba en Ciudad de México"
TEST_PICKUP_DATE = datetime.now() + timedelta(days=1)  # Mañana a la misma hora
TEST_DURATION = 60  # 60 minutos

# Verificar si las colecciones tienen datos
fixed_routes_count = db.fixed_routes.count_documents({})
vehicles_count = db.vehicles.count_documents({})
drivers_agenda_count = db.drivers_agenda.count_documents({})

print(f"\nEstado actual de las colecciones:")
print(f"- fixed_routes: {fixed_routes_count} documentos")
print(f"- vehicles: {vehicles_count} documentos")
print(f"- drivers_agenda: {drivers_agenda_count} documentos")

# Si no hay datos en fixed_routes, insertar un documento de ejemplo
if fixed_routes_count == 0:
    print("\nNo hay rutas fijas. Insertando una ruta de ejemplo...")
    
    # Crear una zona que cubra las coordenadas de prueba
    example_fixed_route = {
        "name": "Zona de prueba",
        "center": {
            "name": "Centro de Zona de Prueba",
            "location": {
                "type": "Point",
                "coordinates": TEST_COORDINATES
            }
        },
        "radius": 5,  # 5 km de radio
        "vehicles": [],  # Lo llenaremos más adelante si es necesario
        "pricing": {
            "perKm": 15,
            "minFare": 150,
            "nightSurcharge": 1.5,
            "holidaySurcharge": 1.2,
            "currency": "MXN"
        },
        "status": "active",
        "description": "Zona de prueba para coordenadas específicas",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Si no hay vehículos, creamos uno
    if vehicles_count == 0:
        print("No hay vehículos. Insertando un vehículo de ejemplo...")
        
        example_vehicle = {
            "type": "sedan",
            "category": "luxury",
            "name": "Mercedes Clase S",
            "description": "Sedán de lujo con chofer",
            "details": {
                "brand": "Mercedes-Benz",
                "model": "Clase S",
                "year": 2023,
                "color": "Negro",
                "features": ["Asientos de cuero", "WiFi", "Minibar"]
            },
            "capacity": {
                "passengers": 4,
                "luggage": 3
            },
            "pricing": {
                "base_fare": 500,
                "per_km": 25,
                "per_hour": 450,
                "currency": "MXN"
            },
            "location": {
                "coordinates": TEST_COORDINATES,
                "type": "Point"
            },
            "availability_radius": 20,
            "available": True,
            "image": "/images/vehicles/mercedes-s-class.jpg",
            "licensePlate": "ABC-123",
            "availabilityType": ["zone", "flexible_route"],
            "associatedDrivers": [],
            "updated_at": datetime.utcnow()
        }
        
        # Insertar vehículo
        vehicle_result = db.vehicles.insert_one(example_vehicle)
        vehicle_id = vehicle_result.inserted_id
        print(f"Vehículo insertado con ID: {vehicle_id}")
        
        # Insertar un chofer de ejemplo si no hay choferes
        driver_count = db.drivers.count_documents({})
        if driver_count == 0:
            print("No hay choferes. Insertando un chofer de ejemplo...")
            
            example_driver = {
                "first_name": "Juan",
                "last_name": "Pérez",
                "email": "juan.perez@example.com",
                "phone": "+5215512345678",
                "profile_image": "/images/drivers/juan-perez.jpg",
                "years_experience": 5,
                "languages": ["Español", "Inglés"],
                "specialties": ["VIP", "Ejecutivo"],
                "ratings": {
                    "average": 4.8,
                    "count": 120
                },
                "vehicle_types": ["sedan", "suv"],
                "location": {
                    "type": "Point",
                    "coordinates": TEST_COORDINATES
                },
                "available": True,
                "active": True
            }
            
            driver_result = db.drivers.insert_one(example_driver)
            driver_id = driver_result.inserted_id
            print(f"Chofer insertado con ID: {driver_id}")
            
            # Actualizar el vehículo con el chofer asociado
            db.vehicles.update_one(
                {"_id": vehicle_id},
                {"$push": {"associatedDrivers": driver_id}}
            )
            
            # Crear una entrada en drivers_agenda para el chofer
            if drivers_agenda_count == 0:
                print("No hay agendas de choferes. Insertando una agenda de ejemplo...")
                
                # Crear fechas para la disponibilidad
                today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                next_week = today + timedelta(days=7)
                
                example_agenda = {
                    "driver_id": driver_id,
                    "availability": [
                        {
                            "start_date": today,
                            "end_date": next_week,
                            "status": "available"
                        }
                    ],
                    "preferences": {
                        "max_hours_day": 10,
                        "preferred_zones": ["Zona de prueba"],
                        "avoid_zones": []
                    },
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                agenda_result = db.drivers_agenda.insert_one(example_agenda)
                print(f"Agenda de chofer insertada con ID: {agenda_result.inserted_id}")
            
            # Ahora que tenemos chofer y vehículo, actualizar la zona
            example_fixed_route["vehicles"] = [{
                "id": vehicle_id,
                "model": "Mercedes Clase S",
                "licensePlate": "ABC-123",
                "driver": {
                    "id": driver_id,
                    "name": "Juan Pérez",
                    "photo": "/images/drivers/juan-perez.jpg"
                }
            }]
    
    # Insertar la ruta fija
    route_result = db.fixed_routes.insert_one(example_fixed_route)
    print(f"Ruta fija insertada con ID: {route_result.inserted_id}")

# Antes de ejecutar la prueba, inspeccionar las zonas fijas y vehículos existentes
print("\n" + "=" * 80)
print("INSPECCIÓN DE DATOS EXISTENTES")
print("=" * 80)

# Mostrar zonas fijas
print("\nZonas fijas activas:")
fixed_routes = list(db.fixed_routes.find({"status": "active"}))
for i, route in enumerate(fixed_routes, 1):
    print(f"\nZona {i}: {route.get('name', 'Sin nombre')}")
    print(f"- ID: {route['_id']}")
    
    center = route.get('center', {})
    coordinates = center.get('location', {}).get('coordinates', [0, 0])
    radius = route.get('radius', 0)
    
    print(f"- Centro: {coordinates} (Nombre: {center.get('name', 'N/A')})")
    print(f"- Radio: {radius} km")
    
    # Calcular distancia entre el centro de la zona y las coordenadas de prueba
    from utils.geo_utils import calculate_distance
    distance = calculate_distance(coordinates, TEST_COORDINATES)
    print(f"- Distancia a coordenadas de prueba: {distance:.2f} km")
    
    if distance <= radius:
        print(f"  ✓ Las coordenadas de prueba ESTÁN dentro de esta zona")
    else:
        print(f"  ✗ Las coordenadas de prueba NO están dentro de esta zona")
    
    # Mostrar vehículos asignados
    vehicles = route.get('vehicles', [])
    print(f"- Vehículos asignados: {len(vehicles)}")
    
    for j, vehicle in enumerate(vehicles, 1):
        print(f"  Vehículo {j}: {vehicle.get('model', 'N/A')} (Placa: {vehicle.get('licensePlate', 'N/A')})")
        print(f"  - ID: {vehicle.get('id', 'N/A')}")
        
        driver = vehicle.get('driver', {})
        print(f"  - Chofer: {driver.get('name', 'N/A')} (ID: {driver.get('id', 'N/A')})")
        
        # Verificar si el chofer tiene agenda para la fecha de prueba
        if 'id' in driver:
            driver_id = driver['id']
            try:
                # Convertir a ObjectId si no lo es ya
                if not isinstance(driver_id, ObjectId):
                    driver_id_obj = ObjectId(driver_id)
                else:
                    driver_id_obj = driver_id
                    
                driver_agenda = db.drivers_agenda.find_one({"driver_id": driver_id_obj})
                
                if driver_agenda:
                    print(f"  - Agenda de chofer encontrada")
                    
                    # Verificar disponibilidad para la fecha de prueba
                    for slot in driver_agenda.get('availability', []):
                        start_date = slot.get('start_date')
                        end_date = slot.get('end_date')
                        status = slot.get('status')
                        
                        if start_date and end_date:
                            if start_date <= TEST_PICKUP_DATE <= end_date:
                                print(f"  - Slot encontrado para la fecha de prueba ({start_date.isoformat()} - {end_date.isoformat()})")
                                print(f"  - Estado: {status}")
                                
                                if status == 'available':
                                    print(f"  ✓ El chofer ESTÁ disponible en esta fecha")
                                else:
                                    print(f"  ✗ El chofer NO está disponible en esta fecha (estado: {status})")
                                break
                    else:
                        print(f"  ✗ No se encontró slot para la fecha de prueba")
                else:
                    print(f"  ✗ No se encontró agenda para este chofer")
            except Exception as e:
                print(f"Error al procesar el chofer: {str(e)}")

# Mostrar vehículos con ruta flexible
print("\nVehículos con ruta flexible:")
flexible_vehicles = list(db.vehicles.find({
    "availabilityType": "flexible_route",
    "available": True
}))

for i, vehicle in enumerate(flexible_vehicles, 1):
    print(f"\nVehículo flexible {i}: {vehicle.get('name', 'Sin nombre')}")
    print(f"- ID: {vehicle['_id']}")
    print(f"- Tipo: {vehicle.get('type', 'N/A')}")
    print(f"- Placa: {vehicle.get('licensePlate', 'N/A')}")
    
    coordinates = vehicle.get('location', {}).get('coordinates', [0, 0])
    radius = vehicle.get('availability_radius', 0)
    
    print(f"- Ubicación: {coordinates}")
    print(f"- Radio de disponibilidad: {radius} km")
    
    # Calcular distancia a las coordenadas de prueba
    distance = calculate_distance(coordinates, TEST_COORDINATES)
    print(f"- Distancia a coordenadas de prueba: {distance:.2f} km")
    
    if distance <= radius:
        print(f"  ✓ Las coordenadas de prueba ESTÁN dentro del radio de este vehículo")
    else:
        print(f"  ✗ Las coordenadas de prueba NO están dentro del radio de este vehículo")
    
    # Mostrar choferes asociados
    drivers = vehicle.get('associatedDrivers', [])
    print(f"- Choferes asociados: {len(drivers)}")
    
    for j, driver_id in enumerate(drivers, 1):
        try:
            # Convertir a ObjectId si no lo es ya
            if not isinstance(driver_id, ObjectId):
                driver_id_obj = ObjectId(driver_id)
            else:
                driver_id_obj = driver_id
            
            driver = db.drivers.find_one({"_id": driver_id_obj})
            if driver:
                print(f"  Chofer {j}: {driver.get('first_name', '')} {driver.get('last_name', '')}")
                print(f"  - ID: {driver_id}")
                
                # Verificar si el chofer tiene agenda para la fecha de prueba
                driver_agenda = db.drivers_agenda.find_one({"driver_id": driver_id_obj})
                
                if driver_agenda:
                    print(f"  - Agenda de chofer encontrada")
                    
                    # Verificar disponibilidad para la fecha de prueba
                    for slot in driver_agenda.get('availability', []):
                        start_date = slot.get('start_date')
                        end_date = slot.get('end_date')
                        status = slot.get('status')
                        
                        if start_date and end_date:
                            if start_date <= TEST_PICKUP_DATE <= end_date:
                                print(f"  - Slot encontrado para la fecha de prueba ({start_date.isoformat()} - {end_date.isoformat()})")
                                print(f"  - Estado: {status}")
                                
                                if status == 'available':
                                    print(f"  ✓ El chofer ESTÁ disponible en esta fecha")
                                else:
                                    print(f"  ✗ El chofer NO está disponible en esta fecha (estado: {status})")
                                break
                    else:
                        print(f"  ✗ No se encontró slot para la fecha de prueba")
                else:
                    print(f"  ✗ No se encontró agenda para este chofer")
            else:
                print(f"  Chofer {j}: No encontrado (ID: {driver_id})")
        except Exception as e:
            print(f"Error al procesar el chofer: {str(e)}")

# Probar la búsqueda de vehículos disponibles
print("\n" + "=" * 80)
print(f"PRUEBA DE DISPONIBILIDAD")
print(f"Coordenadas: {TEST_COORDINATES}")
print(f"Dirección: {TEST_ADDRESS}")
print(f"Fecha y hora: {TEST_PICKUP_DATE.isoformat()}")
print(f"Duración estimada: {TEST_DURATION} minutos")
print("=" * 80)

try:
    # Ejecutar la función de búsqueda
    result = check_vehicle_availability_for_location(
        db,
        TEST_ADDRESS,
        TEST_COORDINATES,
        TEST_PICKUP_DATE,
        TEST_DURATION
    )
    
    # Mostrar resultados
    print(f"\nResultados de la búsqueda:")
    print(f"- Total de vehículos encontrados: {result['total_vehicles_found']}")
    print(f"- Vehículos en zonas fijas: {result['fixed_zone_count']}")
    print(f"- Vehículos con ruta flexible: {result['flexible_route_count']}")
    
    # Detalles de cada vehículo
    if result['total_vehicles_found'] > 0:
        print("\nDetalles de vehículos disponibles:")
        for i, vehicle in enumerate(result['available_vehicles'], 1):
            print(f"\nVehículo {i}:")
            print(f"- ID: {vehicle['vehicle_id']}")
            print(f"- Driver ID: {vehicle['driver_id']}")
            print(f"- Tipo: {vehicle['availability_type']}")
            
            if 'vehicle_data' in vehicle:
                vd = vehicle['vehicle_data']
                print(f"- Modelo: {vd.get('model', 'N/A')}")
                print(f"- Placa: {vd.get('licensePlate', 'N/A')}")
                
                if 'driver' in vd:
                    print(f"- Chofer: {vd['driver'].get('name', 'N/A')}")
            
            if vehicle['availability_type'] == 'fixed_zone':
                print(f"- Zona: {vehicle.get('zone_name', 'N/A')}")
            elif 'distance_km' in vehicle:
                print(f"- Distancia: {vehicle.get('distance_km', 0):.2f} km")
                
            # Mostrar precios
            if 'pricing' in vehicle:
                pricing = vehicle['pricing']
                print(f"- Precio base: {pricing.get('base_fare', pricing.get('minFare', 'N/A'))}")
                print(f"- Precio por km: {pricing.get('per_km', pricing.get('perKm', 'N/A'))}")
                print(f"- Moneda: {pricing.get('currency', 'MXN')}")
    else:
        print("\nNo se encontraron vehículos disponibles para las coordenadas y fecha especificadas.")
    
except Exception as e:
    print(f"\nERROR durante la prueba: {str(e)}")
    import traceback
    traceback.print_exc()

# Cerrar conexión
client.close()
print("\nPrueba completada.") 