import { jest } from "@jest/globals";
import { fetchBook } from "./fetchData";
import { mockBook } from "../__mocks__/mocks";
// @ts-ignore
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockBook),
  })
);

describe("fetchBook", () => {
  it("fetches successfully data from an API", async () => {
    const data = await fetchBook("bookid");
    expect(data).toEqual({ tag: "success", payload: mockBook });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
