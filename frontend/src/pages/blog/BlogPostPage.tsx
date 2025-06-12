import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TagList } from "@/components/blog/TagList";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import Sidebar from "@/components/blog/Sidebar";
import { SharePost } from "@/components/blog/SharePost";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import { CalendarIcon, Clock, User, ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import { Toaster } from "@/components/ui/toaster";

// Configuración de marked para convertir markdown a HTML
marked.setOptions({
  gfm: true,
  breaks: true
});

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!slug) return;
      
      try {
        const postData = await blogService.getPostBySlug(slug);
        setPost(postData);
        
        if (postData) {
          // Obtener posts relacionados basados en categorías
          const allPosts = await blogService.getAllPosts();
          setRelatedPosts(allPosts);
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    // Scroll al inicio cuando cambia el slug
    window.scrollTo(0, 0);
  }, [slug]);
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!post) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Artículo no encontrado</h1>
          <p className="text-gray-600 mb-8">El artículo que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link to="/blog" className="flex items-center">
              <ArrowLeft size={18} className="mr-2" />
              Volver al blog
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }
  
  // Convertir el contenido Markdown a HTML
  const contentHtml = marked.parse(post.content);
  
  // Calcular tiempo estimado de lectura (aproximadamente 200 palabras por minuto)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  return (
    <>
      <header>
        <title>{post.title} | Blog Privyde</title>
        <meta name="description" content={post.excerpt} />
        {post.seoData && (
          <>
            <meta name="keywords" content={post.seoData.keywords.join(", ")} />
            {post.seoData.canonicalUrl && (
              <link rel="canonical" href={post.seoData.canonicalUrl} />
            )}
          </>
        )}
      </header>
      
      <Navbar />
      
      {/* Hero del artículo */}
      <div className="relative">
        {post.featuredImage && (
          <div className="relative h-[50vh] min-h-[400px]">
            <div className="absolute inset-0">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
            <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
              <div className="max-w-4xl text-white">
                {/* Categorías */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((category, idx) => (
                    <Link 
                      key={idx} 
                      to={`/blog/categoria/${category.toLowerCase()}`} 
                      className="inline-block bg-black text-white px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-gray-800"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                
                {/* Título */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {post.title}
                </h1>
                
                {/* Meta información */}
                <div className="flex flex-wrap items-center text-white/90 text-sm mb-8 gap-6">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon size={16} className="mr-2" />
                    <span>{new Date(post.publishDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{readingTime} min de lectura</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Contenido principal */}
      <main className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
              {/* Navegación de regreso */}
              <div className="mb-8">
                <Button variant="ghost" asChild className="flex items-center text-gray-600 hover:text-gray-600">
                  <Link to="/blog">
                    <ArrowLeft size={18} className="mr-2" />
                    Volver al blog
                  </Link>
                </Button>
              </div>
              
              {/* Contenido del artículo */}
              <article className="max-w-3xl">
                {/* Si no hay imagen destacada, mostrar título y meta aquí */}
                {!post.featuredImage && (
                  <>
                    {/* Categorías */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.map((category, idx) => (
                        <Link 
                          key={idx} 
                          to={`/blog/categoria/${category.toLowerCase()}`} 
                          className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-red-200"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Título */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {post.title}
                    </h1>
                    
                    {/* Meta información */}
                    <div className="flex flex-wrap items-center text-gray-500 text-sm mb-8 gap-6">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-black" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon size={16} className="mr-2 text-black" />
                        <span>{new Date(post.publishDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-black" />
                        <span>{readingTime} min de lectura</span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Contenido */}
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-sm prose-p:text-left prose-li:text-left">
                  <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>
                
                {/* Compartir y Tags */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Etiquetas:</h4>
                      <TagList tags={post.tags} />
                    </div>
                    
                    <SharePost 
                      title={post.title}
                      url={window.location.href}
                      description={post.excerpt}
                      className="mt-2 sm:mt-0"
                    />
                  </div>
                </div>
              </article>
              
              {/* Posts relacionados */}
              <RelatedPosts currentPost={post} posts={relatedPosts} />
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3 mt-12 lg:mt-0">
              <div className="sticky top-24 pt-8">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <Toaster />
    </>
  );
};

export default BlogPostPage; 