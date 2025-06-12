import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface CategoryListProps {
  categories: string[];
  activeCategory?: string;
}

export const CategoryList = ({ categories, activeCategory }: CategoryListProps) => {
  return (
    <div className="flex flex-wrap gap-2 my-6">
      <Link to="/blog">
        <Badge 
          variant={!activeCategory ? "default" : "outline"}
          className={`text-sm px-4 py-2 cursor-pointer ${!activeCategory ? 'bg-black hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          Todos
        </Badge>
      </Link>
      
      {categories.map((category, idx) => (
        <Link key={idx} to={`/blog/categoria/${category.toLowerCase()}`}>
          <Badge 
            variant={activeCategory === category.toLowerCase() ? "default" : "outline"}
            className={`text-sm px-4 py-2 cursor-pointer ${
              activeCategory === category.toLowerCase() 
                ? 'bg-black hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}
          >
            {category}
          </Badge>
        </Link>
      ))}
    </div>
  );
}; 