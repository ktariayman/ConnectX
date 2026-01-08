export class SchedulerService {
 private timers: Map<string, NodeJS.Timeout> = new Map();

 schedule(key: string, durationMs: number, callback: () => void | Promise<void>) {
  this.cancelLastScheduled(key);

  const timeout = setTimeout(async () => {
   try {
    await callback();
   } catch (error) {
    console.error(`[Scheduler] Error in callback for key ${key}:`, error);
   } finally {
    this.timers.delete(key);
   }
  }, durationMs);

  this.timers.set(key, timeout);
 }

 cancelLastScheduled(key: string) {
  const timeout = this.timers.get(key);
  if (timeout) {
   clearTimeout(timeout);
   this.timers.delete(key);
  }
 }

 has(key: string): boolean {
  return this.timers.has(key);
 }
}
