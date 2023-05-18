/*说明: https://github.com/Keywos/rule/blob/main/readme.md
用法：Sub-Store脚本操作添加
例如：https://raw.githubusercontent.com/Keywos/rule/main/rename.js#name=测试&flag
日期：2023/05/15.2
-------------------------------- 
rename.js 以下是此脚本支持的参数，必须以 # 为开头多个参数使用"&"连接，参考上述地址为例使用参数。
[bl]:     保留: 家宽 ，IPLC 几倍之类的标识
[blpx]:   如果用了上面的bl参数,对保留标识后的名称分组排序,如果没用上面的bl参数单独使用blpx则不起任何作用
[one]:    清理只有一个节点的地区的01 
[flag]:   给节点前面加国旗
[name=]:  添加机场名前缀在节点最前面
[out=]:   输出节点名可选参数: (cn ，us ，quan) 对应：中文，英文缩写 ，英文全称 , 默认中文
--------------------------------
以下为不常用参数:
[in=]:    自动判断机场节点名类型(那种类型多就判断为那种) 也可以加参数指定 (cn ，us ，quan)
[nx]:     保留1倍率与不显示倍率的
[blnx]:   只保留高倍率
[clear]:  清理乱七八糟的名字
*/
//const bl = 1;
const bl = $arguments["bl"];
const blpx = $arguments["blpx"];
const nx = $arguments["nx"];
const blnx = $arguments["blnx"];
const numone = $arguments["one"];
const clear = $arguments["clear"];
const addflag = $arguments["flag"];
const jcname = $arguments.name == undefined ? "" : decodeURI($arguments.name);
const inname = $arguments["in"] === "cn" ? "cn" : $arguments["in"] === "us" ? "us" : $arguments["in"] === "quan" ? "quan" : "";
function getList(arg) { switch (arg) { case "us": return us; case "quan": return quan; default: return cn;}}

function jxh(e) {const n = e.reduce((e, n) => { const t = e.find((e) => e.name === n.name); if (t) {t.count++;t.items.push({ ...n, name: `${n.name} ${t.count.toString().padStart(2, "0")}` }); } else {if (!numone) {e.push({ name: n.name, count: 1, items: [{ ...n, name: `${n.name} 01` }] });} else {e.push({ name: n.name, count: 1, items: [{ ...n, name: `${n.name}` }] });} } return e;}, []);const t = n.flatMap((e) => e.items);e.splice(0, e.length, ...t);return e;}

function getflag(e){const n=e.toUpperCase().split("").map((e=>127397+e.charCodeAt()));return String.fromCodePoint(...n).replace(/🇹🇼/g,"🇨🇳")}
function getRegion(proxyName) {if (cn.some((name) => proxyName.includes(name))) {return "cn";} else if (us.some((name) => proxyName.includes(name))) {return "us";} else if (quan.some((name) => proxyName.includes(name))) {return "quan";} else {return null;}}
function fampx(proxies) {const wis = [];const wnout = [];for (const proxy of proxies) {const fan = specialRegex.some(regex => regex.test(proxy.name));if (fan) {wis.push(proxy);} else {wnout.push(proxy);}}const sps = wis.map(proxy => specialRegex.findIndex(regex => regex.test(proxy.name)));wis.sort((a, b) => sps[wis.indexOf(a)] - sps[wis.indexOf(b)] || a.name.localeCompare(b.name));wnout.sort((a, b) => proxies.indexOf(a) - proxies.indexOf(b));return wnout.concat(wis);}

const regexArray=[/²/, /³/, /⁴/, /⁵/, /⁶/, /⁷/, /⁸/, /⁹/, /¹⁰/, /²⁰/, /³⁰/, /⁴⁰/, /⁵⁰/, /IPLC/, /IEPL/, /核心/, /边缘/, /高级/, /标准/, /实验/, /商宽/, /家宽/, /游戏/, /购物/, /专线/, /LB/, /cloudflare/i, /udp/i];

const valueArray= [ "2×","3×","4×","5×","6×","7×","8×","9×","10×","20×","30×","40×","50×","IPLC","IEPL","Kern","Edge","Pro","Std","Exp","Biz","Fam","Game","Buy","Zx","LB","CF","UDP"];

const specialRegex = [ /(\d\.)?\d+×/, /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/];

const nameclear =/(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;

const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;

const us= ['HK','MO','TW','JP','KR','SG','SG','US','US','GB','FR','DE','AU','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RE','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','AE','AE','UY','UZ','VA','VE','VN','YE','YU','ZR','ZM','ZW','BD','CZ','AD','Chuncheon','Seoul','Osaka','Tokyo','London','Taipei','Taipei','LosAngeles','SanJose','SiliconValley','Michigan','Mumbai','Frankfurt','Zurich','Moscow','Reunion','PL','GU','VA','LI','CW','SC','AQ','CN'];

const cn=['香港','澳门','台湾','日本','韩国','新加坡','狮城','美国','美国','英国','法国','德国','澳大利亚','澳洲','迪拜','阿富汗','阿尔巴尼亚','阿尔及利亚','安哥拉','阿根廷','亚美尼亚','奥地利','阿塞拜疆','巴林','孟加拉国','白俄罗斯','比利时','伯利兹','贝宁','不丹','玻利维亚','波斯尼亚和黑塞哥维那','波黑共和国','博茨瓦纳','巴西','英属维京群岛','文莱','保加利亚','布基纳法索','布隆迪','柬埔寨','喀麦隆','加拿大','佛得角','开曼群岛','中非共和国','乍得','智利','哥伦比亚','科摩罗','刚果(布)','刚果(金)','哥斯达黎加','克罗地亚','塞浦路斯','捷克共和国','丹麦','吉布提','多米尼加共和国','厄瓜多尔','埃及','萨尔瓦多','赤道几内亚','厄立特里亚','爱沙尼亚','埃塞俄比亚','斐济','芬兰','加蓬','冈比亚','格鲁吉亚','加纳','希腊','格陵兰','危地马拉','几内亚','圭亚那','海地','洪都拉斯','匈牙利','冰岛','印度','印度尼西亚','印尼','伊朗','伊拉克','爱尔兰','马恩岛','以色列','意大利','科特迪瓦','牙买加','约旦','哈萨克斯坦','肯尼亚','科威特','吉尔吉斯斯坦','老挝','拉脱维亚','黎巴嫩','莱索托','利比里亚','利比亚','立陶宛','卢森堡','马其顿','马达加斯加','马拉维','马来','马尔代夫','马里','马耳他','毛利塔尼亚','毛里求斯','墨西哥','摩尔多瓦','摩纳哥','蒙古','黑山共和国','摩洛哥','莫桑比克','缅甸','纳米比亚','尼泊尔','荷兰','新西兰','尼加拉瓜','尼日尔','尼日利亚','朝鲜','挪威','阿曼','巴基斯坦','巴拿马','巴拉圭','秘鲁','菲律宾','葡萄牙','波多黎各','卡塔尔','留尼旺','罗马尼亚','俄罗斯','卢旺达','圣马力诺','沙特阿拉伯','塞内加尔','塞尔维亚','塞拉利昂','斯洛伐克','斯洛文尼亚','索马里','南非','西班牙','斯里兰卡','苏丹','苏里南','斯威士兰','瑞典','瑞士','叙利亚','塔吉克斯坦','坦桑尼亚','泰国','多哥','汤加','特立尼达和多巴哥','突尼斯','土耳其','土库曼斯坦','美属维尔京群岛','乌干达','乌克兰','阿拉伯联合酋长国','阿联酋','乌拉圭','乌兹别克斯坦','梵蒂冈城','委内瑞拉','越南','也门','南斯拉夫','扎伊尔','赞比亚','津巴布韦','孟加拉','捷克','安道尔','春川','首尔','大坂','东京','伦敦','台北','新北','洛杉矶','圣何塞','硅谷','密歇根','孟买','法兰克福','苏黎世','莫斯科','留尼汪','波兰','关岛','梵蒂冈','列支敦士登','库拉索','塞舌尔','南极','中国'];

const quan= ['Hong Kong', 'Macao','Taiwan','Japan','Korea','Singapore','Singapore','United States', 'USA', 'United Kingdom', 'France','Germany','Australia','Australia','Dubai','Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina', 'Bosnia and Herzegovina', 'Botswana','Brazil','British Virgin Islands','Brunei','Bulgaria','Burkina-faso','Burundi','Cambodia','Cameroon','Canada','CapeVerde','CaymanIslands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo-Brazzaville','Congo-Kinshasa','CostaRica','Croatia','Cyprus','Czech Republic', 'Denmark','Djibouti','Dominican Republic', 'Ecuador', 'Egypt','EISalvador','Equatorial Guinea', 'Eritrea', 'Estonia','Ethiopia','Fiji','Finland','Gabon','Gambia','Georgia','Ghana','Greece','Greenland','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Indonesia','Iran','Iraq','Ireland','Isle of Man', 'Israel','Italy','Ivory Coast', 'Jamaica','Jordan','Kazakstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar(Burma)','Namibia','Nepal','Netherlands','NewZealand','Nicaragua','Niger','Nigeria','NorthKorea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Portugal','PuertoRico','Qatar','Reunion','Romania','Russia','Rwanda','SanMarino','SaudiArabia','Senegal','Serbia','SierraLeone','Slovakia','Slovenia','Somalia','SouthAfrica','Spain','SriLanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Tajikstan','Tanzania','Thailand','Togo','Tonga','TrinidadandTobago','Tunisia','Turkey','Turkmenistan','U.S.Virgin Islands', 'Uganda','Ukraine','United Arab Emirates', 'United Arab Emirates', 'Uruguay','Uzbekistan','Vatican City', 'Venezuela','Vietnam','Yemen','Yugoslavia','Zaire','Zambia','Zimbabwe','Bangladesh','CzechRepublic','Andorra','Chuncheon','Seoul','Osaka','Tokyo','London','Taipei','Taipei','LosAngeles','SanJose','SiliconValley','Michigan','Mumbai','Frankfurt','Zurich','Moscow','Reunion','Poland','Guam','Vatican','Liechtensteins','Curacao','Seychelles','Antarctica','China'];


function operator(proxies) {
  const newProxiess = [];
  proxies.forEach((proxy) => {
    if (proxy.name.includes('UK')) {
      proxy = { ...proxy, name: proxy.name.replace('UK', 'GB') };}
    newProxiess.push(proxy);});
  proxies = newProxiess;
  if (inname !== "") { 
    var inputList = getList(inname); 
  } else {
    const regionCounts = proxies.slice(0,10).map(proxy => 
    getRegion(proxy.name)).reduce((counts, region) => {
    counts[region] = (counts[region] || 0) + 1; return counts; }, {});
    const regionEntries = Object.entries(regionCounts);
    regionEntries.sort((a, b) => b[1] - a[1]);
    const regionConst = regionEntries[0][0];
    var inputList = getList(regionConst);
  }
  var outputList = getList($arguments["out"]);
  var countries = inputList.reduce((acc, curr, index) => {
  acc[curr] = [outputList[index], 0];return acc;}, {});
  if (clear) {
  proxies = proxies.filter((item) => !nameclear.test(item.name));}
  if (nx) {proxies = proxies.filter((res) => res.name.match(namenx) ? false : true);}
  if (blnx) {proxies = proxies.filter((res) => res.name.match(nameblnx) ? true : false);}
  const toBeDeleted = [];
  const newProxies = [];
  proxies.forEach((res) => {
  let isMatched = false;
  const resultArray = [jcname];
  for (const elem of Object.keys(countries)) {
    if (res.name.indexOf(elem) !== -1) {
      if (!isMatched) {
      isMatched = true;
      countries[elem][1] += 1;
      if (addflag) {
        resultArray.push(getflag(us[Object.keys(countries).indexOf(elem)]) + ' ' + countries[elem][0]);
      } else {
        resultArray.push(countries[elem][0]);
      }
      if (bl) {
		//替换对应的
         regexArray.forEach((regex, index) => {
          if (regex.test(res.name)) {
          resultArray.splice(2, 0, valueArray[index]);}});
			//正则匹配对应数字加×
			const match = res.name.match(/(倍率\D?((\d\.)?\d+)\D?)|((\d\.)?\d+)(倍|X|x|×)/);
			if (match) {
			const matchedValue = match[0].match(/(\d[\d.]*)/)[0];
			if (matchedValue !== '1') {
			const newValue = matchedValue + "×";
			resultArray.push(newValue);}}
		}}}}
    if (isMatched) {
      // resultArray 空字符串
      const filteredResultArray = resultArray.filter(item => item.trim() !== '');
      newProxies.push({...res, name: filteredResultArray.join(" ")});
    } else {
      toBeDeleted.push(res);}
    });
  toBeDeleted.forEach((proxy) => {
    const index = proxies.indexOf(proxy);
    if (index !== -1) {
    proxies.splice(index, 1);}}); 
  proxies = newProxies;
  proxies = jxh(proxies);
  //numone && (proxies = oneProxies(proxies));
  blpx && (proxies = fampx(proxies));
  return proxies;
}
