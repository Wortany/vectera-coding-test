/// <reference types="jasmine" />

import { Component, Input } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MeetingService } from '../meetings.service';
import { Meeting } from '../models/meeting.model';
import { StatusChoice } from '../summary/models/status_choice.enum';
import { SummarizeResponse } from '../summary/models/summarize_response.model';
import { Summary } from '../summary/models/summary.model';
import { SummaryService } from '../summary/summary.service';
import { MeetingDetailsComponent } from './meeting-details.component';

@Component({
  selector: 'app-note-list',
  template: '<div>Mock Note List</div>'
})
class MockAppNoteListComponent {
  @Input() meetingId?: number;
}

describe('MeetingDetailsComponent', () => {
    let component: MeetingDetailsComponent;
    let fixture: ComponentFixture<MeetingDetailsComponent>;
    let meetingService: jasmine.SpyObj<MeetingService>;
    let summaryService: jasmine.SpyObj<SummaryService>;

    const mockMeeting: Meeting = {
        id: '1',
        title: 'Test Meeting',
        started_at: new Date('2026-05-20T10:00:00Z'),
        created_at: new Date('2026-05-20T09:00:00Z'),
        note_count: 0,
    };

    const pendingSummary: Summary = {
        id: 's-1',
        content: '',
        status: StatusChoice.PENDING,
        created_at: new Date('2026-05-20T10:15:00Z'),
        updated_at: new Date('2026-05-20T10:15:00Z'),
    };

    const completedSummary: Summary = {
        id: 's-2',
        content: 'This is a completed summary.',
        status: StatusChoice.READY,
        created_at: new Date('2026-05-20T10:15:00Z'),
        updated_at: new Date('2026-05-20T10:20:00Z'),
    };

    const mockSummarizeResponse: SummarizeResponse = {
        detail: 'Summary generation started',
    };

    beforeEach(async () => {
        meetingService = jasmine.createSpyObj('MeetingService', ['getMeetingDetail']);
        summaryService = jasmine.createSpyObj('SummaryService', ['generateSummary', 'getSummary']);

        await TestBed.configureTestingModule({
            declarations: [ MeetingDetailsComponent, MockAppNoteListComponent],
            imports: [ FormsModule ],
            providers: [
                { provide: MeetingService, useValue: meetingService },
                { provide: SummaryService, useValue: summaryService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ id: '1' })),
                        queryParamMap: of(convertToParamMap({ page: '1', pageSize: '10'}))
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MeetingDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        meetingService.getMeetingDetail.and.returnValue(of(mockMeeting));
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should load meeting detail with parsed route id on ngOnInit', () => {
        meetingService.getMeetingDetail.and.returnValue(of(mockMeeting));
        fixture.detectChanges();

        expect(meetingService.getMeetingDetail).toHaveBeenCalledOnceWith(1);
        expect((component as any).meeting).toEqual(mockMeeting);
    });

    it('should render meeting title and id when meeting is available', () => {
        meetingService.getMeetingDetail.and.returnValue(of(mockMeeting));
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.textContent).toContain('Meeting Details');
        expect(native.textContent).toContain('#1');
        expect(native.textContent).toContain('Test Meeting');
    });

    it('should show loading state when meeting is undefined', () => {
        meetingService.getMeetingDetail.and.returnValue(of(mockMeeting));
        fixture.detectChanges();

        (component as any).meeting = undefined;
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.textContent).toContain('Loading meeting details...');
    });

    it('should show no summary text when latest_summary is undefined', () => {
        meetingService.getMeetingDetail.and.returnValue(of(mockMeeting));
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.textContent).toContain('No Summary Generated yet');
    });

    it('should show pending summary message when latest_summary.status is PENDING', () => {
        meetingService.getMeetingDetail.and.returnValue(of({
            ...mockMeeting,
            latest_summary: pendingSummary,
        }));
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.textContent).toContain('Generating the summary...');
    });

    it('should show failure message when latest_summary.status is FAILED', () => {
        const failedSummary: Summary = {
            ...completedSummary,
            status: StatusChoice.FAILED,
        };

        meetingService.getMeetingDetail.and.returnValue(of({
            ...mockMeeting,
            latest_summary: failedSummary,
        }));        

        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.textContent).toContain('Error generating the summary, please try again.');
    });

    it('should call summaryService.generateSummary when generateSummary is invoked', () => {
        const comp = component as any;
        comp.id = 1;
        comp.meeting = { ...mockMeeting };
        summaryService.generateSummary.and.returnValue(of(mockSummarizeResponse));
        summaryService.getSummary.and.returnValue(of(completedSummary));

        comp.generateSummary();

        expect(summaryService.generateSummary).toHaveBeenCalledOnceWith(1);
    });

    it('should update meeting.latest_summary when getSummary returns a summary', () => {
        const comp = component as any;
        comp.id = 1;
        comp.meeting = { ...mockMeeting };
        summaryService.getSummary.and.returnValue(of(completedSummary));

        comp.getSummary().subscribe();

        expect(comp.meeting.latest_summary).toEqual(completedSummary);
        expect(summaryService.getSummary).toHaveBeenCalledOnceWith(1);
    });

    it('should poll summary until status is not PENDING', fakeAsync(() => {
        const comp = component as any;
        comp.id = 1;
        comp.meeting = { ...mockMeeting };
        summaryService.getSummary.and.returnValues(of(pendingSummary), of(completedSummary));

        const results: Summary[] = [];
        comp.pollSummary().subscribe((summary: Summary) => results.push(summary));

        tick(2000);
        tick(2000);

        expect(summaryService.getSummary).toHaveBeenCalledTimes(2);
        expect(results).toEqual([pendingSummary, completedSummary]);
        expect(comp.meeting.latest_summary).toEqual(completedSummary);
    }));
});