// @key修改@奶茶姐 测试!!! 优化速度 alidns-解析入口ip + ip-api-解析落地ip 节点去重重命名为： 旗帜(可选) 地区 序号
// argument传入： flag 时候，添加国旗，默认不添加，例如： https://keywos.cf/name.js#flag
// argument传入： timeout=数字（单位ms） 设置节点ping超时时间 不传入参数默认为800ms 
// 例如： https://keywos.cf/name.js#timeout=1000  为1秒
// 多个参数 & 连接 https://keywos.cf/name.js#timeout=1000&flag  加国旗+超时1s
// 奶茶姐：https://github.com/fmz200/wool_scripts/blob/main/scripts/rename_simple.js
// 脚本作用：在SubStore内对节点重命名为：旗帜可选  地区 序号，
// 使用方法：SubStore内选择“脚本操作”，然后填写上面的脚本地址
// 支持平台：目前只支持Loon，Surge ,不支持qx 因为qx目前不能指定节点更新时间：2023.04.26
const $ = $substore;
const {isLoon, isSurge, isQX} = $substore.env;
// 节点转换的目标类型
const target = isLoon ? "Loon" : isSurge ? "Surge" : isQX ? "QX" : undefined;
// 判断传入超时 值，单位：ms
const timeout = $arguments['timeout'] ? $arguments['timeout'] : 800;
// argument传入 flag 时候，添加国旗
const flag = $arguments['flag'];
// const zz = $arguments['zz'];
// 每一次处理的节点个数
const batch_size = $arguments['batch']? $arguments['batch'] : 20;

async function operator(proxies) {
  const startTime = new Date(); // 获取当前时间作为开始时间
  console.log("初始节点数 = " + proxies.length);
  let i = 0;
  while (i < proxies.length) {
    const batch = proxies.slice(i, i + batch_size);
    await Promise.allSettled(batch.map(async proxy => {
      try {
        // 查询入口IP信息
        const in_info = await queryDNSInfo(proxy.server);
        // console.log(proxy.server + "in节点信息 = " + JSON.stringify(in_info));
        // 查询出口IP信息
        const out_info = await queryIpApi(proxy);
        // console.log(proxy.server + "out节点信息 = " + JSON.stringify(out_info));
        // 节点重命名为：旗帜|策略|序号
        // const type = in_info.data === out_info.query ? "直连" : "中转";
        const type = in_info === out_info.query ? "直连" : "中转";
        
         //proxy.name = getFlagEmoji(out_info.countryCode) + ' ' + type + "->" + out_info.country;
        proxy.name = flag ? getFlagEmoji(out_info.countryCode) + " " + type + "->" + out_info.country : out_info.country;
        
        // 新增一个去重用字段，该字段不显示在节点名字不需要修改 ,只用于去重, 重复那就是重复节点：入口IP|出口IP
        proxy.qc = in_info + "|" + out_info.query;
      } catch (err) { 
        console.log(`err = ${err}`);
      }
    }));
    i += batch_size;
  }
  // console.log("💰💕去重前的节点信息 = " + JSON.stringify(proxies));
  // 去除重复的节点
  proxies = removeDuplicateName(proxies);
  // console.log("去重后的节点信息 = " + JSON.stringify(proxies));
  console.log(`去重后个数 = ${proxies.length}`);
  // 去除去重时添加的qc属性: ip 与 dns解析ip
  proxies = removeqcName(proxies);
  // console.log("去qc后的节点信息 = " + JSON.stringify(proxies));
  // 加序号
  const processedProxies = processProxies(proxies);
  // console.log("排序后的节点信息 = " + JSON.stringify(proxies));
  const endTime = new Date(); // 获取当前时间作为结束时间
  const timeDiff = endTime.getTime() - startTime.getTime(); // 获取时间差（以毫秒为单位）
  console.log(`方法总耗时 = ${timeDiff / 1000} 秒`); // 将时间差转换为秒并打印到控制台上
  return proxies;
}
//查询入口 阿里dns 不返回国家信息 速度快 去重够用
async function queryDNSInfo(server) {
  return new Promise((resolve, reject) => {
    const url = `http://223.5.5.5/resolve?name=${server}`;
    $.http.get({
      url
    }).then(resp => {
      const data = JSON.parse(resp.body);
      if (data.Status === 0) {
        // Status: 0,成功，返回最下面的ip
        // resolve(data.Answer[0]);
        const ips = data.Answer[data.Answer.length - 1].data;
        resolve(ips);
      } else if (data.Status === 3) {
        // 阿里dns Status: 3,失败，返回server
        // resolve(data.Question);
        const ips = data.Question.name;
        resolve(ips);
      } else {
        reject(new Error(data.message));
      }
    }).catch(err => {
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

    // Loon 需要去掉节点名字
    if (isLoon) {
      node = node.substring(node.indexOf("=") + 1);
    }
    // QX只要tag的名字，目前QX本身不支持
    const opts = {policy: node.substring(node.lastIndexOf("=") + 1)};

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("请求超时,丢弃节点"));
      }, timeout);
    });

    const queryPromise =
      $.http.get({
        url,
        opts: opts, // QX的写法
        node: node, // Loon和Surge IOS
        "policy-descriptor": node // Surge MAC
      }).then(resp => {
        const data = JSON.parse(resp.body);
        if (data.status === "success") {
          resolve(data);
        } else {
          reject(new Error(data.message));
        }
      }).catch(err => {
        console.log("api = " + err);
        reject(err);
      });
    // 超时处理
    Promise.race([timeoutPromise, queryPromise])
      .catch(err => {
        reject(err);
      });
  });
}

function removeDuplicateName(arr){const nameSet=new Set;const result=[];for(const e of arr){if(e.qc&&!nameSet.has(e.qc)){nameSet.add(e.qc);result.push(e)}}return result}
function removeqcName(arr){const nameSet=new Set;const result=[];for(const e of arr){if(!nameSet.has(e.qc)){nameSet.add(e.qc);const modifiedE={...e};delete modifiedE.qc;result.push(modifiedE)}}return result}
function processProxies(proxies) {const groupedProxies = proxies.reduce((groups, item) => {const existingGroup = groups.find(group => group.name === item.name);if (existingGroup) {existingGroup.count++;existingGroup.items.push({ ...item, name: `${item.name} ${existingGroup.count.toString().padStart(2, '0')}` });} else {groups.push({ name: item.name, count: 1, items: [{ ...item, name: `${item.name} 01` }] });}return groups;}, []);const sortedProxies = groupedProxies.flatMap(group =>group.items);proxies.splice(0,proxies.length, ...sortedProxies);return proxies;}
function getFlagEmoji(countryCode){const codePoints=countryCode.toUpperCase().split("").map((char=>127397+char.charCodeAt()));return String.fromCodePoint(...codePoints).replace(/🇹🇼/g,"🇨🇳")}
