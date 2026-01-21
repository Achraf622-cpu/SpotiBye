import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration: number;
}

/**
 * NotificationService provides toast notifications for user feedback.
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly _notifications = signal<Notification[]>([]);
    readonly notifications = this._notifications.asReadonly();

    private defaultDuration = 4000;

    /**
     * Show a success notification
     */
    success(message: string, duration = this.defaultDuration): void {
        this.show('success', message, duration);
    }

    /**
     * Show an error notification
     */
    error(message: string, duration = this.defaultDuration): void {
        this.show('error', message, duration);
    }

    /**
     * Show a warning notification
     */
    warning(message: string, duration = this.defaultDuration): void {
        this.show('warning', message, duration);
    }

    /**
     * Show an info notification
     */
    info(message: string, duration = this.defaultDuration): void {
        this.show('info', message, duration);
    }

    /**
     * Show a notification
     */
    private show(type: NotificationType, message: string, duration: number): void {
        const notification: Notification = {
            id: this.generateId(),
            type,
            message,
            duration
        };

        this._notifications.update(notifications => [...notifications, notification]);

        // Auto remove after duration
        setTimeout(() => {
            this.remove(notification.id);
        }, duration);
    }

    /**
     * Remove a notification by ID
     */
    remove(id: string): void {
        this._notifications.update(notifications =>
            notifications.filter(n => n.id !== id)
        );
    }

    /**
     * Clear all notifications
     */
    clearAll(): void {
        this._notifications.set([]);
    }

    private generateId(): string {
        return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
