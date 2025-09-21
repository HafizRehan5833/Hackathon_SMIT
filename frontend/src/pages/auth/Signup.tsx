import { userAPI } from '@/lib/api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const departments = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Medicine',
  'Law',
  'Arts & Humanities',
  'Natural Sciences',
  'Social Sciences',
];

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name || !email || !password || !department) throw new Error('Please fill in all fields');
      const response = await userAPI.register(name, email, password);
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Account Created",
          description: "Welcome to University Portal! Please sign in.",
        });
        navigate('/login');
      } else {
        throw new Error(response.data?.message || 'Email already exists');
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error?.response?.data?.message || error?.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md neon-border gradient-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary glow-primary">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join the University Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neon-border bg-input text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neon-border bg-input text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neon-border bg-input text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-foreground">Department</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger className="neon-border bg-input text-foreground">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-primary/20">
                  {departments.map((dept) => (
                    <SelectItem 
                      key={dept} 
                      value={dept}
                      className="text-foreground hover:bg-primary/20 focus:bg-primary/20"
                    >
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-secondary hover:glow-primary transition-glow"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <div className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/90 hover:glow-secondary transition-glow"
              >
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;