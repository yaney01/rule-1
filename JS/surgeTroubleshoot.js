// @xream @key
const UPDATA = "2024-01-17 22:39:17";
const isPanel = typeof $input != "undefined",
  stname = "SurgeTool_Rule_NUM",
  STversion = "V2.9",
  nowt = Date.now();
let url = typeof $request !== "undefined" && $request.url ? $request.url : "0",
  isFetch = /(trouble\.shoot|surge\.tool|st\.com)\/getkey/.test(url);

let result = {},
  icons = "heart.text.square",
  icolor = "#6699FF",
  type = false,
  list = false,
  nolog = false;
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  icons = ins.icon || icons;
  icolor = ins.color || icolor;
  type = ins.type !== undefined;
  list = ins.list !== undefined;
  nolog = ins.nolog !== undefined;
}

!(async () => {
  try {
    if (/(trouble\.shoot|surge\.tool|st\.com)\/v/.test(url)) {
      $done({
        response: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(
            {
              VERSION: STversion,
              TIMESTAMP: nowt,
              UPDATA: UPDATA,
            },
            null,
            4
          ),
        },
      });
      return;
    }
    const [
      { enabled: mitm },
      { enabled: rewrite },
      { enabled: scripting },
      { profile },
    ] = await Promise.all([
      httpAPI("/v1/features/mitm", "GET"),
      httpAPI("/v1/features/rewrite", "GET"),
      httpAPI("/v1/features/scripting", "GET"),
      httpAPI("/v1/profiles/current?sensitive=0", "GET"),
    ]);
    let hostname =
      profile.match(/\nhostname\s*=\s*(.*?)\n/)?.[1].split(/\s*,\s*/) || [];
    const hostname_disabled =
      profile
        .match(/\nhostname-disabled\s*=\s*(.*?)\n/)?.[1]
        .split(/\s*,\s*/) || [];
    hostname = hostname.filter((item) => !hostname_disabled.includes(item));

    // prettier-ignore
    let DOMAIN_NUM=0,DOMAIN_SUFFIX_NUM=0,DOMAIN_KEYWORD_NUM=0,IP_CIDR_NUM=0,IP_CIDR6_NUM=0,IP_ASN_NUM=0,OR_NUM=0,AND_NUM=0,NOT_NUM=0,DEST_PORT_NUM=0,IN_PORT_NUM=0,SRC_IP_NUM=0,PROTOCOL_NUM=0,PROCESS_NAME_NUM=0,DEVICE_NAME_NUM=0,USER_AGENT_NUM=0,URL_REGEX_NUM=0,SUBNET_NUM=0,DOMAIN_SET_NUM=0,RULE_SET_NUM=0,ALL_NUM=0,ScriptNUM=0,URL_RewriteNUM=0,Map_LocalNUM=0,Header_RewriteNUM=0,RewriteNUM=0,hostnameNUM=0,AllRule=[],SurgeTool={},RULELISTALL={};
    if (isFetch || isPanel) {
      const scRuleRaw =
        profile.match(/^\[Rule\]([\s\S]+?)^\[/gm)?.[0].split("\n") || [];
      const scRule = scRuleRaw.filter((i) => /^\s?(?![#;\s[//])./.test(i));
      scRuleRaw.forEach((e) => {
        if (/^(OR|AND|NOT),/.test(e)) {
          const LG = e
            .split(/\s?\(|\)/)
            .filter((i) => /^\s?(?![,#;\s[//])./.test(i));
          if (LG?.length > 0) {
            const FLG = LG.filter((i) => !/^(AND|OR|NOT)/.test(i));
            if (FLG?.length > 0) {
              const leng = LG.length - FLG.length;
              AllRule = AllRule.concat(FLG);
              let tf = false;
              FLG.forEach((k) => {
                if (/^(DOMAIN|RULE)-SET,/.test(k)) {
                  const key = k.split(",")[1];
                  // Url 作为键
                  RULELISTALL[key] = {
                    n: "",
                    o: e.split(",")[0] + ": ",
                    c: leng,
                    l: "",
                  };
                  tf = true;
                }
              });
              if (!tf) {
                ALL_NUM +=
                  leng * (FLG.length - 1) > 2 ? leng * (FLG.length - 1) : 0;
              }
            }
          }
        }
      });
      AllRule = AllRule.concat(scRule);
      for (const e of AllRule) {
        if (/^RULE-SET,/.test(e)) {
          RULE_SET_NUM++;
          const rsUrl = e.split(",")[1];
          if (/^https?:\/\/script\.hub\/file\/_start_\//.test(rsUrl)) {
            !nolog && console.log("[RULE-SET_GET_Script-Hub]: " + rsUrl);
            try {
              // ScriptHub 规则缓存
              SurgeTool = JSON.parse($persistentStore.read(stname));
              if (!SurgeTool && SurgeTool?.length > 10000) {
                clearcr();
              } else {
                const cacheNum = SurgeTool[rsUrl];
                if (typeof cacheNum == "number" && cacheNum > 0) {
                  !nolog && console.log("读取ScriptHub 缓存" + cacheNum);
                  let fname = ""; // 逻辑规则类型 前缀
                  if (RULELISTALL[rsUrl]?.o) {
                    fname = RULELISTALL[rsUrl].o || "";
                    if (RULELISTALL[rsUrl]?.c - 1 > 0) {
                      ALL_NUM += (RULELISTALL[rsUrl].c - 1) * cacheNum;
                    }
                  } else {
                    RULELISTALL[rsUrl] = {
                      n: "", // 名字
                      o: "", // 逻辑规则类型
                      c: "", // 逻辑规则次数
                      l: "", // 长度
                    };
                  }
                  const uname =
                    fname + rsUrl.split("/").pop().replace(/\?.+/, "");
                  RULELISTALL[rsUrl].n = uname;
                  RULELISTALL[rsUrl].l = cacheNum;
                }
              }
            } catch (error) {
              clearcr();
            }
            function clearcr() {
              $persistentStore.write(JSON.stringify({}), stname);
            }
          } else if (/http/.test(rsUrl)) {
            !nolog && console.log("[RULE-SET_GET]: " + rsUrl);
            try {
              const ruleSetRaw = (await tKey(rsUrl))
                .split("\n")
                .filter((i) => /^\s?(?![#;\s[//])./.test(i));
              const ruleSetRawleng = ruleSetRaw.length;
              let fname = "";
              if (RULELISTALL[rsUrl]?.o) {
                fname = RULELISTALL[rsUrl].o || "";
                if (RULELISTALL[rsUrl]?.c - 1 > 0) {
                  ALL_NUM += (RULELISTALL[rsUrl].c - 1) * ruleSetRawleng;
                }
              } else {
                RULELISTALL[rsUrl] = {
                  n: "",
                  o: "",
                  c: "",
                  l: "",
                };
              }
              const uname = fname + rsUrl.split("/").pop().replace(/\?.+/, "");
              RULELISTALL[rsUrl].n = uname;
              RULELISTALL[rsUrl].l = ruleSetRawleng;
              AllRule = AllRule.concat(ruleSetRaw);
            } catch (e) {
              console.log(e.message);
            }
          }
        }
        if (/^DOMAIN-SET,/.test(e)) {
          DOMAIN_SET_NUM++;
          const rdurl = e.split(",")[1];
          if (/^https?:\/\/script\.hub\/file\/_start_\//.test(rdurl)) {
            !nolog && console.log("[DOMAIN-SET_GET_Script-Hub]: " + rdurl);
            try {
              SurgeTool = JSON.parse($persistentStore.read(stname));
              if (!SurgeTool && SurgeTool?.length > 10000) {
                clearcr();
              } else {
                const cacheNum = SurgeTool[rdurl];
                if (typeof cacheNum == "number" && cacheNum > 0) {
                  !nolog && console.log("读取ScriptHub 缓存" + cacheNum);
                  let fname = "";
                  if (RULELISTALL[rdurl]?.o) {
                    fname = RULELISTALL[rdurl].o || "";
                    if (RULELISTALL[rdurl]?.c - 1 > 0) {
                      ALL_NUM += (RULELISTALL[rdurl].c - 1) * cacheNum;
                    }
                  } else {
                    ALL_NUM += cacheNum;
                    RULELISTALL[rdurl] = {
                      n: "",
                      o: "",
                      c: "",
                      l: "",
                    };
                  }
                  const uname =
                    fname + rdurl.split("/").pop().replace(/\?.+/, "");
                  RULELISTALL[rdurl].n = uname;
                  RULELISTALL[rdurl].l = cacheNum;
                }
              }
            } catch (error) {
              clearcr();
            }
            function clearcr() {
              $persistentStore.write(JSON.stringify({}), stname);
            }
          } else if (/http/.test(rdurl)) {
            !nolog && console.log("[DOMAIN-SET_GET]: " + rdurl);
            try {
              const DOMAIN_SET_RAW_BODY = (await tKey(rdurl))
                .split("\n")
                .filter((i) => /^\s?(?![#;\s[//])./.test(i));
              const dleng = DOMAIN_SET_RAW_BODY.length;
              let fname = "";
              if (RULELISTALL[rdurl]?.o) {
                fname = RULELISTALL[rdurl].o || "";
                if (RULELISTALL[rdurl]?.c - 1 > 0) {
                  ALL_NUM += (RULELISTALL[rdurl].c - 1) * dleng;
                }
              } else {
                ALL_NUM += dleng;
                RULELISTALL[rdurl] = {
                  n: "",
                  o: "",
                  c: "",
                  l: "",
                };
              }
              const uname = fname + rdurl.split("/").pop().replace(/\?.+/, "");
              RULELISTALL[rdurl].n = uname;
              RULELISTALL[rdurl].l = dleng;
            } catch (e) {
              console.log(e.message);
            }
          }
        }
      }
      AllRule.forEach((e) => {
        ALL_NUM++;
        /^DOMAIN,/.test(e) && DOMAIN_NUM++;
        /^DOMAIN-SUFFIX,/.test(e) && DOMAIN_SUFFIX_NUM++;
        /^DOMAIN-KEYWORD,/.test(e) && DOMAIN_KEYWORD_NUM++;
        /^IP-CIDR6,/.test(e) && IP_CIDR6_NUM++;
        /^IP-CIDR,/.test(e) && IP_CIDR_NUM++;
        /^IP-ASN,/.test(e) && IP_ASN_NUM++;
        /^OR,/.test(e) && OR_NUM++;
        /^AND,/.test(e) && AND_NUM++;
        /^NOT,/.test(e) && NOT_NUM++;
        /^DEST-PORT,/.test(e) && DEST_PORT_NUM++;
        /^IN-PORT,/.test(e) && IN_PORT_NUM++;
        /^SRC-IP,/.test(e) && SRC_IP_NUM++;
        /^PROTOCOL,/.test(e) && PROTOCOL_NUM++;
        /^PROCESS-NAME,/.test(e) && PROCESS_NAME_NUM++;
        /^DEVICE-NAME,/.test(e) && DEVICE_NAME_NUM++;
        /^USER-AGENT,/.test(e) && USER_AGENT_NUM++;
        /^URL-REGEX,/.test(e) && URL_REGEX_NUM++;
        /^SUBNET,/.test(e) && SUBNET_NUM++;
      });
    } // get
    try {
      Header_RewriteNUM =
        profile
          .match(/^\[Header Rewrite\]([\s\S]+?)^\[/gm)?.[0]
          .split("\n")
          .filter((i) => /^\s?(?![#;\s[//])./.test(i)).length || 0;
      Map_LocalNUM =
        profile
          .match(/^\[Map Local\]([\s\S]+?)^\[/gm)?.[0]
          .split("\n")
          .filter((i) => /^\s?(?![#;\s[//])./.test(i)).length || 0;
      URL_RewriteNUM =
        profile
          .match(/^\[URL Rewrite\]([\s\S]+?)^\[/gm)?.[0]
          .split("\n")
          .filter((i) => /^\s?(?![#;\s[//])./.test(i)).length || 0;
      ScriptNUM =
        profile
          .match(/^\[Script\]([\s\S]+?)^\[/gm)?.[0]
          .split("\n")
          .filter((i) => /^\s?(?![#;\s[//])./.test(i)).length || 0;
      ScriptNUM =
        profile
          .match(/^\[Script\]([\s\S]+?)^\[/gm)?.[0]
          .split("\n")
          .filter((i) => /^\s?(?![#;\s[//])./.test(i)).length || 0;
    } catch (e) {
      console.log(e.message);
    }

    RewriteNUM = Header_RewriteNUM + Map_LocalNUM + URL_RewriteNUM;
    RewriteNUM = RewriteNUM > 0 ? `: ${RewriteNUM}` : "";
    ScriptNUM = ScriptNUM > 0 ? `: ${ScriptNUM}` : "";
    hostnameNUM = hostname.length > 0 ? `: ${hostname.length}` : "";
    // prettier-ignore
    const AROBJ = { ALL:ALL_NUM,OR:OR_NUM, AND:AND_NUM, NOT:NOT_NUM, SRC_IP:SRC_IP_NUM, IP_ASN:IP_ASN_NUM, DOMAIN:DOMAIN_NUM, SUBNET:SUBNET_NUM, IN_PORT:IN_PORT_NUM, IP_CIDR:IP_CIDR_NUM, RULE_SET:RULE_SET_NUM, IP_CIDR6:IP_CIDR6_NUM, PROTOCOL:PROTOCOL_NUM, DEST_PORT:DEST_PORT_NUM, URL_REGEX:URL_REGEX_NUM, DOMAIN_SET:DOMAIN_SET_NUM, USER_AGENT:USER_AGENT_NUM, DEVICE_NAME:DEVICE_NAME_NUM, PROCESS_NAME:PROCESS_NAME_NUM, DOMAIN_SUFFIX:DOMAIN_SUFFIX_NUM, DOMAIN_KEYWORD:DOMAIN_KEYWORD_NUM, };

    if (!nolog) {
      Object.entries(AROBJ).forEach(
        ([k, v]) => v != 0 && console.log(`${k}: ${v}`)
      );
      Object.entries(RULELISTALL).forEach(
        ([k, v]) => v != 0 && console.log(`${v.n}: ${v.l}`)
      );
    }

    if (isFetch) {
      $done({
        response: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(
            {
              VERSION: STversion,
              ALL_NUM: ALL_NUM,
              HOSTNAMEeNUM: hostnameNUM,
              SCRIPTNUM: ScriptNUM,
              REWRITENUM: RewriteNUM,
              UPDATA: UPDATA,
              TIMESTAMP: nowt,
              AROBJ: AROBJ,
              HOSTNAME: hostname,
              RULELISTALL: RULELISTALL,
            },
            null,
            4
          ),
        },
      });
    } else if (isPanel) {
      let text = "";
      if (type) {
        Object.entries(AROBJ).forEach(([k, v]) => {
          v != 0 && (text += `${k}: \x20\x20${v}\n`);
        });
      }
      if (list) {
        const e = Object.entries(RULELISTALL);
        e.forEach(([, v], index) => {
          v !== 0 &&
            (text += `${v.n}: \x20\x20${v.l}${
              index === e.length - 1 ? "" : "\n"
            }`);
        });
      }
      $notification.post("", text, "点击跳转浏览器打开", {
        url: "https://st.com",
      });
      result = {
        title: "Surge Tool Rule: " + ALL_NUM,
        content: `MitM${hostnameNUM} ${mitm ? "☑" : "☒"} Script${ScriptNUM} ${
          scripting ? "☑" : "☒"
        } Re ${RewriteNUM} ${rewrite ? "☑" : "☒"}`,
        icon: icons,
        "icon-color": icolor,
      };
    } else {
      result = {
        response: {
          status: 200,
          headers: {
            "Content-Type": "text/html",
          },
          body: `<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="shortcut icon" href="data:image/x-icon;base64,AAABAAIAICAAAAEAIAAoEQAAJgAAABAQAAABACAAaAQAAE4RAAAoAAAAIAAAAEAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqBOAiS+XQBN1mkAct5sAI7hawKb4WsCm95sAI7WaQByvl0ATaBOAiQAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWzIADsVhAk/icAGe8HcB2Pp7APX8fQD9/34A//9/AP//fwD//34A//x9AP36ewD18HcB2OJwAZ7FYQJPWzIADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAr1cAUPodACx+nwA9P+AAP//fwD//34A//99AP//fAD//3wA//98AP//fAD//30A//9+AP//fwD//4AA//p8APTodACxvVwBQwAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHU3AA3abQB79nsA6f+BAP//gAD//34A//9+AP//fgD//34A//9+AP//fgD//34A//9+AP//fgD//34A//9+AP//fgD//4AA//+BAP/2ewDp2m0Ae3U3AA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACeVQAU5nYDmvuAAf3/gQH//4AA//+AAP//gAD//4AA//+AAP//gAD//4AA//+AAP//gAD//4AA//+AAP//gAD//4AA//+AAP//gAD//4AA//+BAf/7gAH95nYDmp5VABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgDUADuZ4Apv9ggH//4IB//+BAf//gQH//4EB//+BAf//gQD//4AA//+BAf//gQH//4EB//+BAf//gQH//4EB//+BAf//gQH//4EB//+BAf//gQH//4EB//+CAf/9ggH/5ngCm4A1AA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPedAB9/IQA/f+FAP//gwD//4MA//+DAP//gwD//4MA//+KGf//jiT//4MA//+DAP//gwD//4MA//+DAP//gwD//4MA//+DAP//gwD//4MA//+DAP//gwD//4MA//+FAP/8hAD93nQAfQAAAAMAAAAAAAAAAAAAAAAAAAAAzGwCRfiEAez/iAD//4YB//+GAf//hgH//4YB//+FAP//iQ///9Kq///m0P//ljP//4MA//+CAP//ggD//4YA//+GAf//hgH//4YB//+GAf//hgH//4YB//+GAf//hgH//4YB//+IAP/4hAHszGwCRQAAAAAAAAAAAAAAAKNMAA7tgQKz/4sC//+IAP//iAD//4gA//+FAP//gwD//4UA//+QJP//59L///r0//+kUP//hQD//6pe//+qXv//iQX//4gA//+IAP//iAD//4gA//+IAP//iAD//4gA//+IAP//iAD//4gA//+LAv/vgQKzo0wADgAAAAAAAAAA2HYETvqKAvX/jAD//4oA//+KAP//iQD//509//+vZv//jRP//5Ei///nzv//+fD//6NM//+TKP//793//+/d//+XLv//iAD//4oA//+KAP//igD//4oA//+KAP//igD//4oA//+KAP//igD//4wA//uKAvXYdgROAAAAAFFQAATtgwGd/48A//6MAf/+jAH//owA//6MA///17L///v0//+tX///jxv//+fN///58P/+pEz//pgw///x4v//8eL//pw3//6JAP/+jAH//owB//6MAf/+jAH//owB//6MAf/+jAH//owB//6MAf/+jAH//48A/+2DAZ1RUAAEyXEAH/eNANP/kgD//o8A//6PAP/+jwD//pAK///fvv///fj//rVv//+RG///587///nw//6mTP/+mi7///Hg///x4P/+nTX//o0A//6PAP/+jwD//o8A//6PAP/+jwD//o8A//6PAP/+jwD//o8A//6PAP//kgD/940A08lxAB/NdgBL+5AA8v+UAP/+kgD//pIA//6RAP/+kgb//9++/////f/+tWz//5Qb///nzv//+fD//qhM//6dMP//8eD///Hg//6fNf/+jwD//o8A//6QAP/+kgD//pIA//6SAP/+kgD//pIA//6SAP/+kgD//pIA//+UAP/7kADyzXYAS+GDAHj9lAD6/5UA//6VAP/+lQD//pQB//6SAP/+u3L//9eu//+gMv//mR///+fO///58P/+q0v//p4w///x4P//8eD//qI1//6SAP/+oDH//pwk//6UAP/+lQD//pUA//6VAP/+lQD//pUA//6VAP/+lQD//5UA//2UAPrhgwB46I0ElP+ZAPv/lwD//pYA//6WAP/+lgD//pYA//6VAP/+lQD//pQA//+dJP//587///nw//6sS//+oC////Hg///x4P/+ojH//qIz///t2f//2rL//pkU//6WAP/+lgD//pYA//6WAP/+lgD//pYA//6WAP//lwD//5kA++iNBJTrkAGb/5wA+/+ZAf/+mQH//pkB//6ZAf/+mQH//pkB//6ZAP/+lwD//58l///q0v//+/X//q5N//6iL///8eD///Hg//6iL//+rk7///rz///q0f//oCb//pcA//6YAP/+mQD//pkB//6ZAf/+mQH//pkB//+ZAf//nAD765ABm+mSAIv/nwD6/5wA//6cAP/+nAD//pwA//6cAP/+nAD//pwA//6bAP/+nA7//tGZ//7hvv/+pCn//qYx///x4P//8eD//qQw//6wTP//+fD//+jO//+iJP/+mgD//qEe//6cC//+mwD//pwA//6cAP/+nAD//5wA//+eAPrpkgCL444AZv6fAPj/oAH//p8B//6fAf/+nwH//p8B//6fAf/+nwH//p8B//6eAP/+oA///qEX//6bAP/+qjX///Lg///y4P/+pzD//rFM///58P//6M7//6Ee//6uRP//58z//suL//6dAP/+nwH//p8B//6fAf//oAH//p8A+OOOAGbhiQA1+6AA6f+jAP/+oQD//qEA//6hAP/+oQD//qEA//6hAP/+oQD//qEA//6hAP/+oQD//qAA//6sNf//8uD///Lg//6oMP/+sk3///nw///pzf//ohr//r9w///+/P//4sD//qEJ//6hAP/+oQD//qEA//+jAP/7oADp4YkANduNARH4ogDA/6cA//6kAP/+pAD//qQA//6kAP/+pAD//qQA//6kAP/+pAD//qQA//6kAP/+ogD//q03///y4P//8uD//qsw//60Tf//+PD//+nN//+kGf/+wXD///35///iv//+pAf//qQA//6kAP/+pAD//6cA//ijAL/bjQERAAAAAPSgA37+qQL//6cB//6nAf/+pwH//qcB//6nAf/+pwH//qcB//6nAf/+pwH//qcB//6lAP/+sDf///Pj///z4//+rTL//rdN///48P//6s7//6cd//65VP//9ef//9ej//6kAP/+pwH//qcB//+nAf//qQL/9KADfgAAAAAAAAAA5ZkCLvuoAuP/rAH//agA//2oAP/9qAD//agA//2oAP/9qAD//agA//2oAP/9qAD//acA//6uKf//69D//+vQ//2rI//+uE7///jw///qzv/9rCT//agA//21Qv/9rSb//acA//2oAP/9qAD//6wB//uoAuPpmQIuAAAAAAAAAAC5awAD9aYCh/+vAP/+rAH//asB//2rAf/9qwH//asB//2rAf/9qwH//asB//2rAf/9qwD//aoC//63QP/+t0D//acA//67UP//+vX//+vS//2uJv/9qgD//akA//2qAP/9qwH//asB//6sAf//rwD/9aQDh7lrAAMAAAAAAAAAAAAAAADqoAId+60Ayf+xAP/9rQD//a0A//2tAP/9rQD//a0A//2tAP/9rQD//a0A//2tAP/9rQD//awA//2sAP/9rAD//bIq//7fsf/+0o///awK//2tAP/9rQD//a0A//2tAP/9rQD//7EA//utAMnqoAIdAAAAAAAAAAAAAAAAAAAAAAAAAADwpwJD/bAA5f+yAP/9sAD//bAA//2wAP/9sAD//bAA//2wAP/9sAD//bAA//2wAP/9sAD//bAA//2wAP/9rgD//a4K//2uAv/9rwD//bAA//2wAP/9sAD//bAA//+yAP/9sADl8KcCQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD0rQJZ/rMA6f+2AP/9sQL//bEC//2xAf/9sQH//bEB//2xAf/9sQH//bEB//2xAf/9sQH//bEB//2xAf/9sQD//bEA//2xAf/9sQH//bEC//2xAv//tgD//rMA6fStAlkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4rwBR/bUA3f+4Af//tAD//bMA//2zAP/9swD//bMA//2zAP/9swD//bMA//2zAP/9swD//bMA//2zAP/9swD//bMA//2zAP//tAD//7gB//21AN34rwBRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADzrwIy+7UAsP63APr/ugD//7YA//21AP/9tQD//bUA//21AP/9tQD//bUA//21AP/9tQD//bUA//21AP//tgD//7oA//63APr7tQCw868CMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADvrgIN9rQAX/y4Ab/+uAH0/7sA//+7A///uQT//7gB//+3Av//twL//7gB//+5BP//uwP//7sA//64AfT8uAG/9rQAX++uAg0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA86gAEfq1Akr7uAGP/LoAv/67At3+uQDv/rgB9v64Afb+uQDv/rsC3fy6AL/7uAGP+rUCSvOoABEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADmrwAQ9LAEJfGvADrysABK8rAASvGvADr0sAQl5q8AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoFUAEMNaACPDWgAjoFUAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADebgBF73YBpfd5ANv6egHv+noB7/d5ANvvdgGl3m4ARQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALNfAA7veQCY/H8A+/+BAP//gAD//38A//9/AP//gAD//4EA//x/APvveQCYs18ADgAAAAAAAAAAAAAAAK9WAAjzfQKr/4YA//+CAf//ggL//4IF//+BAP//gQD//4EB//+BAf//ggH//4YA//N9AquvVgAIAAAAAAAAAADufwB0/4oA//+GAP//fwD//6xl///Cj///iRH//40c//+GAP//hwH//4cB//+HAf//igD/7n8AdAAAAADWcQYU+ooC4P+MAP//mzf//7Nu//66fv/+063//r+H//7Ejf//hwD//4sA//+LAP//iwD//40A//qKAuDWcQYU5YMAVf+RAP//jQD//rFh///hxf/+vHv//tKo//7Ikv/+y5n//okA//6PAP/+kAL//pAA//+QAP//kQD/5YMAVeuMAJz/mAD//pUA//6eJv//qkr//r99//7WrP/+yZH//suU//6vWP/+qET//pMA//6VAP/+lQD//5gA/+uMAJzxlQCn/50A//6bAP/+mgD//pUA//66aP/+yo7//syS//7Lkf/+2K7//sN///6aAf/+mwj//psA//+dAP/xlQCn7pcDav+jAP/+oQD//qAA//6gAP/+oQb//p0A//7Ql//+zZL//teo//7DfP/+16n//rZU//6eAP//owD/7pUEau6YACP9pgHv/6cB//6mAf/+pgH//qUA//6hAP/+1Jv//tGV//7Zqf/+x33//tmo//65VP//pQD//aYB7+6YACMAAAAA+qoAmv+xAv/9qgD//aoA//2qAP/9qQD//rxQ//64SP/+3Kz//sl8//2pAP/9qwT//7EA//qqAJoAAAAAAAAAAPGlARz8rwDW/7QA//2vAP/9rwD//a8A//2tAP/9rAD//bk8//21Kf/9rgD//7QA//yvANbxpQEcAAAAAAAAAAAAAAAA9q4ALP60AM7/uQH//7YA//6zAP/9swD//bMA//6yAP//tQD//7kB//60AM72rgAsAAAAAAAAAAAAAAAAAAAAAAAAAAD1thEU+7UCg/64Adz+twL9/7oA//+6AP/+twL9/rgB3Pu1AoP1thEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADztQAR+bYAP/e2AGT3tgBk+bYAP/O1ABEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=">
<style>
::backdrop,:root {--sans-font:"Chinese Quotes","Inster var",-apple-system,BlinkMacSystemFont,"Avenir Next",Avenir,"Nimbus Sans L",Roboto,"Noto Sans","Segoe UI",Arial,Helvetica,"Helvetica Neue",sans-serif;--mono-font:Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace;--standard-border-radius:5px;--bg:#f7f8fa;--accent-bg:#89899c16;--text:#23242fc2;--text-light:#585858;--border:#898EA4;--accent:#0d47a1;--code:#d81b60;--preformatted:#444;--marked:#ffdd33;--disabled:#efefef }.tline {color:#191818a1;}.title {color:#272424d7;}.action {color:#212223d9;}.ebutton.brand {background-color:#bdc7e56a;}.ebutton.alt {background-color:#bdc7e53b;}.action a:active {background-color: #4164d766;}.action a:hover {background-color: #4164d776;}@media (prefers-color-scheme:dark) {.action a:active {background-color: #4164d7;}.action a:hover {background-color: #4164d7;}.ebutton.brand {background-color:#4164d7;}.ebutton.alt {background-color:#aab7c91d;}.action {color:#d1d5d9d9;}.tline {color:#f2f0ef9f;}.title {color:#ffffffb3;}::backdrop,:root {color-scheme:dark;--bg:#17171A;--accent-bg:#0b0b0c7a;--text:#e2e3eab8;--text-light:#ababab;--accent:#8495b0;--code:#f06292;--preformatted:#97a4b8;--disabled:#111 }img,video {opacity:.8 }}*,::after,::before {box-sizing:border-box }html {font-family:var(--sans-font);scroll-behavior:smooth }body {color:var(--text);background-color:var(--bg);line-height:1.5;display:grid;margin:0 }aside,details,pre,progress {background-color:var(--accent-bg);border:0px solid var(--border);border-radius:var(--standard-border-radius);margin-bottom:1rem;}code,kbd,pre,pre span,samp {font-family:var(--mono-font);color:var(--code) }

pre {padding:42px 0 20px 25px;
min-height:300px;
overflow-x:hidden;overflow-y:auto;white-space:pre-line;max-width:100%;color:var(--preformatted);border-radius:18px;/* backdrop-filter:blur(50px);-webkit-backdrop-filter:blur(50px);*/ }pre code {color:var(--preformatted);background:0 0;margin:0;padding:0 }/* \/\*[\s\S\n]+?\*\/ */ .button:focus,.button:hover {filter:brightness(1.4);cursor:pointer }blockquote {margin-inline-start:0;margin-inline-end:0;margin-block:0 }.kpage.has-image .container {text-align:center;}.image-src {max-width:144px;max-height:144px;}.name {color:var(--vp-home-hero-name-color);}.name,.text {letter-spacing:-.4px;font-size:42px;font-weight:700;white-space:pre-wrap;}.kpage {margin-top:80px;}.image-bg {position:absolute;top:50%;left:50%;border-radius:50%;width:192px;height:192px;/* background-image:linear-gradient(-45deg,#bd34fe88 50%,#47caff88 50%);*/ background-image:linear-gradient(25deg,#4d9ae06b 50%,#5448e95c 50%);filter:blur(56px);transform:translate(-50%,-50%);z-index:-10;}.image-bgs {position:absolute;/* top:90%;*/ /* bottom:10%;*/ left:80%;/* border-radius:50%;*/ width:40%;height:192px;/* background-image:linear-gradient(-45deg,#bd34fe88 50%,#47caff88 50%);*/ background-image:linear-gradient(25deg,#4d99e03d 50%,#5348e936 50%);filter:blur(90px);transform:translate(-50%,-50%);z-index:-10;}.titleh {background:-webkit-linear-gradient(128deg,#a245ced9,#52c4ead7);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}.kpage.has-image .actions {justify-content:center;}.ebutton.mdi {border-radius:20px;padding:0 20px;line-height:38px;font-size:14px;}.actions {display:flex;flex-wrap:wrap;margin:-6px;padding:10px;}.ebutton {display:inline-block;text-align:center;font-weight:600;white-space:nowrap;}.action {flex-shrink:0;padding:6px;}a {color:inherit;text-decoration:inherit;}.title {display:flex;align-items:center;width:100%;height:10px;font-size:14px;font-weight:600;} .topimg.logo {margin-right:8px;height:20px;width:20px;}.toptittle {padding-top:20px;padding-left:20px;}body {margin:10;max-width:100%;}.sglogoh {position:relative;margin:0 auto;width:144px;height:144px;}.container {display:flex;flex-direction:column;margin:0 auto;max-width:1152px;}.image {margin:0;min-height:100%;}.main {    max-height: 110vh;position:relative;z-index:10;order:2;flex-grow:1;flex-shrink:0;}.tline {line-height:28px;font-size:18px;font-weight:400;white-space:pre-line;}.lists {order:2;padding:10px 30px;text-align:start;}.tƒooters {opacity:0.35;text-align:center;width:100%;font-size:12;padding:20px;}.pretit {color:var(--text);position:relative;border-top-left-radius:14px;border-top-right-radius:14px;padding:10px 0 12px 100px;top:59px;backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);background:url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI0NTBweCIgaGVpZ2h0PSIxMzBweCI+CiAgICA8ZWxsaXBzZSBjeD0iNjUiIGN5PSI2NSIgcng9IjUwIiByeT0iNTIiIHN0cm9rZT0icmdiKDIyMCw2MCw1NCkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0icmdiKDIzNywxMDgsOTYpIi8+CiAgICA8ZWxsaXBzZSBjeD0iMjI1IiBjeT0iNjUiIHJ4PSI1MCIgcnk9IjUyIiBzdHJva2U9InJnYigyMTgsMTUxLDMzKSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJyZ2IoMjQ3LDE5Myw4MSkiLz4KICAgIDxlbGxpcHNlIGN4PSIzODUiIGN5PSI2NSIgcng9IjUwIiByeT0iNTIiIHN0cm9rZT0icmdiKDI3LDE2MSwzNykiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0icmdiKDEwMCwyMDAsODYpIi8+Cjwvc3ZnPgo=");background-size:70px;background-repeat:no-repeat;background-position:10px;}a {text-decoration:none;}@media (min-width:960px) {.kpage {margin-top:-70px;}.lists {padding:10px 60px;min-width:592px;text-align:start;}.main {padding:40px;display:flex;max-width:521px;flex-direction:column;flex-wrap:wrap;justify-content:center;}.container {flex-direction:row;}}@media (min-width:1160px) {.kpage {margin-top:-70px;}.lists {padding:10px 20px 10px 70px;min-width:592px;max-width:992px;text-align:start;}.main {padding:40px;display:flex;max-width:521px;flex-direction:column;flex-wrap:wrap;justify-content:center;}.container {flex-direction:row;}}img,video {max-width:100%;}
</style></head><body>
<div class="toptittle"><a class="title"><div class="topimg logo" id="imgelogoL"></div>Surge Tool</a></div><div class="container"><div class="title"></div></div><div class="kpage has-image"><div class="container"><div class="main"><div class="sglogoh"><div id="imgelogoH"></div><div class="image-bg"></div></div><h1 class="name"><span class="titleh">Troubleshoot</span></h1><p class="tline">The parts marked in <span style="color: #ca2525">Red</span> do not necessarily indicate a problem, But rather serve as a noteworthy reminder</p><div class="actions"><!-- brand -->
<div class="action"><a class="ebutton mdi alt">MitM ${hostnameNUM} ${
            mitm ? "&#10003;" : "&#10007;"
          }</a></div>
<div class="action"><a class="ebutton mdi alt">Script ${ScriptNUM} ${
            scripting ? "&#10003;" : "&#10007;"
          }</a></div>
<div class="action"><a class="ebutton mdi alt">Rewrite ${RewriteNUM} ${
            rewrite ? "&#10003;" : "&#10007;"
          }</a></div></div></div>
<div class="lists">


        <div class="image-bgs"></div>
        <div class="pretit">Rule<span id="ALL_NUM"> Request ing ...</span></div>
        <pre id="AROBJ"></pre><div id="RULELISTPRE" class="pretit">Rule List</div><pre id="RULELIST"></pre>
        
        <div class="pretit">Hostname</div>
        <pre><code>${
          hostname.length > 0
            ? hostname
                .map((i) =>
                  i
                    .split("")
                    .map((j) =>
                      j === "*" ? '<i style="color: red">' + j + "</i>" : j
                    )
                    .join("")
                )
                .map((i) =>
                  !i.startsWith("-") &&
                  /(\.|^)(twitter|tiktokv|snssdk|icloud|apple|itunes)\./.test(i)
                    ? '<i style="color: red">' + i + "</i>"
                    : i
                )
                .join("\n")
            : "&#10007; empty"
        }</pre></code>
        </div></div></div><tƒooter class="tƒooters">${STversion} Made With &hearts; By <a href="https://t.me/zhetengsha">@xream @key</a></footer>
        <script>const sgpng="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMi1jMDAwIDc5LjFiNjVhNzliNCwgMjAyMi8wNi8xMy0yMjowMTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIwMjIgTWFjaW50b3NoIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkIzODY3OUYxQTk0MDExRUU5ODgyRDdDNkRBRkY3REEzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkIzODY3OUYyQTk0MDExRUU5ODgyRDdDNkRBRkY3REEzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjM4Njc5RUZBOTQwMTFFRTk4ODJEN0M2REFGRjdEQTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjM4Njc5RjBBOTQwMTFFRTk4ODJEN0M2REFGRjdEQTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz660IUwAACb1UlEQVR42uy9CdhtaVUeuNb573/nqSagiqqihJLBAhIFMSBiOaMRg7YMiSHm6fTTdlo6Ti1BGiLGTLbB7hiM2K0+6ZinNQE7onZHDK3lEMWhksaBUiGkECiBYqp7a7zDXr332d/wvmutfe61m7+oX86BU/f/z3+Gffb+vjW+633VzGR72962t0/N22p7Cra37W1rALa37W172xqA7W172962BmB72962t60B2N62t+1tawC2t+1te9sagO1te9vetgZge9vetretAdjetrftbWsAtrftbXvbGoDtbXvb3rYGYHvb3ra3rQHY3ra37W1rALa37W172xqA7W172962BmB72962t60B2N62t+1tawC2t+1te9sagO1te9vetgZge9vetretAdjetrftbWsAtrftbXt7uG4TLfgn8r4Pb1rOg5af13f3+6r+Xv990YtetPPa1762Pr6afi4GdTX9rf483vHnFT7X/+vv9X3g7zvTY+Xx9efXOz63PH/xcy91h/cI74OflbznztJj2ffyz/GPX+o4kt+za7i+tu56bvdr3a+fYgZgvRDqYnELbHXrrbceKAvtQLnvTvdnPOMZ63/L33dvueWWg+O//n5oupe/HYLH1v/efPPNh+q/072+R/L89c/1+fh4fW19HI7jkL/D8/C48LPSY4dja8+rv5f3PFiPD9/THxf+nvyMjx3a8Fj7F46pfQZeh/LzdJ0OTNerXrP62HRdp+tXjaczQN7of8oYAP1Eb1pVfaScKC3Hggc0eW554xvfuL7Q4yKRBx98UN/0pjfd9KhHPepxhw8fftz0pAMHDjxufO3p8T1OT7/v7OzcWN+z/px88cdp++zp1/Ff+PD6mD9MfIr7WbLfy/ssvQ7XCV0K+PzsvRXfZ+G55qOmTZ/vnluPZ/1c+wTssvEN3+PW3fiQ3XPx4sUz08/l4Y+X3z8+/u1j08/nzp17z/jvxz/0oQ+95ylPecqdcLzre1kf9fd64PZIMgCfaI/4Z8kAKKz8abPrtNnHja7f//3ff8WNN95401VXXfW8ssEfN27mp4//3ugWpd8QG9frwsbGvy1tENqAmzb2ps9IDsNv8LKS+6YG49B+tvJpaLDm6xm+xyaDc1l7e8kYbjBaG99KosES91I8x/TWkyEZhmG6/86FCxfeMxqI/+f06dO/Mq6Z4fbbb2+GwWaPkhm4rQH4JBsA7+H1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";const imge = document.createElement('img');imge.src = sgpng;document.getElementById('imgelogoL').appendChild(imge);const imges = document.createElement('img');imges.src = sgpng;document.getElementById('imgelogoH').appendChild(imges);</script><script>
        /*
setTimeout(() => {fetch('https://surge.tool/getkey').then(response => response.json()).then(res => {if (res?.AROBJ) {const newRes = Object.fromEntries(Object.entries(res.AROBJ).filter(([k, v]) => v !== 0));const jsonString = JSON.stringify(newRes, null, 1).replace(/"|{|}|'|,/g, '').trim();document.getElementById('AROBJ').textContent = jsonString;}const linkAdd = document.getElementById('RULELIST');if (res?.RULELIST && res?.RULELIST_URL) {Object.entries(res.RULELIST).forEach(([k, v]) => {if (v != 0) {const linke = document.createElement('a');linke.href = res?.RULELIST_URL[k];linke.target = '_blank';linke.textContent = k + ': ';const numberSpan = document.createElement('code');numberSpan.textContent = v;linke.appendChild(numberSpan);linkAdd.appendChild(linke);linkAdd.appendChild(document.createElement("br"));}});}else{ruleListPre = document.getElementById('RULELISTPRE');if (ruleListPre) {ruleListPre.remove();linkAdd.remove();}};if (res?.ALL_NUM) {const numberElement = document.getElementById('ALL_NUM');if (numberElement) {numberElement.textContent = ": " + res.ALL_NUM;}}}).catch(error => console.error('Err--', error));}, 66);*/

setTimeout(() =>{ fetch("https://surge.tool/getkey") .then((response) => response.json()) .then((res) =>{ if (res?.AROBJ){ const newRes = Object.fromEntries( Object.entries(res.AROBJ).filter(([k, v]) => v !== 0) );const jsonString = JSON.stringify(newRes, null, 1) .replace(/"|{|}|'|,/g, "") .trim();document.getElementById("AROBJ").textContent = jsonString;} const linkAdd = document.getElementById("RULELIST");if (res?.RULELISTALL){ Object.entries(res.RULELISTALL).forEach(([k, v]) =>{ const linke = document.createElement("a");linke.href = k;linke.target = "_blank";linke.textContent = v.n + ":" + v.l;linkAdd.appendChild(linke);linkAdd.appendChild(document.createElement("br"));});} else{ ruleListPre = document.getElementById("RULELISTPRE");if (ruleListPre){ ruleListPre.remove();linkAdd.remove();}} if (res?.ALL_NUM){ const numberElement = document.getElementById("ALL_NUM");if (numberElement){ numberElement.textContent = ":" + res.ALL_NUM;}}}) .catch((error) => console.error("Err--", error));}, 66);
</script></body></html>`,
        },
      };
    }
  } catch (e) {
    console.log(e.message);
    throw new Error("无法获取当前配置信息");
  }
})()
  .catch((e) => {
    console.log(e.message);
    // prettier-ignore
    if (isPanel) {result = {title: "Surge Tool",content: "Err" + e.message,icon: icons,"icon-color": icolor,};} else {result = {response: {status: 500,headers: { "Content-Type": "text/html" },body: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>pre { overflow: unset } pre code { white-space: pre-line }</style></head><body><section><h1>错误</h1><pre><code>${e.message ?? e}</pre></code></section></body></html>`,},};}
  })
  .finally(() => $done(result));

// prettier-ignore
function httpAPI(path = "", method = "POST", body = null) {return new Promise((resolve) => {$httpAPI(method, path, body, (result) => {resolve(result);});});}
// prettier-ignore
function getin() {return Object.fromEntries($argument.split("&").map((i) => i.split("=")).map(([k, v]) => [k, decodeURIComponent(v)]));}
// prettier-ignore
async function tKey(e,t="3000"){let o=1,r=1;const s=new Promise(((s,i)=>{const c=async l=>{try{const o=await Promise.race([new Promise(((t,o)=>{$httpClient.get({url:e},((e,n,r)=>{if(e){o(e)}else{t(r)}}))})),new Promise(((e,o)=>{setTimeout((()=>o(new Error("timeout"))),t)}))]);if(o){s(o)}else{i(new Error(n.message))}}catch(e){if(l<o){r++;c(l+1)}else{console.log("reget"+r);s("reget"+r)}}};c(0)}));return s}
