import setCurdModel, { config, ConfigOptions, ModelConfig } from "./curd";

export interface CurdModel {
  config: (options: ConfigOptions) => void;
  set: (namespace: string, config: ModelConfig) => any;
}

export const curdModel: CurdModel = {
  config,
  set: setCurdModel,
};
