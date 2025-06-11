#!/usr/bin/env python3

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime
from services.availability import check_vehicle_availability_for_location
from models.drivers_agenda import setup_collection
from pymongo import MongoClient
import os
import json

# Conectar a MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_default_database()

# Inicializar la colección de drivers_agenda
setup_collection(db)

print("🧪 PROBANDO check_vehicle_availability_for_location DIRECTAMENTE")
print("=" * 60)

# Datos de prueba
address = "Moctezuma 2da Sección, Ciudad de México, CDMX, México"
coordinates = [-99.0927, 19.4242]
pickup_date = datetime(2025, 5, 24, 10, 0)  # 24 mayo 2025, 10:00 AM
estimated_duration = 120  # 2 horas

print(f"📍 Dirección: {address}")
print(f"🗺️ Coordenadas: {coordinates}")
print(f"📅 Fecha/hora: {pickup_date}")
print(f"⏱️ Duración: {estimated_duration} minutos")
print()

try:
    # Llamar a la función directamente
    result = check_vehicle_availability_for_location(
        db=db,
        address=address,
        coordinates=coordinates,
        pickup_date=pickup_date,
        estimated_duration=estimated_duration
    )
    
    print("✅ Función ejecutada exitosamente")
    print()
    
    # Analizar los resultados
    print("📊 RESULTADOS:")
    print(f"   Total vehículos encontrados: {result.get('total_vehicles_found', 0)}")
    print(f"   Vehículos disponibles: {len(result.get('available_vehicles', []))}")
    
    alternative_vehicles = result.get('vehicles_with_alternative_schedules', [])
    print(f"   Vehículos con horarios alternativos: {len(alternative_vehicles)}")
    
    if alternative_vehicles:
        print("\n🔍 VEHÍCULOS CON HORARIOS ALTERNATIVOS:")
        for i, vehicle in enumerate(alternative_vehicles, 1):
            driver_name = vehicle.get('vehicle_data', {}).get('driver', {}).get('name', 'N/A')
            model = vehicle.get('vehicle_data', {}).get('model', 'N/A')
            reason = vehicle.get('unavailable_reason', 'N/A')
            
            print(f"\n   {i}. {driver_name} - {model}")
            print(f"      Motivo: {reason}")
            
            # Verificar si tiene alternative_time_slots
            alt_slots = vehicle.get('alternative_time_slots', [])
            print(f"      Alternative time slots: {len(alt_slots)} slots")
            
            if alt_slots:
                print("      Horarios:")
                for j, slot in enumerate(alt_slots, 1):
                    start_time = slot.get('start_time', 'N/A')
                    end_time = slot.get('end_time', 'N/A')
                    start_display = slot.get('start_time_display', start_time)
                    end_display = slot.get('end_time_display', end_time)
                    print(f"         {j}. {start_time} - {end_time} (Display: {start_display} - {end_display})")
            else:
                print("      ❌ NO tiene alternative_time_slots definidos")
                
                # Debug: Mostrar todas las claves del vehículo
                print(f"      🔍 Claves disponibles en el vehículo: {list(vehicle.keys())}")
    else:
        print("\n❌ No se encontraron vehículos con horarios alternativos")
    
    # Mostrar estructura resumida para debugging
    print(f"\n🗂️ ESTRUCTURA DE RESPUESTA:")
    for key, value in result.items():
        if isinstance(value, list):
            print(f"   {key}: Lista con {len(value)} elementos")
        else:
            print(f"   {key}: {type(value).__name__} = {value}")
            
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("✅ PRUEBA COMPLETADA") 