#!/usr/bin/env python3

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime
from models.drivers_agenda import get_driver_agenda, get_driver_available_time_slots, setup_collection
from pymongo import MongoClient
import os
from bson import ObjectId

# Conectar a MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_default_database()
setup_collection(db)

print("🔍 VERIFICANDO CONDUCTOR c7")
print("=" * 50)

# ID del conductor que aparece en los resultados
conductor_c7_id = "68280ac23378369e956135c7"
ana_martinez_id = "68280ac23378369e956135c6"

print(f"🔍 Conductor C7: {conductor_c7_id}")
print(f"👤 Ana Martínez: {ana_martinez_id}")
print()

try:
    # 1. Verificar información del conductor C7 en la colección drivers
    drivers_collection = db['drivers']
    conductor_c7 = drivers_collection.find_one({"_id": ObjectId(conductor_c7_id)})
    
    if conductor_c7:
        nombre_c7 = f"{conductor_c7.get('first_name', '')} {conductor_c7.get('last_name', '')}".strip()
        print(f"✅ Conductor C7 encontrado: {nombre_c7}")
    else:
        print(f"❌ Conductor C7 no encontrado en la colección drivers")
    
    # 2. Verificar si C7 tiene agenda
    agenda_collection = db['drivers_agenda']
    agenda_c7 = agenda_collection.find_one({"driver_id": ObjectId(conductor_c7_id)})
    
    if agenda_c7:
        print(f"✅ Agenda de C7 encontrada: {len(agenda_c7.get('availability', []))} slots")
        
        # Verificar slots para el 24 de mayo
        test_date = datetime(2025, 5, 24)
        may_24_slots = []
        for slot in agenda_c7.get('availability', []):
            slot_date = slot.get('start_date')
            if slot_date and slot_date.date() == test_date.date():
                may_24_slots.append(slot)
        
        print(f"🗓️ Slots para 24 mayo: {len(may_24_slots)}")
        for i, slot in enumerate(may_24_slots, 1):
            start = slot.get('start_date')
            end = slot.get('end_date')
            status = slot.get('status')
            print(f"   {i}. {start} - {end} ({status})")
    else:
        print(f"❌ C7 NO tiene agenda en drivers_agenda")
    
    print()
    print("=" * 50)
    
    # 3. Verificar por qué se está devolviendo C7 en lugar de Ana Martínez
    print("🔍 VERIFICANDO POR QUÉ APARECE C7:")
    
    # Buscar vehículos que tengan a C7 como conductor asociado
    vehicles_collection = db['vehicles']
    vehicles_c7 = list(vehicles_collection.find({"associatedDrivers": ObjectId(conductor_c7_id)}))
    
    print(f"📊 Vehículos asociados a C7: {len(vehicles_c7)}")
    for vehicle in vehicles_c7:
        print(f"   - {vehicle.get('name', 'N/A')} (ID: {vehicle.get('_id')})")
    
    # Buscar vehículos que tengan a Ana como conductor asociado
    vehicles_ana = list(vehicles_collection.find({"associatedDrivers": ObjectId(ana_martinez_id)}))
    
    print(f"📊 Vehículos asociados a Ana: {len(vehicles_ana)}")
    for vehicle in vehicles_ana:
        print(f"   - {vehicle.get('name', 'N/A')} (ID: {vehicle.get('_id')})")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
print("✅ VERIFICACIÓN COMPLETADA") 