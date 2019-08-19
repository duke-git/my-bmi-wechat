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
      <div class="form-item">
        <label>是否保存：</label>
        <span style="color: #a9a9a9;font-size:12px;">注：由于BMI值短时间波动稳定，每天只会保存一次计算结果，多次计算会覆盖同一天之前的结果。</span>
        <mp-switch v-model="isSave"></mp-switch>
      </div>
      <div class="button-wrapper">
        <mp-button type="primary" size="large" btnClass="mb15 mr15" @click="handleCalculate">开始计算</mp-button>
        <mp-button type="default" size="large" btnClass="mb15 mr15" plain @click="reset">重置数据</mp-button>
      </div>
    </div>
    <div class="table-wrapper">
      <span class="table-title">参考数据：</span>
      <div class="bmi-table">
        <div class="bmi-table-head">
          <div class="tr">
            <div class="th">BMI分类</div>
            <div class="th">WHO标准</div>
            <div class="th">亚洲标准</div>
            <div class="th">中国标准</div>
          </div>
        </div>
        <div class="bmi-table-body">
          <div class="tr">
            <div class="td">偏瘦</div>
            <div class="td">{{" < 18.5"}}</div>
            <div class="td">{{" < 18.5"}}</div>
            <div class="td">{{" < 18.5"}}</div>
          </div>
          <div class="tr">
            <div class="td">正常</div>
            <div class="td">18.5～24.9</div>
            <div class="td">18.5～22.9</div>
            <div class="td">18.5～23.9</div>
          </div>
          <div class="tr">
            <div class="td">超重</div>
            <div class="td">≥25</div>
            <div class="td">≥23</div>
            <div class="td">≥24</div>
          </div>
          <div class="tr">
            <div class="td">偏胖</div>
            <div class="td">25.0～29.9</div>
            <div class="td">23～24.9</div>
            <div class="td">24～24.9</div>
          </div>
          <div class="tr">
            <div class="td">肥胖</div>
            <div class="td">30.0～34.9</div>
            <div class="td">25～29.9</div>
            <div class="td">27～29.9</div>
          </div>
          <div class="tr">
            <div class="td">重度肥胖</div>
            <div class="td">35.0～39.9</div>
            <div class="td">≥30</div>
            <div class="td">≥30</div>
          </div>
        </div>
      </div>
    </div>
    <mp-toast
      :type="tost.type"
      v-model="tost.show"
      :content="tost.content"
      :duration="tost.duration"
    ></mp-toast>
    <!--
    <img
      v-show="aniImageType=='happy'"
      class="animate-img"
      :animation="myAnimation"
      src="/static/images/happy.gif"
    />
    <img
      v-show="aniImageType=='heavy'"
      class="animate-img"
      :animation="myAnimation"
      src="/static/images/heavy.gif"
    />
    <img
      v-show="aniImageType=='workout'"
      class="animate-img"
      :animation="myAnimation"
      src="/static/images/workout.gif"
    />
    <img
      v-show="aniImageType=='eat'"
      class="animate-img"
      :animation="myAnimation"
      src="/static/images/eat.gif"
    />
    -->
  </div>
</template>

<script>
import { formatTime } from "@/utils/index";
import mpPicker from "mpvue-weui/src/picker";
import mpButton from "mpvue-weui/src/button";
import mpToast from "mpvue-weui/src/toast";
import mpSwitch from "mpvue-weui/src/switch";

export default {
  components: {
    mpPicker,
    mpButton,
    mpToast,
    mpSwitch
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
      },
      myAnimation: null,
      aniImageType: "",
      isSave: false
    };
  },

  methods: {
    handleCalculate() {
      if (!this.height || !this.weight) {
        this.showTost("warn", "请填写身高和体重值");
      } else {
        this.calculateBMI();
        this.saveBMI();
        this.calulateWeight();
        this.showTip();
        this.translateAnimation();
      }
    },
    calculateBMI() {
      let bmiValue = this.weight / Math.pow(this.height * 0.01, 2);
      this.bmi = bmiValue.toFixed(1);
    },
    saveBMI() {
      let date = this.utils.getDate(new Date());
      let item = {
        id: date,
        weight: this.weight,
        bmi: this.bmi
      };

      if (this.isSave) {
        let bmis = wx.getStorageSync("bmis");
        if (bmis) {
          let data = JSON.parse(bmis);
          data = data.filter(bmi => {
            return bmi.id != item.id;
          });
          data.push(item);
          wx.setStorageSync("bmis", JSON.stringify(data));
        } else {
          wx.setStorageSync("bmis", JSON.stringify([item]));
        }
      }
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
      this.standWeight = standWeight.toFixed(2);
    },
    showTip() {
      if (this.bmi < 18.5) {
        this.aniImageType = "eat";
        this.showTost("success", "需要多吃肉肉哦", 4000);
      } else if (this.bmi < 23.9 && this.bmi >= 18.5) {
        this.aniImageType = "happy";
        this.showTost("success", "哇... 完美身材呀", 4000);
      } else if (this.bmi < 27 && this.bmi >= 24) {
        this.aniImageType = "workout";
        this.showTost("success", "建议锻炼，否则向肉肉多发展中...", 4000);
      } else if (this.bmi >= 27) {
        this.aniImageType = "heavy";
        this.showTost("success", "墙裂建议减肥", 4000);
      }
    },
    translateAnimation() {
      this.myAnimation = null;
      this.myAnimation = wx.createAnimation({
        duration: 800,
        timingFunction: "ease"
      });
      this.myAnimation.translate(220, 0).step();
      this.myAnimation = this.myAnimation.export();
      setTimeout(() => {
        this.clearAnimation();
      }, 4000);
    },
    clearAnimation() {
      this.myAnimation = null;
      this.myAnimation = wx.createAnimation({
        duration: 800,
        timingFunction: "ease"
      });
      this.myAnimation.translate(-220, 0).step();
      this.myAnimation = this.myAnimation.export();
    },
    reset() {
      this.bmi = 0;
      this.height = "";
      this.weight = "";
      this.bmiStand = "";
      this.bodyHealth = "";
      this.standWeight = "";
      this.clearAnimation();
    },
    showTost(type, content, duration = 1500) {
      this.tost.show = true;
      this.tost.type = type;
      this.tost.content = content;
      this.tost.duration = duration;
    }
  },
  mounted() {
    wx.showShareMenu();
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
  position: fixed;
  width: 95%;
  z-index: 100;
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
  position: relative;
  top: 150px;
}
.form-item {
  border-bottom: 1px solid #e0e0e0;
  margin-top: 10px;
  padding-bottom: 3px;
}
.weui-switch-content {
  display: inline;
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

.table-wrapper {
  margin-top: 15px;
  position: relative;
  top: 150px;
  margin-bottom: 10px;
}

.table-title {
  font-size: 14px;
  padding-left: 5px;
}

.bmi-table {
  width: 90%;
  border-bottom: 1px solid #ebebeb;
  border-top: 1px solid #ebebeb;
  font-size: 14px;
  padding: 0 10px;
}
.bmi-table-head {
  color: #909399;
  font-weight: 500;
  background-color: #f5f5f5;
}

.bmi-table-body {
  text-align: center;
  color: #606266;
}
.tr {
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-bottom: 0.1px solid #e0e0e0;
}

.animate-img {
  width: 90px;
  height: 90px;
  vertical-align: middle;
  position: absolute;
  top: 25%;
  z-index: 1000;
  left: -80px;
}
</style>
