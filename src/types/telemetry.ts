export interface TrafficLightState {
  green: boolean;
  amber: boolean;
  red: boolean;
}

export interface EulerMetrics {
  yaw: number;
  pitch: number;
  roll: number;
  fps: number;
}

export interface TelemetryPacket {
  desk_id: string; // e.g. "DESK-04"
  student_id: string; // e.g. "STU-042"
  status: 'NORMAL' | 'WARNING' | 'ALERT';
  traffic_light: TrafficLightState;
  metrics: EulerMetrics;
  integrity_score: number;
  violation_duration: number;
  audio_alert_trigger: boolean;
  timestamp?: string;
}

export interface IncidentRecord {
  id: string;
  timestamp: string; // e.g. "20:45:10"
  desk_id: string; // "Desk #04"
  student_id: string; // "STU-042"
  type: string; // e.g. "Right Head Glance", "Transient Head Tilt"
  euler_summary: string; // "(36.2°)"
  yaw: number;
  pitch: number;
  roll: number;
  duration: number; // in seconds, e.g. 2.3
  severity: 'CRITICAL' | 'WARNING' | 'RESOLVED';
  proof_image: string;
  status: 'FLAGGED' | 'LOGGED' | 'REVIEWED' | 'DISMISSED';
  invigilator_note?: string;
}

export interface DeskInfo {
  id: string; // "A1", "A2", "B4", etc.
  desk_label: string; // "Desk #01"
  row: string; // "Row A"
  aisle: number; // 1, 2, 3, 4
  student_id?: string;
  student_name?: string;
  status: 'COMPLIANT' | 'WARNING' | 'ALERT' | 'EMPTY';
  is_selected?: boolean;
}
