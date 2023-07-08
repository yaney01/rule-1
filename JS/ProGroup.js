/* 2023-07-09 02:01:14
作用: 根据 Surge httpApi 请求 (最近请求详情:速度、 参数指定的策略组:与其对应HASH节点延时、节点名)
策略: 根据 api 返回的节点 (速度:持久化缓存非线性权重) 与 (延时:持久化缓存) 对节点进行优选, 不用担心费流量，因为通过httpApi取的最近请求里的速度数据
参数: 

group=          你的策略组名(需要填写手动选择的策略组select)
tolerance=10    容差10ms 小于10ms则不切换节点
timecache=18    缓存到期时间(小时) 或 超过40个数据会清理旧的数据
push            加参数为开启通知, 不加参数则不通知

#!name=GroupAuto
#!desc=根据 api 返回的节点 (速度:持久化缓存非线性权重) 与 (延时:持久化缓存) 对节点进行优选

[Panel]
GroupAuto = script-name=GroupAuto,update-interval=3

[Script]
# 面板 运行 (面板与定时任务可同时存在)
GroupAuto = type=generic,timeout=3,script-path=https://github.com/Keywos/rule/raw/main/JS/ProGroup.js,argument=group=VPS&tolerance=10&timecache=18
# 定时自动运行 5分钟一次
Cron_GroupAuto = type=cron, cronexp= "0/5 * * * *", timeout=5,script-path=https://github.com/Keywos/rule/raw/main/JS/ProGroup.js,argument=group=VPS&tolerance=1&timecache=18

*/

let Groupkey="VPS",tol="10",th="18",push=false,timeout=9900;if(typeof $argument!=="undefined"&&$argument!==""){const e=getin("$argument");Groupkey=e.group?e.group:Groupkey;th=e.timecache?e.timecache:th;tol=e.tolerance?e.tolerance:tol;push=e.push?e.push:false;console.log(e)}(async()=>{const e=await httpAPI("/v1/requests/recent");let t,o,n;if(!e){console.log("kv");$done(bkey)}else{const o=e.requests.filter((e=>/\(Proxy\)/.test(e.remoteAddress))).map((e=>`${e.policyName}:${e.inMaxSpeed+e.outMaxSpeed}`));const n=[...new Set(o)];const r={};n.forEach((e=>{const[t,o]=e.split(":");if(!r[t]){r[t]=[parseInt(o),1]}else{r[t][0]+=parseInt(o);r[t][1]+=1}}));t=Object.entries(r).reduce(((e,[t,[o,n]])=>{const r=Math.round(o/n);e[t]=r;return e}),{})}const r=await httpAPI("/v1/policy_groups");if(!r){$done(bkey)}else{if(!Object.keys(r).includes(Groupkey)){$done({title:"GroupAuto",content:"group参数未输入正确的策略组"})}}const s=await httpAPI("/v1/policy_groups/test","POST",body={group_name:Groupkey});if(!s){$done(bkey)}else{o=s.available[0]}const c=await httpAPI("/v1/policies/benchmark_results");if(!c){console.log("有延时测速结果");$done(bkey)}else{n=r[Groupkey].map((e=>{const t=e.lineHash;const o=e.name;const n=c[t];const r=n?n.lastTestScoreInMS:998;return{name:o,ms:r}}));const e=n.reduce(((e,{name:t,ms:o})=>{e[t]=o;return e}),{});for(let o in t){if(e.hasOwnProperty(o)){e[o]=reSpeed(Number(t[o]),Number(e[o]))}}const s=(new Date).getTime();const u=$persistentStore.read("KEY_GroupAuto");let p=u?JSON.parse(u):{};p[Groupkey]=p[Groupkey]||{};let i=Object.keys(p[Groupkey]).length;for(const e in p[Groupkey]){if(i>65){delete p[Groupkey][e];i--}}let a=Object.values(p[Groupkey])[0]?String(Object.keys(Object.values(p[Groupkey])[0])):"";let l=String(Object.keys(e));if(a!==l)p[Groupkey]={};p[Groupkey][s]=e;const y=p[Groupkey];const h=Date.now();Object.keys(y).forEach((e=>{const t=h-parseInt(e);const o=t/(1e3*60*60*th);o>1&&delete y[e]}));p[Groupkey]=y;$persistentStore.write(JSON.stringify(p),"KEY_GroupAuto");const f={};for(const e in p[Groupkey]){const t=p[Groupkey][e];for(const e in t){const o=t[e];if(!f.hasOwnProperty(e)){f[e]=[]}const n=parseInt(o);const r=n<0?996:n;f[e].push(r)}}const k={};for(const e in f){const t=f[e];if(t.length>0){const o=t.reduce(((e,t)=>e+t),0);const n=Math.round(o/t.length);const r=rangeMax(t);k[e]=n+r}}let g=null,m=Infinity;for(const e in k){const t=k[e];if(t<m){g=e;m=t}}let d="";if(o===g){d="继承优选: "+g+": "+k[g]}else if(k[o]-k[g]>tol){await httpAPI("/v1/policy_groups/select","POST",body={group_name:Groupkey,policy:g});d="优选成功: "+g+": "+k[g]}else{d="容差内优选: "+o+": "+k[o]}console.log(d);push&&$notification.post("",d,"");const G=new Date(s),b=String(G.getHours()).padStart(2,"0"),S=String(G.getMinutes()).padStart(2,"0");$done({title:"GroupAuto "+b+":"+S+" "+Object.keys(p[Groupkey]).length+"C: "+Groupkey+"'"+Object.keys(r[Groupkey]).length,content:d})}})();function httpAPI(e="",t="GET",o=null){return new Promise(((n,r)=>{const s=new Promise(((e,t)=>{setTimeout((()=>{t("");n("")}),timeout)}));const c=new Promise((n=>{$httpAPI(t,e,o,n)}));Promise.race([c,s]).then((e=>{n(e)})).catch((e=>{r(e)}))}))}function getin(){return Object.fromEntries($argument.split("&").map((e=>e.split("="))).map((([e,t])=>[e,decodeURIComponent(t)])))}function reSpeed(e,t){if(e>1e6){return Math.round(t*.3)}else{const o=.99*Math.exp(-e/2e6);return Math.round(t*o)}}function rangeMax(e){const t=Math.max(...e),o=Math.min(...e);return t-o}var bkey={title:"GroupAuto",content:"超过Surge httpApi 10秒限制"};
