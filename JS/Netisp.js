//@key
const timeoutGPT = 500;
const timeoutAPI = 800;
let cskey = 1, gkey = 1, body = {};
function getAPI(max = 2) {
  let url = "http://ip-api.com/json/?lang=zh-CN";
  const outnew = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutAPI);
  });
  const renew = new Promise((resolve, reject) => {
    $httpClient.get(url, function (error, response, data) {
      if (error) {
        reject(error);
      } else {
        let key = JSON.parse(data);
        resolve(key);
      }
    });
  });
  return Promise.race([outnew, renew])
    .then((key) => {
      return key;
    })
    .catch((error) => {
      if (max > 0) {
        cskey++
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            getAPI(max - 1).then(resolve).catch(reject);
          }, 0);
        });
      } else {
        throw error;
      }
    });
}
let ipa = getAPI()
  .then((key) => {
      let { query:ip, org, isp, country, city} = key;
      org = smKey(org)
			isp = smKey(isp)
      let citys = country+"-"+city;
      if (city == country){
        citys = city;
      }// - ${org} ${ip}
      return `${citys}: ${ip} ${isp}`;
  }).catch((i) => {
    return  `重试${cskey}次  IPAPI检测超时`;
});
//let day = " "+new Date().getHours() + ":" + new Date().getMinutes();
const k = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"]
function getGPT(cs = 2) {
  let url = "http://chat.openai.com/cdn-cgi/trace";
  const outnew = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutGPT);
  });
  const renew = new Promise((resolve, reject) => {
    $httpClient.get(url, function (error, response, data) {
      if (error) {
        reject(error);
      } else {
        let lines = data.split("\n");
        let key = lines.reduce((acc, line) => {
          let [key, value] = line.split("=");
          acc[key] = value;
          return acc;
        }, {});
        resolve(key);
      }
    });
  });
  return Promise.race([outnew, renew])
    .then((key) => {
      return key;
    })
    .catch((error) => {
      if (cs > 0) {
        gkey++
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            getGPT(cs - 1).then(resolve).catch(reject);
          }, 0);
        });
      } else {
        throw error;
      }
    });
}
let getGp = getGPT().then((i) => {
    let gp = "", warp = i.warp, loc = i.loc, l = k.indexOf(loc);
    if (l != -1) {
      gp = "ChatGPT:"+loc+" ✓";
    } else {
      gp = "ChatGPT: ×";
    }
    return `${gp}     Protect: ${warp}`;
  }).catch((i) => {
    return `重试${gkey}次  ChatGPT不支持`;
});



Promise.all([getGp, ipa])
.then((okey) => {
  let [g, i] = okey;
  $done({title:g,content: i});
})
.catch((ikey) => {
  let [g, i] = ikey;
  $done({title:g,content:i});
});

function smKey(s){
	console.log(s)
s = s.replace(/\s?\.?\,?(?:inc|com|llc|ltd|pte|services|network|infrastructure|shanghai|proxy|limited|corporation|communications|information|technology|id\d{2,6}|\(.+\)|\.|\,)\s?\.?/ig, "")
if (s.length > 23) {
    return s.slice(0, 23) + "..";
  } else {
    return s;
  }
}