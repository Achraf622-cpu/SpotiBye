# 5. Routing - URL Navigation in Angular

## What is Routing?

Routing connects **URLs to components**. When you type a URL or click a link:
- Angular reads the URL
- Finds the matching route
- Loads the corresponding component
- Displays it in `<router-outlet />`

**Your URLs:**
| URL | What Shows |
|-----|------------|
| `/` | Redirects to `/library` |
| `/library` | LibraryComponent |
| `/track/abc123` | TrackDetailComponent (for track with id "abc123") |

---

## How Routing is Configured

### Step 1: Define Routes

**File:** `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirect root to /library
  { 
    path: '',              // URL: http://localhost:4200/
    redirectTo: 'library', 
    pathMatch: 'full'      // Must match exactly ''
  },
  
  // Library routes (lazy loaded)
  {
    path: 'library',       // URL: http://localhost:4200/library
    loadChildren: () => import('./features/library/library.routes')
      .then(m => m.routes)
  },
  
  // Track routes (lazy loaded)
  {
    path: 'track',         // URL: http://localhost:4200/track/...
    loadChildren: () => import('./features/track/track.routes')
      .then(m => m.routes)
  },
  
  // Catch-all for unknown URLs
  { 
    path: '**',            // Any URL not matched above
    redirectTo: 'library'  // Go to library
  }
];
```

**Breaking it down:**

| Property | Meaning |
|----------|---------|
| `path` | The URL segment to match |
| `redirectTo` | Where to redirect |
| `pathMatch: 'full'` | Must match the entire path, not just start |
| `loadChildren` | Lazy load a feature module |
| `path: '**'` | Wildcard - matches anything |

### Step 2: Feature Routes

**File:** `src/app/features/library/library.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { LibraryComponent } from './library.component';

export const routes: Routes = [
  {
    path: '',           // URL: /library (parent path + this)
    component: LibraryComponent
  }
];
```

**File:** `src/app/features/track/track.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { TrackDetailComponent } from './track-detail.component';

export const routes: Routes = [
  {
    path: ':id',        // URL: /track/abc123 (:id becomes 'abc123')
    component: TrackDetailComponent
  }
];
```

### Step 3: Provide Router

**File:** `src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)  // Enable routing with our routes
  ]
};
```

### Step 4: Router Outlet

**File:** `src/app/app.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerBarComponent } from './shared/components/player-bar/player-bar.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PlayerBarComponent, NotificationsComponent],
  template: `
    <router-outlet />        <!-- Pages appear HERE -->
    <app-player-bar />       <!-- Always visible -->
    <app-notifications />    <!-- Always visible -->
  `
})
export class App {}
```

**Visual representation:**
```
┌──────────────────────────────────────┐
│  <router-outlet />                   │
│  ┌──────────────────────────────────┐│
│  │                                  ││
│  │   LibraryComponent               ││
│  │   or                             ││
│  │   TrackDetailComponent           ││
│  │                                  ││
│  └──────────────────────────────────┘│
│                                      │
│  <app-player-bar /> (always here)    │
│  <app-notifications /> (always here) │
└──────────────────────────────────────┘
```

---

## Route Parameters

A route parameter is a **dynamic part of the URL**.

**Definition:**
```typescript
// track.routes.ts
{ path: ':id', component: TrackDetailComponent }
```

**What it matches:**
| URL | `:id` value |
|-----|-------------|
| `/track/abc123` | `'abc123'` |
| `/track/xyz789` | `'xyz789'` |
| `/track/my-song` | `'my-song'` |

**Reading the parameter in the component:**

**File:** `src/app/features/track/track-detail.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export class TrackDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);   // Get route info
  private router = inject(Router);          // Navigate programmatically
  private trackService = inject(TrackService);

  track = signal<Track | null>(null);

  ngOnInit(): void {
    this.loadTrack();
  }

  async loadTrack(): Promise<void> {
    // Get :id from URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      // No ID in URL, nothing to load
      return;
    }

    // Fetch the track
    const track = await this.trackService.getById(id);
    this.track.set(track);
  }
}
```

---

## Navigation Methods

### 1. RouterLink (in templates)

Import RouterLink and use it as a directive:

```typescript
// In component
imports: [RouterLink]
```

**Simple link:**
```html
<a routerLink="/library">Go to Library</a>
```

**Dynamic link with parameter:**
```html
<a [routerLink]="['/track', track.id]">View Track</a>
<!-- Results in: /track/abc123 -->
```

**Example from your code:**

**File:** `src/app/features/library/components/track-card.component.ts`

```html
<a [routerLink]="['/track', track.id]"
   class="block hover:text-primary-400 transition-colors">
  <h3 class="font-semibold text-white truncate">{{ track.title }}</h3>
</a>
```

**File:** `src/app/features/track/track-detail.component.ts`

```html
<!-- Back button -->
<a routerLink="/library"
   class="p-2 text-gray-400 hover:text-white transition-colors">
  <svg><!-- arrow icon --></svg>
</a>

<!-- "Not found" state - go to library -->
<a routerLink="/library"
   class="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500">
  Go to Library
</a>
```

### 2. Router.navigate (in code)

For programmatic navigation (after an action):

```typescript
import { Router } from '@angular/router';

export class TrackDetailComponent {
  private router = inject(Router);

  async confirmDelete(): Promise<void> {
    const success = await this.trackService.delete(track.id);
    
    if (success) {
      // Navigate to library after deletion
      this.router.navigate(['/library']);
    }
  }
}
```

**Navigate with parameter:**
```typescript
// Go to /track/abc123
this.router.navigate(['/track', 'abc123']);

// Go to /track with the track's actual ID
this.router.navigate(['/track', this.track().id]);
```

---

## Lazy Loading

Lazy loading means **features load only when needed**.

Without lazy loading:
```
User visits /library
→ Angular loads EVERYTHING (library, track-detail, all services)
→ Slow initial load
```

With lazy loading:
```
User visits /library
→ Angular loads only library feature
→ Fast initial load

User clicks on a track (/track/123)
→ NOW Angular loads track feature
→ User doesn't notice because it's fast
```

**How it works in your code:**

**File:** `src/app/app.routes.ts`

```typescript
{
  path: 'library',
  loadChildren: () => import('./features/library/library.routes')
    .then(m => m.routes)
}
```

**What this does:**
1. When URL is `/library`
2. Angular dynamically imports `library.routes.ts`
3. That file and its dependencies are in a separate bundle
4. You can see this in the build output:

```
Initial chunk files | Names
main.js            | main          | 36 kB

Lazy chunk files   | Names
chunk-XXXX.js      | library-routes| 76 kB   ← Loaded only for /library
chunk-YYYY.js      | track-routes  | 50 kB   ← Loaded only for /track/:id
```

---

## Complete Route Flow Example

Let's trace what happens when you click on a track card:

**Step 1:** User clicks the track title

```html
<!-- track-card.component.ts -->
<a [routerLink]="['/track', track.id]">
  {{ track.title }}
</a>
<!-- If track.id is 'abc123', this creates link to /track/abc123 -->
```

**Step 2:** Angular matches the route

```typescript
// app.routes.ts
{ path: 'track', loadChildren: () => import('./features/track/track.routes') }

// track.routes.ts
{ path: ':id', component: TrackDetailComponent }

// Combined: /track/:id → TrackDetailComponent
```

**Step 3:** Angular lazy loads the track feature

```
Browser downloads chunk-YYYY.js (track-routes bundle)
```

**Step 4:** TrackDetailComponent is created

```typescript
// track-detail.component.ts
ngOnInit(): void {
  this.loadTrack();
}
```

**Step 5:** Component reads the URL parameter

```typescript
const id = this.route.snapshot.paramMap.get('id');
// id is 'abc123'
```

**Step 6:** Component fetches and displays the track

```typescript
const track = await this.trackService.getById('abc123');
this.track.set(track);
```

**Step 7:** UI renders

```html
<h1>{{ track()?.title }}</h1>  <!-- Shows the track title -->
```

---

## Route Configuration Summary

| File | Purpose |
|------|---------|
| `src/app/app.routes.ts` | Main routes: redirects, lazy loading |
| `src/app/app.config.ts` | Provides router to the app |
| `src/app/app.ts` | Contains `<router-outlet />` |
| `src/app/features/library/library.routes.ts` | Library feature routes |
| `src/app/features/track/track.routes.ts` | Track feature routes |

---

## Adding a New Route (If You Want to Practice)

Let's say you want to add a `/settings` page:

**Step 1:** Create the component

```bash
# In terminal
ng generate component features/settings/settings
```

Or manually create `src/app/features/settings/settings.component.ts`:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-white">Settings</h1>
      <p class="text-gray-400">Settings page coming soon...</p>
    </div>
  `
})
export class SettingsComponent {}
```

**Step 2:** Create routes file `src/app/features/settings/settings.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const routes: Routes = [
  { path: '', component: SettingsComponent }
];
```

**Step 3:** Add to main routes in `src/app/app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  {
    path: 'library',
    loadChildren: () => import('./features/library/library.routes')
      .then(m => m.routes)
  },
  {
    path: 'track',
    loadChildren: () => import('./features/track/track.routes')
      .then(m => m.routes)
  },
  // NEW ROUTE
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes')
      .then(m => m.routes)
  },
  { path: '**', redirectTo: 'library' }
];
```

**Step 4:** Add a link somewhere (like in library header):

```html
<a routerLink="/settings" class="text-gray-400 hover:text-white">
  Settings
</a>
```

Done! Now `/settings` shows your new component.

---

## Key Takeaways

1. **Routes connect URLs to components**
2. **`<router-outlet />`** is where page content appears
3. **`:id` in path** creates a parameter you can read
4. **`routerLink`** for template links, **`router.navigate`** for code
5. **`loadChildren`** enables lazy loading (faster initial load)
6. **Always import `RouterLink`** when using it in templates
7. **`ActivatedRoute`** to read URL parameters
8. **`Router`** to navigate programmatically
