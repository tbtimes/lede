import { test } from "ava";
import { join } from "path";
import nock from "nock";

import { asyncMap, globProm, httpsGetProm } from "../dist/utils";


test("asyncMap should iterate and apply a function asynchronously", async t => {
  const asyncStuff = [asyncNumber(5), asyncNumber(6), asyncNumber(7)];
  const results = await asyncMap(asyncStuff, async(n) => {
    return await n();
  });

  t.deepEqual(results, [5,6,7]);

  function asyncNumber(num) {
    return function() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(num);
        }, 700);
      });
    }
  }
});

test("globProm should return the contents of a directory", async t => {
  const results = await globProm("*", join(__dirname, "fixtures"));
  t.deepEqual(results, ["test-project"]);
});

test("httpsGetProm should fetch content via https", async t => {
  const response = "THIS IS CORRECT";
  const req = nock("https://ledefoo.com")
    .get('/test')
    .reply(200, response);

  const answer = await httpsGetProm({ hostname: "ledefoo.com", path: "/test"});
  t.true(req.isDone());
  t.deepEqual(answer, response);
});