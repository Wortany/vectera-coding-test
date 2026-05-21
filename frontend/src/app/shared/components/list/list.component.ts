import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent<T> implements OnInit {
    @Input() itemLabel: string = "";
    @Input() totalItems: number = 0;
    @Input() items: T[] = [];
    @Input() hasPreviousPage: boolean = false;
    @Input() hasNextPage: boolean = false;

    @ContentChild('rowTemplate') rowTemplate!: TemplateRef<any>;

    @Output() loadItems: EventEmitter<{ page: number, pageSize: number }> = new EventEmitter<{ page: number, pageSize: number }>();

    protected pageChanged: Subject<number> = new Subject<number>();
    protected pageSizeChanged: Subject<number> = new Subject<number>();

    protected page: number = 1;
    protected pageSize: number = 10;

    constructor(
        private activatedRoute: ActivatedRoute
    ) {
        this.registerPageChangeListener();
        this.registerPageSizeChangeListener();
    }

    ngOnInit(): void {
        this.activatedRoute.queryParamMap.subscribe(params => {
            const page = params.get('page');
            const pageNumber = Number(page)
            if (page && !isNaN(pageNumber)) {
                this.page = pageNumber;
            }

            const pageSize = params.get('pageSize');
            const pageSizeNumber = Number(pageSize);
            if (pageSize && !isNaN(pageSizeNumber)) {
                this.pageSize = pageSizeNumber;
            }
            this.loadItems.next({ page: this.page, pageSize: this.pageSize });
        });
    }

    reload(): void {
        this.page = 1;
        this.loadItems.next({ page: this.page, pageSize: this.pageSize });
    }

    protected previousPage(): void {
        if (this.page && this.hasPreviousPage) {
            this.page--;
            this.loadItems.next({ page: this.page, pageSize: this.pageSize });
        }
    }

    protected nextPage(): void {
        if (this.page && this.hasNextPage) {
            this.page++;
            this.loadItems.next({ page: this.page, pageSize: this.pageSize });
        }
    }

    protected goToPage(page: number): void {
        const max = this.getMaxPage();
        if (page < 1) {
            page = 1;
        }

        if (page > max) {
            page = max;
        }

        this.page = page;
        this.loadItems.next({ page: this.page, pageSize: this.pageSize });
    }

    protected getMaxPage(): number {
        return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }

    private registerPageChangeListener(): void {
        this.pageChanged
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),   
            )
            .subscribe((page: number) => {
                this.page = page;
                this.goToPage(this.page);
            });
    }

    private registerPageSizeChangeListener(): void {
        this.pageSizeChanged
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),   
            )
            .subscribe((pageSize: number) => {
                this.pageSize = pageSize;
                this.goToPage(1); // Reset to first page when page size changes
            });
    }
}
