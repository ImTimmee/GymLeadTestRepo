import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useFlow } from '@/hooks/useFlow';
import { MessageSquare, Users, Eye, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { leads } = useLeads();
  const { flow } = useFlow();

  const stats = [
    { 
      title: 'Total Leads', 
      value: leads.length.toString(), 
      icon: Users, 
      color: 'bg-primary/10 text-primary',
      trend: '+12%'
    },
    { 
      title: 'This Week', 
      value: leads.filter(l => {
        const date = new Date(l.created_at!);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length.toString(), 
      icon: TrendingUp, 
      color: 'bg-accent/10 text-accent',
      trend: '+8%'
    },
    { 
      title: 'Flow Status', 
      value: flow?.is_published ? 'Live' : 'Draft', 
      icon: Eye, 
      color: flow?.is_published ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600',
    },
  ];

  const recentLeads = leads.slice(0, 5);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome card */}
        <Card className="gradient-hero text-primary-foreground border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-80">Welcome back</span>
                </div>
                <h2 className="text-2xl font-bold">Ready to capture more leads?</h2>
                <p className="text-primary-foreground/70 max-w-md">
                  Your chatbot is {flow?.is_published ? 'live and collecting leads.' : 'ready to be published.'}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/flow')}
                className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
              >
                {flow?.is_published ? 'Edit Flow' : 'Publish Now'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-green-600 font-medium">{stat.trend} from last week</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent leads */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Leads</CardTitle>
                <CardDescription>Latest captured leads from your chatbot</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No leads yet</p>
                  <p className="text-sm">Share your chatbot to start collecting leads</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {lead.name?.charAt(0).toUpperCase() || 'L'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lead.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground truncate">{lead.email || lead.phone || 'No contact'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at!).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your chatbot</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => navigate('/flow')}
              >
                <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Edit Chatbot Flow</p>
                  <p className="text-xs text-muted-foreground">Customize messages and questions</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => navigate('/settings')}
              >
                <Sparkles className="w-5 h-5 mr-3 text-accent" />
                <div className="text-left">
                  <p className="font-medium">Customize Branding</p>
                  <p className="text-xs text-muted-foreground">Update colors and business info</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}