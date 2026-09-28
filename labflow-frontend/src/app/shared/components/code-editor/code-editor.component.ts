import { Component, EventEmitter, Input, Output, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SupportedLanguage {
  id: number;
  name: string;
  extension: string;
  defaultCode: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: 62,
    name: 'Java (OpenJDK 13.0.1)',
    extension: '.java',
    defaultCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Hello, LabFlow!");
    }
}`
  },
  {
    id: 71,
    name: 'Python (3.8.1)',
    extension: '.py',
    defaultCode: `import sys

def main():
    print("Hello, LabFlow!")

if __name__ == "__main__":
    main()`
  },
  {
    id: 54,
    name: 'C++ (GCC 9.2.0)',
    extension: '.cpp',
    defaultCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, LabFlow!" << endl;
    return 0;
}`
  },
  {
    id: 50,
    name: 'C (GCC 9.2.0)',
    extension: '.c',
    defaultCode: `#include <stdio.h>

int main() {
    printf("Hello, LabFlow!\\n");
    return 0;
}`
  },
  {
    id: 63,
    name: 'JavaScript (Node.js 12.14.0)',
    extension: '.js',
    defaultCode: `const fs = require('fs');

function main() {
    console.log("Hello, LabFlow!");
}

main();`
  }
];

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="rounded-xl border border-[#E5EAF2] bg-white overflow-hidden shadow-sm flex flex-col">
      <!-- Editor Header -->
      <div class="bg-[#F8FAFC] border-b border-[#E5EAF2] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 mr-2">
            <span class="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
            <span class="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span class="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
          </div>
          <span class="text-xs font-semibold text-[#0B1F44] tracking-wide uppercase font-mono">
            {{ selectedLanguage?.name ? selectedLanguage.name.split(' ')[0] : 'Code' }} Editor
          </span>
          <span *ngIf="readOnly" class="badge badge-closed text-[10px]">Read-Only</span>
        </div>

        <div *ngIf="!readOnly" class="flex items-center gap-2">
          <!-- Language Selector -->
          <select
            [ngModel]="selectedLanguageId"
            (ngModelChange)="onLanguageChange($event)"
            class="text-xs font-medium bg-white border border-[#E5EAF2] text-[#0B1F44] rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-600">
            <option *ngFor="let lang of languages" [value]="lang.id">
              {{ lang.name }}
            </option>
          </select>

          <!-- File Upload Button -->
          <label class="btn btn-outline btn-sm cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import File</span>
            <input type="file" (change)="onFileUpload($event)" class="hidden" accept=".java,.py,.cpp,.c,.js,.txt" />
          </label>
        </div>
      </div>

      <!-- Editor Main Body -->
      <div class="relative flex font-mono text-xs leading-relaxed bg-[#FAFCFF] min-h-[320px] max-h-[560px] overflow-hidden">
        <!-- Line Numbers Column -->
        <div #lineNumbersEl class="w-12 select-none text-right pr-3 pt-3 pb-3 bg-[#F1F5F9] border-r border-[#E2E8F0] text-[#94A3B8] font-mono leading-[22px] overflow-hidden">
          <div *ngFor="let line of lineNumbers">{{ line }}</div>
        </div>

        <!-- Editable / Read-only Textarea -->
        <textarea
          #codeTextarea
          [ngModel]="code"
          (ngModelChange)="onCodeChange($event)"
          (keydown)="handleKeyDown($event)"
          (scroll)="syncScroll($event, lineNumbersEl)"
          [readonly]="readOnly"
          placeholder="Write or paste your code solution here..."
          class="flex-1 p-3 bg-transparent text-[#0B1F44] focus:outline-none resize-none font-mono text-xs leading-[22px] overflow-auto whitespace-pre tab-2"
          spellcheck="false"
        ></textarea>
      </div>

      <!-- Editor Footer Status -->
      <div class="bg-[#F8FAFC] border-t border-[#E5EAF2] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#64748B]">
        <span>Lines: {{ lineNumbers.length }} | Characters: {{ code ? code.length : 0 }}</span>
        <span>UTF-8 | Tab size: 4 spaces</span>
      </div>
    </div>
  `,
  styles: [`
    .tab-2 {
      tab-size: 4;
      -moz-tab-size: 4;
    }
  `]
})
export class CodeEditorComponent implements OnInit, ControlValueAccessor {
  @Input() readOnly = false;
  @Input() initialLanguageId = 62; // Java default
  @Input() languageName?: string;
  @Output() languageChange = new EventEmitter<SupportedLanguage>();

  languages = SUPPORTED_LANGUAGES;
  selectedLanguageId = 62;
  selectedLanguage: SupportedLanguage = SUPPORTED_LANGUAGES[0];

  code = '';
  lineNumbers: number[] = [1];

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.languageName) {
      const wanted = this.languageName.toLowerCase();
      const byName = this.languages.find(l => l.name.split(' ')[0].toLowerCase() === wanted);
      if (byName) this.initialLanguageId = byName.id;
    }
    if (this.initialLanguageId) {
      this.selectedLanguageId = this.initialLanguageId;
      const found = this.languages.find(l => l.id === this.initialLanguageId);
      if (found) {
        this.selectedLanguage = found;
        if (!this.code) {
          this.code = found.defaultCode;
          this.updateLines();
        }
      }
    }
  }

  writeValue(value: string): void {
    this.code = value || '';
    if (!this.code && this.selectedLanguage && !this.readOnly) {
      this.code = this.selectedLanguage.defaultCode;
    }
    this.updateLines();
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.readOnly = isDisabled;
  }

  onCodeChange(val: string): void {
    this.code = val;
    this.updateLines();
    this.onChange(val);
    this.onTouched();
  }

  onLanguageChange(langId: number): void {
    this.selectedLanguageId = Number(langId);
    const lang = this.languages.find(l => l.id === this.selectedLanguageId);
    if (lang) {
      this.selectedLanguage = lang;
      this.languageChange.emit(lang);
      if (!this.code || this.isDefaultCodeOfAnyLanguage(this.code)) {
        this.code = lang.defaultCode;
        this.updateLines();
        this.onChange(this.code);
      }
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      this.code = this.code.substring(0, start) + '    ' + this.code.substring(end);
      this.updateLines();
      this.onChange(this.code);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    const matchedLang = this.languages.find(l => l.extension === extension);
    if (matchedLang) {
      this.selectedLanguageId = matchedLang.id;
      this.selectedLanguage = matchedLang;
      this.languageChange.emit(matchedLang);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content !== undefined) {
        this.code = content;
        this.updateLines();
        this.onChange(this.code);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  syncScroll(event: Event, target: HTMLElement): void {
    target.scrollTop = (event.target as HTMLTextAreaElement).scrollTop;
  }

  private updateLines(): void {
    const count = (this.code || '').split('\n').length;
    this.lineNumbers = Array.from({ length: Math.max(1, count) }, (_, i) => i + 1);
  }

  private isDefaultCodeOfAnyLanguage(code: string): boolean {
    return this.languages.some(l => l.defaultCode.trim() === code.trim());
  }
}
