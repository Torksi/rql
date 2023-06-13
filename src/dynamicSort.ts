/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
export default (properties: string[]) => {
  return (a: any, b: any) => {
    for (let i = 0; i < properties.length; i += 1) {
      const sortOrder = properties[i][0] === "-" ? -1 : 1;
      const property =
        sortOrder === -1 ? properties[i].slice(1) : properties[i];
      const propertyPath = property.split(".");

      let propertyValueA = a;
      let propertyValueB = b;
      let j = 0;

      while (propertyValueA && propertyValueB && j < propertyPath.length) {
        propertyValueA = propertyValueA[propertyPath[j]];
        propertyValueB = propertyValueB[propertyPath[j]];
        j += 1;
      }

      if (propertyValueA < propertyValueB) {
        return -1 * sortOrder;
      }
      if (propertyValueA > propertyValueB) {
        return 1 * sortOrder;
      }
    }

    return 0;
  };
};
