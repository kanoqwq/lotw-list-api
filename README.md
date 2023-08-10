## LOTW QSOS LIST API

> 获取对应账户的LotW QSO记录，返回一个对象数组
> 支持数据缓存，默认每两小时更新一次数据

*使用前请更改.`env`文件中的用户信息*

用法：

```bash
yarn install
yarn run dev
```

FrontPage DEMO：[LotW status (kanokano.cn)](https://api.kanokano.cn/lotw-status/)

FrontPage DEMO download：[DEMO PAGE](https://pan.kanokano.cn/d/%E4%B8%B4%E6%97%B6%E3%81%AE%E5%AD%98%E5%82%A8/lotw-list-api.zip)

可在`./static/js/main.xxx.js` 中查找 `/lotw-get` 替换为自己的api

Request URL: **localhost:4545/lotw**
method: **get**
