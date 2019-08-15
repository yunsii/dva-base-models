export const locale = {
  createOk: "创建成功",
  updateOk: "更新成功",
  deleteOk: "删除成功",
}

export interface Locale {
  createOk?: string,
  updateOk?: string,
  deleteOk?: string,
}

function isValidOption(option: string) {
  return option !== undefined;
}

/** message locale */
export function setLocale(options: Locale) {
  if (isValidOption(options.createOk)) {
    locale.createOk = options.createOk;
  }
  if (isValidOption(options.updateOk)) {
    locale.updateOk = options.updateOk;
  }
  if (isValidOption(options.deleteOk)) {
    locale.deleteOk = options.deleteOk;
  }
}