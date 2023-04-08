const url = $request.url;
const header = $request.headers;
const ua = header["User-Agent"] || header["user-agent"];
if (url.includes("/amdc/mobileDispatch") && (ua.includes("AMapiPhone") || ua.includes("Cainiao"))) {
$done({ status: "HTTP/1.1 404 Not Found" });
return;}
$done({});
