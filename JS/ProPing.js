const cnurl = "http://connectivitycheck.platform.hicloud.com/generate_204";
const cfurl = "http://cp.cloudflare.com/generate_204";
(async () => {
	try {
	  let cn = [],cf = [];
	  for (let e = 0; e < 2; e++) {
		const u = await http(cnurl);
		const k = parseFloat(u);
		cn.push(k);
  
		const e = await http(cfurl);
		const n = parseFloat(e);
		cf.push(n);
	  }
	  const d = ((cn[0] + cn[1]) / 2) | 0;
	  const e = ((cf[0] + cf[1]) / 2) | 0;
  
	  const n = saK(d, e);
	  const od = ptoG(n["CN"]);
	  const op = ptoG(n["CF"]);
	  $done({
		title: `CN: ${d}    ➟    CF: ${e}`,
		content: od + "." + op,
		icon: "barometer",
		"icon-color": "#80A0BF",
	  });
	} catch (i) {
	  const err = 'Feedback @𝙺𝚎𝚢 !! ';
	  console.log(err+i.message)
	  $done({title:err, content:i.message})
	}
  })().finally(() => $done());
  
function saK(d, t) {
  let k;
  try {
    k = JSON.parse($persistentStore.read("KEY_ProPing")) || {};
  } catch (error) {
    k = {};
  }
  k["CN"] = (k["CN"] || getArr(1, 5)).concat(d).slice(-6);
  k["CF"] = (k["CF"] || getArr(30, 5)).concat(t).slice(-6);
  $persistentStore.write(JSON.stringify(k), "KEY_ProPing");
  return k;
}
function getArr(x, l) {return Array(l).fill(x);}
async function http(url) {return new Promise((t) => {let e = Date.now();$httpClient.get(url, () => {let n = Date.now();t(n - e);});});}
function ptoG(t) {const e = 10;let n;n = Math.max(...t);let o = n;if (n < 70) {o += 200;} else if (n < 150) {o += 150;} else if (n < 250) {o += 100;} else if (n < 400) {o += 2;} else {o = 410;}const r = t.map((t) => {let n = (t - e) / (o - e);if (n > 1) {n = 1;}const r = Math.floor(n * 6) + 9601;if (r > 9607) {return "▇";} else if (r < 9601) {return "▁";} else {return String.fromCharCode(r);}}).join("");return r;}
