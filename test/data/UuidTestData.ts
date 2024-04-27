export class UuidTestData {
  private static data = [
    {
      id: "d29f6582-80d7-4c7b-b7cf-45d2aae9ace8",
      field1: "value1",
      field2: "value2",
    },
    {
      id: "d29f6582-80d7-4c7b-b7cf-45d2aae9ace9",
      field1: "value3",
      field2: "value4",
    },
    {
      id: "d29f6582-80d7-4c7b-b7cf-45d2aae9ace0",
      field1: "value5",
      field2: "value6",
    },
  ];

  public static getData() {
    return this.data;
  }
}
