export class CustomerTestData {
  private static data = [
    {
      id: 1,
      customer: "John Doe",
      createdAt: new Date("2020-01-01"),
      paid: false,
      canceled: false,
      amount: 900,
      decimal: 900.45,
      dueDate: new Date("2025-12-12"),
      notes: "This is a note",
      flags: ["LOAYLTY", "STAFF"],
    },
    {
      id: 2,
      customer: "Jane Doe",
      createdAt: new Date("2020-01-01"),
      paid: true,
      canceled: false,
      amount: 200,
      dueDate: new Date("2023-12-12"),
      notes: "This is a note",
      uniqueNumber: 727411466252,
      details: {
        wealth: 360500,
      },
    },
    {
      id: 3,
      customer: "Jack Daniels",
      createdAt: new Date("2020-01-03"),
      paid: true,
      canceled: false,
      amount: 300,
      dueDate: new Date("2020-01-01"),
      notes: "Need to order tools",
      uniqueNumber: "727411466252",
      flags: ["STAFF"],
    },
    {
      id: 4,
      customer: "John Doe",
      createdAt: new Date("2020-01-04"),
      paid: false,
      canceled: false,
      amount: 250,
      dueDate: new Date("2020-01-01"),
      notes: "This is a note",
      details: {
        wealth: 5560000,
      },
    },
    {
      id: 5,
      customer: "Jack Daniels",
      createdAt: new Date("2020-01-05"),
      paid: false,
      canceled: true,
      amount: 400,
      dueDate: new Date("2020-01-01"),
      notes: "This is not a note",
      details: {
        industry: "IT",
      },
    },
  ];

  public static getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
