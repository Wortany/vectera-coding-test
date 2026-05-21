import { StatusChoice } from "./status_choice.enum";

export interface Summary {
  id?: string;
  content: string;
  status: StatusChoice;
  created_at: Date;
  updated_at: Date;
}