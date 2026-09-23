import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalItems > pageSize) {
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-stone border-t border-stone-light select-none">
        <div>
          Showing <span class="font-semibold text-ink">{{ startItem }}</span> to 
          <span class="font-semibold text-ink">{{ endItem }}</span> of 
          <span class="font-semibold text-ink">{{ totalItems }}</span> items
        </div>

        <div class="flex items-center gap-1">
          <button 
            type="button" 
            (click)="setPage(currentPage - 1)" 
            [disabled]="currentPage === 1"
            class="px-2.5 py-1 rounded border border-stone-border bg-white text-ink hover:bg-paper disabled:opacity-40 disabled:pointer-events-none text-xs transition-colors"
            aria-label="Previous page"
          >
            &larr; Prev
          </button>

          @for (page of visiblePages; track page) {
            <button 
              type="button" 
              (click)="setPage(page)" 
              [ngClass]="page === currentPage ? 'bg-pine text-white font-semibold border-pine' : 'bg-white text-ink border-stone-border hover:bg-paper'"
              class="px-2.5 py-1 rounded border text-xs min-w-[28px] text-center transition-colors font-mono"
            >
              {{ page }}
            </button>
          }

          <button 
            type="button" 
            (click)="setPage(currentPage + 1)" 
            [disabled]="currentPage === totalPages"
            class="px-2.5 py-1 rounded border border-stone-border bg-white text-ink hover:bg-paper disabled:opacity-40 disabled:pointer-events-none text-xs transition-colors"
            aria-label="Next page"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    }
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
