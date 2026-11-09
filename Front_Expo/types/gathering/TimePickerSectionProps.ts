export interface TimePickerSectionProps {
  selectedHour: number;
  selectedMinute: number;
  onSelectHour: (h: number) => void;
  onSelectMinute: (m: number) => void;
  hours: number[];
  minutes: number[];
  labels: { time: string; hour: string; minute: string };
  styles: any;
}
