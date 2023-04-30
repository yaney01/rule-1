/* 66688
符号：🅳=电信 🅻=联通 🆈=移动 🆉=直连 🅶=垃圾
接口：入口查询[inte.net],落地查询[ip-api]；
功能：根据接口返回的真实结果，重新对节点命名，添加入口城市、落地国家或地区、国内运营商信息；
作者：@Key @奶茶姐
用法：Sub-Store脚本操作添加； 只支持 Surge Loon
地址：https://脚本地址/name.js#flag&timeout=1000
日期：2023/04/30
--------
以下是此脚本支持的参数，多个参数使用"&"连接，参考上述地址为例使用参数。
[sim]使用简写(第一个字),如: 广移, 而不是: 广东移动 ...
[timeout=2000ms]最大超时参数，超出允许范围则判定为无效节点，默认1000ms；
[flag]添加旗帜、运营商符号和直连符号，默认无此参数；
[city]添加入口城市名，默认不添加城市名，无 city 参数则只输出省份不输出城市；
[batch=16]每次检查多少节点，默认每次16个节点。
*/

const $ = $substore
const sim = $arguments["sim"];
const flag = $arguments["flag"];
const citys = $arguments["city"];
const { isLoon, isSurge, isQX } = $substore.env;
const batch_size = $arguments["batch"] ? $arguments["batch"] : 16;
const timeout = $arguments["timeout"] ? $arguments["timeout"] : 1000;
const target = isLoon ? "Loon" : isSurge ? "Surge" : isQX ? "QX" : undefined;
async function operator(proxies) {
  const support = (isLoon || isSurge);
  if (!support) { $.error(`No Loon or Surge`);
    return proxies; }
  const startTime = new Date();
  const prs = proxies.length; //初始节点数
  // console.log("初始节点数 = " + proxies.length);
  let i = 0;
  while (i < proxies.length) {
    const batch = proxies.slice(i, i + batch_size);
    await Promise.allSettled(
      batch.map(async (proxy) => {
        try {

            const in_info = await queryDNSInfo(proxy.server);
            // console.log(proxy.server + "in节点ip = " + JSON.stringify(in_info));

            const out_info = await queryIpApi(proxy);

            const incity = citys
            ? (in_info.data[2] || in_info.data[1] || in_info.data[0]).slice(0, 2)
            : (in_info.data[1] || in_info.data[0]).slice(0, 2);

            if (flag) { 
                // emoji
                const kkEmoji = { '电信': '🅳', '联通': '🅻', '移动': '🆈', };
                const operator = in_info.data[in_info.data.length - 1];
                const dly = kkEmoji[operator] || '🅶';
                if (in_info.ip === out_info.query) { 
                  proxy.name = "🆉直连" + "→" + getFlagEmoji(out_info.countryCode) + out_info.country;
                } else {
                  proxy.name = dly + incity + "→" + getFlagEmoji(out_info.countryCode) + out_info.country;
                }
            } else if (sim) {
                // simple
                if (in_info.ip === out_info.query) {
                    proxy.name = "直连" + "→" + out_info.country;
                } else {                
                    proxy.name = incity.slice(0, 1) + (in_info.data[in_info.data.length - 1].length === 2 ? in_info.data[in_info.data.length - 1].slice(0 ,1) : "中转") + "→" + out_info.country;
                }
            } else {
                // no emoji
                if (in_info.ip === out_info.query) {
                    proxy.name = "直连" + "→" + out_info.country;
                } else {                
                    proxy.name = incity + (in_info.data[in_info.data.length - 1].length === 2 ? in_info.data[in_info.data.length - 1] : "中转") + "→" + out_info.country;
                //console.log(proxy.name)
              }
            }
          // proxy.name = out_info.country; //只有国家
          // 去重字段不显示在节点名,判断方法：入口IP 与 出口IP
          proxy.qc = in_info.ip + "|" + out_info.query;
        //   console.log(proxy.qc)
        } catch (err) {
          // console.log(`err = ${err}`);
        } }) ); i += batch_size;
  }
  // console.log("去重前的节点信息 = " + JSON.stringify(proxies));
  proxies = removeDuplicateName(proxies);
  // console.log("去重后的节点信息 = " + JSON.stringify(proxies));
  // 去除去重时添加的qc属性
  proxies = removeqcName(proxies);
  //console.log("去重后的节点信息 = " + JSON.stringify(proxies));
  // 按节点全名分组加序号
  const processedProxies = processProxies(proxies);
  //console.log("加序号后的节点信息 = " + JSON.stringify(proxies));
  console.log(`初始节点数 = ` + prs);
  console.log(`去重后个数 = ${proxies.length}`);
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  console.log(`方法总耗时 = ${timeDiff / 1000} 秒`);
  return proxies;
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
        // console.log("dns = " + err);
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
        reject(new Error("超过timeout设定时间,过滤此节点"));
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
        } }).catch((err) => { reject(err); });
    // 超时处理
    Promise.race([timeoutPromise, queryPromise]).catch((err) => { reject(err); });
  });
}
function removeDuplicateName(arr){const nameSet=new Set;const result=[];for(const e of arr){if(e.qc&&!nameSet.has(e.qc)){nameSet.add(e.qc);result.push(e)}}return result}
function removeqcName(arr){const nameSet=new Set;const result=[];for(const e of arr){if(!nameSet.has(e.qc)){nameSet.add(e.qc);const modifiedE={...e};delete modifiedE.qc;result.push(modifiedE)}}return result}
function processProxies(proxies) {const groupedProxies = proxies.reduce((groups, item) => {const existingGroup = groups.find(group => group.name === item.name);if (existingGroup) {existingGroup.count++;existingGroup.items.push({ ...item, name: `${item.name} ${existingGroup.count.toString().padStart(2, '0')}` });} else {groups.push({ name: item.name, count: 1, items: [{ ...item, name: `${item.name} 01` }] });}return groups;}, []);const sortedProxies = groupedProxies.flatMap(group =>group.items);proxies.splice(0,proxies.length, ...sortedProxies);return proxies;}
function getFlagEmoji(cc){const codePoints=cc.toUpperCase().split("").map((char=>127397+char.charCodeAt()));return String.fromCodePoint(...codePoints).replace(/🇹🇼/g,"🇨🇳")}