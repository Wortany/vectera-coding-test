import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/paginated-response.model';
import { NoteAddRequest } from './models/note-add-request.model';
import { Note } from './models/note.model';
import { NOTE_API } from './notes-api-paths';


@Injectable({
  providedIn: 'root'
})
export class NoteService {
  constructor(private http: HttpClient) {}

  /**
   * Retrieve all notes
   */
  getNotes(meetingId: number, page?: number, pageSize?: number): Observable<PaginatedResponse<Note>> {
    let params = new HttpParams();
    if(page !== undefined) {
        params = params.set('page', page.toString());
    }
    if (pageSize !== undefined) {
        params = params.set('page_size', pageSize.toString());
    }
    return this.http.get<PaginatedResponse<Note>>(NOTE_API(meetingId), { params });
  }

  /**
   * Create a new note for a meeting
   */
  addNote(meetingId: number, noteRequest: NoteAddRequest): Observable<Note> {
    return this.http.post<Note>(NOTE_API(meetingId), noteRequest);
  }

  deleteNote(meetingId: number, noteId: string): Observable<void> {
    return this.http.delete<void>(`${NOTE_API(meetingId)}/${noteId}`);
  }
}
