/**
 * components/ui/ErrorBoundary.jsx
 *
 * Class-based error boundary that catches rendering errors in the subtree.
 * Renders a user-friendly fallback UI with a "Try Again" button.
 */

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev, or to a monitoring service in production
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-xl">
          <div className="max-w-md text-center space-y-lg">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle size={36} className="text-error" />
            </div>
            <div>
              <h1 className="font-playfair text-headline-lg mb-sm">Something went wrong</h1>
              <p className="font-inter text-body-md text-on-surface-variant">
                An unexpected error occurred. Please refresh the page or try again.
              </p>
            </div>
            <div className="flex gap-md justify-center">
              <button
                onClick={this.handleReset}
                className="btn-ghost flex items-center gap-sm"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-surface-container-high p-md rounded-xl overflow-auto text-error max-h-48">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
