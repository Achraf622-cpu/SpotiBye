/**
 * @fileoverview Player Bar Component - Audio playback control bar
 * @see SPOT-18 Create Player Bar Component
 */
import { Component, inject } from '@angular/core';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [DurationPipe],
  template: `
    @if (playerService.hasTrack()) {
      <div class="fixed bottom-0 left-0 right-0 glass border-t border-gray-700/50 z-40">
        <!-- Progress bar (clickable) -->
        <div 
          class="h-1 bg-gray-700 cursor-pointer group"
          (click)="onProgressClick($event)"
        >
          <div 
            class="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all relative"
            [style.width.%]="playerService.progressPercent()"
          >
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        <div class="container mx-auto px-4 py-3">
          <div class="flex items-center gap-4">
            <!-- Track Info -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500/30 to-accent-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                @if (playerService.currentTrack()?.coverImage) {
                  <img 
                    [src]="playerService.currentTrack()?.coverImage" 
                    alt="Cover" 
                    class="w-full h-full object-cover rounded-lg"
                  />
                } @else {
                  <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                  </svg>
                }
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-medium text-white truncate">
                  {{ playerService.currentTrack()?.title }}
                </h4>
                <p class="text-xs text-gray-400 truncate">
                  {{ playerService.currentTrack()?.artist }}
                </p>
              </div>
            </div>

            <!-- Playback Controls -->
            <div class="flex items-center gap-1">
              <!-- Shuffle -->
              <button 
                (click)="playerService.toggleShuffle()"
                class="p-2 transition-colors hidden sm:block"
                [class]="playerService.shuffle() ? 'text-primary-400' : 'text-gray-400 hover:text-white'"
                title="Shuffle"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                </svg>
              </button>

              <!-- Previous -->
              <button 
                (click)="playerService.previous()"
                class="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                [disabled]="!playerService.hasQueue()"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <!-- Play/Pause -->
              <button 
                (click)="playerService.togglePlay()"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                @if (playerService.isPlaying()) {
                  <svg class="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                  </svg>
                } @else if (playerService.isBuffering()) {
                  <svg class="w-5 h-5 text-gray-900 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                }
              </button>

              <!-- Next -->
              <button 
                (click)="playerService.next()"
                class="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                [disabled]="!playerService.hasQueue()"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>

              <!-- Repeat -->
              <button 
                (click)="playerService.toggleRepeat()"
                class="p-2 transition-colors relative hidden sm:block"
                [class]="playerService.repeatMode() !== 'off' ? 'text-primary-400' : 'text-gray-400 hover:text-white'"
                title="Repeat"
              >
                @if (playerService.repeatMode() === 'one') {
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                  </svg>
                  <span class="absolute -top-0.5 -right-0.5 text-[8px] font-bold">1</span>
                } @else {
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                  </svg>
                }
              </button>
            </div>

            <!-- Time & Volume -->
            <div class="flex items-center gap-4 flex-1 justify-end">
              <!-- Time -->
              <div class="text-xs text-gray-400 hidden sm:block">
                <span>{{ playerService.progress() | duration }}</span>
                <span class="mx-1">/</span>
                <span>{{ playerService.duration() | duration }}</span>
              </div>

              <!-- Volume -->
              <div class="flex items-center gap-2 hidden md:flex">
                <button 
                  (click)="playerService.toggleMute()"
                  class="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  @if (playerService.isMuted() || playerService.volume() === 0) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                    </svg>
                  } @else if (playerService.volume() < 0.5) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    </svg>
                  }
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  [value]="playerService.volume()"
                  (input)="onVolumeChange($event)"
                  class="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
    }
    input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
  `]
})
export class PlayerBarComponent {
  playerService = inject(AudioPlayerService);

  onProgressClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    this.playerService.seekPercent(percent);
  }

  onVolumeChange(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.playerService.setVolume(value);
  }
}
