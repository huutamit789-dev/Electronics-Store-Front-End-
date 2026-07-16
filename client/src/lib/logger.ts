/**
 * Frontend Logger Utility
 * Logs user actions and API calls to console for debugging
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface LogContext {
  action: string;
  details?: any;
  timestamp?: string;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = this.formatTimestamp();
    const emoji = this.getEmoji(level);
    
    console.log(`${emoji} [${timestamp}] ${message}`);
    
    if (context && context.details) {
      console.log('  Details:', context.details);
    }
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  success(message: string, context?: LogContext) {
    this.log('success', message, context);
  }

  warning(message: string, context?: LogContext) {
    this.log('warning', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  // Specific user action loggers
  logNavigation(page: string, params?: any) {
    this.info('NAVIGATE', {
      action: 'navigate',
      details: { page, params }
    });
  }

  logLogin(username: string, success: boolean) {
    if (success) {
      this.success('LOGIN', {
        action: 'login',
        details: { username }
      });
    } else {
      this.error('LOGIN FAILED', {
        action: 'login',
        details: { username }
      });
    }
  }

  logLogout(username: string) {
    this.info('LOGOUT', {
      action: 'logout',
      details: { username }
    });
  }

  logAddToCart(productId: string, productName: string, quantity: number) {
    this.success('ADD TO CART', {
      action: 'add_to_cart',
      details: { productId, productName, quantity }
    });
  }

  logRemoveFromCart(productId: string, productName: string) {
    this.info('REMOVE FROM CART', {
      action: 'remove_from_cart',
      details: { productId, productName }
    });
  }

  logCreateOrder(orderId: string, total: number, itemCount: number) {
    this.success('ORDER CREATED', {
      action: 'create_order',
      details: { orderId, total, itemCount }
    });
  }

  logApiCall(method: string, url: string, data?: any) {
    this.info('API CALL', {
      action: 'api_request',
      details: { method, url }
    });
  }

  logApiError(method: string, url: string, error: any) {
    this.error('API ERROR', {
      action: 'api_error',
      details: { method, url, error: error.message || error }
    });
  }
}

export const logger = new Logger();
