import { LoadResult, PartialResolvedId, SourceDescription } from "rollup";
import { ViteDevServer } from "./server";

export type ServerHook = (
  server: ViteDevServer
) => (() => void) | void | Promise<(() => void) | void>;

// 只实现以下这几个钩子
export interface Plugin {
  name: string;
  configureServer?: ServerHook;
  resolveId?: (
    id: string,
    importer?: string
  ) => Promise<PartialResolvedId | null> | PartialResolvedId | null;
  load?: (id: string) => Promise<LoadResult | null> | LoadResult | null;
  transform?: (
    code: string,
    id: string
  ) => Promise<SourceDescription | null> | SourceDescription | null;
  transformIndexHtml?: (raw: string) => Promise<string> | string;
}
