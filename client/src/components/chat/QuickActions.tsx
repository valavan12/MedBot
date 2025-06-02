import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  actions: string[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const handleAction = (action: string) => {
    // TODO: Implement quick action handling
    console.log("Quick action:", action);
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleAction(action)}
          className="px-3 py-1.5 text-sm rounded-full border-gray-200 hover:border-blue-600 hover:text-blue-600"
        >
          {action}
        </Button>
      ))}
    </div>
  );
}
