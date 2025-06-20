// http.js
import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
})

// 请求拦截器，自动携带 token
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = token;
    }
    return config
}, error => Promise.reject(error))

// 响应拦截器
instance.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response?.status === 401) {
        // token 失效处理
        localStorage.removeItem('token')
        location.href = '/'
    }
    return Promise.reject(error)
})

export default instance
