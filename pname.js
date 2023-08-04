/**
 * 日期：2023-08-04 17:29:02 仅支持Surge、Loon
 * 用法：Sub-Store 脚本操作里添加 此脚本链接 https://github.com/Keywos/rule/raw/main/pname.js#timeout=1000&bs=30
 * 作者：@Key
 * 功能：去除无效节点
 *
 * 参数：
 * [bs=]       批处理节点数
 * [timeout=]  超时时间 单位 ms
 * [flag]     加国旗
 */

const $ = $substore;
const iar = $arguments;
let timeout = iar.timeout || 2000,
  flag = iar.flag,
  debug = iar.debug,
  bs = iar.bs || 20;
const { isLoon: isLoon, isSurge: isSurge } = $substore.env,
  target = isLoon ? "Loon" : isSurge ? "Surge" : undefined;
async function operator(e) {
  if (e.length < 1) {
    $notification.post("PNAME", "订阅无节点", "");
    return e;
  }
  const startTime = new Date();
  const support = isLoon || isSurge;
  if (!support) {
    $.error(`No Loon or Surge`);
    return e;
  }
  if (typeof scriptResourceCache === "undefined") {
    klog(
      "\nPNAME: SubStore 未更新 Version 2.14+,\n查看脚本说明\nhttps://github.com/Keywos/rule/raw/main/PNAME.js"
    );
    if (target == "Surge") {
      $notification.post(
        "PNAME Sub-Store 未更新 Version 2.14+",
        "",
        "请点击或查看klog查看脚本说明安装对应版本",
        {
          url: "https://github.com/Keywos/rule/raw/main/Sub-Store/Sub-Store.sgmodule",
        }
      );
    } else if (target == "Loon") {
      $notification.post(
        "PNAME Sub-Store 未更新 Version 2.14+ ",
        "",
        "请点击安装插件, 或查看klog安装对应版本, 并关闭原本的substore",
        "loon://import?plugin=https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Tool/Loon/Plugin/Sub-Store.plugin"
      );
    }
    return e;
  }
  const ein = e.length;
  klog(`开始处理节点: ${ein} 个`);
  klog(`批处理节点数: ${bs} 个`);
  let i = 0;
  while (i < e.length) {
    const batch = e.slice(i, i + bs);
    await Promise.all(
      batch.map(async (pk) => {
        try {
          const OUTK = await OUTIA(pk);
          flag && (pk.name = getflag(OUTK.loc) + " " + pk.name);
          pk.Key = OUTK;
          pk.qc = pk.server + OUTK.ip;
        } catch (err) {
          // console.log(err.message)
        }
      })
    );
    i += bs;
  }
  e = removels(e);
  let eout = e.length;
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  klog(`处理完后剩余: ${eout} 个`);
  klog(`此方法总用时: ${zhTime(timeDiff)}`);
  return e;
}

function getflag(e) {
  const t = e
    .toUpperCase()
    .split("")
    .map((e) => 127397 + e.charCodeAt());
  return String.fromCodePoint(...t).replace(/🇹🇼/g, "🇨🇳");
}
function sleep(e) {
  return new Promise((t) => setTimeout(t, e));
}

let apiRead = 0,
  apiw = 0;
const OUTKApi = new Map();
async function OUTIA(e) {
  const t = getid(e);
  if (OUTKApi.has(t)) return OUTKApi.get(t);
  const maxRE = 2;
  //https://cloudflare.com/cdn-cgi/trace
  const url = `https://cloudflare.com/cdn-cgi/trace`;
  const getHttp = async (reTry) => {
    try {
      let r = ProxyUtils.produce([e], target);
      let time = Date.now();
      const response = await Promise.race([
        $.http.get({ url: url, node: r, "policy-descriptor": r }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeout)
        ),
      ]);
      const data = response.body;
      if (data.length > 0) {
        let endtime = Date.now() - time;
        let lines = data.split("\n");
        let key = lines.reduce((acc, line) => {
          const [name, value] = line.split("=").map((item) => item.trim());
          if (["ip", "loc", "warp"].includes(name)) {
            acc[name] = value;
            acc["tk"] = endtime;
          }
          return acc;
        }, {});
        scriptResourceCache.set(t, key);
        return key;
      } else {
        throw new Error(resdata.message);
      }
    } catch (error) {
      if (reTry < maxRE) {
        await sleep(getRandom());
        delog(e.name + "-> [OUTKApi超时查询次数] " + reTry);
        return getHttp(reTry + 1);
      } else {
        throw error;
      }
    }
  };
  const resGet = new Promise((resolve, reject) => {
    getHttp(1)
      .then((data) => {
        apiw++;
        resolve(data);
      })
      .catch(reject);
  });
  OUTKApi.set(t, resGet);
  return resGet;
}

function getRandom() {
  return Math.floor(Math.random() * (200 - 20 + 1) + 20);
}

function delog(...arg) {
  if (debug) {
    console.log("[PNAME] " + arg);
  }
}

function klog(...arg) {
  console.log("[PNAME] " + arg);
}

function removels(e) {
  const t = new Set();
  const n = [];
  for (const s of e) {
    if (s.qc && !t.has(s.qc)) {
      t.add(s.qc);
      n.push(s);
    }
  }
  return n;
}

function zhTime(e) {
  e = e.toString().replace(/-/g, "");
  if (e < 1e3) {
    return `${Math.round(e)}毫秒`;
  } else if (e < 6e4) {
    return `${Math.round(e / 1e3)}秒`;
  } else if (e < 36e5) {
    return `${Math.round(e / 6e4)}分钟`;
  } else if (e >= 36e5) {
    return `${Math.round(e / 36e5)}小时`;
  }
}
function getid(e) {
  let t = "ld";
  return `${t}-${e.server}-${e.port}`;
}
