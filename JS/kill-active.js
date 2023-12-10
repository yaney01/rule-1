// 改自 https://raw.githubusercontent.com/xream/scripts/main/surge/modules/kill-active-requests/index.sgmodule
let result = {}, aid = [], le = 0;
const noPanel = typeof $input == "undefined";
!(async () => {
  const { requests = [] } = (await httpAPI("/v1/requests/active", "GET")) || {};
  for await (const { id, URL } of requests) {
    if (noPanel) {
      aid.push(URL);
    } else {
      const domain = URL.match(/\.([^:/]+)\./)[1] ?? "";
      aid.push(domain.replace(/\.(com|net)$/, ""));
      console.log(URL);
    }
    await httpAPI("/v1/requests/kill", "POST", { id });
  }
  le = Math.max(requests.length - 1, 0);
  let xc = "";
  if (noPanel) {
    xc = aid.slice(0, -1).join("\n");
  } else {
    xc = le === 0 ? "无活跃请求" : aid.slice(0, -1).join(", ");
  }
  result = {
    title: "打断活跃请求数: " + le,
    content: xc,
    icon: "xmark.circle",
    "icon-color": "#C5424A",
  };

  if (noPanel) {
    let x = result.content;
    $notification.post(result.title, "", x);
    le != 0 && console.log("\n\n" + x + "\n");
  }
})()
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    $done(result);
  });

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve, reject) => {
    const tPr = new Promise((_, reject) => {
      setTimeout(() => {
        reject("");
        resolve("");
      }, 500);
    });
    const reqPr = new Promise((resolve) => {
      $httpAPI(method, path, body, resolve);
    });
    Promise.race([reqPr, tPr])
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
