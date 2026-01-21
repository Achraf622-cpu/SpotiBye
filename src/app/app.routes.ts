import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'library',
        pathMatch: 'full'
    },
    {
        path: 'library',
        loadChildren: () => import('./features/library/library.routes')
            .then(m => m.LIBRARY_ROUTES)
    },
    {
        path: 'track',
        loadChildren: () => import('./features/track/track.routes')
            .then(m => m.TRACK_ROUTES)
    },
    {
        path: '**',
        redirectTo: 'library'
    }
];
