import { userAPI } from '@/lib/api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) throw new Error('Please fill in all fields');
      const response = await userAPI.login(email, password);
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Login Successful",
          description: "Welcome to University Portal!",
        });
        // Always redirect to the specified admin dashboard URL after login
        window.location.href = 'http://192.168.18.94:8080/admin/dashboard';
      } else {
        throw new Error(response.data?.message || 'Email does not exist or password is incorrect');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.response?.data?.message || error?.message || "Please check your credentials and try again.",
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
            University Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neon-border bg-input text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-secondary hover:glow-primary transition-glow"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <Link 
              to="/reset-password" 
              className="text-primary hover:text-primary/90 text-sm hover:glow-secondary transition-glow"
            >
              Forgot your password?
            </Link>
            <div className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary hover:text-primary/90 hover:glow-secondary transition-glow"
              >
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;