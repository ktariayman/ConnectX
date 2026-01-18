import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center shadow-lg">
            <div className="mb-6">
              <span className="text-4xl">😵</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error.
            </p>
            
            {this.state.error && import.meta.env.DEV && (
               <div className="mb-6 p-4 bg-secondary/50 rounded text-left overflow-auto max-h-40 text-xs font-mono text-red-500">
                 {this.state.error.toString()}
               </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={this.handleHome}>
                Go Home
              </Button>
              <Button onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
