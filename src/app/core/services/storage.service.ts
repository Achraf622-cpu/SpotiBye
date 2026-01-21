import { Injectable, signal, computed } from '@angular/core';
import { Track, AudioFile } from '../models/track.model';

const DB_NAME = 'SpotiBye';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const AUDIO_STORE = 'audioFiles';

/**
 * StorageService handles all IndexedDB operations for tracks and audio files.
 * Uses IndexedDB for persistent client-side storage of audio files up to 10MB.
 * @see SPOT-26 Responsive Design Implementation
 */
@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private db: IDBDatabase | null = null;
    private readonly _isInitialized = signal(false);
    private readonly _error = signal<string | null>(null);

    readonly isInitialized = this._isInitialized.asReadonly();
    readonly error = this._error.asReadonly();

    constructor() {
        this.initDatabase();
    }

    /**
     * Initialize IndexedDB database
     */
    private initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                const error = 'Failed to open database';
                this._error.set(error);
                reject(new Error(error));
            };

            request.onsuccess = () => {
                this.db = request.result;
                this._isInitialized.set(true);
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create tracks store
                if (!db.objectStoreNames.contains(TRACKS_STORE)) {
                    const tracksStore = db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
                    tracksStore.createIndex('dateAdded', 'dateAdded', { unique: false });
                    tracksStore.createIndex('category', 'category', { unique: false });
                    tracksStore.createIndex('artist', 'artist', { unique: false });
                }

                // Create audio files store
                if (!db.objectStoreNames.contains(AUDIO_STORE)) {
                    db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Ensure database is ready before operations
     */
    private async ensureDb(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        await this.initDatabase();
        if (!this.db) throw new Error('Database not initialized');
        return this.db;
    }

    // ============ TRACK METADATA OPERATIONS ============

    /**
     * Save track metadata to IndexedDB
     */
    async saveTrack(track: Track): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([TRACKS_STORE], 'readwrite');
            const store = transaction.objectStore(TRACKS_STORE);
            const request = store.put({
                ...track,
                dateAdded: track.dateAdded.toISOString()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save track'));
        });
    }

    /**
     * Get all tracks from IndexedDB
     */
    async getAllTracks(): Promise<Track[]> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([TRACKS_STORE], 'readonly');
            const store = transaction.objectStore(TRACKS_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                const tracks = request.result.map((t: any) => ({
                    ...t,
                    dateAdded: new Date(t.dateAdded)
                }));
                resolve(tracks);
            };
            request.onerror = () => reject(new Error('Failed to get tracks'));
        });
    }

    /**
     * Get a single track by ID
     */
    async getTrackById(id: string): Promise<Track | null> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([TRACKS_STORE], 'readonly');
            const store = transaction.objectStore(TRACKS_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    resolve({
                        ...request.result,
                        dateAdded: new Date(request.result.dateAdded)
                    });
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(new Error('Failed to get track'));
        });
    }

    /**
     * Update a track's metadata
     */
    async updateTrack(id: string, updates: Partial<Track>): Promise<void> {
        const existing = await this.getTrackById(id);
        if (!existing) throw new Error('Track not found');

        const updated: Track = { ...existing, ...updates };
        await this.saveTrack(updated);
    }

    /**
     * Delete a track and its audio file
     */
    async deleteTrack(id: string): Promise<void> {
        const track = await this.getTrackById(id);
        if (!track) return;

        const db = await this.ensureDb();

        // Delete track metadata
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([TRACKS_STORE], 'readwrite');
            const store = transaction.objectStore(TRACKS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete track'));
        });

        // Delete associated audio file
        await this.deleteAudioFile(track.audioFileId);
    }

    // ============ AUDIO FILE OPERATIONS ============

    /**
     * Save an audio file blob to IndexedDB
     */
    async saveAudioFile(audioFile: AudioFile): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([AUDIO_STORE], 'readwrite');
            const store = transaction.objectStore(AUDIO_STORE);
            const request = store.put(audioFile);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save audio file'));
        });
    }

    /**
     * Get an audio file by ID
     */
    async getAudioFile(id: string): Promise<AudioFile | null> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([AUDIO_STORE], 'readonly');
            const store = transaction.objectStore(AUDIO_STORE);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(new Error('Failed to get audio file'));
        });
    }

    /**
     * Delete an audio file by ID
     */
    async deleteAudioFile(id: string): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([AUDIO_STORE], 'readwrite');
            const store = transaction.objectStore(AUDIO_STORE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete audio file'));
        });
    }

    /**
     * Get audio file as Object URL for playback
     */
    async getAudioUrl(id: string): Promise<string | null> {
        const audioFile = await this.getAudioFile(id);
        if (!audioFile) return null;
        return URL.createObjectURL(audioFile.blob);
    }

    /**
     * Clear all data from IndexedDB
     */
    async clearAll(): Promise<void> {
        const db = await this.ensureDb();

        await Promise.all([
            new Promise<void>((resolve, reject) => {
                const transaction = db.transaction([TRACKS_STORE], 'readwrite');
                const store = transaction.objectStore(TRACKS_STORE);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error('Failed to clear tracks'));
            }),
            new Promise<void>((resolve, reject) => {
                const transaction = db.transaction([AUDIO_STORE], 'readwrite');
                const store = transaction.objectStore(AUDIO_STORE);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error('Failed to clear audio files'));
            })
        ]);
    }
}
