import { message } from "antd";
import { Model } from "dva";

const callFunctionIfFunction = (func: Function) => (...args: any) => {
  if (func) {
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

export function config(options: ConfigOptions) {
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
    *fetch({ payload, onOk, onError }: any, { call, put }: any) {
      for (let actionName of parallelFetchActions) {
        yield put({
          type: actionName,
          payload,
        });
      }
      const response = yield call(fetchMethod, payload);
      if (isResponseOk(response)) {
        callFunctionIfFunction(onOk)();
        yield put({
          type: "_save",
          payload: isolatedGetTableList ? isolatedGetTableList(response) : getTableList(response),
        });
        for (let actionName of afterFetchActions) {
          yield put({
            type: actionName,
          });
        }
      } else {
        callFunctionIfFunction(onError)(response);
      }
    },
    *detail({ id, onOk, onError }: any, { call, put }: any) {
      for (let actionName of parallelDetailActions) {
        yield put({
          type: actionName,
          id,
        });
      }
      const response = yield call(detailMethod, id);
      if (isResponseOk(response)) {
        yield put({
          type: "_saveDetail",
          payload: isolatedGetData ? isolatedGetData(response) : getData(response),
        });
        callFunctionIfFunction(onOk)();
        for (let actionName of afterDetailActions) {
          yield put({
            type: actionName,
          });
        }
      } else {
        callFunctionIfFunction(onError)(response);
      }
    },
    *create({ payload, onOk, onError }: any, { call, put }: any) {
      const response = yield call(createMethod, payload);
      if (isResponseOk(response)) {
        message.success("创建成功");
        callFunctionIfFunction(onOk)();
        for (let actionName of afterCreateActions) {
          yield put({
            type: actionName,
          });
        }
      } else {
        callFunctionIfFunction(onError)(response);
      }
    },
    *update({ id, payload, onOk, onError }: any, { call, put, select }: any) {
      const response = yield call(updateMethod, id, payload);
      if (isResponseOk(response)) {
        message.success("更新成功");
        callFunctionIfFunction(onOk)();
        const { list, pagination } = yield select((state: any) => state[namespace].data);
        yield put({
          type: "_save",
          payload: {
            list: list.map((item: any) => (item.id === id ? { ...item, ...payload } : item)),
            pagination,
          }
        });
        for (let actionName of afterUpdateActions) {
          yield put({
            type: actionName,
          });
        }
      } else {
        callFunctionIfFunction(onError)(response);
      }
    },
    *delete({ id, onOk, onError }: any, { call, put }: any) {
      const response = yield call(deleteMethod, id);
      if (isResponseOk(response)) {
        message.success("删除成功");
        callFunctionIfFunction(onOk)();
        for (let actionName of afterDeleteActions) {
          yield put({
            type: actionName,
          });
        }
        return;
      } else {
        callFunctionIfFunction(onError)(response);
      }
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
