
'use client';

import React, {useEffect, useState} from 'react';
import {generateInsights} from '@/ai/flows/generate-insights';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

interface InsightsData {
    workloadAnalysis?: {
        underloaded?: { name: string; profileID: string }[];
        overloaded?: { name: string; profileID: string; activeHighPriority?: number }[];
    };
    taskSuggestions?: {
        taskId: string;
        taskName: string;
        suggestions?: { name: string; profileID: string; justification: string }[];
    }[];
    graphData?: {
        taskCompletionLine?: { date: string; completedTasks: number }[];
        employeeLoadScale?: { employeeName: string; profileID: string; pending: number; inProgress: number; completed: number }[];
    };
    priorityFocus?: {
        taskId: string;
        taskName: string;
        assigneeName: string;
        priority: string;
        type: string;
    }[];
}

const InsightsPage = () => {
    const [insights, setInsights] = useState<InsightsData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            // Mock data - replace with actual data fetching
            const mockPendingTasks = [
                {taskId: 'T-101', taskName: 'Setup CI/CD Pipeline', estimatedHours: 12, requiredSkills: ['DevOps', 'Firebase Functions', 'GitHub Actions'], priority: 'high', projectId: 'P-001'},
                {taskId: 'T-102', taskName: 'Review Login UI Code', estimatedHours: 3, requiredSkills: ['React', 'Next.js', 'Tailwind CSS'], priority: 'medium', projectId: 'P-002'}
            ];
            const mockEmployeeSummary = [
                {uid: 'uid1', name: 'Alice', profileID: 'EMP-001', skills: ['React', 'Next.js', 'Firebase'], currentLoad: 4, availability: 'medium'},
                {uid: 'uid2', name: 'Bob', profileID: 'EMP-002', skills: ['Python', 'DevOps', 'Firebase Functions', 'GitHub Actions'], currentLoad: 9, availability: 'low'},
                {uid: 'uid3', name: 'Charlie', profileID: 'EMP-003', skills: ['React', 'Tailwind CSS', 'Node.js'], currentLoad: 2, availability: 'high'}
            ];
            const mockRecentTaskActivity = [
              { taskId: 'T-001', status: 'completed', assigneeId: 'uid1', priority: 'high', type: 'development' },
              { taskId: 'T-002', status: 'inProgress', assigneeId: 'uid2', priority: 'medium', type: 'review' },
              { taskId: 'T-003', status: 'pending', assigneeId: 'uid3', priority: 'low', type: 'bugfix' },
            ];

            try {
                const insightsData = await generateInsights({
                    pendingTasks: mockPendingTasks,
                    employeeSummary: mockEmployeeSummary,
                    recentTaskActivity: mockRecentTaskActivity,
                });
                setInsights(insightsData);
            } catch (error) {
                console.error('Error fetching insights:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) {
        return <div>Loading insights...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold">AI-Powered Insights</h1>

            {/* Workload Analysis */}
            <section className="mt-4">
                <h2 className="text-xl font-semibold">Workload Analysis</h2>
                <div className="flex gap-4">
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Underloaded Employees</CardTitle>
                            <CardDescription>Employees with low workload.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {insights.workloadAnalysis?.underloaded && insights.workloadAnalysis.underloaded.length > 0 ? (
                                <ul>
                                    {insights.workloadAnalysis.underloaded.map((employee) => (
                                        <li key={employee.profileID}>{employee.name} ({employee.profileID})</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No underloaded employees.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Overloaded Employees</CardTitle>
                            <CardDescription>Employees with high workload.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {insights.workloadAnalysis?.overloaded && insights.workloadAnalysis.overloaded.length > 0 ? (
                                <ul>
                                    {insights.workloadAnalysis.overloaded.map((employee) => (
                                        <li key={employee.profileID}>{employee.name} ({employee.profileID}) - {employee.activeHighPriority} High Priority Tasks</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No overloaded employees.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Task Assignment Suggestions */}
            <section className="mt-4">
                <h2 className="text-xl font-semibold">Task Assignment Suggestions</h2>
                {insights.taskSuggestions && insights.taskSuggestions.length > 0 ? (
                    insights.taskSuggestions.map((task) => (
                        <Card key={task.taskId} className="mb-4">
                            <CardHeader>
                                <CardTitle>{task.taskName}</CardTitle>
                                <CardDescription>Suggestions for task {task.taskId}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {task.suggestions && task.suggestions.length > 0 ? (
                                    <ul>
                                        {task.suggestions.map((suggestion) => (
                                            <li key={suggestion.profileID}>
                                                {suggestion.name} ({suggestion.profileID}) - {suggestion.justification}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No suggestions for this task.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p>No task assignment suggestions.</p>
                )}
            </section>

            {/* Graph Data */}
            <section className="mt-4">
                <h2 className="text-xl font-semibold">Graph Data</h2>
                <div className="flex gap-4">
                    {/* Task Completion Line Graph */}
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Task Completion Line Graph</CardTitle>
                            <CardDescription>Tasks completed over time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {insights.graphData?.taskCompletionLine && insights.graphData.taskCompletionLine.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={insights.graphData.taskCompletionLine}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Legend/>
                                        <Line type="monotone" dataKey="completedTasks" stroke="#8884d8"/>
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>No task completion data available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Employee Load Scale Graph */}
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Employee Load Scale Graph</CardTitle>
                            <CardDescription>Workload distribution across employees.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {insights.graphData?.employeeLoadScale && insights.graphData.employeeLoadScale.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={insights.graphData.employeeLoadScale}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="employeeName"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Legend/>
                                        <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending"/>
                                        <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress"/>
                                        <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>No employee load data available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Priority Focus */}
            <section className="mt-4">
                <h2 className="text-xl font-semibold">Priority Focus</h2>
                {insights.priorityFocus && insights.priorityFocus.length > 0 ? (
                    <Table>
                        <TableCaption>Tasks requiring immediate attention.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {insights.priorityFocus.map((task) => (
                                <TableRow key={task.taskId}>
                                    <TableCell>{task.taskName}</TableCell>
                                    <TableCell>{task.assigneeName}</TableCell>
                                    <TableCell><Badge>{task.priority}</Badge></TableCell>
                                    <TableCell>{task.type}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p>No tasks requiring immediate attention.</p>
                )}
            </section>
        </div>
    );
};

export default InsightsPage;
