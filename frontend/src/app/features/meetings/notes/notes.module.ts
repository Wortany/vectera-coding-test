import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoteAddFormComponent } from './add-form/note-add-form.component';
import { NoteListComponent } from './list/note-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NoteAddFormComponent,
    NoteListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
  ],
  exports: [
    NoteAddFormComponent,
    NoteListComponent,
  ]
})
export class NotesModule { }
