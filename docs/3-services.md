# 3. Services - Shared Logic Across Your App

## What is a Service?

A service is a **class that contains logic you want to share** between multiple components. Instead of copying the same code everywhere, you put it in a service and inject it where needed.

**Your SpotiBye services:**
| Service | Purpose | File |
|---------|---------|------|
| `TrackService` | CRUD operations for tracks | `src/app/core/services/track.service.ts` |
| `AudioPlayerService` | Audio playback control | `src/app/core/services/audio-player.service.ts` |
| `StorageService` | IndexedDB database access | `src/app/core/services/storage.service.ts` |
| `NotificationService` | Toast messages | `src/app/core/services/notification.service.ts` |

---

## Anatomy of a Service

**File:** `src/app/core/services/notification.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'  // Available everywhere
})
export class NotificationService {
  // State stored in signals
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  // Public methods any component can call
  success(message: string): void {
    this.addNotification(message, 'success');
  }

  error(message: string): void {
    this.addNotification(message, 'error');
  }

  private addNotification(message: string, type: Notification['type']): void {
    const id = Date.now().toString();
    this._notifications.update(n => [...n, { id, message, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: string): void {
    this._notifications.update(n => n.filter(x => x.id !== id));
  }
}
```

---

## @Injectable Decorator

```typescript
@Injectable({
  providedIn: 'root'
})
```

This tells Angular:
- This class can be injected into components
- `providedIn: 'root'` means **one instance for the entire app** (singleton)

**Why singleton matters:** When `TrackService` loads tracks, the data is shared. Every component that injects `TrackService` sees the same tracks.

---

## Injecting Services into Components

Two ways to inject (both work, choose one style):

**Modern way (your project uses this):**
```typescript
export class LibraryComponent {
  trackService = inject(TrackService);
  playerService = inject(AudioPlayerService);
}
```

**Constructor way (older, but still common):**
```typescript
export class LibraryComponent {
  constructor(
    private trackService: TrackService,
    private playerService: AudioPlayerService
  ) {}
}
```

Both do the same thing - get the service instance.

---

## Deep Dive: TrackService

**File:** `src/app/core/services/track.service.ts`

This is your most important service. Let's break it down section by section.

### State Management with Signals

```typescript
export class TrackService {
  // Private signals - only this service can modify
  private readonly _tracks = signal<Track[]>([]);
  private readonly _loadingState = signal<LoadingState>('idle');
  private readonly _error = signal<string | null>(null);

  // Public readonly - components can read but not modify
  readonly tracks = this._tracks.asReadonly();
  readonly loadingState = this._loadingState.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals - derived values
  readonly isLoading = computed(() => this._loadingState() === 'loading');
  readonly trackCount = computed(() => this._tracks().length);
  readonly favoriteCount = computed(() => 
    this._tracks().filter(t => t.isFavorite).length
  );
}
```

**Why this pattern?**
- Private signals (`_tracks`) can only be changed inside the service
- Public readonly signals (`tracks`) let components read but not accidentally modify
- Components subscribe automatically - when `_tracks` changes, UI updates

### Injecting Other Services

Services can depend on other services:

```typescript
constructor(
  private storageService: StorageService,
  private notificationService: NotificationService
) {
  this.loadTracks();  // Load data when service is created
}
```

This creates a **dependency chain:**
```
TrackService
├── StorageService (for IndexedDB)
└── NotificationService (for toast messages)
```

### Loading Data

```typescript
async loadTracks(): Promise<void> {
  this._loadingState.set('loading');  // Show loading spinner
  this._error.set(null);

  try {
    const tracks = await this.storageService.getAllTracks();
    // Sort by date, newest first
    this._tracks.set(tracks.sort((a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    ));
    this._loadingState.set('success');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load tracks';
    this._error.set(message);
    this._loadingState.set('error');
    this.notificationService.error(message);  // Show toast
  }
}
```

**Pattern breakdown:**
1. Set loading state
2. Try the async operation
3. On success: update data, set success state
4. On error: set error state, show notification

### CRUD Operations

**Create:**
```typescript
async create(dto: CreateTrackDto): Promise<Track | null> {
  // Validate first
  const validationError = this.validateTrackInput(dto);
  if (validationError) {
    this.notificationService.error(validationError);
    return null;
  }

  this._loadingState.set('loading');

  try {
    // Generate IDs
    const trackId = this.generateId();
    const audioFileId = this.generateId();

    // Calculate duration from audio file
    const duration = await this.calculateDuration(dto.audioFile);

    // Save audio file to IndexedDB
    await this.storageService.saveAudioFile({
      id: audioFileId,
      blob: dto.audioFile,
      mimeType: dto.audioFile.type,
      size: dto.audioFile.size
    });

    // Create track object
    const track: Track = {
      id: trackId,
      title: dto.title.trim(),
      artist: dto.artist.trim(),
      description: dto.description?.trim(),
      category: dto.category,
      duration,
      dateAdded: new Date(),
      audioFileId,
      coverImage: dto.coverImage,
      isFavorite: false
    };

    // Save track metadata
    await this.storageService.saveTrack(track);

    // Update local state - add to beginning of array
    this._tracks.update(tracks => [track, ...tracks]);
    
    this._loadingState.set('success');
    this.notificationService.success(`"${track.title}" added to library`);

    return track;
  } catch (err) {
    // Handle error...
  }
}
```

**Update:**
```typescript
async update(id: string, dto: UpdateTrackDto): Promise<Track | null> {
  // Validate...
  
  try {
    await this.storageService.updateTrack(id, dto);

    // Update local state
    this._tracks.update(tracks =>
      tracks.map(t => t.id === id ? { ...t, ...dto } : t)
    );

    this.notificationService.success('Track updated successfully');
    return this._tracks().find(t => t.id === id) || null;
  } catch (err) {
    // Handle error...
  }
}
```

**Delete:**
```typescript
async delete(id: string): Promise<boolean> {
  const track = this._tracks().find(t => t.id === id);
  if (!track) return false;

  try {
    await this.storageService.deleteTrack(id);

    // Remove from local state
    this._tracks.update(tracks => tracks.filter(t => t.id !== id));

    this.notificationService.success(`"${track.title}" removed from library`);
    return true;
  } catch (err) {
    // Handle error...
  }
}
```

### Toggle Favorite

```typescript
async toggleFavorite(id: string): Promise<boolean> {
  const track = this._tracks().find(t => t.id === id);
  if (!track) return false;

  const newFavoriteStatus = !track.isFavorite;

  try {
    await this.storageService.updateTrack(id, { isFavorite: newFavoriteStatus });

    // Update local state
    this._tracks.update(tracks =>
      tracks.map(t => t.id === id ? { ...t, isFavorite: newFavoriteStatus } : t)
    );

    // Show appropriate message
    if (newFavoriteStatus) {
      this.notificationService.success(`Added "${track.title}" to favorites`);
    } else {
      this.notificationService.info(`Removed "${track.title}" from favorites`);
    }

    return true;
  } catch (err) {
    this.notificationService.error('Failed to update favorite status');
    return false;
  }
}
```

---

## Deep Dive: AudioPlayerService

**File:** `src/app/core/services/audio-player.service.ts`

This service manages the HTML5 Audio element and playback state.

### Audio Element Setup

```typescript
export class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;

  constructor(private trackService: TrackService) {
    this.initAudio();
  }

  private initAudio(): void {
    this.audio = new Audio();
    this.audio.volume = this._volume();

    // React to audio events
    this.audio.addEventListener('timeupdate', () => {
      this._progress.set(this.audio?.currentTime || 0);
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('playing', () => {
      this._playerState.set('playing');
    });
  }
}
```

### Playback State

```typescript
// State signals
private readonly _currentTrack = signal<Track | null>(null);
private readonly _playerState = signal<PlayerState>('stopped');
private readonly _volume = signal(0.7);
private readonly _progress = signal(0);
private readonly _shuffle = signal(false);
private readonly _repeatMode = signal<RepeatMode>('off');

// Computed for easy checks
readonly isPlaying = computed(() => this._playerState() === 'playing');
readonly isPaused = computed(() => this._playerState() === 'paused');
readonly progressPercent = computed(() => {
  const dur = this._duration();
  return dur > 0 ? (this._progress() / dur) * 100 : 0;
});
```

### Playing a Track

```typescript
async loadTrack(track: Track, autoPlay = false): Promise<boolean> {
  if (!this.audio) return false;

  // Cleanup previous audio URL (memory management)
  if (this.audioUrl) {
    URL.revokeObjectURL(this.audioUrl);
    this.audioUrl = null;
  }

  this._playerState.set('buffering');
  this._currentTrack.set(track);

  try {
    // Get audio blob URL from storage
    const url = await this.trackService.getAudioUrl(track);
    if (!url) return false;

    this.audioUrl = url;
    this.audio.src = url;
    this.audio.load();

    if (autoPlay) {
      await this.audio.play();
    }

    return true;
  } catch (err) {
    this._playerState.set('stopped');
    return false;
  }
}
```

### Shuffle Logic

```typescript
toggleShuffle(): void {
  const newShuffle = !this._shuffle();
  this._shuffle.set(newShuffle);

  if (newShuffle) {
    // Save original order
    this.originalQueue = [...this._queue()];
    
    // Shuffle using Fisher-Yates algorithm
    const shuffled = this.shuffleArray([...this._queue()]);
    
    // Keep current track at position 0
    const currentTrack = this._currentTrack();
    if (currentTrack) {
      const currentIndex = shuffled.findIndex(t => t.id === currentTrack.id);
      if (currentIndex > 0) {
        [shuffled[0], shuffled[currentIndex]] = [shuffled[currentIndex], shuffled[0]];
      }
      this._queueIndex.set(0);
    }
    
    this._queue.set(shuffled);
  } else {
    // Restore original order
    this._queue.set(this.originalQueue);
  }
}

private shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

## Deep Dive: StorageService

**File:** `src/app/core/services/storage.service.ts`

This handles IndexedDB - the browser's local database.

### Opening the Database

```typescript
private async openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SpotiBye', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores (like tables)
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('audioFiles')) {
        db.createObjectStore('audioFiles', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### Saving Data

```typescript
async saveTrack(track: Track): Promise<void> {
  const db = await this.openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tracks'], 'readwrite');
    const store = transaction.objectStore('tracks');
    const request = store.put(track);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

---

## How Services Connect

```
Component (LibraryComponent)
    │
    ├── inject(TrackService)
    │       │
    │       ├── inject(StorageService)  ← Database
    │       │
    │       └── inject(NotificationService)  ← Toasts
    │
    └── inject(AudioPlayerService)
            │
            └── inject(TrackService)  ← Get audio URLs
```

---

## Using Services in Components

**Example:** Library component using multiple services

```typescript
// src/app/features/library/library.component.ts
export class LibraryComponent {
  trackService = inject(TrackService);    // For track data
  playerService = inject(AudioPlayerService);  // For playback

  // Read from service signals (auto-updates UI)
  filteredTracks = computed(() => {
    let tracks = this.trackService.tracks();  // Get all tracks
    // Filter logic...
    return tracks;
  });

  // Call service methods
  async onPlayTrack(track: Track): Promise<void> {
    this.playerService.setQueue([track], 0);
  }

  async onToggleFavorite(track: Track): Promise<void> {
    await this.trackService.toggleFavorite(track.id);
  }
}
```

---

## Key Takeaways

1. **Services = Shared Logic** - Don't repeat code in components, put it in a service
2. **@Injectable({ providedIn: 'root' })** - Creates a singleton available everywhere
3. **inject()** - Modern way to get a service in a component
4. **Services can depend on services** - TrackService uses StorageService
5. **State in signals** - Services hold state, components read it
6. **Private write, public read** - `_signal` private, `signal.asReadonly()` public
