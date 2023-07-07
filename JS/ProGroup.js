/* 2023-07-06 01:22:12
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
GroupAuto = script-name=GroupAuto,update-interval=6

[Script]
# 面板 运行 (面板与定时任务可同时存在 C代表次数;  节点后面数字代表 速度, 延迟, 延迟最大与最小值的差 三者的取值)
GroupAuto = type=generic,timeout=6,script-path=https://github.com/Keywos/rule/raw/main/JS/ProGroup.js,argument=group=VPS&tolerance=10&timecache=18
# 定时自动运行 5分钟一次
Cron_GroupAuto = type=cron, cronexp= "0/5 * * * *", timeout=6,wake-system=0,script-path=https://github.com/Keywos/rule/raw/main/JS/ProGroup.js,argument=tolerance=1&timecache=18&group=Proxy

*/
let Groupkey = "VPS",tol = "10",th = "18",p = "", j = "", push = false;
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  Groupkey = ins.group ? ins.group : Groupkey;
  th = ins.timecache ? ins.timecache : th;
  tol = ins.tolerance ? ins.tolerance : tol;
  push = ins.push ? ins.push : false;
}
(async () => {
  // 获取请求记录详情过滤获取最高上下传速度
  const Speed = await httpAPI("/v1/requests/recent");
  const inoutMax = Speed.requests
    .filter((o) =>/\(Proxy\)/.test(o.remoteAddress))
    .map((i) => `${i.policyName}:${i.inMaxSpeed + i.outMaxSpeed}`);
  const uValue = [...new Set(inoutMax)];
  const avgts = {};
  uValue.forEach((value) => {
    const [name, num] = value.split(":");
    if (!avgts[name]) {
      avgts[name] = [parseInt(num), 1];
    } else {
      avgts[name][0] += parseInt(num);
      avgts[name][1] += 1;
    }
  });
  // 根据提取的速度调整优先级
  const ioSpee = Object.entries(avgts).reduce(
    (obj, [name, [sum, count]]) => {
      const average = Math.round(sum / count);
      obj[name] = average;
      return obj;
    },
    {}
  );
  // 获取策略组内节点
  const proxy = await httpAPI("/v1/policy_groups");
  // 提取 name 属性的值到一个新数组
  const proxyName = proxy[Groupkey].map((obj) => obj.name);

  // 请求测速选择的策略组
  const testReq = await httpAPI("/v1/policy_groups/test", "POST", (body = { group_name: Groupkey }));
  const nowproxy = testReq.available[0];

  // 获取所有延时测速结果
  const testGroup = await httpAPI("/v1/policies/benchmark_results");
  // 提取 /v1/policy_groups 代理节点 中的 name 和 lineHash 的值
  const resultsMs = proxy[Groupkey].map((i) => {
    const lineHash = i.lineHash;
    const name = i.name;
    // 获取对应 /v1/policies/benchmark_results 的 lastTestScoreInMS为ms
    const HashValue = testGroup[lineHash];
    const HashMs = HashValue ? HashValue.lastTestScoreInMS : 998;
    return { name, ms: HashMs };
  });
  //.filter(i => i.ms !== -1); //过滤测速失败的
  //console.log(JSON.stringify(resultsMs, null, 2));
  // 提取的测速结果
  const kv = resultsMs.reduce((obj, { name, ms }) => {
    obj[name] = ms;
    return obj;
  }, {});
  
  // 速度高的优选权重变高
  for (let key in ioSpee) {
    if (kv.hasOwnProperty(key)) {
      kv[key] = reSpeed(Number(ioSpee[key]), Number(kv[key]));
    }
  }
  const t = new Date().getTime();
  // 读取存储的数据
  const readData = $persistentStore.read("KEY_GroupAuto");
  let k = readData ? JSON.parse(readData) : {};
  k[Groupkey] = k[Groupkey] || {};
  // 按个数 清理旧缓存
  let timeNms = Object.keys(k[Groupkey]).length;
  for (const t in k[Groupkey]) {
    if (timeNms > 40) {
      delete k[Groupkey][t];
      timeNms--;
    }
  }
  k[Groupkey][t] = kv;
  // 按时间戳 清理旧缓存
  const GT = k[Groupkey];
  const cleanT = Date.now();
  Object.keys(GT).forEach((t) => {
    const cha = cleanT - parseInt(t);
    const hours = cha / (1000 * 60 * 60 * th);
    hours > 1 && delete GT[t];
  });
  k[Groupkey] = GT;
  $persistentStore.write(JSON.stringify(k), "KEY_GroupAuto");
  //console.log(JSON.stringify(k[Groupkey],null,2));
  const AllKey = {};
  for (const key in k[Groupkey]) {
    const io = k[Groupkey][key];
    for (const sp in io) {
      const score = io[sp];
      if (!AllKey.hasOwnProperty(sp)) {
        AllKey[sp] = [];
      }
      const np = parseInt(score);
      const valuep = np < 0 ? 996 : np;
      AllKey[sp].push(valuep);
    }
  }
  
  // 计算平均与最大最小差值
    const avgt = {};
  for (const sp in AllKey) {
    const sa = AllKey[sp];
    if (sa.length > 0) {
      const sum = sa.reduce((a, b) => a + b, 0);
      const average = Math.round(sum / sa.length);
      const rangei = rangeMax(sa)
      avgt[sp] = average + rangei;
    }
  }
  
  let minKey = null, minValue = Infinity;
  for (const key in avgt) {
    const value = avgt[key];
    if (value < minValue) {
      minKey = key;
      minValue = value;
    }
  }
  
  let Pushs = "";
  if (nowproxy === minKey) {
		Pushs = "继承优选: " + minKey +": " + avgt[minKey]
   
  } else if (avgt[nowproxy] - avgt[minKey] > tol) {
    await httpAPI("/v1/policy_groups/select","POST",(body = { group_name: Groupkey, policy: minKey }));
    Pushs = "优选成功: " + minKey +": " + avgt[minKey]
  } else {
    Pushs = "容差,继承优选: " + minKey +": " + avgt[minKey]
  }
  console.log(Pushs);
  const te = new Date(t),he = te.getHours(),me = te.getMinutes();
  (push) && ($notification.post("",Pushs,""));
  $done({
    title: "GroupAuto " + he +":"+ me +" "+ Object.keys(k[Groupkey]).length+"C: "+ Groupkey,
    content: Pushs,
  });
})();
function httpAPI(path = "", method = "GET", body = null) {
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
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
function reSpeed(x, y) {
  if (x > 1e6) {
    return Math.round(y * 0.3);
  } else {
    const ob = 0.99 * Math.exp(-x / 2e6);
    return Math.round(y * ob);
  }
}

function rangeMax(e) {
  const max = Math.max(...e),
  min = Math.min(...e);
  return max - min;
}
