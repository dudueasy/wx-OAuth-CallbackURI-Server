# 项目说明
这是一个用于测试微信 OAuth2.0 网页授权API 返回结果的服务器

# 使用说明
step0: 用户需要参考微信公众平台文档申请一个微信公众号测试号, 并且用个人微信号关注该公众号

step1: 在克隆本项目后, 需要参考 .env.default 在本地的 .env 文件中填入公众号/测试号的 appId 和 appSecret 

step2: 请参考微信公众平台文档, 将本服务器所在的 uri 和域名分别添加到测试号的配置中

  step3: 在微信开发者工具中访问以下微信接口, 并且替换 appid 为测试号的 appId, 替换 redirect_uri 字段的值为下文任意接口 URI 的encodedURIComponent 值, 以便完成微信 OAuth2.0 网页授权的功能测试
```
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
```

# 接口
### GET '/'
用于获取用户对应的 access_token

### GET '/update'
用来更新 access_token

### GET '/userinfo'
用于获取用户数据
