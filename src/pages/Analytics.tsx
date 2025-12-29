import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useMemo } from 'react';

export default function Analytics() {
  const { leads } = useLeads();

  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.created_at!);
        return leadDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({ name: dateStr, leads: count });
    }
    return last7Days;
  }, [leads]);

  const goalData = useMemo(() => {
    const goals: Record<string, number> = {};
    leads.forEach(lead => {
      const goal = lead.goal || 'Other';
      goals[goal] = (goals[goal] || 0) + 1;
    });
    return Object.entries(goals).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const stats = [
    {
      title: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'This Week',
      value: leads.filter(l => {
        const date = new Date(l.created_at!);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Today',
      value: leads.filter(l => {
        const date = new Date(l.created_at!);
        return date.toDateString() === new Date().toDateString();
      }).length,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Avg/Day',
      value: leads.length > 0 
        ? (leads.length / 7).toFixed(1)
        : '0',
      icon: BarChart3,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leads Over Time</CardTitle>
              <CardDescription>New leads captured in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads by Goal</CardTitle>
              <CardDescription>Distribution of lead goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {goalData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>No goal data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--accent))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}