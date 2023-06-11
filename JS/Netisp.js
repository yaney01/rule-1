//@key
const timeoutGPT = 500;
const timeoutAPI = 800;
let cskey = 1, gkey = 1, body = {};
let now = new Date();
let day = " " + (now.getMonth() + 1) + "月" + now.getDate() + "  " + now.getHours() + ":" + now.getMinutes();
function getAPI(max = 1) {
  let url = "http://ip-api.com/json/?lang=zh-CN";
  const outnew = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutAPI);
  });
  const renew = new Promise((resolve, reject) => {
		let time = Date.now();
    $httpClient.get(url, function (error, response, data) {
      if (error) {
        reject(error);
      } else {
        let key = JSON.parse(data);
				key.tk = (Date.now() - time); 
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
		//console.log(JSON.stringify(key, null, 2));
      let { query:ip, regionName:dq, countryCode:us, org, isp, country, city, as, tk} = key;
      //org = smKey(org,26)
			//isp = smKey(isp,26) // ${isp}
			as=as.split(" ", 3).join(" ").replace(/\.|\,/g, "")
			dq = smKey(dq,6)
      //let citys = country+" "+dq;if (dq == country){citys = dq;}
			//${org} ${ip}  ${us} 
			//${getF(us)}加国旗
      return `${country}: ${us} ${smKey(ip,21)}${tk}ms\n${smKey(as,26)}${day}`;
  }).catch((i) => {
    return  `重试${cskey}次  IPAPI检测超时`;
});

const k = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"]

function getGPT(cs = 1) {
  let url = "http://chat.openai.com/cdn-cgi/trace";
  const outnew = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutGPT);
  });
  const renew = new Promise((resolve, reject) => {
		let time = Date.now();
    $httpClient.get(url, function (error, response, data) {
      if (error) {
        reject(error);
      } else {
        let lines = data.split("\n");
        let key = lines.reduce((acc, line) => {
          let [key, value] = line.split("=");
          acc[key] = value;
					acc.tk = (Date.now() - time); 
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
    let gp = "", warp = i.warp, tk=i.tk ,loc = i.loc, l = k.indexOf(loc);
    if (l != -1) {
      gp = "GPT: "+loc+" ✓ ";
    } else {
      gp = "GPT: "+loc+" × ";
    }
    return `${gp}       ➟     Priv: ${warp}  ${tk}ms`;
  }).catch((i) => {
    return `重试${gkey}次  ChatGPT不支持`;
});


Promise.all([getGp, ipa])
.then((okey) => {
  let [g, i] = okey;
  $done({title:g,content: i,
	//icon: "speedometer", 'icon-color': "#80A0BF",
	});
})
.catch((ikey) => {
  let [g, i] = ikey;
  $done({title:g,content:i});
});

function smKey(s,e){
	//console.log(s)
//s = s.replace(/\s?\.?\,?(?:inc|com|llc|ltd|pte|services|network|infrastructure|limited|shanghai|proxy|corporation|communications|information|technology|id\d{2,6}|\(.+\)|\.|\,)\s?\.?/ig, " ")
if (s.length > e) {
    return s.slice(0, e);
  } else if (s.length < e){
		return s.toString().padEnd(e," ")
	} else {
    return s;
  }
}

//function getF(e) {const n = e.toUpperCase().split("").map((e) => 127397 + e.charCodeAt());return String.fromCodePoint(...n).replace(/🇹🇼/g, "🇨🇳")}