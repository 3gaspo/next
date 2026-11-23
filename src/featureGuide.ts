import type { FeatureSection } from '@3gaspo/app-ui/Tutorial';
import { DEFAULT_PRIORITY_SETTINGS } from './types';

const defaults = DEFAULT_PRIORITY_SETTINGS;

export const featureGuide = [
  {
    title: 'Home and your daily shortlist',
    entries: [
      { title: 'Add a task', text: 'Give it a name and optionally a deadline. Set importance, estimated duration in minutes, effort and appreciation, which is how much you want to do it.' },
      { title: 'What appears on Home', text: 'Next ranks unfinished tasks with no subtasks. Folders and branches are shown in Database. Home displays the top suggestions and the tasks you completed today.' },
      { title: 'Complete or skip', text: 'Use the circle to mark a task complete. Fast-forward hides it until the next local day. Restore all brings back the tasks you skipped today.' },
    ],
  },
  {
    title: 'Database and projects',
    entries: [
      { title: 'Organise tasks', text: 'Create folders for projects, nest folders, or break a task into subtasks. Open an item to see its children and use the breadcrumb to return to a parent.' },
      { title: 'Manage your tree', text: 'See branch progress, reveal completed tasks, and edit task details. Deleting an item also deletes its descendants.' },
    ],
  },
  {
    title: 'Exact priority formula',
    entries: [
      { title: 'The weighted score', text: 'Each input is scaled from 0 to 1. Next multiplies each input by its weight, adds the results and rounds to two decimal places. The weights are editable in Settings.', formula: 'S = round₂(\n  wD × D + wA × A + wI × I\n  + wT × T + wE × E + wP × P\n)' },
      { title: 'Default weights', text: 'The negative effort weight lowers the score for more demanding tasks by default. A weight of zero leaves that input out.', formula: `wD = ${defaults.deadlineWeight}, wA = ${defaults.ageWeight}, wI = ${defaults.importanceWeight}\nwT = ${defaults.durationWeight}, wE = ${defaults.effortWeight}, wP = ${defaults.appreciationWeight}` },
      { title: 'Deadline (D)', text: 'd is the number of local calendar days from today to the deadline. Today and overdue score 1. A date at least 360 days away or an unset deadline scores 0.', formula: 'D = clamp(1 − d ÷ 360, 0, 1)\nD = 0 with no deadline' },
      { title: 'Age (A) and duration (T)', text: 'Both use the same U-shaped calculation. New and very old tasks receive higher age scores, with the low point at 180 days. Very short and very long tasks receive higher duration scores, with the low point at 125 minutes.', formula: 'n = clamp(x, 0, cap) ÷ cap\nU(x, cap) = (2 × n − 1)²\nA = U(ageDays, 360)\nT = U(durationMinutes, 250)' },
      { title: 'Importance (I), effort (E) and appreciation (P)', text: 'Your ratings use a 1–10 scale. The clamp function limits a number to the given range.', formula: 'N(x) = clamp(x, 0, 10) ÷ 10\nI = N(importance)\nE = N(effort)\nP = N(appreciation)' },
    ],
  },
  {
    title: 'Ranking and badges',
    entries: [
      { title: 'Rank and ties', text: 'Higher scores come first. With equal scores, Next prefers a task with a deadline, then the earlier deadline, then the earlier creation date and finally the name.' },
      { title: 'Priority bands', text: 'The possible range splits into five equal bands, from Very low to Very high. L is the sum of negative weights. H is the sum of positive weights. If L and H are equal, the band is Medium.', formula: 'p = clamp((S − L) ÷ (H − L), 0, 1)\nband index = min(4, floor(5 × p))' },
      { title: 'Urgent', text: 'A separate Urgent badge marks unfinished tasks that are overdue, due today or due tomorrow. It follows the deadline and does not change the score.' },
    ],
  },
  {
    title: 'Statistics',
    entries: [
      { title: 'Choose a project and period', text: 'View all tasks or one branch. The weekly, monthly and yearly views group completed tasks by day, week and month respectively.' },
      { title: 'Read the counts', text: 'Statistics counts tasks without subtasks. Overall counts finished and outstanding tasks. This Period shows completions in the selected window alongside the current outstanding count.' },
    ],
  },
  {
    title: 'Settings, export and resets',
    entries: [
      { title: 'Choose what Home shows', text: 'Set how many unfinished suggestions Home displays, from 1 to 50. Show Priority Scores displays numerical scores and the detailed task ratings. Change the theme in Appearance.' },
      { title: 'Account and CSV', text: 'Manage your sign-in and download the task hierarchy as CSV. A local session stores data in this browser. Firebase data follows your account.' },
      { title: 'Clear History or Reset All', text: 'Clear History removes completed tasks. Reset All removes every task, clears skipped tasks and restores the default priority weights and Home limit, while keeping your theme and score visibility preference.' },
    ],
  },
] as const satisfies readonly FeatureSection[];
