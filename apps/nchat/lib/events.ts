type Listener = (...args: any[]) => void;

class SimpleEventEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }
}

// Create a new event emitter for chat events
export const chatEvents = new SimpleEventEmitter();

// Event types
export const CHAT_EVENTS = {
  REFRESH: 'chat:refresh',
  MESSAGE_SENT: 'chat:message_sent',
  MESSAGE_RECEIVED: 'chat:message_received',
  CONNECTION_CHANGED: 'chat:connection_changed'
} as const; 