import { Component } from 'react';

/**
 * @component
 * Catches render errors and shows a recoverable fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div
          role="alert"
          className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center"
        >
          <h1 className="text-xl font-semibold text-slate-900">Something unexpected happened</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please refresh the page or try again. Your wellbeing matters — this hiccup is on us, not you.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 rounded-xl bg-wellness-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wellness-700 focus:outline-none focus:ring-2 focus:ring-wellness-500"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
