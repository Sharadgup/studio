// TaskMatrixAI Admin Insights Flow
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating insights on team performance,
 * including workload analysis, task assignment suggestions, graph data, and prioritization focus.
 *
 * - generateInsights - A function that generates insights on team performance.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  pendingTasks: z.array(
    z.object({
      taskId: z.string().describe('The ID of the task.'),
      taskName: z.string().describe('The name of the task.'),
      estimatedHours: z.number().describe('The estimated hours to complete the task.'),
      requiredSkills: z.array(z.string()).describe('The required skills for the task.'),
      priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
      projectId: z.string().describe('The ID of the project the task belongs to.'),
    })
  ).describe('A list of pending tasks.'),
  employeeSummary: z.array(
    z.object({
      uid: z.string().describe('The unique ID of the employee.'),
      name: z.string().describe('The name of the employee.'),
      profileID: z.string().describe('The profile ID of the employee.'),
      skills: z.array(z.string()).describe('The skills of the employee.'),
      currentLoad: z.number().describe('The current workload of the employee (0-10).'),
      availability: z.enum(['high', 'medium', 'low']).describe('The availability of the employee.'),
    })
  ).describe('A summary of employees and their attributes.'),
    recentTaskActivity: z.array(
        z.object({
            taskId: z.string().describe('The ID of the task.'),
            status: z.enum(['pending', 'inProgress', 'review', 'completed']).describe('The status of the task.'),
            completedAt: z.string().optional().describe('The completion timestamp of the task, if completed.'),
            assigneeId: z.string().describe('The ID of the employee assigned to the task.'),
            priority: z.enum(['low', 'medium', 'high']).optional().describe('The priority of the task.'),
            deadline: z.string().optional().describe('The deadline of the task.'),
            type: z.enum(['development', 'review', 'deployment', 'bugfix']).optional().describe('The type of the task.'),
            projectId: z.string().optional().describe('The project ID of the task')
        })
    ).describe('A summary of recent task activity, including status and assignments.')
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  workloadAnalysis: z.object({
    underloaded: z.array(
      z.object({
        name: z.string().describe('The name of the underloaded employee.'),
        profileID: z.string().describe('The profile ID of the underloaded employee.'),
      })
    ).describe('A list of underloaded employees.'),
    overloaded: z.array(
      z.object({
        name: z.string().describe('The name of the overloaded employee.'),
        profileID: z.string().describe('The profile ID of the overloaded employee.'),
        activeHighPriority: z.number().describe('The number of active high-priority tasks assigned to the employee.'),
      })
    ).describe('A list of overloaded employees.'),
  }).describe('An analysis of employee workload.'),
  taskSuggestions: z.array(
    z.object({
      taskId: z.string().describe('The ID of the task.'),
      taskName: z.string().describe('The name of the task.'),
      suggestions: z.array(
        z.object({
          name: z.string().describe('The name of the suggested employee.'),
          profileID: z.string().describe('The profile ID of the suggested employee.'),
          justification: z.string().describe('The justification for the suggestion.'),
        })
      ).describe('A list of suggested employees for the task.'),
    })
  ).describe('Task assignment suggestions.'),
  graphData: z.object({
    taskCompletionLine: z.array(
      z.object({
        date: z.string().describe('The date in YYYY-MM-DD format.'),
        completedTasks: z.number().describe('The number of completed tasks on that date.'),
      })
    ).describe('Data for the task completion line graph.'),
    employeeLoadScale: z.array(
      z.object({
        employeeName: z.string().describe('The name of the employee.'),
        profileID: z.string().describe('The profile ID of the employee.'),
        pending: z.number().describe('The number of pending tasks assigned to the employee.'),
        inProgress: z.number().describe('The number of in-progress tasks assigned to the employee.'),
        completed: z.number().describe('The number of completed tasks assigned to the employee.'),
      })
    ).describe('Data for the employee load scale graph.'),
  }).describe('Data for generating graphs.'),
  priorityFocus: z.array(
    z.object({
      taskId: z.string().describe('The ID of the task.'),
      taskName: z.string().describe('The name of the task.'),
      assigneeName: z.string().describe('The name of the assigned employee.'),
      priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
      type: z.enum(['development', 'review', 'deployment', 'bugfix']).describe('The type of the task.'),
    })
  ).describe('A list of tasks requiring immediate attention.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const generateInsightsPrompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {
    schema: GenerateInsightsInputSchema,
  },
  output: {
    schema: GenerateInsightsOutputSchema,
  },
  prompt: `You are an AI assistant embedded within the TaskMatrix AI admin panel. Your purpose is to help the Administrator manage employees, projects, and tasks efficiently and provide actionable insights based on real-time data.

The system uses Next.js and Firebase Firestore. Key data collections include:
*   \`/users/{uid}\`:
Contains employee details like 
\`name\`, \`profileID\`, \`role\`, \`skills\` (array of strings), 
\`currentLoad\` (numeric estimate, e.g., 0-10), 
\`availability\` (e.g., 'high', 'medium', 'low').
*   \`/projects/{projectId}\`:
Contains \`projectName\`, \`status\`, 
\`deadline\` (Timestamp), 
\`requiredSkills\` (array of strings).
*   \`/tasks/{taskId}\`:
Contains \`taskName\`, \`projectId\`, 
\`assigneeId\`, 
\`status\` ('pending', 'inProgress', 'review', 'completed'), 
\`estimatedHours\`, \`actualHours\`, 
\`createdAt\` (Timestamp), 
\`completedAt\` (Timestamp, optional), 
\`priority\` ('low', 'medium', 'high'), 
\`type\` ('development', 'review', 'deployment', 'bugfix').

Based on the CURRENT system state (assume you have access to live data summaries), perform the following analysis and provide the output in a structured JSON format:

1.  Workload Analysis:
*   Identify employees who seem significantly underloaded (e.g., currentLoad < 3, few active tasks). List their name and profileID.
*   Identify employees who seem significantly overloaded (e.g., currentLoad > 8, multiple high-priority tasks, approaching deadlines). List their name, profileID, and count of active high-priority tasks.

2.  Task Assignment Suggestions:
*   Given a new list of pending tasks (provide details like taskName, estimatedHours, requiredSkills, priority, projectId), suggest the top 2-3 best-suited employees for *each* task.
*   Base suggestions on:
    *   Matching requiredSkills with employee skills.
    *   Employee availability and currentLoad.
    *   (Optional Bonus) Experience with the related projectId.
*   For each suggestion, provide the employee's name, profileID, and a brief justification (e.g., \