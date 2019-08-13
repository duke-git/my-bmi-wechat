import Vue from 'vue';
import App from './App';
import 'mpvue-weui/src/style/weui.css';
import utils from '@/utils/index';

Vue.config.productionTip = false;
Vue.prototype.utils = utils;
App.mpType = 'app';

const app = new Vue(App);
app.$mount();
