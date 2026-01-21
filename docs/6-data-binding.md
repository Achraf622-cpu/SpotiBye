# 6. Data Binding - Connecting Data to the UI

## What is Data Binding?

Data binding is how Angular **connects your TypeScript data to your HTML template**. There are 4 types, each with its own syntax.

| Type | Syntax | Direction |
|------|--------|-----------|
| Interpolation | `{{ value }}` | Component → Template |
| Property Binding | `[property]="value"` | Component → Template |
| Event Binding | `(event)="handler()"` | Template → Component |
| Two-Way Binding | `[(ngModel)]="value"` | Both directions |

---

## 1. Interpolation `{{ }}`

Displays a value in the HTML.

**Syntax:** `{{ expression }}`

**Examples from your project:**

**File:** `src/app/features/library/library.component.ts`

```html
<!-- Simple value -->
<h1 class="text-2xl font-bold gradient-text">SpotiBye</h1>

<!-- Signal value (note the parentheses) -->
<p class="text-gray-400 text-sm">
  {{ filteredTracks().length }} track{{ filteredTracks().length !== 1 ? 's' : '' }}
</p>
```

**File:** `src/app/features/library/components/track-card.component.ts`

```html
<!-- Object property -->
<h3 class="font-semibold text-white truncate">{{ track.title }}</h3>
<p class="text-sm text-gray-400 truncate">{{ track.artist }}</p>
<span class="text-xs text-gray-500 capitalize">{{ track.category }}</span>
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<!-- Optional chaining (when value might be null) -->
<h4 class="text-sm font-medium text-white truncate">
  {{ playerService.currentTrack()?.title }}
</h4>
<p class="text-xs text-gray-400 truncate">
  {{ playerService.currentTrack()?.artist }}
</p>
```

**Using pipes in interpolation:**

```html
<!-- duration pipe transforms seconds to "3:45" format -->
{{ track.duration | duration }}

<!-- titlecase pipe capitalizes first letter -->
{{ category | titlecase }}

<!-- Both from player-bar.component.ts -->
{{ playerService.progress() | duration }} / {{ playerService.duration() | duration }}
```

**Ternary operator (if/else in one line):**

```html
<!-- Show 's' only if not exactly 1 track -->
{{ filteredTracks().length }} track{{ filteredTracks().length !== 1 ? 's' : '' }}
```

---

## 2. Property Binding `[ ]`

Sets an HTML attribute or component input to a value.

**Syntax:** `[attributeOrInput]="expression"`

**Why brackets?** Without brackets, Angular treats it as a string literal.

```html
<!-- WITHOUT brackets: src is literally the string "track.coverImage" -->
<img src="track.coverImage">

<!-- WITH brackets: src is the VALUE of track.coverImage variable -->
<img [src]="track.coverImage">
```

**Examples from your project:**

**File:** `src/app/features/library/components/track-card.component.ts`

```html
<!-- Binding to HTML attributes -->
<img 
  [src]="track.coverImage" 
  [alt]="track.title"
  class="w-full h-full object-cover"
/>

<!-- Binding to style property -->
<div [style.width.%]="playerService.progressPercent()"></div>
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<!-- Binding to input element value -->
<input 
  type="range" 
  [value]="playerService.volume()"
/>
```

**File:** `src/app/features/library/library.component.ts`

```html
<!-- Binding to select value -->
<select [value]="selectedCategory()">
  <option value="all">All Categories</option>
</select>

<!-- Binding to search input -->
<input 
  type="text" 
  [value]="searchQuery()"
  placeholder="Search tracks..."
/>
```

**Passing data to child components (Input binding):**

**File:** `src/app/features/library/library.component.ts`

```html
<app-track-card 
  [track]="track"
  [isPlaying]="playerService.currentTrack()?.id === track.id && playerService.isPlaying()"
/>
```

This passes:
- `track` → the track object
- `isPlaying` → a boolean expression result

**Dynamic CSS classes:**

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<button 
  [class]="playerService.shuffle() ? 'text-primary-400' : 'text-gray-400 hover:text-white'"
>
```

**File:** `src/app/features/track/track-detail.component.ts`

```html
<button 
  [class]="track()?.isFavorite ? 'text-accent-500' : 'text-gray-400 hover:text-accent-400'"
>
```

**Disabling elements:**

```html
<button 
  [disabled]="!playerService.hasQueue()"
  class="p-2 text-gray-400"
>
```

---

## 3. Event Binding `( )`

Calls a method when an event occurs.

**Syntax:** `(eventName)="handlerMethod($event)"`

**Common events:**
| Event | When it fires |
|-------|---------------|
| `(click)` | User clicks |
| `(input)` | User types in input |
| `(change)` | Value changes (select, checkbox) |
| `(submit)` | Form is submitted |
| `(keydown)` | Key is pressed |

**Examples from your project:**

**Click events:**

**File:** `src/app/features/library/library.component.ts`

```html
<!-- Simple click -->
<button (click)="showUploadModal.set(true)">
  Add Track
</button>

<!-- Click on card -->
<button (click)="onPlayTrack(track)">
  Play
</button>

<!-- Play all button -->
<button (click)="playAll()">
  Play All
</button>
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<!-- Calling service method directly -->
<button (click)="playerService.togglePlay()">
  Play/Pause
</button>

<button (click)="playerService.previous()">
  Previous
</button>

<button (click)="playerService.next()">
  Next
</button>

<button (click)="playerService.toggleShuffle()">
  Shuffle
</button>

<button (click)="playerService.toggleMute()">
  Mute
</button>
```

**Input events with $event:**

**File:** `src/app/features/library/library.component.ts`

```html
<input 
  type="text" 
  (input)="onSearchChange($event)"
/>
```

```typescript
// In the component class
onSearchChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.searchQuery.set(value);
}
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<input 
  type="range"
  (input)="onVolumeChange($event)"
/>
```

```typescript
onVolumeChange(event: Event): void {
  const value = parseFloat((event.target as HTMLInputElement).value);
  this.playerService.setVolume(value);
}
```

**Change events (for select):**

**File:** `src/app/features/library/library.component.ts`

```html
<select (change)="onCategoryChange($event)">
  <option value="all">All Categories</option>
  <!-- ... -->
</select>
```

```typescript
onCategoryChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  this.selectedCategory.set(value);
}
```

**Custom events with $event.stopPropagation():**

**File:** `src/app/features/library/components/track-card.component.ts`

```typescript
onPlay(event: Event): void {
  event.stopPropagation();  // Prevent click from bubbling to parent
  this.play.emit();         // Fire custom event
}

onToggleFavorite(event: Event): void {
  event.stopPropagation();
  this.toggleFavorite.emit();
}
```

**Click on progress bar:**

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<div 
  class="h-1 bg-gray-700 cursor-pointer"
  (click)="onProgressClick($event)"
>
```

```typescript
onProgressClick(event: MouseEvent): void {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = ((event.clientX - rect.left) / rect.width) * 100;
  this.playerService.seekPercent(percent);
}
```

**Prevent default and stop propagation:**

```html
<!-- Clicking backdrop closes modal -->
<div (click)="showDeleteConfirm.set(false)">
  <!-- Clicking modal content does NOT close it -->
  <div (click)="$event.stopPropagation()">
    Modal content here
  </div>
</div>
```

---

## 4. Two-Way Binding `[( )]`

Combines property binding and event binding. When the value changes in either direction, both stay in sync.

**Syntax:** `[(ngModel)]="value"`

**Important:** Requires importing `FormsModule`.

**Your project uses reactive forms instead**, which is the recommended approach for complex forms. But here's how two-way binding would work:

```typescript
// Component
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="username" />
    <p>Hello, {{ username }}</p>
  `
})
export class ExampleComponent {
  username = '';
}
```

Type in the input → `username` updates → `<p>` updates automatically.

---

## Combining Binding Types

Often you use multiple binding types together.

**File:** `src/app/features/library/library.component.ts`

```html
<input 
  type="text" 
  placeholder="Search tracks..."
  [value]="searchQuery()"           <!-- Property: set initial value -->
  (input)="onSearchChange($event)"  <!-- Event: handle changes -->
  class="w-full bg-dark-800"
/>
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<input 
  type="range" 
  min="0" 
  max="1" 
  step="0.01"
  [value]="playerService.volume()"     <!-- Display current volume -->
  (input)="onVolumeChange($event)"     <!-- Handle slider drag -->
/>
```

**File:** `src/app/features/library/library.component.ts`

```html
<app-track-card 
  [track]="track"                       <!-- Property: pass data in -->
  [isPlaying]="..."                     <!-- Property: pass data in -->
  (play)="onPlayTrack(track)"           <!-- Event: handle output -->
  (toggleFavorite)="onToggleFavorite(track)"  <!-- Event: handle output -->
/>
```

---

## Binding Summary Table

| What you want | Binding type | Example |
|---------------|--------------|---------|
| Display text | Interpolation | `{{ track.title }}` |
| Set attribute | Property | `[src]="imageUrl"` |
| Set style | Property | `[style.width.%]="50"` |
| Set class | Property | `[class]="isActive ? 'active' : ''"`  |
| Disable element | Property | `[disabled]="!isValid"` |
| Pass to child | Property | `[track]="track"` |
| Handle click | Event | `(click)="onClick()"` |
| Handle input | Event | `(input)="onInput($event)"` |
| Receive from child | Event | `(customEvent)="handler()"` |
| Two-way sync | Two-way | `[(ngModel)]="value"` |

---

## Key Takeaways

1. **`{{ }}`** = Display values (one-way, component → template)
2. **`[ ]`** = Set properties/attributes (one-way, component → template)
3. **`( )`** = Handle events (one-way, template → component)
4. **`[( )]`** = Two-way sync (both directions)
5. **`$event`** = Access the event object in handlers
6. **`$event.stopPropagation()`** = Prevent event bubbling
7. **Signals need `()`** = Write `signal()` not `signal` in templates
