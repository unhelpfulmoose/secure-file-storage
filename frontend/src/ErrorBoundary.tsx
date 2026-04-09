// Catches unhandled errors anywhere in the component tree and shows a fallback UI
// instead of a blank/broken page. React requires this to be a class component.

import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ marginBottom: '1rem' }}>An unexpected error occurred.</p>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
