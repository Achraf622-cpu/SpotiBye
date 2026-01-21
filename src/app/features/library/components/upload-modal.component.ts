/**
 * @fileoverview Upload Modal Component - Track upload form modal
 * @see SPOT-21 Create Upload Modal Component
 */
import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrackService } from '../../../core/services/track.service';
import {
  MusicCategory,
  MUSIC_CATEGORIES,
  VALIDATION,
  MAX_FILE_SIZE,
  SUPPORTED_AUDIO_FORMATS
} from '../../../core/models/track.model';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  template: `
    <div class="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" (click)="onBackdropClick($event)">
      <div class="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 class="text-xl font-semibold text-white">Add New Track</h2>
          <button 
            (click)="close.emit()"
            class="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <!-- Audio File Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Audio File *</label>
            <div 
              class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
              [class.border-gray-600]="!isDragging() && !audioFile()"
              [class.border-primary-500]="isDragging()"
              [class.border-green-500]="audioFile()"
              [class.bg-primary-500/10]="isDragging()"
              (dragover)="onDragOver($event)"
              (dragleave)="isDragging.set(false)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              <input 
                #fileInput
                type="file" 
                accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                class="hidden"
                (change)="onFileSelect($event)"
              />
              
              @if (audioFile()) {
                <div class="flex items-center justify-center gap-3">
                  <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="text-left">
                    <p class="text-white font-medium truncate max-w-xs">{{ audioFile()?.name }}</p>
                    <p class="text-sm text-gray-400">{{ formatFileSize(audioFile()?.size || 0) }}</p>
                  </div>
                  <button 
                    type="button"
                    (click)="removeFile($event)"
                    class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              } @else {
                <svg class="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <p class="text-gray-400 mb-1">Drag and drop your audio file here</p>
                <p class="text-sm text-gray-500">or click to browse</p>
                <p class="text-xs text-gray-600 mt-2">MP3, WAV, OGG • Max 10MB</p>
              }
            </div>
            @if (fileError()) {
              <p class="text-red-500 text-sm mt-2">{{ fileError() }}</p>
            }
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input 
              type="text" 
              formControlName="title"
              placeholder="Track title"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary-500 transition-colors"
              [class.border-red-500]="form.get('title')?.invalid && form.get('title')?.touched"
            />
            <div class="flex justify-between mt-1">
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <p class="text-red-500 text-xs">Title is required</p>
              } @else if (form.get('title')?.hasError('maxlength')) {
                <p class="text-red-500 text-xs">Title is too long</p>
              } @else {
                <span></span>
              }
              <p class="text-xs text-gray-500">{{ form.get('title')?.value?.length || 0 }}/{{ VALIDATION.TITLE_MAX_LENGTH }}</p>
            </div>
          </div>

          <!-- Artist -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Artist *</label>
            <input 
              type="text" 
              formControlName="artist"
              placeholder="Artist name"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary-500 transition-colors"
              [class.border-red-500]="form.get('artist')?.invalid && form.get('artist')?.touched"
            />
            @if (form.get('artist')?.hasError('required') && form.get('artist')?.touched) {
              <p class="text-red-500 text-xs mt-1">Artist is required</p>
            }
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Category *</label>
            <select 
              formControlName="category"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-primary-500 transition-colors"
            >
              @for (category of categories; track category) {
                <option [value]="category">{{ category | titlecase }}</option>
              }
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description (optional)</label>
            <textarea 
              formControlName="description"
              rows="3"
              placeholder="Add a description..."
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary-500 transition-colors resize-none"
              [class.border-red-500]="form.get('description')?.hasError('maxlength')"
            ></textarea>
            <div class="flex justify-between mt-1">
              @if (form.get('description')?.hasError('maxlength')) {
                <p class="text-red-500 text-xs">Description is too long</p>
              } @else {
                <span></span>
              }
              <p class="text-xs text-gray-500">{{ form.get('description')?.value?.length || 0 }}/{{ VALIDATION.DESCRIPTION_MAX_LENGTH }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-3 pt-2">
            <button 
              type="button"
              (click)="close.emit()"
              class="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="form.invalid || !audioFile() || isSubmitting()"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Adding...
                </span>
              } @else {
                Add Track
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UploadModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() trackAdded = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private trackService = inject(TrackService);

  categories = MUSIC_CATEGORIES;
  VALIDATION = VALIDATION;

  audioFile = signal<File | null>(null);
  fileError = signal<string | null>(null);
  isDragging = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(VALIDATION.TITLE_MAX_LENGTH)]],
    artist: ['', [Validators.required]],
    category: ['pop' as MusicCategory, [Validators.required]],
    description: ['', [Validators.maxLength(VALIDATION.DESCRIPTION_MAX_LENGTH)]]
  });

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.validateAndSetFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    this.fileError.set(null);

    // Check file type
    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      this.fileError.set('Only MP3, WAV, and OGG formats are supported');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set('File size must be 10MB or less');
      return;
    }

    this.audioFile.set(file);

    // Auto-fill title from filename if empty
    if (!this.form.get('title')?.value) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      this.form.patchValue({ title: nameWithoutExt.substring(0, VALIDATION.TITLE_MAX_LENGTH) });
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.audioFile.set(null);
    this.fileError.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.audioFile()) return;

    this.isSubmitting.set(true);

    const formValue = this.form.getRawValue();
    const result = await this.trackService.create({
      title: formValue.title!,
      artist: formValue.artist!,
      category: formValue.category!,
      description: formValue.description || undefined,
      audioFile: this.audioFile()!
    });

    this.isSubmitting.set(false);

    if (result) {
      this.trackAdded.emit();
    }
  }
}
