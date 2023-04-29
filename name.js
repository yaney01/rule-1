/*
节点：🅳 = 电信 🅻 = 联通 🆈 = 移动 🆉 = 直连 [默认不加此参数]
接口：dns查询接口入口为 inte.net 落地为 ip-api
功能：根据接口返回的真实结果，重新对节点命名，添加入口城市、落地国家或地区、国内运营商信息。
作者：@Key @奶茶姐
用法：Sub-Store脚本操作添加 https://脚本地址/name.js#flag&timeout=1000
*/
// 参数 timeout ：最大超时参数，超出允许范围则判定为无效节点，默认1000ms

// 参数 flag ：添加旗帜

// 参数 city ：添加入口城市名，默认不添加城市名，无 city 参数则只输出省份不输出城市

// 参数 batch 每次检查多少节点，默认每次16个节点


const flag = $arguments["flag"];
const citys = $arguments["city"];
const timeout = $arguments["timeout"] ? $arguments["timeout"] : 1000;
const batch_size = $arguments["batch"] ? $arguments["batch"] : 16;
const $ = $substore
const { isLoon, isSurge, isQX } = $substore.env;
const target = isLoon ? "Loon" : isSurge ? "Surge" : isQX ? "QX" : undefined;
async function operator(proxies) {
  const support = (isLoon || isSurge);
  if (!support) {
    $.error(`Only supports Loon and Surge!`);
    return proxies;
  }
  const startTime = new Date(); // 获取当前时间作为开始时间
  const prs = proxies.length; //初始节点数
  // console.log("初始节点数 = " + proxies.length);
  let i = 0;
  while (i < proxies.length) {
    const batch = proxies.slice(i, i + batch_size);
    await Promise.allSettled(
      batch.map(async (proxy) => {
        try {
          const in_info = await queryDNSInfo(proxy.server);
          const incity = $arguments["city"]? in_info.data[2].substring(0, 2): in_info.data[1].substring(0, 2);

          const dly =in_info.data[in_info.data.length - 1] === "电信"? "🅳": in_info.data[in_info.data.length - 1] === "联通"
              ? "🅻": in_info.data[in_info.data.length - 1] === "移动"? "🆈": "";
          const out_info = await queryIpApi(proxy);
          if (flag) {
            // emoji
            if (in_info.ip === out_info.query) { proxy.name = "🆉直连" + "→" + getFlagEmoji(out_info.countryCode) + out_info.country;
            } else {
              proxy.name = dly + incity + "→" + getFlagEmoji(out_info.countryCode) + out_info.country;
            }
          } else {
            // no emoji
            if (in_info.ip === out_info.query) { proxy.name = "直连" + "→" + getFlagEmoji(out_info.countryCode) + out_info.country;
            } else {
              proxy.name = incity+in_info.data[in_info.data.length - 1] + "→" + out_info.country;
            }
          }
          // proxy.name = out_info.country; 只有国家
          // 新增一个去重用字段，该字段不显示在节点名字不需要修改 ,只用于去重, 重复那就是重复节点：入口IP|出口IP
          proxy.qc = in_info.ip + "|" + out_info.query;
        } catch (err) {
          console.log(`err = ${err}`);
        }
      })
    );
    i += batch_size;
  }
  // console.log("去重前的节点信息 = " + JSON.stringify(proxies));
  // 去除重复的节点
  proxies = removeDuplicateName(proxies);
  // console.log("去重后的节点信息 = " + JSON.stringify(proxies));
  // 按节点全名分组加序号
  const processedProxies = processProxies(proxies);
  // 去除去重时添加的qc属性
  proxies = removeqcName(proxies);
  console.log(`初始节点数 = ` + prs);
  console.log(`去重后个数 = ${proxies.length}`);
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  console.log(`方法总耗时 = ${timeDiff / 1000} 秒`);
}
//入口ip解析
async function queryDNSInfo(server) {
  return new Promise((resolve) => {
    const ips = server;
    const url = `http://www.inte.net/tool/ip/api.ashx?ip=${server}&datatype=json`;
    $.http.get({ url }).then((resp) => {
        const kkk = JSON.parse(resp.body);
        if (kkk.ip !== "0.0.0.0") {
          resolve(kkk);
        } else {resolve(ips);}
      }).catch((err) => {
        console.log("dns = " + err);
        reject(err);
      });
  });
}
// 查询落地ip
async function queryIpApi(proxy) {
  return new Promise((resolve, reject) => {
    const url = `http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query`;
    let node = ProxyUtils.produce([proxy], target);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("请求超时,丢弃节点"));
      }, timeout);
    });

    const queryPromise = $.http.get({url, node: node, // Loon or Surge IOS 
        "policy-descriptor": node, // Surge MAC
      }).then((resp) => {
        const data = JSON.parse(resp.body);
        if (data.status === "success") {
          resolve(data);
        } else {
          reject(new Error(data.message));
        }
      }).catch((err) => {
        console.log("api = " + err);
        reject(err);
      });
    // 超时处理
    Promise.race([timeoutPromise, queryPromise]).catch((err) => {
      reject(err);
    });
  });
}

function removeDuplicateName(arr) {
  const nameSet = new Set();
  const result = [];
  for (const e of arr) {
    if (e.qc && !nameSet.has(e.qc)) {
      nameSet.add(e.qc);
      result.push(e);
    }
  }
  return result;
}
function removeqcName(arr) {
  const nameSet = new Set();
  const result = [];
  for (const e of arr) {
    if (!nameSet.has(e.qc)) {
      nameSet.add(e.qc);
      const modifiedE = { ...e };
      delete modifiedE.qc;
      result.push(modifiedE);
    }
  }
  return result;
}
function getFlagEmoji(cc) {
    const codePoints = cc
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints).replace(/🇹🇼/g, "🇨🇳");
  }
function processProxies(proxies) {
  const groupedProxies = proxies.reduce((groups, item) => {
    const existingGroup = groups.find((group) => group.name === item.name);
    if (existingGroup) {
      existingGroup.count++;
      existingGroup.items.push({
        ...item,
        name: `${item.name} ${existingGroup.count.toString().padStart(2, "0")}`,
      });
    } else {
      groups.push({
        name: item.name,
        count: 1,
        items: [{ ...item, name: `${item.name} 01` }],
      });
    }
    return groups;
  }, []);
  const sortedProxies = groupedProxies.flatMap((group) => group.items);
  proxies.splice(0, proxies.length, ...sortedProxies);
  return proxies;
}