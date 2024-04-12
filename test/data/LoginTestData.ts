export class LoginTestData {
  private static data = [
    { id: 1, osActorPrimaryUsername: "domain.local\\john.doe" },
    { id: 2, causalityActorPrimaryUsername: "john.doe" },
    {
      id: 3,
      actorPrimaryUsername: "jane.doe",
      osActorPrimaryUsername: "domain.local\\jane.doe",
    },
    {
      id: 4,
      actorPrimaryUsername: "bob.builder",
      causalityActorPrimaryUsername: "bob.builder",
    },
    {
      id: 5,
      webUsername: "john.doe",
    },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
