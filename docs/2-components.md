 2. Components - The Building Blocks of Angular

## What is a Component?

A component is a **self-contained piece of your UI**. Think of it like a LEGO brick - each one has:
- Its own **HTML template** (what it looks like)
- Its own **TypeScript class** (what it does)
- Its own **CSS styles** (optional, how it's styled)

Your SpotiBye app is made of many components working together:

```
App (shell)
├── LibraryComponent (the main page)
│   ├── TrackCardComponent (one for each track)
│   └── UploadModalComponent (the upload popup)
├── TrackDetailComponent (track detail page)
│   └── TrackFormComponent (the edit form)
├── PlayerBarComponent (bottom player)
└── NotificationsComponent (toast messages)
```

---



## Anatomy of a Component

Let's look at a real component from your project.

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-player-bar',      // 1. The HTML tag name
  standalone: true,                 // 2. Modern Angular style
  imports: [DurationPipe],          // 3. Dependencies
  template: `...`,                  // 4. The HTML
  styles: [`...`]                   // 5. CSS (optional)
})
export class PlayerBarComponent {  // 6. The class with logic
  playerService = inject(AudioPlayerService);
  
  onProgressClick(event: MouseEvent): void {
    // handle click
  }
}
```

Let's break down each part:

---

## 1. The Selector

```typescript
selector: 'app-player-bar'
```

This is the **custom HTML tag** you use to place this component. In your `app.ts`:

```html
<router-outlet />
<app-player-bar />      <!-- This loads PlayerBarComponent -->
<app-notifications />
```

**Naming convention:** Always prefix with `app-` to avoid conflicts with HTML elements.

---

## 2. Standalone: true

```typescript
standalone: true
```

This is the **modern Angular approach** (Angular 14+). It means:
- The component is self-contained
- No need for NgModule (the old way)
- You directly import what you need

All your components use this modern style.

---

## 3. Imports Array

```typescript
imports: [DurationPipe, RouterLink, TrackCardComponent]
```

List everything this component uses:
- Other components: `TrackCardComponent`
- Pipes: `DurationPipe`, `TitleCasePipe`
- Directives: `RouterLink`

**Example from:** `src/app/features/library/library.component.ts`
```typescript
imports: [TitleCasePipe, TrackCardComponent, UploadModalComponent]
```

If you use `<app-track-card>` in your template but forget to import `TrackCardComponent`, Angular will throw an error.

---

## 4. Template (The HTML)

Two ways to define it:

**Inline template** (for shorter templates):
```typescript
template: `
  <div class="player">
    <button (click)="play()">Play</button>
  </div>
`
```

**External file** (for longer templates):
```typescript
templateUrl: './player-bar.component.html'
```

Your project uses **inline templates** everywhere - the HTML is directly in the `.ts` file inside backticks.

---

## 5. Styles (Optional)

```typescript
styles: [`
  input[type="range"]::-webkit-slider-thumb {
    width: 12px;
    height: 12px;
    background: white;
  }
`]
```

Component styles are **scoped** - they only affect that component, not the rest of the app.

---

## 6. The Component Class

This is where your **logic** lives.

**File:** `src/app/features/library/library.component.ts`

```typescript
export class LibraryComponent {
  // Injecting services
  trackService = inject(TrackService);
  playerService = inject(AudioPlayerService);

  // Component state (signals)
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  showUploadModal = signal(false);

  // Computed values
  filteredTracks = computed(() => {
    let tracks = this.trackService.tracks();
    // filtering logic...
    return tracks;
  });

  // Methods
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  async onPlayTrack(track: Track): Promise<void> {
    // play logic
  }
}
```

---

## @Input() - Receiving Data from Parent

When a parent component needs to pass data DOWN to a child.

**File:** `src/app/features/library/components/track-card.component.ts`

```typescript
export class TrackCardComponent {
  @Input({ required: true }) track!: Track;  // Required input
  @Input() isPlaying = false;                 // Optional with default
}
```

**How the parent uses it** (in `library.component.ts`):
```html
<app-track-card 
  [track]="track"
  [isPlaying]="playerService.currentTrack()?.id === track.id"
/>
```

The `[brackets]` means **property binding** - pass the value of the expression.

**Key points:**
- `required: true` - Angular will error if parent doesn't provide it
- The `!` in `track!: Track` tells TypeScript "trust me, this will be set"
- Default values like `isPlaying = false` make the input optional

---

## @Output() - Sending Events to Parent

When a child needs to notify the parent that something happened.

**File:** `src/app/features/library/components/track-card.component.ts`

```typescript
export class TrackCardComponent {
  @Output() play = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  onPlay(event: Event): void {
    event.stopPropagation();  // Prevent click bubbling
    this.play.emit();         // Fire the event!
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit();
  }
}
```

**How the parent listens** (in `library.component.ts`):
```html
<app-track-card 
  [track]="track"
  (play)="onPlayTrack(track)"
  (toggleFavorite)="onToggleFavorite(track)"
/>
```

The `(parentheses)` means **event binding** - call this method when event fires.

**In the parent class:**
```typescript
async onPlayTrack(track: Track): Promise<void> {
  // Parent handles the play logic
  this.playerService.setQueue([track], 0);
}

async onToggleFavorite(track: Track): Promise<void> {
  await this.trackService.toggleFavorite(track.id);
}
```

---

## Component Lifecycle

Components have lifecycle events. The most common one:

**File:** `src/app/features/track/track-detail.component.ts`

```typescript
export class TrackDetailComponent implements OnInit {
  
  ngOnInit(): void {
    // Called once when component is created
    this.loadTrack();
  }

  async loadTrack(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    const track = await this.trackService.getById(id);
    this.track.set(track);
  }
}
```

**Common lifecycle hooks:**
| Hook | When it runs |
|------|--------------|
| `ngOnInit` | After component is initialized (use this for setup) |
| `ngOnDestroy` | Before component is destroyed (cleanup here) |
| `ngOnChanges` | When @Input values change |

---

## Real Example: How Components Communicate

Let's trace the flow when you click the heart button:

**Step 1:** User clicks heart in `TrackCardComponent`
```typescript
// track-card.component.ts
onToggleFavorite(event: Event): void {
  event.stopPropagation();
  this.toggleFavorite.emit();  // Fires event UP
}
```

**Step 2:** Parent `LibraryComponent` receives the event
```html
<!-- library.component.ts template -->
<app-track-card 
  [track]="track"
  (toggleFavorite)="onToggleFavorite(track)"
/>
```

**Step 3:** Parent calls the service
```typescript
// library.component.ts
async onToggleFavorite(track: Track): Promise<void> {
  await this.trackService.toggleFavorite(track.id);
}
```

**Step 4:** Service updates the data, Signal notifies everyone
```typescript
// track.service.ts
async toggleFavorite(id: string): Promise<boolean> {
  // Update storage
  await this.storageService.updateTrack(id, { isFavorite: newStatus });
  
  // Update signal - UI auto-updates!
  this._tracks.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, isFavorite: newStatus } : t)
  );
}
```

---

## Your Components Summary

| File | Purpose |
|------|---------|
| `src/app/app.ts` | Root shell, contains router-outlet |
| `src/app/features/library/library.component.ts` | Main library page |
| `src/app/features/library/components/track-card.component.ts` | Individual track card |
| `src/app/features/library/components/upload-modal.component.ts` | Upload popup |
| `src/app/features/track/track-detail.component.ts` | Track detail page |
| `src/app/features/track/components/track-form.component.ts` | Edit track form |
| `src/app/shared/components/player-bar/player-bar.component.ts` | Bottom player |
| `src/app/shared/components/notifications/notifications.component.ts` | Toast messages |

---

## Key Takeaways

1. **Component = Template + Class** - HTML and logic together
2. **@Input()** = data flows DOWN from parent to child
3. **@Output()** = events flow UP from child to parent
4. **standalone: true** = modern Angular, no NgModule needed
5. **imports array** = list what the component uses
6. **inject()** = get services in your component
