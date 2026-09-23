import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto rounded-lg p-3 text-xs shadow-lg transition-all duration-200 flex items-start justify-between gap-3 border backdrop-blur-sm"
          [ngClass]="{
            'bg-moss-light border-moss/40 text-moss-dark': toast.type === 'success',
            'bg-brick-light border-brick/40 text-brick-dark': toast.type === 'error',
            'bg-amber-light border-amber/40 text-amber-dark': toast.type === 'warning',
            'bg-paper-card border-stone-border text-ink': toast.type === 'info'
          }"
        >
          <div class="flex items-start gap-2">
            <!-- Icon -->
            <span class="mt-0.5 font-bold text-sm">
              @if (toast.type === 'success') { ✓ }
              @else if (toast.type === 'error') { ✕ }
              @else if (toast.type === 'warning') { ⚠ }
              @else { ℹ }
            </span>
            <div>
              @if (toast.title) {
                <div class="font-semibold">{{ toast.title }}</div>
              }
              <div class="text-[11px] leading-relaxed">{{ toast.message }}</div>
            </div>
          </div>
          <button 
            type="button" 
            (click)="toastService.remove(toast.id)"
            class="text-stone hover:text-ink font-bold px-1"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
