export type Result<T, E> = {
  value?: T;
  error?: E;
  isError: () => boolean;
};

export function createResult<T, E>(value?: T, error?: E): Result<T, E> {
  return {
    value,
    error,
    isError: function() {
      return !!this.error;
    }
  };
}