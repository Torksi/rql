export class LocationTestData {
  private static data = [
    {
      name: "Helsinki",
      lat: 60.1695,
      lon: 24.9354,
    },
    {
      name: "Tallinn",
      lat: 59.4372,
      lon: 24.7536,
    },
    {
      name: "Stockholm",
      lat: 59.3293,
      lon: 18.0686,
    },
    {
      name: "Oslo",
      lat: 59.9139,
      lon: 10.7522,
    },
    {
      name: "Riga",
      lat: 56.9496,
      lon: 24.1052,
    },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
