import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-fade-in">
        <div class="bg-white rounded-lg border border-stone-border shadow-xl max-w-md w-full p-5 text-left">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-full" [ngClass]="isDanger ? 'bg-brick-light text-brick' : 'bg-amber-light text-amber-dark'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-ink">{{ title }}</h3>
              <p class="mt-1 text-xs text-stone">{{ message }}</p>
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button 
              type="button" 
              (click)="cancel.emit()" 
              [disabled]="loading"
              class="btn-secondary"
            >
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              (click)="confirm.emit()" 
              [disabled]="loading"
              [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'"
            >
              @if (loading) {
                <span class="inline-block animate-spin mr-1">↻</span>
              }
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = true;
  @Input() loading = false;

  // Aliases: several templates use confirmLabel / cancelLabel
  @Input() set confirmLabel(v: string) { this.confirmText = v; }
  @Input() set cancelLabel(v: string) { this.cancelText = v; }

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
