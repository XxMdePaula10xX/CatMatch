import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Catches render/runtime errors so a single exception can't leave the whole
 * game on a blank white screen — shows a friendly recovery card instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Render error caught by ErrorBoundary', error, info);
  }

  private reload = () => {
    this.setState({ hasError: false });
    // Full reload is the safest recovery for a corrupted UI state.
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div className="panel center stack">
          <div style={{ fontSize: 48 }} aria-hidden>
            🙀
          </div>
          <h2 className="section-title" style={{ margin: 0 }}>
            Algo deu errado
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            Tivemos um probleminha. Seu progresso está salvo — é só recarregar.
          </p>
          <button className="btn" onClick={this.reload}>
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
