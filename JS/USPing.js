// US Ping最小值和最大值
const minValue = 10;
const maxValue = 400;
let $ = {
  Ping: "http://cp.cloudflare.com/generate_204",
  // Y: 'http://youtube.com',
  // Y: 'http://www.github.com',
};

(async () => {
  let results = {};
  let resultArr = [];
  for (let key in $) {
    let pingTimes = [];
    for (let i = 0; i < 2; i++) {
      let responseTime = await http(key);
      let time = parseFloat(responseTime.split(": ")[1]);
      pingTimes.push(time);
    }
    let avgTime = Math.round(
      pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length
    );
    let resultText = `Avg: ${avgTime
      .toString()
      .padEnd(4, " ")}ms\t➟   ${key}: ${pingTimes} ms `;

   
    // console.log("最大值为: " + maxValue);
    // 归一化并转换为字符表示形式
    const result = pingTimes
      .map((x) => {
        let normalizedValue = (x - minValue) / (maxValue - minValue);
        if (normalizedValue > 1) {
          normalizedValue = 1;
        }
        const charCode = Math.floor(normalizedValue * 6) + 0x2581;
				
         if (charCode > 0x2587) {
    return "\u2589";
  } else if (charCode < 0x2581) {
    return "\u2581";
  } else {
    return String.fromCharCode(charCode);
  }
      })
      .join("");
    resultArr.push(result); // 将结果 push 到数组中
    results[key] = resultText;
  }
  let outping = "";
  for (let key in results) {
    let resultText = results[key];
    outping += resultText;
  }
  // 数组拼接成字符串
  let result = resultArr.join("");
  // console.log(result);
  const timestamp = new Date().getTime();
  // 从持久化缓存中读取保存的数据
  const savedDataStr = $persistentStore.read("KEY-US-Ping");
  const savedData = savedDataStr ? JSON.parse(savedDataStr) : {};
  // 将时间戳和延迟保存到对象中
  savedData[timestamp] = result;
  // 量超过9 删除最早的
  const maxItems = 9;
  const savedDataKeys = Object.keys(savedData);
  if (savedDataKeys.length > maxItems) {
    const oldestTimestamp = savedDataKeys.sort()[0];
    delete savedData[oldestTimestamp];
  }
  // 对象序列化成字符串、 保存
  const resultss = $persistentStore.write(
    JSON.stringify(savedData),
    "KEY-US-Ping"
  );
  // if (resultss) {
  //   console.log("保存数据成功", savedData);
  // } else {
  //   console.log("保存数据失败");
  // }
  // 从持久化缓存中读取保存的数据
  const readDataStr = $persistentStore.read("KEY-US-Ping");
  const readData = readDataStr ? JSON.parse(readDataStr) : {};
  // console.log("读取数据成功", readData);
  for (const timestamp in savedData) {
    const result = savedData[timestamp];
    // console.log(`时间戳 ${timestamp} -- ${result}`);
  }
  const outgit = Object.values(savedData).join("");
  // console.log("输出为"+outgi t);

  /////////////////////////////////////////////
  $done({
    title: "Cf-Ping",
    content: outping + "\n" + outgit,
  });
})();

function http(req) {
  return new Promise((resolve) => {
    let startTime = Date.now();
    $httpClient.post($[req], (/*error, response, data*/) => {
      let endTime = Date.now();
      resolve(`${req}: ${endTime - startTime}ms`);
    });
  });
}
