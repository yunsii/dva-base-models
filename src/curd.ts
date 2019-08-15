import { message } from "antd";
import { Model, EffectsCommandMap } from "dva";
import { locale } from "./locale";

const callFunctionIfFunction = (func: Function) => (...args: any) => {
  if (typeof func === "function") {
    func(...args);
  }
};

let getTableList = (response: any) => ({
  list: [] as any,
  pagination: {},
});
let getData = (response: any) => {
  const { data } = response;
  return data || {};
};
let isResponseOk = (response: any) => {
  return response.status_code === 200;
};

export interface ConfigOptions {
  getTableList: (response: any) => any;
  getData: (response: any) => any;
  isResponseOk: (response: any) => boolean;
}

export function methodConfig(options: ConfigOptions) {
  if (options.getTableList !== undefined) {
    getTableList = options.getTableList;
  }
  if (options.getData !== undefined) {
    getData = options.getData;
  }
  if (options.isResponseOk !== undefined) {
    isResponseOk = options.isResponseOk;
  }
}

function* putGenerator(put: EffectsCommandMap["put"], actions: string[], extra: any = {}) {
  for (const actionName of actions) {
    yield put({
      type: actionName,
      ...extra,
    });
  }
}

function* afterResponse(response: any, coreFlow: Function, onError: Function, onComplete: Function) {
  if (isResponseOk(response)) {
    yield coreFlow();
  } else {
    callFunctionIfFunction(onError)(response);
  }
  callFunctionIfFunction(onComplete)(response);
}

export interface ModelConfig {
  fetchMethod?: Function;
  isolatedGetTableList?: Function;
  parallelFetchActions?: string[];
  afterFetchActions?: string[];

  detailMethod?: Function;
  isolatedGetData?: Function;
  parallelDetailActions?: string[];
  afterDetailActions?: string[];

  createMethod?: Function;
  afterCreateActions?: string[];

  updateMethod?: Function;
  afterUpdateActions?: string[];

  deleteMethod?: Function;
  afterDeleteActions?: string[];

  extraState?: Model["state"];
  extraEffects?: Model["effects"];
  extraReducers?: Model["reducers"];
}

export default (
  namespace: string,
  {
    fetchMethod,
    isolatedGetTableList,
    parallelFetchActions = [],
    afterFetchActions = [],

    detailMethod,
    isolatedGetData,
    parallelDetailActions = [],
    afterDetailActions = [],

    createMethod,
    afterCreateActions = [],

    updateMethod,
    afterUpdateActions = [],

    deleteMethod,
    afterDeleteActions = [],

    extraState = {},
    extraEffects = {},
    extraReducers = {},
  }: ModelConfig
) => ({
  namespace,

  state: {
    data: {
      list: [],
      pagination: {},
    },

    detail: {},

    ...extraState,
  },

  effects: {
    *fetch({ payload, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      yield putGenerator(put, parallelFetchActions, { payload });
      const response = yield call(fetchMethod, payload);
      const coreFlow = function* () {
        yield put({
          type: "_save",
          payload: isolatedGetTableList ? isolatedGetTableList(response) : getTableList(response),
        });
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterFetchActions);
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *detail({ id, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      yield putGenerator(put, parallelDetailActions, { id });
      const response = yield call(detailMethod, id);
      const coreFlow = function* () {
        yield put({
          type: "_saveDetail",
          payload: isolatedGetData ? isolatedGetData(response) : getData(response),
        });
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterDetailActions);
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *create({ payload, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      const response = yield call(createMethod, payload);
      const coreFlow = function* () {
        message.success(locale.createOk);
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterCreateActions);
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *update({ id, payload, onOk, onError, onComplete }: any, { call, put, select }: EffectsCommandMap) {
      const response = yield call(updateMethod, id, payload);
      const coreFlow = function* () {
        message.success(locale.updateOk);
        callFunctionIfFunction(onOk)();
        const { list, pagination } = yield select((state: any) => state[namespace].data);
        yield put({
          type: "_save",
          payload: {
            list: list.map((item: any) => (item.id === id ? { ...item, ...payload } : item)),
            pagination,
          }
        });
        yield putGenerator((put as any).resolve, afterUpdateActions);
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *delete({ id, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      const response = yield call(deleteMethod, id);
      const coreFlow = function* () {
        message.success(locale.deleteOk);
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterDeleteActions);
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    ...extraEffects,
  },

  reducers: {
    _save(state: any, action: any) {
      return {
        ...state,
        data: { ...action.payload },
      };
    },

    _saveDetail(state: any, action: any) {
      return {
        ...state,
        detail: { ...action.payload },
      };
    },

    ...extraReducers,
  },
});
