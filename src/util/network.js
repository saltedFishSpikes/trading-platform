import axios from 'axios';
import api from './api';
import { Loading,Message } from 'element-ui';
import router from '@/router/index.js';
/**
 * @function 请求接口
 * @param {Object} config.data
 * @param {Boolean} config.isLoading
 * @param {String} config.url
 * @param {String} config.method
 * @param {String} config.target
 */
function request(config) {
  let loading = null
  if (config.isLoading) {
    loading = Loading.service({
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.8)',
      text: '加载中...',
      target: config.target || '.el-form' || '.el-table'
    })
  }
  let data = new URLSearchParams();
  for (let i in config.data) {
    if(config.data[i]!==null && config.data[i]!=="" && config.data[i]!==undefined){
      data.append(i, config.data[i]);
    }
  }
  data.append('token',window.localStorage.getItem('token'))
  return new Promise((resolve, reject) => {
    axios({
      method: config.method || 'post',
      url: config.url,
      data: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      //根据接口配置
      if(res.data.code == 1000 || res.data.code == 99){
        // 成功
        if(res.data.token){
          window.localStorage.setItem('token',res.data.token)
        }
        resolve(res.data)
      }else if(res.data.code == 1001){
        // 普通错误
        Message({
          type:"error",
          message:res.data.data
        })
        reject(res)
      }else if(res.data.code == 1002){
        // 登录却未注册或注册却已注册
        Message({
          type:"warning",
          message:res.data.data
        })
        router.push({name:'login'})
      }else if(res.data.code == 1003){
        // 登录失效
        Message({
          type:"info",
          message:res.data.data
        })
        router.push({name:'login'})
      }else if(res.data.code == 1004){
        // 提示而非错误
        Message({
          type:"info",
          message:res.data.data
        })
      }else {
        reject(res)
      }
    }).catch(err => {
      reject(err)
    }).finally(() => {
      if (loading) {
        loading.close()
      }
    })
  })
}
/**
 * @function 上传之前
 * @param {Object} file 文件
 */
function beforeUpload(file){
  let allType = ['png','jpg','jpeg']
  let maxSize = 1*1024*1024
  let arr = file.name.split('.')
  let fileType = arr[arr.length-1]
  let fileSize = file.size
  if(allType.indexOf(fileType.toLowerCase())>=0 && fileSize <= maxSize){
    return true
  }else if(fileSize > maxSize){
    Message({
      type:"error",
      message:'图片不能超过1M'
    })
    return false
  }else if(allType.indexOf(fileType.toLowerCase())<0){
    Message({
      type:"error",
      message:'图片只支持png、jpg、jpeg三种格式'
    })
    return false
  }else{
    Message({
      type:"error",
      message:'不能上传'
    })
    return false
  }
}
/**
 * @function 上传
 * @param {Object} file 文件
 */
function upload(file){
  let formData = new FormData()
  formData.append("file",file.file)
  formData.append('token',window.localStorage.getItem('token'))
  let loading = Loading.service({
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.8)',
    text: '上传中...'
  })
  return new Promise((resolve,reject)=>{
    axios({
      method:"post",
      url:api.uploadImg,
      data:formData,
      headers:{
        'Content-Type':'multipart/form-data'
      }
    }).then(res=>{
      resolve(res.data.data)
    }).catch(err=>{
      reject(err)
    }).finally(() => {
      if (loading) {
        loading.close()
      }
    })
  })
}
export default {
  beforeUpload,
  upload,
  request,
  api
}