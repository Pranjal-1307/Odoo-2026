import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6">
          <div className="max-w-xl w-full text-center bg-white p-10 rounded-3xl shadow-xl border border-surface-200 animate-fade-in">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-surface-900">Application Error</h2>
            <p className="mt-2 text-surface-500">
              An unexpected error occurred in the front-end application interface stream.
            </p>

            {this.state.error && (
              <div className="mt-4 p-4 bg-surface-900 text-red-400 rounded-xl text-left font-mono text-xs overflow-x-auto max-h-40 leading-relaxed">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-1/2 py-3 px-4 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-bold transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="w-1/2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition cursor-pointer shadow-lg shadow-brand-500/10"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
