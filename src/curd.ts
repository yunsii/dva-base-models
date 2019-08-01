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
  afterFetchActions?: string[];
  detailMethod?: Function;
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
    afterFetchActions = [],
    detailMethod,
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
    *fetch({ payload }: any, { call, put }: any) {
      const response = yield call(fetchMethod, payload);
      yield put({
        type: "save",
        payload: response,
      });
      if (isResponseOk(response)) {
        for (let actionName of afterFetchActions) {
          yield put({
            type: actionName,
          });
        }
      }
    },
    *detail({ id }: any, { call, put }: any) {
      const response = yield call(detailMethod, id);
      yield put({
        type: "saveDetail",
        payload: response,
      });
      if (isResponseOk(response)) {
        for (let actionName of afterDetailActions) {
          yield put({
            type: actionName,
          });
        }
      }
    },
    *create({ payload, callback }: any, { call, put }: any) {
      const response = yield call(createMethod, payload);
      if (isResponseOk(response)) {
        message.success("创建成功");
        callFunctionIfFunction(callback)();
        for (let actionName of afterCreateActions) {
          yield put({
            type: actionName,
          });
        }
        return;
      }
      callFunctionIfFunction(callback)(response);
    },
    *update({ id, payload, callback }: any, { call, put, select }: any) {
      const response = yield call(updateMethod, id, payload);
      if (isResponseOk(response)) {
        message.success("更新成功");

        const { data } = response;
        const list = yield select((state: { [x: string]: { data: { list: any; }; }; }) => state[namespace].data.list);
        yield put({
          type: "save",
          payload: list.map((item: { id: any; }) => (item.id === data.id ? data : item)),
        });
        callFunctionIfFunction(callback)();
        for (let actionName of afterUpdateActions) {
          yield put({
            type: actionName,
          });
        }
        return;
      }
      callFunctionIfFunction(callback)(response);
    },
    *delete({ id, callback }: any, { call, put }: any) {
      const response = yield call(deleteMethod, id);
      if (isResponseOk(response)) {
        message.success("删除成功");
        callFunctionIfFunction(callback)();
        for (let actionName of afterDeleteActions) {
          yield put({
            type: actionName,
          });
        }
        return;
      }
      callFunctionIfFunction(callback)(response);
    },
    ...extraEffects,
  },

  reducers: {
    save(state: any, action: any) {
      return {
        ...state,
        data: getTableList(action.payload),
      };
    },
    saveDetail(state: any, action: any) {
      return {
        ...state,
        detail: getData(action.payload),
      };
    },
    ...extraReducers,
  },
});
