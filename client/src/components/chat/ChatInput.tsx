import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxChars = 500;

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setCharCount(0);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    if (value.length <= maxChars) {
      setMessage(value);
      setCharCount(value.length);
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
      }
    }
  };

  const quickResponses = [
    "I'm not sure",
    "Can you repeat that?",
    "I need more time",
    "Start over"
  ];

  const handleQuickResponse = (response: string) => {
    setMessage(response);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <div className="flex items-end space-x-3">
        {/* Additional Actions */}
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Voice Input"
            disabled={disabled}
          >
            <Mic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Attach Medical Records"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response here... Press Enter to send"
            className="min-h-[48px] max-h-[120px] resize-none rounded-2xl border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-16"
            disabled={disabled}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl min-w-[48px] h-12"
          title="Send Message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Responses */}
      <div className="mt-3 flex flex-wrap gap-2">
        {quickResponses.map((response, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickResponse(response)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm rounded-full border-gray-200 hover:border-blue-600 hover:text-blue-600"
          >
            {response}
          </Button>
        ))}
      </div>
    </div>
  );
}
