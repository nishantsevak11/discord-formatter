
import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ColorOption {
  color: string;
  name: string;
  discordCode: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
  activeColor: string;
  onSelectColor: (color: string, discordCode: string) => void;
}

const ColorPicker = ({ colors, activeColor, onSelectColor }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((colorOption) => (
        <Tooltip key={colorOption.color}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "color-btn",
                activeColor === colorOption.color && "active"
              )}
              style={{ backgroundColor: colorOption.color }}
              onClick={() => onSelectColor(colorOption.color, colorOption.discordCode)}
              aria-label={`Set color to ${colorOption.name}`}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {colorOption.name}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ColorPicker;
