<template>
  <el-card class="account-card">
    <!-- 顶部 Tab 导航 -->
    <el-tabs
      v-model="activeTab"
      class="custom-tabs"
      @tab-click="handleTabChange"
    >
      <el-tab-pane label="帐号管理" name="account"></el-tab-pane>
      <el-tab-pane label="创作功能" name="create"></el-tab-pane>
      <el-tab-pane label="数据中心" name="data"></el-tab-pane>
      <el-tab-pane label="创作助手" name="assist"></el-tab-pane>
      <el-tab-pane label="商业合作" name="business"></el-tab-pane>
      <el-tab-pane label="常见问题" name="faq"></el-tab-pane>
    </el-tabs>

    <!-- 内容区：默认展示“帐号管理”下的个人管理 -->
    <div class="content-wrapper" v-if="activeTab === 'account'">
      <el-tabs v-model="subTab" class="sub-tabs" type="card">
        <el-tab-pane label="个人管理" name="personal"></el-tab-pane>
        <el-tab-pane label="MCN管理" name="mcn"></el-tab-pane>
      </el-tabs>


      <!-- 个人管理内容 -->
      <div class="personal-management" v-if="subTab === 'personal'">
        <div class="section">
          <h2>一、个人资料修改</h2>
          <div class="content">
            <p>
              打开小红书
              APP，点击【我】后，选择头像下方的【编辑资料】修改个人资料，注意昵称
              7 天只能改一次， 请设置 2 - 24 个字符，不包括 @<>/
              等无效字符。个人简介 7 天内只能修改三次。
              如果遇到网络问题无法修改，可检查网络设置后稍等片刻重新修改
            </p>
          </div>
        </div>

        <div class="section">
          <h2>二、密码修改</h2>
          <div class="content">
            <p>
              打开小红书 APP，在【设置 - 帐号与安全 - 登录密码】中修改密码，
              或者在手机登录过程中，通过忘记密码来重设密码。
            </p>
          </div>
        </div>

        <div class="section">
          <h2>三、手机号绑定与修改</h2>
          <div class="content">
            <p>
              <strong>绑定手机号：</strong>【我 - 设置 - 帐号与安全 -
              点击手机号】即可绑定
            </p>
            <p>
              <strong>修改已绑定手机号：</strong>【我 - 设置 - 帐号与安全 -
              点击手机号 - 更换手机号】
            </p>
            <p>
              一个手机号仅限绑定一个小红书账号，为保证安全，手机号绑定后可以更换绑定，
              但无法解除绑定。
            </p>
          </div>
        </div>

        <div class="section">
          <h2>四、微信 / 微博 / QQ 解除绑定</h2>
          <div class="content">
            <p>
              打开小红书 APP，点击【我 - 左上角三横 -
              设置】，然后选择【帐号与安全】， 管理您所绑定的微信 / 微博 / QQ
              帐号，解除绑定后您的社交好友将无法通过这些社交应用在小红书找到您
            </p>
          </div>
        </div>

        <div class="section">
          <h2>五、帐号注销</h2>
          <div class="content">
            <p>
              <strong
                >符合下述条件的用户，可以在 APP【我 - 左上角三横 - 帐号与安全 -
                注销帐号】申请注销，条件如下：</strong
              >
            </p>
            <ul>
              <li>过去 15 日内无修改密码、修改绑定信息等敏感操作</li>
              <li>不是小红卡会员</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- MCN 管理内容（可扩展） -->
      <div class="mcn-management" v-if="subTab === 'mcn'">
        <h2>MCN 管理内容</h2>
        <p>这里可补充 MCN 相关操作说明...</p>
      </div>
    </div>

    <!-- 其他 Tab 内容占位（可根据需求扩展） -->
    <div class="other-tab-content" v-else>
      <p>「{{ activeTab }}」模块内容可根据需求补充...</p>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
// 顶部主 Tab
const activeTab = ref("account");
// 帐号管理下的子 Tab
const subTab = ref("personal");

const handleTabChange = (tab) => {
  console.log("切换到：", tab.name);
  // 如需切换子 Tab，可在这里重置 subTab
  if (tab.name !== "account") {
    subTab.value = "personal";
  }
};
</script>

<style scoped>
/* 卡片整体样式 */
.account-card {
  margin: 20px auto;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 顶部主 Tab 样式 */

/* 子 Tab（个人管理/MCN 管理）样式 */
.sub-tabs {
  margin: 20px 0;
  --el-tabs-card-tab-active-border-color: #409eff;
  --el-tabs-card-tab-active-color: #409eff;
}
.sub-tabs .el-tabs-card > .el-tabs-nav {
  border-bottom: none;
}
.sub-tabs .el-tabs-tab {
  border: 1px solid #ebeef5;
  margin-right: 10px;
  border-radius: 4px 4px 0 0;
}

.section {
  margin-bottom: 30px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
h2 {
  color: #409eff;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
}
.content p {
  line-height: 1.6;
  margin-bottom: 10px;
}
.content ul {
  padding-left: 20px;
  margin: 10px 0;
}
.content strong {
  color: #f56c6c;
}

/* 其他 Tab 内容占位样式 */
.other-tab-content {
  padding: 20px;
  color: #999;
}
</style>
