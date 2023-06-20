# Key
* 自用规则备份 仅供参考不作他用

* 未经允许禁用转载与传播,此库仅为个人备份

![](http://profile-counter.glitch.me/keywos/count.svg)
### 重命名脚本分为两个版本 ！
## [rename.js](https://keywos.cf/rename.js) 
本地: 按原节点, 批量重命名, 速度最快
* rename理论上支持所有支持SubStore的设备
###  
## [cname.js](https://keywos.cf/cname.js) 
联网:真实 入口查询 落地查询 去重并重命名

* cname因为增加了缓存机制， 需要安装对应的模块或者插件， 只支持
`Loon`、 `Surge` 默认持久化缓存时间为48小时 必须安装以下模块，关闭官方版本才能使用: 目前SubStore还未更新脚本持久化缓存超时

* SubStore内选择"脚本操作"，填写脚本地址


## rule

|   | Surge | Loon |
| :-----| :-----| :-----|
|   | 手动安装 | 点击跳转安装 |
| Sub-Store | [sgmodule 参数指定](https://raw.githubusercontent.com/Keywos/rule/main/Sub-Store/Sub-Store.sgmodule) | [plugin 插件内自义定](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/Sub-Store/Sub-Store.plugin) |
| 百度输入法AD | [Baidu_srf](https://raw.githubusercontent.com/Keywos/rule/main/module/Baidu_srf.sgmodule) | [Baidu_srf](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/Baidu_srf.plugin) |
| 哔哩哔哩AD | [bilibili](https://raw.githubusercontent.com/Keywos/rule/main/module/bilibili.sgmodule) | [Bilibili 插件内自义定](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/Bilibili.plugin) |
| 网易云AD | [wyy](https://raw.githubusercontent.com/Keywos/rule/main/module/wyy.sgmodule) | [wy](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/wy.plugin) |
| IT之家AD | [noAdrule](https://raw.githubusercontent.com/Keywos/rule/main/module/noAdrule.sgmodule) | [ithomes 插件内自义定](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/ithomes.plugin) |
| YouTube翻译 | [YouTubeFY](https://raw.githubusercontent.com/Keywos/rule/main/module/YouTubeFY.sgmodule) | [YouTubeFY 插件内自义定](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/YouTubeFY.plugin) |
| Barkapps限免推送 | [Barkapps 放本地argument传Key](https://raw.githubusercontent.com/Keywos/rule/main/module/Barkapps.sgmodule) | [Barkapps 插件内自义定Key](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/Barkapps.plugin) |
| 极简汇率推送 | [JJHL](https://raw.githubusercontent.com/Keywos/rule/main/module/JJHL.sgmodule) | [](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/.plugin) |

## rule

| Rule | raw | io |
| :-----| :-----| :-----|
| DIRECT | [China](https://raw.githubusercontent.com/Keywos/rule/main/cn.list) | [China](https://keywos.github.io/rule/cn.list) |
| IPASN | [CN](https://raw.githubusercontent.com/Keywos/rule/main/asn.list) | [CN](https://keywos.github.io/rule/asn.list) |
| Proxy | [Proxy](https://raw.githubusercontent.com/Keywos/rule/main/us.list) | [Proxy](https://keywos.github.io/rule/us.list) |
| Team | [Team](https://raw.githubusercontent.com/Keywos/rule/main/gpt.list) | [Team](https://keywos.github.io/rule/gpt.list) |
| AD | [AD](https://raw.githubusercontent.com/Keywos/rule/main/ad.list) | [AD](https://keywos.github.io/rule/ad.list) | 