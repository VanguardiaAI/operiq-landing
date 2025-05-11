import sys
import os
import subprocess

# Asegurarse de que estamos en el directorio correcto
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

print("Inicializando base de datos para el sistema de booking de VIP Transport...")

# Inicializar vehículos
print("\n=== Inicializando vehículos ===")
try:
    result = subprocess.run([sys.executable, "init_vehicles.py"], check=True)
    if result.returncode == 0:
        print("Vehículos inicializados correctamente.")
    else:
        print("Error al inicializar vehículos.")
except Exception as e:
    print(f"Error al ejecutar init_vehicles.py: {e}")

# Inicializar choferes
print("\n=== Inicializando choferes ===")
try:
    result = subprocess.run([sys.executable, "init_drivers.py"], check=True)
    if result.returncode == 0:
        print("Choferes inicializados correctamente.")
    else:
        print("Error al inicializar choferes.")
except Exception as e:
    print(f"Error al ejecutar init_drivers.py: {e}")

# Inicializar asignaciones de conductores a vehículos
print("\n=== Inicializando asignaciones de conductores-vehículos ===")
try:
    result = subprocess.run([sys.executable, "init_assignments.py"], check=True)
    if result.returncode == 0:
        print("Asignaciones inicializadas correctamente.")
    else:
        print("Error al inicializar asignaciones.")
except Exception as e:
    print(f"Error al ejecutar init_assignments.py: {e}")

print("\n=== Inicialización completada ===")
print("La base de datos ha sido poblada con datos de prueba.")
print("Para iniciar el servidor, ejecute: python app.py") 