# **App Name**: TaskMatrixAI Admin

## Core Features:

- Unified Dashboard: Provides a unified interface for managing users, projects, tasks, and company data.
- User Management: Allows creation, viewing, editing, and deactivation of employee profiles with unique IDs.
- Project & Task Management: Enables creation of new projects with unique IDs, task assignments, and progress tracking.
- Automated Task Assignment: Suggests optimal task assignments based on skills, availability, and workload, acting as a tool for admins.
- Real-Time Animated Graphs: Presents team and individual productivity through real-time, animated graphs.

## Style Guidelines:

- Primary color: White or light gray for a clean, professional look.
- Secondary color: Dark gray or black for text and important elements.
- Accent: Teal (#008080) for interactive elements and highlights.
- Clean and readable sans-serif fonts for all text elements.
- Simple, modern icons for navigation and actions.
- Subtle transitions and animations for a polished user experience.
- A clean, well-organized layout with clear sections and intuitive navigation.

## Original User Request:
Okay, let's refine the plan specifically for the **Admin Panel** and the **Employee Management Panel** within it, focusing on the requested advanced UI features like animated real-time graphs, unique hover effects, and detailed AI prompts.

This builds upon the previous structure, adding more visual and interactive sophistication.

**🔧 PROJECT REFINEMENT: TaskMatrix AI - Admin & Employee Management Core**

This section details the implementation of the central control hub for administrators, covering user management, task assignment, project oversight, and performance visualization with advanced UI elements.

**✨ Key Features (Admin Panel Focused)**

1.  **Unified Dashboard:** Single interface for managing Users, Projects, Tasks, and Company Data.
2.  **Role-Based Access Control:** Strictly enforced admin privileges.
3.  **User Management:**
    *   Create new users (employees) with secure credentials (ID/Password generated, role assigned).
    *   View, Edit, Deactivate/Delete employee profiles.
    *   Manage employee roles and permissions.
    *   Assign unique, trackable `profileID` (e.g., `EMP-001`).
4.  **Project & Task Management:**
    *   Create new projects (with unique IDs), assign teams.
    *   Upload/Link project code & relevant documents (using Firebase Storage).
    *   Assign specific tasks (including Review & Deployment tasks) to individuals or teams.
    *   Define task dependencies and deadlines.
    *   Track task progress visually (Kanban view optional, integrated with graphs).
5.  **Collaborative Features (Admin Oversight):**
    *   View team task assignments and workload distribution.
    *   Oversee collaborative matching suggestions (AI-driven).
    *   Manage sharing permissions for project code/info.
6.  **AI-Powered Insights & Automation:**
    *   **Automated Task Assignment:** Suggestions based on skills, availability, and workload.
    *   **Performance Analytics:** Visualize team/individual productivity via real-time graphs.
    *   **Risk Prediction:** Flag potential project delays based on current progress and historical data.
7.  **Real-Time Animated Graphs:**
    *   **Task Completion Line Graph:** Shows tasks completed over time (e.g., last 7/30 days), updating live.
    *   **Project Load Scale Graph:** Stacked bar chart showing task distribution (Pending, In Progress, Completed) per employee or project.
    *   Animated transitions when data updates.
8.  **Advanced UI/UX:**
    *   **Unique Hover Effects:** Subtle and engaging effects on cards, buttons, and navigation items using Tailwind CSS transitions and potentially Framer Motion for more complex animations.
    *   **Responsive Design:** Fully functional on desktop and tablet devices.
9.  **Security & Compliance:**
    *   Secure area for managing confidential company information ("company cards"/documents).
    *   Audit trails (optional, logging key admin actions).

**📊 GRAPH SYSTEM IMPLEMENTATION (Admin Panel)**

*   **Technology:** Recharts (for easy integration with React/Next.js) + Firebase Firestore `onSnapshot` for real-time data.
*   **Data Source:** Firestore collections (`/tasks`, `/assignments`, `/employees`). Data needs to be aggregated and formatted client-side or via a Firebase Function for the graphs.

**1. Real-Time Task Completion Line Graph:**

*   **Purpose:** Visualize team velocity/task throughput.
*   **Data Needed:** Tasks marked 'completed' with their completion timestamp.
*   **Firestore Listener:** `onSnapshot` on the `tasks` collection, filtering by `status === 'completed'` and relevant time range.
*   **Component (`TaskCompletionGraph.tsx`):**
    ```tsx
    'use client'; // Needed for hooks and interactivity
    import React, { useState, useEffect } from 'react';
    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
    import { db } from '@/firebase/config'; // Your Firebase config

    // Define structure for graph data points
    interface TaskDataPoint {
        date: string; // e.g., 'YYYY-MM-DD'
        completedTasks: number;
    }

    const TaskCompletionGraph = () => {
        const [data, setData] = useState<TaskDataPoint[]>([]);

        useEffect(() => {
            // Example: Get tasks completed in the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

            const q = query(
                collection(db, 'tasks'),
                where('status', '==', 'completed'),
                where('completedAt', '>=', sevenDaysAgoTimestamp) // Assuming you store completion timestamp
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const taskCountsByDay: { [key: string]: number } = {};

                // Initialize last 7 days
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateString = d.toISOString().split('T')[0];
                    taskCountsByDay[dateString] = 0;
                }

                querySnapshot.forEach((doc) => {
                    const task = doc.data();
                    if (task.completedAt) {
                        const completionDate = (task.completedAt as Timestamp).toDate();
                        const dateString = completionDate.toISOString().split('T')[0];
                        if (taskCountsByDay.hasOwnProperty(dateString)) {
                            taskCountsByDay[dateString]++;
                        }
                    }
                });

                const formattedData = Object.entries(taskCountsByDay)
                    .map(([date, count]) => ({ date, completedTasks: count }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

                setData(formattedData);
            });

            // Cleanup listener on component unmount
            return () => unsubscribe();
        }, []);

        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="completedTasks"
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        isAnimationActive={true} // Enable basic animation
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    export default TaskCompletionGraph;
    ```

**2. Project/Employee Load Scale Graph (Stacked Bar Chart):**

*   **Purpose:** Visualize workload distribution across employees or projects.
*   **Data Needed:** Tasks assigned to each employee/project, categorized by status (Pending, In Progress, Review, Completed).
*   **Firestore Listener:** `onSnapshot` on `tasks` or `assignments` collection. Group tasks by `assigneeId` or `projectId` and count statuses.
*   **Component (`EmployeeLoadGraph.tsx`):**
    ```tsx
    'use client';
    import React, { useState, useEffect } from 'react';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    import { collection, query, onSnapshot } from 'firebase/firestore';
    import { db } from '@/firebase/config';

    interface LoadDataPoint {
        employeeName: string; // Or projectId
        pending: number;
        inProgress: number;
        completed: number;
    }

    const EmployeeLoadGraph = () => {
        const [data, setData] = useState<LoadDataPoint[]>([]);
        // You'd also need to fetch employee names mapped to their IDs
        const [employeeMap, setEmployeeMap] = useState<{ [key: string]: string }>({});

        useEffect(() => {
            // Fetch employee names (simplified example)
            const unsubEmployees = onSnapshot(collection(db, 'users'), (snap) => {
                 const map: { [key: string]: string } = {};
                 snap.forEach(doc => map[doc.id] = doc.data().name || `User ${doc.id.substring(0,5)}`);
                 setEmployeeMap(map);
            });

            const q = query(collection(db, 'tasks')); // Get all tasks

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const loadByEmployee: { [key: string]: { pending: number; inProgress: number; completed: number } } = {};

                querySnapshot.forEach((doc) => {
                    const task = doc.data();
                    const assigneeId = task.assigneeId; // Assuming field exists
                    const status = task.status;       // Assuming field exists ('pending', 'inProgress', 'completed')

                    if (assigneeId) {
                        if (!loadByEmployee[assigneeId]) {
                            loadByEmployee[assigneeId] = { pending: 0, inProgress: 0, completed: 0 };
                        }
                        if (status === 'pending') loadByEmployee[assigneeId].pending++;
                        else if (status === 'inProgress' || status === 'review') loadByEmployee[assigneeId].inProgress++; // Grouping review with inProgress
                        else if (status === 'completed') loadByEmployee[assigneeId].completed++;
                    }
                });

                const formattedData = Object.entries(loadByEmployee).map(([employeeId, counts]) => ({
                    employeeName: employeeMap[employeeId] || `User ${employeeId.substring(0,5)}`, // Use fetched name
                    ...counts
                }));

                setData(formattedData);
            });

            return () => {
                unsubscribe();
                unsubEmployees(); // Cleanup employee listener too
            }
        }, [employeeMap]); // Re-run if employeeMap changes

        return (
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="employeeName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                    <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress/Review" />
                    <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    export default EmployeeLoadGraph;
    ```

**⚡ UNIQUE HOVER EFFECTS & ANIMATION**

*   **Technology:** Tailwind CSS (for most effects) & Framer Motion (for more complex, physics-based, or orchestrated animations).

**1. Tailwind Hover Effects:**

```jsx
// Card Hover Example (Scale + Shadow + Gradient Background)
<div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Project Alpha</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Status: In Progress</p>
    {/* Add subtle icon animation on hover within the group */}
    <span className="float-right text-gray-400 group-hover:text-indigo-500 group-hover:rotate-12 transition-transform duration-200">🚀</span>
</div>

// Button Hover Example (Gradient Shift + Icon Move)
<button className="group relative inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md shadow-sm hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
    Assign Task
    {/* Icon moves slightly to the right on hover */}
    <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" /* ... icon path ... */ ></svg>
</button>
```

**2. Framer Motion Animations (Example: Animate Presence for List Items):**

*   Install: `npm install framer-motion`
*   Use for entrances, exits, or more complex state transitions.

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Inside your component displaying a list of users or tasks
<AnimatePresence>
    {items.map(item => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            layout // Animate layout changes (e.g., reordering)
            className="my-2" // Add some margin
        >
            {/* Your UserCard or TaskCard component here */}
            <UserCard user={item} />
        </motion.div>
    ))}
</AnimatePresence>
```

**📋 FULL PROMPT FOR ADMIN AI ASSISTANT (Gemini API)**

This prompt guides the AI to act as a helpful assistant within the admin panel.

```text
**Role:** You are an AI assistant embedded within the TaskMatrix AI admin panel. Your purpose is to help the Administrator manage employees, projects, and tasks efficiently and provide actionable insights based on real-time data.

**Context:**
The system uses Next.js and Firebase Firestore. Key data collections include:
*   `/users/{uid}`: Contains employee details like `name`, `profileID`, `role`, `skills` (array of strings), `currentLoad` (numeric estimate, e.g., 0-10), `availability` (e.g., 'high', 'medium', 'low').
*   `/projects/{projectId}`: Contains `projectName`, `status`, `deadline` (Timestamp), `requiredSkills` (array of strings).
*   `/tasks/{taskId}`: Contains `taskName`, `projectId`, `assigneeId`, `status` ('pending', 'inProgress', 'review', 'completed'), `estimatedHours`, `actualHours`, `createdAt` (Timestamp), `completedAt` (Timestamp, optional), `priority` ('low', 'medium', 'high'), `type` ('development', 'review', 'deployment', 'bugfix').

**Request:**
Based on the CURRENT system state (assume you have access to live data summaries), perform the following analysis and provide the output in a structured JSON format:

1.  **Workload Analysis:**
    *   Identify employees who seem significantly **underloaded** (e.g., `currentLoad` < 3, few active tasks). List their `name` and `profileID`.
    *   Identify employees who seem significantly **overloaded** (e.g., `currentLoad` > 8, multiple high-priority tasks, approaching deadlines). List their `name`, `profileID`, and count of active high-priority tasks.

2.  **Task Assignment Suggestions:**
    *   Given a new list of **pending tasks** (provide details like `taskName`, `estimatedHours`, `requiredSkills`, `priority`, `projectId`), suggest the **top 2-3 best-suited employees** for *each* task.
    *   Base suggestions on:
        *   Matching `requiredSkills` with employee `skills`.
        *   Employee `availability` and `currentLoad`.
        *   (Optional Bonus) Experience with the related `projectId`.
    *   For each suggestion, provide the employee's `name`, `profileID`, and a brief justification (e.g., "Skills match, medium load").

3.  **Real-time Graph Data:**
    *   Generate the data points needed for the **Task Completion Line Graph** for the **last 7 days**. Output should be an array of objects: `[{ date: 'YYYY-MM-DD', completedTasks: count }, ...]`.
    *   Generate the data points needed for the **Employee Load Scale Graph**. Output should be an array of objects: `[{ employeeName: 'Name', profileID: 'EMP-XXX', pending: count, inProgress: count, completed: count }, ...]`. Aggregate 'review' tasks into 'inProgress'.

4.  **Prioritization Focus:**
    *   List the **top 5 tasks** (include `taskName`, `taskId`, `assigneeName`, `priority`, `type`) that require immediate attention this week, prioritizing:
        *   `review` tasks nearing project deadlines.
        *   `deployment` tasks scheduled soon.
        *   High-priority (`priority: 'high'`) tasks that are blocked or overdue.

**Input Data (Example - Provide this dynamically):**
```json
{
  "pendingTasks": [
    { "taskId": "T-101", "taskName": "Setup CI/CD Pipeline", "estimatedHours": 12, "requiredSkills": ["DevOps", "Firebase Functions", "GitHub Actions"], "priority": "high", "projectId": "P-001" },
    { "taskId": "T-102", "taskName": "Review Login UI Code", "estimatedHours": 3, "requiredSkills": ["React", "Next.js", "Tailwind CSS"], "priority": "medium", "projectId": "P-002", "type": "review" }
  ],
  "employeeSummary": [
      { "uid": "uid1", "name": "Alice", "profileID": "EMP-001", "skills": ["React", "Next.js", "Firebase"], "currentLoad": 4, "availability": "medium" },
      { "uid": "uid2", "name": "Bob", "profileID": "EMP-002", "skills": ["Python", "DevOps", "Firebase Functions", "GitHub Actions"], "currentLoad": 9, "availability": "low", "activeHighPriority": 3 },
      { "uid": "uid3", "name": "Charlie", "profileID": "EMP-003", "skills": ["React", "Tailwind CSS", "Node.js"], "currentLoad": 2, "availability": "high" }
  ],
   "recentTaskActivity": [ // Simplified summary for the AI
      { "taskId": "T-090", "status": "completed", "completedAt": "2024-10-26T10:00:00Z", "assigneeId": "uid1"},
      { "taskId": "T-091", "status": "inProgress", "assigneeId": "uid2", "priority": "high", "deadline": "2024-10-29T17:00:00Z" },
      { "taskId": "T-092", "status": "review", "assigneeId": "uid3", "projectId": "P-002", "deadline": "2024-10-28T17:00:00Z", "type": "review"}
   ]
}
```

**Output Format:** Return ONLY a valid JSON object containing keys: `workloadAnalysis`, `taskSuggestions`, `graphData`, `priorityFocus`.

```json
{
  "workloadAnalysis": {
    "underloaded": [ { "name": "Charlie", "profileID": "EMP-003" } ],
    "overloaded": [ { "name": "Bob", "profileID": "EMP-002", "activeHighPriority": 3 } ]
  },
  "taskSuggestions": [
    {
      "taskId": "T-101",
      "taskName": "Setup CI/CD Pipeline",
      "suggestions": [
        { "name": "Bob", "profileID": "EMP-002", "justification": "Perfect skills match, but currently overloaded. Assign with caution." }
        // Maybe no other perfect fit
      ]
    },
    {
      "taskId": "T-102",
      "taskName": "Review Login UI Code",
      "suggestions": [
        { "name": "Alice", "profileID": "EMP-001", "justification": "Skills match, medium load." },
        { "name": "Charlie", "profileID": "EMP-003", "justification": "Partial skills match (React/Tailwind), high availability." }
      ]
    }
  ],
  "graphData": {
    "taskCompletionLine": [
      { "date": "2024-10-20", "completedTasks": 2 },
      { "date": "2024-10-21", "completedTasks": 0 },
      // ... other days ...
      { "date": "2024-10-26", "completedTasks": 1 }
    ],
    "employeeLoadScale": [
       { "employeeName": "Alice", "profileID": "EMP-001", "pending": 1, "inProgress": 2, "completed": 5 },
       { "employeeName": "Bob", "profileID": "EMP-002", "pending": 0, "inProgress": 4, "completed": 8 },
       { "employeeName": "Charlie", "profileID": "EMP-003", "pending": 2, "inProgress": 1, "completed": 3 }
    ]
  },
  "priorityFocus": [
    { "taskId": "T-092", "taskName": "Review Login UI Code", "assigneeName": "Charlie", "priority": "medium", "type": "review" },
     { "taskId": "T-091", "taskName": "Backend API Refactor", "assigneeName": "Bob", "priority": "high", "type": "development" }
    // ... up to 5 tasks ...
  ]
}
```

**🧠 EMPLOYEE MANAGEMENT PANEL (Admin View Components)**

This clarifies the *specific* components within the Admin panel dedicated to viewing and managing employee-related information.

*   **`EmployeeListTable.tsx`:** Displays all employees with key info (Name, profileID, Role, Load indicator, Skills tags). Allows sorting, filtering, and clicking to view details. Includes actions (Edit, Deactivate). Uses unique hover effects on rows.
*   **`EmployeeDetailView.tsx`:** Shows full profile, assigned tasks (filterable), project history, performance stats (potentially small individual graphs), skill management.
*   **`TeamLoadVisualizer.tsx`:** Container holding the `EmployeeLoadGraph.tsx` and potentially other team-level metrics.
*   **`TaskAssignmentModal.tsx`:** A modal triggered from Projects or Tasks view. Includes fields for task details and incorporates AI suggestions for assignees (fetching results based on the AI prompt).
*   **`SkillsManager.tsx`:** (Potentially part of `EmployeeDetailView` or standalone) Allows admin to add/remove skills from employee profiles.

**🔚 Next Steps:**

1.  **Implement Firebase Structure:** Set up the Firestore collections and define security rules.
2.  **Build Core Admin Layout:** Create the sidebar, header, and main content area for the admin panel (`/app/admin/layout.tsx`).
3.  **Develop User Management:** Build the `EmployeeListTable` and forms for adding/editing users, integrating Firebase Auth Admin SDK calls.
4.  **Develop Graph Components:** Integrate `Recharts` as shown, connect them to live Firestore data using `onSnapshot`.
5.  **Implement Hover/Animations:** Apply Tailwind and Framer Motion effects to components as they are built.
6.  **Integrate AI:**
    *   Set up a Firebase Function or Next.js API route to call the Gemini API.
    *   Pass the structured context and the detailed prompt.
    *   Parse the JSON response and display insights/suggestions in the UI (e.g., in the `TaskAssignmentModal` or a dedicated Insights panel).

This detailed plan provides a solid foundation for building the sophisticated Admin and Employee Management panels with the desired real-time, animated, and AI-powered features.
  