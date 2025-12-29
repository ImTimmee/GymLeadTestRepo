import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Sparkles, 
  ArrowRight, 
  Check,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { useEffect } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: MessageSquare,
      title: 'Custom Chatbot Flows',
      description: 'Design conversational experiences that capture leads naturally',
    },
    {
      icon: Users,
      title: 'Lead Management',
      description: 'View, search, and export all your captured leads in one place',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track performance and understand your lead generation metrics',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Get your chatbot live in minutes with our simple builder',
    },
    {
      icon: Shield,
      title: 'GDPR Compliant',
      description: 'Built-in consent management for data protection compliance',
    },
    {
      icon: Globe,
      title: 'Embeddable Widget',
      description: 'Share a link or embed on any website to capture leads 24/7',
    },
  ];

  const steps = [
    { step: '1', title: 'Create your flow', desc: 'Set up welcome messages and questions' },
    { step: '2', title: 'Customize branding', desc: 'Match your brand colors and style' },
    { step: '3', title: 'Publish & share', desc: 'Go live and start collecting leads' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">LeadBot</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
            </div>
          </nav>

          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Turn conversations into{' '}
              <span className="text-transparent bg-clip-text gradient-primary">customers</span>
            </h1>
            <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              Create custom chatbot flows that capture qualified leads and grow your business 24/7. 
              No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-primary text-lg px-8"
                onClick={() => navigate('/auth')}
              >
                Start for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get your lead-generating chatbot up and running in just three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features to help you capture more leads and grow your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to capture more leads?
            </h2>
            <p className="text-lg text-primary-foreground/70">
              Join thousands of businesses using LeadBot to grow their customer base.
            </p>
            <ul className="flex flex-wrap justify-center gap-6 text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Free to start
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                No credit card required
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Cancel anytime
              </li>
            </ul>
            <Button 
              size="lg" 
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">LeadBot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 LeadBot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}