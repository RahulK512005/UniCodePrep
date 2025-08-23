import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { 
  X, 
  ExternalLink, 
  Youtube, 
  Search, 
  Loader2,
  Play,
  Globe
} from 'lucide-react';
import { SearchResults } from '../../utils/geminiService';

interface SearchResultsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  results: SearchResults | null;
  loading: boolean;
}

export default function SearchResultsOverlay({ 
  isOpen, 
  onClose, 
  keyword, 
  results, 
  loading 
}: SearchResultsOverlayProps) {
  const handleLinkClick = (url: string, title: string) => {
    // Track click for analytics
    console.log(`Clicked: ${title} - ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Search Results for "{keyword}"
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-generated learning resources powered by Gemini
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] p-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Generating search results with Gemini AI...
                </p>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-8">
              {/* YouTube Results Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                      <Play className="w-3 h-3 text-red-600" fill="currentColor" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      YouTube Search Results
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {results.youtube_urls.length} videos
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {results.youtube_urls.map((item, index) => (
                    <div
                      key={index}
                      className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleLinkClick(item.url, item.title)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLinkClick(item.url, item.title);
                        }
                      }}
                      aria-label={`Open ${item.title} in new tab`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Thumbnail placeholder */}
                        <div className="w-20 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded flex items-center justify-center flex-shrink-0">
                          <Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            YouTube Tutorial • Click to watch
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Tutorial
                            </Badge>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Results Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <Globe className="w-3 h-3 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Resources
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {results.google_urls.length} articles
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {results.google_urls.map((item, index) => (
                    <div
                      key={index}
                      className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleLinkClick(item.url, item.title)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLinkClick(item.url, item.title);
                        }
                      }}
                      aria-label={`Open ${item.title} in new tab`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Favicon placeholder */}
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Educational Resource • Click to read
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Article
                            </Badge>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No results available. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
            <span>Results generated by Gemini AI</span>
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}