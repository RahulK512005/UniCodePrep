import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PageNavigationProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
}

export function PageNavigation({ currentPage, onNavigate }: PageNavigationProps) {
  // Define the navigation flow
  const pageFlow = [
    { id: "home", label: "Home" },
    { id: "dashboard", label: "Dashboard" },
    { id: "problems", label: "Problems" },
    { id: "interviews", label: "Interviews" },
    { id: "recommendations", label: "Recommendations" }
  ];

  const currentIndex = pageFlow.findIndex(page => page.id === currentPage);
  const previousPage = currentIndex > 0 ? pageFlow[currentIndex - 1] : null;
  const nextPage = currentIndex < pageFlow.length - 1 ? pageFlow[currentIndex + 1] : null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-white border border-border rounded-full px-6 py-3 shadow-lg">
        {previousPage ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate?.(previousPage.id)}
            className="flex items-center gap-2 hover:bg-accent"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{previousPage.label}</span>
          </Button>
        ) : (
          <div className="w-20 h-9"></div> // Placeholder to maintain layout
        )}

        <div className="w-px h-6 bg-border"></div>

        <div className="text-sm font-medium text-muted-foreground min-w-[100px] text-center">
          {pageFlow.find(page => page.id === currentPage)?.label || "Page"}
        </div>

        <div className="w-px h-6 bg-border"></div>

        {nextPage ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate?.(nextPage.id)}
            className="flex items-center gap-2 hover:bg-accent"
          >
            <span className="hidden sm:inline">{nextPage.label}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="w-20 h-9"></div> // Placeholder to maintain layout
        )}
      </div>
    </div>
  );
}