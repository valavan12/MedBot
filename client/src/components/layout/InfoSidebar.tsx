import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Shield, Star } from "lucide-react";
import { ChatSession, AdrReport } from "@shared/schema";

interface InfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
  adrReport: AdrReport | null;
  sessionId: string;
}

export default function InfoSidebar({ isOpen, onClose, session, adrReport, sessionId }: InfoSidebarProps) {
  const progressItems = [
    {
      key: "medication",
      label: "Medication identified",
      completed: Boolean(adrReport?.medicationName),
      inProgress: false
    },
    {
      key: "symptoms",
      label: "Symptoms described",
      completed: Boolean(adrReport?.reactionSymptoms),
      inProgress: Boolean(adrReport?.medicationName && !adrReport?.reactionSymptoms)
    },
    {
      key: "timeline",
      label: "Timeline established",
      completed: Boolean(adrReport?.timelineStart),
      inProgress: Boolean(adrReport?.reactionSymptoms && !adrReport?.timelineStart)
    },
    {
      key: "severity",
      label: "Severity assessed",
      completed: Boolean(adrReport?.reactionSeverity),
      inProgress: Boolean(adrReport?.timelineStart && !adrReport?.reactionSeverity)
    },
    {
      key: "demographics",
      label: "Demographics collected",
      completed: Boolean(adrReport?.patientAge),
      inProgress: Boolean(adrReport?.reactionSeverity && !adrReport?.patientAge)
    }
  ];

  const handleRateSession = (rating: number) => {
    // TODO: Implement session rating
    console.log("Session rated:", rating);
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-20 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Session Information</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Progress */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Collection Progress</h4>
          <div className="space-y-3">
            {progressItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    item.completed 
                      ? "bg-green-500" 
                      : item.inProgress 
                        ? "bg-blue-600 animate-pulse" 
                        : "bg-gray-200"
                  }`}>
                    {item.completed && (
                      <i className="fas fa-check text-white text-xs"></i>
                    )}
                  </div>
                  <span className={`text-sm ${
                    item.completed ? "text-gray-700" : item.inProgress ? "text-gray-700" : "text-gray-400"
                  }`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-xs ${
                  item.completed 
                    ? "text-gray-500" 
                    : item.inProgress 
                      ? "text-blue-600" 
                      : "text-gray-400"
                }`}>
                  {item.completed ? "Complete" : item.inProgress ? "In progress" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collected Data Summary */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Collected Information</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Medication:</span>
              <span className="text-gray-900 ml-2">
                {adrReport?.medicationName || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Reporter ID:</span>
              <span className="text-gray-900 ml-2">#{sessionId.slice(-6)}</span>
            </div>
            <div>
              <span className="text-gray-500">Started:</span>
              <span className="text-gray-900 ml-2">
                {session?.startTime ? new Date(session.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900 text-sm">HIPAA Compliant</h5>
              <p className="text-xs text-gray-600 mt-1">
                Your personal health information is protected and encrypted. 
                Data is only used for safety reporting purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Training Feedback */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Help Improve MedBot</h4>
          <p className="text-sm text-gray-600 mb-3">Rate the conversation quality:</p>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="outline"
                size="sm"
                onClick={() => handleRateSession(rating)}
                className="w-8 h-8 rounded-full p-0 hover:border-blue-600 hover:text-blue-600"
              >
                <Star className="h-3 w-3" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
