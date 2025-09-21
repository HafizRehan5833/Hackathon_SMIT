import { userAPI } from '@/lib/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) throw new Error('Please enter your email address');
      await userAPI.resetPassword(email);
      setEmailSent(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md neon-border gradient-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary glow-primary">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent password reset instructions to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Try Again
              </Button>
              <div className="pt-4">
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/90 text-sm hover:glow-secondary transition-glow"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md neon-border gradient-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary glow-primary">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email to receive reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neon-border bg-input text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-secondary hover:glow-primary transition-glow"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/90 text-sm hover:glow-secondary transition-glow"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;