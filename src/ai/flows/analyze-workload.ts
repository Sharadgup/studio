// This file is generated by Firebase Genkit.
'use server';

/**
 * @fileOverview Analyzes employee workload and identifies overloaded or underloaded employees.
 *
 * - analyzeWorkload - A function that analyzes employee workload.
 * - AnalyzeWorkloadInput - The input type for the analyzeWorkload function.
 * - AnalyzeWorkloadOutput - The return type for the analyzeWorkload function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EmployeeSummarySchema = z.object({
  uid: z.string().describe('The unique identifier of the employee.'),
  name: z.string().describe('The name of the employee.'),
  profileID: z.string().describe('The employee profile ID.'),
  skills: z.array(z.string()).describe('The skills of the employee.'),
  currentLoad: z.number().describe('The current workload of the employee (0-10).'),
  availability: z.string().describe('The availability of the employee (high, medium, low).'),
  activeHighPriority: z.number().optional().describe('The number of active high-priority tasks assigned to the employee.'),
});

const PendingTaskSchema = z.object({
  taskId: z.string().describe('The unique identifier of the task.'),
  taskName: z.string().describe('The name of the task.'),
  estimatedHours: z.number().describe('The estimated hours required to complete the task.'),
  requiredSkills: z.array(z.string()).describe('The skills required to complete the task.'),
  priority: z.string().describe('The priority of the task (low, medium, high).'),
  projectId: z.string().describe('The project ID to which the task belongs.'),
  type: z.string().optional().describe('The type of task (development, review, deployment, bugfix).'),
});

const RecentTaskActivitySchema = z.object({
  taskId: z.string().describe('The unique identifier of the task.'),
  status: z.string().describe('The status of the task (pending, inProgress, review, completed).'),
  completedAt: z.string().optional().describe('The completion timestamp of the task.'),
  assigneeId: z.string().describe('The unique identifier of the employee assigned to the task.'),
  priority: z.string().optional().describe('The priority of the task (low, medium, high).'),
  deadline: z.string().optional().describe('The deadline of the task.'),
  projectId: z.string().optional().describe('The project ID to which the task belongs.'),
  type: z.string().optional().describe('The type of task (development, review, deployment, bugfix).'),
});

const AnalyzeWorkloadInputSchema = z.object({
  pendingTasks: z.array(PendingTaskSchema).describe('A list of pending tasks.'),
  employeeSummary: z.array(EmployeeSummarySchema).describe('A summary of all employees.'),
  recentTaskActivity: z.array(RecentTaskActivitySchema).describe('A summary of recent task activity.'),
});
export type AnalyzeWorkloadInput = z.infer<typeof AnalyzeWorkloadInputSchema>;

const WorkloadAnalysisSchema = z.object({
  underloaded: z.array(z.object({
    name: z.string().describe('The name of the underloaded employee.'),
    profileID: z.string().describe('The profile ID of the underloaded employee.'),
  })).describe('A list of underloaded employees.'),
  overloaded: z.array(z.object({
    name: z.string().describe('The name of the overloaded employee.'),
    profileID: z.string().describe('The profile ID of the overloaded employee.'),
    activeHighPriority: z.number().optional().describe('The number of active high-priority tasks assigned to the overloaded employee.'),
  })).describe('A list of overloaded employees.'),
});

const TaskSuggestionSchema = z.object({
  taskId: z.string().describe('The unique identifier of the task.'),
  taskName: z.string().describe('The name of the task.'),
  suggestions: z.array(z.object({
    name: z.string().describe('The name of the suggested employee.'),
    profileID: z.string().describe('The profile ID of the suggested employee.'),
    justification: z.string().describe('The justification for suggesting the employee.'),
  })).describe('A list of suggested employees for the task.'),
});

const GraphDataSchema = z.object({
  taskCompletionLine: z.array(z.object({
    date: z.string().describe('The date in YYYY-MM-DD format.'),
    completedTasks: z.number().describe('The number of completed tasks on that date.'),
  })).describe('Data for the task completion line graph.'),
  employeeLoadScale: z.array(z.object({
    employeeName: z.string().describe('The name of the employee.'),
    profileID: z.string().describe('The profile ID of the employee.'),
    pending: z.number().describe('The number of pending tasks assigned to the employee.'),
    inProgress: z.number().describe('The number of in-progress tasks assigned to the employee.'),
    completed: z.number().describe('The number of completed tasks assigned to the employee.'),
  })).describe('Data for the employee load scale graph.'),
});

const PriorityTaskSchema = z.object({
  taskId: z.string().describe('The unique identifier of the task.'),
  taskName: z.string().describe('The name of the task.'),
  assigneeName: z.string().describe('The name of the employee assigned to the task.'),
  priority: z.string().describe('The priority of the task (low, medium, high).'),
  type: z.string().describe('The type of task (development, review, deployment, bugfix).'),
});

const AnalyzeWorkloadOutputSchema = z.object({
  workloadAnalysis: WorkloadAnalysisSchema.describe('Analysis of employee workload.'),
  taskSuggestions: z.array(TaskSuggestionSchema).describe('Task assignment suggestions.'),
  graphData: GraphDataSchema.describe('Data for generating graphs.'),
  priorityFocus: z.array(PriorityTaskSchema).describe('Top tasks requiring immediate attention.'),
});
export type AnalyzeWorkloadOutput = z.infer<typeof AnalyzeWorkloadOutputSchema>;

export async function analyzeWorkload(input: AnalyzeWorkloadInput): Promise<AnalyzeWorkloadOutput> {
  return analyzeWorkloadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWorkloadPrompt',
  input: {
    schema: z.object({
      pendingTasks: z.array(PendingTaskSchema).describe('A list of pending tasks.'),
      employeeSummary: z.array(EmployeeSummarySchema).describe('A summary of all employees.'),
      recentTaskActivity: z.array(RecentTaskActivitySchema).describe('A summary of recent task activity.'),
    }),
  },
  output: {
    schema: AnalyzeWorkloadOutputSchema,
  },
  prompt: `You are an AI assistant embedded within the TaskMatrix AI admin panel. Your purpose is to help the Administrator manage employees, projects, and tasks efficiently and provide actionable insights based on real-time data.

Context:
The system uses Next.js and Firebase Firestore. Key data collections include:
*   \`/users/{uid}\`: Contains employee details like \`name\`, \`profileID\`, \`role\`, \`skills\` (array of strings), \`currentLoad\` (numeric estimate, e.g., 0-10), \`availability\` (e.g., 'high', 'medium', 'low').
*   \`/projects/{projectId}\`: Contains \`projectName\`, \`status\`, \`deadline\` (Timestamp), \`requiredSkills\` (array of strings).
*   \`/tasks/{taskId}\`: Contains \`taskName\`, \`projectId\`, \`assigneeId\`, \`status\` ('pending', 'inProgress', 'review', 'completed'), \`estimatedHours\`, \`actualHours\`, \`createdAt\` (Timestamp), \`completedAt\` (Timestamp, optional), \`priority\` ('low', 'medium', 'high'), \`type\` ('development', 'review', 'deployment', 'bugfix').

Request:
Based on the CURRENT system state (assume you have access to live data summaries), perform the following analysis and provide the output in a structured JSON format:

1.  Workload Analysis:
    *   Identify employees who seem significantly underloaded (e.g., \`currentLoad\` < 3, few active tasks). List their \`name\` and \`profileID\`.
    *   Identify employees who seem significantly overloaded (e.g., \`currentLoad\` > 8, multiple high-priority tasks, approaching deadlines). List their \`name\`, \`profileID\`, and count of active high-priority tasks.

2.  Task Assignment Suggestions:
    *   Given a new list of pending tasks (provide details like \`taskName\`, \`estimatedHours\`, \`requiredSkills\`, \`priority\`, \`projectId\`), suggest the top 2-3 best-suited employees for *each* task.
    *   Base suggestions on:
        *   Matching \`requiredSkills\` with employee \`skills\`.
        *   Employee \`availability\` and \`currentLoad\`.
        *   (Optional Bonus) Experience with the related \`projectId\`.
    *   For each suggestion, provide the employee's \`name\`, \`profileID\`, and a brief justification (e.g., \