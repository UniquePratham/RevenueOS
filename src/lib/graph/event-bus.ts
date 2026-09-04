import { AuditEvent } from "../types/index";

export type EventCallback = (payload: any) => void | Promise<void>;

class EventBus {
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);

    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  async publish(event: string, payload: any): Promise<void> {
    const callbacks = this.subscribers.get(event);
    if (!callbacks || callbacks.size === 0) return;

    for (const cb of Array.from(callbacks)) {
      try {
        await cb(payload);
      } catch (err) {
        console.error(`[EventBus] Error handling event ${event}:`, err);
      }
    }
  }

  clear(): void {
    this.subscribers.clear();
  }
}

export const eventBus = new EventBus();
