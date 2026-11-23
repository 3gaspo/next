import { BarChart2, CheckCircle, ChevronDown, ChevronRight, Circle, Database, Edit2, Eye, FastForward, Home, ListOrdered, Plus, Settings, SlidersHorizontal } from 'lucide-react';
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
      { icon: ListOrdered, text: 'Priority weighs deadline, age, importance, duration, effort and enjoyment. Near deadlines help, and effort lowers the default score.' },
      { icon: Circle, text: 'Complete a suggested task' },
      { icon: FastForward, text: 'Skip a task for today' },
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
      { icon: SlidersHorizontal, text: 'Adjust the priority formula' },
      { icon: ListOrdered, text: 'Choose how many tasks Home shows' },
      { icon: Eye, text: 'Show or hide priority scores' },
    ],
  },
] as const satisfies TutorialPages;
