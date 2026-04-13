/**
 * Animates between two icons when toggled (scale + rotate transition).
 * Pass icon color and size on the icon JSX itself, e.g. <Copy className="size-3 text-muted-foreground" />.
 *
 * @example
 * <IconToggle
 *   isToggled={hasCopied}
 *   primary={<Copy className="size-3" />}
 *   secondary={<Check className="size-3" />}
 * />
 */
interface IconToggleProps {
  isToggled: boolean;
  primary: React.ReactNode;
  secondary: React.ReactNode;
}

export function IconToggle({ isToggled, primary, secondary }: IconToggleProps) {
  return (
    <span className="relative flex items-center justify-center size-4">
      <div className={`transition-all ${isToggled ? "-rotate-90 scale-0" : "rotate-0 scale-100"}`}>
        {primary}
      </div>
      <div className={`absolute transition-all ${isToggled ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}>
        {secondary}
      </div>
    </span>
  );
}
