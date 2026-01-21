# 9. Pipes - Transforming Data for Display

## What is a Pipe?

A pipe **transforms data before displaying it**. Instead of showing raw data, you transform it into a human-readable format.

**Example:**
```
Raw: 185 (seconds)
Piped: "3:05" (formatted duration)
```

---

## Using Built-in Pipes

Angular provides common pipes:

| Pipe | Purpose | Example |
|------|---------|---------|
| `uppercase` | Convert to uppercase | `"hello"` → `"HELLO"` |
| `lowercase` | Convert to lowercase | `"HELLO"` → `"hello"` |
| `titlecase` | Capitalize words | `"hello world"` → `"Hello World"` |
| `date` | Format dates | Date → `"Jan 8, 2026"` |
| `currency` | Format currency | `100` → `"$100.00"` |
| `percent` | Format percentage | `0.5` → `"50%"` |
| `json` | JSON stringify (debugging) | Object → JSON string |

**From your project:**

**File:** `src/app/features/library/library.component.ts`

```html
<!-- titlecase pipe capitalizes category names -->
<option [value]="category">{{ category | titlecase }}</option>

<!-- Without pipe: "rock" -->
<!-- With pipe: "Rock" -->
```

**File:** `src/app/features/library/components/upload-modal.component.ts`

```html
<select formControlName="category">
  @for (cat of categories; track cat) {
    <option [value]="cat">{{ cat | titlecase }}</option>
  }
</select>
```

---

## Your Custom Pipe: DurationPipe

**File:** `src/app/shared/pipes/duration.pipe.ts`

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',      // Name to use in templates
  standalone: true       // Modern Angular style
})
export class DurationPipe implements PipeTransform {
  transform(seconds: number | undefined): string {
    if (seconds === undefined || seconds === null) {
      return '0:00';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```

**Breaking it down:**

| Part | Purpose |
|------|---------|
| `@Pipe({ name: 'duration' })` | Register as pipe named "duration" |
| `standalone: true` | Modern Angular (no NgModule needed) |
| `implements PipeTransform` | Required interface |
| `transform(value)` | Receives input, returns transformed output |

---

## Using DurationPipe

**Step 1: Import the pipe**

```typescript
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  imports: [DurationPipe],
  // ...
})
```

**Step 2: Use in template**

**File:** `src/app/features/library/components/track-card.component.ts`

```html
<!-- Duration badge on track card -->
<div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
  {{ track.duration | duration }}
</div>

<!-- Input: 185 (seconds) -->
<!-- Output: "3:05" -->
```

**File:** `src/app/shared/components/player-bar/player-bar.component.ts`

```html
<!-- Progress time display -->
<div class="text-xs text-gray-400">
  <span>{{ playerService.progress() | duration }}</span>
  <span class="mx-1">/</span>
  <span>{{ playerService.duration() | duration }}</span>
</div>

<!-- Shows: "1:23 / 3:45" -->
```

**File:** `src/app/features/track/track-detail.component.ts`

```html
<!-- Duration in track metadata -->
<div class="bg-dark-800 rounded-lg p-3">
  <p class="text-xs text-gray-500 mb-1">Duration</p>
  <p class="text-white font-medium">{{ track()?.duration | duration }}</p>
</div>
```

---

## How the Transform Works

```typescript
transform(seconds: number | undefined): string {
  // Handle undefined/null
  if (seconds === undefined || seconds === null) {
    return '0:00';
  }
  
  // Calculate minutes: 185 / 60 = 3.08 → floor = 3
  const mins = Math.floor(seconds / 60);
  
  // Calculate remaining seconds: 185 % 60 = 5
  const secs = Math.floor(seconds % 60);
  
  // padStart(2, '0') ensures "5" becomes "05"
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

**Examples:**
| Input (seconds) | Output |
|-----------------|--------|
| `0` | `"0:00"` |
| `5` | `"0:05"` |
| `65` | `"1:05"` |
| `185` | `"3:05"` |
| `3600` | `"60:00"` |
| `undefined` | `"0:00"` |

---

## Chaining Pipes

You can apply multiple pipes:

```html
{{ track.title | uppercase | slice:0:10 }}
<!-- "My Long Song Title" → "MY LONG SO" -->
```

---

## Pipe with Parameters

Some pipes accept parameters after a colon `:`:

```html
<!-- Date pipe with format -->
{{ dateValue | date:'short' }}        <!-- "1/8/26, 3:00 PM" -->
{{ dateValue | date:'fullDate' }}     <!-- "Wednesday, January 8, 2026" -->
{{ dateValue | date:'yyyy-MM-dd' }}   <!-- "2026-01-08" -->

<!-- Currency with code -->
{{ price | currency:'EUR' }}  <!-- "€100.00" -->

<!-- Slice (start:end) -->
{{ text | slice:0:50 }}  <!-- First 50 characters -->
```

**From your code:**

```html
<p class="text-xs text-gray-500 mb-1">Added</p>
<p class="text-white font-medium">{{ formatDate(track()?.dateAdded) }}</p>
```

Note: Your project uses a method instead of pipe for dates, but you could use:
```html
{{ track()?.dateAdded | date:'longDate' }}
```

---

## Creating a New Pipe (Practice)

Let's say you want a pipe that shows "N/A" for empty strings:

**Step 1: Create the file** `src/app/shared/pipes/empty-placeholder.pipe.ts`

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyPlaceholder',
  standalone: true
})
export class EmptyPlaceholderPipe implements PipeTransform {
  transform(value: string | undefined | null, placeholder = 'N/A'): string {
    if (!value || value.trim() === '') {
      return placeholder;
    }
    return value;
  }
}
```

**Step 2: Use it**

```typescript
imports: [EmptyPlaceholderPipe]
```

```html
{{ track.description | emptyPlaceholder }}
<!-- Empty → "N/A" -->

{{ track.description | emptyPlaceholder:'No description' }}
<!-- Empty → "No description" -->
```

---

## Pure vs Impure Pipes

**Pure pipes (default):** Only recalculate when input changes.

```typescript
@Pipe({
  name: 'duration',
  standalone: true,
  pure: true  // Default, can omit
})
```

**Impure pipes:** Recalculate on every change detection cycle (expensive, avoid if possible).

```typescript
@Pipe({
  name: 'myPipe',
  standalone: true,
  pure: false  // Rechecks constantly
})
```

Your `DurationPipe` is **pure** (default) - it only recalculates when the seconds value changes.

---

## Where Pipes Are Used in Your Project

| File | Pipe | Usage |
|------|------|-------|
| `track-card.component.ts` | `DurationPipe` | Duration badge |
| `track-card.component.ts` | `RouterLink` (directive, not pipe) | Link to track |
| `player-bar.component.ts` | `DurationPipe` | Progress / duration time |
| `track-detail.component.ts` | `DurationPipe` | Track metadata |
| `library.component.ts` | `TitleCasePipe` | Category names in dropdown |
| `upload-modal.component.ts` | `TitleCasePipe` | Category select options |
| `track-form.component.ts` | `TitleCasePipe` | Category select options |

---

## Key Takeaways

1. **Pipes transform data** for display
2. **Syntax:** `{{ value | pipeName }}`
3. **With params:** `{{ value | pipeName:arg1:arg2 }}`
4. **Built-in pipes:** `uppercase`, `lowercase`, `titlecase`, `date`, `currency`, etc.
5. **Custom pipes:** Implement `PipeTransform` interface  
6. **Must import pipes** in component's `imports` array
7. **Pure pipes** only recalculate when input changes (default, efficient)
8. **Chain pipes:** `{{ value | pipe1 | pipe2 }}`
