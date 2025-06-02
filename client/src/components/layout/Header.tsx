import { Button } from "@/components/ui/button";
import { Save, Download, Info } from "lucide-react";

interface HeaderProps {
  progress: number;
  onSave: () => void;
  onExport: () => void;
  onToggleSidebar: () => void;
}

export default function Header({ progress, onSave, onExport, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">MedBot</h1>
              <p className="text-sm text-gray-500">Adverse Reaction Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            
            {/* Session Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Save Session"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Export Data"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="p-2 text-gray-400 hover:text-gray-600 sm:hidden"
                title="Session Info"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
