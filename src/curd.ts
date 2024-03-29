import { Model, EffectsCommandMap } from "dva";

function isFunction(func: any) {
  return typeof func === "function";
}

const callFunctionIfFunction = (func: Function) => (...args: any) => {
  if (isFunction(func)) {
    func(...args);
  }
};

let getList = (response: any) => ({
  list: [] as any,
  pagination: {},
});
let getData = (response: any) => ({});
let isResponseOk = (response: any) => true;

export interface ConfigOptions {
  getList: (response: any) => any;
  getData: (response: any) => any;
  isResponseOk: (response: any) => boolean;
}

export function methodConfig(options: ConfigOptions) {
  if (!isFunction(options.getList)) {
    throw new TypeError("getList is not a Function.");
  }
  if (!isFunction(options.getData)) {
    throw new TypeError("getData is not a Function.");
  }
  if (!isFunction(options.isResponseOk)) {
    throw new TypeError("isResponseOk is not a Function.");
  }
  getList = options.getList;
  getData = options.getData;
  isResponseOk = options.isResponseOk;
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
  isolatedGetList?: Function;
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
    isolatedGetList,
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
      function* coreFlow() {
        yield put({
          type: "_save",
          payload: isolatedGetList ? isolatedGetList(response) : getList(response),
        });
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterFetchActions, { response });
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *detail({ id, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      yield putGenerator(put, parallelDetailActions, { id });
      const response = yield call(detailMethod, id);
      function* coreFlow() {
        yield put({
          type: "_saveDetail",
          payload: isolatedGetData ? isolatedGetData(response) : getData(response),
        });
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterDetailActions, { response });
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *create({ payload, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      const response = yield call(createMethod, payload);
      function* coreFlow() {
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterCreateActions, { response });
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *update({ id, payload, onOk, onError, onComplete }: any, { call, put, select }: EffectsCommandMap) {
      const response = yield call(updateMethod, id, payload);
      function* coreFlow() {
        callFunctionIfFunction(onOk)();
        const { list, pagination } = yield select((state: any) => state[namespace].data);
        yield put({
          type: "_save",
          payload: {
            list: list.map((item: any) => (item.id === id ? { ...item, ...payload } : item)),
            pagination,
          }
        });
        yield putGenerator((put as any).resolve, afterUpdateActions, { response });
      }
      yield afterResponse(response, coreFlow, onError, onComplete);
    },

    *delete({ id, onOk, onError, onComplete }: any, { call, put }: EffectsCommandMap) {
      const response = yield call(deleteMethod, id);
      function* coreFlow() {
        callFunctionIfFunction(onOk)();
        yield putGenerator((put as any).resolve, afterDeleteActions, { response });
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
