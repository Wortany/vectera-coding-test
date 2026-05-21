import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, Observable, switchMap, takeWhile, tap, throwError, timer } from 'rxjs';
import { MeetingService } from '../meetings.service';
import { Meeting } from '../models/meeting.model';
import { StatusChoice } from '../summary/models/status_choice.enum';
import { SummarizeResponse } from '../summary/models/summarize_response.model';
import { Summary } from '../summary/models/summary.model';
import { SummaryService } from '../summary/summary.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
})
export class MeetingDetailsComponent {
    protected id!: number;
    protected meeting?: Meeting

    protected readonly StatusChoicePending: StatusChoice = StatusChoice.PENDING;
    protected readonly StatusChoiceFailed: StatusChoice = StatusChoice.FAILED;

    protected errorMessage?: string;

    constructor(
        private meetingService: MeetingService,
        private summaryService: SummaryService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {
            const id = params.get('id');
            const idNumber = Number(id);
            if (id && !isNaN(idNumber)) {
                this.id = idNumber;
            }
            this.loadMeetingDetails();
        });
    }

    protected generateSummary(): void {
        if (!this.id) {
            console.error('Cannot Summmarize without meeting id');
        }
        this.summaryService.generateSummary(this.id)
            .pipe(
                tap((response: SummarizeResponse) => {
                    if (!this.meeting) {
                        console.error('Cannot assign Summary without Meeting');
                        return;
                    }
                }),
                switchMap(() => this.getSummary()),
                switchMap(() => this.pollSummary()),
            )
            .subscribe();
    }

    protected pollSummary(): Observable<Summary> {
        return timer(2000, 2000)
            .pipe(
                switchMap(() => this.getSummary()),
                takeWhile(summary => summary.status === StatusChoice.PENDING, true),
            )
    }

    protected getSummary(): Observable<Summary> {
        return this.summaryService.getSummary(this.id)
            .pipe(
                tap((summary) => {
                    if (this.meeting) {
                            this.meeting.latest_summary = summary;
                        }
                })
            )
    }

    private loadMeetingDetails(): void {
        if (!this.id) {
            this.errorMessage = 'Meeting Id not found';
            console.error(this.errorMessage);
            return;
        }

        this.meetingService.getMeetingDetail(this.id)
            .pipe(
                tap((meeting) => {
                    this.meeting = meeting;
                }),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 404) {
                        this.errorMessage = 'The detail could not be loaded.';
                        return throwError(() => new Error(this.errorMessage));
                    }
                    else {
                        this.errorMessage = 'An unexpected error occurred.';
                        return throwError(() => new Error(this.errorMessage));
                    }
                }),
            )
            .subscribe();
    }
}
