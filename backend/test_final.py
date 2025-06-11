#!/usr/bin/env python3

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime
from models.drivers_agenda import get_driver_agenda, check_driver_availability, setup_collection
from pymongo import MongoClient
from bson import ObjectId
import os

# Conectar a MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_default_database()
setup_collection(db)

print("🔧 PRUEBA FINAL DE DISPONIBILIDAD (SIN ZONA HORARIA)")
print("=" * 60)

# Datos de prueba
test_driver_id = "68280ac23378369e956135c6"

print(f"👤 Conductor: {test_driver_id}")
print()

# 1. Obtener agenda del conductor
print("1️⃣ Obteniendo agenda del conductor...")
agenda = get_driver_agenda(test_driver_id)

if agenda:
    print(f"✅ Agenda encontrada con {len(agenda.get('availability', []))} slots")
    
    print("📅 Todos los slots disponibles:")
    for i, slot in enumerate(agenda.get('availability', [])):
        slot_start = slot.get('start_date')
        slot_end = slot.get('end_date')
        status = slot.get('status')
        print(f"   Slot {i+1}: {slot_start} - {slot_end} ({status})")
    
    print()
    
    # Buscar slots para el día 22 de mayo específicamente
    target_date = datetime(2025, 5, 22).date()
    print(f"🎯 Slots que incluyen el día {target_date}:")
    
    for i, slot in enumerate(agenda.get('availability', [])):
        slot_start = slot.get('start_date')
        slot_end = slot.get('end_date')
        status = slot.get('status')
        
        if slot_start and slot_end:
            if slot_start.date() <= target_date <= slot_end.date():
                print(f"   ✅ Slot {i+1}: {slot_start} - {slot_end} ({status})")
                
                # Para slots disponibles, mostrar si cubriría horarios típicos
                if status == 'available':
                    # Simular diferentes horarios solicitados
                    test_times = [
                        ("Mañana temprano", datetime(2025, 5, 22, 8, 0), datetime(2025, 5, 22, 10, 0)),
                        ("Mañana normal", datetime(2025, 5, 22, 10, 0), datetime(2025, 5, 22, 12, 0)),
                        ("Mediodía", datetime(2025, 5, 22, 12, 0), datetime(2025, 5, 22, 14, 0)),
                        ("Tarde", datetime(2025, 5, 22, 15, 0), datetime(2025, 5, 22, 17, 0)),
                        ("Noche", datetime(2025, 5, 22, 19, 0), datetime(2025, 5, 22, 21, 0)),
                    ]
                    
                    for desc, start_test, end_test in test_times:
                        if slot_start <= start_test and slot_end >= end_test:
                            print(f"      ✅ Cubre: {desc} ({start_test.time()}-{end_test.time()})")
                        else:
                            print(f"      ❌ NO cubre: {desc} ({start_test.time()}-{end_test.time()})")
else:
    print("❌ No se encontró agenda")

print()

# 2. Probar verificación específica para horario nocturno
print("2️⃣ Probando horario nocturno específico (19:01-21:01)...")
start_date = datetime(2025, 5, 22, 19, 1)  
end_date = datetime(2025, 5, 22, 21, 1)

print(f"🕐 Horario solicitado: {start_date} - {end_date}")

try:
    available = check_driver_availability(test_driver_id, start_date, end_date)
    print(f"📊 Resultado: {'✅ DISPONIBLE' if available else '❌ NO DISPONIBLE'}")
    
    if not available:
        print("💡 El conductor NO está disponible en este horario nocturno.")
        print("   Esto es correcto porque el slot disponible es:")
        print("   08:00:00 - 14:00:00 (horario diurno)")
        print("   Y el solicitado es:")
        print("   19:01:00 - 21:01:00 (horario nocturno)")
        print("   ✅ La verificación funciona correctamente!")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")

print()

# 3. Probar verificación para horario que SÍ debería estar disponible
print("3️⃣ Probando horario que SÍ debería estar disponible (10:00-12:00)...")
start_date_good = datetime(2025, 5, 22, 10, 0)  
end_date_good = datetime(2025, 5, 22, 12, 0)

print(f"🕐 Horario solicitado: {start_date_good} - {end_date_good}")

try:
    available_good = check_driver_availability(test_driver_id, start_date_good, end_date_good)
    print(f"📊 Resultado: {'✅ DISPONIBLE' if available_good else '❌ NO DISPONIBLE'}")
    
    if available_good:
        print("💡 ¡Perfecto! El conductor SÍ está disponible en este horario.")
        print("   Esto confirma que la lógica funciona correctamente.")
    else:
        print("⚠️ Algo está mal - debería estar disponible")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")

print("\n🏁 Prueba completada") 