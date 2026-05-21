import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/paginated-response.model';
import { MEETINGS_API, MEETINGS_DETAIL_API } from './meetings-api-paths';
import { Meeting } from './models/meeting.model';


@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private http: HttpClient) {}

  getMeetings(page?: number, pageSize?: number): Observable<PaginatedResponse<Meeting>> {
    let params = new HttpParams();
    if(page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (pageSize !== undefined) {
      params = params.set('page_size', pageSize.toString());
    }
    return this.http.get<PaginatedResponse<Meeting>>(MEETINGS_API,{ params });
  }

  getMeetingDetail(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(MEETINGS_DETAIL_API(id));
  }

  createMeeting(title: string, started_at: Date): Observable<Meeting> {
    return this.http.post<Meeting>(MEETINGS_API, { title, started_at });
  }

  updateMeeting(id: number, title: string, started_at: Date): Observable<Meeting> {
    return this.http.put<Meeting>(MEETINGS_DETAIL_API(id), { title, started_at });
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(MEETINGS_DETAIL_API(id));
  }
}
