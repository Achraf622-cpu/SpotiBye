/**
 * @fileoverview Track Card Component - Display card for music track
 * @see SPOT-20 Create Track Card Component
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Track } from '../../../core/models/track.model';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [RouterLink, DurationPipe],
  template: `
    <div class="glass rounded-xl overflow-hidden card-hover group">
      <!-- Cover Image -->
      <div class="relative aspect-square bg-gradient-to-br from-primary-500/20 to-accent-500/20">
        @if (track.coverImage) {
          <img 
            [src]="track.coverImage" 
            [alt]="track.title"
            class="w-full h-full object-cover"
          />
        } @else {
          <div class="w-full h-full flex items-center justify-center">
            <svg class="w-16 h-16 text-primary-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
          </div>
        }

        <!-- Play Button Overlay -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            (click)="onPlay($event)"
            class="w-14 h-14 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-lg"
          >
            @if (isPlaying) {
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
              </svg>
            } @else {
              <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            }
          </button>
        </div>

        <!-- Playing Indicator -->
        @if (isPlaying) {
          <div class="absolute bottom-2 right-2 flex items-center gap-1 bg-primary-500 rounded-full px-2 py-1">
            <div class="flex gap-0.5">
              <span class="w-1 h-3 bg-white rounded-full animate-pulse"></span>
              <span class="w-1 h-4 bg-white rounded-full animate-pulse" style="animation-delay: 0.1s"></span>
              <span class="w-1 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 0.2s"></span>
            </div>
          </div>
        }

        <!-- Favorite Button (top left) -->
        <button 
          (click)="onToggleFavorite($event)"
          class="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          [class]="track.isFavorite ? 'bg-accent-500 text-white' : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white'"
        >
          @if (track.isFavorite) {
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          }
        </button>

        <!-- Duration Badge -->
        <div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {{ track.duration | duration }}
        </div>
      </div>

      <!-- Track Info -->
      <div class="p-4">
        <a 
          [routerLink]="['/track', track.id]"
          class="block hover:text-primary-400 transition-colors"
        >
          <h3 class="font-semibold text-white truncate mb-1">{{ track.title }}</h3>
        </a>
        <p class="text-sm text-gray-400 truncate mb-2">{{ track.artist }}</p>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 capitalize bg-dark-800 px-2 py-1 rounded">
            {{ track.category }}
          </span>
          <a 
            [routerLink]="['/track', track.id]"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `
})
export class TrackCardComponent {
  @Input({ required: true }) track!: Track;
  @Input() isPlaying = false;

  @Output() play = new EventEmitter<void>();
  @Output() viewDetails = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  onPlay(event: Event): void {
    event.stopPropagation();
    this.play.emit();
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit();
  }
}
