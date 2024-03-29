# dva-base-models

[![GitHub license](https://img.shields.io/github/license/theprimone/dva-base-models.svg)](https://github.com/theprimone/dva-base-models/blob/master/LICENSE)
[![npm Version](https://img.shields.io/npm/v/dva-base-models.svg)](https://www.npmjs.com/package/dva-base-models)
[![GitHub stars](https://img.shields.io/github/stars/theprimone/dva-base-models.svg)](https://github.com/theprimone/dva-base-models/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/theprimone/dva-base-models.svg)](https://github.com/theprimone/dva-base-models/issues)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/theprimone/dva-base-models.svg)](https://github.com/theprimone/dva-base-models/commits/master)


基于 dva 的基础 model 配置

## curdModel 增删改查 model

### config

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| getList | 配置如何从接口响应中得到数据列表和分页器 | (response) => ({ list: [], pagination: {} }) | - |
| getData | 配置如何从接口响应中得到对象详情 | (response) => ({}) | - |
| isResponseOk | 判断接口是否成功 | (response) => boolean | - |

### set

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fetchMethod | 带查询参数的数据列表请求方法 | (paylaod) => Response | - |
| isolatedGetList | 单独定义 model 的 getList | (Response) => data | - |
| parallelFetchActions | 与查询并行的 action 列表 | string[] | [] |
| afterFetchActions | 查询后需要回调的 action 列表 | string[] | [] |
| detailMethod | 对象详情请求方法 | (id) => Response | - |
| isolatedGetData | 单独定义 model 的 getData | (Response) => data | - |
| parallelDetailActions | 与详情并行的 action 列表 | string[] | [] |
| afterDetailActions | 详情后需要回调的 action 列表 | string[] | [] |
| createMethod | 新建对象请求方法 | (paylaod) => Response | - |
| afterCreateActions | 创建后需要回调的 action 列表 | string[] | [] |
| updateMethod | 更新对象请求方法 | (id, paylaod) => Response | - |
| afterUpdateActions | 更新后需要回调的 action 列表 | string[] | [] |
| deleteMethod | 更新对象请求方法 | (id) => Response | - |
| afterDeleteActions | 删除后需要回调的 action 列表 | string[] | [] |
| extraState | 额外的 state ，可覆盖默认 state | {} | {} |
| extraEffects | 额外的 effect ，可覆盖默认 effect | {} | {} |
| extraReducers | 额外的 reducer ，可覆盖默认 reducer | {} | {} |

### 使用方法

* 配置 config ： `getList` 、 `getData` 、 `isResponseOk`
* 配置 set ： `fetchMethod` 、 `detailMethod` 、 `createMethod` 、 `updateMethod` 、 `deleteMethod`

具体使用参考 [Demo](https://github.com/zpr1g/ant-design-pro-plus/blob/v2/src/base-models/curd.ts) ，配置 `curdModel.config` 后导出 `curdModel.set` 。
