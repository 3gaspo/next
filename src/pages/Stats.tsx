import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import StatsChart from '../components/StatsChart';
import { 
  format, 
  subDays, 
  startOfDay, 
  parseISO, 
  eachDayOfInterval,
  subMonths,
  subYears,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth,
  startOfWeek,
  startOfMonth
} from 'date-fns';
import { ChevronDown, CheckCircle, ListTodo } from 'lucide-react';
import { getLeafTasks } from '../lib/tree';

type Period = 'weekly' | 'monthly' | 'yearly';

export default function Stats() {
  const { tasks, loading } = useData();
  const [projectId, setProjectId] = useState<string>('all');
  const [period, setPeriod] = useState<Period>('weekly');

  const rootProjects = useMemo(() => {
    return tasks.filter(t => !t.parentId);
  }, [tasks]);

  const stats = useMemo(() => {
    const now = new Date();
    
    // Filter by project
    const projectSubtasks = projectId === 'all' 
      ? tasks 
      : tasks.filter(t => {
          if (t.id === projectId) return true;
          const getRootId = (taskId: string): string => {
            const task = tasks.find(it => it.id === taskId);
            if (!task || !task.parentId) return task?.id || '';
            const parent = tasks.find(it => it.id === task.parentId);
            if (!parent) return task.id;
            return getRootId(task.parentId);
          };
          return getRootId(t.id) === projectId;
        });

    const leafTasks = getLeafTasks(projectSubtasks);
    const completedTasks = leafTasks.filter(t => t.completed && t.completedAt);
    const totalToDos = leafTasks.filter(t => !t.completed).length;

    // Period specific data
    let periodStart: Date;
    let chartData: { date: string, count: number }[] = [];

    if (period === 'weekly') {
      periodStart = subDays(now, 6);
      const days = eachDayOfInterval({ start: periodStart, end: now });
      chartData = days.map(day => ({
        date: format(day, 'EEE'),
        count: completedTasks.filter(t => isSameDay(parseISO(t.completedAt!), day)).length
      }));
    } else if (period === 'monthly') {
      periodStart = subDays(now, 28); // Roughly 4 weeks
      const weeks = eachWeekOfInterval({ start: periodStart, end: now });
      chartData = weeks.map(week => ({
        date: `W${format(week, 'w')}`,
        count: completedTasks.filter(t => isSameWeek(parseISO(t.completedAt!), week)).length
      }));
    } else {
      periodStart = subYears(now, 1);
      const months = eachMonthOfInterval({ start: periodStart, end: now });
      chartData = months.map(month => ({
        date: format(month, 'MMM'),
        count: completedTasks.filter(t => isSameMonth(parseISO(t.completedAt!), month)).length
      }));
    }

    const periodDone = completedTasks.filter(t => parseISO(t.completedAt!) >= periodStart).length;

    return { 
      chartData, 
      overallDone: completedTasks.length, 
      overallToDo: totalToDos,
      periodDone,
      periodToDos: totalToDos // Assuming to-do doesn't vary by period start in the same way
    };
  }, [tasks, projectId, period]);

  return (
    <div className="px-6 pt-12 pb-24 max-w-lg mx-auto">
      <header className="mb-10 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Stats</h1>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <select 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-14 pl-6 pr-12 bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100 rounded-2xl border-none font-bold appearance-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">All Projects</option>
              {rootProjects.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{p.name}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown size={18} />
            </div>
          </div>

          <div className="relative flex-1">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="w-full h-14 pl-6 pr-12 bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100 rounded-2xl border-none font-bold appearance-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm"
            >
              <option value="weekly" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Weekly</option>
              <option value="monthly" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Monthly</option>
              <option value="yearly" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Yearly</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <MetricGroup 
            label="Overall"
            done={stats.overallDone}
            todo={stats.overallToDo}
          />
          <MetricGroup 
            label="This Period"
            done={stats.periodDone}
            todo={stats.overallToDo}
          />
        </div>
      </div>

      <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[32px] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Activity</h2>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm">
          <StatsChart data={stats.chartData} />
        </div>
      </div>
    </div>
  );
}

function MetricGroup({ label, done, todo }: { label: string; done: number; todo: number }) {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[32px] space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle size={16} />
            <span className="text-xs font-bold">Done</span>
          </div>
          <span className="text-xl font-black">{done}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <ListTodo size={16} />
            <span className="text-xs font-bold">To Do</span>
          </div>
          <span className="text-xl font-black">{todo}</span>
        </div>
      </div>
    </div>
  );
}
