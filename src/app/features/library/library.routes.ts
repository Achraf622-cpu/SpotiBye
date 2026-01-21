/**
 * @fileoverview Library Routes - Routing configuration for library module
 * @see SPOT-19 Create Library Module & Routing
 */
import { Routes } from '@angular/router';
import { LibraryComponent } from './library.component';

export const LIBRARY_ROUTES: Routes = [
    {
        path: '',
        component: LibraryComponent
    }
];
