
export type MusicCategory = 'pop' | 'rock' | 'rap' | 'jazz' | 'classical' | 'electronic' | 'rnb' | 'country' | 'other';

/**
 * All available music categories
 */
export const MUSIC_CATEGORIES: MusicCategory[] = [
  'pop', 'rock', 'rap', 'jazz', 'classical', 'electronic', 'rnb', 'country', 'other'
];

export type PlayerState = 'playing' | 'paused' | 'buffering' | 'stopped';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

