import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3 animate-pulse" [attr.aria-busy]="true" aria-label="Loading content">
      @for (item of rowsArray; track item) {
        <div class="bg-white border border-stone-border rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2">
              <div class="h-4 bg-stone-light/80 rounded w-16"></div>
              <div class="h-4 bg-stone-light rounded w-1/3"></div>
              <div class="h-4 bg-stone-light/60 rounded w-12"></div>
            </div>
            <div class="h-3 bg-stone-light/60 rounded w-2/3"></div>
          </div>
          <div class="h-7 bg-stone-light/70 rounded w-24 shrink-0"></div>
        </div>
      }
    </div>
  `
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
