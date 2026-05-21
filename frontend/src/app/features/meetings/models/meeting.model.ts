import { Summary } from "../summary/models/summary.model";

export interface Meeting {
  id?: string;
  title: string;
  started_at: Date;
  created_at: Date;
  note_count: number;
  latest_summary?: Summary;
}