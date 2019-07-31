import setCurdModel, { config, ConfigOptions, ModelConfig } from "./curd";

export interface CurdModel {
  curdModelConfig: (options: ConfigOptions) => void;
  setCurdModel: (namespace: string, config: ModelConfig) => any;
}

export const curdModel: CurdModel = {
  curdModelConfig: config,
  setCurdModel,
};
