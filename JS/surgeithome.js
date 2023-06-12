let i = JSON.parse($response.body);
i.data.list = i.data.list.filter(function(item) {
return item.feedType !== 10002;  //轮播
});
i.data.list = i.data.list.filter(function(item) {
return item.feedType !== 10003;  //置顶
});
i.data.list = i.data.list.filter(item => {
  return item.feedType !== 10000 || (item.feedContent.smallTags[0]?.text === null || !item.feedContent.smallTags[0].text.includes("广告"));
});
$done({body: JSON.stringify(i)});