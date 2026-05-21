import { Component, Input, ViewChild } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/paginated-response.model';
import { Pagination } from 'src/app/shared/models/pagination.model';
import { Note } from '../models/note.model';
import { NoteService } from '../notes.services';
import { ListComponent } from 'src/app/shared/components/list/list.component';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
})
export class NoteListComponent {
    @Input() meetingId?: number;
    @ViewChild(ListComponent) listComponent!: ListComponent<Note>;

    protected notes: Note[] = [];
    protected totalNotes: number = 0;

    protected hasPreviousPage: boolean = false;
    protected hasNextPage: boolean = false;

    protected isNoteAddFormOpen: boolean = false;

    constructor(
        private noteService: NoteService,
        
    ) {}

    protected loadNotes(pagination: Pagination): void {
        if (!this.meetingId) {
            console.warn('Meeting ID is required to load notes.');
            return;
        }
        this.noteService.getNotes(this.meetingId, pagination.page, pagination.pageSize)
          .pipe(
            tap((notesDto: PaginatedResponse<Note>) => {
                this.notes = notesDto.results;
                this.totalNotes = notesDto.count;
                this.hasPreviousPage = notesDto.previous !== null;
                this.hasNextPage = notesDto.next !== null;
            }),
            catchError((error: any) => {
                console.error('Error loading notes:', error);
                return [];
            })
          )
          .subscribe();
    }

    protected openNoteAddForm(): void {
        this.isNoteAddFormOpen = true;
    }

    protected onNoteSaved(): void {
        this.isNoteAddFormOpen = false;
        this.listComponent.reload();
    }
}
