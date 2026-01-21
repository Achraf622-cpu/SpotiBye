/**
 * @fileoverview App Root Component - Responsive application shell
 * @see SPOT-26 Responsive Design Implementation
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerBarComponent } from './shared/components/player-bar/player-bar.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PlayerBarComponent, NotificationsComponent],
  template: `
    <div class="min-h-screen">
      <router-outlet />
      <app-player-bar />
      <app-notifications />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class App { }
