# Key
* 自用规则备份 仅供参考不作他用

* 未经允许禁用转载与传播,此库仅为个人备份

<!-- ![](https://github.com/Keywos/rule/raw/main/tv/sub/) -->
### 重命名脚本分为两个版本 ！
## [rename.js](https://keywos.cf/rename.js) 
本地: 按原节点, 批量重命名, 速度最快
* rename理论上支持所有支持SubStore的设备
###  
## [cname.js](https://keywos.cf/cname.js) 
联网:真实 入口查询 [inte.net] 落地查询 [ip-api] 去重并重命名

cname因为增加了缓存机制， 需要安装对应的模块或者插件， 只支持
`Loon`、 `Surge` 默认持久化缓存时间为48小时 必须安装以下模块，关闭官方版本才能使用: 目前SubStore还未更新脚本持久化缓存超时
 * Surge: https://github.com/Keywos/rule/raw/main/module/Sub-Store.sgmodule
 * Loon: https://github.com/Keywos/rule/raw/main/loon/sub-store.plugin
* SubStore内选择"脚本操作"，填写脚本地址


# 示例: rename.js 



## 参数:
必须以 `#` 为开头, 多个参数使用 `&` 连接
```
https://keywos.cf/rename.js#bl

https://keywos.cf/rename.js#out=us&one
 ```
 * 截图为加了两个参数 `#out=us&bl`
 ![](/tv/sub/surgerename.jpg)
* `bl`:     保留: 家宽 ，IPLC 几倍之类的标识 ,并分组排序

* `nx`:     保留1倍率与不显示倍率的

* `blnx`:   只保留高倍率

* `one`:    清理只有一个节点的地区的01 
* `flag`:   给节点前面加国旗
* `clear`:  清理乱七八糟的名字
* `in=`:    自动判断机场节点名类型(那种类型多就判断为那种) 也可以加参数指定
* `out=`:   输出节点名可选参数: (cn ，us ，quan) 对应：中文，英文缩写 ，英文全称 , 默认中文
* `name=`:  添加机场名前缀在节点最前面

# 示例: cname.js 
 默认不加参节点名: `北京 美国 01`

 入口ip或国家与: 落地ip或国家一样则为 `直连 德国 01`


## 参数 :   

第一个参数用 `#` 后面的用 `&` 连接
```
https://keywos.cf/cname.js#flag

https://keywos.cf/cname.js#flag&timeout=1000
```
* 默认不加参数 & `flag` 参数
![](/tv/sub/loondb.jpg)

<!-- ![](/tv/sub/sl.jpg) -->
* 持久化存储 日志与通知
![](/tv/sub/surgemaclog.jpg)
* `name=`节点前面加机场名 
* `one`  清理相同地区节点的01
* `flag` 添加旗帜、运营商符号，例如: `🅳北京→🇺🇸美国 01`

*       🅳=电信 🅻=联通 🆈=移动 🆉=直连 🅶=其他
* `fg`   分隔符 例如: `上海 | 新加坡 01`
* `jt`   箭头 例如: `上海→韩国 01`
* `dd`   单独落地国家 例如: `香港 01`
* `timeout=` 第一次没有缓存的ping api超时时间 默认`1600ms`
* `cd=`  有缓存后ping 没有缓存成功的 api超时时间,默认`400ms`
###  关于cd与缓存 :
感谢 [@小一大佬](https://github.com/xream/Sub-Store)修改SubStore源码修复持久化缓存，`scriptResourceCache` ,极大的减少了额外的请求，避免更新订阅时超时
默认超时时间48小时，
#### 持久化缓存位置:
可以删除来清理缓存或者等48小时过期
* Loon `CNAMEKEY` 文件名
* Surge: 脚本编辑器: 左下角设置, `$persistentStore` , `CNAMEKEY`


参数如果设置 `cd=0` 的情况下可以直接读取缓存，几乎无需等待， 

如果设置 `cd=600` 有Ping不通的

或者上次没有缓存的节点的情况下最低等600+ms
    
但是可以写入上次没有写入成功的缓存,
如果全部缓存了的情况,也是毫秒级

 


## rule

| Rule | raw | io |
| :-----| :-----| :-----|
| DIRECT | [China](https://raw.githubusercontent.com/Keywos/rule/main/China.list) | [China](https://keywos.github.io/rule/China.list) |
| Proxy | [Proxy](https://raw.githubusercontent.com/Keywos/rule/main/Proxy.list) | [Proxy](https://keywos.github.io/rule/Proxy.list) |
| Team | [Team](https://raw.githubusercontent.com/Keywos/rule/main/Team.list) | [Team](https://keywos.github.io/rule/Team.list) |
| AD | [AD](https://raw.githubusercontent.com/Keywos/rule/main/AD.list) | [AD](https://keywos.github.io/rule/AD.list) | 