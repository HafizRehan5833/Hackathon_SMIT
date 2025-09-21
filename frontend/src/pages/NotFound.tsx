import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center neon-border gradient-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-primary glow-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-primary glow-secondary">
            404
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="space-y-2">
            <Button 
              asChild
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-secondary hover:glow-primary transition-glow"
            >
              <Link to="/login">
                <Home className="h-4 w-4 mr-2" />
                Return to Login
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
            >
              <Link to="/student/chat">
                Go to Student Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
