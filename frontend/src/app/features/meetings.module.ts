import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MeetingDetailsComponent } from './meetings/details/meeting-details.component';
import { MeetingListComponent } from './meetings/list/meeting-list.component';
import { NotesModule } from './meetings/notes/notes.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    MeetingDetailsComponent,
    MeetingListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NotesModule,
    RouterModule,
    SharedModule
  ]
})
export class MeetingsModule { }
