import setCurdModel, { methodConfig, ConfigOptions, ModelConfig } from "./curd";

export interface CurdModel {
  config: (options: ConfigOptions) => void;
  set: (namespace: string, config: ModelConfig) => any;
}

export const curdModel: CurdModel = {
  config: methodConfig,
  set: setCurdModel,
};

export { setLocale } from "./locale";
