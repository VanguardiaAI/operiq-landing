import { Link } from "react-router-dom";

interface TagListProps {
  tags: string[];
  size?: "sm" | "md";
}

export const TagList = ({ tags, size = "md" }: TagListProps) => {
  const isSmall = size === "sm";
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <Link 
          key={idx} 
          to={`/blog/tag/${tag.toLowerCase()}`}
          className={`
            inline-block bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors
            ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
            rounded-full
          `}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}; 