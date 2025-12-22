import React from "react";
import { renderToString } from "react-dom/server";

import Root from "../client/Root";

function render() {
  const markup = renderToString(<Root />);

  return `
    <!doctype html>
    <html lang="en">
      <body>
        <div id="react">${markup}</div>
        <script src="client.js"></script>
      </body>
    </html>
  `;
}

export default async function renderHome(req, res) {
  res.statusCode = 200;
  res.end(render());
}
