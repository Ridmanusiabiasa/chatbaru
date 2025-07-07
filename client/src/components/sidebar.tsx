import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground flex items-center">
          <MessageSquare className="text-primary mr-2" />
          RidChat AI
        </h1>
      </div>
      
      <nav className="mt-6 flex-1">
        <ul className="space-y-2 px-4">
          <li>
            <Link
              href="/"
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors",
                location === "/" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <MessageSquare size={20} />
              <span>AI Chat</span>
            </Link>
          </li>
        </ul>
      </nav>
      

    </div>
  );
}
