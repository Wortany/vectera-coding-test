import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SummarizeResponse } from './models/summarize_response.model';
import { Summary } from './models/summary.model';
import { SUMMARIZE_API, SUMMARY_API } from './summary-api-paths';


@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieve latest summary if it exists
   */
  getSummary(meetingId: number): Observable<Summary> {
    return this.http.get<Summary>(SUMMARY_API(meetingId));
  }

  /**
   * Generate a new summary for a meeting
   */
  generateSummary(meetingId: number): Observable<SummarizeResponse> {
    return this.http.post<SummarizeResponse>(SUMMARIZE_API(meetingId), {});
  }
}
