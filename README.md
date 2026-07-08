# Next — Priority-Based Task Manager

Next is a high-performance, minimalist, priority-based task manager built with a Swiss/Modern design system. Unlike traditional linear to-do lists, Next uses an **infinite hierarchical database structure** (nesting folders inside folders) and a **deterministic scoring algorithm** to calculate exactly what you should work on next.

---

## 🚀 Key Features

### 1. Deterministic Priority Engine
Next does not rely on manual ordering. Instead, it evaluates every leaf task (actionable items at the very bottom of any project tree) based on six custom-weighted vectors:
*   **Deadline Proximity**: Tasks with impending or overdue deadlines gain exponential weight.
*   **Task Age**: Older tasks naturally gain weight over time to prevent them from being forgotten.
*   **Importance**: User-defined impact score (1 to 10).
*   **Duration**: Estimated completion time.
*   **Effort**: Cognitive or physical demand (1 to 10).
*   **Appreciation**: The level of satisfaction or joy the task brings (1 to 10).

The priority engine operates on a user-customizable formula, allowing you to fine-tune the exact weights in the **Settings** panel to match your lifestyle or workflow.

### 2. Infinite Hierarchical Database
Structure your life with absolute freedom:
*   Create root-level projects or folders.
*   Nest tasks, sub-projects, or checklists infinitely deep.
*   The **Database** page handles the tree hierarchy cleanly with responsive breadcrumbs and path indicators.
*   Track progress automatically: Project folders dynamically display their status as a ratio of completed tasks to total tasks (e.g., `3 / 10 tasks`).

### 3. "Today" Actionable Interface
The **Home** ("Today") view is entirely focused on action:
*   Only **leaf tasks** (tasks with no children/subtasks) are displayed here, keeping your dashboard actionable.
*   Tasks are strictly ordered by their calculated priority score.
*   When a task is checked off, it is instantly restyled, checked, and smoothly animated to the bottom of the list, allowing you to uncheck it if marked by mistake, without disappearing from the view.

### 4. Interactive Statistics & Analytics
Visualize your productivity across different scopes and timeframes:
*   Filter statistics globally or drill down into specific root projects.
*   Toggle view periods dynamically between **Weekly**, **Monthly**, and **Yearly**.
*   View high-level **Overall** and **This Period** completed vs. pending metrics.
*   Analyze your historical productivity using the responsive time-series chart.

### 5. Multi-Device Synchronization & CSV Export
*   **Offline Mode / Dev Mode**: Uses highly responsive, secure HTML5 LocalStorage.
*   **Cloud Mode**: Full-stack Firebase Auth and Firestore database synchronization for persistent across multiple devices.
*   **Portability**: Export all your hierarchical data, including breadcrumbs, depths, completion metrics, and priority scores, to a clean CSV file with a single click.

---

## 🛠️ Architecture & Tech Stack

Next is built using cutting-edge, industrial-grade web technologies:
*   **Frontend**: React 18+ paired with **TypeScript** for strict type-safety.
*   **Styling**: **Tailwind CSS** with a Swiss-inspired minimal aesthetic, custom font pairings (Inter), fluid layouts, and strict light/dark mode compliance.
*   **Animations**: Staggered page and card transitions powered by **motion/react**.
*   **Data Visualization**: Custom responsive charts powered by **Recharts**.
*   **Utility & Date Libraries**: High-efficiency date arithmetic via **date-fns**.
*   **Data Providers**: Abstracted provider model permitting effortless switching between LocalStorage and Firebase SDKs.
