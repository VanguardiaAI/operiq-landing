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

print("🔧 CORRIGIENDO HORARIOS DE ANA MARTÍNEZ")
print("=" * 50)

# IDs
miguel_id = "68280ac23378369e956135c6"  # Tiene los horarios pero es Miguel Torres
ana_id = "68280ac23378369e956135c7"     # Es Ana Martínez pero sin horarios

print(f"📋 Transferir horarios de Miguel Torres ({miguel_id}) → Ana Martínez ({ana_id})")
print()

try:
    agenda_collection = db['drivers_agenda']
    
    # 1. Obtener la agenda de Miguel (que tiene los horarios correctos)
    agenda_miguel = agenda_collection.find_one({"driver_id": ObjectId(miguel_id)})
    
    if not agenda_miguel:
        print("❌ No se encontró agenda de Miguel Torres")
        exit(1)
    
    print(f"✅ Agenda de Miguel encontrada: {len(agenda_miguel.get('availability', []))} slots")
    
    # 2. Verificar si Ana ya tiene agenda
    agenda_ana = agenda_collection.find_one({"driver_id": ObjectId(ana_id)})
    
    if agenda_ana:
        print(f"⚠️ Ana ya tiene agenda: {len(agenda_ana.get('availability', []))} slots")
        print("   Reemplazando con los horarios corregidos...")
        
        # Actualizar la agenda existente de Ana con los horarios de Miguel
        result = agenda_collection.update_one(
            {"driver_id": ObjectId(ana_id)},
            {
                "$set": {
                    "availability": agenda_miguel["availability"],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ Agenda de Ana actualizada exitosamente")
        else:
            print("❌ No se pudo actualizar la agenda de Ana")
    else:
        print("📝 Ana no tiene agenda, creando nueva...")
        
        # Crear nueva agenda para Ana con los horarios de Miguel
        nueva_agenda = {
            "driver_id": ObjectId(ana_id),
            "availability": agenda_miguel["availability"],
            "preferences": agenda_miguel.get("preferences", {}),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = agenda_collection.insert_one(nueva_agenda)
        
        if result.inserted_id:
            print(f"✅ Nueva agenda creada para Ana: {result.inserted_id}")
        else:
            print("❌ No se pudo crear la agenda para Ana")
    
    # 3. Verificar la transferencia
    print("\n📊 VERIFICACIÓN:")
    agenda_ana_actualizada = agenda_collection.find_one({"driver_id": ObjectId(ana_id)})
    
    if agenda_ana_actualizada:
        # Verificar slots para el 24 de mayo
        test_date = datetime(2025, 5, 24)
        may_24_slots = []
        for slot in agenda_ana_actualizada.get('availability', []):
            slot_date = slot.get('start_date')
            if slot_date and slot_date.date() == test_date.date():
                may_24_slots.append(slot)
        
        print(f"✅ Ana ahora tiene {len(agenda_ana_actualizada.get('availability', []))} slots total")
        print(f"✅ Slots para 24 mayo: {len(may_24_slots)}")
        
        for i, slot in enumerate(may_24_slots, 1):
            start = slot.get('start_date')
            end = slot.get('end_date')
            status = slot.get('status')
            print(f"   {i}. {start} - {end} ({status})")
    else:
        print("❌ No se pudo verificar la agenda de Ana")
    
    # 4. Opcional: Limpiar la agenda incorrecta de Miguel
    print(f"\n🗑️ ¿Deseas eliminar la agenda incorrecta de Miguel Torres? (los horarios ya se copiaron a Ana)")
    print("   Esto evitará futuras confusiones.")
    # No eliminar automáticamente para seguridad
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
print("✅ CORRECCIÓN COMPLETADA") 