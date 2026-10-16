import { createServer } from "node:http";
import { SCORING_VERSION } from "@voxian/shared";

const port = Number(process.env.PORT ?? 8080);

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, scoringVersion: SCORING_VERSION }));
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
}).listen(port, () => console.log(`api listening on :${port}`));
