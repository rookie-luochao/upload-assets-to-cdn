<script setup>
import pic from '../assets/4.svg'
</script>

<template>
  <div>
    <img :src="pic" >
    <img src="@/assets/4.svg">
    <img src="../assets/5.gif">
    <img src="https://md-pic-lib.oss-cn-hangzhou.aliyuncs.com/img/微信图片_20240531212400.png">
    <div class="bg">
      <div class="content"></div>
    </div>
    <img src="@/assets/7.webp">
    <img src="../assets/8.png">
    <img src="@/assets/8.png">
  </div>
</template>

<style lang="scss">
.bg {
  width: 200px;
  height: 200px;
  background: url('../assets/6.bmp');

  .content {
    background: url('../assets/7.webp');
  }
}
</style>