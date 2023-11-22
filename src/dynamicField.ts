// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (field: string, data: any) => {
  const fieldPath = field.split(".");
  for (const path of fieldPath) {
    if (data == null || !Object.prototype.hasOwnProperty.call(data, path)) {
      data = null;
      break;
    }
    data = data[path];
  }

  return data;
};
