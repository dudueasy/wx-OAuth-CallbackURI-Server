// this server is used as weixin OAuth redirect uri server 
const path = require('path')
const express = require('express')
const axios = require('axios') 

let app = express()
const PORT = process.env.PORT ||8002 

app.listen(PORT, ()=>{
  console.log(`server is now running on ${PORT}`) 
})

require('dotenv').config({ path: path.join(__dirname, '.env') });
// define application data
let appId = process.env.APPID
let appSecret = process.env.APPSECRET
console.log('appid: ',appId )
console.log('appSecret :', appSecret)


app.get('/update', async (req,res)=>{ 
  let {code, state} = req.query 
  if(code){
    let TokenAPIResponse = await getAccessToken(code) 
    let {refresh_token}  = TokenAPIResponse 

    let refreshedToken = await refreshAceessToken(refresh_token)

    res.json({
      accessToken:TokenAPIResponse,
      refreshedToken:refreshedToken
    }) 
  }
  else{
    res.send('<h1>Welcome to /update page</h1>')
  }
})

app.get('/userinfo', async (req, res)=>{
  let {code, state} = req.query 
  if(code){
    try{
      let TokenAPIResponse = await getAccessToken(code) 
      let { access_token, openid } = TokenAPIResponse
      let userinfo = await getUserinfo( access_token, openid ) 
      res.json(userinfo)
    }catch(e){
      res.json({error: e.message}) 
    }
  } 
  else{ 
    res.send('<h1>Welcome to /userinfo </h1>')
  }
})


app.get('/', async (req,res)=>{ 
  let {code, state} = req.query 
  if(code){
    let TokenAPIResponse = await getAccessToken(code)
    res.send({data:TokenAPIResponse})
  }
  else{
    res.send('<h1>Welcome to index page of WX OAuth Callback Server</h1>') }
})


async function getAccessToken(code){ 
  let grantType = 'authorization_code'
  let wxAccessTokenAPI  = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}` 
    +`&secret=${appSecret}&code=${code}&grant_type=${grantType}`

  let TokenAPIResponse = await axios(wxAccessTokenAPI)
    .then(
      (r)=>{
        if(r.data.errcode){
          throw new Error(r.data.errmsg) 
        }
        else{
          return r.data 
        } 
      } 
    )
    .catch(e =>{
      console.log( 'error during requesting wxAccessTokenAPI  ')
      throw e
    })

  return TokenAPIResponse 
}


async function refreshAceessToken(refreshToken){
  let grantType = 'refresh_token' 
  let wxRefreshTokenAPI = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}`
    +`&grant_type=${grantType}&refresh_token=${refreshToken}`

  let refreshTokenAPIResponse = await axios(wxRefreshTokenAPI)
    .then(r=>r.data)
    .catch(e=>{ 
      console.log( 'error during requesting wxRefreshTokenAPI')
    })

  return refreshTokenAPIResponse 
}

async function getUserinfo(accessToken, openid){
  if(!isAccessTokenAvailable(accessToken, openid)){
    let {accessToken, openid }=  await refreshAceessToken(refresh_token) 
  } 

  let wxUserinfoAPI = `https://api.weixin.qq.com/sns/userinfo?`
    +`access_token=${accessToken}&openid=${openid}&lang=zh_CN`

  let userinfo = await axios(wxUserinfoAPI)
    .then(r=>r.data) 
    .catch(e=>{ 
      console.log( 'error during requesting wxUserinfoAPI')
    }) 

  return userinfo
}

async function isAccessTokenAvailable(accessToken, openid){
  let accessTokenValidationAPI = `https://api.weixin.qq.com/sns/auth?`
    +`access_token=${accessToken}&openid=${openid}`

  let result = await axios(accessTokenValidationAPI)
    .then(r=>r.data) 
    .catch(e=>{ 
      console.log( 'error during requesting accessTokenValidationAPI')
    }) 

  if(result.errcode === 0) { 
    console.log('current accessToken is available')
    return true 
  }
  else{
    console.log('current accessToken is not available, need refresh accessToken')
    return false
  }
}

