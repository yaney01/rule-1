/**
 * @key
 * 2023-09-19 20:42:25
 * 此入口落地查询脚本 仅支持 Loon
 * 使用方法 长按节点选择 '入口落地查询'
 */

const scriptName = "入口落地查询";
(async () => {
  try {
    const loon = $loon.split(" ");
    let timein = parseInt($persistentStore.read("入口查询超时时间ms") ?? 2000);
    let timei = parseInt($persistentStore.read("落地查询超时时间ms") ?? 5000);
    let inputParams = $environment.params;
    let nodeName = inputParams.node;
    let nodeIp = inputParams.nodeInfo.address;
    let LDTF = false,
      INIPS = false,
      INFailed = "",
      ins = "";
    const LD = await tKey(
      "http://ip-api.com/json/?lang=zh-CN",
      nodeName,
      timei
    );
    if (LD?.status === "success") {
      LDTF = true;
      console.log("LD: " + JSON.stringify(LD, "", 2));
      var {
        country: lcountry,
        countryCode: lcountryCode,
        regionName: lregionName,
        city: lcity,
        query: lquery,
        isp: lisp,
        as: las,
        tk: ltk,
      } = LD;
    } else {
      var LDFailed = "LD: " + JSON.stringify(LD);
    }
    let cfw = `⟦\x20\u4e2d\u8f6c\u0020<font\x20style=\x22text-decoration:line-through;\x22>\u9632\u706b\u5899</font>\x20⟧`;
    let serverip = serverTF(nodeIp);
    if (serverip === "domain") {
      const Ali = await tKey(
        `http://223.5.5.5/resolve?name=${nodeIp}&type=A&short=1`,
        "",
        timein
      );
      if (Ali?.length > 0) {
        console.log("Ali inIp: " + Ali[0]);
        nodeIp = Ali[0];
        serverip = serverTF(nodeIp);
      } else {
        console.log("Ali Dns Failed: " + JSON.stringify(Ali, "", 2));
      }
    }
    if (nodeIp == lquery) {
      cfw = `⟦\x20\u76f4\u8fde\u0020\u9632\u706b\u5899\x20⟧`;
      const LO = await tKey(
        "https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr",
        "",
        timein
      );
      if (LO.code === 0) {
        let { addr: ip, province: sh, city, isp ,country} = LO.data,
          tk = LO.tk;
        isp = isp.replace(/.*广电.*/g, "广电");
        ins = `<b><font>本机入口</font>:</b>
        <font>${isp}</font><br><br>
      
        <b><font>本机国家</font>:</b>
        <font>${country}&nbsp; ${tk}ms</font><br><br>
 
        <b><font>本机IP</font>:</b>
        <font>${ip}</font><br><br>
    
        <b><font>本机位置</font>:</b>
        <font>${sh} ${city} </font><br><br>`;
      } else {
        console.log("BIli api Failed: " + JSON.stringify(LO, "", 2));
        ins = `<br>BIli Api Failed 查询超时<br><br>`;
      }
    } else {
      if (serverip === "v4") {
        console.log("v4");
        const SP = await tKey(
          `https://api-v3.speedtest.cn/ip?ip=${nodeIp}`,
          "",
          timein
        );
        if (SP?.data?.country === "中国") {
          console.log("SP: " + JSON.stringify(SP.data, "", 2));
          var {
            country: scountry,
            city: scity,
            province: sprovince,
            district: sdistrict,
            countryCode: scountryCode,
            isp: sisp,
            ip: sip,
          } = SP.data;
          var stk = SP.tk;
          scountryCode !== "CN" && (cfw = `⟦\x20\u9632\u706b\u5899\x20⟧`);
          ins = `<b><font>入口ISP</font>:</b>
        <font>${sisp}</font><br><br>
      
        <b><font>入口国家</font>:</b>
        <font>${getflag(scountryCode)}${scountry}&nbsp; ${stk}ms</font><br><br>
 
        <b><font>入口CNAPI</font>:</b>
        <font>${sip}</font><br><br>
    
        <b><font>入口位置</font>:</b>
        <font>${sprovince} ${scity} ${sdistrict}</font><br><br>`;
        } else {
          INFailed = "SP Api Failed: " + JSON.stringify(SP);
          ins = `<br>SPFailed 查询超时<br><br>`;
          INIPS = true;
          console.log(INFailed);
        }
      } else {
        INIPS = true;
        console.log("v6");
      }
      if (INIPS) {
        const IO = await tKey(
          `http://ip-api.com/json/${nodeIp}?lang=zh-CN`,
          "",
          timei
        );
        if (IO?.status === "success") {
          console.log("IO: " + JSON.stringify(IO, "", 2));
          var {
            country: sicountry,
            city: sicity,
            regionName: siregionName,
            countryCode: sicountryCode,
            isp: siisp,
            query: siquery,
          } = IO;
          var sitk = IO.tk;
          sicountryCode !== "CN" && (cfw = `⟦\x20\u9632\u706b\u5899\x20⟧`);
          ins = `<b><font>入口国家</font>:</b>
          <font>${getflag(
            sicountryCode
          )}${sicountry}&nbsp; ${sitk}ms</font><br><br>
      
          <b><font>入口ISP</font>:</b>
          <font>${siisp}</font><br><br>
      
          <b><font>入口IPAPI</font>:</b>
          <font>${siquery}</font><br><br>
      
          <b><font>入口位置</font>:</b>
          <font>${siregionName} ${sicity}</font><br><br>`;
        } else {
          INFailed = "IPApi Failed: " + JSON.stringify(IO);
          ins = `<br>INFailed 查询超时<br><br>`;
          console.log(INFailed);
        }
      }
    }

    let outs = "";
    if (LDTF) {
      outs = `<b><font>落地国家</font>:</b>
        <font>${getflag(lcountryCode)}${lcountry}&nbsp; ${ltk}ms</font><br><br>
    
        <b><font>落地国家</font>:</b>
        <font>${lcountryCode} ${lregionName} ${lcity}</font><br><br>
        
        <b><font>落地IP地址</font>:</b>
        <font>${lquery}</font><br><br>
    
        <b><font>落地ISP</font>:</b>
        <font>${lisp}</font><br><br>
    
        <b><font>落地ASN</font>:</b>
        <font>${las}</font><br>`;
    } else {
      outs = `<br>LDFailed 查询超时<br><br>`;
      console.log(LDFailed);
    }

    let message = `<p 
    style="text-align: center; 
    font-family: -apple-system; 
    font-size: large; 
    font-weight: thin">
    <br>-------------------------------<br><br>
    ${ins}
    -------------------<br>
    <b><font>${cfw}</font></b>
    <br>-------------------<br><br>
    ${outs}
    <br>-------------------------------<br><br>
    <b>节点</b>  ➟  ${nodeName} <br>
    <b>设备</b>  ➟ ${loon[1]} ${loon[2]}</p>`;
    $done({ title: scriptName, htmlMessage: message });
  } catch (error) {
    console.log("Errk: " + error.message);
    $done({
      title: scriptName,
      htmlMessage: error.message + "<br><br> 查询失败 反馈@Key",
    });
  } finally {
    $done({ title: scriptName, htmlMessage: message });
  }
})();
function serverTF(i) {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(i)) {
    return "v4";
  } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(i)) {
    return "v6";
  } else {
    return "domain";
  }
}
function getflag(e) {
  const t = e
    .toUpperCase()
    .split("")
    .map((e) => 127397 + e.charCodeAt());
  return String.fromCodePoint(...t).replace(/🇹🇼/g, "🇨🇳");
}
async function tKey(url, nodeName, timeout) {
  let rec = 1,
    cskey = 1;
  const promise = new Promise((resolve, reject) => {
    const retry = async (attempt) => {
      try {
        const result = await Promise.race([
          new Promise((resolve, reject) => {
            let time = Date.now();
            $httpClient.get(
              { url: url, node: nodeName },
              (error, response, data) => {
                if (error) {
                  reject(error);
                } else {
                  let endtime = Date.now() - time;
                  let ststus = response.status;
                  switch (ststus) {
                    case 200:
                      let type = response.headers["Content-Type"];
                      switch (true) {
                        case type.includes("application/json"):
                          let key = JSON.parse(data);
                          key.tk = endtime;
                          resolve(key);
                          break;
                        case type.includes("text/html"):
                          resolve("text/html");
                          break;
                        case type.includes("text/plain"):
                          let lines = data.split("\n");
                          let keygpt = lines.reduce((acc, line) => {
                            let [key, value] = line.split("=");
                            acc[key] = value;
                            acc.tk = endtime;
                            return acc;
                          }, {});
                          resolve(keygpt);
                          break;
                        case type.includes("image/svg+xml"):
                          resolve("image/svg+xml");
                          break;
                        default:
                          resolve("未知");
                          break;
                      }
                      break;
                    case 204:
                      let tk = { tk: endtime };
                      resolve(tk);
                      break;
                    default:
                      resolve("nokey");
                      break;
                  }
                }
              }
            );
          }),
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("timeout")), timeout);
          }),
        ]);
        if (result) {
          resolve(result);
        } else {
          resolve("超时");
          reject(new Error(n.message));
        }
      } catch (error) {
        if (attempt < rec) {
          cskey++;
          retry(attempt + 1);
        } else {
          resolve("检测失败, 重试次数" + cskey);
          reject(error);
        }
      }
    };
    retry(0);
  });
  return promise;
}
