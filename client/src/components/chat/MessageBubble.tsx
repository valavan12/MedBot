import { ChatMessage } from "@shared/schema";
import QuickActions from "./QuickActions";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.messageType === "bot";
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isBot) {
    return (
      <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
        <div className="bg-white rounded-2xl rounded-tl-md shadow-sm p-4 max-w-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">MedBot</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
              AI Assistant
            </span>
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* Quick Actions for certain message types */}
          {message.metadata?.quickActions && (
            <QuickActions actions={message.metadata.quickActions} />
          )}
          
          {/* Medication suggestions for medication-related questions */}
          {message.metadata?.questionType === "medication_name" && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Common medications:</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                  Aspirin
                </button>
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                  Ibuprofen
                </button>
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                  Acetaminophen
                </button>
                <button className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-full text-sm text-blue-600 transition-colors">
                  <i className="fas fa-search mr-1"></i>
                  Search other
                </button>
              </div>
            </div>
          )}

          {/* Symptom categories for symptom-related questions */}
          {message.metadata?.questionType === "reaction_symptoms" && (
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium text-gray-600 mb-2">Common reaction types:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-orange-500 text-xs"></i>
                  <span className="text-gray-600">Allergic reactions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-stomach text-red-500 text-xs"></i>
                  <span className="text-gray-600">Stomach issues</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-brain text-blue-500 text-xs"></i>
                  <span className="text-gray-600">Neurological</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-heart text-red-500 text-xs"></i>
                  <span className="text-gray-600">Cardiovascular</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 justify-end animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-blue-600 rounded-2xl rounded-tr-md shadow-sm p-4 max-w-md text-white">
        <p>{message.content}</p>
      </div>
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fas fa-user text-gray-600 text-sm"></i>
      </div>
    </div>
  );
}
