/*
 *
 * NewType
 *
 */

declare const brand: unique symbol;
export type NewType<T, B extends string> = T & { readonly [brand]: B };

/*
 *
 * Result
 *
 */

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/*
 *
 * Eff
 *
 */

export type Eff<T, E> = { run: () => Promise<Result<T, E>> };
