declare module "vue-router" {
  import type { App, Plugin } from "vue";

  export type RouteRecordRaw = {
    path: string;
    name?: string;
    component?: unknown;
    children?: RouteRecordRaw[];
    meta?: RouteMeta;
    [key: string]: unknown;
  };

  export interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    requiredRole?: number;
    [key: string]: unknown;
  }

  export type RouteLocationRaw =
    | string
    | {
        path?: string;
        name?: string;
        fullPath?: string;
        [key: string]: unknown;
      };

  export type RouteLocationNormalized = {
    path: string;
    fullPath: string;
    name?: string;
    meta?: RouteMeta;
    [key: string]: unknown;
  };

  export type NavigationGuardNext = (
    to?: RouteLocationRaw | false | void
  ) => void;

  export interface Router {
    install: (app: App) => void;
    push(to: RouteLocationRaw): unknown;
    beforeEach(
      guard: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ) => unknown
    ): () => void;
    afterEach(
      guard: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        failure?: Error
      ) => unknown
    ): () => void;
  }

  export function createWebHistory(base?: string): unknown;
  export function createRouter(options: {
    history: unknown;
    routes: RouteRecordRaw[];
  }): Router & Plugin;
  export function useRouter(): Router;
  export function useRoute(): RouteLocationNormalized & {
    query: Record<string, string | string[] | undefined>;
    params: Record<string, string | string[] | undefined>;
  };
}
