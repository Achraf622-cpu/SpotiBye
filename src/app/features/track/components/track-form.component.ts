/**
 * @fileoverview Track Form Component - Reactive form for editing track metadata
 * @see SPOT-24 Create Track Form Component
 */
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Track, MUSIC_CATEGORIES, VALIDATION, UpdateTrackDto } from '../../../core/models/track.model';

@Component({
  selector: 'app-track-form',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="glass rounded-2xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Edit Track</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input 
              type="text" 
              formControlName="title"
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
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary-500 transition-colors"
              [class.border-red-500]="form.get('artist')?.invalid && form.get('artist')?.touched"
            />
            @if (form.get('artist')?.hasError('required') && form.get('artist')?.touched) {
              <p class="text-red-500 text-xs mt-1">Artist is required</p>
            }
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
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
            <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea 
              formControlName="description"
              rows="4"
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

          <!-- Buttons -->
          <div class="flex gap-3 pt-2">
            <button 
              type="button"
              (click)="cancel.emit()"
              class="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="form.invalid || !form.dirty"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
/**
 * TrackFormComponent - A reactive form component for editing track metadata.
 * Uses Angular Reactive Forms for validation and form state management.
 * 
 * @example
 * <app-track-form [track]="selectedTrack" (save)="onSave($event)" (cancel)="onCancel()" />
 */
export class TrackFormComponent implements OnInit {
  @Input({ required: true }) track!: Track;
  @Output() save = new EventEmitter<UpdateTrackDto>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  categories = MUSIC_CATEGORIES;
  VALIDATION = VALIDATION;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(VALIDATION.TITLE_MAX_LENGTH)]],
    artist: ['', [Validators.required]],
    category: [''],
    description: ['', [Validators.maxLength(VALIDATION.DESCRIPTION_MAX_LENGTH)]]
  });

  /**
   * Lifecycle hook - Initialize form with track data
   */
  ngOnInit(): void {
    this.form.patchValue({
      title: this.track.title,
      artist: this.track.artist,
      category: this.track.category,
      description: this.track.description || ''
    });
  }

  /**
   * Handle form submission - emit save event with updated track data
   */
  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    this.save.emit({
      title: formValue.title!,
      artist: formValue.artist!,
      category: formValue.category as any,
      description: formValue.description || undefined
    });
  }
}
