import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import store from './store'

Vue.config.productionTip = false

document.documentElement.style.setProperty('--device-height', `${window.innerHeight}px`);

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
