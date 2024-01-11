// @xream @key 2024-01-11 19:50:46
const isPanel = typeof $input != "undefined";
let result = {},
  icons = "heart.text.square",
  icolor = "#6699FF",
  type = false,
  list = false;
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  icons = ins.icon || icons;
  icolor = ins.color || icolor;
  type = ins.type !== undefined;
  list = ins.list !== undefined;
}

!(async () => {
  try {
    const [
      { enabled: mitm },
      { enabled: rewrite },
      { enabled: scripting },
      { profile },
    ] = await Promise.all([
      httpAPI("/v1/features/mitm", "GET"),
      httpAPI("/v1/features/rewrite", "GET"),
      httpAPI("/v1/features/scripting", "GET"),
      httpAPI("/v1/profiles/current?sensitive=0", "GET"),
    ]);
    let hostname;
    if (!isPanel) {
      hostname =
        profile.match(/\nhostname\s*=\s*(.*?)\n/)?.[1].split(/\s*,\s*/) || [];
      const hostname_disabled =
        profile
          .match(/\nhostname-disabled\s*=\s*(.*?)\n/)?.[1]
          .split(/\s*,\s*/) || [];
      hostname = hostname.filter((item) => !hostname_disabled.includes(item));
    }

    let AllRule = [],
      RULELIST = {};
    // prettier-ignore
    let DOMAIN_NUM = 0,DOMAIN_SUFFIX_NUM = 0, DOMAIN_KEYWORD_NUM = 0, IP_CIDR_NUM = 0, IP_CIDR6_NUM = 0, IP_ASN_NUM = 0, OR_NUM = 0, AND_NUM = 0, NOT_NUM = 0, DEST_PORT_NUM = 0, IN_PORT_NUM = 0, SRC_IP_NUM = 0, PROTOCOL_NUM = 0, PROCESS_NAME_NUM = 0, DEVICE_NAME_NUM = 0, USER_AGENT_NUM = 0, URL_REGEX_NUM = 0, SUBNET_NUM = 0, DOMAIN_SET_NUM = 0, RULE_SET_NUM = 0, ALL_NUM = 0;
    const scRule = profile
      .match(/^\[Rule\]([\s\S]+?)^\[/gm)[0]
      .split("\n")
      .filter((i) => /^\s?(?![#;\s[//])./.test(i));
    AllRule = AllRule.concat(scRule);
    for (const e of scRule) {
      if (/^RULE-SET,/.test(e)) {
        RULE_SET_NUM++;
        const rsUrl = e.split(",")[1];
        if (/http/.test(rsUrl)) {
          console.log("[RULE-SET_GET]: " + rsUrl);
          try {
            const ruleSetRaw = (await tKey(rsUrl))
              .split("\n")
              .filter((i) => /^\s?(?![#;\s[//])./.test(i));
            RULELIST[rsUrl.split("/").pop()] = ruleSetRaw.length;
            AllRule = AllRule.concat(ruleSetRaw);
          } catch (e) {
            console.log(e.message);
          }
        }
      }
      if (/^DOMAIN-SET,/.test(e)) {
        DOMAIN_SET_NUM++;
        const rdurl = e.split(",")[1];
        if (/http/.test(rdurl)) {
          console.log("[DOMAIN-SET_GET]: " + rdurl);
          try {
            const DOMAIN_SET_RAW_BODY = (await tKey(rdurl))
              .split("\n")
              .filter((i) => /^\s?(?![#;\s[//])./.test(i));
            const l = DOMAIN_SET_RAW_BODY.length;
            RULELIST[rdurl.split("/").pop()] = l;
            ALL_NUM += l;
          } catch (e) {
            console.log(e.message);
          }
        }
      }
    }
    AllRule.forEach((e) => {
      ALL_NUM++;
      /^DOMAIN,/.test(e) && DOMAIN_NUM++;
      /^DOMAIN-SUFFIX,/.test(e) && DOMAIN_SUFFIX_NUM++;
      /^DOMAIN-KEYWORD,/.test(e) && DOMAIN_KEYWORD_NUM++;
      /^IP-CIDR6,/.test(e) && IP_CIDR6_NUM++;
      /^IP-CIDR,/.test(e) && IP_CIDR_NUM++;
      /^IP-ASN,/.test(e) && IP_ASN_NUM++;
      /^OR,/.test(e) && OR_NUM++;
      /^AND,/.test(e) && AND_NUM++;
      /^NOT,/.test(e) && NOT_NUM++;
      /^DEST-PORT,/.test(e) && DEST_PORT_NUM++;
      /^IN-PORT,/.test(e) && IN_PORT_NUM++;
      /^SRC-IP,/.test(e) && SRC_IP_NUM++;
      /^PROTOCOL,/.test(e) && PROTOCOL_NUM++;
      /^PROCESS-NAME,/.test(e) && PROCESS_NAME_NUM++;
      /^DEVICE-NAME,/.test(e) && DEVICE_NAME_NUM++;
      /^USER-AGENT,/.test(e) && USER_AGENT_NUM++;
      /^URL-REGEX,/.test(e) && URL_REGEX_NUM++;
      /^SUBNET,/.test(e) && SUBNET_NUM++;
    });

    const AROBJ = {
      OR: OR_NUM,
      AND: AND_NUM,
      NOT: NOT_NUM,
      SRC_IP: SRC_IP_NUM,
      IP_ASN: IP_ASN_NUM,
      DOMAIN: DOMAIN_NUM,
      SUBNET: SUBNET_NUM,
      IN_PORT: IN_PORT_NUM,
      IP_CIDR: IP_CIDR_NUM,
      RULE_SET: RULE_SET_NUM,
      IP_CIDR6: IP_CIDR6_NUM,
      PROTOCOL: PROTOCOL_NUM,
      DEST_PORT: DEST_PORT_NUM,
      URL_REGEX: URL_REGEX_NUM,
      DOMAIN_SET: DOMAIN_SET_NUM,
      USER_AGENT: USER_AGENT_NUM,
      DEVICE_NAME: DEVICE_NAME_NUM,
      PROCESS_NAME: PROCESS_NAME_NUM,
      DOMAIN_SUFFIX: DOMAIN_SUFFIX_NUM,
      DOMAIN_KEYWORD: DOMAIN_KEYWORD_NUM,
    };

    Object.entries(AROBJ).forEach(
      ([k, v]) => v != 0 && console.log(`${k}: ${v}`)
    );
    Object.entries(RULELIST).forEach(
      ([k, v]) => v != 0 && console.log(`${k}: ${v}`)
    );
    if (isPanel) {
      let text = "";
      if (type) {
        Object.entries(AROBJ).forEach(([k, v]) => {
          v != 0 && (text += `${k}: \x20\x20${v}\t\n`);
        });
      }
      if (list) {
        console.log("list");
        Object.entries(RULELIST).forEach(([k, v]) => {
          v != 0 && (text += `${k}: \x20\x20${v}\t\n`);
        });
      }

      result = {
        title: "Surge Tool Rule: " + ALL_NUM,
        content:
          text +
          `Rewrite:${rewrite ? "☑" : "☒"} Scripting:${
            scripting ? "☑" : "☒"
          } MitM:${mitm ? "☑" : "☒"}`,
        icon: icons,
        "icon-color": icolor,
      };
    } else {
      result = {
        response: {
          status: 200,
          headers: { "Content-Type": "text/html" },
          body: `<html><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
        ::backdrop,:root{--sans-font:-apple-system,BlinkMacSystemFont,"Avenir Next",Avenir,"Nimbus Sans L",Roboto,"Noto Sans","Segoe UI",Arial,Helvetica,"Helvetica Neue",sans-serif;--mono-font:Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace;--standard-border-radius:5px;--bg:#fff;--accent-bg:#d5e1ed;--text:#212121;--text-light:#585858;--border:#898EA4;--accent:#0d47a1;--code:#d81b60;--preformatted:#444;--marked:#ffdd33;--disabled:#efefef}@media (prefers-color-scheme:dark){::backdrop,:root{color-scheme:dark;--bg:#232326;--accent-bg:171718;--text:#dcdcdc;--text-light:#ababab;--accent:#d5e1ed8a;--code:#f06292;--preformatted:#97a4b8;--disabled:#111}img,video{opacity:.8}}*,::after,::before{box-sizing:border-box}input,progress,select,textarea{appearance:none;-webkit-appearance:none;-moz-appearance:none}html{font-family:var(--sans-font);scroll-behavior:smooth}body{min-height: 140vh;color:var(--text);background-color:var(--bg);line-height:1.5;display:grid;grid-template-columns:1fr min(45rem,90%) 1fr;margin:0}body>*{grid-column:2}body>header{background-color:var(--accent-bg);border-bottom:0px solid var(--border);text-align:center;padding:0 .5rem 2rem .5rem;grid-column:1/-1}body>header h1{max-width:1200px;margin:1rem auto}body>header p{max-width:40rem;margin:1rem auto}main{padding-top:1.5rem}body>footer{margin-top:4rem;padding:2rem 1rem 1.5rem 1rem;color:var(--text-light);font-size:.9rem;text-align:center;border-top:0px solid var(--border)}h1{font-size:3rem}h2{font-size:2.6rem;margin-top:3rem}h3{font-size:2rem;margin-top:3rem}h4{font-size:1.44rem}h5{font-size:1.15rem}h6{font-size:.96rem}h1,h2,h3,h4,h5,h6,p{overflow-wrap:break-word}h1,h2,h3{line-height:1.1}@media only screen and (max-width:720px){h1{font-size:2.5rem}h2{font-size:2.1rem}h3{font-size:1.75rem}h4{font-size:1.25rem}}a,a:visited{color:var(--accent)}a:hover{text-decoration:none}[role=button],button,input[type=button],input[type=reset],input[type=submit],label[type=button]{border:none;border-radius:var(--standard-border-radius);background-color:var(--accent);font-size:1rem;color:var(--bg);padding:.7rem .9rem;margin:.5rem 0;font-family:inherit}[role=button][aria-disabled=true],button[disabled],input[type=button][disabled],input[type=checkbox][disabled],input[type=radio][disabled],input[type=reset][disabled],input[type=submit][disabled],select[disabled]{cursor:not-allowed}button[disabled],input:disabled,select:disabled,textarea:disabled{cursor:not-allowed;background-color:var(--disabled);color:var(--text-light)}input[type=range]{padding:0}abbr[title]{cursor:help;text-decoration-line:underline;text-decoration-style:dotted}[role=button]:not([aria-disabled=true]):hover,button:enabled:hover,input[type=button]:enabled:hover,input[type=reset]:enabled:hover,input[type=submit]:enabled:hover,label[type=button]:hover{filter:brightness(1.4);cursor:pointer}button:focus-visible:where(:enabled,[role=button]:not([aria-disabled=true])),input:enabled:focus-visible:where([type=submit],[type=reset],[type=button]){outline:2px solid var(--accent);outline-offset:1px}header>nav{font-size:1rem;line-height:2;padding:1rem 0 0 0}header>nav ol,header>nav ul{align-content:space-around;align-items:center;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;list-style-type:none;margin:0;padding:0}header>nav ol li,header>nav ul li{display:inline-block}header>nav a,header>nav a:visited{margin:0 .5rem 1rem .5rem;border:0px solid var(--border);border-radius:var(--standard-border-radius);color:var(--text);display:inline-block;padding:.1rem 1rem;text-decoration:none}header>nav a.current,header>nav a:hover{border-color:var(--accent);color:var(--accent);cursor:pointer}@media only screen and (max-width:720px){header>nav a{border:none;padding:0;text-decoration:underline;line-height:1}}aside,details,pre,progress{background-color:var(--accent-bg);border:0px solid var(--border);border-radius:var(--standard-border-radius);margin-bottom:1rem}aside{font-size:1rem;width:30%;padding:0 15px;margin-inline-start:15px;float:right}[dir=rtl] aside{float:left}@media only screen and (max-width:720px){aside{width:100%;float:none;margin-inline-start:0}}article,dialog,fieldset{border:0px solid var(--border);padding:1rem;border-radius:var(--standard-border-radius);margin-bottom:1rem}article h2:first-child,section h2:first-child{margin-top:1rem}section{border-top:0px solid var(--border);border-bottom:0px solid var(--border);padding:2rem 1rem;margin:3rem 0}section+section,section:first-child{border-top:0;padding-top:0}section:last-child{border-bottom:0;padding-bottom:0}details{padding:.7rem 1rem}summary{cursor:pointer;font-weight:700;padding:.7rem 1rem;margin:-.7rem -1rem;word-break:break-all}details[open]>summary+*{margin-top:0}details[open]>summary{margin-bottom:.5rem}details[open]>:last-child{margin-bottom:0}table{border-collapse:collapse;margin:1.5rem 0}td,th{border:0px solid var(--border);text-align:start;padding:.5rem}th{background-color:var(--accent-bg);font-weight:700}tr:nth-child(even){background-color:var(--accent-bg)}table caption{font-weight:700;margin-bottom:.5rem}input,select,textarea{font-size:inherit;font-family:inherit;padding:.5rem;margin-bottom:.5rem;color:var(--text);background-color:var(--bg);border:0px solid var(--border);border-radius:var(--standard-border-radius);box-shadow:none;max-width:100%;display:inline-block}label{display:block}textarea:not([cols]){width:100%}select:not([multiple]){background-image:linear-gradient(45deg,transparent 49%,var(--text) 51%),linear-gradient(135deg,var(--text) 51%,transparent 49%);background-position:calc(100% - 15px),calc(100% - 10px);background-size:5px 5px,5px 5px;background-repeat:no-repeat;padding-inline-end:25px}[dir=rtl] select:not([multiple]){background-position:10px,15px}input[type=checkbox],input[type=radio]{vertical-align:middle;position:relative;width:min-content}input[type=checkbox]+label,input[type=radio]+label{display:inline-block}input[type=radio]{border-radius:100%}input[type=checkbox]:checked,input[type=radio]:checked{background-color:var(--accent)}input[type=checkbox]:checked::after{content:" ";width:.18em;height:.32em;border-radius:0;position:absolute;top:.05em;left:.17em;background-color:transparent;border-right:solid var(--bg) .08em;border-bottom:solid var(--bg) .08em;font-size:1.8em;transform:rotate(45deg)}input[type=radio]:checked::after{content:" ";width:.25em;height:.25em;border-radius:100%;position:absolute;top:.125em;background-color:var(--bg);left:.125em;font-size:32px}@media only screen and (max-width:720px){input,select,textarea{width:100%}}input[type=color]{height:2.5rem;padding:.2rem}input[type=file]{border:0}hr{border:none;height:1px;background:var(--border);margin:1rem auto}mark{padding:2px 5px;border-radius:var(--standard-border-radius);background-color:var(--marked);color:#000}img,video{max-width:100%;height:auto;border-radius:var(--standard-border-radius)}figure{margin:0;display:block;overflow-x:auto}figcaption{text-align:center;font-size:.9rem;color:var(--text-light);margin-bottom:1rem}blockquote{margin-inline-start:2rem;margin-inline-end:0;margin-block:2rem;padding:.4rem .8rem;border-inline-start:.35rem solid var(--accent);color:var(--text-light);font-style:italic}cite{font-size:.9rem;color:var(--text-light);font-style:normal}dt{color:var(--text-light)}code,kbd,pre,pre span,samp{font-family:var(--mono-font);color:var(--code)}kbd{color:var(--preformatted);border:1px solid var(--preformatted);border-bottom:3px solid var(--preformatted);border-radius:var(--standard-border-radius);padding:.1rem .4rem}pre{padding:1rem 1.4rem; max-height: 400px;overflow: auto;max-width:100%;color:var(--preformatted)}pre code{color:var(--preformatted);background:0 0;margin:0;padding:0}progress{width:100%}progress:indeterminate{background-color:var(--accent-bg)}progress::-webkit-progress-bar{border-radius:var(--standard-border-radius);background-color:var(--accent-bg)}progress::-webkit-progress-value{border-radius:var(--standard-border-radius);background-color:var(--accent)}progress::-moz-progress-bar{border-radius:var(--standard-border-radius);background-color:var(--accent);transition-property:width;transition-duration:.3s}progress:indeterminate::-moz-progress-bar{background-color:var(--accent-bg)}dialog{max-width:40rem;margin:auto}dialog::backdrop{background-color:var(--bg);opacity:.8}@media only screen and (max-width:720px){dialog{max-width:100%;margin:auto 1em}}.button,.button:visited{display:inline-block;text-decoration:none;border:none;border-radius:5px;background:var(--accent);font-size:1rem;color:var(--bg);padding:.7rem .9rem;margin:.5rem 0}.button:focus,.button:hover{filter:brightness(1.4);cursor:pointer}.notice{background:var(--accent-bg);border:2px solid var(--border);border-radius:5px;padding:1.5rem;margin:2rem 0};pre { overflow: unset } h3, h3 { margin-top: 0 } blockquote { margin-inline-start: 0; margin-inline-end: 0; margin-block: 0 }
        </style>
        </head><body><h1>Troubleshoot</h1>
        <h3>Rewrite <small>${rewrite ? "✅" : "❌ "}</small>
        </h3><h3>Scripting <small>${scripting ? "✅" : "❌ "}</small>
        </h3><h3>MitM <small>${mitm ? "✅" : "❌ "}</small></h3>
        <h3>Hostname<small>(${hostname.length})</small></h3>
        <blockquote>The parts marked in <span style="color: red">red</span> do not necessarily indicate a problem, but rather serve as a noteworthy reminder.</blockquote><pre><code>${
          hostname.length > 0
            ? hostname
                .map((i) =>
                  i
                    .split("")
                    .map((j) =>
                      j === "*" ? '<i style="color: red">' + j + "</i>" : j
                    )
                    .join("")
                )
                .map((i) =>
                  !i.startsWith("-") &&
                  /(\.|^)(twitter|tiktokv|snssdk|icloud|apple|itunes)\./.test(i)
                    ? '<i style="color: red">' + i + "</i>"
                    : i
                )
                .join("\n")
            : "❌ empty"
        }</pre></code>
        <h3 style="margin-bottom: -4px; padding-top:6px;">Rule(${ALL_NUM})</h3><pre><code>${Object.entries(
            AROBJ
          )
            .map(([k, v]) => (v !== 0 ? `<i>${k}: ${v}\n</i>` : ""))
            .join("")}</code></pre>
          <h3 style="margin-bottom: -4px; padding-top:6px;">RuleList</h3><pre><code>${Object.entries(
            RULELIST
          )
            .map(([k, v]) => (v !== 0 ? `<i>${k}: ${v}\n</i>` : ""))
            .join("")}</code></pre>
          <tƒooter style="opacity: 0.55;text-align:center;padding:20px;">Made With &hearts; By <a  style="text-decoration:none;" href="https://t.me/zhetengsha">@xream @key</a></footer></body></html>`,
        },
      };
    }
  } catch (e) {
    console.log(e.message);
    throw new Error("无法获取当前配置信息");
  }
})()
  .catch((e) => {
    console.log(e.message);
    if (isPanel) {
      result = {
        title: "Surge Tool",
        content: "Err" + e.message,
        icon: icons,
        "icon-color": icolor,
      };
    } else {
      result = {
        response: {
          status: 500,
          headers: { "Content-Type": "text/html" },
          body: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>pre { overflow: unset } pre code { white-space: pre-line }</style></head><body><section><h1>错误</h1><pre><code>
               ${e.message ?? e}
               </pre></code></section></body></html>`,
        },
      };
    }
  })
  .finally(() => $done(result));

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, (result) => {
      resolve(result);
    });
  });
}
function getin() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((i) => i.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
// prettier-ignore
async function tKey(e,t="3000"){let o=1,r=1;const s=new Promise(((s,i)=>{const c=async l=>{try{const o=await Promise.race([new Promise(((t,o)=>{$httpClient.get({url:e},((e,n,r)=>{if(e){o(e)}else{t(r)}}))})),new Promise(((e,o)=>{setTimeout((()=>o(new Error("timeout"))),t)}))]);if(o){s(o)}else{i(new Error(n.message))}}catch(e){if(l<o){r++;c(l+1)}else{console.log("reget"+r);s("reget"+r)}}};c(0)}));return s}
