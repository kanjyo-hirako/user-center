<template>
  <a-layout class="basic-layout">
    <a-layout-header class="header">
      <GlobalHeader />
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="footer">
      <a href="https://cn.vuejs.org/guide/introduction.html" target="_blank">
        vue的官方文档
      </a>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue"; //正确引用组件
</script>

<style scoped>
.footer {
  background: #efefef;
  text-align: center;
  padding: 16px 0;
}

.content {
  flex: 1;
  padding: 20px;
  background: linear-gradient(to right, #fefefe, #fff);
}

.header {
  background: white;
  margin-bottom: 16px;
  color: unset;
  padding-inline: 20px;
}

.basic-layout {
  min-height: 100vh;
  background: #fff;
}
</style>
