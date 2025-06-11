#!/usr/bin/env python3

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime
from pymongo import MongoClient
import os
from bson import ObjectId

# Conectar a MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_default_database()

print("🔍 COMPARANDO LOS DOS REGISTROS DE ANA MARTÍNEZ")
print("=" * 60)

# IDs de los dos registros de Ana
ana_c6_id = "68280ac23378369e956135c6"  # La que tiene horarios corregidos
ana_c7_id = "68280ac23378369e956135c7"  # La que aparece en resultados

print(f"👤 Ana C6: {ana_c6_id}")
print(f"👤 Ana C7: {ana_c7_id}")
print()

try:
    # 1. Comparar registros en la colección drivers
    drivers_collection = db['drivers']
    
    ana_c6 = drivers_collection.find_one({"_id": ObjectId(ana_c6_id)})
    ana_c7 = drivers_collection.find_one({"_id": ObjectId(ana_c7_id)})
    
    print("📊 COMPARACIÓN EN COLECCIÓN 'drivers':")
    if ana_c6:
        print(f"✅ Ana C6: {ana_c6.get('first_name')} {ana_c6.get('last_name')}")
        print(f"   Email: {ana_c6.get('email', 'N/A')}")
        print(f"   Phone: {ana_c6.get('phone', 'N/A')}")
        print(f"   Created: {ana_c6.get('created_at', 'N/A')}")
    else:
        print("❌ Ana C6 no encontrada")
    
    if ana_c7:
        print(f"✅ Ana C7: {ana_c7.get('first_name')} {ana_c7.get('last_name')}")
        print(f"   Email: {ana_c7.get('email', 'N/A')}")
        print(f"   Phone: {ana_c7.get('phone', 'N/A')}")
        print(f"   Created: {ana_c7.get('created_at', 'N/A')}")
    else:
        print("❌ Ana C7 no encontrada")
    
    print()
    
    # 2. Comparar agendas
    agenda_collection = db['drivers_agenda']
    
    agenda_c6 = agenda_collection.find_one({"driver_id": ObjectId(ana_c6_id)})
    agenda_c7 = agenda_collection.find_one({"driver_id": ObjectId(ana_c7_id)})
    
    print("📅 COMPARACIÓN DE AGENDAS:")
    if agenda_c6:
        print(f"✅ Ana C6 agenda: {len(agenda_c6.get('availability', []))} slots")
        print(f"   Created: {agenda_c6.get('created_at', 'N/A')}")
        print(f"   Updated: {agenda_c6.get('updated_at', 'N/A')}")
        
        # Verificar slot del 24 de mayo
        test_date = datetime(2025, 5, 24)
        may_24_slots_c6 = []
        for slot in agenda_c6.get('availability', []):
            slot_date = slot.get('start_date')
            if slot_date and slot_date.date() == test_date.date():
                may_24_slots_c6.append(slot)
        
        print(f"   Slots 24 mayo: {len(may_24_slots_c6)}")
        for slot in may_24_slots_c6:
            print(f"      {slot.get('start_date')} - {slot.get('end_date')} ({slot.get('status')})")
    else:
        print("❌ Ana C6 sin agenda")
    
    if agenda_c7:
        print(f"✅ Ana C7 agenda: {len(agenda_c7.get('availability', []))} slots")
        print(f"   Created: {agenda_c7.get('created_at', 'N/A')}")
        print(f"   Updated: {agenda_c7.get('updated_at', 'N/A')}")
        
        # Verificar slot del 24 de mayo
        may_24_slots_c7 = []
        for slot in agenda_c7.get('availability', []):
            slot_date = slot.get('start_date')
            if slot_date and slot_date.date() == test_date.date():
                may_24_slots_c7.append(slot)
        
        print(f"   Slots 24 mayo: {len(may_24_slots_c7)}")
        for slot in may_24_slots_c7:
            print(f"      {slot.get('start_date')} - {slot.get('end_date')} ({slot.get('status')})")
    else:
        print("❌ Ana C7 sin agenda")
    
    print()
    
    # 3. Verificar en qué zonas aparecen
    zones_collection = db['zones']
    
    print("🗺️ APARICIÓN EN ZONAS:")
    zones_with_c6 = list(zones_collection.find({"vehicles.driver.id": ObjectId(ana_c6_id)}))
    zones_with_c7 = list(zones_collection.find({"vehicles.driver.id": ObjectId(ana_c7_id)}))
    
    print(f"📊 Ana C6 en zonas: {len(zones_with_c6)}")
    for zone in zones_with_c6:
        print(f"   - {zone.get('name', 'N/A')}")
    
    print(f"📊 Ana C7 en zonas: {len(zones_with_c7)}")
    for zone in zones_with_c7:
        print(f"   - {zone.get('name', 'N/A')}")
        
    # 4. Verificar en vehículos (segunda búsqueda más detallada)
    vehicles_collection = db['vehicles']
    
    print("\n🚗 APARICIÓN EN VEHÍCULOS:")
    
    # Buscar por driver_id en la estructura de vehículos
    all_vehicles = list(vehicles_collection.find({}))
    
    vehicles_with_c6 = []
    vehicles_with_c7 = []
    
    for vehicle in all_vehicles:
        # Verificar en associatedDrivers
        associated = vehicle.get('associatedDrivers', [])
        if ObjectId(ana_c6_id) in associated:
            vehicles_with_c6.append(vehicle)
        if ObjectId(ana_c7_id) in associated:
            vehicles_with_c7.append(vehicle)
    
    print(f"📊 Ana C6 en vehículos: {len(vehicles_with_c6)}")
    for vehicle in vehicles_with_c6:
        print(f"   - {vehicle.get('name', 'N/A')} (ID: {vehicle.get('_id')})")
    
    print(f"📊 Ana C7 en vehículos: {len(vehicles_with_c7)}")
    for vehicle in vehicles_with_c7:
        print(f"   - {vehicle.get('name', 'N/A')} (ID: {vehicle.get('_id')})")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("✅ COMPARACIÓN COMPLETADA") 