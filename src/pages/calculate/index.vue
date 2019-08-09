<template>
  <div class="calculate-wrapper">
    <div class="header-wrapper">
      <p class="bmi-text">BMI值</p>
      <p class="bmi-value">{{bmi}}</p>
      <div class="body-note">
        <span>身体状况：{{bodyHealth}}</span>
        <span style="float: right;">标准体重：{{standWeight+"kg"}}</span>
      </div>
    </div>
    <div class="form-wrapper">
      <div class="form-item">
        <label for="身高">身高(cm)：</label>
        <input class="form-item-input" type="digit" placeholder="请输入身高值" v-model="height" />
      </div>
      <div class="form-item">
        <label for="体重">体重(kg)：</label>
        <input class="form-item-input" type="digit" placeholder="请输入体重值" v-model="weight" />
      </div>
      <div class="button-wrapper">
        <mp-button type="primary" size="large" btnClass="mb15 mr15" @click="handleCalculate">开始计算</mp-button>
        <mp-button type="default" size="large" btnClass="mb15 mr15" plain @click="reset">重置数据</mp-button>
      </div>
    </div>
    <mp-toast
      :type="tost.type"
      v-model="tost.show"
      :content="tost.content"
      :duration="tost.duration"
    ></mp-toast>
  </div>
</template>

<script>
import { formatTime } from "@/utils/index";
import mpPicker from "mpvue-weui/src/picker";
import mpButton from "mpvue-weui/src/button";
import mpToast from "mpvue-weui/src/toast";

export default {
  components: {
    mpPicker,
    mpButton,
    mpToast
  },
  data() {
    return {
      bmi: 0,
      height: "",
      weight: "",
      bmiStand: "",
      bodyHealth: "",
      standWeight: "",
      tost: {
        show: false,
        type: "default",
        content: "",
        duration: 1500
      }
    };
  },

  methods: {
    handleCalculate() {
      if (!this.height || !this.weight) {
        this.showTost("warn", "请填写身高和体重值");
      } else {
        this.calculateBMI();
        this.calulateWeight();
      }
    },
    calculateBMI() {
      let bmiValue = this.weight / Math.pow(this.height * 0.01, 2);
      this.bmi = bmiValue.toFixed(1);
    },
    calulateWeight() {
      let bmi = this.bmi;
      let standWeight = (this.height - 100) * 0.9;
      if (bmi < 18.5) {
        this.bodyHealth = "偏瘦";
      } else if (bmi > 18.5 && bmi < 23.9) {
        this.bodyHealth = "完美身材";
      } else if (bmi >= 24) {
        this.bodyHealth = "超重";
      } else if (bmi > 24 && bmi < 26.9) {
        this.bodyHealth = "偏胖";
      } else if (bmi > 27 && bmi < 29.9) {
        this.bodyHealth = "肥胖";
      } else if (bmi >= 30) {
        this.bodyHealth = "重度肥胖";
      }
      this.standWeight = standWeight;
    },
    reset() {
      this.bmi = 0;
      this.height = "";
      this.weight = "";
      this.bmiStand = "";
      this.bodyHealth = "";
      this.standWeight = "";
    },
    showTost(type, content, duration = 1500) {
      this.tost.show = true;
      this.tost.type = type;
      this.tost.content = content;
      this.tost.duration = duration;
    }
  }
};
</script>

<style scoped>
.calculate-wrapper {
  background: #fff;
}
.header-wrapper {
  background: #7ebb85;
  padding: 10px 10px;
  color: #fff;
}
.bmi-text {
  font-size: 20px;
}
.bmi-value {
  font-weight: bolder;
  font-size: 50px;
  text-align: center;
}
.body-note {
  font-size: 14px;
}
.form-wrapper {
  background: #fff;
  padding: 10px;
  font-size: 14px;
}
.form-item {
  border-bottom: 1px solid #e0e0e0;
  margin-top: 10px;
}
.form-item-input {
  height: 2.58823529em;
  min-height: 2.58823529em;
  line-height: 2.58823529em;
}
.button-wrapper {
  text-align: center;
  margin-top: 10px;
}
.button-wrapper button {
  background: #7ebb85 important!;
  margin-right: 5px;
}
</style>
