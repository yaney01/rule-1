// let url = $request.url;
// if (url.includes("amdc/mobileDispatch")) {
// let headers = $request.headers,
// userAgent = headers["User-Agent"] || headers["user-agent"];
// $done(userAgent.includes("AMap") || userAgent.includes("Cainiao") ? undefined : {});
// }

// const url = $request.url;
// const header = $request.headers;
// let ua = header["User-Agent"] || header["user-agent"];
// if (url.includes("/amdc/mobileDispatch")) {
//   if (ua.includes("AMapiPhone") || ua.includes("Cainiao")) {
//     $done({ status: "HTTP/1.1 404 Not Found" });
//     return;}}
// $done({});

const url = $request.url;
const header = $request.headers;
const ua = header["User-Agent"] || header["user-agent"];
if (url.includes("/amdc/mobileDispatch") && (ua.includes("AMapiPhone") || ua.includes("Cainiao"))) {
$done({ status: "HTTP/1.1 404 Not Found" });
return;}
$done({});
