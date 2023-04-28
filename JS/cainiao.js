
var okk = JSON.parse($response.body);
console.log($response.body)
if (okk) {
  switch (true) {
    case /cainiao\.nbpresentation\.protocol\.homepage\.get\.cn/.test(
      $request.url
    )://首页 红点，闪烁图标，推广
      //ljjq 领寄件券
      //ttlhb 天天领红包
      //gjjf 裹酱积分
      //bgxq 包裹星球
      //cngreen 绿色家园
      //tcqs 同城取送
      const kkkey = ["gjjf", "bgxq", "cngreen", "ttlhb", "ljjq"];
      const delkey = okk.data.result.dataList.filter((item) => {
        if (item.bizData.items) {
          item.bizData.items = item.bizData.items.filter(
            (subItem) => !kkkey.includes(subItem.key)
          );
        }
        return true;
      });
      okk.data.result.dataList = delkey;
      // 遍历 items 数组
      for ( let i = 0; i < okk.data.result.dataList.length; i++) {
        for ( let j = 0; j < okk.data.result.dataList[i].bizData.items.length; j++ ) {
          // 将 rightIcon 和 bubbleText 红点提醒 设为 null
          okk.data.result.dataList[i].bizData.items[j].rightIcon = null;
          okk.data.result.dataList[i].bizData.items[j].bubbleText = null;
        }}
      break;
    case /cainiao\.adkeyword/.test($request.url):
      // 搜索框下方今日好物推荐
      okk.data.result.adHotKeywords = [];
      break;
    case /cainiao\.guoguo\.nbnetflow\.ads\.index\.cn/.test($request.url):
      // 底部商品推广
      okk.data.result = [];
      break;
    default:
      $done({});
      break;}
  $done({ body: JSON.stringify(okk) });
} else $done({});