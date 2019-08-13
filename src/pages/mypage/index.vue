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
    <div class="btn-wrapper">
      <button class="btn-item btn-share" open-type="share">
        <img class="btn-icon" src="/static/images/share.png" />
        <span>分享给好友</span>
      </button>
      <button class="btn-item btn-pay">
        <img class="btn-icon" src="/static/images/pay.png" />
        <span>打赏开发者</span>
      </button>
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
import mpButton from "mpvue-weui/src/button";

export default {
  components: {
    mpDatepicker,
    mpButton
  },
  data() {
    return {
      lineChart: null,
      chartData: [],
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
    initChart: function() {
      this.isCanvasShow = true;
      let windowWidth = 320;
      try {
        let res = wx.getSystemInfoSync();
        windowWidth = res.windowWidth;
      } catch (e) {
        console.error("getSystemInfoSync failed!");
      }
      let chartData = this.chartData;
      console.log("chartData", chartData);
      if (chartData.bmis.length > 0) {
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
      } else {
        this.isCanvasShow = false;
      }
    },
    getChartData: function() {
      let bmis = wx.getStorageSync("bmis");
      let chartData = {
        categories: [],
        bmis: [],
        weight: []
      };

      if (bmis) {
        bmis = JSON.parse(bmis);
        bmis.forEach(item => {
          chartData.categories.push(item.id);
          chartData.bmis.push(Number(item.bmi));
          chartData.weight.push(Number(item.weight));
        });
      }
      this.chartData = chartData;
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
      console.log("onConfirm", e);
      let value = e.value;
      let date = value[0] + "-" + value[1] + "-" + value[2];
      this.searchDate.start = this.utils.getDate(new Date(date));
      this.searchDate.end = this.utils.getDate(new Date(date), "before", 9);
      this.searchBmis();
    },
    searchBmis() {
      console.log("searchbmis");
      let start = this.searchDate.start;
      let end = this.searchDate.end;
      let bmis = wx.getStorageSync("bmis");
      let chartData = {
        categories: [],
        bmis: [],
        weight: []
      };

      if (bmis) {
        bmis = JSON.parse(bmis);
        bmis = bmis.filter(item => {
          return item.id >= end && item.id <= start;
        });
        console.log("bmis", bmis);
        bmis.forEach(item => {
          chartData.categories.push(item.id);
          chartData.bmis.push(Number(item.bmi));
          chartData.weight.push(Number(item.weight));
        });
      }

      this.chartData = chartData;
      this.initChart();
    },
    onCancel(e) {
      this.isCanvasShow = true;
      console.log("onCancel", e);
    }
  },
  mounted() {
    this.getChartData();
    this.initChart();
  },
  onShareAppMessage: function(ops) {
    if (ops.from === "button") {
      // 来自页面内转发按钮
      console.log(ops.target);
    }
    return {
      title: "BMI计算器",
      path: "/pages/index/main", // 这里的 path 是页面 url，而不是小程序路由
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        let shareTickets = res.shareTickets;
        // if (shareTickets.length == 0) {
        //   return false;
        // }
        //可以获取群组信息
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function(res) {
            console.log(res);
          }
        });
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
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
  box-shadow: 0px 0.5rpx 0.5rpx 0px #2f5024;
}
.btn-wrapper {
  position: fixed;
  bottom: 0;
  font-size: 16px;
  width: 100%;
}
.btn-item {
  display: inline-block;
  width: 50%;
  text-align: center;
  line-height: 2.5;
  border: 0.5px solid #e0e0e0;
  border-right: none;
  border-radius: 0;
}

.btn-share {
  background: #7ebb85;
}
.btn-pay {
  background: #74b3d8;
}
.btn-icon {
  width: 20px;
  height: 20px;
  vertical-align: text-bottom;
  margin-right: 10px;
}
</style>
