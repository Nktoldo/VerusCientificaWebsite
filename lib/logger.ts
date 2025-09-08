/**
 * Sistema de logging condicional para produção
 * Remove logs desnecessários em produção e mantém apenas erros críticos
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // Em desenvolvimento: log tudo
    if (this.isDevelopment) return true;
    
    // Em produção: apenas erros e warnings
    return level === 'error' || level === 'warn';
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, data);
    
    // No cliente, usar console
    if (this.isClient) {
      switch (level) {
        case 'error':
          console.error(`[${logEntry.timestamp}] ${message}`, data);
          break;
        case 'warn':
          console.warn(`[${logEntry.timestamp}] ${message}`, data);
          break;
        case 'info':
          console.info(`[${logEntry.timestamp}] ${message}`, data);
          break;
        case 'debug':
          console.debug(`[${logEntry.timestamp}] ${message}`, data);
          break;
      }
    } else {
      // No servidor, usar console também (pode ser integrado com serviços de logging)
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any): void {
    this.log('error', message, error);
    
    // Em produção, enviar erros críticos para serviço de monitoramento
    if (!this.isDevelopment && this.isClient) {
      // Aqui você pode integrar com Sentry, LogRocket, etc.
      // window.Sentry?.captureException(error);
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  // Método para performance (apenas em desenvolvimento)
  performance(label: string, startTime: number): void {
    if (this.isDevelopment) {
      const duration = performance.now() - startTime;
      this.debug(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    }
  }
}

// Exportar instância singleton
export const logger = new Logger();

// Exportar tipos para uso em outros arquivos
export type { LogLevel, LogEntry };
