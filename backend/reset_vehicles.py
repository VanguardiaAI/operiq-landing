#!/usr/bin/env python
# Script para reinicializar la base de datos de vehículos

from init_vehicles import upsert_vehicles

if __name__ == "__main__":
    print("Iniciando reinicialización de la base de datos de vehículos...")
    upsert_vehicles()
    print("Reinicialización de vehículos completada.")
    print("Revisa la colección de vehículos en MongoDB para confirmar que los datos se han cargado correctamente.") 