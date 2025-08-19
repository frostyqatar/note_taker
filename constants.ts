
import { ProjectColor } from './types';

export const PROJECT_COLORS: { name: string; value: ProjectColor }[] = [
    { name: 'Violet', value: 'violet' },
    { name: 'Emerald', value: 'emerald' },
    { name: 'Blue', value: 'blue' },
    { name: 'Amber', value: 'amber' },
    { name: 'Rose', value: 'rose' },
];

export const PROJECT_COLOR_STYLES: Record<ProjectColor, { chip: string; text: string }> = {
    violet: {
        chip: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-700 dark:text-violet-300'
    },
    emerald: {
        chip: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300'
    },
    blue: {
        chip: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300'
    },
    amber: {
        chip: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300'
    },
    rose: {
        chip: 'bg-rose-100 dark:bg-rose-900/30',
        text: 'text-rose-700 dark:text-rose-300'
    }
};
