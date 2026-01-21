# 7. Control Flow - Conditional and Loop Rendering

## What is Control Flow?

Control flow lets you **conditionally show content** and **loop over arrays** in your templates.

Angular 17+ uses a new syntax with `@if`, `@else`, and `@for` blocks.

---

## @if - Conditional Rendering

Show content only when a condition is true.

**Syntax:**
```html
@if (condition) {
  <!-- content shown when true -->
}
```

**Examples from your project:**

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<!-- Show player bar only when there's a track -->
@if (playerService.hasTrack()) {
  <div class="fixed bottom-0 left-0 right-0 glass">
    <!-- player content -->
  </div>
}
```

**File:** `src/app/features/library/components/track-card.component.ts`

```html
<!-- Show cover image if it exists -->
@if (track.coverImage) {
  <img [src]="track.coverImage" [alt]="track.title" />
} @else {
  <!-- Show placeholder icon if no cover -->
  <div class="w-full h-full flex items-center justify-center">
    <svg><!-- music icon --></svg>
  </div>
}
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<!-- Different icons based on state -->
@if (playerService.isPlaying()) {
  <svg><!-- pause icon --></svg>
} @else if (playerService.isBuffering()) {
  <svg class="animate-spin"><!-- loading spinner --></svg>
} @else {
  <svg><!-- play icon --></svg>
}
```

---

## @if with @else if and @else

Chain multiple conditions:

**File:** `src/app/features/library/library.component.ts`

```html
@if (trackService.isLoading()) {
  <!-- Loading State -->
  <div class="flex items-center justify-center py-20">
    <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    <p class="text-gray-400">Loading your library...</p>
  </div>
} @else if (filteredTracks().length === 0) {
  <!-- Empty State -->
  <div class="flex flex-col items-center justify-center py-20 text-center">
    @if (trackService.trackCount() === 0) {
      <!-- No tracks at all -->
      <h2>Your library is empty</h2>
      <button (click)="showUploadModal.set(true)">Add Your First Track</button>
    } @else if (selectedCategory() === 'favorites') {
      <!-- No favorites -->
      <h2>No favorites yet</h2>
      <p>Click the heart icon on tracks to add them to your favorites!</p>
    } @else {
      <!-- No search results -->
      <h2>No tracks found</h2>
      <p>Try adjusting your search or filter</p>
    }
  </div>
} @else {
  <!-- Track Grid (normal state) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    @for (track of filteredTracks(); track track.id) {
      <app-track-card [track]="track" />
    }
  </div>
}
```

---

## @for - Loop Rendering

Repeat content for each item in an array.

**Syntax:**
```html
@for (item of items; track item.id) {
  <!-- content for each item -->
}
```

**The `track` keyword is required** - it tells Angular how to identify items for efficient updates.

**Examples from your project:**

**File:** `src/app/features/library/library.component.ts`

```html
<!-- Track grid -->
@for (track of filteredTracks(); track track.id) {
  <app-track-card 
    [track]="track"
    [isPlaying]="playerService.currentTrack()?.id === track.id && playerService.isPlaying()"
    (play)="onPlayTrack(track)"
    (toggleFavorite)="onToggleFavorite(track)"
  />
}
```

**Category dropdown:**

```html
<select>
  <option value="all">All Categories</option>
  <option value="favorites">Favorites ({{ trackService.favoriteCount() }})</option>
  @for (category of categories; track category) {
    <option [value]="category">{{ category | titlecase }}</option>
  }
</select>
```

**File:** `src/app/shared/components/notifications/notifications.component.ts`

```html
@for (notification of notificationService.notifications(); track notification.id) {
  <div class="glass rounded-lg p-4">
    {{ notification.message }}
    <button (click)="notificationService.remove(notification.id)">Close</button>
  </div>
}
```

---

## @empty - When Array is Empty

Show fallback content when the loop has no items:

```html
@for (track of filteredTracks(); track track.id) {
  <app-track-card [track]="track" />
} @empty {
  <p>No tracks to display</p>
}
```

---

## track Expression

The `track` expression tells Angular how to identify each item.

**Best practice:** Use a unique identifier like `id`:

```html
@for (track of tracks; track track.id) { ... }
```

**For primitive arrays** (strings, numbers):

```html
@for (category of categories; track category) { ... }
```

**Why it matters:**
- When array changes, Angular reuses existing DOM elements
- Without proper tracking, Angular recreates everything (slow)
- With tracking, only changed items update (fast)

---

## Loop Variables

Access extra information about the loop:

```html
@for (track of tracks; track track.id; let i = $index; let first = $first; let last = $last) {
  <div [class.border-t]="!first">
    {{ i + 1 }}. {{ track.title }}
    @if (last) {
      <span>End of list</span>
    }
  </div>
}
```

| Variable | Type | Meaning |
|----------|------|---------|
| `$index` | number | Current index (0, 1, 2...) |
| `$first` | boolean | Is first item? |
| `$last` | boolean | Is last item? |
| `$even` | boolean | Is index even? |
| `$odd` | boolean | Is index odd? |
| `$count` | number | Total items |

---

## Nested @if and @for

You can nest them:

**File:** `src/app/features/library/library.component.ts`

```html
@if (trackService.isLoading()) {
  <div>Loading...</div>
} @else {
  @if (filteredTracks().length > 0) {
    <div class="grid">
      @for (track of filteredTracks(); track track.id) {
        <app-track-card [track]="track" />
      }
    </div>
  } @else {
    <div>No tracks</div>
  }
}
```

---

## Old Syntax (You Might See Online)

Before Angular 17, the syntax was different:

| Old Syntax | New Syntax |
|------------|------------|
| `*ngIf="condition"` | `@if (condition) { }` |
| `*ngFor="let item of items"` | `@for (item of items; track item.id) { }` |
| `[ngSwitch]` + `*ngSwitchCase` | `@switch (value) { @case (x) { } }` |

Your project uses the **new syntax** (Angular 17+).

---

## @switch - Multiple Cases

For multiple discrete values:

```html
@switch (playerService.repeatMode()) {
  @case ('off') {
    <span>Repeat Off</span>
  }
  @case ('all') {
    <span>Repeat All</span>
  }
  @case ('one') {
    <span>Repeat One</span>
  }
}
```

---

## Practical Examples

**File:** `src/app/features/track/track-detail.component.ts`

```html
@if (loading()) {
  <!-- Loading spinner -->
  <div class="flex items-center justify-center py-20">
    <div class="w-12 h-12 border-4 rounded-full animate-spin"></div>
  </div>
} @else if (!track()) {
  <!-- Track not found -->
  <div class="text-center">
    <h2>Track not found</h2>
    <a routerLink="/library">Go to Library</a>
  </div>
} @else if (isEditing()) {
  <!-- Edit form -->
  <app-track-form 
    [track]="track()!"
    (save)="onSave($event)"
    (cancel)="isEditing.set(false)"
  />
} @else {
  <!-- Track details -->
  <div>
    <h1>{{ track()?.title }}</h1>
    <p>{{ track()?.artist }}</p>
  </div>
}
```

**File:** `src/app/features/library/components/track-card.component.ts`

```html
<!-- Playing indicator -->
@if (isPlaying) {
  <div class="absolute bottom-2 right-2 flex items-center gap-1 bg-primary-500 rounded-full px-2 py-1">
    <div class="flex gap-0.5">
      <span class="w-1 h-3 bg-white rounded-full animate-pulse"></span>
      <span class="w-1 h-4 bg-white rounded-full animate-pulse"></span>
      <span class="w-1 h-2 bg-white rounded-full animate-pulse"></span>
    </div>
  </div>
}
```

---

## Key Takeaways

1. **`@if (condition) { }`** = Show when true
2. **`@else if (condition) { }`** = Chain conditions
3. **`@else { }`** = Fallback content
4. **`@for (item of items; track item.id) { }`** = Loop with tracking
5. **`@empty { }`** = Show when array is empty
6. **`track`** is required - use unique ID for best performance
7. **Loop variables**: `$index`, `$first`, `$last`, `$even`, `$odd`
