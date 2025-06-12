import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/blog/Pagination";
import Sidebar from "@/components/blog/Sidebar";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import { ArrowLeft, Tag, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (tag) {
          const tagPosts = await blogService.getPostsByTag(tag);
          setPosts(tagPosts);
        } else {
          const allPosts = await blogService.getAllPosts();
          setPosts(allPosts);
        }
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    // Restablecer la página actual al cambiar de etiqueta
    setCurrentPage(1);
    // Scroll al inicio cuando cambia la etiqueta
    window.scrollTo(0, 0);
  }, [tag]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // Calcular los índices para la paginación
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);
  
  // Formatear el nombre de la etiqueta para mostrar
  const tagName = tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : "";
  
  return (
    <>
      <header>
                <title>{tagName ? `#${tagName} - Blog Privyde` : "Blog | Privyde"}</title>
        <meta 
          name="description" 
          content={tagName ? `Artículos con etiqueta #${tagName} en el blog de Privyde` : "Blog de Privyde"}
        />
      </header>
      
      <Navbar />
      
      <main>
        {/* Hero de tag */}
        <section className="relative py-16 bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-1000 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-1/4 w-32 h-32 bg-gray-1000 rounded-full blur-3xl"></div>
          </div>
          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-3xl">
              <div className="flex items-center mb-6">
                <Link 
                  to="/blog"
                  className="text-white/70 hover:text-white transition-colors flex items-center"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  <span>Blog</span>
                </Link>
                <span className="mx-3 text-white/50">/</span>
                <span className="text-white">Etiqueta</span>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-black p-2.5 rounded-lg">
                  <Hash size={22} className="text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {tagName}
                </h1>
              </div>
              
              {tag && (
                <p className="text-xl text-white/80 mb-6 max-w-2xl">
                  Artículos etiquetados como <span className="text-gray-400 font-medium">#{tagName}</span> en nuestro blog especializado en transporte ejecutivo y servicios premium.
                </p>
              )}
            </div>
          </div>
        </section>
        
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                {tag && (
                  <div className="mb-8 text-gray-600">
                    <p>
                      Mostrando {posts.length} artículo{posts.length !== 1 ? 's' : ''} con la etiqueta <span className="font-medium text-gray-900">#{tagName}</span>
                    </p>
                  </div>
                )}
                
                {/* Lista de posts */}
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : currentPosts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {currentPosts.map(post => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                    
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={handlePageChange} 
                    />
                  </>
                ) : (
                  <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-200 rounded-full text-black mb-6">
                      <Tag size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Etiqueta sin contenido</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      No hay artículos disponibles con esta etiqueta. Pronto agregaremos nuevo contenido.
                    </p>
                    <Button asChild>
                      <Link to="/blog">Volver al blog</Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                <div className="sticky top-24 pt-8">
                  <Sidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default TagPage; 