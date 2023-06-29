let keyus={日本: "JP", 韩国: "KR", 英国:"UK", 美国:"US", 台湾:"TW", 香港:"HK", 新加坡:"SG", 法国:"FR"},
  lk = $persistentStore.read("TikTok解锁地区"),
  loc = keyus[lk] || "KR", url = $request.url;
if (/\?residence=\$|mcc_mnc=/.test(url)) {
    console.log(url)
    url = url.replace(/_region=CN\&/g,`_region=${loc}&`).replace(/mcc_mnc=4/g,"mcc_mnc=2")
    console.log(url)
  $done({response: {status: 307, headers: {Location: url}}});
} else {
  $done({})
}