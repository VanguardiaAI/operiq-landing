def setup_collection(db):
    """Inicializa la colección de vehículos y sus índices"""
    global vehicles_collection
    
    # Inicializar la colección
    vehicles_collection = db['vehicles']
    
    # Crear índices existentes
    vehicles_collection.create_index("collaboratorId")
    
    # Añadir índice geoespacial para consultas espaciales
    vehicles_collection.create_index([("location", "2dsphere")])
    
    return vehicles_collection 