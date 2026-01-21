# SpotiBye - Angular Learning Documentation

This folder contains detailed documentation to help you understand Angular through your SpotiBye project.

---

## Reading Order

Start from the top and work your way down:

| # | File | Topic | What You'll Learn |
|---|------|-------|-------------------|
| 1 | [1-angular-concepts-in-spotibye.md](./1-angular-concepts-in-spotibye.md) | Overview | Quick reference of all concepts |
| 2 | [2-components.md](./2-components.md) | Components | Building blocks, @Input, @Output |
| 3 | [3-services.md](./3-services.md) | Services | Shared logic, dependency injection |
| 4 | [4-signals.md](./4-signals.md) | Signals | Reactive state management |
| 5 | [5-routing.md](./5-routing.md) | Routing | URL navigation, lazy loading |
| 6 | [6-data-binding.md](./6-data-binding.md) | Data Binding | {{ }}, [ ], ( ), [( )] |
| 7 | [7-control-flow.md](./7-control-flow.md) | Control Flow | @if, @for, @switch |
| 8 | [8-reactive-forms.md](./8-reactive-forms.md) | Forms | FormGroup, validation |
| 9 | [9-pipes.md](./9-pipes.md) | Pipes | Transform data for display |

---

## Your Project Files

### Core Files
| File | Purpose |
|------|---------|
| `src/app/app.ts` | Root component (shell) |
| `src/app/app.routes.ts` | Main routing config |
| `src/app/app.config.ts` | App-wide providers |

### Models
| File | Purpose |
|------|---------|
| `src/app/core/models/track.model.ts` | Track interface and types |

### Services
| File | Purpose |
|------|---------|
| `src/app/core/services/track.service.ts` | Track CRUD operations |
| `src/app/core/services/audio-player.service.ts` | Audio playback control |
| `src/app/core/services/storage.service.ts` | IndexedDB database |
| `src/app/core/services/notification.service.ts` | Toast messages |

### Feature Components
| File | Purpose |
|------|---------|
| `src/app/features/library/library.component.ts` | Library page |
| `src/app/features/library/components/track-card.component.ts` | Track card |
| `src/app/features/library/components/upload-modal.component.ts` | Upload form |
| `src/app/features/track/track-detail.component.ts` | Track detail page |
| `src/app/features/track/components/track-form.component.ts` | Edit form |

### Shared Components
| File | Purpose |
|------|---------|
| `src/app/shared/components/player-bar/player-bar.component.ts` | Bottom player |
| `src/app/shared/components/notifications/notifications.component.ts` | Toast UI |
| `src/app/shared/pipes/duration.pipe.ts` | Format seconds to mm:ss |

---

## Commands

```bash
# Run development server
npm start

# Build for production
npm run build

# Generate new component
ng generate component features/new-feature

# Generate new service
ng generate service core/services/new-service

# Generate new pipe
ng generate pipe shared/pipes/new-pipe
```

---

## Tips for Your Teacher

When explaining your project, focus on:

1. **Component architecture** - "The app is built from reusable components"
2. **Services for logic** - "TrackService handles all track operations"
3. **Signals for state** - "UI updates automatically when data changes"
4. **Lazy loading** - "Features load on-demand for better performance"
5. **Reactive forms** - "Forms have validation built in"

Good luck!
