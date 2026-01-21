/**
 * @fileoverview Library Component - Main music library view
 * @see SPOT-22 Implement Library Component
 */
import { Component, inject, signal, computed } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { Track, MUSIC_CATEGORIES } from '../../core/models/track.model';
import { TrackCardComponent } from './components/track-card.component';
import { UploadModalComponent } from './components/upload-modal.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [TitleCasePipe, TrackCardComponent, UploadModalComponent],
  template: `
    <div class="min-h-screen pb-28">
      <!-- Header -->
      <header class="sticky top-0 glass z-30 border-b border-gray-700/50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <!-- Logo & Title -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <h1 class="text-2xl font-bold gradient-text">SpotiBye</h1>
            </div>

            <!-- Search & Filters -->
            <div class="flex-1 flex flex-col sm:flex-row gap-3">
              <!-- Search Input -->
              <div class="relative flex-1 max-w-md">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search tracks..."
                  [value]="searchQuery()"
                  (input)="onSearchChange($event)"
                  class="w-full bg-dark-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-primary-500 transition-colors"
                />
              </div>

              <!-- Category Filter -->
              <select 
                [value]="selectedCategory()"
                (change)="onCategoryChange($event)"
                class="bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="favorites">❤️ Favorites ({{ trackService.favoriteCount() }})</option>
                @for (category of categories; track category) {
                  <option [value]="category">{{ category | titlecase }}</option>
                }
              </select>
            </div>

            <!-- Add Track Button -->
            <button 
              (click)="showUploadModal.set(true)"
              class="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-medium px-4 py-2 rounded-lg transition-all btn-glow"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="hidden sm:inline">Add Track</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-6">
        @if (trackService.isLoading()) {
          <!-- Loading State -->
          <div class="flex items-center justify-center py-20">
            <div class="flex flex-col items-center gap-4">
              <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
              <p class="text-gray-400">Loading your library...</p>
            </div>
          </div>
        } @else if (filteredTracks().length === 0) {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-20 text-center">
            @if (trackService.trackCount() === 0) {
              <div class="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-white mb-2">Your library is empty</h2>
              <p class="text-gray-400 mb-6">Add your first track to get started!</p>
              <button 
                (click)="showUploadModal.set(true)"
                class="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-all btn-glow"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Add Your First Track</span>
              </button>
            } @else if (selectedCategory() === 'favorites') {
              <div class="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-white mb-2">No favorites yet</h2>
              <p class="text-gray-400">Click the heart icon on tracks to add them to your favorites!</p>
            } @else {
              <div class="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-white mb-2">No tracks found</h2>
              <p class="text-gray-400">Try adjusting your search or filter</p>
            }
          </div>
        } @else {
          <!-- Track Count & Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              @if (selectedCategory() === 'favorites') {
                <svg class="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              }
              <p class="text-gray-400 text-sm">
                {{ filteredTracks().length }} track{{ filteredTracks().length !== 1 ? 's' : '' }}
                @if (selectedCategory() === 'favorites') {
                  <span class="text-accent-400">in favorites</span>
                }
              </p>
            </div>
            <button 
              (click)="playAll()"
              class="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play All
            </button>
          </div>

          <!-- Tracks Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (track of filteredTracks(); track track.id) {
              <app-track-card 
                [track]="track"
                [isPlaying]="playerService.currentTrack()?.id === track.id && playerService.isPlaying()"
                (play)="onPlayTrack(track)"
                (viewDetails)="onViewDetails(track)"
                (toggleFavorite)="onToggleFavorite(track)"
              />
            }
          </div>
        }
      </main>

      <!-- Upload Modal -->
      @if (showUploadModal()) {
        <app-upload-modal 
          (close)="showUploadModal.set(false)"
          (trackAdded)="onTrackAdded()"
        />
      }
    </div>
  `
})
export class LibraryComponent {
  trackService = inject(TrackService);
  playerService = inject(AudioPlayerService);

  categories = MUSIC_CATEGORIES;
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  showUploadModal = signal(false);

  filteredTracks = computed(() => {
    let tracks = this.trackService.tracks();

    // Filter by favorites
    const category = this.selectedCategory();
    if (category === 'favorites') {
      tracks = tracks.filter(t => t.isFavorite);
    } else if (category && category !== 'all') {
      tracks = tracks.filter(t => t.category === category);
    }

    // Apply search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      tracks = tracks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query)
      );
    }

    return tracks;
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
  }

  async onPlayTrack(track: Track): Promise<void> {
    if (this.playerService.currentTrack()?.id === track.id) {
      await this.playerService.togglePlay();
    } else {
      const tracks = this.filteredTracks();
      const index = tracks.findIndex(t => t.id === track.id);
      this.playerService.setQueue(tracks, index);
    }
  }

  onViewDetails(track: Track): void {
    // Navigate to track details (handled by router link in card)
  }

  async onToggleFavorite(track: Track): Promise<void> {
    await this.trackService.toggleFavorite(track.id);
  }

  playAll(): void {
    const tracks = this.filteredTracks();
    if (tracks.length > 0) {
      this.playerService.setQueue(tracks, 0);
    }
  }

  onTrackAdded(): void {
    this.showUploadModal.set(false);
  }
}
