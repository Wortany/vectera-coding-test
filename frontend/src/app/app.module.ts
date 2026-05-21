import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MeetingDetailsComponent } from './features/meetings/details/meeting-details.component';
import { MeetingListComponent } from './features/meetings/list/meeting-list.component';
import { MeetingsModule } from './features/meetings.module';
import { NotesModule } from './features/meetings/notes/notes.module';
import { SharedModule } from './shared/shared.module';

const routes: Routes = [
    {
        path: 'meetings',
        children: [
            {
                path: '',
                component: MeetingListComponent,
                title: 'Meetings'
            },
            {
                path: ':id',
                component: MeetingDetailsComponent,
                title: 'Meeting Details',
            }
        ]
    },
];

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot(routes),
        MeetingsModule,
        NotesModule,
        SharedModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
