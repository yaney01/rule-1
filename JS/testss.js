let Groupkey = "VPS", tol = "10", th = "18", push = false, timeout = 6000, icons= "",icolor="";
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  Groupkey = ins.group || Groupkey;
  th = ins.timecache || th;
  tol = ins.tolerance || tol;
  push = ins.push || false;
  icons = ins.icon || icons;
  icolor = ins.color || icolor;
  if (ins.timeout) {
    timeout = Math.max(100, Math.min(9900, ins.timeout));
  }
	//console.log(ins)
}


function httpAPI(path = "", method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const tPr = new Promise((_, reject) => {
      setTimeout(() => {reject("");resolve("");
      }, timeout);
    });
    const reqPr = new Promise((resolve) => {
      $httpAPI(method, path, body, resolve);
    });
    Promise.race([reqPr, tPr]).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
  });
}

function getin() {
  return Object.fromEntries(
    $argument.split("&").map((i) => i.split("="))
    .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function BtoM(i) {
  var bytes = i / (1024 * 1024);
  if (bytes < 0.01) {return "0.01M";}
  return bytes.toFixed(2) + "M";
}

function reSpeed(x, y) {
  if (x > 1e7) {return Math.round(y * 0.6);
  } else {
    const ob = 0.99 * Math.exp(-x / 2e7);
    return Math.round(y * ob);
  }
}

(async () => {
	let NP,resMS,AK = {},Pushs = "";
  const Protest = await httpAPI("/v1/policy_groups/test","POST",(body = { group_name: Groupkey }));
	console.log("1")
	if (Protest){
		console.log("2")
		console.log(Protest)
	const Npolicy = await httpAPI("/v1/policy_groups/select?group_name="+Groupkey);
	NP = Npolicy.policy
console.log(NP)
  const proxy = await httpAPI("/v1/policy_groups");
  if (!Object.keys(proxy).includes(Groupkey)) {
    $done({title: "GroupAuto",content: "group参数未输入正确的策略组",});
  }

  const Sproxy = await httpAPI("/v1/traffic");
  const { connector } = Sproxy;
  const IOM = {}; // inMaxSpeed outMaxSpeed Max
  Object.keys(connector).forEach((key) => {
    const { inMaxSpeed, outMaxSpeed, lineHash } = connector[key];
    if (lineHash && inMaxSpeed) {
      IOM[lineHash] = inMaxSpeed + outMaxSpeed;
    }
  });

  const testGroup = await httpAPI("/v1/policies/benchmark_results");
  // /v1/policy_groups  中的 name 和 lineHash 
  resMS = proxy[Groupkey].map((i) => {
    const lineHash = i.lineHash;
    const name = i.name;
    //  /v1/policies/benchmark_results 的 lastTestScoreInMS 为 ms
    let HashValue = testGroup[lineHash];
    if (HashValue.lastTestScoreInMS === -1) {HashValue.lastTestScoreInMS = 996;}
    const HashMs = HashValue ? HashValue.lastTestScoreInMS : 998;
    return { name, ms: HashMs, lineHash };
  });
  resMS.forEach((i) => {
    var lineHash = i.lineHash;
    if (lineHash in IOM) {
      i.se = IOM[lineHash];
    } else {
      i.se = "0";
    }
    delete i.lineHash;
  });

  const t = new Date().getTime();
  const readData = $persistentStore.read("KEY_Group_AutoTest");
  let k = readData ? JSON.parse(readData) : {};
  k[Groupkey] = k[Groupkey] || {};
  let timeNms = Object.keys(k[Groupkey]).length;
  for (const t in k[Groupkey]) {
    if (timeNms > 65) {
      delete k[Groupkey][t];
      timeNms--;
    }
  }
	console.log(JSON.stringify(resMS, null, 2));
	//console.log(Object.values(k[Groupkey])[0])
  if (Object.values(k[Groupkey])[0]) {
    const groupValues = Object.values(k[Groupkey])[0];
		
    if (Object.values(k[Groupkey])[0]) {
    const groupValues = Object.values(k[Groupkey])[0];
    
    if (groupValues.some((i) => !resMS.some((e) => e.name === i.name)) ||
        resMS.some((i) => !groupValues.some((e) => e.name === i.name))) {
      k[Groupkey] = {};
      console.log("数据变更，清理缓存");
    }
}}
  k[Groupkey][t] = resMS;
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
  $persistentStore.write(JSON.stringify(k), "KEY_Group_AutoTest");
	console.log(k)
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

  const AVGT = Object.fromEntries(
    Object.entries(AK).map(([key, value]) => [key, value.avg])
  );
  console.log(AVGT);
  let minKey = null,
    minValue = Infinity;
  for (const key in AVGT) {
    const value = AVGT[key];
    if (value < minValue) {
      minKey = key;
      minValue = value;
    }
  }
	console.log(minKey)
  if (NP === minKey) {
    Pushs ="继承: " +minKey +": "+AK[minKey]["count"] +"C"+" "+BtoM(AK[minKey]["sek"]) +" "+AVGT[minKey];
  } else if (AVGT[NP] - AVGT[minKey] > tol) {
    await httpAPI("/v1/policy_groups/select","POST",(body = { group_name: Groupkey, policy: minKey }));
    Pushs ="优选: " +minKey +": "+AK[minKey]["count"] +"C"+" "+BtoM(AK[minKey]["sek"]) +" "+AVGT[minKey];
  } else {
    Pushs ="容差:" +NP +": "+AK[NP]["count"] +"C" +" "+BtoM(AK[NP]["sek"]) +" "+AVGT[NP];
  }
  console.log(Pushs);
  push && $notification.post("", Pushs, "");
  const te = new Date(t),
    he = te.getHours(),
    me = te.getMinutes();
  $done({
    title:"Group Auto: "+Groupkey +"‘"+Object.keys(proxy[Groupkey]).length +"  " +he +":" +me,
    content: Pushs,
		icon: icons,
    'icon-color': icolor
  });
	} else {
		 $done({
    title:"错误",
    content: "",
  });
		
	}
})();