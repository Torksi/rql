export class UrlTestData {
  private static data = [
    { id: 1, srcIp: "10.15.2.18", url: "//user:password@a.b:80/path?query" },
    { id: 2, srcIp: "192.168.1.13", url: "https://a.b/test" },
    { id: 3, srcIp: "192.168.1.9", url: "http://a.b" },
    {
      id: 4,
      srcIp: "0:0:0:0:0:FFFF:222.1.41.9",
      url: "https://a.b/path/another",
    },
    { id: 5, srcIp: "85.25.14.92", url: "http://user:password@a.b:8080" },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
