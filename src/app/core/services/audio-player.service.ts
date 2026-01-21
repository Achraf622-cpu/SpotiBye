/**
 * @fileoverview Audio Player Service - Core service for audio playback
 * @see SPOT-15 Implement Audio Player Service
 */
import { Injectable, signal, computed } from '@angular/core';
import { Track, PlayerState } from '../models/track.model';
import { TrackService } from './track.service';

/**
 * Repeat mode options
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * AudioPlayerService handles all audio playback functionality.
 * Uses HTMLAudioElement for audio playback and Signals for reactive state.
 */
@Injectable({
    providedIn: 'root'
})
export class AudioPlayerService {
    private audio: HTMLAudioElement | null = null;
    private audioUrl: string | null = null;
    private originalQueue: Track[] = [];

    // Private signals
    private readonly _currentTrack = signal<Track | null>(null);
    private readonly _playerState = signal<PlayerState>('stopped');
    private readonly _volume = signal(0.7);
    private readonly _progress = signal(0);
    private readonly _duration = signal(0);
    private readonly _isMuted = signal(false);
    private readonly _queue = signal<Track[]>([]);
    private readonly _queueIndex = signal(0);
    private readonly _shuffle = signal(false);
    private readonly _repeatMode = signal<RepeatMode>('off');

    // Public readonly signals
    readonly currentTrack = this._currentTrack.asReadonly();
    readonly playerState = this._playerState.asReadonly();
    readonly volume = this._volume.asReadonly();
    readonly progress = this._progress.asReadonly();
    readonly duration = this._duration.asReadonly();
    readonly isMuted = this._isMuted.asReadonly();
    readonly queue = this._queue.asReadonly();
    readonly queueIndex = this._queueIndex.asReadonly();
    readonly shuffle = this._shuffle.asReadonly();
    readonly repeatMode = this._repeatMode.asReadonly();

    // Computed signals
    readonly isPlaying = computed(() => this._playerState() === 'playing');
    readonly isPaused = computed(() => this._playerState() === 'paused');
    readonly isBuffering = computed(() => this._playerState() === 'buffering');
    readonly isStopped = computed(() => this._playerState() === 'stopped');
    readonly hasTrack = computed(() => this._currentTrack() !== null);
    readonly hasQueue = computed(() => this._queue().length > 0);
    readonly canPlayNext = computed(() => {
        const repeat = this._repeatMode();
        if (repeat === 'all' || repeat === 'one') return true;
        return this._queueIndex() < this._queue().length - 1;
    });
    readonly canPlayPrevious = computed(() => {
        const repeat = this._repeatMode();
        if (repeat === 'all' || repeat === 'one') return true;
        return this._queueIndex() > 0;
    });

    readonly progressPercent = computed(() => {
        const dur = this._duration();
        return dur > 0 ? (this._progress() / dur) * 100 : 0;
    });

    constructor(private trackService: TrackService) {
        this.initAudio();
    }

    /**
     * Initialize audio element
     */
    private initAudio(): void {
        this.audio = new Audio();
        this.audio.volume = this._volume();

        this.audio.addEventListener('timeupdate', () => {
            this._progress.set(this.audio?.currentTime || 0);
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this._duration.set(this.audio?.duration || 0);
            this._playerState.set('paused');
        });

        this.audio.addEventListener('playing', () => {
            this._playerState.set('playing');
        });

        this.audio.addEventListener('pause', () => {
            if (this._playerState() !== 'stopped') {
                this._playerState.set('paused');
            }
        });

        this.audio.addEventListener('waiting', () => {
            this._playerState.set('buffering');
        });

        this.audio.addEventListener('ended', () => {
            this.handleTrackEnded();
        });

        this.audio.addEventListener('error', () => {
            this._playerState.set('stopped');
            console.error('Audio playback error');
        });
    }

    /**
     * Load and optionally play a track
     */
    async loadTrack(track: Track, autoPlay = false): Promise<boolean> {
        if (!this.audio) return false;

        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }

        this._playerState.set('buffering');
        this._currentTrack.set(track);
        this._progress.set(0);
        this._duration.set(track.duration);

        try {
            const url = await this.trackService.getAudioUrl(track);
            if (!url) {
                this._playerState.set('stopped');
                return false;
            }

            this.audioUrl = url;
            this.audio.src = url;
            this.audio.load();

            if (autoPlay) {
                await this.audio.play();
            }

            return true;
        } catch (err) {
            console.error('Failed to load track:', err);
            this._playerState.set('stopped');
            return false;
        }
    }

    async play(): Promise<void> {
        if (!this.audio || !this._currentTrack()) return;
        try {
            await this.audio.play();
        } catch (err) {
            console.error('Failed to play:', err);
        }
    }

    pause(): void {
        if (!this.audio) return;
        this.audio.pause();
    }

    async togglePlay(): Promise<void> {
        if (this.isPlaying()) {
            this.pause();
        } else {
            await this.play();
        }
    }

    stop(): void {
        if (!this.audio) return;
        this.audio.pause();
        this.audio.currentTime = 0;
        this._playerState.set('stopped');
        this._progress.set(0);
    }

    seek(time: number): void {
        if (!this.audio) return;
        this.audio.currentTime = Math.max(0, Math.min(time, this._duration()));
        this._progress.set(time);
    }

    seekPercent(percent: number): void {
        const time = (percent / 100) * this._duration();
        this.seek(time);
    }

    setVolume(volume: number): void {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this._volume.set(clampedVolume);

        if (this.audio) {
            this.audio.volume = clampedVolume;
        }

        if (clampedVolume > 0 && this._isMuted()) {
            this._isMuted.set(false);
        }
    }

    toggleMute(): void {
        if (!this.audio) return;
        const muted = !this._isMuted();
        this._isMuted.set(muted);
        this.audio.muted = muted;
    }

    /**
     * Toggle shuffle mode
     */
    toggleShuffle(): void {
        const newShuffle = !this._shuffle();
        this._shuffle.set(newShuffle);

        if (newShuffle) {
            // Store original and shuffle the queue
            this.originalQueue = [...this._queue()];
            const currentTrack = this._currentTrack();
            const shuffled = this.shuffleArray([...this._queue()]);

            // Make sure current track stays at current position
            if (currentTrack) {
                const currentIndex = shuffled.findIndex(t => t.id === currentTrack.id);
                if (currentIndex > 0) {
                    [shuffled[0], shuffled[currentIndex]] = [shuffled[currentIndex], shuffled[0]];
                }
                this._queueIndex.set(0);
            }

            this._queue.set(shuffled);
        } else {
            // Restore original queue order
            const currentTrack = this._currentTrack();
            this._queue.set(this.originalQueue);

            if (currentTrack) {
                const newIndex = this.originalQueue.findIndex(t => t.id === currentTrack.id);
                this._queueIndex.set(newIndex >= 0 ? newIndex : 0);
            }
        }
    }

    /**
     * Cycle through repeat modes: off -> all -> one -> off
     */
    toggleRepeat(): void {
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const current = this._repeatMode();
        const currentIndex = modes.indexOf(current);
        const nextIndex = (currentIndex + 1) % modes.length;
        this._repeatMode.set(modes[nextIndex]);
    }

    /**
     * Set the playback queue
     */
    setQueue(tracks: Track[], startIndex = 0): void {
        this.originalQueue = [...tracks];

        if (this._shuffle()) {
            const shuffled = this.shuffleArray([...tracks]);
            const startTrack = tracks[startIndex];
            const shuffledIndex = shuffled.findIndex(t => t.id === startTrack.id);
            if (shuffledIndex > 0) {
                [shuffled[0], shuffled[shuffledIndex]] = [shuffled[shuffledIndex], shuffled[0]];
            }
            this._queue.set(shuffled);
            this._queueIndex.set(0);
            if (shuffled.length > 0) {
                this.loadTrack(shuffled[0], true);
            }
        } else {
            this._queue.set(tracks);
            this._queueIndex.set(startIndex);
            if (tracks.length > 0 && startIndex < tracks.length) {
                this.loadTrack(tracks[startIndex], true);
            }
        }
    }

    addToQueue(track: Track): void {
        this._queue.update(q => [...q, track]);
        this.originalQueue.push(track);
    }

    clearQueue(): void {
        this._queue.set([]);
        this._queueIndex.set(0);
        this.originalQueue = [];
    }

    /**
     * Play next track in queue
     */
    async next(): Promise<void> {
        const queue = this._queue();
        const currentIndex = this._queueIndex();
        const repeat = this._repeatMode();

        if (repeat === 'one') {
            // Restart current track
            this.seek(0);
            await this.play();
            return;
        }

        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            this._queueIndex.set(nextIndex);
            await this.loadTrack(queue[nextIndex], true);
        } else if (queue.length > 0 && repeat === 'all') {
            // Loop back to start
            this._queueIndex.set(0);
            await this.loadTrack(queue[0], true);
        }
    }

    /**
     * Play previous track in queue
     */
    async previous(): Promise<void> {
        const queue = this._queue();
        const currentIndex = this._queueIndex();
        const repeat = this._repeatMode();

        // If more than 3 seconds into track, restart it
        if (this._progress() > 3) {
            this.seek(0);
            return;
        }

        if (repeat === 'one') {
            this.seek(0);
            await this.play();
            return;
        }

        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            this._queueIndex.set(prevIndex);
            await this.loadTrack(queue[prevIndex], true);
        } else if (queue.length > 0 && repeat === 'all') {
            // Loop to end
            const lastIndex = queue.length - 1;
            this._queueIndex.set(lastIndex);
            await this.loadTrack(queue[lastIndex], true);
        }
    }

    /**
     * Handle track ended
     */
    private handleTrackEnded(): void {
        const queue = this._queue();
        const currentIndex = this._queueIndex();
        const repeat = this._repeatMode();

        if (repeat === 'one') {
            // Repeat the same track
            this.seek(0);
            this.play();
            return;
        }

        if (currentIndex < queue.length - 1) {
            // Play next track
            this.next();
        } else if (repeat === 'all' && queue.length > 0) {
            // Loop back to first track
            this._queueIndex.set(0);
            this.loadTrack(queue[0], true);
        } else {
            // End of queue, stop
            this._playerState.set('stopped');
            this._progress.set(0);
        }
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    destroy(): void {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
        }
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
        }
    }
}
