import { useState, useEffect } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/AdminSidebar';
import { analyticsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#00ff99', '#00cc7a', '#00995c', '#00663d'];

interface AnalyticsData {
  totalStudents: number;
  studentsByDepartment: Array<{ department: string; count: number }>;
  recentStudents: Array<{ name: string; email: string; department: string; createdAt: string }>;
  activeStudents: Array<{ date: string; count: number }>;
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch analytics from backend
      const [totalRes, deptRes, recentRes, activeRes] = await Promise.all([
        analyticsAPI.getTotalStudents(),
        analyticsAPI.getStudentsByDepartment(),
        analyticsAPI.getRecentStudents(),
        analyticsAPI.getActiveStudents(),
      ]);

      const analyticsData: AnalyticsData = {
        totalStudents: totalRes.data.total_students || 0,
        studentsByDepartment: deptRes.data.results || [],
        recentStudents: (recentRes.data.students || []).map((s: any) => ({
          name: s.name,
          email: s.email,
          department: s.department,
          createdAt: s.created_at || '',
        })),
        activeStudents: (activeRes.data.data || []).map((d: any) => ({
          date: d.date || '',
          count: d.count || 0,
        })),
      };
      setAnalyticsData(analyticsData);
      
      // Uncomment when backend is available:
      // const [totalStudents, studentsByDept, recentStudents, activeStudents] = await Promise.all([
      //   analyticsAPI.getTotalStudents(),
      //   analyticsAPI.getStudentsByDepartment(),
      //   analyticsAPI.getRecentStudents(),
      //   analyticsAPI.getActiveStudents(),
      // ]);
      // setAnalyticsData({
      //   totalStudents: totalStudents.data,
      //   studentsByDepartment: studentsByDept.data,
      //   recentStudents: recentStudents.data,
      //   activeStudents: activeStudents.data,
      // });
    } catch (error) {
      toast({
        title: "Error loading analytics",
        description: "Using demo data. Check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = () => {
    const threadId = uuidv4();
    navigate(`/student/chat?thread=${threadId}`);
  };

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary glow-primary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-background border-b border-primary/20 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-4 text-primary hover:bg-primary/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-primary glow-primary">
                University Portal
              </h1>
            </div>
            
            <Button
              onClick={handleNewThread}
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-secondary hover:glow-primary transition-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="neon-border gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary glow-secondary">
                  {analyticsData.totalStudents.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary glow-secondary">
                  {analyticsData.studentsByDepartment.length}
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary glow-secondary">
                  {analyticsData.recentStudents.length}
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary glow-secondary">
                  {analyticsData.activeStudents.reduce((sum, day) => sum + day.count, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart for Students by Department */}
            <Card className="neon-border gradient-card">
              <CardHeader>
                <CardTitle className="text-primary">Students by Department</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Number of students in each department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.studentsByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                    <XAxis dataKey="department" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--primary) / 0.3)',
                        borderRadius: '6px'
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))">
                      {analyticsData.studentsByDepartment.map((entry, index) => (
                        <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="neon-border gradient-card">
              <CardHeader>
                <CardTitle className="text-primary">Active Students (Last 7 Days)</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Daily active student count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.activeStudents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--primary) / 0.3)',
                        borderRadius: '6px'
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Students Table */}
          <Card className="neon-border gradient-card">
            <CardHeader>
              <CardTitle className="text-primary">Recently Onboarded Students</CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest student registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-3 px-4 text-primary">Name</th>
                      <th className="text-left py-3 px-4 text-primary">Email</th>
                      <th className="text-left py-3 px-4 text-primary">Department</th>
                      <th className="text-left py-3 px-4 text-primary">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recentStudents.map((student, index) => (
                      <tr key={index} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <td className="py-3 px-4 text-foreground">{student.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.department}</td>
                        <td className="py-3 px-4 text-muted-foreground">{student.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}