<template>
  <div class="mypage-wrapper">
    <div class="chart-wrapper">
      <span class="chart-title">体重/BMI趋势图示</span>
      <div class="search-wrapper">
        <span
          style="color: #a9a9a9;font-size:12px;"
        >注：考虑到图表显示体验，限制搜索30天以内数据（只有开始日期可选择，结束日期固定设置为开始日期以前30天）</span>
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
      <button class="btn-item btn-reward" @click="showRewardImg">
        <img class="btn-icon" src="/static/images/reward_icon.png" />
        <span>打赏开发者</span>
      </button>
    </div>
    <van-popup :show="isDatepickerShow" position="bottom" :overlay="true">
      <van-datetime-picker
        type="date"
        :value="searchDate.value"
        @confirm="onConfirmDate"
        @cancel="onCancelDate"
      />
    </van-popup>
    <van-popup
      :show="isRewordShow"
      position="bottom"
      :overlay="true"
      @close="onCloseMask"
      :close-on-click-overlay="true"
    >
      <img
        src="https://ks3-cn-beijing.ksyun.com/fe-frame/project/ebs/image1.jpeg"
        data-src="https://ks3-cn-beijing.ksyun.com/fe-frame/project/ebs/image1.jpeg"
        class="reward-img"
        @click="previewRewardImg"
      />
    </van-popup>
  </div>
</template>

<script>
let wxCharts = require("@/utils/wxcharts-min.js");
import mpButton from "mpvue-weui/src/button";

export default {
  components: {
    mpButton
  },
  data() {
    return {
      lineChart: null,
      chartData: [],
      isCanvasShow: true,
      isRewordShow: false,
      searchDate: {
        start: this.utils.getDate(),
        end: this.utils.getDate(new Date(), "before", 30),
        value: new Date().getTime(),
        themeColor: "#2B7489"
      },
      isDatepickerShow: false
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
      this.lineChart.showToolTip(e, {
        format: function(item, category) {
          return category + " " + item.name + ":" + item.data;
        }
      });
    },
    showDatePicker() {
      this.isDatepickerShow = true;
      this.isCanvasShow = false;
    },
    onConfirmDate(e) {
      this.isDatepickerShow = false;
      let date = new Date(e.mp.detail);
      this.searchDate.start = this.utils.getDate(new Date(date));
      this.searchDate.end = this.utils.getDate(new Date(date), "before", 9);
      this.searchBmis();
    },
    onCancelDate() {
      this.isDatepickerShow = false;
      this.searchBmis();
    },
    searchBmis() {
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
        bmis.forEach(item => {
          chartData.categories.push(item.id);
          chartData.bmis.push(Number(item.bmi));
          chartData.weight.push(Number(item.weight));
        });
      }

      this.chartData = chartData;
      this.initChart();
    },

    showRewardImg() {
      this.isRewordShow = true;
      this.isCanvasShow = false;
    },
    onCloseMask() {
      this.isRewordShow = false;
      this.isCanvasShow = true;
    },
    previewRewardImg(e) {
      console.log(1);
      let current = e.target.dataset.src; //这里获取到的是一张本地的图片
      wx.previewImage({
        current: current, //需要预览的图片链接列表
        urls: [current] //当前显示图片的链接
      });
    }
  },
  onShow() {
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
        //可以获取群组信息
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function(res) {
            console.log(res);
          }
        });
      },
      fail: function(res) {
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
.btn-reward {
  background: #74b3d8;
}
.btn-icon {
  width: 20px;
  height: 20px;
  vertical-align: text-bottom;
  margin-right: 10px;
}

.reward-img {
  width: 100%;
  height: 375px;
}
</style>
