import { Component } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/paginated-response.model';
import { Pagination } from 'src/app/shared/models/pagination.model';
import { MeetingService } from '../meetings.service';
import { Meeting } from '../models/meeting.model';

@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
})
export class MeetingListComponent {
    protected meetings: Meeting[] = [];
    protected totalMeetings: number = 0;

    protected hasPreviousPage: boolean = false;
    protected hasNextPage: boolean = false;

    constructor(
        private meetingService: MeetingService,
    ) {}

    protected loadMeetings(pagination: Pagination): void {
        this.meetingService.getMeetings(pagination.page, pagination.pageSize)
          .pipe(
            tap((meetingsDto: PaginatedResponse<Meeting>) => {
                this.totalMeetings = meetingsDto.count;
                this.meetings = meetingsDto.results;
                this.hasPreviousPage = !!meetingsDto.previous;
                this.hasNextPage = !!meetingsDto.next;
            }),
            catchError((error: any) => {
                console.error('Error loading meetings:', error);
                return [];
            })
          )
          .subscribe();
    }
}
