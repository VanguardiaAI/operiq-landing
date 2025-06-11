from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime
import slugify
import os
from werkzeug.utils import secure_filename
import uuid
import openai
import json
from dotenv import load_dotenv

# Cargar variables de entorno para OpenAI
load_dotenv()

blog_bp = Blueprint('blog', __name__)

# Configurar OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')

def get_db():
    from app import db
    return db

# Configuración para subida de imágenes
UPLOAD_FOLDER = 'uploads/blog'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Verificar que la carpeta de uploads existe, si no crearla
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Nueva ruta para generar contenido con IA
@blog_bp.route('/generate', methods=['POST'])
def generate_content():
    """Generar contenido de blog con IA usando OpenAI"""
    data = request.get_json()
    
    if not data or 'prompt' not in data:
        return jsonify({'error': 'Se requiere un prompt para generar contenido'}), 400
    
    prompt = data['prompt']
    print(f"Recibido prompt para generar contenido: {prompt[:50]}...")
    
    try:
        # Verificar clave API
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Error: OPENAI_API_KEY no configurada en variables de entorno")
            return jsonify({'error': 'API key de OpenAI no configurada'}), 500
        
        print(f"Usando API key: {api_key[:5]}...")
        
        # Configurar la API key globalmente (para versión 0.28.0)
        openai.api_key = api_key
        
        # Crear el sistema de mensajes para el modelo
        messages = [
            {"role": "system", "content": """Eres un asistente especializado en crear artículos de blog profesionales 
            para una empresa de transporte ejecutivo y limousinas llamada Operiq. Debes generar artículos completos 
            en markdown, con títulos atractivos, secciones organizadas y contenido relevante sobre transporte ejecutivo, 
            servicio premium, experiencias VIP, consejos de viaje corporativo y temas relacionados.
            
            Al final, devuelve un objeto JSON con la siguiente estructura:
            {
              "title": "Título del artículo",
              "content": "Contenido completo en markdown",
              "excerpt": "Resumen breve del artículo (150 caracteres máximo)",
              "author": "Nombre del autor sugerido",
              "categories": ["Categoría1", "Categoría2"],
              "tags": ["Tag1", "Tag2", "Tag3"],
              "seoData": {
                "metaTitle": "Título SEO optimizado",
                "metaDescription": "Descripción meta para SEO (150-160 caracteres)",
                "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
              }
            }
            
            Importante: El contenido debe ser profesional, informativo y orientado al servicio premium de transporte ejecutivo.
            """
            },
            {"role": "user", "content": prompt}
        ]
        
        print("Enviando solicitud a OpenAI API...")
        
        # Realizar la llamada a la API de OpenAI (versión 0.28.0)
        response = openai.ChatCompletion.create(
            model="gpt-4.1-mini",  # Usar modelo disponible en API 0.28.0
            messages=messages,
            temperature=0.7,
            max_tokens=2500,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        print("Respuesta recibida de OpenAI")
        content = response.choices[0].message.content
        print(f"Contenido recibido (primeros 100 caracteres): {content[:100]}...")
        
        # Extraer la respuesta y convertirla a objeto JSON
        content_json = json.loads(content)
        
        # Generar slug automáticamente del título
        if 'title' in content_json:
            content_json['slug'] = slugify.slugify(content_json['title'])
        
        # Establecer valores por defecto para campos obligatorios
        if 'status' not in content_json:
            content_json['status'] = 'draft'
        
        if 'publishDate' not in content_json:
            content_json['publishDate'] = datetime.now().isoformat()
        
        if 'lastModified' not in content_json:
            content_json['lastModified'] = datetime.now().isoformat()
        
        if 'featured' not in content_json:
            content_json['featured'] = False
        
        print("Devolviendo respuesta JSON procesada")
        return jsonify(content_json), 200
    
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error generando contenido con OpenAI: {str(e)}")
        print(f"Traceback: {traceback_str}")
        return jsonify({'error': f"Error al generar contenido: {str(e)}"}), 500

@blog_bp.route('/upload', methods=['POST'])
def upload_image():
    """Subir una imagen para un artículo del blog"""
    if 'image' not in request.files:
        return jsonify({'error': 'No se encontró ningún archivo'}), 400
        
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
    if file and allowed_file(file.filename):
        # Generar nombre de archivo único para evitar colisiones
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Guardar el archivo
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Construir la URL del archivo
        # En producción, esto sería la URL del servidor o CDN
        image_url = f"/uploads/blog/{unique_filename}"
        
        return jsonify({
            'message': 'Imagen subida correctamente',
            'imageUrl': image_url
        }), 201
    
    return jsonify({'error': 'Tipo de archivo no permitido'}), 400

@blog_bp.route('/posts', methods=['GET'])
def get_all_posts():
    """Obtener todos los artículos publicados del blog con paginación"""
    db = get_db()
    
    # Parámetros de consulta opcionales
    category = request.args.get('category')
    tag = request.args.get('tag')
    search = request.args.get('q')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Solo traer posts publicados si no se indica un estado específico
    status = request.args.get('status')
    
    # Construir la consulta base
    query = {}
    
    # Filtrar por estado solo si se especifica
    if status:
        query['status'] = status
    else:
        query['status'] = 'published'
    
    # Añadir filtros adicionales si están presentes
    if category:
        query['categories'] = category
    if tag:
        query['tags'] = tag
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'content': {'$regex': search, '$options': 'i'}},
            {'excerpt': {'$regex': search, '$options': 'i'}},
            {'author': {'$regex': search, '$options': 'i'}}
        ]
    
    # Calcular total de documentos y páginas
    total_posts = db.blog_posts.count_documents(query)
    total_pages = (total_posts + limit - 1) // limit  # Redondear hacia arriba
    
    # Ejecutar la consulta con paginación
    posts = list(db.blog_posts.find(query)
                 .sort('publishDate', -1)
                 .skip((page - 1) * limit)
                 .limit(limit))
    
    # Convertir ObjectId a string para serialización JSON
    for post in posts:
        post['_id'] = str(post['_id'])
    
    return jsonify({
        'posts': posts,
        'page': page,
        'totalPages': total_pages,
        'totalPosts': total_posts
    }), 200

@blog_bp.route('/posts/<slug>', methods=['GET'])
def get_post_by_slug(slug):
    """Obtener un artículo del blog por su slug"""
    db = get_db()
    
    post = db.blog_posts.find_one({'slug': slug, 'status': 'published'})
    
    if not post:
        return jsonify({'error': 'Artículo no encontrado'}), 404
    
    # Convertir ObjectId a string para serialización JSON
    post['_id'] = str(post['_id'])
    
    return jsonify(post), 200

@blog_bp.route('/categories', methods=['GET'])
def get_all_categories():
    """Obtener todas las categorías de los artículos publicados"""
    db = get_db()
    
    # Obtener categorías únicas de los artículos publicados
    pipeline = [
        {'$match': {'status': 'published'}},
        {'$unwind': '$categories'},
        {'$group': {'_id': '$categories'}},
        {'$sort': {'_id': 1}}
    ]
    
    categories = [cat['_id'] for cat in db.blog_posts.aggregate(pipeline)]
    
    return jsonify(categories), 200

@blog_bp.route('/tags', methods=['GET'])
def get_all_tags():
    """Obtener todas las etiquetas de los artículos publicados"""
    db = get_db()
    
    # Obtener etiquetas únicas de los artículos publicados
    pipeline = [
        {'$match': {'status': 'published'}},
        {'$unwind': '$tags'},
        {'$group': {'_id': '$tags'}},
        {'$sort': {'_id': 1}}
    ]
    
    tags = [tag['_id'] for tag in db.blog_posts.aggregate(pipeline)]
    
    return jsonify(tags), 200

@blog_bp.route('/posts/featured', methods=['GET'])
def get_featured_posts():
    """Obtener artículos destacados"""
    db = get_db()
    
    # Obtener artículos destacados
    posts = list(db.blog_posts.find({'status': 'published', 'featured': True}).sort('publishDate', -1))
    
    # Convertir ObjectId a string para serialización JSON
    for post in posts:
        post['_id'] = str(post['_id'])
    
    return jsonify(posts), 200

# Ruta para administración de artículos (sin autenticación requerida por ahora)
@blog_bp.route('/posts', methods=['POST'])
def create_post():
    """Crear un nuevo artículo"""
    db = get_db()
    data = request.get_json()
    
    # Validar datos
    if not data or not all(k in data for k in ('title', 'content')):
        return jsonify({"error": "Se requieren título y contenido"}), 400
    
    # Generar slug si no se proporciona
    if 'slug' not in data or not data['slug']:
        data['slug'] = slugify.slugify(data['title'])
    
    # Verificar que el slug sea único
    existing_post = db.blog_posts.find_one({'slug': data['slug']})
    if existing_post:
        # Añadir un sufijo numérico al slug
        count = 1
        new_slug = f"{data['slug']}-{count}"
        while db.blog_posts.find_one({'slug': new_slug}):
            count += 1
            new_slug = f"{data['slug']}-{count}"
        data['slug'] = new_slug
    
    # Preparar datos para la base de datos
    post = {
        'title': data['title'],
        'slug': data['slug'],
        'content': data['content'],
        'excerpt': data.get('excerpt', ''),
        'author': data.get('author', 'Admin'),
        'status': data.get('status', 'draft'),
        'publishDate': data.get('publishDate', datetime.now().isoformat()),
        'lastModified': datetime.now().isoformat(),
        'featured': data.get('featured', False),
        'featuredImage': data.get('featuredImage', ''),
        'categories': data.get('categories', []),
        'tags': data.get('tags', []),
        'seoData': data.get('seoData', {})
    }
    
    # Insertar el artículo en la base de datos
    result = db.blog_posts.insert_one(post)
    
    # Devolver el artículo creado
    post['_id'] = str(result.inserted_id)
    
    return jsonify(post), 201

@blog_bp.route('/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    """Actualizar un artículo existente"""
    db = get_db()
    data = request.get_json()
    
    # Validar datos
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400
    
    # Verificar que el artículo existe
    existing_post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
    if not existing_post:
        return jsonify({'error': 'Artículo no encontrado'}), 404
    
    # Verificar que el slug sea único si se proporciona
    if 'slug' in data and data['slug'] != existing_post['slug']:
        slug_exists = db.blog_posts.find_one({'slug': data['slug'], '_id': {'$ne': ObjectId(post_id)}})
        if slug_exists:
            # Añadir un sufijo numérico al slug
            count = 1
            new_slug = f"{data['slug']}-{count}"
            while db.blog_posts.find_one({'slug': new_slug, '_id': {'$ne': ObjectId(post_id)}}):
                count += 1
                new_slug = f"{data['slug']}-{count}"
            data['slug'] = new_slug
    
    # Preparar datos para actualizar
    update_data = {
        '$set': {
            'lastModified': datetime.now().isoformat()
        }
    }
    
    # Agregar campos a actualizar
    fields = ['title', 'slug', 'content', 'excerpt', 'author', 'status', 
              'publishDate', 'featured', 'featuredImage', 'categories', 'tags', 'seoData']
    
    for field in fields:
        if field in data:
            update_data['$set'][field] = data[field]
    
    # Actualizar el artículo
    db.blog_posts.update_one({'_id': ObjectId(post_id)}, update_data)
    
    # Obtener el artículo actualizado
    updated_post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
    updated_post['_id'] = str(updated_post['_id'])
    
    return jsonify(updated_post), 200

@blog_bp.route('/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Eliminar un artículo"""
    db = get_db()
    
    # Verificar que el artículo existe
    existing_post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
    if not existing_post:
        return jsonify({'error': 'Artículo no encontrado'}), 404
    
    # Eliminar el artículo
    db.blog_posts.delete_one({'_id': ObjectId(post_id)})
    
    return jsonify({'message': 'Artículo eliminado correctamente'}), 200

# Ruta para obtener un solo artículo por su ID (para edición)
@blog_bp.route('/posts/<post_id>', methods=['GET'])
def get_post_by_id(post_id):
    """Obtener un artículo del blog por su ID"""
    db = get_db()
    
    try:
        post = db.blog_posts.find_one({'_id': ObjectId(post_id)})
    except:
        return jsonify({'error': 'ID de artículo inválido'}), 400
    
    if not post:
        return jsonify({'error': 'Artículo no encontrado'}), 404
    
    # Convertir ObjectId a string para serialización JSON
    post['_id'] = str(post['_id'])
    
    return jsonify(post), 200 