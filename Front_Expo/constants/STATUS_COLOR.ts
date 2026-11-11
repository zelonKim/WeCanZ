import Colors from "./Colors";

export const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: Colors.green, text: Colors.background },
  FULL: { bg: Colors.red, text: Colors.text },
  IN_PROGRESS: { bg: Colors.red, text: Colors.text },
  CANCELED: { bg: Colors.red, text: Colors.text },
  COMPLETED: { bg: Colors.darkGray, text: Colors.text },
};
