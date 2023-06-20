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
 * Surge: 
``` 
https://github.com/Keywos/rule/raw/main/Sub-Store/Sub-Store.sgmodule
```
 * Loon: 
```
https://github.com/Keywos/rule/raw/main/Sub-Store/Sub-Store.plugin
```
* SubStore内选择"脚本操作"，填写脚本地址

https://www.nsloon.com/openloon/import?plugin=https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Tool/Loon/Plugin/Cainiao_remove_ads.plugin
## rule

| iOS | Surge 复制安装 | Loon 点击直接安装 |
| :-----| :-----| :-----|
| Sub-Store | [sgmodule](https://raw.githubusercontent.com/Keywos/rule/main/Sub-Store/Sub-Store.sgmodule) | [plugin](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/Sub-Store/Sub-Store.plugin) |
| 百度输入法 | [sgmodule](https://raw.githubusercontent.com/Keywos/rule/main/module/Baidu_srf.sgmodule) | [plugin](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/Keywos/rule/main/loon/Baidu_srf.plugin) |

## rule

| Rule | raw | io |
| :-----| :-----| :-----|
| DIRECT | [China](https://raw.githubusercontent.com/Keywos/rule/main/cn.list) | [China](https://keywos.github.io/rule/cn.list) |
| IPASN | [CN](https://raw.githubusercontent.com/Keywos/rule/main/asn.list) | [CN](https://keywos.github.io/rule/asn.list) |
| Proxy | [Proxy](https://raw.githubusercontent.com/Keywos/rule/main/us.list) | [Proxy](https://keywos.github.io/rule/us.list) |
| Team | [Team](https://raw.githubusercontent.com/Keywos/rule/main/gpt.list) | [Team](https://keywos.github.io/rule/gpt.list) |
| AD | [AD](https://raw.githubusercontent.com/Keywos/rule/main/ad.list) | [AD](https://keywos.github.io/rule/ad.list) | 