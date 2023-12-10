// 改自 https://raw.githubusercontent.com/xream/scripts/main/surge/modules/kill-active-requests/index.sgmodule
let result = {},aid = [],le=0;
!(async () => {
  const { requests = [] } = (await httpAPI("/v1/requests/active", "GET")) || {};
  for await (const { id,URL } of requests) {
		aid.push(URL)
    await httpAPI("/v1/requests/kill", "POST", { id });
  }
	le = Math.max(requests.length - 1, 0);
  result = {
    title: "打断活跃请求数: "+ le,
    content: aid.slice(0,-1).join("\n"),
    icon: "xmark.circle",
    "icon-color": "#C5424A",
  };
	let x = result.content;
    $notification.post(result.title,'',x);
    console.log("\n\n"+x+"\n");
})()
  .catch((e) => {console.log(e)})
  .finally(() => {$done(result)});

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve, reject) => {
    const tPr = new Promise((_, reject) => {
      setTimeout(() => {reject("");resolve("");
      }, 500);
    });
    const reqPr = new Promise((resolve) => {
      $httpAPI(method, path, body, resolve);
    });
    Promise.race([reqPr, tPr]).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
  });
}
