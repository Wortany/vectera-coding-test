import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoteAddRequest } from '../models/note-add-request.model';
import { NoteService } from '../notes.services';
import { tap } from 'rxjs';

@Component({
  selector: 'app-note-add-form',
  templateUrl: './note-add-form.component.html',
})
export class NoteAddFormComponent {
    @Input() meetingId!: number;
    @Output() noteSaved: EventEmitter<void> = new EventEmitter<void>();

    protected noteForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private noteService: NoteService
    ) {
        this.noteForm = this.fb.group({
            author: ['', [Validators.required]],
            text: ['', [Validators.required]],
        });

    }

    onSubmit(): void {
        if (this.noteForm.invalid) {
            this.noteForm.markAllAsTouched();
            return;
        }
        
        const note: NoteAddRequest = {
            author: this.noteForm.get('author')?.value,
            text: this.noteForm.get('text')?.value,
        };
        this.noteService.addNote(this.meetingId, note)
            .pipe(
                tap(() => this.noteSaved.next()),
            )
            .subscribe();
    }
}
