let appName = $persistentStore.read("appName")
let author = $persistentStore.read("author")
let appType = $persistentStore.read("appType")
let price = $persistentStore.read("price")

let test = $persistentStore.read("测试")

console.log(appName + " " + author +  " " + appType +  " " + price)
$done()