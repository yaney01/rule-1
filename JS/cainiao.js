let okk = JSON.parse($response.body);
switch (true) {
  case /cainiao\.nbpresentation\.protocol\.homepage\.get\.cn/.test(
    $request.url):
    if (okk.data.result) {
  let res = okk.data.result;
  if (res.dataList) {
    const ikey = [
      "bgxq",    // 包裹星球
      "cngy",    // 免费领水果
      "cngreen", // 绿色家园
      "gjjf",    // 裹酱积分
      "ljjq",    // 领寄件券
      "ttlhb",   // 天天领红包
			"jkymd", // 集卡赢免单
    ];
    res.dataList = res.dataList.filter((i) => {
      if (i.type.includes("icons_scroll_unable") && i.bizData.items) {
        i.bizData.items = i.bizData.items.filter((ii) => !ikey.includes(ii.key));
        return true;
      } else if (i.type.includes("big_banner_area")) {
        return false; // 过滤掉新人福利
      } else if (i.type.includes("promotion")) {
        return false; // 过滤掉促销活动
      } else {
        return true; // 保留其他情况
      }
    });
    res.dataList.forEach((i) => {
      i.bizData.items.forEach((ii) => {
        ii.rightIcon = null;
        ii.bubbleText = null;
      });
    });}}
    break;
  case /cainiao\.guoguo\.nbnetflow\.ads\.mshow/.test($request.url):
    const item = ["1316", "1332", "1275", "1308", "1340"];
    for (let i of item) {
      if (okk.data?.[i]) {
        delete okk.data[i];
      }
    }
    break;
  case /nbpresentation\.homepage\.merge\.get\.cn/.test($request.url):
    if (okk.data) {
      // 移除 反馈组件
      const item = [
        "mtop.cainiao.nbmensa.research.researchservice.acquire.cn@0",
        "mtop.cainiao.nbmensa.research.researchservice.acquire.cn@1",
        "mtop.cainiao.nbmensa.research.researchservice.acquire.cn@2",
        "mtop.cainiao.nbmensa.research.researchservice.acquire.cn@3",
      ];
      for (let i of item) {
        if (okk.data?.[i]) {
          delete okk.data[i];
        }
      }
    }
    break;
  case /nbpresentation\.pickup\.empty\.page\.get\.cn/.test($request.url):
    if (okk.data.result) {
      let ggContent = okk.data.result.content;
      if (ggContent.middle) {
        ggContent.middle = ggContent.middle.filter(
          (i) =>
            ![
              "guoguo_pickup_empty_page_relation_add", // 添加亲友
              "guoguo_pickup_helper_feedback", // 反馈组件
              "guoguo_pickup_helper_tip_view", // 取件小助手
            ].includes(i.template.name)
        );
      }
    }
    break;
  case /guoguo\.nbnetflow\.ads\.show\.cn/.test($request.url):
    if (okk.data.result) {
      okk.data.result = okk.data.result.filter((i) => {
        const stad = i?.materialContentMapper?.templateCode;
        const stadcn = i?.id;

        const group_id = i?.materialContentMapper?.group_id;
        const bgImg = i?.materialContentMapper?.bgImg;
        const adTime = i?.materialContentMapper?.advRecGmtModifiedTime;

        const stakey = "fly_splash_picture"; // 开屏
        const hebing = new Set(["entertainment", "kuaishou_banner", "common_header_banner","interests"]); // 底部标签页活动 、快手banner 我的权益

        return !(
          stadcn?.includes("29524") ||
          stad?.includes(stakey) ||
          (group_id && hebing.has(group_id)) ||
          (bgImg && adTime)
        );
      });
    }
    break;
  default:
    break;
}
$done({ body: JSON.stringify(okk) });
