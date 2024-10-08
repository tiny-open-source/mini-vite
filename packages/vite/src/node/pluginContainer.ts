import type {
  // LoadResult,
  // PartialResolvedId,
  // SourceDescription,
  PluginContext as RollupPluginContext,
  ResolvedId,
} from "rollup";
import { Plugin } from "./plugin";
import { PluginContainer } from "vite";

export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
  // @ts-ignore 这里仅实现上下文对象的 resolve 方法
  class Context implements RollupPluginContext {
    async resolve(id: string, importer?: string) {
      let out = await pluginContainer.resolveId(id, importer);
      if (typeof out === "string") out = { id: out };
      return out as ResolvedId | null;
    }
  }
  // 插件容器
  const pluginContainer = {
    async resolveId(id: string, importer?: string) {
      const ctx = new Context() as any;
      for (const plugin of plugins) {
        if (plugin.resolveId) {
          const newId = await plugin.resolveId.call(ctx as any, id, importer);
          if (newId) {
            id = typeof newId === "string" ? newId : newId.id;
            return { id };
          }
        }
      }
      return null;
    },
    async load(id: string) {
      const ctx = new Context() as any;
      for (const plugin of plugins) {
        if (plugin.load) {
          const result = await plugin.load.call(ctx, id);
          if (result) {
            return result;
          }
        }
      }
      return null;
    },
    async transform(code: string, id: string) {
      const ctx = new Context() as any;
      for (const plugin of plugins) {
        if (plugin.transform) {
          const result = await plugin.transform.call(ctx, code, id);
          if (!result) continue;
          if (typeof result === "string") {
            code = result;
          } else if (result.code) {
            code = result.code;
          }
        }
      }
      return { code };
    },
    options: {},
    async getModuleInfo(id: string) {},
    buildStart(options: any) {},
    async close() {},
  };

  return pluginContainer as any;
};
