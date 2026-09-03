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
    console.error('[App ErrorBoundary caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isIframe = window.self !== window.top;

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            
            <h1 className="text-xl font-black mb-2 text-white">
              Uygulama Yüklenirken Bir Sorun Oluştu
            </h1>
            
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {isIframe
                ? "Tarayıcınızın güvenlik ayarları (üçüncü taraf çerez/depolama kısıtlamaları veya iframe izinleri) önizleme ekranını etkilemiş olabilir."
                : "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin."}
            </p>

            {this.state.error && (
              <div className="bg-slate-950/60 p-3 rounded-lg text-left text-[11px] font-mono text-red-300 mb-4 overflow-x-auto border border-red-900/40 max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Sayfayı Yenile
              </button>

              <a
                href={window.location.href}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-100 font-bold rounded-xl text-sm transition-all border border-slate-600 inline-block text-center cursor-pointer"
              >
                Yeni Sekmede Aç ↗
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
