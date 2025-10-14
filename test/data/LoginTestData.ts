export class LoginTestData {
  private static data = [
    {
      id: 1,
      osActorPrimaryUsername: "domain.local\\john.doe",
      source: { ip: "192.168.1.1" },
    },
    {
      id: 2,
      causalityActorPrimaryUsername: "john.doe",
      source: { ip: "192.168.1.1" },
    },
    {
      id: 3,
      actorPrimaryUsername: "jane.doe",
      osActorPrimaryUsername: "domain.local\\jane.doe",
      source: { ip: "192.168.1.2" },
    },
    {
      id: 4,
      actorPrimaryUsername: "bob.builder",
      causalityActorPrimaryUsername: "bob.builder",
      source: { ip: "192.168.1.3" },
    },
    {
      id: 5,
      webUsername: "john.doe",
      source: { ip: "192.168.1.1" },
    },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
