// ES6 Proxy based Mock Supabase Client to prevent crashes when URL/Key are missing
const makeMockProxy = (isPromise = false): any => {
  const proxyFn = (...args: any[]) => {
    return makeMockProxy(true);
  };

  return new Proxy(proxyFn, {
    get(target, prop) {
      if (prop === "then") {
        if (isPromise) {
          return (resolve: any) => {
            resolve({ data: { user: null, session: null }, error: null });
          };
        }
        return undefined;
      }
      if (prop === "onAuthStateChange") {
        return () => ({
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        });
      }
      return makeMockProxy(false);
    }
  });
};

export function createMockSupabaseClient() {
  return makeMockProxy(false);
}

