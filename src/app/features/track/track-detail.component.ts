/**
 * @fileoverview Track Detail Component - Full track view with playback controls
 * @see SPOT-25 Implement Track Detail Component
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { NotificationService } from '../../core/services/notification.service';
import { Track } from '../../core/models/track.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { TrackFormComponent } from './components/track-form.component';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [RouterLink, DurationPipe, TrackFormComponent],
  template: `
    <div class="min-h-screen pb-28">
      <!-- Back Button Header -->
      <header class="sticky top-0 glass z-30 border-b border-gray-700/50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center gap-4">
            <a 
              routerLink="/library"
              class="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            <h1 class="text-lg font-semibold text-white">Track Details</h1>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-6">
        @if (loading()) {
          <!-- Loading State -->
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        } @else if (!track()) {
          <!-- Not Found State -->
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white mb-2">Track not found</h2>
            <p class="text-gray-400 mb-6">The track you're looking for doesn't exist</p>
            <a 
              routerLink="/library"
              class="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium px-6 py-3 rounded-lg transition-all btn-glow"
            >
              Go to Library
            </a>
          </div>
        } @else if (isEditing()) {
          <!-- Edit Form -->
          <app-track-form 
            [track]="track()!"
            (save)="onSave($event)"
            (cancel)="isEditing.set(false)"
          />
        } @else {
          <!-- Track Details -->
          <div class="max-w-3xl mx-auto">
            <div class="glass rounded-2xl overflow-hidden">
              <!-- Cover & Main Info -->
              <div class="relative">
                <div class="aspect-video bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                  @if (track()?.coverImage) {
                    <img 
                      [src]="track()?.coverImage" 
                      [alt]="track()?.title"
                      class="w-full h-full object-cover"
                    />
                  } @else {
                    <svg class="w-24 h-24 text-primary-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                  }
                </div>

                <!-- Large Play Button -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <button 
                    (click)="onPlay()"
                    class="w-20 h-20 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center transform hover:scale-105 transition-all shadow-2xl btn-glow"
                  >
                    @if (isCurrentTrackPlaying()) {
                      <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                      </svg>
                    } @else {
                      <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    }
                  </button>
                </div>
              </div>

              <!-- Track Info -->
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h1 class="text-2xl font-bold text-white mb-1">{{ track()?.title }}</h1>
                    <p class="text-lg text-gray-400">{{ track()?.artist }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      (click)="onToggleFavorite()"
                      class="p-2 transition-colors rounded-lg hover:bg-gray-800"
                      [class]="track()?.isFavorite ? 'text-accent-500' : 'text-gray-400 hover:text-accent-400'"
                      title="Toggle Favorite"
                    >
                      @if (track()?.isFavorite) {
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      } @else {
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      }
                    </button>
                    <button 
                      (click)="isEditing.set(true)"
                      class="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button 
                      (click)="onDelete()"
                      class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-800"
                      title="Delete"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Metadata -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div class="bg-dark-800 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Duration</p>
                    <p class="text-white font-medium">{{ track()?.duration | duration }}</p>
                  </div>
                  <div class="bg-dark-800 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Category</p>
                    <p class="text-white font-medium capitalize">{{ track()?.category }}</p>
                  </div>
                  <div class="bg-dark-800 rounded-lg p-3 col-span-2">
                    <p class="text-xs text-gray-500 mb-1">Added</p>
                    <p class="text-white font-medium">{{ formatDate(track()?.dateAdded) }}</p>
                  </div>
                </div>

                <!-- Description -->
                @if (track()?.description) {
                  <div>
                    <h3 class="text-sm font-medium text-gray-400 mb-2">Description</h3>
                    <p class="text-gray-300">{{ track()?.description }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </main>

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" (click)="showDeleteConfirm.set(false)">
          <div class="glass rounded-2xl w-full max-w-sm p-6" (click)="$event.stopPropagation()">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white mb-2">Delete Track?</h3>
              <p class="text-gray-400 text-sm mb-6">
                Are you sure you want to delete "{{ track()?.title }}"? This action cannot be undone.
              </p>
              <div class="flex gap-3">
                <button 
                  (click)="showDeleteConfirm.set(false)"
                  class="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  (click)="confirmDelete()"
                  class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
/**
 * TrackDetailComponent - Display full track details with playback controls.
 * Features: play/pause, favorite toggle, edit mode, and delete confirmation.
 */
export class TrackDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trackService = inject(TrackService);
  private playerService = inject(AudioPlayerService);
  private notificationService = inject(NotificationService);

  track = signal<Track | null>(null);
  loading = signal(true);
  isEditing = signal(false);
  showDeleteConfirm = signal(false);

  ngOnInit(): void {
    this.loadTrack();
  }

  /**
   * Load track data from route parameter ID
   */
  async loadTrack(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    const track = await this.trackService.getById(id);
    this.track.set(track);
    this.loading.set(false);
  }

  /**
   * Check if this track is currently playing
   */
  isCurrentTrackPlaying(): boolean {
    const current = this.playerService.currentTrack();
    return current?.id === this.track()?.id && this.playerService.isPlaying();
  }

  async onPlay(): Promise<void> {
    const track = this.track();
    if (!track) return;

    if (this.playerService.currentTrack()?.id === track.id) {
      await this.playerService.togglePlay();
    } else {
      this.playerService.setQueue([track], 0);
    }
  }

  async onSave(updates: any): Promise<void> {
    const track = this.track();
    if (!track) return;

    const result = await this.trackService.update(track.id, updates);
    if (result) {
      this.track.set(result);
      this.isEditing.set(false);
    }
  }

  onDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  async onToggleFavorite(): Promise<void> {
    const track = this.track();
    if (!track) return;

    await this.trackService.toggleFavorite(track.id);
    // Reload track to get updated favorite status
    const updated = await this.trackService.getById(track.id);
    if (updated) {
      this.track.set(updated);
    }
  }

  async confirmDelete(): Promise<void> {
    const track = this.track();
    if (!track) return;

    const success = await this.trackService.delete(track.id);
    if (success) {
      this.router.navigate(['/library']);
    }
    this.showDeleteConfirm.set(false);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
