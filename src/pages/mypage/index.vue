<template>
  <div class="mypage-wrapper">
    <div class="chart-wrapper">
      <span class="chart-title">体重/BMI趋势图示</span>
      <div class="search-wrapper">
        <span
          style="color: #a9a9a9;font-size:12px;"
        >注：考虑到图表显示体验，限制搜索10天以内数据（只有开始日期可选择，结束日期固定设置为开始日期以前10天）</span>
        <div
          class="search-date search-date-clickable"
          @click="showDatePicker"
        >起始日期：{{searchDate.start}}</div>
        <div class="search-date">结束日期：{{searchDate.end}}</div>
      </div>
      <canvas
        v-show="isCanvasShow"
        canvas-id="lineCanvas"
        disable-scroll="true"
        class="canvas"
        @touchstart="touchHandler"
      ></canvas>
    </div>
    <mp-datepicker
      ref="mpDatePicker"
      :themeColor="searchDate.themeColor"
      :defaultDate="searchDate.defaultDate"
      @onConfirm="onConfirm"
      @onCancel="onCancel"
    ></mp-datepicker>
  </div>
</template>

<script>
import { formatTime } from "@/utils/index";
let wxCharts = require("@/utils/wxcharts-min.js");
import mpDatepicker from "mpvue-weui/src/date-picker";

export default {
  components: {
    mpDatepicker
  },
  onLoad: function() {
    let windowWidth = 320;
    try {
      let res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error("getSystemInfoSync failed!");
    }
    let chartData = this.getChartData();
    this.lineChart = new wxCharts({
      canvasId: "lineCanvas",
      type: "line",
      categories: chartData.categories,
      animation: true,
      series: [
        {
          name: "体重",
          data: chartData.weight,
          format: function(val, name) {
            return val + "kg";
          }
        },
        {
          name: "BMI",
          data: chartData.bmis,
          format: function(val, name) {
            return val;
          }
        }
      ],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        format: function(val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: "curve"
      }
    });
  },
  data() {
    return {
      lineChart: null,
      isCanvasShow: true,
      searchDate: {
        start: "",
        end: "",
        default: new Date(this.utils.getDate()),
        themeColor: "#2B7489"
      }
    };
  },
  methods: {
    getChartData: function() {
      //获取日期，bmi，体重值
      return {
        categories: [
          "2016-01-01",
          "2016-01-02",
          "2016-01-03",
          "2016-01-04",
          "2016-01-05",
          "2016-01-06",
          "2016-01-07",
          "2016-01-08",
          "2016-01-09",
          "2016-01-10"
        ],
        bmis: [17.1, 18.1, 19.1, 20.1, 21.1, 20.1, 19.8, 20.8, 18.8, 19.8],
        weight: [65, 68, 70, 71, 73, 66, 69, 67, 72, 73]
      };
    },
    touchHandler: function(e) {
      console.log(this.lineChart.getCurrentDataIndex(e));
      this.lineChart.showToolTip(e, {
        format: function(item, category) {
          return category + " " + item.name + ":" + item.data;
        }
      });
    },
    showDatePicker() {
      this.$refs.mpDatePicker.show();
      this.isCanvasShow = false;
    },
    onConfirm(e) {
      this.isCanvasShow = true;
      let value = e.value;
      let date = value[0] + "-" + value[1] + "-" + value[2];
      this.searchDate.start = this.utils.getDate(new Date(date));
      this.searchDate.end = this.utils.getDate(new Date(date), "before", 9);
      console.log("onConfirm", e);
    },
    onCancel(e) {
      this.isCanvasShow = true;
      console.log("onCancel", e);
    }
  }
};
</script>

<style scoped>
.mypage-wrapper {
  width: 100%;
}
.chart-wrapper {
  width: 100%;
  padding: 10px 0;
  text-align: center;
}
.chart-title {
  font-size: 16px;
}
canvas {
  width: 100%;
  height: 200px;
  z-index: -1;
}
.search-wrapper {
  text-align: left;
  font-size: 16px;
  padding: 0 5px;
  margin-bottom: 20px;
}
.search-date {
  line-height: 2.55555556;
  border-radius: 5px;
  color: #000000;
  background-color: #f8f8f8;
  padding-left: 5px;
  margin: 5px auto;
}
.search-date-clickable {
  border: 0.5px solid #e0e0e0;
  box-shadow: 1px 0.5rpx 0.5rpx 0.5rpx #2f5024;
}
</style>
