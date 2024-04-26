export class UnstrLogTestData {
  private static data = [
    {
      date: "2024-04-06T10:19:22.247",
      srcIp: "10.15.2.18",
    },
    {
      date: "2024-04-06T10:20:22.247",
      srcIp: "10.15.2.17",
    },
    {
      date: new Date("2024-04-09T12:15:22.247"),
      srcIp: "10.15.2.1",
    },
    {
      date: "2024-04-13T10:19:22.247",
      srcIp: "10.15.2.7",
    },
    {
      date: new Date("2024-04-15T10:19:22.247"),
      srcIp: "10.15.2.18",
    },
    {
      date: "2024-04-20T12:59:22.247",
      srcIp: "10.15.2.1",
    },
    {
      date: "2024-04-20T13:19:22.247",
      srcIp: "10.15.2.18",
    },
  ];

  public static getData() {
    return this.data;
  }
}
