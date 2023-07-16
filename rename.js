/*
更新日期：2023-07-01 11:20:01
说明: https://github.com/Keywos/rule/blob/main/readme.md
用法：Sub-Store脚本操作添加
例如：https://raw.githubusercontent.com/Keywos/rule/main/rename.js#name=测试&flag
-------------------------------- 
rename.js 以下是此脚本支持的参数，必须以 # 为开头多个参数使用"&"连接，参考上述地址为例使用参数。
[bl]:     保留: 家宽 ，IPLC 几倍之类的标识
[blpx]:   如果用了上面的bl参数,对保留标识后的名称分组排序,如果没用上面的bl参数单独使用blpx则不起任何作用
[fgf]:    自义定分隔符,默认是空格
[one]:    清理只有一个节点的地区的01 
[flag]:   给节点前面加国旗
[nf]:     默认下面参数的name在最前面，如果加此参数，name在国旗之后
[name=]:  添加机场名前缀在节点最前面
[out=]:   输出节点名可选参数: (cn ，us ，gq ，quan) 对应：(中文，英文缩写 ，国旗 ，英文全称) 默认中文
--------------------------------
以下为不常用参数:
[in=]:    自动判断机场节点名类型(那种类型多就判断为那种)(优先匹配原节点国旗) 也可以加参数指定 (cn ，us ，gq ，quan)
[nx]:     保留1倍率与不显示倍率的
[blnx]:   只保留高倍率
[clear]:  清理乱名
*/

const bl = $arguments["bl"], nf = $arguments["nf"],blpx = $arguments["blpx"], nx = $arguments["nx"], blnx = $arguments["blnx"], numone = $arguments["one"], key = $arguments["key"],clear = $arguments["clear"], addflag = $arguments["flag"];
const jcname = $arguments.name == undefined ? "" : decodeURI($arguments.name), FGF = $arguments.fgf == undefined ? " " : decodeURI($arguments.fgf);
const inname = $arguments["in"] === "cn" ? "cn" : $arguments["in"] === "us" ? "us" : $arguments["in"] === "quan" ? "quan" : $arguments["gq"] === "gq" ? "gq" : "";
function gl(arg) { switch (arg) { case "gq": return gq; case "us": return us; case "quan": return quan; default: return cn; }}
function jxh(e){const n=e.reduce(((e,n)=>{const t=e.find((e=>e.name===n.name));if(t){t.count++;t.items.push({...n,name:`${n.name}${FGF}${t.count.toString().padStart(2,"0")}`})}else{e.push({name:n.name,count:1,items:[{...n,name:`${n.name}${FGF}01`}]})}return e}),[]);const t=n.flatMap((e=>e.items));e.splice(0,e.length,...t);return e}
function oneP(y){const groups = y.reduce((groups, proxy) => { const name = proxy.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, ''); if (!groups[name]) { groups[name] = []; } groups[name].push(proxy);return groups; }, {});for(const name in groups) {if (groups[name].length === 1 && groups[name][0].name.endsWith('01')) {const proxy = groups[name][0];proxy.name = name;}};return y;}
function gF(e){const n=e.toUpperCase().split("").map((e=>127397+e.charCodeAt()));return String.fromCodePoint(...n).replace(/🇹🇼/g,"🇨🇳")}
function gReg(pn) { if (gq.some((name) => pn.includes(name))) { return "gq"; } else if (cn.some((name) => pn.includes(name))) { return "cn"; } else if (quan.some((name) => pn.includes(name))) { return "quan"; } else if (us.some((name) => pn.includes(name))) { return "us"; } else { return null; } } 
function fampx(y) {const wis = [];const wnout = [];for (const proxy of y) {const fan = specialRegex.some(regex => regex.test(proxy.name));if (fan) {wis.push(proxy);} else {wnout.push(proxy);}}const sps = wis.map(proxy => specialRegex.findIndex(regex => regex.test(proxy.name)));wis.sort((a, b) => sps[wis.indexOf(a)] - sps[wis.indexOf(b)] || a.name.localeCompare(b.name));wnout.sort((a, b) => y.indexOf(a) - y.indexOf(b));return wnout.concat(wis);}
const rurekey = { GB:/UK/g, "B-G-P":/BGP/g, "Russia Moscow":/Moscow/g, "Korea Chuncheon":/Chuncheon|Seoul/g, "Hong Kong":/Hongkong|HongKong|HONG KONG/g, "United Kingdom London":/London|Great Britain/g, "Dubai United Arab Emirates":/United Arab Emirates/g, "United States":/USA|Los Angeles|San Jose|Silicon Valley|Michigan/g, 中国:/中國|回国|回國|国内|國內|华东|华西|华南|华北|华中|江苏|北京|上海|广州|深圳|杭州|徐州|青岛|宁波|镇江/g, 澳大利亚:/澳洲|墨尔本|悉尼|土澳|(深|沪|呼|京|广|杭)澳/g, 德国:/(深|沪|呼|京|广|杭)德|法兰克福|滬德/g, 香港:/(深|沪|呼|京|广|杭)港/g, 日本:/(深|沪|呼|京|广|杭|中|辽)日|东京|大坂/g, 新加坡:/狮城｜(深|沪|呼|京|广|杭)新/g, 美国:/(深|沪|呼|京|广|杭)美|波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|洛杉矶|圣何塞|西雅图|芝加哥/g, 美国:/圣何塞|洛杉矶/g, 波斯尼亚和黑塞哥维那:/波黑共和国/g, 印度尼西亚:/印尼|雅加达/g, 印度:/孟买/g, 迪拜:/阿联酋|阿拉伯联合酋长国/g, 孟加拉国:/孟加拉/g, 捷克:/捷克共和国/g, 台湾:/新台|新北|台/g, Taiwan:/Taipei/g, 韩国:/春川|韩|首尔/g, Japan:/Tokyo|Osaka/g, 英国:/伦敦/g, India:/Mumbai/g, Germany:/Frankfurt/g, Switzerland:/Zurich/g, 俄罗斯:/莫斯科/g, 土耳其:/伊斯坦布尔/g, 泰国:/泰國|曼谷/g, 法国:/巴黎/g,};
const gq = ["🇭🇰","🇲🇴","🇹🇼","🇯🇵","🇰🇷","🇸🇬","🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇦🇺","🇦🇪","🇦🇫","🇦🇱","🇩🇿","🇦🇴","🇦🇷","🇦🇲","🇦🇹","🇦🇿","🇧🇭","🇧🇩","🇧🇾","🇧🇪","🇧🇿","🇧🇯","🇧🇹","🇧🇴","🇧🇦","🇧🇼","🇧🇷","🇻🇬","🇧🇳","🇧🇬","🇧🇫","🇧🇮","🇰🇭","🇨🇲","🇨🇦","🇨🇻","🇰🇾","🇨🇫","🇹🇩","🇨🇱","🇨🇴","🇰🇲","🇨🇬","🇨🇩","🇨🇷","🇭🇷","🇨🇾","🇨🇿","🇩🇰","🇩🇯","🇩🇴","🇪🇨","🇪🇬","🇸🇻","🇬🇶","🇪🇷","🇪🇪","🇪🇹","🇫🇯","🇫🇮","🇬🇦","🇬🇲","🇬🇪","🇬🇭","🇬🇷","🇬🇱","🇬🇹","🇬🇳","🇬🇾","🇭🇹","🇭🇳","🇭🇺","🇮🇸","🇮🇳","🇮🇩","🇮🇷","🇮🇶","🇮🇪","🇮🇲","🇮🇱","🇮🇹","🇨🇮","🇯🇲","🇯🇴","🇰🇿","🇰🇪","🇰🇼","🇰🇬","🇱🇦","🇱🇻","🇱🇧","🇱🇸","🇱🇷","🇱🇾","🇱🇹","🇱🇺","🇲🇰","🇲🇬","🇲🇼","🇲🇾","🇲🇻","🇲🇱","🇲🇹","🇲🇷","🇲🇺","🇲🇽","🇲🇩","🇲🇨","🇲🇳","🇲🇪","🇲🇦","🇲🇿","🇲🇲","🇳🇦","🇳🇵","🇳🇱","🇳🇿","🇳🇮","🇳🇪","🇳🇬","🇰🇵","🇳🇴","🇴🇲","🇵🇰","🇵🇦","🇵🇾","🇵🇪","🇵🇭","🇵🇹","🇵🇷","🇶🇦","🇷🇴","🇷🇺","🇷🇼","🇸🇲","🇸🇦","🇸🇳","🇷🇸","🇸🇱","🇸🇰","🇸🇮","🇸🇴","🇿🇦","🇪🇸","🇱🇰","🇸🇩","🇸🇷","🇸🇿","🇸🇪","🇨🇭","🇸🇾","🇹🇯","🇹🇿","🇹🇭","🇹🇬","🇹🇴","🇹🇹","🇹🇳","🇹🇷","🇹🇲","🇻🇮","🇺🇬","🇺🇦","🇺🇾","🇺🇿","🇻🇪","🇻🇳","🇾🇪","🇿🇲","🇿🇼","🇦🇩","🇷🇪","🇵🇱","🇬🇺","🇻🇦","🇱🇮","🇨🇼","🇸🇨","🇦🇶","🇬🇮","🇨🇺","🇨🇳",]
const us = ["HK","MO","TW","JP","KR","SG","US","GB","FR","DE","AU","AE","AF","AL","DZ","AO","AR","AM","AT","AZ","BH","BD","BY","BE","BZ","BJ","BT","BO","BA","BW","BR","VG","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CO","KM","CG","CD","CR","HR","CY","CZ","DK","DJ","DO","EC","EG","SV","GQ","ER","EE","ET","FJ","FI","GA","GM","GE","GH","GR","GL","GT","GN","GY","HT","HN","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","CI","JM","JO","KZ","KE","KW","KG","LA","LV","LB","LS","LR","LY","LT","LU","MK","MG","MW","MY","MV","ML","MT","MR","MU","MX","MD","MC","MN","ME","MA","MZ","MM","NA","NP","NL","NZ","NI","NE","NG","KP","NO","OM","PK","PA","PY","PE","PH","PT","PR","QA","RO","RU","RW","SM","SA","SN","RS","SL","SK","SI","SO","ZA","ES","LK","SD","SR","SZ","SE","CH","SY","TJ","TZ","TH","TG","TO","TT","TN","TR","TM","VI","UG","UA","UY","UZ","VE","VN","YE","ZM","ZW","AD","RE","PL","GU","VA","LI","CW","SC","AQ","GI","CU","CN",];
const cn = ["香港","澳门","台湾","日本","韩国","新加坡","美国","英国","法国","德国","澳大利亚","迪拜","阿富汗","阿尔巴尼亚","阿尔及利亚","安哥拉","阿根廷","亚美尼亚","奥地利","阿塞拜疆","巴林","孟加拉国","白俄罗斯","比利时","伯利兹","贝宁","不丹","玻利维亚","波斯尼亚和黑塞哥维那","博茨瓦纳","巴西","英属维京群岛","文莱","保加利亚","布基纳法索","布隆迪","柬埔寨","喀麦隆","加拿大","佛得角","开曼群岛","中非共和国","乍得","智利","哥伦比亚","科摩罗","刚果(布)","刚果(金)","哥斯达黎加","克罗地亚","塞浦路斯","捷克","丹麦","吉布提","多米尼加共和国","厄瓜多尔","埃及","萨尔瓦多","赤道几内亚","厄立特里亚","爱沙尼亚","埃塞俄比亚","斐济","芬兰","加蓬","冈比亚","格鲁吉亚","加纳","希腊","格陵兰","危地马拉","几内亚","圭亚那","海地","洪都拉斯","匈牙利","冰岛","印度","印度尼西亚","伊朗","伊拉克","爱尔兰","马恩岛","以色列","意大利","科特迪瓦","牙买加","约旦","哈萨克斯坦","肯尼亚","科威特","吉尔吉斯斯坦","老挝","拉脱维亚","黎巴嫩","莱索托","利比里亚","利比亚","立陶宛","卢森堡","马其顿","马达加斯加","马拉维","马来","马尔代夫","马里","马耳他","毛利塔尼亚","毛里求斯","墨西哥","摩尔多瓦","摩纳哥","蒙古","黑山共和国","摩洛哥","莫桑比克","缅甸","纳米比亚","尼泊尔","荷兰","新西兰","尼加拉瓜","尼日尔","尼日利亚","朝鲜","挪威","阿曼","巴基斯坦","巴拿马","巴拉圭","秘鲁","菲律宾","葡萄牙","波多黎各","卡塔尔","罗马尼亚","俄罗斯","卢旺达","圣马力诺","沙特阿拉伯","塞内加尔","塞尔维亚","塞拉利昂","斯洛伐克","斯洛文尼亚","索马里","南非","西班牙","斯里兰卡","苏丹","苏里南","斯威士兰","瑞典","瑞士","叙利亚","塔吉克斯坦","坦桑尼亚","泰国","多哥","汤加","特立尼达和多巴哥","突尼斯","土耳其","土库曼斯坦","美属维尔京群岛","乌干达","乌克兰","乌拉圭","乌兹别克斯坦","委内瑞拉","越南","也门","赞比亚","津巴布韦","安道尔","留尼汪","波兰","关岛","梵蒂冈","列支敦士登","库拉索","塞舌尔","南极","直布罗陀","古巴","中国",];
const quan = ["Hong Kong","Macao","Taiwan","Japan","Korea","Singapore","United States","United Kingdom","France","Germany","Australia","Dubai","Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina-faso","Burundi","Cambodia","Cameroon","Canada","CapeVerde","CaymanIslands","Central African Republic","Chad","Chile","Colombia","Comoros","Congo-Brazzaville","Congo-Kinshasa","CostaRica","Croatia","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","EISalvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","Gabon","Gambia","Georgia","Ghana","Greece","Greenland","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Ivory Coast","Jamaica","Jordan","Kazakstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar(Burma)","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","NorthKorea","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Portugal","PuertoRico","Qatar","Romania","Russia","Rwanda","SanMarino","SaudiArabia","Senegal","Serbia","SierraLeone","Slovakia","Slovenia","Somalia","SouthAfrica","Spain","SriLanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Tajikstan","Tanzania","Thailand","Togo","Tonga","TrinidadandTobago","Tunisia","Turkey","Turkmenistan","U.S.Virgin Islands","Uganda","Ukraine","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","Andorra","Reunion","Poland","Guam","Vatican","Liechtensteins","Curacao","Seychelles","Antarctica","Gibraltar","Cuba","China",];
const specialRegex = [ /(\d\.)?\d+×/, /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/];
const nameclear =/(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
const regexArray=[/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/, /IPLC/i, /IEPL/i, /核心/, /边缘/, /高级/, /标准/, /实验/, /商宽/, /家宽/, /游戏|game/i, /购物/, /专线/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i,/udpn\b/];
const valueArray= [ "2×","3×","4×","5×","6×","7×","8×","9×","10×","20×","30×","40×","50×","IPLC","IEPL","Kern","Edge","Pro","Std","Exp","Biz","Fam","Game","Buy","Zx","LB","CF","UDP","GPT","UDPN"];
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
function operator(y) {
  y.forEach((e) => {
    Object.keys(rurekey).forEach((ikey) => {
      e.name = e.name.replace(rurekey[ikey], ikey);
    });
  });
  if (inname !== "") { 
    var inputList = gl(inname); 
  } else {
      const inn = y.slice(0, 10).map((proxy) => gReg(proxy.name)).reduce((counts, region) => {
          counts[region] = (counts[region] || 0) + 1;
          return counts;
      }, {});
    const rein = Object.entries(inn);
    rein.sort((a, b) => b[1] - a[1]);
    const regss = rein[0][0];
    var inputList = gl(regss);
  }
  var outputList = gl($arguments["out"]);
  var ik = inputList.reduce((acc, curr, index) => {
    acc[curr] = [outputList[index], 0];return acc;
  }, {});
  if(clear){y = y.filter(res => !nameclear.test(res.name))}
  if(nx){y = y.filter(res => !res.name.match(namenx))}
  if(blnx){y = y.filter(res => res.name.match(nameblnx))}
  if (key) {y = y.filter(res =>
      res.name.match(/港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i) &&
      res.name.match(/2|4|6|7/i))
  }
  const delFgf = [];
  const newPr = [];
  y.forEach((res) => {
    let isFgf = false;
    const ikey=[]
    if (!nf) {ikey.push(jcname)}
    for (const elem of Object.keys(ik)) {
      if (res.name.indexOf(elem) !== -1) {
        if (!isFgf) {
          isFgf = true;
          ik[elem][1] += 1;
          let namekey = nf ? jcname + FGF : "";
          if (addflag) {
            ikey.push(gF(us[Object.keys(ik).indexOf(elem)]) +FGF+ namekey + ik[elem][0]);
          } else {
            ikey.push(ik[elem][0]);
          }
          if (bl) {
            regexArray.forEach((regex, index) => {
              if (regex.test(res.name)) {
              ikey.splice(2, 0, valueArray[index]);}}); 
            const match = res.name.match(/((倍率|X|x|×)\D?((\d\.)?\d+)\D?)|((\d\.)?\d+)(倍|X|x|×)/);
            if (match) {
              const rev = match[0].match(/(\d[\d.]*)/)[0];
              if (rev !== '1') {
                const newValue = rev + "×";
                ikey.push(newValue);}}
          }
        }
      }
    }
    if (isFgf) {
      const kb = ikey.filter(item => item.trim() !== '');
      newPr.push({...res, name: kb.join(FGF)});
    } else {delFgf.push(res);}
  });
  delFgf.forEach((proxy) => {
    const index = y.indexOf(proxy);
    if (index !== -1) {
    y.splice(index, 1);}
  }); 
  y = newPr;
  y = jxh(y);
  numone && (y = oneP(y));
  blpx && (y = fampx(y));
  if (key) { y = y.filter(res => 
    !res.name.match(/((香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i)) 
  }
  return y;
}

