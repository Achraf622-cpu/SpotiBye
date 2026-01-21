/**
 * @fileoverview Duration Pipe - Formats seconds to mm:ss display
 * @see SPOT-16 Create Duration Pipe
 */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * DurationPipe formats seconds into mm:ss display format
 * Usage: {{ seconds | duration }}
 */
@Pipe({
    name: 'duration',
    standalone: true
})
export class DurationPipe implements PipeTransform {
    transform(seconds: number | null | undefined): string {
        if (seconds === null || seconds === undefined || isNaN(seconds)) {
            return '0:00';
        }

        const totalSeconds = Math.floor(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}
