import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { ChatMessage } from "@shared/schema";

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
}

export default function ChatContainer({ messages, isLoading, sessionId }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Initial welcome message
  const welcomeMessage = {
    id: -1,
    sessionId,
    messageType: "bot" as const,
    content: "Hello! I'm here to help you report an adverse drug reaction safely and confidentially. This information helps improve medication safety for everyone.\n\n🛡️ Your privacy is protected - all data is handled according to HIPAA guidelines.",
    timestamp: new Date(),
    metadata: null
  };

  const allMessages = messages.length === 0 ? [welcomeMessage] : messages;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 #F1F5F9"
        }}
      >
        {allMessages.map((message, index) => (
          <MessageBubble 
            key={message.id || `message-${index}`} 
            message={message} 
          />
        ))}
        
        {isLoading && <TypingIndicator />}
      </div>
    </div>
  );
}
