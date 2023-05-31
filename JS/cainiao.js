let okk = JSON.parse($response.body);
switch (true) {
  case /cainiao\.nbpresentation\.protocol\.homepage\.get\.cn/.test($request.url):
    //首页 红点，闪烁图标，推广,ljjq 领寄件券,ttlhb 天天领红包,gjjf 裹酱积分,bgxq 包裹星球,cngreen 绿色家园,tcqs 同城取送,qydq 亲友代取
    const kkkey = ["gjjf", "bgxq", "cngreen", "ttlhb", "ljjq"];
    okk.data.result.dataList = okk.data.result.dataList.filter((item) => {
      if (item.type == "big_banner_area_v870") {
        return false; // "big_banner_area_v870" 新人福利
      }
      if (item.bizData.items) {
        item.bizData.items = item.bizData.items.filter((subItem) => {
          return !kkkey.includes(subItem.key); // 过滤掉 key 在 kkkey 中的子元素
        });
      }
      return true; //其他保留
    });
    okk.data.result.dataList.forEach((data) => {
      data.bizData.items.forEach((item) => {
        item.rightIcon = null;
        item.bubbleText = null;
      });
    });
    break;
  case /cainiao\.guoguo\.nbnetflow\.ads\.mshow/.test($request.url):
    const item = ["1316", "1332","1275","1308","1340"];
    for (let i of item) {
      if (okk.data?.[i]) {
        delete okk.data[i];
      }
    }
    break;
  case /guoguo\.nbnetflow\.ads\.show\.cn/.test($request.url):
    // 底部标签页
  if (okk.data.result) {
    okk.data.result = okk.data.result.filter(
    (i) =>!(i?.materialContentMapper?.group_id?.includes("entertainment") ||
        (i?.materialContentMapper?.bgImg &&
          i?.materialContentMapper?.advRecGmtModifiedTime)));}
    break;
  default:
    break;
}
$done({ body: JSON.stringify(okk) });
