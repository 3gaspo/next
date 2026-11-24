import {
  BarChart2, Calendar, CheckCircle, ChevronDown, ChevronRight, Circle, Clock, Database,
  Edit2, Eye, FastForward, Heart, History, Home, ListOrdered, Plus, Settings,
  SlidersHorizontal, Target, Zap,
} from 'lucide-react';
import type { TutorialPages } from '@3gaspo/app-ui/Tutorial';

export const tutorialPages = [
  {
    logo: '/next.svg',
    title: 'Decide what to do next',
    description: 'Organise your tasks and get a shortlist ranked by priority, so you can focus on what’s ready to do.',
  },
  {
    icon: Home,
    title: 'Home',
    actions: [
      { icon: Plus, text: 'Add a task', primary: true },
      { icon: Circle, text: 'Complete a suggested task' },
      { icon: FastForward, text: 'Skip a task for today' },
    ],
  },
  {
    icon: ListOrdered,
    title: 'Default priority factors',
    actions: [
      { icon: Calendar, text: 'Deadline · sooner ranks higher' },
      { icon: History, text: 'Age · boosts new or very old' },
      { icon: Target, text: 'Importance · higher helps' },
      { icon: Clock, text: 'Duration · short or very long' },
      { icon: Zap, text: 'Effort · easier tasks rank up' },
      { icon: Heart, text: 'Appreciation · fun ranks higher' },
    ],
  },
  {
    icon: Database,
    title: 'Database',
    actions: [
      { icon: Plus, text: 'Add a task or folder', primary: true },
      { icon: ChevronRight, text: 'Open a folder or task' },
      { icon: Edit2, text: 'Edit task details' },
    ],
  },
  {
    icon: BarChart2,
    title: 'Statistics',
    actions: [
      { icon: CheckCircle, text: 'Review completed tasks' },
      { icon: ChevronDown, text: 'Filter by period or project' },
    ],
  },
  {
    icon: Settings,
    title: 'Settings',
    actions: [
      { icon: SlidersHorizontal, text: 'Tune the six priority weights' },
      { icon: ListOrdered, text: 'Choose Home’s task limit' },
      { icon: Eye, text: 'Show or hide scores' },
    ],
  },
] as const satisfies TutorialPages;
