// ES6 Proxy based Mock Supabase Client to prevent crashes when URL/Key are missing
const makeCallableProxy = (): any => {
  const proxyFn = (...args: any[]) => {
    return makeCallableProxy();
  };

  return new Proxy(proxyFn, {
    get(target, prop) {
      if (prop === "then") {
        return (resolve: any) => {
          resolve({ data: { user: null, session: null }, error: null });
        };
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
      return makeCallableProxy();
    }
  });
};

export function createMockSupabaseClient() {
  return makeCallableProxy();
}
