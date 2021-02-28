export class GenericFactory<T, F extends (...args: Array<never>) => T> {
	public constructor(private readonly creatorFunc: F) {}

	public createInstance(...args: Parameters<F>) {
		return this.creatorFunc(...args);
	}
}
