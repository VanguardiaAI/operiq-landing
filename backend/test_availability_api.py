#!/usr/bin/env python3

import requests
import json
from datetime import datetime

print("🌐 PROBANDO ENDPOINT DE DISPONIBILIDAD")
print("=" * 50)

# Configuración de la prueba
api_url = "http://localhost:5000/api/admin/reservations/search-vehicles"

# Datos de la solicitud (simulando lo que hace el frontend)request_data = {    "pickup_address": "Moctezuma 2da Sección, Ciudad de México, CDMX, México",    "pickup_coordinates": [-99.0927, 19.4242],  # Coordenadas de CDMX    "pickup_date": "2025-05-24",  # Fecha que sabemos tiene horarios disponibles    "pickup_time": "10:00",    "estimated_duration": 120,  # 2 horas    "service_type": "one_way"}

print(f"📍 Ubicación de prueba: {request_data['pickup_address']}")
print(f"📅 Fecha/hora: {request_data['pickup_date']} {request_data['pickup_time']}")
print(f"⏱️ Duración: {request_data['estimated_duration']} minutos")
print()

try:
    print("🔄 Enviando solicitud al backend...")
    response = requests.post(api_url, json=request_data, timeout=30)
    
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Respuesta exitosa del backend")
        print()
        
        # Analizar la respuesta
        search_results = data.get("search_results", {})
        available_vehicles = data.get("available_vehicles", [])
        alternative_vehicles = data.get("vehicles_with_alternative_schedules", [])
        
        print(f"🚗 Vehículos disponibles: {len(available_vehicles)}")
        print(f"🕒 Vehículos con horarios alternativos: {len(alternative_vehicles)}")
        print()
        
        # Mostrar información de vehículos con horarios alternativos
        if alternative_vehicles:
            print("📋 HORARIOS ALTERNATIVOS ENCONTRADOS:")
            for i, vehicle in enumerate(alternative_vehicles[:2]):  # Mostrar solo los primeros 2
                print(f"\n   Vehículo {i+1}:")
                print(f"   - Modelo: {vehicle.get('model', 'N/A')}")
                print(f"   - Conductor: {vehicle.get('driver_name', 'N/A')}")
                print(f"   - Motivo no disponible: {vehicle.get('unavailable_reason', 'N/A')}")
                
                alt_slots = vehicle.get('alternative_time_slots', [])
                if alt_slots:
                    print(f"   - Horarios alternativos ({len(alt_slots)}):")
                    for slot in alt_slots[:3]:  # Mostrar solo los primeros 3
                        start_time = slot.get('start_time', 'N/A')
                        end_time = slot.get('end_time', 'N/A')
                        print(f"     • {start_time} - {end_time}")
                else:
                    print(f"   - ❌ Sin horarios alternativos definidos")
            
            print(f"\n🎯 ANÁLISIS: El backend {'SÍ' if alternative_vehicles else 'NO'} está devolviendo horarios alternativos")
        else:
            print("❌ No se encontraron vehículos con horarios alternativos")
            print("   Esto podría indicar que:")
            print("   1. No hay vehículos en esa zona")
            print("   2. Todos están disponibles (no hay alternativos)")
            print("   3. Hay un problema en el backend")
        
        # Mostrar estructura completa para debugging
        print(f"\n🔍 ESTRUCTURA DE RESPUESTA COMPLETA:")
        print(json.dumps(data, indent=2, ensure_ascii=False)[:1000] + "..." if len(str(data)) > 1000 else json.dumps(data, indent=2, ensure_ascii=False))
        
    else:
        print(f"❌ Error en la respuesta: {response.status_code}")
        print(f"Contenido: {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ Error de conexión: {str(e)}")
    print("   ¿Está corriendo el servidor backend en localhost:5000?")
except Exception as e:
    print(f"❌ Error inesperado: {str(e)}")

print("\n" + "=" * 50)
print("✅ PRUEBA COMPLETADA") 