import fs from 'fs/promises';
import path from 'path';

export class JsonStore<T> {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  private async withLock<R>(operation: () => Promise<R>): Promise<R> {
    const result = this.queue.then(() => operation());
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async readUnsafe(): Promise<T> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [] as T;
      }
      throw error;
    }
  }

  private async writeUnsafe(data: T): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }

  async read(): Promise<T> {
    return this.withLock(() => this.readUnsafe());
  }

  async write(data: T): Promise<void> {
    return this.withLock(() => this.writeUnsafe(data));
  }

  async mutate<R>(fn: (data: T) => R | Promise<R>): Promise<R> {
    return this.withLock(async () => {
      const data = await this.readUnsafe();
      const result = await fn(data);
      await this.writeUnsafe(data);
      return result;
    });
  }

  async transaction<R>(fn: (data: T) => { next: T; result: R } | Promise<{ next: T; result: R }>): Promise<R> {
    return this.withLock(async () => {
      const data = await this.readUnsafe();
      const { next, result } = await fn(data);
      await this.writeUnsafe(next);
      return result;
    });
  }
}
