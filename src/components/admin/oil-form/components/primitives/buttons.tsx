import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<BaseButtonProps> = ({ onClick, disabled = false, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn("bg-primary text-white hover:bg-primary/90", className)}
    >
      Save
    </Button>
  );
};

export const CancelButton: React.FC<BaseButtonProps> = ({ onClick, disabled = false, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={cn("text-muted-foreground hover:bg-muted", className)}
    >
      Cancel
    </Button>
  );
};

export const AddButton: React.FC<BaseButtonProps> = ({ onClick, disabled = false, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={cn("text-primary hover:bg-primary/10", className)}
    >
      Add
    </Button>
  );
};

export const RemoveButton: React.FC<BaseButtonProps> = ({ onClick, disabled = false, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={cn("text-destructive hover:bg-destructive/10", className)}
    >
      Remove
    </Button>
  );
};
