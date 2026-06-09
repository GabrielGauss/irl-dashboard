import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Changing this key resets the boundary (e.g. on tab switch). */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/** Catches render-time errors in a view so the rest of the console keeps working. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-danger/30 bg-danger/[0.06] p-8 text-center">
          <h3 className="text-[15px] font-semibold text-danger">This view crashed</h3>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            A rendering error was isolated here. Other tabs are unaffected.
          </p>
          <code className="mt-3 inline-block max-w-full overflow-auto rounded border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink-dim">
            {this.state.error.message}
          </code>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="rounded-md border border-line-bright px-3.5 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-accent/50 hover:text-ink"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
