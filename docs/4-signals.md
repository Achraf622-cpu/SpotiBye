# 4. Signals - Reactive State Management

## What are Signals?

Signals are Angular's **modern way to handle state** (data that changes over time). When a signal's value changes, Angular automatically updates the UI wherever that signal is used.

**Before signals:** You had to manually tell Angular when to update the UI.
**With signals:** Angular knows automatically when to update.

---

## Basic Signal Operations

### Creating a Signal

```typescript
import { signal } from '@angular/core';

// Create a signal with initial value
const count = signal(0);              // number signal
const name = signal('');               // string signal
const isOpen = signal(false);          // boolean signal
const tracks = signal<Track[]>([]);    // array signal (with type)
```

### Reading a Signal

Signals are functions - you call them with `()` to get the value:

```typescript
console.log(count());     // 0
console.log(name());      // ''
console.log(isOpen());    // false
```

### Updating a Signal

Three ways to update:

```typescript
// 1. set() - replace the value completely
count.set(5);

// 2. update() - modify based on current value
count.update(current => current + 1);

// 3. For arrays, update is common
tracks.update(list => [...list, newTrack]);  // Add item
tracks.update(list => list.filter(t => t.id !== id));  // Remove item
```

---

## Signals in Your Project

### In Components

**File:** `src/app/features/library/library.component.ts`

```typescript
export class LibraryComponent {
  // Component state as signals
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  showUploadModal = signal(false);

  // Reading in methods
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);  // Update signal
  }

  // Reading in template (see below)
}
```

**In the template:**
```html
<!-- Reading the signal value -->
<input [value]="searchQuery()" />

<!-- Reading for conditional display -->
@if (showUploadModal()) {
  <app-upload-modal />
}

<!-- Setting via click -->
<button (click)="showUploadModal.set(true)">Add Track</button>
<button (click)="showUploadModal.set(false)">Close</button>
```

### In Services

**File:** `src/app/core/services/track.service.ts`

```typescript
export class TrackService {
  // Private signals - only this service can modify
  private readonly _tracks = signal<Track[]>([]);
  private readonly _loadingState = signal<LoadingState>('idle');
  private readonly _error = signal<string | null>(null);

  // Public readonly - components can read but NOT write
  readonly tracks = this._tracks.asReadonly();
  readonly loadingState = this._loadingState.asReadonly();
  readonly error = this._error.asReadonly();
}
```

**Why private + public readonly?**
```typescript
// In service (allowed)
this._tracks.set([track1, track2]);

// In component (this would cause an error)
this.trackService.tracks.set([]);  // ERROR! It's readonly

// In component (this works)
const allTracks = this.trackService.tracks();  // Just reading
```

This pattern prevents components from accidentally messing up the data. Only the service controls its own state.

---

## Computed Signals

A computed signal **derives its value from other signals**. It automatically recalculates when its dependencies change.

**File:** `src/app/core/services/track.service.ts`

```typescript
// Base signals
private readonly _tracks = signal<Track[]>([]);
private readonly _loadingState = signal<LoadingState>('idle');

// Computed signals - derived from base signals
readonly isLoading = computed(() => this._loadingState() === 'loading');
readonly hasError = computed(() => this._loadingState() === 'error');
readonly trackCount = computed(() => this._tracks().length);
readonly favoriteCount = computed(() => 
  this._tracks().filter(t => t.isFavorite).length
);
readonly favoriteTracks = computed(() => 
  this._tracks().filter(t => t.isFavorite)
);
```

**How it works:**
```typescript
// When _tracks changes from [] to [track1, track2, track3]
// These computed signals automatically recalculate:
trackCount()      // becomes 3
favoriteCount()   // becomes however many have isFavorite: true
```

**File:** `src/app/features/library/library.component.ts`

```typescript
// Complex computed with multiple dependencies
filteredTracks = computed(() => {
  let tracks = this.trackService.tracks();  // Dependency 1
  
  // Filter by favorites
  const category = this.selectedCategory();  // Dependency 2
  if (category === 'favorites') {
    tracks = tracks.filter(t => t.isFavorite);
  } else if (category && category !== 'all') {
    tracks = tracks.filter(t => t.category === category);
  }
  
  // Apply search filter
  const query = this.searchQuery().toLowerCase();  // Dependency 3
  if (query) {
    tracks = tracks.filter(t => 
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    );
  }
  
  return tracks;
});
```

**When does `filteredTracks` recalculate?**
- When `trackService.tracks()` changes (new track added/removed)
- When `selectedCategory()` changes (user picks different filter)
- When `searchQuery()` changes (user types in search)

Angular tracks all these dependencies automatically.

---

## Computed in AudioPlayerService

**File:** `src/app/core/services/audio-player.service.ts`

```typescript
// Base signals
private readonly _playerState = signal<PlayerState>('stopped');
private readonly _progress = signal(0);
private readonly _duration = signal(0);
private readonly _queue = signal<Track[]>([]);
private readonly _queueIndex = signal(0);
private readonly _repeatMode = signal<RepeatMode>('off');

// Computed signals
readonly isPlaying = computed(() => this._playerState() === 'playing');
readonly isPaused = computed(() => this._playerState() === 'paused');
readonly isBuffering = computed(() => this._playerState() === 'buffering');
readonly isStopped = computed(() => this._playerState() === 'stopped');
readonly hasTrack = computed(() => this._currentTrack() !== null);
readonly hasQueue = computed(() => this._queue().length > 0);

// Progress bar percentage
readonly progressPercent = computed(() => {
  const dur = this._duration();
  return dur > 0 ? (this._progress() / dur) * 100 : 0;
});

// Can play next considers repeat mode
readonly canPlayNext = computed(() => {
  const repeat = this._repeatMode();
  if (repeat === 'all' || repeat === 'one') return true;
  return this._queueIndex() < this._queue().length - 1;
});
```

---

## asReadonly()

Makes a signal read-only:

```typescript
private readonly _volume = signal(0.7);
readonly volume = this._volume.asReadonly();
```

**In service:**
```typescript
// Can modify
this._volume.set(0.5);
```

**In component:**
```typescript
// Can only read
const vol = this.playerService.volume();  // 0.5

// Cannot modify (TypeScript error)
this.playerService.volume.set(1);  // ERROR!
```

---

## Signals in Templates

### Reading Values

```html
<!-- Simple value -->
<h1>{{ playerService.currentTrack()?.title }}</h1>

<!-- With optional chaining (when value might be null) -->
<p>{{ playerService.currentTrack()?.artist }}</p>

<!-- In property binding -->
<div [style.width.%]="playerService.progressPercent()"></div>
```

### Conditional Rendering

```html
@if (playerService.isPlaying()) {
  <span>Now Playing</span>
}

@if (playerService.isBuffering()) {
  <span>Loading...</span>
}

@if (trackService.isLoading()) {
  <div class="spinner"></div>
} @else if (filteredTracks().length === 0) {
  <div>No tracks found</div>
} @else {
  <div class="grid">
    @for (track of filteredTracks(); track track.id) {
      <app-track-card [track]="track" />
    }
  </div>
}
```

### Dynamic Classes

```html
<button 
  [class]="playerService.shuffle() ? 'text-primary-400' : 'text-gray-400'"
>
  Shuffle
</button>
```

---

## Signal Update Patterns

### Adding to Array

```typescript
// Wrong (this doesn't trigger updates)
this._tracks().push(newTrack);  // DON'T DO THIS

// Correct
this._tracks.update(tracks => [...tracks, newTrack]);

// Add to beginning
this._tracks.update(tracks => [newTrack, ...tracks]);
```

### Removing from Array

```typescript
this._tracks.update(tracks => 
  tracks.filter(t => t.id !== idToRemove)
);
```

### Updating Item in Array

```typescript
this._tracks.update(tracks =>
  tracks.map(t => t.id === id ? { ...t, isFavorite: true } : t)
);
```

### Replacing Entire Array

```typescript
this._tracks.set(newTracksArray);
```

---

## Real Flow Example: Favoriting a Track

Let's trace what happens when you click the heart button:

**Step 1:** Click triggers toggleFavorite in TrackService

```typescript
// track.service.ts
async toggleFavorite(id: string): Promise<boolean> {
  const track = this._tracks().find(t => t.id === id);
  const newStatus = !track.isFavorite;

  // Save to database
  await this.storageService.updateTrack(id, { isFavorite: newStatus });

  // Update signal
  this._tracks.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, isFavorite: newStatus } : t)
  );
}
```

**Step 2:** Signal change triggers recalculations

```typescript
// These computed signals automatically recalculate:
favoriteCount()    // might go from 2 to 3
favoriteTracks()   // now includes the new favorite
```

**Step 3:** Components using these signals auto-update

```html
<!-- In library.component.ts template -->
<!-- This dropdown option auto-updates -->
<option value="favorites">
  Favorites ({{ trackService.favoriteCount() }})
</option>

<!-- This grid auto-updates if viewing favorites -->
@for (track of filteredTracks(); track track.id) {
  <app-track-card [track]="track" />
}
```

**You didn't have to:**
- Manually refresh the page
- Call any "update UI" function
- Subscribe to anything

Angular's signal system handles it all.

---

## Signals vs Variables

| Regular Variable | Signal |
|-----------------|--------|
| `count = 0` | `count = signal(0)` |
| `console.log(count)` | `console.log(count())` |
| `count = 5` | `count.set(5)` |
| UI doesn't update automatically | UI updates automatically |

---

## When to Use Signals

Use signals when:
- The value will change over time
- The UI needs to react to changes
- Multiple components need to share state

Don't need signals for:
- Constants that never change
- Values only used in logic (not displayed)

---

## Your Signal Usage Summary

**In TrackService:**
| Signal | Purpose |
|--------|---------|
| `_tracks` | All track objects |
| `_loadingState` | 'idle' / 'loading' / 'success' / 'error' |
| `isLoading` | Computed: is it loading? |
| `trackCount` | Computed: how many tracks? |
| `favoriteCount` | Computed: how many favorites? |

**In AudioPlayerService:**
| Signal | Purpose |
|--------|---------|
| `_currentTrack` | Currently playing track |
| `_playerState` | 'playing' / 'paused' / 'buffering' / 'stopped' |
| `_volume` | Volume level 0-1 |
| `_progress` | Current playback position |
| `_shuffle` | Is shuffle mode on? |
| `_repeatMode` | 'off' / 'all' / 'one' |

**In Components:**
| Signal | Component | Purpose |
|--------|-----------|---------|
| `searchQuery` | LibraryComponent | Search input value |
| `selectedCategory` | LibraryComponent | Current filter |
| `showUploadModal` | LibraryComponent | Modal visibility |
| `isEditing` | TrackDetailComponent | Edit mode toggle |
| `showDeleteConfirm` | TrackDetailComponent | Delete modal |

---

## Key Takeaways

1. **signal()** creates reactive state
2. **Read with ()** - `signal()` not `signal`
3. **set()** replaces, **update()** modifies
4. **computed()** derives values automatically
5. **asReadonly()** prevents external modification
6. **UI auto-updates** when signals change
7. **Use update() for arrays** - never mutate directly
