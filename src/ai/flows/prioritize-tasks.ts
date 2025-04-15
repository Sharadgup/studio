'use server';
/**
 * @fileOverview A task prioritization AI agent.
 *
 * - prioritizeTasks - A function that handles the task prioritization process.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  pendingTasks: z.array(z.object({
    taskId: z.string().describe('The ID of the task.'),
    taskName: z.string().describe('The name of the task.'),
    estimatedHours: z.number().describe('The estimated hours to complete the task.'),
    requiredSkills: z.array(z.string()).describe('The required skills for the task.'),
    priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
    projectId: z.string().describe('The ID of the project the task belongs to.'),
    type: z.enum(['development', 'review', 'deployment', 'bugfix']).describe('The type of the task.'),
  })).describe('A list of pending tasks.'),
  employeeSummary: z.array(z.object({
    uid: z.string().describe('The user ID of the employee.'),
    name: z.string().describe('The name of the employee.'),
    profileID: z.string().describe('The profile ID of the employee.'),
    skills: z.array(z.string()).describe('The skills of the employee.'),
    currentLoad: z.number().describe('The current workload of the employee (0-10).'),
    availability: z.enum(['high', 'medium', 'low']).describe('The availability of the employee.'),
  })).describe('A summary of employees and their skills.'),
  recentTaskActivity: z.array(z.object({
    taskId: z.string().describe('The ID of the task.'),
    status: z.enum(['pending', 'inProgress', 'review', 'completed']).describe('The status of the task.'),
    assigneeId: z.string().optional().describe('The ID of the employee assigned to the task, if any.'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('The priority of the task.'),
    deadline: z.string().optional().describe('The deadline of the task in ISO format, if any.'),
    projectId: z.string().optional().describe('The ID of the project the task belongs to, if any.'),
    type: z.enum(['development', 'review', 'deployment', 'bugfix']).optional().describe('The type of the task, if any.'),
    completedAt: z.string().optional().describe('The completion timestamp of the task in ISO format, if any.'),
  })).describe('A summary of recent task activity.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  priorityFocus: z.array(z.object({
    taskId: z.string().describe('The ID of the task.'),
    taskName: z.string().describe('The name of the task.'),
    assigneeName: z.string().describe('The name of the assignee.'),
    priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
    type: z.enum(['development', 'review', 'deployment', 'bugfix']).describe('The type of the task.'),
  })).describe('A list of the top 5 tasks that require immediate attention.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {
    schema: z.object({
      pendingTasks: z.array(z.object({
        taskId: z.string().describe('The ID of the task.'),
        taskName: z.string().describe('The name of the task.'),
        estimatedHours: z.number().describe('The estimated hours to complete the task.'),
        requiredSkills: z.array(z.string()).describe('The required skills for the task.'),
        priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
        projectId: z.string().describe('The ID of the project the task belongs to.'),
        type: z.enum(['development', 'review', 'deployment', 'bugfix']).describe('The type of the task.'),
      })).describe('A list of pending tasks.'),
      employeeSummary: z.array(z.object({
        uid: z.string().describe('The user ID of the employee.'),
        name: z.string().describe('The name of the employee.'),
        profileID: z.string().describe('The profile ID of the employee.'),
        skills: z.array(z.string()).describe('The skills of the employee.'),
        currentLoad: z.number().describe('The current workload of the employee (0-10).'),
        availability: z.enum(['high', 'medium', 'low']).describe('The availability of the employee.'),
      })).describe('A summary of employees and their skills.'),
      recentTaskActivity: z.array(z.object({
        taskId: z.string().describe('The ID of the task.'),
        status: z.enum(['pending', 'inProgress', 'review', 'completed']).describe('The status of the task.'),
        assigneeId: z.string().optional().describe('The ID of the employee assigned to the task, if any.'),
        priority: z.enum(['low', 'medium', 'high']).optional().describe('The priority of the task.'),
        deadline: z.string().optional().describe('The deadline of the task in ISO format, if any.'),
        projectId: z.string().optional().describe('The ID of the project the task belongs to, if any.'),
        type: z.enum(['development', 'review', 'deployment', 'bugfix']).optional().describe('The type of the task, if any.'),
        completedAt: z.string().optional().describe('The completion timestamp of the task in ISO format, if any.'),
      })).describe('A summary of recent task activity.'),
    }),
  },
  output: {
    schema: z.object({
      priorityFocus: z.array(z.object({
        taskId: z.string().describe('The ID of the task.'),
        taskName: z.string().describe('The name of the task.'),
        assigneeName: z.string().describe('The name of the assignee.'),
        priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
        type: z.enum(['development', 'review', 'deployment', 'bugfix']).describe('The type of the task.'),
      })).describe('A list of the top 5 tasks that require immediate attention.'),
    }),
  },
  prompt: `You are an AI assistant embedded within the TaskMatrix AI admin panel.
Your purpose is to help the Administrator manage tasks efficiently.

Based on the CURRENT system state (provided in the input), identify and list the top 5 tasks that require immediate attention.
Prioritize tasks based on the following criteria, in order of importance:

1.  Review tasks nearing project deadlines.
2.  Deployment tasks scheduled soon.
3.  High-priority (priority: 'high') tasks that are blocked or overdue.

For each of the top 5 tasks, include the taskName, taskId, assigneeName, priority, and type.

Return ONLY a valid JSON object containing the key priorityFocus.

Here is the current system state:

Pending Tasks: {{{JSON.stringify pendingTasks}}}
Employee Summary: {{{JSON.stringify employeeSummary}}}
Recent Task Activity: {{{JSON.stringify recentTaskActivity}}}
`,
});

const prioritizeTasksFlow = ai.defineFlow<
  typeof PrioritizeTasksInputSchema,
  typeof PrioritizeTasksOutputSchema
>({
  name: 'prioritizeTasksFlow',
  inputSchema: PrioritizeTasksInputSchema,
  outputSchema: PrioritizeTasksOutputSchema,
}, async input => {
  // Get a map of employee IDs to employee names
  const employeeIdToNameMap = input.employeeSummary.reduce((map, employee) => {
    map[employee.uid] = employee.name;
    return map;
  }, {} as Record<string, string>);

  const {output} = await prompt({
    ...input,
  });

  // After getting the output, map the assigneeIds to assigneeNames
  output!.priorityFocus = output!.priorityFocus.map(task => ({
    ...task,
    assigneeName: employeeIdToNameMap[task.assigneeName] || 'Unassigned',
  }));

  return output!;
});
