const isLoon = typeof $loon !== "undefined";
let banner = true,
  top = true,
  bannerAd = true;
if (isLoon) {
  bannerAd = $persistentStore.read("去除轮播图广告") === "开启";
  banner = $persistentStore.read("去除整个轮播图") === "开启";
  top = $persistentStore.read("去除置顶") === "开启";
} else if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  bannerAd = ins.bannerAd != 0;
  banner = ins.banner != 0;
  top = ins.top != 0;
}

let FeedTypes = [10023]; //直播tip

let i = JSON.parse($response.body);
if (i?.data?.list) {
  if (bannerAd && !banner) {
    for (const Type of i.data.list) {
      if (Type.feedType === 10002) {
        Type.feedContent.focusNewsData = Type.feedContent.focusNewsData.filter(
          (i) => {
            return i.isAd === false; // 轮播图广告
          }
        );
        break;
      }
    }
  }
  banner && FeedTypes.push(10002); //轮播
  top && FeedTypes.push(10003); //置顶
  i.data.list = i.data.list.filter((item) => {
    return (
      !FeedTypes.includes(item.feedType) &&
      !item.feedContent.smallTags?.[0].text.includes("广告")
    );
  });
}
$done({ body: JSON.stringify(i) });

// prettier-ignore
function getin() {return Object.fromEntries($argument.split("&").map((i) => i.split("=")).map(([k, v]) => [k, decodeURIComponent(v)]));}
