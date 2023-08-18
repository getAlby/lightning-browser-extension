export class PromiseQueue {
  private queue: Promise<unknown> = Promise.resolve(true);

  add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(operation).then(resolve).catch(reject);
    });
  }
}
