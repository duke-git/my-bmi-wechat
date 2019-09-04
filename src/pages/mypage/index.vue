<template>
  <div class="mypage-wrapper">
    <div class="chart-wrapper">
      <span class="chart-title">体重/BMI趋势图示：</span>
      <div class="search-wrapper">
        <span style="color: #a9a9a9;font-size:12px;">注：考虑到图表显示体验，限制搜索30天以内数据</span>
        <div class="search-date search-date-clickable" @click="showDateEnd">结束日期：{{searchDate.end}}</div>
        <div
          class="search-date search-date-clickable"
          @click="showDateStart"
        >起始日期：{{searchDate.start}}</div>
      </div>
      <canvas
        v-show="isCanvasShow"
        canvas-id="lineCanvas"
        disable-scroll="true"
        class="canvas"
        @touchstart="touchHandler"
      ></canvas>
    </div>
    <div class="table-wrapper">
      <span class="table-title">数据记录：</span>
      <div class="bmi-table">
        <div class="bmi-table-head">
          <div class="tr">
            <div class="th" style="width: 30%;">日期</div>
            <div class="th">BMI</div>
            <div class="th">体重(kg)</div>
            <div class="th">操作</div>
          </div>
        </div>
        <div class="bmi-table-body">
          <div class="tr" v-for="(item, index) in tableData" :key="index">
            <div class="td">{{item.id}}</div>
            <div class="td">{{item.bmi}}</div>
            <div class="td">{{item.weight}}</div>
            <div class="td">
              <a style="color:blue;" @click="onDeleteBMI(item)">删除</a>
            </div>
          </div>
        </div>
      </div>
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
    <van-popup :show="isDateEndShow" position="bottom" :overlay="true">
      <van-datetime-picker
        type="date"
        :value="searchDate.valueEnd"
        :max-date="searchDate.maxEndDate"
        @confirm="onConfirmDateEnd"
        @cancel="onCancelDateEnd"
      />
    </van-popup>
    <van-popup :show="isDateStartShow" position="bottom" :overlay="true">
      <van-datetime-picker
        type="date"
        :value="searchDate.valueStart"
        :max-date="searchDate.maxStartDate"
        :min-date="searchDate.minStartDate"
        @confirm="onConfirmDateStart"
        @cancel="onCancelDateStart"
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
    <van-dialog
      id="deletebmi-dialog"
      :show="isShowDelete"
      message="删除数据不可恢复，确认删除本条记录？"
      :show-cancel-button="true"
      @confirm="deleteBMI"
      @cancel="cancelDelete"
    />
    <mp-toast
      :type="tost.type"
      v-model="tost.show"
      :content="tost.content"
      :duration="tost.duration"
    ></mp-toast>
  </div>
</template>

<script>
let wxCharts = require("@/utils/wxcharts-min.js");
import mpButton from "mpvue-weui/src/button";
import mpToast from "mpvue-weui/src/toast";

export default {
  components: {
    mpButton,
    mpToast
  },
  data() {
    return {
      lineChart: null,
      chartData: [],
      isCanvasShow: true,
      isRewordShow: false,
      searchDate: {
        end: this.utils.getDate(),
        start: this.utils.getDate(new Date(), "before", 30),
        maxEndDate: new Date().getTime(),
        maxStartDate: new Date().getTime(),
        minStartDate: new Date().getTime() - 3600 * 1000 * 24 * 30,
        valueEnd: new Date().getTime(),
        valueStart: new Date().getTime() - 3600 * 1000 * 24 * 30,
        themeColor: "#2B7489"
      },
      isDateStartShow: false,
      isDateEndShow: false,
      tableData: [],
      isShowDelete: false,
      currentDeleteBMI: null,
      tost: {
        show: false,
        type: "default",
        content: "",
        duration: 1500
      }
    };
  },
  methods: {
    initPageData() {
      this.getChartData();
      this.initChart();
      this.getTableData();
    },
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
    getTableData() {
      let start = this.searchDate.start;
      let end = this.searchDate.end;
      let bmis = wx.getStorageSync("bmis");
      let tableData = [];

      if (bmis) {
        bmis = JSON.parse(bmis);
        bmis = bmis.filter(item => {
          return item.id >= start && item.id <= end;
        });
        bmis.forEach(item => {
          tableData.push({
            id: item.id,
            bmi: item.bmi,
            weight: item.weight
          });
        });
      }

      this.tableData = tableData.reverse();
    },
    touchHandler: function(e) {
      this.lineChart.showToolTip(e, {
        format: function(item, category) {
          return category + " " + item.name + ":" + item.data;
        }
      });
    },
    showDateEnd() {
      this.isDateEndShow = true;
      this.isCanvasShow = false;
    },
    showDateStart() {
      this.isDateStartShow = true;
      this.isCanvasShow = false;
    },
    onConfirmDateEnd(e) {
      this.isDateEndShow = false;
      let date = new Date(e.mp.detail);
      this.searchDate.end = this.utils.getDate(date);
      this.searchDate.start = this.utils.getDate(
        new Date(date.getTime() - 3600 * 1000 * 24 * 30)
      );
      this.searchDate.maxStartDate = date.getTime();
      this.searchDate.minStartDate = date.getTime() - 3600 * 1000 * 24 * 30;
      this.searchBmis();
    },
    onCancelDateEnd() {
      this.isDateEndShow = false;
      this.searchBmis();
    },
    onConfirmDateStart(e) {
      this.isDateStartShow = false;
      let date = new Date(e.mp.detail);
      this.searchDate.start = this.utils.getDate(new Date(date));
      this.searchBmis();
    },
    onCancelDateStart() {
      this.isDateStartShow = false;
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
          return item.id >= start && item.id <= end;
        });
        bmis.forEach(item => {
          chartData.categories.push(item.id);
          chartData.bmis.push(Number(item.bmi));
          chartData.weight.push(Number(item.weight));
        });
      }

      this.chartData = chartData;
      console.log(chartData);

      this.initChart();
      this.getTableData();
    },

    onDeleteBMI(item) {
      this.isCanvasShow = false;
      this.isShowDelete = true;
      this.currentDeleteBMI = item;
    },
    deleteBMI() {
      let bmis = wx.getStorageSync("bmis");
      if (bmis) {
        bmis = JSON.parse(bmis);
        bmis = bmis.filter(item => {
          return item.id != this.currentDeleteBMI.id;
        });
        wx.setStorageSync("bmis", JSON.stringify(bmis));
        this.showTost("success", "删除成功", 2000);
        this.initPageData();
      } else {
        console.error("删除bmi错误");
      }
      this.isShowDelete = false;
      this.isCanvasShow = true;
    },
    showTost(type, content, duration = 1500) {
      this.tost.show = true;
      this.tost.type = type;
      this.tost.content = content;
      this.tost.duration = duration;
    },
    cancelDelete() {
      this.isCanvasShow = true;
      this.isShowDelete = false;
      this.currentDeleteBMI = null;
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
    this.initPageData();
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
  /* text-align: center; */
}
.chart-title {
  font-size: 16px;
  padding: 0 2px;
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
.table-wrapper {
  position: relative;
  margin-bottom: 50px;
}

.table-title {
  font-size: 16px;
  padding-left: 5px;
}

.bmi-table {
  border-bottom: 0.5px solid #ebebeb;
  border-top: 0.5px solid #ebebeb;
  font-size: 14px;
  padding: 0 10px;
  height: 140px;
  overflow-y: scroll;
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
