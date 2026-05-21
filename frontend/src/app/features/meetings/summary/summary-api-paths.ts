import { MEETINGS_DETAIL_API } from "../meetings-api-paths";

export const SUMMARY_API = (meetingId: number) => `${MEETINGS_DETAIL_API(meetingId)}summary/`;
export const SUMMARIZE_API = (meetingId: number) => `${MEETINGS_DETAIL_API(meetingId)}summarize/`;