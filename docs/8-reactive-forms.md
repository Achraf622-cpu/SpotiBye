# 8. Reactive Forms - Form Handling with Validation

## What are Reactive Forms?

Reactive Forms let you:
- Build forms in TypeScript (not just HTML)
- Add validation rules
- Track form state (valid, touched, dirty)
- Handle errors

**Your project uses Reactive Forms in:**
- `src/app/features/library/components/upload-modal.component.ts`
- `src/app/features/track/components/track-form.component.ts`

---

## Creating a Form

**Step 1: Import ReactiveFormsModule**

```typescript
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  // ...
})
```

**Step 2: Define the form in your class**

**File:** `src/app/features/track/components/track-form.component.ts`

```typescript
export class TrackFormComponent implements OnInit {
  @Input({ required: true }) track!: Track;
  
  form!: FormGroup;

  ngOnInit(): void {
    // Create form with initial values from track
    this.form = new FormGroup({
      title: new FormControl(this.track.title, [
        Validators.required,
        Validators.maxLength(50)
      ]),
      artist: new FormControl(this.track.artist, [
        Validators.required
      ]),
      category: new FormControl(this.track.category, [
        Validators.required
      ]),
      description: new FormControl(this.track.description || '', [
        Validators.maxLength(200)
      ])
    });
  }
}
```

---

## FormControl

A `FormControl` represents a **single input field**.

```typescript
// With initial value
const title = new FormControl('My Song');

// With validators
const title = new FormControl('', [
  Validators.required,           // Field cannot be empty
  Validators.maxLength(50)       // Max 50 characters
]);

// Reading value
console.log(title.value);  // ''

// Setting value
title.setValue('New Title');
```

---

## FormGroup

A `FormGroup` groups multiple `FormControl`s together.

```typescript
const form = new FormGroup({
  title: new FormControl(''),
  artist: new FormControl(''),
  description: new FormControl('')
});

// Get single control
const titleControl = form.get('title');

// Get all values as object
const values = form.value;
// { title: '', artist: '', description: '' }

// Check validity
if (form.valid) {
  // All controls pass their validators
}
```

---

## Validators

Angular provides built-in validators:

| Validator | Usage |
|-----------|-------|
| `Validators.required` | Field must have value |
| `Validators.minLength(n)` | Minimum n characters |
| `Validators.maxLength(n)` | Maximum n characters |
| `Validators.min(n)` | Minimum number value |
| `Validators.max(n)` | Maximum number value |
| `Validators.email` | Valid email format |
| `Validators.pattern(regex)` | Match regex pattern |

**From your project:**

**File:** `src/app/features/library/components/upload-modal.component.ts`

```typescript
form = new FormGroup({
  title: new FormControl('', [
    Validators.required,
    Validators.maxLength(50)
  ]),
  artist: new FormControl('', [
    Validators.required
  ]),
  category: new FormControl<MusicCategory>('pop', [
    Validators.required
  ]),
  description: new FormControl('', [
    Validators.maxLength(200)
  ])
});
```

---

## Connecting Form to Template

**File:** `src/app/features/track/components/track-form.component.ts`

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- Title input -->
  <div>
    <label>Title</label>
    <input 
      type="text" 
      formControlName="title"
      class="w-full bg-dark-800 border rounded-lg px-4 py-2"
    />
    <!-- Error message -->
    @if (form.get('title')?.invalid && form.get('title')?.touched) {
      <p class="text-red-400 text-sm">
        @if (form.get('title')?.errors?.['required']) {
          Title is required
        } @else if (form.get('title')?.errors?.['maxlength']) {
          Title must be 50 characters or less
        }
      </p>
    }
  </div>

  <!-- Artist input -->
  <div>
    <label>Artist</label>
    <input 
      type="text" 
      formControlName="artist"
    />
    @if (form.get('artist')?.invalid && form.get('artist')?.touched) {
      <p class="text-red-400 text-sm">Artist is required</p>
    }
  </div>

  <!-- Category select -->
  <div>
    <label>Category</label>
    <select formControlName="category">
      @for (cat of categories; track cat) {
        <option [value]="cat">{{ cat | titlecase }}</option>
      }
    </select>
  </div>

  <!-- Description textarea -->
  <div>
    <label>Description (optional)</label>
    <textarea 
      formControlName="description"
      rows="3"
    ></textarea>
    @if (form.get('description')?.errors?.['maxlength']) {
      <p class="text-red-400 text-sm">Description must be 200 characters or less</p>
    }
  </div>

  <!-- Submit button -->
  <button 
    type="submit"
    [disabled]="form.invalid"
    class="bg-primary-500 px-4 py-2 rounded-lg"
  >
    Save
  </button>
</form>
```

---

## Key Template Bindings

| Binding | Purpose |
|---------|---------|
| `[formGroup]="form"` | Connect form to template |
| `formControlName="title"` | Connect input to FormControl |
| `(ngSubmit)="onSubmit()"` | Handle form submission |
| `[disabled]="form.invalid"` | Disable button when invalid |

---

## Checking Form State

**Control states:**
```typescript
const control = this.form.get('title');

control.valid      // Passes all validators
control.invalid    // Fails any validator
control.touched    // User focused and blurred
control.untouched  // User hasn't focused yet
control.dirty      // User changed the value
control.pristine   // User hasn't changed value
```

**Checking for specific errors:**
```typescript
control.errors?.['required']    // true if required validator failed
control.errors?.['maxlength']   // { requiredLength: 50, actualLength: 55 }
control.errors?.['minlength']   // { requiredLength: 5, actualLength: 3 }
```

---

## Handling Submit

**File:** `src/app/features/track/components/track-form.component.ts`

```typescript
export class TrackFormComponent {
  @Output() save = new EventEmitter<UpdateTrackDto>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    if (this.form.invalid) return;

    // Emit the form values to parent
    this.save.emit({
      title: this.form.value.title,
      artist: this.form.value.artist,
      category: this.form.value.category,
      description: this.form.value.description
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
```

---

## Upload Form with File Input

**File:** `src/app/features/library/components/upload-modal.component.ts`

```typescript
export class UploadModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() trackAdded = new EventEmitter<void>();

  private trackService = inject(TrackService);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    artist: new FormControl('', [Validators.required]),
    category: new FormControl<MusicCategory>('pop', [Validators.required]),
    description: new FormControl('', [Validators.maxLength(200)])
  });

  selectedFile: File | null = null;
  fileError = '';

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate file
    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      this.fileError = 'Only MP3, WAV, and OGG formats are supported';
      this.selectedFile = null;
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.fileError = 'File must be 10MB or smaller';
      this.selectedFile = null;
      return;
    }

    this.fileError = '';
    this.selectedFile = file;

    // Auto-fill title from filename
    if (!this.form.value.title) {
      const name = file.name.replace(/\.[^/.]+$/, '');  // Remove extension
      this.form.patchValue({ title: name });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedFile) return;

    const track = await this.trackService.create({
      title: this.form.value.title!,
      artist: this.form.value.artist!,
      category: this.form.value.category!,
      description: this.form.value.description || undefined,
      audioFile: this.selectedFile
    });

    if (track) {
      this.trackAdded.emit();
    }
  }
}
```

**Template for file input:**
```html
<div>
  <label>Audio File</label>
  <input 
    type="file" 
    accept=".mp3,.wav,.ogg"
    (change)="onFileSelect($event)"
  />
  @if (fileError) {
    <p class="text-red-400 text-sm">{{ fileError }}</p>
  }
  @if (selectedFile) {
    <p class="text-green-400 text-sm">{{ selectedFile.name }}</p>
  }
</div>
```

---

## Form Methods

| Method | Purpose |
|--------|---------|
| `form.value` | Get all values as object |
| `form.valid` | Check if form is valid |
| `form.invalid` | Check if form is invalid |
| `form.get('field')` | Get specific control |
| `form.setValue({...})` | Set all values (all required) |
| `form.patchValue({...})` | Set some values |
| `form.reset()` | Reset to initial values |
| `control.setValue(x)` | Set single control value |

---

## Complete Form Example

Here's the full `TrackFormComponent`:

**File:** `src/app/features/track/components/track-form.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Track, UpdateTrackDto, MUSIC_CATEGORIES } from '../../../core/models/track.model';

@Component({
  selector: 'app-track-form',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  template: `
    <div class="glass rounded-2xl p-6 max-w-md mx-auto">
      <h2 class="text-xl font-semibold text-white mb-6">Edit Track</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm text-gray-400 mb-1">Title</label>
            <input 
              type="text" 
              formControlName="title"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <!-- Artist -->
          <div>
            <label class="block text-sm text-gray-400 mb-1">Artist</label>
            <input 
              type="text" 
              formControlName="artist"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm text-gray-400 mb-1">Category</label>
            <select 
              formControlName="category"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat | titlecase }}</option>
              }
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm text-gray-400 mb-1">Description</label>
            <textarea 
              formControlName="description"
              rows="3"
              class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            ></textarea>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 mt-6">
          <button 
            type="button"
            (click)="onCancel()"
            class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button 
            type="submit"
            [disabled]="form.invalid"
            class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  `
})
export class TrackFormComponent implements OnInit {
  @Input({ required: true }) track!: Track;
  @Output() save = new EventEmitter<UpdateTrackDto>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  categories = MUSIC_CATEGORIES;

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(this.track.title, [
        Validators.required,
        Validators.maxLength(50)
      ]),
      artist: new FormControl(this.track.artist, [
        Validators.required
      ]),
      category: new FormControl(this.track.category, [
        Validators.required
      ]),
      description: new FormControl(this.track.description || '', [
        Validators.maxLength(200)
      ])
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.value as UpdateTrackDto);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
```

---

## Key Takeaways

1. **`FormGroup`** = Container for multiple controls
2. **`FormControl`** = Single input with validators
3. **`Validators`** = Built-in validation rules
4. **`formControlName`** = Connects input to control
5. **`[formGroup]`** = Binds form to template
6. **`form.valid`** / **`form.invalid`** = Check validity
7. **`control.errors`** = Get validation errors
8. **`control.touched`** = Has user interacted?
