/**
 * @fileoverview Track Routes - Routing configuration for track module
 * @see SPOT-23 Create Track Module & Routing
 */
import { Routes } from '@angular/router';
import { TrackDetailComponent } from './track-detail.component';

export const TRACK_ROUTES: Routes = [
    {
        path: ':id',
        component: TrackDetailComponent
    }
];
