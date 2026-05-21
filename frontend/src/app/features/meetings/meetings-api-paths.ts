import { API_BASE } from "src/app/shared/models/base-api-path";

export const MEETINGS_API = `${API_BASE}meetings/`;
export const MEETINGS_DETAIL_API = (meetingId: number) => `${MEETINGS_API}${meetingId}/`;