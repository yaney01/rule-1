let url = $request.url,
    body = null;
    if (url.includes("amdc/mobileDispatch")) {
    let e = $request.headers,
        t = e["User-Agent"] || e["user-agent"];
    t.includes("AMap") || t.includes("Cainiao") ? $done() : $done({})
}$done({});