# SpotiBye - Angular Concepts You Need to Know

This document explains the Angular concepts used in YOUR project so you can understand and explain what you "built."

---

## 1. Project Structure

```
src/app/
├── core/           → Services and models (business logic)
│   ├── models/     → TypeScript interfaces (data shapes)
│   └── services/   → Injectable services (shared logic)
├── features/       → Feature modules (pages)
│   ├── library/    → Library page + its components
│   └── track/      → Track detail page + its components
├── shared/         → Reusable stuff across features
│   ├── components/ → Reusable UI components
│   └── pipes/      → Data transformers
├── app.ts          → Root component (shell of the app)
├── app.routes.ts   → URL routing configuration
└── app.config.ts   → App-wide configuration
```

---

## 2. Components

A component = a reusable piece of UI with its own logic.

**Example from your project:** `track-card.component.ts`

```typescript
@Component({
  selector: 'app-track-card',     // HTML tag name: <app-track-card>
  standalone: true,                // Modern Angular - no NgModule needed
  imports: [...],                  // Other components/pipes it uses
  template: `...`                  // The HTML (can be inline or separate file)
})
export class TrackCardComponent {
  @Input() track!: Track;          // Data passed IN from parent
  @Output() play = new EventEmitter();  // Events sent OUT to parent
}
```

**How it's used:**
```html
<app-track-card 
  [track]="myTrack"           <!-- Passing data IN (property binding) -->
  (play)="onPlay()"           <!-- Listening for events OUT -->
/>
```

---

## 3. Services

A service = shared logic that multiple components can use.

**Example from your project:** `AudioPlayerService`

```typescript
@Injectable({
  providedIn: 'root'    // Available everywhere in the app
})
export class AudioPlayerService {
  // Methods any component can call
  play(): void { ... }
  pause(): void { ... }
}
```

**Using a service in a component:**
```typescript
export class PlayerBarComponent {
  playerService = inject(AudioPlayerService);  // Get the service
  
  onPlayClick() {
    this.playerService.play();  // Use it
  }
}
```

---

## 4. Signals (Modern Angular State)

Signals = reactive variables that auto-update the UI when they change.

**From your project:**
```typescript
// Creating a signal
searchQuery = signal('');

// Reading it (note the parentheses)
console.log(this.searchQuery());  // ''

// Updating it
this.searchQuery.set('hello');

// In the template - Angular auto-updates when it changes
<input [value]="searchQuery()" />
```

**Computed signals** = derived values that auto-recalculate:
```typescript
trackCount = computed(() => this.tracks().length);
```

---

## 5. Routing

Routes define which component shows for which URL.

**From your project:** `app.routes.ts`
```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  { 
    path: 'library', 
    loadChildren: () => import('./features/library/library.routes')
  },
  { 
    path: 'track/:id',   // :id is a parameter
    loadChildren: () => import('./features/track/track.routes')
  }
];
```

**In templates:**
```html
<a routerLink="/library">Go to Library</a>
<a [routerLink]="['/track', track.id]">View Track</a>
```

---

## 6. Data Binding (4 types)

```html
<!-- 1. Interpolation: display data -->
{{ track.title }}

<!-- 2. Property binding: pass data to element/component -->
[value]="searchQuery()"
[track]="track"

<!-- 3. Event binding: react to events -->
(click)="onPlay()"
(input)="onSearchChange($event)"

<!-- 4. Two-way binding: both at once (forms) -->
[(ngModel)]="username"
```

---

## 7. Control Flow (Angular 17+)

Your project uses the new syntax:

```html
<!-- If/else -->
@if (isLoading()) {
  <div>Loading...</div>
} @else {
  <div>Content here</div>
}

<!-- For loop -->
@for (track of tracks(); track track.id) {
  <app-track-card [track]="track" />
}
```

---

## 8. Pipes

Transform data for display. Example: `duration.pipe.ts`

```typescript
@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  transform(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```

**Usage:**
```html
{{ track.duration | duration }}  <!-- 180 becomes "3:00" -->
```

---

## 9. Reactive Forms

For form handling with validation.

**From your project:**
```typescript
// Create form with validators
form = new FormGroup({
  title: new FormControl('', [
    Validators.required,
    Validators.maxLength(50)
  ]),
  artist: new FormControl('', Validators.required)
});

// Check validity
if (this.form.valid) {
  const data = this.form.value;
}
```

**In template:**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="title" />
  @if (form.get('title')?.errors?.['required']) {
    <span>Title is required</span>
  }
</form>
```

---

## 10. Lazy Loading

Features load only when needed (faster initial load).

```typescript
// In app.routes.ts
{
  path: 'library',
  loadChildren: () => import('./features/library/library.routes')
    .then(m => m.routes)
}
```

The library code is in a separate JS file that downloads only when you visit `/library`.

---

## Quick Reference: Files You Might Be Asked About

| File | Purpose |
|------|---------|
| `app.ts` | Root component, contains router-outlet and player bar |
| `app.routes.ts` | Maps URLs to features |
| `track.model.ts` | Defines what a Track looks like |
| `storage.service.ts` | Saves/loads from IndexedDB |
| `track.service.ts` | CRUD operations for tracks |
| `audio-player.service.ts` | Controls audio playback |
| `library.component.ts` | Main library page |
| `player-bar.component.ts` | Bottom music player |

---

## Common Commands

```bash
npm start          # Run dev server (localhost:4200)
npm run build      # Build for production
ng generate component features/new-feature  # Create new component
```
