/* 2023-07-10 17:18:50
作用: 
· 如果策略组 节点变更 会重新缓存结果 重新取值
· 如果有节点偶尔ping不通 那么大概率不会选中他 
· 如果某个节点虽然延迟低 但是速度很差 也不会选他
策略: 
· 根据 api 返回的节点 速度, 延时 (持久化缓存) 对节点进行优选,
面板说明:
· 继承: Tokyo: 40C 6.54M 61    [Tokyo]代表优选的节点, [40C]代表次数, [6.54M]代表最高速度, [61]表示综合评分按速度和延时非线性改变
  GroupAuto VPS'4  17:41      [VPS]代表优选的策略组名  ['4]代表策略组中有4个节点

# 必选参数:
# group=          你的策略组名(需要填写手动选择的策略组select)

# 可选参数:
# tolerance=10    容差10ms 小于10ms则不切换节点
# timecache=18    缓存到期时间(小时) 或 超过40个数据会清理旧的数据
# push            加参数为开启通知, 不加参数则不通知
#!name=GroupAuto
#!desc=根据 api 返回的节点 (速度:持久化缓存非线性权重) 与 (延时:持久化缓存) 对节点进行优选

[Panel]
GroupAuto = script-name=GroupAuto,update-interval=3

[Script]
# 面板 运行 (面板与定时任务可同时存在)
GroupAuto = type=generic,timeout=3,script-path=https://github.com/Keywos/rule/raw/main/JS/ProGroup.js,argument=group=VPS&tolerance=10&timecache=18
# 定时自动运行(可选需取消#注释) 30分钟一次,每天2到7点不运行
# Cron_GroupAuto = type=cron, cronexp= "*/30 0,1,7-23 * * *", timeout=10,wake-system=0,script-path=https://raw.githubusercontent.com/Keywos/rule/main/JS/ProGroup.js, argument=tolerance=10&timecache=18&group=Proxy

*/

let Groupkey = "VPS", tol = "10", th = "18", push = false;
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  Groupkey = ins.group ? ins.group : Groupkey;
  th = ins.timecache ? ins.timecache : th;
  tol = ins.tolerance ? ins.tolerance : tol;
  push = ins.push ? ins.push : false;}
(async () => {
  let NP,resMs,AK = {},Pushs = "";
  const proxy = await httpAPI("/v1/policy_groups");
  if (!Object.keys(proxy).includes(Groupkey)) {
    $done({title: "GroupAuto",content: "group参数未输入正确的策略组",});
  }
  const testReq = await httpAPI("/v1/policy_groups/test","POST",(body = { group_name: Groupkey }));
  if (!testReq) {$done(bkey);} else { NP = testReq.available[0] }
  const Sproxy = await httpAPI("/v1/traffic");
  const { connector } = Sproxy;
  const iom = {};
  Object.keys(connector).forEach((key) => {
    const { inMaxSpeed, outMaxSpeed, lineHash } = connector[key];
    if (lineHash && inMaxSpeed) {
      iom[lineHash] = inMaxSpeed + outMaxSpeed;
    }
  });
  const testGroup = await httpAPI("/v1/policies/benchmark_results");
  resMs = proxy[Groupkey].map((i) => {
    const lineHash = i.lineHash;
    const name = i.name;
    let HashValue = testGroup[lineHash];
    if (HashValue.lastTestScoreInMS === -1) {
      HashValue.lastTestScoreInMS = 9999;
    }
    const HashMs = HashValue ? HashValue.lastTestScoreInMS : 9988;
    return { name, ms: HashMs, lineHash };
  });
  resMs.forEach((i) => {
    var lineHash = i.lineHash;
    if (lineHash in iom) {
      i.se = iom[lineHash];
    } else {
      i.se = "0";
    }
    delete i.lineHash;
  });

  const t = new Date().getTime();
  const readData = $persistentStore.read("KEY_GroupAutos");
  let k = readData ? JSON.parse(readData) : {};
  k[Groupkey] = k[Groupkey] || {};
  let timeNms = Object.keys(k[Groupkey]).length;
  for (const t in k[Groupkey]) {
    if (timeNms > 65) {
      delete k[Groupkey][t];
      timeNms--;
    }
  }
  if (Object.values(k[Groupkey])[0]) {
    const groupValues = Object.values(k[Groupkey])[0];
    if (groupValues.some((i) => !resMs.some((e) => e.name === i.name))) {
      k[Groupkey] = {};console.log("数据变更，清理缓存");
    }
  }
  k[Groupkey][t] = resMs;
  const h = Date.now();
  Object.keys(k).forEach((ig) => {
    const y = k[ig];
    Object.keys(y).forEach((e) => {
      const t = h - parseInt(e);
      const o = t / (36e5 * th);
      if (o > 1) {
        delete y[e];
      }
    });
  });
  $persistentStore.write(JSON.stringify(k), "KEY_GroupAutos");

  Object.values(k[Groupkey]).forEach((arr) => {
    arr.forEach(({ name, ms, se }) => {
      if (!AK[name]) {
        AK[name] = { sum: Number(ms), count: 1, sek: Number(se) };
      } else {
        AK[name].sum += Number(ms);
        AK[name].sek += Number(se);
        AK[name].count++;
      }
    });
  });

  Object.keys(AK).forEach((name) => {
    const { sum, count, sek } = AK[name];
    AK[name] = {sum, count, sek: Number(sek) / Number(count),
      avg: reSpeed(Number(sek), Number(sum) / Number(count)),
    };
  });

  const avgt = Object.fromEntries(
    Object.entries(AK).map(([key, value]) => [key, value.avg])
  );
  let MK = null, MV = Infinity;
  for (const key in avgt) {
    const value = avgt[key];
    if (value < MV) {
      MK = key;
      MV = value;
    }
  }
  if (NP === MK) {
    Pushs ="继承: " +MK +": " +AK[MK]["count"] +"C" +" " +BtoM(AK[MK]["sek"]) +" " +avgt[MK];
  } else if (avgt[NP] - avgt[MK] > tol) {
    await httpAPI("/v1/policy_groups/select","POST",(body = { group_name: Groupkey, policy: MK }));
    Pushs ="优选: " +MK +": " +AK[MK]["count"] +"C" +" " +BtoM(AK[MK]["sek"]) +" " +avgt[MK];
  } else {
    Pushs ="容差:" +NP +": " +AK[NP]["count"] +"C" +" " +BtoM(AK[NP]["sek"]) +" " +avgt[NP];
  }
  console.log(Pushs);
  push && $notification.post("", Pushs, "");
  const te = new Date(t),
    he = te.getHours(),
    me = te.getMinutes();
  $done({
    title:"Group Auto: " +Groupkey +"'" +Object.keys(proxy[Groupkey]).length +"  " +he +":" +me,
    content: Pushs,
  });
})();

function httpAPI(path = "", method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const Ptimeout = new Promise((_, reject) => {
      setTimeout(() => {reject("");resolve("");}, 9900);});
    const Preq = new Promise((resolve) => {
      $httpAPI(method, path, body, resolve);});
    Promise.race([Preq, Ptimeout]).then((result) => {
        resolve(result);
      }).catch((error) => {reject(error);});
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

function reSpeed(x, y) {
  if (x > 1e7) {
    return Math.round(y * 0.6);
  } else {
    const ob = 0.99 * Math.exp(-x / 2e7);
    return Math.round(y * ob);
  }
}

var bkey = {
  title: "Group Auto",
  content: "超过Surge httpApi 限制",
};

function BtoM(i) {
  var bytes = i / (1024 * 1024);
  if (bytes < 0.01) {
    return "0.01M";
  }
  return bytes.toFixed(2) + "M";
}
