<template>
  <div id="app">
    <img src="./assets/logo.png">
    <!-- <u-helloWorld ref="hello"></u-helloWorld> -->
    <div style="height:500px;width:500px;">
      <u-canvas :url="'http://img.zcool.cn/community/01f9ea56e282836ac72531cbe0233b.jpg@2o.jpg'"></u-canvas>
    </div>
  </div>
</template>

<script lang="ts">
import Canvas from "../src/index";
import { Component, Vue } from "vue-property-decorator";
@Component({
  components: {
    "u-canvas" : Canvas
  }
})
export default class App extends Vue {
  public name = "app";
  public mounted() {
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
