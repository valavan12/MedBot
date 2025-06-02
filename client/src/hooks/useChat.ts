import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/chatApi";
import { ChatSession, ChatMessage, AdrReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useChat(sessionId: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get session data
  const { data: session } = useQuery<ChatSession>({
    queryKey: ["/api/sessions", sessionId],
    enabled: isInitialized,
    retry: false
  });

  // Get messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/sessions", sessionId, "messages"],
    enabled: isInitialized,
    retry: false
  });

  // Get ADR report
  const { data: adrReport } = useQuery<AdrReport>({
    queryKey: ["/api/sessions", sessionId, "report"],
    enabled: isInitialized,
    retry: false
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(sessionId, {
      messageType: "user",
      content,
      metadata: null
    }),
    onSuccess: (data) => {
      // Update messages cache
      queryClient.setQueryData(["/api/sessions", sessionId, "messages"], (old: ChatMessage[] = []) => [
        ...old,
        data.userMessage,
        data.botMessage
      ]);

      // Update session progress
      queryClient.setQueryData(["/api/sessions", sessionId], (old: ChatSession) => ({
        ...old,
        progressPercentage: data.progress
      }));

      // Invalidate report cache to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "report"] });
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
      console.error("Send message error:", error);
    }
  });

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      // Try to get existing session first
      try {
        await chatApi.getSession(sessionId);
      } catch {
        // Create new session if it doesn't exist
        await chatApi.createSession({
          sessionId,
          progressPercentage: 0,
          isComplete: false,
          collectedData: {}
        });
      }
      
      setIsInitialized(true);
    } catch (error) {
      toast({
        title: "Session Error",
        description: "Unable to initialize chat session. Please refresh the page.",
        variant: "destructive"
      });
      console.error("Initialize session error:", error);
    }
  }, [sessionId, isInitialized, toast]);

  // Export session
  const exportSession = useCallback(async () => {
    try {
      const blob = await chatApi.exportSession(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adr-report-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Report has been downloaded to your device."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export session data. Please try again.",
        variant: "destructive"
      });
      console.error("Export error:", error);
    }
  }, [sessionId, toast]);

  return {
    session,
    messages,
    adrReport,
    isLoading: sendMessageMutation.isPending,
    sendMessage: sendMessageMutation.mutate,
    initializeSession,
    exportSession
  };
}
