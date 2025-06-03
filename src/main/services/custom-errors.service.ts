// Custom error classes
export class PathRequiredError extends Error {
  constructor() {
    super("Path is required");
    this.name = "PathRequiredError";
  }
}

export class PathDoesNotExistError extends Error {
  constructor(path: string) {
    super(`Path does not exist: ${path}`);
    this.name = "PathDoesNotExistError";
  }
}