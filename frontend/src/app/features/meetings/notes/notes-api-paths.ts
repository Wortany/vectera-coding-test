import { MEETINGS_DETAIL_API } from "../meetings-api-paths";

export const NOTE_API = (meetingId: number) => `${MEETINGS_DETAIL_API(meetingId)}notes/`;