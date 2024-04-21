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
      deviceValue: 1000,
    },
    {
      id: 2,
      username: "john.doe",
      device: "mac-1",
      createdAt: "2022-02-01",
      location: "US",
      role: "user",
      deviceValue: 1000,
    },
    {
      id: 3,
      username: "jane.doe",
      device: "win-1",
      createdAt: "2022-05-01",
      location: "GB",
      role: "admin",
      deviceValue: 500,
    },
    {
      id: 4,
      username: "bob.builder",
      device: "win-2",
      createdAt: "2022-05-02",
      role: null,
      deviceValue: 600,
    },
    {
      id: 5,
      username: "john.doe",
      device: "win-1",
      createdAt: "2022-05-02",
      location: "GB",
      deviceValue: 400,
    },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
