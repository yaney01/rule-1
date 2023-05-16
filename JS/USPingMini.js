let $ = { Ping: "http://cp.cloudflare.com/generate_204" };

function http(req) {
  return new Promise((resolve) => {
    let startTime = Date.now();
    $httpClient.post($[req], () => {
      let endTime = Date.now();
      resolve(`${req}: ${endTime - startTime}`);
    });
  });
}

function saveGif(gifArr) {
  const timekey = new Date().getTime();
  const sdgif = $persistentStore.read("KEY-US-Ping");
  const sdd = sdgif ? JSON.parse(sdgif) : {};
  sdd[timekey] = gifArr.join("");
  const sdkey = Object.keys(sdd);
  if (sdkey.length > 7) {
    const oldkey = sdkey.sort()[0];
    delete sdd[oldkey];
  }
  const sddata = $persistentStore.write(JSON.stringify(sdd), "KEY-US-Ping");
  const readd = $persistentStore.read("KEY-US-Ping");
  const readData = readd ? JSON.parse(readd) : {};
  const outgit = Object.values(sdd).join("");
  
  return outgit;
}

function PingToGif(pingTimes) {
  const minValue = 60;
  const maxValue = 300;
  const gif = pingTimes
    .map((x) => {
      let ptogif = (x - minValue) / (maxValue - minValue);
      if (ptogif > 1) {
        ptogif = 1;
      }
      const gifCode = Math.floor(ptogif * 6) + 0x2581;
      if (gifCode > 0x2587) {
        return "\u2587";
      } else if (gifCode < 0x2581) {
        return "\u2581";
      } else {
        return String.fromCharCode(gifCode);
      }
    }).join("");
  return gif;
}

(async () => {
  let fhz = {};
  let gifArr = [];
  for (let key in $) {
    let pingTimes = [];
      for (let i = 0; i < 2; i++) {
        let responseTime = await http(key);
        let time = parseFloat(responseTime.split(": ")[1]);
        pingTimes.push(time);
      }
    let avgTime = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
    let fhzText = `CN: ${avgTime.toString().padEnd(5, " ")}ms\t➟     ${key}: ${pingTimes}ms`;
    const gif = PingToGif(pingTimes)
    gifArr.push(gif);
    fhz[key] = fhzText;
  }
  const outgit = saveGif(gifArr);
  let outping = "";
  for (const [key, fhzText] of Object.entries(fhz)) {
    outping += fhzText;
  }
  $done({
    title: outping,
    content: outgit,
  });
})();
