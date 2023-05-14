let url = "http://ip-api.com/json/?lang=zh-CN"
$httpClient.get(url, function(error, response, data){
let jsonData = JSON.parse(data)
let ip = jsonData.query
let org = jsonData.org
let isp = jsonData.isp
.replace(/(, )?Inc\./g, "").replace(/\.com/g, "");
let country = jsonData.country;
let city = jsonData.city;
let citys = jsonData.regionName;
let locationsArray = [country, city, citys];
let uniqueLocationsArray = [...new Set(locationsArray)];
let uniqueLocations = uniqueLocationsArray.join("  ");
  body = {
    title: `ISP: ${isp}`,
		//${emoji}
    content: `${org} \n${uniqueLocations} ${ip}`
   // icon: "key.icloud", 'icon-color': "#FF5A9AF9"
  },$done(body);})