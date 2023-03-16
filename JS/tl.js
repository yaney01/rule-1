/*
#!name=推栏 开屏广告
#!desc=2023..17

[MITM]
hostname = %APPEND% m.pvp.xoyo.com

[Script]
mm = type=http-response,pattern=^https\:\/\/m\.pvp\.xoyo\.com\/conf\/server-mapping,requires-body=1,max-size=0,script-path=https://github.com/Keywos/rule/raw/main/JS/tl.js
*/
let obj = JSON.parse($response.body);
obj.data.splashConfNew.forEach(item => {
  
	item.aliveTime = 0;
	item.status = item.status.replace("ON", "OFF");
	/*
	item.urlX = "";
	item.url = "";
	item.title = "去你的广告";
	*/
	let props = ["urlX", "url", "title"];
  if (obj.data) {
  props.forEach((prop) => {
    delete item[prop];
  });
}
});
$done({body: JSON.stringify(obj)});