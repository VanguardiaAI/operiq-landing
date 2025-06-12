import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBlogProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export const SearchBlog = ({ onSearch, initialQuery = "" }: SearchBlogProps) => {
  const [query, setQuery] = useState(initialQuery);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        placeholder="Buscar en el blog..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-12 focus-visible:ring-red-600"
      />
      <Button 
        type="submit" 
        size="icon" 
        variant="ghost" 
        className="absolute right-0 top-0 h-full text-gray-400 hover:text-gray-600"
      >
        <Search size={18} />
      </Button>
    </form>
  );
}; 