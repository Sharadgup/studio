'use server';
/**
 * @fileOverview Task assignment suggestion flow.
 *
 * - suggestTaskAssignments - A function that suggests the best-suited employees for a task.
 * - SuggestTaskAssignmentsInput - The input type for the suggestTaskAssignments function.
 * - SuggestTaskAssignmentsOutput - The return type for the suggestTaskAssignments function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestTaskAssignmentsInputSchema = z.object({
  taskId: z.string().describe('The ID of the task to assign.'),
  taskName: z.string().describe('The name of the task to assign.'),
  estimatedHours: z.number().describe('The estimated hours required for the task.'),
  requiredSkills: z.array(z.string()).describe('The required skills for the task.'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority of the task.'),
  projectId: z.string().describe('The ID of the project the task belongs to.'),
  employeeSummary: z.array(z.object({
    uid: z.string().describe('The user ID of the employee.'),
    name: z.string().describe('The name of the employee.'),
    profileID: z.string().describe('The profile ID of the employee.'),
    skills: z.array(z.string()).describe('The skills of the employee.'),
    currentLoad: z.number().describe('The current workload of the employee (0-10).'),
    availability: z.enum(['high', 'medium', 'low']).describe('The availability of the employee.'),
  })).describe('A summary of all employees, including their skills, workload, and availability.'),
});

export type SuggestTaskAssignmentsInput = z.infer<typeof SuggestTaskAssignmentsInputSchema>;

const SuggestTaskAssignmentsOutputSchema = z.array(z.object({
  name: z.string().describe('The name of the suggested employee.'),
  profileID: z.string().describe('The profile ID of the suggested employee.'),
  justification: z.string().describe('The justification for suggesting this employee.'),
}));

export type SuggestTaskAssignmentsOutput = z.infer<typeof SuggestTaskAssignmentsOutputSchema>;

export async function suggestTaskAssignments(input: SuggestTaskAssignmentsInput): Promise<SuggestTaskAssignmentsOutput> {
  return suggestTaskAssignmentsFlow(input);
}

const suggestTaskAssignmentsPrompt = ai.definePrompt({
  name: 'suggestTaskAssignmentsPrompt',
  input: {
    schema: SuggestTaskAssignmentsInputSchema,
  },
  output: {
    schema: z.array(z.object({
      name: z.string().describe('The name of the suggested employee.'),
      profileID: z.string().describe('The profile ID of the suggested employee.'),
      justification: z.string().describe('The justification for suggesting this employee.'),
    })),
  },
  prompt: `You are an AI assistant helping an admin to assign tasks to employees.
  Given the following task and employee information, suggest the top 2-3 best-suited employees for the task.

  Task:
  - Task ID: {{{taskId}}}
  - Task Name: {{{taskName}}}
  - Estimated Hours: {{{estimatedHours}}}
  - Required Skills: {{#each requiredSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Priority: {{{priority}}}
  - Project ID: {{{projectId}}}

  Employees:
  {{#each employeeSummary}}
  - Name: {{{name}}}
  - Profile ID: {{{profileID}}}
  - Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Current Load: {{{currentLoad}}}
  - Availability: {{{availability}}}
  {{/each}}

  Base suggestions on:
  - Matching requiredSkills with employee skills.
  - Employee availability and currentLoad.
  - (Optional Bonus) Experience with the related projectId.

  For each suggestion, provide the employee's name, profileID, and a brief justification (e.g., "Skills match, medium load").
  Format your response as a JSON array of objects with the following keys: name, profileID, justification.
`,
});

const suggestTaskAssignmentsFlow = ai.defineFlow<
  typeof SuggestTaskAssignmentsInputSchema,
  typeof SuggestTaskAssignmentsOutputSchema
>(
  {
    name: 'suggestTaskAssignmentsFlow',
    inputSchema: SuggestTaskAssignmentsInputSchema,
    outputSchema: SuggestTaskAssignmentsOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskAssignmentsPrompt(input);
    return output!;
  }
);
