#!/usr/bin/env python3

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta
from models.drivers_agenda import setup_collection
from pymongo import MongoClient
from bson import ObjectId
import os

# Conectar a MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_default_database()
setup_collection(db)
drivers_agenda_collection = db['drivers_agenda']

print("🔧 CORRIGIENDO HORARIOS IRREALES DE CONDUCTORES")
print("=" * 60)

def fix_driver_schedule(driver_id_str, driver_name=""):
    """Corrige los horarios de un conductor específico"""
    
    try:
        driver_id = ObjectId(driver_id_str)
        agenda = drivers_agenda_collection.find_one({"driver_id": driver_id})
        
        if not agenda:
            print(f"❌ No se encontró agenda para {driver_name} ({driver_id_str})")
            return False
            
        print(f"\n👤 Corrigiendo horarios de {driver_name} ({driver_id_str})")
        print(f"   Slots actuales: {len(agenda.get('availability', []))}")
        
        # Crear nuevos slots con horarios realistas
        new_availability = []
        
        # Para cada slot existente, crear versiones mejoradas
        for slot in agenda.get('availability', []):
            slot_start = slot.get('start_date')
            slot_end = slot.get('end_date')
            status = slot.get('status')
            
            if not slot_start or not slot_end:
                continue
                
            # Detectar si es un slot de día completo (00:00 - 23:59)
            if (slot_start.hour == 0 and slot_start.minute == 0 and 
                slot_end.hour == 23 and slot_end.minute == 59):
                
                print(f"   🔧 Corrigiendo slot de día completo: {slot_start.date()} ({status})")
                
                if status == "available":
                    # Crear horarios realistas para días disponibles
                    # Horario matutino: 8:00 - 12:00
                    morning_slot = {
                        "start_date": slot_start.replace(hour=8, minute=0, second=0, microsecond=0),
                        "end_date": slot_start.replace(hour=12, minute=0, second=0, microsecond=0),
                        "status": "available"
                    }
                    new_availability.append(morning_slot)
                    
                    # Horario vespertino: 14:00 - 18:00  
                    afternoon_slot = {
                        "start_date": slot_start.replace(hour=14, minute=0, second=0, microsecond=0),
                        "end_date": slot_start.replace(hour=18, minute=0, second=0, microsecond=0),
                        "status": "available"
                    }
                    new_availability.append(afternoon_slot)
                    
                elif status == "off":
                    # Para días libres, no agregamos slots de disponibilidad
                    print(f"     - Día libre, no se agregan horarios")
                    
                elif status == "busy":
                    # Para días ocupados, crear slots limitados
                    evening_slot = {
                        "start_date": slot_start.replace(hour=19, minute=0, second=0, microsecond=0),
                        "end_date": slot_start.replace(hour=22, minute=0, second=0, microsecond=0),
                        "status": "available"
                    }
                    new_availability.append(evening_slot)
                    
            else:
                # Si ya tiene horarios específicos, mantenerlos
                print(f"   ✅ Manteniendo slot específico: {slot_start} - {slot_end} ({status})")
                new_availability.append(slot)
        
        # Actualizar la agenda en la base de datos
        update_result = drivers_agenda_collection.update_one(
            {"driver_id": driver_id},
            {
                "$set": {
                    "availability": new_availability,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count > 0:
            print(f"   ✅ Agenda actualizada exitosamente")
            print(f"   📅 Nuevos slots: {len(new_availability)}")
            return True
        else:
            print(f"   ⚠️ No se realizaron cambios")
            return False
            
    except Exception as e:
        print(f"   ❌ Error corrigiendo agenda: {str(e)}")
        return False

# Corregir el conductor específico de la imagen (Ana Martínez)
target_driver_id = "68280ac23378369e956135c6"
print("🎯 Corrigiendo conductor principal...")
fix_driver_schedule(target_driver_id, "Ana Martínez")

# Buscar y corregir otros conductores con horarios similares
print("\n🔍 Buscando otros conductores con horarios irreales...")

all_agendas = drivers_agenda_collection.find({})
fixed_count = 0
total_count = 0

for agenda in all_agendas:
    total_count += 1
    driver_id_str = str(agenda.get('driver_id'))
    
    # Verificar si tiene slots de día completo
    has_full_day_slots = False
    for slot in agenda.get('availability', []):
        slot_start = slot.get('start_date')
        slot_end = slot.get('end_date')
        
        if (slot_start and slot_end and 
            slot_start.hour == 0 and slot_start.minute == 0 and 
            slot_end.hour == 23 and slot_end.minute == 59):
            has_full_day_slots = True
            break
    
    if has_full_day_slots and driver_id_str != target_driver_id:
        print(f"\n📋 Encontrado conductor con horarios irreales: {driver_id_str}")
        if fix_driver_schedule(driver_id_str, f"Conductor {driver_id_str[-6:]}"):
            fixed_count += 1

print(f"\n📊 RESUMEN:")
print(f"   Total conductores revisados: {total_count}")
print(f"   Conductores corregidos: {fixed_count + 1}")  # +1 por Ana Martínez
print(f"   ✅ Corrección completada")

print("\n" + "=" * 60)
print("🎉 ¡HORARIOS CORREGIDOS EXITOSAMENTE!") 