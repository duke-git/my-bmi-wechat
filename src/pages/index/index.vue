<template>
  <div class="index-wrapper">
    <div class="header-wrapper">
      <img class="bg-img" src="/static/images/header_bg.png" background-size="cover" />
      <span class="title">身体质量指数(BMI)计算器</span>
    </div>
    <div class="button-wrapper" @click="start">
      <span>开</span>
      <!--
      <img class="button-img" src="/static/images/button_bg.gif" />
      -->
      <span>始</span>
    </div>
    <div class="bmi-note-wrapper">
      <p class="bim-note-title">BMI计算公式：体质指数(BMI)= 体重(kg) ÷ 身高^2(m) (点击以上“开始”按钮开始计算BMI值)</p>
      <p>
        BMI小常识：身体质量指数（BMI，Body Mass Index）是国际上常用的衡量人体肥胖程度和是否健康的重要标准。
        肥胖程度的判断不能采用体重的绝对值，它天然与身高有关。因此，BMI 通过人体体重和身高两个数值获得相对客观的参数，并用这个参数所处范围衡量身体质量。
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },

  methods: {
    start() {
      const url = "../calculate/main";
      if (mpvuePlatform === "wx") {
        mpvue.switchTab({ url });
      } else {
        mpvue.navigateTo({ url });
      }
    }
  },
  mounted() {
    wx.showShareMenu();
  }
};
</script>

<style scoped>
.index-wrapper {
  background: #7ebb85;
}
.header-wrapper {
  text-align: center;
  margin-bottom: 14px;
}
.title {
  position: absolute;
  top: 20%;
  left: 20%;
  font-size: 20px;
  font-weight: bolder;
}
.bg-img {
  width: 100%;
  height: 260px;
}
.button-wrapper {
  text-align: center;
  font-size: 22px;
  width: 150px;
  margin: 0 auto;
  box-shadow: 0px 1px 2px 2px #2f5024;
  border-radius: 50px;
  height: 50px;
  line-height: 50px;
  color: #ffffff;
  font-weight: bolder;
}
.button-img {
  width: 90px;
  height: 90px;
  vertical-align: middle;
}
.bmi-note-wrapper {
  padding: 15px;
  font-size: 14px;
  margin: 10px 10px;
  line-height: 24px;
}
.bim-note-title {
  color: #000;
  margin-bottom: 10px;
  font-weight: bolder;
}
</style>
