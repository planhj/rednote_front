<template>
  <Particles id="tsparticles" :particlesInit="particlesInit" :particlesLoaded="particlesLoaded" :options="options" class="particles-bg" />
  <div class="auth-wrapper">
    <!-- 欢迎区 -->
    <div class="welcome-panel" :class="{ 'shift-right': !isLogin }">
      <h2>{{ isLogin ? '欢迎回来！' : '欢迎注册！' }}</h2>
      <p>{{ isLogin ? '请输入账号密码登录' : '填写信息注册新账号' }}</p>
      <button @click="toggle">
        {{ isLogin ? '去注册' : '去登录' }}
      </button>
    </div>

    <!-- 登录表单面板 -->
    <div class="form-panel login-panel" :class="{ 'hide-right': !isLogin }">
      <form @submit.prevent="submitForm">
        <h3 class="title-with-icon">
          登录
          <img src="@/assets/rednote.png" alt="rednote" class="title-icon" />
        </h3>
        <div>
          <label>用户名</label>
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              style="width: 100%"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </div>
        <div>
          <label>密码</label>
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              style="width: 100%"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <button type="submit">登录</button>
      </form>
    </div>

    <!-- 注册表单面板 -->
    <div class="form-panel1 register-panel" :class="{ 'show-center': !isLogin }">
      <form @submit.prevent="submitForm">
        <h3 class="title-with-icon">
          注册
          <img src="@/assets/rednote.png" alt="rednote" class="title-icon" />
        </h3>
        <div>
          <label>用户名</label>
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              style="width: 100%"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </div>
        <div>
          <label>密码</label>
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              style="width: 100%"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <div>
          <label>确认密码</label>
          <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              style="width: 100%"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <button type="submit">注册</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {loadSlim} from "tsparticles-slim"
import axios from "@/axios.js";
const particlesInit = async engine =>{
  await loadSlim(engine)
};
const particlesLoaded = async (container) =>{
  console.log("container load",container)
};
const options=reactive({
      fullScreen: {
        enable: true,
      },
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            area: 800
          }
        },
        color: {
          value: ["#2EB67D", "#ECB22E", "#E01E5B", "#36C5F0"]
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: 1
        },
        size: {
          value: { min: 1, max: 10 }
        },
        links: {
          enable: true,
          distance: 150,
          color: "#808080",
          opacity: 0.4,
          width:2
        },
        move: {
          enable: true,
          speed: 4,
          direction: "none",
          random: false,
          straight: false,
          outModes: "out"
        }
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          },
          onClick: {
            enable: true,
            mode: "push"
          }
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 1
            }
          },
          push: {
            quantity: 4
          }
        }
      }
    }
);

const isLogin = ref(true)

// 登录/注册表单数据
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

function toggle() {
  isLogin.value = !isLogin.value
  form.value.username = ''
  form.value.password = ''
  form.value.confirmPassword = ''
}

async function submitForm() {
  const {username, password, confirmPassword} = form.value

  if (!username || !password) {
    alert('用户名和密码不能为空！')
    return
  }

  if (!isLogin.value) {
    // 注册时校验两次密码
    if (password !== confirmPassword) {
      alert('两次密码输入不一致！')
      return
    }

    // 发送注册请求
    try {
      const res = await axios.post('/users/register', {username, password})
      if (res.data.code === 200) {
        alert('注册成功，请登录')
        toggle() // 自动跳转到登录面板
      } else {
        alert(res.data.message || '注册失败')
      }
    } catch (err) {
      alert('注册请求失败')
      console.error(err)
    }

  } else {
    // 登录请求
    try {
      const res = await axios.post('/users/login', {username, password})
      if (res.data.code === 200) {
        const token = res.data.data.token
        localStorage.setItem('token', token)
        alert('登录成功，跳转中...')
        location.href = '/home' // 跳转到主页
      } else {
        alert(res.data.message || '登录失败')
      }
    } catch (err) {
      alert('登录请求失败')
      console.error(err)
    }
  }
}
</script>

<style scoped>
.particles-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.auth-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  user-select: none;
  z-index: 1;
}

.welcome-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 33.33vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8162e 0%, #f3403a 100%);
  color: white;
  padding: 40px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;

  opacity: 1;
  transform: translateX(0);
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1) ,opacity 1s ease;;
  z-index: 10;
}

.welcome-panel.shift-right {
  transform: translateX(200%);
}

.welcome-panel h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}
.welcome-panel p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}
.welcome-panel button {
  align-self: center;
  padding: 14px 80px;
  background: transparent;
  color: white;
  font-weight: 600;
  border: 2px solid white;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.welcome-panel button:hover {
  background-color: white;
  color: #c60a30;
}


.form-panel {
  position: absolute;
  top: 50%;
  /* 水平定位：右侧 66.67vw 区域的居中 */
  right: calc((66.67vw - 25vw) / 2);
  width: 25vw;
  max-height: 80vh;
  background: white;
  padding: 40px;
  box-sizing: border-box;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  transform: translateY(-50%) translateX(0);
  opacity: 1;
  transition:
      transform 1s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 1s ease;
  z-index: 20;
}
.form-panel1 {
  position: absolute;
  top: 50%;
  left: calc((66.67vw - 25vw) / 2);
  width: 25vw;
  max-height: 80vh;
  background: white;
  padding: 40px;
  box-sizing: border-box;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  transform: translateY(-50%) translateX(0);
  opacity: 1;
  transition:
      transform 1s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 1s ease;
  z-index: 20;
}
.form-panel h3 {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #333;
}

.form-panel div {
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  display: block;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #bbb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}
input:focus {
  border-color: #0a0a0b;
}

button[type="submit"] {
  width: 20vw;
  height: 3vw;
  display: block;
margin-top: 30px;
  font-weight: 700;
  color: white;
  background-color: #e8162e;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button[type="submit"]:hover {
  background-color: #d52b4a;
}
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 180px;
}

.title-icon {
  width: 100px;
  height: 70px;
  object-fit: contain;
}

.login-panel {
  /* 初始可见，无平移 */
  transform: translateY(-50%) translateX(0);
}

.login-panel.hide-right {
  transform: translateY(-50%) translateX(200%);
  opacity: 0;
}

.register-panel {
  transform: translateY(-50%) translateX(-200%);
  opacity: 0;
}

.register-panel.show-center {
  transform: translateY(-50%) translateX(0);
  opacity: 1;
}

</style>
