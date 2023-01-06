export function initOnce<E>(k: string, init: () => E): [E, boolean] {
  // these values can survive esbuild rebuilds, returns true if value was cached
  const globalKey = `__${k}__`;
  if (process.env.NODE_ENV === "production") {
    return [init(), false];
  } else {
    // @ts-ignore
    if (!global[globalKey] && !process.env.BYPASS_CACHE) {
      // @ts-ignore
      global[globalKey] = init();
      // @ts-ignore
      return [global[globalKey], false];
    }
    // @ts-ignore
    return [global[globalKey], true];
  }
}

export function runOnce(name: string, f: () => void) {
  // eslint-disable-next-line
  const [_, cached] = initOnce(name, () => 1);
  if (!cached) {
    console.debug(`run function ${name} once`);
    f();
  }
}

export function profileMicroseconds<A>(name: string, f: () => A): A {
  const startTime = process.hrtime();
  const result = f();
  const endTime = process.hrtime();
  console.debug(
    `ran ${name} in ${
      endTime[0] * 1000000 +
      endTime[1] / 1000 -
      startTime[0] * 1000000 +
      startTime[1] / 1000
    } microseconds`
  );
  return result;
}
