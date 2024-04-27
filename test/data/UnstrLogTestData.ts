export class UnstrLogTestData {
  private static data = [
    {
      id: "2d25ddf9-a394-4c51-989c-45ee73255d74",
      date: "2024-04-06T10:19:22.247",
      srcIp: "10.15.2.18",
    },
    {
      id: "36b328b8-48cd-435f-8f78-5bbf6cbfe58a",
      date: "2024-04-06T10:20:22.247",
      srcIp: "10.15.2.17",
    },
    {
      id: "fb455f18-2488-4f51-9455-20d32c843cce",
      date: new Date("2024-04-09T12:15:22.247"),
      srcIp: "10.15.2.1",
    },
    {
      id: "9bfcd77e-ef60-4951-9982-957dac2fe787",
      date: "2024-04-13T10:19:22.247",
      srcIp: "10.15.2.7",
    },
    {
      id: "2c45e8b3-48b7-4243-ad94-7a96de93e40f",
      date: new Date("2024-04-15T10:19:22.247"),
      srcIp: "10.15.2.18",
    },
    {
      id: "3daa215a-4df8-4bc0-b6a7-77f58ab6c3ea",
      date: "2024-04-20T12:59:22.247",
      srcIp: "10.15.2.1",
    },
    {
      id: "0c20e7b5-970e-4818-a323-46edd0674217",
      date: "2024-04-20T13:19:22.247",
      srcIp: "10.15.2.18",
    },
  ];

  public static getData() {
    return this.data;
  }
}
