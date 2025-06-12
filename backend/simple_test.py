#!/usr/bin/env python3

import requests
import json

print("🔧 PRUEBA SIMPLE DE CONECTIVIDAD")
print("=" * 40)

try:
    # Prueba simple de conexión
    print("1. Probando conexión básica...")
    response = requests.get("http://localhost:5001/", timeout=5)
    print(f"   Status: {response.status_code}")
    
    # Prueba con datos mínimos
    print("\n2. Probando endpoint con datos mínimos...")
    simple_data = {
        "pickup_address": "Ciudad de México, CDMX, México",
        "pickup_coordinates": [-99.1332, 19.4326],
        "pickup_date": "2025-05-24",
        "pickup_time": "10:00"
    }
    
    response = requests.post(
        "http://localhost:5001/api/admin/reservations/search-vehicles", 
        json=simple_data, 
        timeout=10
    )
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Respuesta exitosa: {len(data)} claves en respuesta")
        
        # Verificar si hay horarios alternativos
        alt_vehicles = data.get("vehicles_with_alternative_schedules", [])
        print(f"   Vehículos con horarios alternativos: {len(alt_vehicles)}")
        
        if alt_vehicles:
            print("   ✅ SÍ hay horarios alternativos en la respuesta")
            # Mostrar el primer vehículo
            first_vehicle = alt_vehicles[0]
            alt_slots = first_vehicle.get('alternative_time_slots', [])
            print(f"   Primer vehículo tiene {len(alt_slots)} horarios alternativos")
            
            if alt_slots:
                print("   Primeros horarios:")
                for slot in alt_slots[:2]:
                    print(f"     - {slot.get('start_time')} - {slot.get('end_time')}")
        else:
            print("   ❌ No hay horarios alternativos en la respuesta")
    else:
        print(f"   Error: {response.text}")
        
except requests.exceptions.Timeout:
    print("❌ Timeout - el servidor tarda demasiado en responder")
except requests.exceptions.ConnectionError:
    print("❌ Error de conexión - servidor no accesible")
except Exception as e:
    print(f"❌ Error: {str(e)}")

print("\n" + "=" * 40)
print("✅ PRUEBA COMPLETADA") 