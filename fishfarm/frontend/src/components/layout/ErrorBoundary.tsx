import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          padding: '24px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '16px' }}>Oops, something went wrong.</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              We're sorry, an unexpected error occurred. You can try refreshing the page or going back to the dashboard.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px', background: '#1e293b', padding: '12px', borderRadius: '8px', wordBreak: 'break-all' }}>
              {this.state.error?.message}
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
