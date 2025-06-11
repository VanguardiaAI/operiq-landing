import { BlogPost } from "../types/blog";
import axios from "axios";

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BLOG_API_URL = `${API_URL}/blog`;

// Función para convertir el formato de la API al formato local
const mapApiPostToLocal = (post: any): BlogPost => {
  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return new Date().toISOString().split('.')[0] + 'Z';
    
    try {
      // Convertir a formato ISO con Z si no lo tiene
      const date = new Date(dateString);
      return date.toISOString().split('.')[0] + 'Z';
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return new Date().toISOString().split('.')[0] + 'Z';
    }
  };
  
  // Extraer correctamente el ID si viene en formato MongoDB
  const extractId = (idObject: any): string => {
    if (!idObject) return "";
    
    // Si el ID es un objeto con $oid (formato MongoDB)
    if (typeof idObject === 'object' && idObject.$oid) {
      return idObject.$oid;
    }
    
    // Si el ID es directamente un string
    return String(idObject);
  };
  
  // Convertir a arrays si es necesario
  const ensureArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(item => item !== "");
    return [];
  };
  
  // Asegurar que la URL de la imagen sea completa
  const ensureFullImageUrl = (url: string | undefined): string => {
    if (!url) return "";
    
    // Si es una URL absoluta, usarla como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Construir URL relativa al backend
    // En desarrollo, el backend está en localhost:5000
    const apiUrl = API_URL.replace(/\/api$/, ''); // Quitar '/api' si existe
    
    // Asegurarnos de que la URL tenga el formato correcto
    let fullUrl = url;
    if (!url.startsWith('/')) {
      fullUrl = '/' + url;
    }
    
    return `${apiUrl}${fullUrl}`;
  };
  
  // Objeto del post normalizado
  const postId = post._id ? extractId(post._id) : (post.id ? extractId(post.id) : "");
  
  return {
    id: postId,
    _id: postId, // Mantener ambos formatos para compatibilidad
    title: post.title || "",
    slug: post.slug || "",
    content: post.content || "",
    excerpt: post.excerpt || "",
    author: post.author || "",
    status: post.status || "draft",
    publishDate: formatDate(post.publishDate),
    lastModified: formatDate(post.lastModified),
    featured: Boolean(post.featured),
    featuredImage: ensureFullImageUrl(post.featuredImage),
    categories: ensureArray(post.categories),
    tags: ensureArray(post.tags),
    seoData: {
      metaTitle: post.seoData?.metaTitle || post.title || "",
      metaDescription: post.seoData?.metaDescription || post.excerpt || "",
      keywords: ensureArray(post.seoData?.keywords)
    }
  };
};

/**
 * Preparar datos para enviar a la API
 */
const prepareDataForApi = (postData: Partial<BlogPost>) => {
  // Formatear fechas al formato esperado por la API
  const formatDateForApi = (dateString: string | undefined) => {
    if (!dateString) return new Date().toISOString().split('.')[0] + 'Z';
    
    try {
      // Asegurar formato ISO con Z
      const date = new Date(dateString);
      return date.toISOString().split('.')[0] + 'Z';
    } catch (error) {
      console.error("Error formateando fecha para API:", error);
      return new Date().toISOString().split('.')[0] + 'Z';
    }
  };
  
  // Datos preparados para enviar a la API
  const preparedData = {
    ...postData,
    publishDate: formatDateForApi(postData.publishDate),
    lastModified: formatDateForApi(postData.lastModified || new Date().toISOString()),
    // Remover propiedades que no deberían enviarse a la API
    id: undefined,
    _id: undefined
  };
  
  return preparedData;
};

/**
 * Servicio para gestionar las operaciones del blog
 */
export const blogService = {
  /**
   * Generar contenido de blog con IA
   */
  generateContent: async (prompt: string): Promise<Partial<BlogPost> | null> => {
    try {
      console.log(`Generando contenido con IA usando prompt: "${prompt}"`);
      const response = await axios.post(`${BLOG_API_URL}/generate`, { prompt });
      console.log("Contenido generado:", response.data);
      
      // Convertir la respuesta al formato local
      const generatedPost: Partial<BlogPost> = {
        title: response.data.title || "",
        slug: response.data.slug || "",
        content: response.data.content || "",
        excerpt: response.data.excerpt || "",
        author: response.data.author || "",
        status: response.data.status || "draft",
        publishDate: response.data.publishDate || new Date().toISOString(),
        lastModified: response.data.lastModified || new Date().toISOString(),
        featured: response.data.featured || false,
        categories: response.data.categories || [],
        tags: response.data.tags || [],
        seoData: {
          metaTitle: response.data.seoData?.metaTitle || response.data.title || "",
          metaDescription: response.data.seoData?.metaDescription || response.data.excerpt || "",
          keywords: response.data.seoData?.keywords || []
        }
      };
      
      return generatedPost;
    } catch (error) {
      console.error("Error al generar contenido con IA:", error);
      return null;
    }
  },

  /**
   * Obtener todos los posts publicados
   */
  getAllPosts: async (): Promise<BlogPost[]> => {
    try {
      console.log(`Fetching posts from: ${BLOG_API_URL}/posts`);
      const response = await axios.get(`${BLOG_API_URL}/posts`);
      console.log("Posts API response:", response.data);
      
      // Verificar si la respuesta tiene el formato nuevo (con paginación)
      const postsData = response.data.posts ? response.data.posts : response.data;
      
      return postsData.map(mapApiPostToLocal);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  },
  
  /**
   * Obtener un post por su ID
   */
  getPostById: async (id: string): Promise<BlogPost | null> => {
    try {
      console.log(`Attempting to fetch post with ID ${id}`);
      
      // Primero intentamos obtener todos los posts
      const allPosts = await blogService.getAllPosts();
      
      // Buscar el post por ID en la lista de posts
      const post = allPosts.find(p => p._id === id || p.id === id);
      
      if (post) {
        console.log("Post encontrado en la lista:", post);
        return post;
      }
      
      // Si no se encuentra, intentamos con el endpoint específico por slug
      console.log("Post no encontrado en la lista, buscando por slug");
      const response = await axios.get(`${BLOG_API_URL}/posts`);
      const postsData = response.data.posts ? response.data.posts : response.data;
      const foundPost = postsData.find((p: any) => p._id === id || p.id === id);
      
      if (foundPost) {
        console.log("Post encontrado por ID:", foundPost);
        return mapApiPostToLocal(foundPost);
      }
      
      console.log("Post no encontrado");
      return null;
    } catch (error) {
      console.error(`Error fetching post with ID ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Obtener un post por su slug
   */
  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      console.log(`Fetching post with slug ${slug} from: ${BLOG_API_URL}/posts/${slug}`);
      const response = await axios.get(`${BLOG_API_URL}/posts/${slug}`);
      console.log("Post API response:", response.data);
      return mapApiPostToLocal(response.data);
    } catch (error) {
      console.error(`Error fetching post with slug ${slug}:`, error);
      
      // Si falla el endpoint específico, intentamos buscar en todos los posts
      try {
        console.log("Intentando encontrar post por slug en la lista completa");
        const response = await axios.get(`${BLOG_API_URL}/posts`);
        const postsData = response.data.posts ? response.data.posts : response.data;
        const post = postsData.find((p: any) => p.slug === slug);
        
        if (post) {
          console.log("Post encontrado por slug en la lista:", post);
          return mapApiPostToLocal(post);
        }
        
        return null;
      } catch (secondError) {
        console.error("Error en segundo intento:", secondError);
        return null;
      }
    }
  },
  
  /**
   * Obtener posts por categoría
   */
  getPostsByCategory: async (category: string): Promise<BlogPost[]> => {
    try {
      console.log(`Fetching posts for category ${category} from: ${BLOG_API_URL}/posts?category=${category}`);
      const response = await axios.get(`${BLOG_API_URL}/posts?category=${category}`);
      console.log("Category posts API response:", response.data);
      
      // Verificar si la respuesta tiene el formato nuevo (con paginación)
      const postsData = response.data.posts ? response.data.posts : response.data;
      
      return postsData.map(mapApiPostToLocal);
    } catch (error) {
      console.error(`Error fetching posts for category ${category}:`, error);
      return [];
    }
  },
  
  /**
   * Obtener posts por etiqueta
   */
  getPostsByTag: async (tag: string): Promise<BlogPost[]> => {
    try {
      console.log(`Fetching posts for tag ${tag} from: ${BLOG_API_URL}/posts?tag=${tag}`);
      const response = await axios.get(`${BLOG_API_URL}/posts?tag=${tag}`);
      console.log("Tag posts API response:", response.data);
      
      // Verificar si la respuesta tiene el formato nuevo (con paginación)
      const postsData = response.data.posts ? response.data.posts : response.data;
      
      return postsData.map(mapApiPostToLocal);
    } catch (error) {
      console.error(`Error fetching posts for tag ${tag}:`, error);
      return [];
    }
  },
  
  /**
   * Buscar posts por texto
   */
  searchPosts: async (query: string): Promise<BlogPost[]> => {
    try {
      console.log(`Searching posts with query ${query} from: ${BLOG_API_URL}/posts?q=${query}`);
      const response = await axios.get(`${BLOG_API_URL}/posts?q=${query}`);
      console.log("Search posts API response:", response.data);
      
      // Verificar si la respuesta tiene el formato nuevo (con paginación)
      const postsData = response.data.posts ? response.data.posts : response.data;
      
      return postsData.map(mapApiPostToLocal);
    } catch (error) {
      console.error(`Error searching posts with query ${query}:`, error);
      return [];
    }
  },
  
  /**
   * Obtener todas las categorías
   */
  getAllCategories: async (): Promise<string[]> => {
    try {
      console.log(`Fetching categories from: ${BLOG_API_URL}/categories`);
      const response = await axios.get(`${BLOG_API_URL}/categories`);
      console.log("Categories API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
  
  /**
   * Obtener todos los tags
   */
  getAllTags: async (): Promise<string[]> => {
    try {
      console.log(`Fetching tags from: ${BLOG_API_URL}/tags`);
      const response = await axios.get(`${BLOG_API_URL}/tags`);
      console.log("Tags API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  },
  
  /**
   * Obtener posts destacados
   */
  getFeaturedPosts: async (): Promise<BlogPost[]> => {
    try {
      console.log(`Fetching featured posts from: ${BLOG_API_URL}/posts/featured`);
      const response = await axios.get(`${BLOG_API_URL}/posts/featured`);
      console.log("Featured posts API response:", response.data);
      
      // La ruta de posts destacados podría no tener paginación, pero verificamos por si acaso
      const postsData = response.data.posts ? response.data.posts : response.data;
      
      return postsData.map(mapApiPostToLocal);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      return [];
    }
  },
  
  /**
   * Actualizar un post existente
   */
  updatePost: async (id: string, postData: Partial<BlogPost>): Promise<BlogPost | null> => {
    try {
      console.log(`Updating post with ID ${id} at ${BLOG_API_URL}/posts/${id}`);
      
      // Preparar los datos para la API
      const dataToSend = prepareDataForApi(postData);
      console.log("Data to send:", dataToSend);
      
      const response = await axios.put(`${BLOG_API_URL}/posts/${id}`, dataToSend);
      console.log("Update response:", response.data);
      
      return mapApiPostToLocal(response.data);
    } catch (error) {
      console.error(`Error updating post with ID ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Crear un nuevo post
   */
  createPost: async (postData: Partial<BlogPost>): Promise<BlogPost | null> => {
    try {
      console.log(`Creating new post at ${BLOG_API_URL}/posts`);
      
      // Preparar los datos para la API
      const dataToSend = prepareDataForApi(postData);
      console.log("Data to send:", dataToSend);
      
      const response = await axios.post(`${BLOG_API_URL}/posts`, dataToSend);
      console.log("Create response:", response.data);
      
      return mapApiPostToLocal(response.data);
    } catch (error) {
      console.error("Error creating post:", error);
      return null;
    }
  },
  
  /**
   * Eliminar un post
   */
  deletePost: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting post with ID ${id} at ${BLOG_API_URL}/posts/${id}`);
      await axios.delete(`${BLOG_API_URL}/posts/${id}`);
      console.log("Post deleted successfully");
      return true;
    } catch (error) {
      console.error(`Error deleting post with ID ${id}:`, error);
      return false;
    }
  }
}; 