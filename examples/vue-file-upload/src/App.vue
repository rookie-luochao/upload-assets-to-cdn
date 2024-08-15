<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="bg">
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <HelloWorld msg="Vite + Vue" />
    <img src="https://search-operate.cdn.bcebos.com/e8cbce1d53432a6950071bf26b640e2b.gif" />
    <img src="./assets/2.jpeg" />
    <img src="./assets/3.png" style="width: 1200px" />
    <img src="@/assets/5.gif" />
    <img src="./assets/5.gif" />
    <img src="./assets/6.bmp" />
    <img src="@/assets/7.webp" />
    <img src="@/assets/8.png" style="width: 1200px" />
  </div>
</template>

<style scoped>
.bg {
  background: url('./assets/4.svg');
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
