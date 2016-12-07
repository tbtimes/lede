import { httpsGetProm, flatten, mockLogger } from "../src/utils";
import * as nock from "nock";


test("mockLogger should have info, warn, error, trace, debug, and fatal functions", () => {
  ["info", "warn", "error", "trace", "debug", "fatal"].forEach(fn => {
    expect(typeof mockLogger[fn]).toBe("function");
    mockLogger[fn]();
    expect(mockLogger["called"][fn]).toBe(1);
  });
});

test("httpsGetProm should ", async () => {
  const response = "THIS IS CORRECT";
  const req = nock("https://ledefoo.com")
    .get("/test")
    .reply(200, response);

  const answer = await httpsGetProm({ hostname: "ledefoo.com", path: "/test"});
  expect(req.isDone()).toBeTruthy();
  expect(answer).toBe(response);

  const fail = nock("https://ledefoo.com")
    .get("/fail-test")
    .replyWithError("This is an utter failure");

  try {
    const _ = await httpsGetProm({hostname: "ledefoo.com", path: "/fail-test"});
  } catch (err) {
    expect(fail.isDone()).toBeTruthy();
    expect(err.message).toBe("This is an utter failure");
  }

});

test("flatten should flatten an array of arbitrarily nested arrays", () => {
  const array = [1, 2, [3, 4, [5]], [[[6, [7]]]], [8]];
  const flat = flatten(array);
  expect(flat.length).toBe(8);
  expect(flat).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});