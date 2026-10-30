/**
 * Local port of classic Hydrogen's `<Pagination>` (`@shopify/hydrogen@2026.4`, MIT).
 * Hydrogen 2026.10 no longer exports it. The port is near-literal so cursor URLs
 * (`?direction=next&cursor=...`), history-state page accumulation (infinite scroll,
 * load previous/more) and the render-prop API behave exactly as before.
 *
 * `useMemo` is kept on purpose (exception to the no-useMemo rule): `NextLink`/`PreviousLink`
 * are components created per render, and without a stable identity React would remount the
 * anchor on every render, resetting the infinite-scroll `useInView` ref.
 */
import { flattenConnection } from "@shopify/hydrogen";
import {
  createElement,
  type FC,
  type ForwardRefExoticComponent,
  forwardRef,
  type RefAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  type LinkProps,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router";

declare global {
  interface Window {
    __hydrogenHydrated?: boolean;
  }
}

type Maybe<T> = T | null;

type PageInfo = {
  startCursor?: Maybe<string>;
  endCursor?: Maybe<string>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type Connection<NodesType> =
  | { nodes: Array<NodesType>; pageInfo: PageInfo }
  | { edges: Array<{ node: NodesType }>; pageInfo: PageInfo };

type PaginationState<NodesType> = {
  pagination?: {
    [key: string]: {
      nodes: Array<NodesType>;
      pageInfo?: PageInfo | null;
    };
  };
};

type PaginationLink = ForwardRefExoticComponent<
  Omit<LinkProps, "to"> & RefAttributes<HTMLAnchorElement>
>;

interface PaginationInfo<NodesType> {
  /** The paginated array of nodes. You should map over and render this array. */
  nodes: Array<NodesType>;
  /** Navigates to the next page of paginated data (renders nothing when there is none). */
  NextLink: PaginationLink;
  /** Navigates to the previous page of paginated data (renders nothing when there is none). */
  PreviousLink: PaginationLink;
  /** The URL to the previous page of paginated data. */
  previousPageUrl: string;
  /** The URL to the next page of paginated data. */
  nextPageUrl: string;
  /** True if the cursor has next paginated data */
  hasNextPage: boolean;
  /** True if the cursor has previous paginated data */
  hasPreviousPage: boolean;
  /** True if we are in the process of fetching another page of data */
  isLoading: boolean;
  /** Pass as `<Link state>` to append the next page to the already-loaded nodes. */
  state: {
    nodes: Array<NodesType>;
    pageInfo: {
      endCursor: Maybe<string> | undefined;
      startCursor: Maybe<string> | undefined;
      hasPreviousPage: boolean;
    };
  };
}

type PaginationProps<NodesType> = {
  /** A paginated connection with `pageInfo` (`hasPreviousPage`, `hasNextPage`, `startCursor`, `endCursor`). */
  connection: Connection<NodesType>;
  /** A render prop that includes pagination data and helpers. */
  children: FC<PaginationInfo<NodesType>>;
  /** Avoids URL param conflicts when using multiple `Pagination` components on a single page. */
  namespace?: string;
};

export function Pagination<NodesType>({
  connection,
  children = () => {
    console.warn("<Pagination> requires children to work properly");
    return null;
  },
  namespace = "",
}: PaginationProps<NodesType>): ReturnType<FC> {
  const [isLoading, setIsLoading] = useState(false);
  const transition = useNavigation();
  const location = useLocation();

  // Reset loading state once the transition state is idle
  useEffect(() => {
    if (transition.state === "idle") {
      // oxlint-disable-next-line react/set-state-in-effect -- classic Hydrogen behavior
      setIsLoading(false);
    }
  }, [transition.state]);

  const {
    endCursor,
    hasNextPage,
    hasPreviousPage,
    nextPageUrl,
    nodes,
    previousPageUrl,
    startCursor,
  } = usePagination<NodesType>(connection, namespace);

  const state = useMemo(
    () => ({
      ...location.state,
      pagination: {
        ...location.state?.pagination,
        [namespace]: {
          pageInfo: { endCursor, hasPreviousPage, hasNextPage, startCursor },
          nodes,
        },
      },
    }),
    [
      endCursor,
      hasNextPage,
      hasPreviousPage,
      startCursor,
      nodes,
      namespace,
      location.state,
    ],
  );

  const NextLink = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        function PaginationNextLink(props, ref) {
          return hasNextPage
            ? createElement(Link, {
                preventScrollReset: true,
                ...props,
                to: nextPageUrl,
                state,
                replace: true,
                ref,
                onClick: () => setIsLoading(true),
              })
            : null;
        },
      ),
    [hasNextPage, nextPageUrl, state],
  );

  const PreviousLink = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        function PaginationPreviousLink(props, ref) {
          return hasPreviousPage
            ? createElement(Link, {
                preventScrollReset: true,
                ...props,
                to: previousPageUrl,
                state,
                replace: true,
                ref,
                onClick: () => setIsLoading(true),
              })
            : null;
        },
      ),
    [hasPreviousPage, previousPageUrl, state],
  );

  return children({
    state,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    nextPageUrl,
    nodes,
    previousPageUrl,
    NextLink,
    PreviousLink,
  });
}

function getParamsWithoutPagination(
  paramsString?: string,
  state?: PaginationState<unknown>,
) {
  const params = new URLSearchParams(paramsString);
  const activeNamespaces = Object.keys(state?.pagination || {});
  for (const namespace of activeNamespaces) {
    const namespacePrefix = namespace === "" ? "" : `${namespace}_`;
    params.delete(`${namespacePrefix}cursor`);
    params.delete(`${namespacePrefix}direction`);
  }
  return params.toString();
}

function makeError(prop: string): never {
  throw new Error(
    `The Pagination component requires \`${prop}\` to be a part of your query. See the guide on how to setup your query to include \`${prop}\`: https://shopify.dev/docs/custom-storefronts/hydrogen/data-fetching/pagination#setup-the-paginated-query`,
  );
}

/**
 * Cumulative pagination logic for a connection (classic `usePagination`).
 * Hydration is detected with the same `window.__hydrogenHydrated` flag as classic
 * Hydrogen, so the first client render matches the server render.
 */
function usePagination<NodesType>(
  connection: Connection<NodesType>,
  namespace = "",
) {
  if (!connection.pageInfo) {
    makeError("pageInfo");
  }
  if (typeof connection.pageInfo.startCursor === "undefined") {
    makeError("pageInfo.startCursor");
  }
  if (typeof connection.pageInfo.endCursor === "undefined") {
    makeError("pageInfo.endCursor");
  }
  if (typeof connection.pageInfo.hasNextPage === "undefined") {
    makeError("pageInfo.hasNextPage");
  }
  if (typeof connection.pageInfo.hasPreviousPage === "undefined") {
    makeError("pageInfo.hasPreviousPage");
  }

  const transition = useNavigation();
  const navigate = useNavigate();
  const { state, search, pathname } = useLocation() as {
    state?: PaginationState<NodesType>;
    search: string;
    pathname: string;
  };

  const cursorParam = namespace ? `${namespace}_cursor` : "cursor";
  const directionParam = namespace ? `${namespace}_direction` : "direction";
  const isPrevious =
    new URLSearchParams(search).get(directionParam) === "previous";

  const nodes = useMemo(() => {
    if (
      !globalThis?.window?.__hydrogenHydrated ||
      !state?.pagination?.[namespace]?.nodes
    ) {
      return flattenConnection(connection) as NodesType[];
    }
    if (isPrevious) {
      return [
        ...(flattenConnection(connection) as NodesType[]),
        ...(state.pagination[namespace].nodes || []),
      ];
    }
    return [
      ...(state.pagination[namespace].nodes || []),
      ...(flattenConnection(connection) as NodesType[]),
    ];
  }, [state, connection, namespace, isPrevious]);

  const currentPageInfo = useMemo(() => {
    const hydrogenHydrated = globalThis?.window?.__hydrogenHydrated;
    const stateInfo = state?.pagination?.[namespace]?.pageInfo;
    let pageStartCursor =
      !hydrogenHydrated || stateInfo?.startCursor === undefined
        ? connection.pageInfo.startCursor
        : stateInfo.startCursor;
    let pageEndCursor =
      !hydrogenHydrated || stateInfo?.endCursor === undefined
        ? connection.pageInfo.endCursor
        : stateInfo.endCursor;
    let previousPageExists =
      !hydrogenHydrated || stateInfo?.hasPreviousPage === undefined
        ? connection.pageInfo.hasPreviousPage
        : stateInfo.hasPreviousPage;
    let nextPageExists =
      !hydrogenHydrated || stateInfo?.hasNextPage === undefined
        ? connection.pageInfo.hasNextPage
        : stateInfo.hasNextPage;

    if (state?.pagination?.[namespace]?.nodes) {
      if (isPrevious) {
        pageStartCursor = connection.pageInfo.startCursor;
        previousPageExists = connection.pageInfo.hasPreviousPage;
      } else {
        pageEndCursor = connection.pageInfo.endCursor;
        nextPageExists = connection.pageInfo.hasNextPage;
      }
    }

    return {
      startCursor: pageStartCursor,
      endCursor: pageEndCursor,
      hasPreviousPage: previousPageExists,
      hasNextPage: nextPageExists,
    };
  }, [
    isPrevious,
    state,
    namespace,
    connection.pageInfo.hasNextPage,
    connection.pageInfo.hasPreviousPage,
    connection.pageInfo.startCursor,
    connection.pageInfo.endCursor,
  ]);

  // Keep track of the current URL state, to compare whenever the URL changes
  const urlRef = useRef({
    params: getParamsWithoutPagination(search, state),
    pathname,
  });

  useEffect(() => {
    window.__hydrogenHydrated = true;
  }, []);

  useEffect(() => {
    const currentParams = getParamsWithoutPagination(search, state);
    const pathChanged = pathname !== urlRef.current.pathname;
    const nonPaginationParamsChanged = currentParams !== urlRef.current.params;
    if (
      // Only clean up if the base URL or non-pagination params change
      (pathChanged || nonPaginationParamsChanged) &&
      // And we're not on the initial load
      !(transition.state === "idle" && !transition.location)
    ) {
      urlRef.current = { pathname, params: currentParams };
      navigate(`${pathname}?${currentParams}`, {
        replace: true,
        preventScrollReset: true,
        state: { nodes: undefined, pageInfo: undefined },
      });
    }
    // Classic Hydrogen runs this only when the URL or history state changes.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search, state]);

  const previousPageUrl = useMemo(() => {
    const params = new URLSearchParams(search);
    params.set(directionParam, "previous");
    if (currentPageInfo.startCursor) {
      params.set(cursorParam, currentPageInfo.startCursor);
    }
    return `?${params.toString()}`;
  }, [search, currentPageInfo.startCursor, cursorParam, directionParam]);

  const nextPageUrl = useMemo(() => {
    const params = new URLSearchParams(search);
    params.set(directionParam, "next");
    if (currentPageInfo.endCursor) {
      params.set(cursorParam, currentPageInfo.endCursor);
    }
    return `?${params.toString()}`;
  }, [search, currentPageInfo.endCursor, cursorParam, directionParam]);

  return { ...currentPageInfo, previousPageUrl, nextPageUrl, nodes };
}
