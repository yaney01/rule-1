/* 2023-07-10 17:18:50
作用: 
· 如果策略组 节点变更 会重新缓存结果 重新取值 面板的1C 代表取值次数
· 如果有节点偶尔ping不通 那么大概率不会选中他 
· 如果某个节点虽然延迟低 但是速度很差 也不会选他 0.01M代表最高速度
策略: 
· 根据 api 返回的节点 速度, 延时 (持久化缓存) 对节点进行优选,

必选参数:
group=          你的策略组名(需要填写手动选择的策略组select)

可选参数:
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

let Groupkey="VPS",tol="10",th="18",push=false,timeout=9900;if(typeof $argument!=="undefined"&&$argument!==""){const e=getin("$argument");Groupkey=e.group?e.group:Groupkey;th=e.timecache?e.timecache:th;tol=e.tolerance?e.tolerance:tol;push=e.push?e.push:false}(async()=>{let e,t,o={},n="";const s=await httpAPI("/v1/policy_groups");if(!Object.keys(s).includes(Groupkey)){$done({title:"GroupAuto",content:"group参数未输入正确的策略组"})}const r=await httpAPI("/v1/policy_groups/test","POST",body={group_name:Groupkey});if(!r){$done(bkey)}else{e=r.available[0]}const c=await httpAPI("/v1/traffic");const{connector:u}=c;const i={};Object.keys(u).forEach((e=>{const{inMaxSpeed:t,outMaxSpeed:o,lineHash:n}=u[e];if(n&&t){i[n]=t+o}}));const a=await httpAPI("/v1/policies/benchmark_results");t=s[Groupkey].map((e=>{const t=e.lineHash;const o=e.name;let n=a[t];if(n.lastTestScoreInMS===-1){n.lastTestScoreInMS=9999}const s=n?n.lastTestScoreInMS:9988;return{name:o,ms:s,lineHash:t}}));t.forEach((e=>{var t=e.lineHash;if(t in i){e.se=i[t]}else{e.se="0"}delete e.lineHash}));const p=(new Date).getTime();const l=$persistentStore.read("KEY_GroupAutos");let f=l?JSON.parse(l):{};f[Groupkey]=f[Groupkey]||{};let h=Object.keys(f[Groupkey]).length;for(const e in f[Groupkey]){if(h>65){delete f[Groupkey][e];h--}}if(Object.values(f[Groupkey])[0]){const e=Object.values(f[Groupkey])[0];if(e.some((e=>!t.some((t=>t.name===e.name))))){f[Groupkey]={};console.log("数据变更，清理缓存")}}f[Groupkey][p]=t;const y=Date.now();Object.keys(f).forEach((e=>{const t=f[e];Object.keys(t).forEach((e=>{const o=y-parseInt(e);const n=o/(36e4*th);if(n>1){delete t[e]}}))}));$persistentStore.write(JSON.stringify(f),"KEY_GroupAutos");Object.values(f[Groupkey]).forEach((e=>{e.forEach((({name:e,ms:t,se:n})=>{if(!o[e]){o[e]={sum:t,count:1,sek:n}}else{o[e].sum+=t;o[e].sek+=n;o[e].count++}}))}));Object.keys(o).forEach((e=>{const{sum:t,count:n,sek:s}=o[e];o[e]={sum:t,count:n,sek:s/n,avg:reSpeed(s,t/n)}}));const m=Object.fromEntries(Object.entries(o).map((([e,t])=>[e,t.avg])));let k=null,g=Infinity;for(const e in m){const t=m[e];if(t<g){k=e;g=t}}if(e===k){n="继承: "+k+": "+o[k]["count"]+"C"+" "+BtoM(o[k]["sek"])+" "+m[k]}else if(m[e]-m[k]>tol){await httpAPI("/v1/policy_groups/select","POST",body={group_name:Groupkey,policy:k});n="优选: "+k+": "+o[k]["count"]+"C"+" "+BtoM(o[k]["sek"])+" "+m[k]}else{n="容差:"+e+": "+o[e]["count"]+"C"+" "+BtoM(o[e]["sek"])+" "+m[e]}console.log(n);push&&$notification.post("",n,"");const G=new Date(p),d=G.getHours(),b=G.getMinutes();$done({title:"GroupAuto "+Groupkey+"'"+Object.keys(s[Groupkey]).length+"  "+d+":"+b,content:n})})();function httpAPI(e="",t="GET",o=null){return new Promise(((n,s)=>{const r=new Promise(((e,t)=>{setTimeout((()=>{t("");n("")}),timeout)}));const c=new Promise((n=>{$httpAPI(t,e,o,n)}));Promise.race([c,r]).then((e=>{n(e)})).catch((e=>{s(e)}))}))}function getin(){return Object.fromEntries($argument.split("&").map((e=>e.split("="))).map((([e,t])=>[e,decodeURIComponent(t)])))}function reSpeed(e,t){if(e>1e7){return Math.round(t*.6)}else{const o=.99*Math.exp(-e/2e7);return Math.round(t*o)}}var bkey={title:"GroupAuto",content:"超过Surge httpApi 限制"};function BtoM(e){var t=e/(1024*1024);if(t<.01){return"0.01M"}return t.toFixed(2)+"M"}
