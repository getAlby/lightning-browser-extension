import Donation from "./donation";

describe("Donation", () => {
  test("should generate correct hash", () => {
    const donation = new Donation("test-location");
    expect(donation.getHash()).toEqual(
      "ae9235c77e2e0c9853d8204badc33379a175d3e75349438a254778170a19b091"
    );
  });
});
