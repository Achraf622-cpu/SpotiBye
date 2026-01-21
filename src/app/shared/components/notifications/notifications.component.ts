/**
 * @fileoverview Notifications Component - Toast notification display
 * @see SPOT-17 Create Notifications Component
 */
import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div 
          class="glass rounded-lg p-4 shadow-lg transform transition-all duration-300 animate-slide-in"
          [ngClass]="{
            'border-l-4 border-green-500': notification.type === 'success',
            'border-l-4 border-red-500': notification.type === 'error',
            'border-l-4 border-yellow-500': notification.type === 'warning',
            'border-l-4 border-blue-500': notification.type === 'info'
          }"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              @switch (notification.type) {
                @case ('success') {
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                }
                @case ('error') {
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                }
                @case ('warning') {
                  <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                }
                @case ('info') {
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
              }
            </div>
            <p class="text-sm text-gray-100 flex-1">{{ notification.message }}</p>
            <button 
              (click)="notificationService.remove(notification.id)"
              class="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);
}
