/**
 * @fileoverview Track Service - Core service for music track management
 * @see SPOT-14 Implement Track Service
 */
import { Injectable, signal, computed } from '@angular/core';
import {
    Track,
    CreateTrackDto,
    UpdateTrackDto,
    LoadingState,
    SUPPORTED_AUDIO_FORMATS,
    MAX_FILE_SIZE,
    VALIDATION,
    AudioFile
} from '../models/track.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class TrackService {
    // Private signals for state
    private readonly _tracks = signal<Track[]>([]);
    private readonly _loadingState = signal<LoadingState>('idle');
    private readonly _error = signal<string | null>(null);
    private readonly _selectedTrack = signal<Track | null>(null);

    // Public readonly signals
    readonly tracks = this._tracks.asReadonly();
    readonly loadingState = this._loadingState.asReadonly();
    readonly error = this._error.asReadonly();
    readonly selectedTrack = this._selectedTrack.asReadonly();

    // Computed signals
    readonly isLoading = computed(() => this._loadingState() === 'loading');
    readonly hasError = computed(() => this._loadingState() === 'error');
    readonly trackCount = computed(() => this._tracks().length);
    readonly favoriteCount = computed(() => this._tracks().filter(t => t.isFavorite).length);
    readonly favoriteTracks = computed(() => this._tracks().filter(t => t.isFavorite));

    constructor(
        private storageService: StorageService,
        private notificationService: NotificationService
    ) {
        this.loadTracks();
    }

    /**
     * Load all tracks from storage
     */
    async loadTracks(): Promise<void> {
        this._loadingState.set('loading');
        this._error.set(null);

        try {
            const tracks = await this.storageService.getAllTracks();
            this._tracks.set(tracks.sort((a, b) =>
                new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
            ));
            this._loadingState.set('success');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load tracks';
            this._error.set(message);
            this._loadingState.set('error');
            this.notificationService.error(message);
        }
    }

    /**
     * Get a track by ID
     */
    async getById(id: string): Promise<Track | null> {
        // First check local cache
        const cached = this._tracks().find(t => t.id === id);
        if (cached) {
            this._selectedTrack.set(cached);
            return cached;
        }

        // Otherwise load from storage
        try {
            const track = await this.storageService.getTrackById(id);
            if (track) {
                this._selectedTrack.set(track);
            }
            return track;
        } catch (err) {
            this.notificationService.error('Failed to load track');
            return null;
        }
    }

    /**
     * Create a new track
     */
    async create(dto: CreateTrackDto): Promise<Track | null> {
        // Validate inputs
        const validationError = this.validateTrackInput(dto);
        if (validationError) {
            this.notificationService.error(validationError);
            return null;
        }

        this._loadingState.set('loading');

        try {
            // Generate unique IDs
            const trackId = this.generateId();
            const audioFileId = this.generateId();

            // Calculate audio duration
            const duration = await this.calculateDuration(dto.audioFile);

            // Save audio file
            const audioFile: AudioFile = {
                id: audioFileId,
                blob: dto.audioFile,
                mimeType: dto.audioFile.type,
                size: dto.audioFile.size
            };
            await this.storageService.saveAudioFile(audioFile);

            const track: Track = {
                id: trackId,
                title: dto.title.trim(),
                artist: dto.artist.trim(),
                description: dto.description?.trim(),
                category: dto.category,
                duration,
                dateAdded: new Date(),
                audioFileId,
                coverImage: dto.coverImage,
                isFavorite: false
            };

            // Save track metadata
            await this.storageService.saveTrack(track);

            // Update local state
            this._tracks.update(tracks => [track, ...tracks]);
            this._loadingState.set('success');
            this.notificationService.success(`"${track.title}" added to library`);

            return track;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create track';
            this._error.set(message);
            this._loadingState.set('error');
            this.notificationService.error(message);
            return null;
        }
    }

    /**
     * Update an existing track
     */
    async update(id: string, dto: UpdateTrackDto): Promise<Track | null> {
        // Validate title if provided
        if (dto.title && dto.title.length > VALIDATION.TITLE_MAX_LENGTH) {
            this.notificationService.error(`Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`);
            return null;
        }

        // Validate description if provided
        if (dto.description && dto.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
            this.notificationService.error(`Description must be ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`);
            return null;
        }

        this._loadingState.set('loading');

        try {
            await this.storageService.updateTrack(id, dto);

            // Update local state
            this._tracks.update(tracks =>
                tracks.map(t => t.id === id ? { ...t, ...dto } : t)
            );

            // Update selected track if it matches
            const selected = this._selectedTrack();
            if (selected?.id === id) {
                this._selectedTrack.set({ ...selected, ...dto });
            }

            this._loadingState.set('success');
            this.notificationService.success('Track updated successfully');

            return this._tracks().find(t => t.id === id) || null;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update track';
            this._error.set(message);
            this._loadingState.set('error');
            this.notificationService.error(message);
            return null;
        }
    }

    /**
     * Delete a track
     */
    async delete(id: string): Promise<boolean> {
        const track = this._tracks().find(t => t.id === id);
        if (!track) return false;

        this._loadingState.set('loading');

        try {
            await this.storageService.deleteTrack(id);

            // Update local state
            this._tracks.update(tracks => tracks.filter(t => t.id !== id));

            // Clear selected if deleted
            if (this._selectedTrack()?.id === id) {
                this._selectedTrack.set(null);
            }

            this._loadingState.set('success');
            this.notificationService.success(`"${track.title}" removed from library`);

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete track';
            this._error.set(message);
            this._loadingState.set('error');
            this.notificationService.error(message);
            return false;
        }
    }

    /**
     * Get audio URL for a track
     */
    async getAudioUrl(track: Track): Promise<string | null> {
        return this.storageService.getAudioUrl(track.audioFileId);
    }

    /**
     * Select a track
     */
    selectTrack(track: Track | null): void {
        this._selectedTrack.set(track);
    }

    /**
     * Search tracks by title or artist
     */
    searchTracks(query: string): Track[] {
        if (!query.trim()) return this._tracks();

        const lowerQuery = query.toLowerCase();
        return this._tracks().filter(track =>
            track.title.toLowerCase().includes(lowerQuery) ||
            track.artist.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Filter tracks by category
     */
    filterByCategory(category: string): Track[] {
        if (!category || category === 'all') return this._tracks();
        return this._tracks().filter(track => track.category === category);
    }

    /**
     * Toggle favorite status for a track
     */
    async toggleFavorite(id: string): Promise<boolean> {
        const track = this._tracks().find(t => t.id === id);
        if (!track) return false;

        const newFavoriteStatus = !track.isFavorite;

        try {
            await this.storageService.updateTrack(id, { isFavorite: newFavoriteStatus });

            // Update local state
            this._tracks.update(tracks =>
                tracks.map(t => t.id === id ? { ...t, isFavorite: newFavoriteStatus } : t)
            );

            // Update selected track if it matches
            const selected = this._selectedTrack();
            if (selected?.id === id) {
                this._selectedTrack.set({ ...selected, isFavorite: newFavoriteStatus });
            }

            // Show feedback
            if (newFavoriteStatus) {
                this.notificationService.success(`Added "${track.title}" to favorites`);
            } else {
                this.notificationService.info(`Removed "${track.title}" from favorites`);
            }

            return true;
        } catch (err) {
            this.notificationService.error('Failed to update favorite status');
            return false;
        }
    }

    // ============ PRIVATE METHODS ============

    /**
     * Validate track input data
     */
    private validateTrackInput(dto: CreateTrackDto): string | null {
        // Title validation
        if (!dto.title?.trim()) {
            return 'Title is required';
        }
        if (dto.title.length > VALIDATION.TITLE_MAX_LENGTH) {
            return `Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`;
        }

        // Artist validation
        if (!dto.artist?.trim()) {
            return 'Artist is required';
        }

        // Description validation
        if (dto.description && dto.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
            return `Description must be ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`;
        }

        // Audio file validation
        if (!dto.audioFile) {
            return 'Audio file is required';
        }
        if (dto.audioFile.size > MAX_FILE_SIZE) {
            return 'File size must be 10MB or less';
        }
        if (!SUPPORTED_AUDIO_FORMATS.includes(dto.audioFile.type)) {
            return 'Only MP3, WAV, and OGG formats are supported';
        }

        return null;
    }

    /**
     * Calculate audio file duration using Web Audio API
     */
    private calculateDuration(file: File): Promise<number> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'metadata';

            audio.onloadedmetadata = () => {
                URL.revokeObjectURL(audio.src);
                resolve(Math.floor(audio.duration));
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audio.src);
                reject(new Error('Failed to read audio file'));
            };

            audio.src = URL.createObjectURL(file);
        });
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
