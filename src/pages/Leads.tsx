import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/hooks/useLeads';
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  Target,
  ChevronDown,
  Eye,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { toast } from 'sonner';
import { LeadDetailsDialog } from '@/components/leads/LeadDetailsDialog';

export default function Leads() {
  const { leads, loading } = useLeads();
  const [search, setSearch] = useState('');

  // ✅ modal state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredLeads = leads.filter(lead => {
    const searchLower = search.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone?.includes(search) ||
      lead.goal?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Goal', 'Date'];
    const rows = leads.map(lead => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.goal || '',
      new Date(lead.created_at!).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Leads exported successfully');
  };

  return (
    <DashboardLayout title="Leads">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter(l => l.email).length}</p>
                <p className="text-xs text-muted-foreground">With Email</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter(l => l.phone).length}</p>
                <p className="text-xs text-muted-foreground">With Phone</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => {
                    const date = new Date(l.created_at!);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Manage and export your captured leads</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {search ? 'No leads found' : 'No leads yet'}
                </p>
                <p className="text-sm">
                  {search ? 'Try adjusting your search' : 'Share your chatbot to start collecting leads'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                              {lead.name?.charAt(0).toUpperCase() || 'L'}
                            </div>
                            <span className="font-medium">{lead.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="hover:underline">
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <a href={`tel:${lead.phone}`} className="hover:underline">
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.goal && (
                            <Badge variant="secondary" className="font-normal">
                              <Target className="w-3 h-3 mr-1" />
                              {lead.goal}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(lead.created_at!).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* ✅ NEW: View details */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLeadId(lead.id);
                                  setDetailsOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View details
                              </DropdownMenuItem>

                              {lead.email && (
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${lead.email}`}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Email
                                  </a>
                                </DropdownMenuItem>
                              )}
                              {lead.phone && (
                                <DropdownMenuItem asChild>
                                  <a href={`tel:${lead.phone}`}>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call
                                  </a>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ NEW: Dialog */}
        <LeadDetailsDialog
          leadId={selectedLeadId}
          open={detailsOpen}
          onOpenChange={(open) => {
            setDetailsOpen(open);
            if (!open) setSelectedLeadId(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
