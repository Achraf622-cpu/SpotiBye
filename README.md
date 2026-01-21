# 🎵 SpotiBye

A modern music player web application built with **Angular 21** and **TailwindCSS**. SpotiBye allows users to manage and play their local music library directly in the browser using IndexedDB for offline storage.

---

## ✨ Features

- **🎧 Audio Playback** - Play, pause, seek, and control volume
- **📚 Music Library** - Upload, organize, and manage your tracks
- **❤️ Favorites** - Mark tracks as favorites for quick access
- **🔀 Shuffle & Repeat** - Multiple playback modes
- **🎨 Modern UI** - Glassmorphism design with smooth animations
- **💾 Offline Storage** - All tracks stored locally in IndexedDB
- **📱 Responsive Design** - Works on desktop and mobile

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Angular 21 | Frontend framework |
| TailwindCSS | Styling |
| TypeScript | Type-safe JavaScript |
| Signals | Reactive state management |
| IndexedDB | Client-side storage |
| Vitest | Unit testing |

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── models/          # Data models (Track)
│   └── services/        # Business logic
│       ├── track.service.ts
│       ├── audio-player.service.ts
│       ├── storage.service.ts
│       └── notification.service.ts
├── features/
│   ├── library/         # Library page & components
│   └── track/           # Track detail page
└── shared/
    ├── components/      # Reusable UI components
    └── pipes/           # Custom pipes (duration)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Achraf622-cpu/SpotiBye.git

# Navigate to project
cd SpotiBye

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 📖 Documentation

For detailed Angular concepts and code examples, see the [docs/](./docs/) folder:

- [Components](./docs/2-components.md)
- [Services](./docs/3-services.md)
- [Signals](./docs/4-signals.md)
- [Routing](./docs/5-routing.md)
- [Data Binding](./docs/6-data-binding.md)
- [Reactive Forms](./docs/8-reactive-forms.md)
- [Pipes](./docs/9-pipes.md)

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Build for production
npm run build
```




