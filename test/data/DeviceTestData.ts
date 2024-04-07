export class DeviceTestData {
  private static data = [
    {
      id: 1,
      username: "john.doe",
      device: "mac-1",
      createdAt: "2022-05-01",
      location: "US",
      role: undefined,
      description: " Created, 2022-05-01 ",
    },
    {
      id: 2,
      username: "john.doe",
      device: "mac-1",
      createdAt: "2022-02-01",
      location: "US",
      role: "user",
    },
    {
      id: 3,
      username: "jane.doe",
      device: "win-1",
      createdAt: "2022-05-01",
      location: "GB",
      role: "admin",
    },
    {
      id: 4,
      username: "bob.builder",
      device: "win-2",
      createdAt: "2022-05-02",
      role: null,
    },
    {
      id: 5,
      username: "john.doe",
      device: "win-1",
      createdAt: "2022-05-02",
      location: "GB",
    },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
