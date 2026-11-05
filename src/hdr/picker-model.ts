import type { Copy } from "./messages.ts";
import { patterns, previewStyle, type PatternId } from "./patterns.ts";

export type PickerItem = {
  id: PatternId;
  name: string;
  description: string;
  shortcut: string | null;
  preview: Record<string, string>;
};

export function pickerItems(text: Copy): PickerItem[] {
  return patterns.map((pattern) => {
    const label = text.patterns[pattern.id];
    return {
      id: pattern.id,
      name: label.name,
      description: label.description,
      shortcut: pattern.number,
      preview: previewStyle(pattern),
    };
  });
}
