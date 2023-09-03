## LOTW QSOS LIST API

> 获取对应账户的LotW QSO记录，返回一个对象数组
> 支持数据缓存，默认每两小时更新一次数据
> 支持导出ADIF，XLSX文件

*使用前请创建并更改.`env`文件中的用户信息*

用法：

```bash
yarn install
yarn run build
yarn start
```

FrontPage DEMO：[LotW status (kanokano.cn)](https://api.kanokano.cn/lotw-status/)

FrontPage DEMO Repo：[DEMO PAGE](https://github.com/kanoqwq/lotw-list-frontpage-demo)

可在`./static/js/main.xxx.js` 中查找 `/lotw-get` 替换为自己的api

### APIS

```javascript
//返回列表数据
router.get('/lotw', Controller.getQsos)
//获取VUCC Award 信息
router.get('/lotw/vuccaward', Controller.getVuccAwards)
//导出数据
router.get('/lotw/downloadfile', Controller.exportFile)
//导出ADI File
router.get('/lotw/adif.adi', Controller.downloadAdiFile)
```

