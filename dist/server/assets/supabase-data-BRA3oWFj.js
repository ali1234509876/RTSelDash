import { S as Subscribable, o as pendingThenable, q as resolveEnabled, v as shallowEqualObjects, w as resolveStaleTime, x as noop, y as environmentManager, z as isValidTimeout, A as timeUntilStale, B as timeoutManager, C as focusManager, D as fetchState, E as replaceData, F as notifyManager, G as shouldThrowError, e as useQueryClient, a as useAuth, u as useI18n, g as useTheme, L as Link, s as supabase, d as useNavigate, c as currentPeriod } from "./router-C21oMGn1.js";
import { M as useRouter, r as reactExports, U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { c as createLucideIcon, a as cn, B as Button, L as Languages, S as Sun, M as Moon } from "./button-C5Miz1Tm.js";
function useLocation(opts) {
  const router = useRouter();
  {
    const location = router.stores.location.get();
    return location;
  }
}
var QueryObserver = class extends Subscribable {
  constructor(client, options) {
    super();
    this.options = options;
    this.#client = client;
    this.#selectError = null;
    this.#currentThenable = pendingThenable();
    this.bindMethods();
    this.setOptions(options);
  }
  #client;
  #currentQuery = void 0;
  #currentQueryInitialState = void 0;
  #currentResult = void 0;
  #currentResultState;
  #currentResultOptions;
  #currentThenable;
  #selectError;
  #selectFn;
  #selectResult;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #lastQueryWithDefinedData;
  #staleTimeoutId;
  #refetchIntervalId;
  #currentRefetchInterval;
  #trackedProps = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.#currentQuery, this.options)) {
        this.#executeFetch();
      } else {
        this.updateResult();
      }
      this.#updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = this.#currentQuery;
    this.options = this.#client.defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, this.#currentQuery) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    this.#updateQuery();
    this.#currentQuery.setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.#currentQuery,
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      this.#currentQuery,
      prevQuery,
      this.options,
      prevOptions
    )) {
      this.#executeFetch();
    }
    this.updateResult();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) {
      this.#updateStaleTimeout();
    }
    const nextRefetchInterval = this.#computeRefetchInterval();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) {
      this.#updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.#client.getQueryCache().build(this.#client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      this.#currentResult = result;
      this.#currentResultOptions = this.options;
      this.#currentResultState = this.#currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked?.(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && this.#currentThenable.status === "pending") {
            this.#currentThenable.reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    this.#trackedProps.add(key);
  }
  getCurrentQuery() {
    return this.#currentQuery;
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.#client.defaultQueryOptions(options);
    const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return this.#executeFetch({
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return this.#currentResult;
    });
  }
  #executeFetch(fetchOptions) {
    this.#updateQuery();
    let promise = this.#currentQuery.fetch(
      this.options,
      fetchOptions
    );
    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop);
    }
    return promise;
  }
  #updateStaleTimeout() {
    this.#clearStaleTimeout();
    const staleTime = resolveStaleTime(
      this.options.staleTime,
      this.#currentQuery
    );
    if (environmentManager.isServer() || this.#currentResult.isStale || !isValidTimeout(staleTime)) {
      return;
    }
    const time = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime);
    const timeout = time + 1;
    this.#staleTimeoutId = timeoutManager.setTimeout(() => {
      if (!this.#currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  #computeRefetchInterval() {
    return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
  }
  #updateRefetchInterval(nextInterval) {
    this.#clearRefetchInterval();
    this.#currentRefetchInterval = nextInterval;
    if (environmentManager.isServer() || resolveEnabled(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) {
      return;
    }
    this.#refetchIntervalId = timeoutManager.setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.#executeFetch();
      }
    }, this.#currentRefetchInterval);
  }
  #updateTimers() {
    this.#updateStaleTimeout();
    this.#updateRefetchInterval(this.#computeRefetchInterval());
  }
  #clearStaleTimeout() {
    if (this.#staleTimeoutId !== void 0) {
      timeoutManager.clearTimeout(this.#staleTimeoutId);
      this.#staleTimeoutId = void 0;
    }
  }
  #clearRefetchInterval() {
    if (this.#refetchIntervalId !== void 0) {
      timeoutManager.clearInterval(this.#refetchIntervalId);
      this.#refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.#currentQuery;
    const prevOptions = this.options;
    const prevResult = this.#currentResult;
    const prevResultState = this.#currentResultState;
    const prevResultOptions = this.#currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.#currentQueryInitialState;
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          this.#lastQueryWithDefinedData?.state.data,
          this.#lastQueryWithDefinedData
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult?.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) {
        data = this.#selectResult;
      } else {
        try {
          this.#selectFn = options.select;
          data = options.select(data);
          data = replaceData(prevResult?.data, data, options);
          this.#selectResult = data;
          this.#selectError = null;
        } catch (selectError) {
          this.#selectError = selectError;
        }
      }
    }
    if (this.#selectError) {
      error = this.#selectError;
      data = this.#selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: this.#currentThenable,
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = this.#currentThenable = nextResult.promise = pendingThenable();
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = this.#currentThenable;
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = this.#currentResult;
    const nextResult = this.createResult(this.#currentQuery, this.options);
    this.#currentResultState = this.#currentQuery.state;
    this.#currentResultOptions = this.options;
    if (this.#currentResultState.data !== void 0) {
      this.#lastQueryWithDefinedData = this.#currentQuery;
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.#currentResult = nextResult;
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? this.#trackedProps
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(this.#currentResult).some((key) => {
        const typedKey = key;
        const changed = this.#currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    this.#notify({ listeners: shouldNotifyListeners() });
  }
  #updateQuery() {
    const query = this.#client.getQueryCache().build(this.#client, this.options);
    if (query === this.#currentQuery) {
      return;
    }
    const prevQuery = this.#currentQuery;
    this.#currentQuery = query;
    this.#currentQueryInitialState = query.state;
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      this.#updateTimers();
    }
  }
  #notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.listeners) {
        this.listeners.forEach((listener) => {
          listener(this.#currentResult);
        });
      }
      this.#client.getQueryCache().notify({
        query: this.#currentQuery,
        type: "observerResultsUpdated"
      });
    });
  }
};
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query?.promise
    );
    promise?.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
const __iconNode$7 = [
  ["path", { d: "M10 12h4", key: "a56b0p" }],
  ["path", { d: "M10 8h4", key: "1sr2af" }],
  ["path", { d: "M14 21v-3a2 2 0 0 0-4 0v3", key: "1rgiei" }],
  [
    "path",
    {
      d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
      key: "secmi2"
    }
  ],
  ["path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", key: "16ra0t" }]
];
const Building2 = createLucideIcon("building-2", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$6);
const __iconNode$5 = [
  [
    "path",
    {
      d: "M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35",
      key: "17jvcc"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M14 19h6", key: "bvotb8" }],
  ["path", { d: "M17 16v6", key: "18yu1i" }]
];
const FilePlusCorner = createLucideIcon("file-plus-corner", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode$4);
const __iconNode$3 = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", key: "q3az6g" }
  ],
  ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }],
  ["path", { d: "M12 17.5v-11", key: "1jc1ny" }]
];
const Receipt = createLucideIcon("receipt", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
const NAV_ITEMS = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, roles: ["ceo", "dept_head", "accountant", "sales_rep"] },
  { to: "/transactions", labelKey: "nav.transactions", icon: Receipt, roles: ["ceo", "dept_head", "accountant", "sales_rep"] },
  { to: "/entry", labelKey: "nav.entry", icon: FilePlusCorner, roles: ["ceo", "dept_head", "accountant"] },
  { to: "/team", labelKey: "nav.team", icon: Users, roles: ["ceo", "dept_head"] },
  { to: "/departments", labelKey: "nav.departments", icon: Building2, roles: ["ceo"] },
  { to: "/audit", labelKey: "nav.audit", icon: History, roles: ["ceo", "dept_head", "accountant"] },
  { to: "/insights", labelKey: "nav.insights", icon: ChartColumn, roles: ["ceo", "dept_head", "accountant"] }
];
function AppShell({ children }) {
  const { profile, primaryRole, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const items = NAV_ITEMS.filter((i) => primaryRole && i.roles.includes(primaryRole));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-dvh bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-64 shrink-0 border-e border-sidebar-border bg-sidebar flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold tracking-tight text-gradient-primary", children: t("app.brand") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mt-0.5", children: t("app.tagline") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 px-3 space-y-1", children: items.map((item) => {
        const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: item.to,
            className: cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t(item.labelKey) })
            ]
          },
          item.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-sidebar-border space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-full bg-accent border border-border-strong flex items-center justify-center text-xs font-semibold text-foreground", children: (profile?.full_name ?? "·").slice(0, 2).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: profile?.full_name ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: primaryRole ? t(`role.${primaryRole}`) : "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "flex-1 h-8 text-xs",
              onClick: () => setLang(lang === "ar" ? "en" : "ar"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-3.5 me-1.5" }),
                lang === "ar" ? "EN" : "ع"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "flex-1 h-8 text-xs", onClick: toggle, children: [
            theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-3.5 me-1.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-3.5 me-1.5" }),
            theme === "dark" ? t("common.theme.light") : t("common.theme.dark")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-8 w-8 p-0",
              onClick: signOut,
              title: t("auth.signout"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-3.5" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-w-0 overflow-y-auto", children })
  ] });
}
const queryKeys = {
  transactions: (scope, userId) => ["transactions", scope, userId],
  transactionsAll: ["transactions"],
  departments: ["departments"],
  profiles: ["profiles"],
  profile: (id) => ["profile", id],
  auditByTx: (transactionId) => ["audit", "tx", transactionId],
  auditFeed: ["audit", "feed"]
};
function useRealtimeTransactions(enabled) {
  const qc = useQueryClient();
  reactExports.useEffect(() => {
    if (!enabled) return;
    const channel = supabase.channel("realtime:public:transactions").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "transactions" },
      () => {
        qc.invalidateQueries({ queryKey: queryKeys.transactionsAll });
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, qc]);
}
function ProtectedShell({
  children,
  allow
}) {
  const { user, loading, primaryRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  useRealtimeTransactions(!!user);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-dvh items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: t("common.loading") }) });
  }
  if (allow && !primaryRole) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-muted-foreground", children: t("common.loading") }) });
  }
  if (allow && primaryRole && !allow.includes(primaryRole)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center text-muted-foreground", children: [
      "⛔ ",
      t("common.error")
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children });
}
const KNOWN_ROLES = ["ceo", "dept_head", "accountant", "sales_rep"];
function isKnownRole(value) {
  return KNOWN_ROLES.includes(value);
}
async function getProfilesWithRoles(period = currentPeriod()) {
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
    { data: targets, error: targetsError }
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, department_id").order("full_name", { ascending: true }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("monthly_targets").select("user_id, amount").eq("period", period)
  ]);
  if (profilesError) throw profilesError;
  if (rolesError) throw rolesError;
  if (targetsError) throw targetsError;
  const targetByUser = new Map((targets ?? []).map((t) => [t.user_id, Number(t.amount)]));
  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    monthly_target: targetByUser.get(profile.id) ?? 0,
    department_id: profile.department_id ?? null,
    roles: (roles ?? []).filter((role) => role.user_id === profile.id).map((role) => role.role).filter(isKnownRole)
  }));
}
async function getProfile(id, period = currentPeriod()) {
  const [
    { data, error },
    { data: target, error: targetError }
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, department_id, phone, hired_at, is_active").eq("id", id).maybeSingle(),
    supabase.from("monthly_targets").select("amount").eq("user_id", id).eq("period", period).maybeSingle()
  ]);
  if (error) throw error;
  if (targetError) throw targetError;
  if (!data) return null;
  return {
    id: data.id,
    full_name: data.full_name,
    monthly_target: target ? Number(target.amount) : 0,
    department_id: data.department_id ?? null,
    phone: data.phone ?? null,
    hired_at: data.hired_at ?? null,
    is_active: data.is_active
  };
}
async function getMonthlyTargetsHistory(userId, periods) {
  if (periods.length === 0) return {};
  const { data, error } = await supabase.from("monthly_targets").select("period, amount").eq("user_id", userId).in("period", periods);
  if (error) throw error;
  const out = {};
  for (const row of data ?? []) out[row.period] = Number(row.amount);
  return out;
}
async function updateProfile(id, updates) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
  if (error) throw error;
}
async function setMonthlyTarget(userId, amount, period = currentPeriod()) {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const { error } = await supabase.from("monthly_targets").upsert(
    { user_id: userId, period, amount, set_by: session?.user.id ?? null },
    { onConflict: "user_id,period" }
  );
  if (error) throw error;
}
async function addTransaction(input) {
  const { error } = await supabase.from("transactions").insert(input);
  if (error) throw error;
}
async function softDeleteTransaction(id) {
  const { error } = await supabase.from("transactions").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
  if (error) throw error;
}
async function addDepartment(input) {
  const { error } = await supabase.from("departments").insert(input);
  if (error) throw error;
}
async function updateDepartment(id, updates) {
  const { error } = await supabase.from("departments").update(updates).eq("id", id);
  if (error) throw error;
}
async function setDepartmentHead(departmentId, headId) {
  const { error } = await supabase.from("departments").update({ head_id: headId }).eq("id", departmentId);
  if (error) throw error;
}
async function removeDepartment(id) {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
}
async function attachActorNames(rows) {
  const actorIds = Array.from(
    new Set(rows.map((r) => r.actor).filter((id) => !!id))
  );
  let nameById = /* @__PURE__ */ new Map();
  if (actorIds.length > 0) {
    const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", actorIds);
    if (error) throw error;
    nameById = new Map((data ?? []).map((p) => [p.id, p.full_name ?? null]));
  }
  return rows.map((r) => {
    const after = r.after_data;
    const before = r.before_data;
    return {
      ...r,
      actor_name: r.actor ? nameById.get(r.actor) ?? null : null,
      file_number: after?.file_number ?? before?.file_number ?? null
    };
  });
}
async function getTransactionAudit(transactionId) {
  const { data, error } = await supabase.from("transaction_audit").select("id, transaction_id, action, actor, changed_at, before_data, after_data").eq("transaction_id", transactionId).order("changed_at", { ascending: true });
  if (error) throw error;
  return attachActorNames(data ?? []);
}
async function getAuditFeed(limit = 200) {
  const { data, error } = await supabase.from("transaction_audit").select("id, transaction_id, action, actor, changed_at, before_data, after_data").order("changed_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return attachActorNames(data ?? []);
}
async function getWeeklyInsights() {
  const { data, error } = await supabase.from("transactions").select("amount, transaction_date").is("deleted_at", null).order("transaction_date", { ascending: true });
  if (error) throw error;
  const rows = data ?? [];
  const weeksByYear = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const date = new Date(row.transaction_date);
    const year = date.getFullYear();
    const weekNumber = getISOWeek(date);
    if (!weeksByYear.has(year)) {
      weeksByYear.set(year, /* @__PURE__ */ new Map());
    }
    const yearWeeks = weeksByYear.get(year);
    if (!yearWeeks.has(weekNumber)) {
      yearWeeks.set(weekNumber, { amount: 0, count: 0 });
    }
    const week = yearWeeks.get(weekNumber);
    week.amount += Number(row.amount);
    week.count += 1;
  }
  const insights = [];
  for (const [year, yearWeeks] of weeksByYear.entries()) {
    for (const [weekNumber, metrics] of yearWeeks.entries()) {
      const weekStart = getISOWeekStart(year, weekNumber);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      insights.push({
        weekNumber,
        year,
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        totalAmount: metrics.amount,
        transactionCount: metrics.count
      });
    }
  }
  insights.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNumber - a.weekNumber;
  });
  return insights;
}
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
  return weekNumber;
}
function getISOWeekStart(year, weekNumber) {
  const d = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}
async function getDailyMetrics(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const { data: txData, error: txError } = await supabase.from("transactions").select("amount, transaction_date, sales_rep_id").is("deleted_at", null).gte("transaction_date", weekStart.toISOString().split("T")[0]).lte("transaction_date", weekEnd.toISOString().split("T")[0]).order("transaction_date", { ascending: true });
  if (txError) throw txError;
  const txRows = txData ?? [];
  if (txRows.length === 0) return [];
  const empIds = [...new Set(txRows.map((t) => t.sales_rep_id))];
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, department_id, departments(name)").in("id", empIds);
  if (profilesError) throw profilesError;
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  const employeeMap = /* @__PURE__ */ new Map();
  for (const tx of txRows) {
    const empId = tx.sales_rep_id;
    const profile = profileMap.get(empId);
    const empName = profile?.full_name ?? "Unknown";
    const deptId = profile?.department_id ?? null;
    const deptName = profile?.departments?.name ?? null;
    const dateKey = tx.transaction_date.split("T")[0];
    const amount = Number(tx.amount);
    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        employeeId: empId,
        employeeName: empName,
        departmentId: deptId,
        departmentName: deptName,
        dailyTotals: {},
        weeklyTotal: 0
      });
    }
    const empRow = employeeMap.get(empId);
    empRow.dailyTotals[dateKey] = (empRow.dailyTotals[dateKey] || 0) + amount;
    empRow.weeklyTotal += amount;
  }
  return Array.from(employeeMap.values()).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
}
export {
  Building2 as B,
  History as H,
  ProtectedShell as P,
  useQuery as a,
  getWeeklyInsights as b,
  addTransaction as c,
  addDepartment as d,
  setDepartmentHead as e,
  updateDepartment as f,
  getDailyMetrics as g,
  getMonthlyTargetsHistory as h,
  softDeleteTransaction as i,
  getProfilesWithRoles as j,
  getProfile as k,
  getTransactionAudit as l,
  getAuditFeed as m,
  queryKeys as q,
  removeDepartment as r,
  setMonthlyTarget as s,
  updateProfile as u
};
