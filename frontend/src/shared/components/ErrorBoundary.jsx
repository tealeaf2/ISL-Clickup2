/**
 * ErrorBoundary Component
 * 
 * A React error boundary component that catches JavaScript errors anywhere in
 * the child component tree, logs those errors, and displays a fallback UI instead
 * of the component tree that crashed.
 * 
 * Features:
 * - Catches errors during rendering, in lifecycle methods, and in constructors
 * - Displays user-friendly error message with recovery options
 * - Shows detailed error information in development mode
 * - Provides refresh and retry functionality
 * 
 * @fileoverview Error boundary component for catching and handling React errors
 */

import React from 'react';

/**
 * Error boundary component to catch JavaScript errors anywhere in the child component tree
 * 
 * @class ErrorBoundary
 * @extends {React.Component}
 * 
 * @property {React.ReactNode} children - Child components to wrap with error boundary
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  /**
   * Static method that updates state when an error is caught
   * 
   * @static
   * @param {Error} error - The error that was thrown
   * @returns {{hasError: boolean}} State update that triggers fallback UI
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs the error and error info for debugging purposes
   * 
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Object containing component stack trace information
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  /**
   * Renders the component tree or fallback UI if an error occurred
   * 
   * @returns {JSX.Element} Either the children (if no error) or error UI (if error caught)
   */
  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Something went wrong
                </h3>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              An error occurred while rendering the application. Please refresh the page to try again.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
