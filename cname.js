// key cname: cache name
const $ = $substore;
// 持久化缓存
const FILE_CACHE_KEY = '#KEYNAME';
// 传入为分钟, 默认48小时
const CD_KEY = $arguments["cd"] ? $arguments["cd"] * 60000 : 48 * 3600 * 1000;
// api lj
// const citys = $arguments["city"];
const { isLoon, isSurge, isQX } = $substore.env;
const target = isLoon ? "Loon" : isSurge ? "Surge" : isQX ? "QX" : undefined;
// 第一次没有缓存的ping超时时间
var timeout = $arguments["timeout"] ? $arguments["timeout"] : 3000;
// 有缓存后ping超时时间
var with_cache = $arguments["ntimeout"] ? $arguments["ntimeout"] : 400;
// 节点前面加机场名
const keynames = $arguments.name ? decodeURI($arguments.name) : "";
// 清理相同地区节点的01
const numone = $arguments["one"];
async function operator(proxies) {
const support = (isLoon || isSurge);
if (!support) { $.error(`No Loon or Surge`);
    $notify("不支持此设备","本脚本仅支持 Loon or Surge",'')
    return proxies; 
}
// 批处理个数
var batch_size = $arguments["batch"] ? $arguments["batch"] : 16;
console.log(`缓存超时时间: ${formatCacheTimeout(CD_KEY)}`);
console.log(`批处理节点数: ${batch_size} 个`);
console.log(`设定API超时: ${timeout} 毫秒`)
with_cache > 0 ? console.log(`有缓API超时: ${with_cache} 毫秒`) : null;
    const startTime = new Date();
    const PRS = proxies.length;
    console.log(`开始处理节点: ${PRS} 个`);
        const batches = [];
        let i = 0;
        while (i < proxies.length) {
            const batch = proxies.slice(i, i + batch_size);
            await Promise.all(batch.map(async proxy => {
                try {
                    //  去掉国旗
                    // let proxyName = removeFlag(proxy.name);

                    const inip = await INDNS(proxy);
                    // names = inip.ip;
                    // console.log("DNS" + JSON.stringify(inip.ip));
                
                    // console.log("in节点ip = " + JSON.stringify(inip.data[1]));
                    // // query ip-api

                    const outip = await IPAPI(proxy);
                    // names = outip.country

                    names = inip.data[1].slice(0, 2) +" "+ outip.country 
                    proxy.name = names; 
                    // console.log(proxy.name)
                    proxy.qc = inip.ip + "|" + outip.query;

                } catch (err) {
                }
            }));
            // await sleep(10);
            i += batch_size;
        }
    // console.log("处理前节点信息 = " + JSON.stringify(proxies));
    proxies = removeDuplicateName(proxies);
    // 去除去重时添加的qc属性
    proxies = removeqcName(proxies);
    // 按节点全名分组加序号
    proxies = processProxies(proxies);
    if (keynames !== "") { proxies.forEach(proxy => { 
    proxy.name = keynames + ' ' + proxy.name;});}
    // console.log("处理后节点信息 = " + JSON.stringify(proxies));
    //清理相同地区节点的01
    numone && (proxies = oneProxies(proxies));
    const PRSO = proxies.length
    const endTime = new Date();
    const timeDiff = endTime.getTime() - startTime.getTime();
    DELKEY > 0 ? console.log(`清理缓存数量: ${DELKEY} 个`) : null;
    DNSKEY > 0 ? console.log(`无缓存或过期: ${DNSKEY} 个`) : null;
    APICACHEKEY > 0 ? console.log(`读取API缓存: ${APICACHEKEY} 个`) : null;
    APIKEY > 0 ? console.log(`写入API缓存: ${APIKEY} 个`) : null;
    console.log(`处理完后剩余: ${PRSO} 个`);
    console.log(`此次方法耗时: ${timeDiff / 1000} 秒`);
    //CACHEKEY > 0 ? console.log(`DNS缓存数量: ${CACHEKEY}个`) : null;
    //DNSWRITEKEY > 0 ? console.log(`DNS写入缓存: ${DNSWRITEKEY}个`) : null;

    return proxies;
}

let DNSKEY = 0;
// let CACHEKEY = 0;
// let DNSWRITEKEY = 0;
// 持久化存储每个代理的查询任务
const ins = new Map();
async function INDNS(proxy) {
  const resourceCache = new ResourceCache(CD_KEY);
    // console.log("查询的入口为: "+ proxy.server)
    const id = getinId(proxy);
    if (ins.has(id)) {
      return ins.get(id); 
    };
    const cacheds = resourceCache.get(id);
    if (cacheds) {
      // CACHEKEY++;
        // console.log("DNS缓存读取成功"+JSON.stringify(cacheds.dnsip.data[1]))
        return (cacheds.dnsip);
      }else{
      DNSKEY++;
      // console.log("无缓存或过期, DNS请求中....")
      const resultin = new Promise((resolve, reject) => {
      const ips = proxy.server;
      const url = `http://www.inte.net/tool/ip/api.ashx?ip=${ips}&datatype=json`;
      $.http
        .get({ url })
        .then((resp) => {
          const dnsip = JSON.parse(resp.body);
          if (dnsip.ip !== "0.0.0.0") {
              resourceCache.set(id, {dnsip});
              // console.log("写入缓存DNS: "+ dnsip)
              // DNSWRITEKEY++;
              resolve(dnsip);
          } else {
              // resourceCache.set(id, dnsip);
              resolve(ips);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
      ins.set(id, resultin);
      return resultin;
  }
};

let APIKEY = 0;
let APICACHEKEY = 0;
const outs = new Map(); 
async function IPAPI(proxy) {
const resourceCache = new ResourceCache(CD_KEY);
  // console.log("API")
  const id = getId(proxy);
  // console.log("id是"+id)
  if (outs.has(id)) {
    // console.log("API有缓存返回")
    return outs.get(id); 
  };
  const cached = resourceCache.get(id);
  if (cached) {
    timeout = with_cache;
    APICACHEKEY++;
    // console.log("读取IPAPI缓存成功:" + cached.lip.country)
    return cached.lip;
  }else{
  const result = new Promise((resolve, reject) => {
    // console.log("无缓存或过期 IPAPI请求中....")
    const url = `http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query`;
    let node = ProxyUtils.produce([proxy], target);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("timeout"));
      }, timeout);
    });
    const queryPromise = $.http.get({
      url, node: node,
      "policy-descriptor": node,
    }).then(resp => {
      const lip = JSON.parse(resp.body);
      if (lip.status === "success") {
        resourceCache.set(id, {lip});
        APIKEY++;
        // console.log("写入IPAPI缓存")
        resolve(lip);
      } else {
        reject(new Error(lip.message));
      }
      }).catch(err => {
        // console.log(err);
        reject(err);
      });
      Promise.race([timeoutPromise, queryPromise]).catch((err) => { reject(err); });
    });

    outs.set(id, result);
    return result;
  }
}

let DELKEY = 0;class ResourceCache {constructor(expires) {this.expires = expires;if (!$.read(FILE_CACHE_KEY)) {
$.write('{}', FILE_CACHE_KEY);}this.resourceCache = JSON.parse($.read(FILE_CACHE_KEY));this._cleanup();}_cleanup() {
let clear = false;Object.entries(this.resourceCache).forEach((entry) => {const [id, updated] = entry;if (!updated.time) {delete this.resourceCache[id];
$.delete(`#${id}`);clear = true;}if (new Date().getTime() - updated.time > this.expires) {
delete this.resourceCache[id];clear = true;DELKEY++;}});if (clear) this._persist();};revokeAll() {this.resourceCache = {};
this._persist();};_persist() {$.write(JSON.stringify(this.resourceCache), FILE_CACHE_KEY);}
get(id) {const updated = this.resourceCache[id] && this.resourceCache[id].time;
if (updated && new Date().getTime() - updated <= this.expires) {;return this.resourceCache[id].data;};
return null;};set(id, value) {this.resourceCache[id] = { time: new Date().getTime(), data: value };this._persist();}}
function getId(proxy){return MD5(`DATAKEY-${proxy.server}-${proxy.port}`);}
function getinId(proxy) {return MD5(`INKEY-${proxy.server}`);}
function sleep(ms) {return new Promise((resolve) => setTimeout(resolve, ms));}
function getFlagEmoji(countryCode) {const codePoints = countryCode.toUpperCase().split('').map
(char => 127397 + char.charCodeAt());return String.fromCodePoint(...codePoints).replace(/🇹🇼/g, '🇨🇳');}
function removeFlag(str) {return str.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, '').trim();}
function formatCacheTimeout(timeout) {if (timeout < 60000) {return `${Math.round(timeout/1000)} 秒`;}else if(timeout < 3600000){return `${Math.round(timeout/60000)} 分钟`;}else{return `${(timeout/3600000).toFixed(1)} 小时`;}}
function removeDuplicateName(arr){const nameSet=new Set;const result=[];for(const e of arr){if(e.qc&&!nameSet.has(e.qc)){nameSet.add(e.qc);result.push(e)}}return result}
function removeqcName(arr){const nameSet=new Set;const result=[];for(const e of arr){if(!nameSet.has(e.qc)){nameSet.add(e.qc);const modifiedE={...e};delete modifiedE.qc;result.push(modifiedE)}}return result}
function processProxies(proxies) {const groupedProxies = proxies.reduce((groups, item) => {const existingGroup = groups.find(group => group.name === item.name);
if (existingGroup) {existingGroup.count++;existingGroup.items.push({ ...item, name: `${item.name} ${existingGroup.count.toString().padStart(2, '0')}` });} else {groups.push({ name: item.name, count: 1,
items: [{ ...item, name: `${item.name} 01` }] });}return groups;}, []);const sortedProxies = groupedProxies.flatMap(group =>group.items);proxies.splice(0,proxies.length, ...sortedProxies);return proxies;}
function oneProxies(proxies){const groups = proxies.reduce((groups, proxy) => { const name = proxy.name.replace(/\s\d+$/, ''); if (!groups[name]) { groups[name] = []; } groups[name].push(proxy);
return groups; }, {});for(const name in groups) {if (groups[name].length === 1 && groups[name][0].name.endsWith(' 01')) {const proxy = groups[name][0];proxy.name = name;}};return proxies;}
var MD5=function(d){var _=M(V(Y(X(d),8*d.length)));return _.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;
r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;
m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);
return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16)
{var h=m,g=f,t=r,a=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,
r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),
r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),
r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),
r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),
r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),
r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),
r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),
r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),
r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),
r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),
r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),
r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),
r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),
r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),
r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),
r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),
m=safe_add(m,h),f=safe_add(f,g),r=safe_add(r,t),i=safe_add(i,a)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol
(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n)
{return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n)
{return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}
function bit_rol(d,_){return d<<_|d>>>32-_}
