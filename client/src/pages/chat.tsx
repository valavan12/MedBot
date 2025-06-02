import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import ChatContainer from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import InfoSidebar from "@/components/layout/InfoSidebar";
import { useChat } from "@/hooks/useChat";
import { nanoid } from "nanoid";

export default function Chat() {
  const [sessionId] = useState(() => `session-${nanoid()}`);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    messages, 
    session, 
    adrReport, 
    isLoading, 
    sendMessage, 
    initializeSession,
    exportSession 
  } = useChat(sessionId);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleExport = async () => {
    try {
      await exportSession();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleSaveSession = () => {
    // Session is automatically saved with each message
    // This could trigger a manual save or backup
    console.log("Session saved");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        progress={session?.progressPercentage || 0}
        onSave={handleSaveSession}
        onExport={handleExport}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ChatContainer 
          messages={messages}
          isLoading={isLoading}
          sessionId={sessionId}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </main>

      <InfoSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
        adrReport={adrReport}
        sessionId={sessionId}
      />

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600">
            <i className="fas fa-chart-line text-sm"></i>
            <span className="text-xs mt-1">Progress</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600">
            <i className="fas fa-question-circle text-sm"></i>
            <span className="text-xs mt-1">Help</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600">
            <i className="fas fa-pause text-sm"></i>
            <span className="text-xs mt-1">Pause</span>
          </button>
          <button 
            className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fas fa-info-circle text-sm"></i>
            <span className="text-xs mt-1">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
