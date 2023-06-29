let keyus={日本: JP, 韩国: KR, 英国:UK, 美国:US, 台湾:TW, 香港:HK, 新加坡:SG, 法国:FR},
  lk = $persistentStore.read("TikTok解锁地区"),
  loc = keyus[lk] || KR,
  url = $request.url;
if (/\?residence=\$/.test(url)) {
    url = url.replace(/(?<=_region=)CN(?=&)/g,loc)
  $done({response: {status: 307, headers: {Location: url}}});
} else {
  $done({})
}