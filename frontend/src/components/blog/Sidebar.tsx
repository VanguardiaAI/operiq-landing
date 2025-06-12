import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Tag as TagIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagList } from "./TagList";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";

interface SidebarProps {
  onSearch?: (query: string) => void;
}

export const Sidebar = ({ onSearch }: SidebarProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allCategories, allTags, allPosts] = await Promise.all([
          blogService.getAllCategories(),
          blogService.getAllTags(),
          blogService.getAllPosts()
        ]);
        
        setCategories(allCategories);
        setTags(allTags);
        // Ordenar por fecha de publicación y tomar los 3 más recientes
        const sortedPosts = [...allPosts].sort(
          (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        ).slice(0, 3);
        setRecentPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded-md"></div>
        <div className="h-60 bg-gray-200 rounded-md"></div>
        <div className="h-60 bg-gray-200 rounded-md"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-4">
      {/* Categorías populares */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="pb-3 bg-gray-50 border-b pt-5">
          <CardTitle className="text-lg">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="py-5">
          <ul className="space-y-2">
            {categories.map((category, idx) => (
              <li key={idx}>
                <Link 
                  to={`/blog/categoria/${category.toLowerCase()}`}
                  className="flex items-center justify-between text-gray-700 hover:text-gray-600 transition-colors py-2"
                >
                  <span>{category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Posts recientes */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="pb-3 bg-gray-50 border-b pt-5">
          <CardTitle className="text-lg">Artículos recientes</CardTitle>
        </CardHeader>
        <CardContent className="py-5">
          <ul className="space-y-5 divide-y divide-gray-100">
            {recentPosts.map(post => (
              <li key={post.id} className="pt-5 first:pt-0 pb-1">
                <Link to={`/blog/${post.slug}`} className="group block">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 line-clamp-2 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mt-2 space-x-2">
                    <Clock size={12} className="text-gray-400" />
                    <span>
                      {new Date(post.publishDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Tags */}
      <Card className="overflow-hidden shadow-sm mb-6">
        <CardHeader className="pb-3 bg-gray-50 border-b pt-5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TagIcon size={16} />
            <span>Etiquetas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-5">
          <TagList tags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}; 