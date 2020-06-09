import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    gameStarted: false,
    cursorPosition: {
      x: 0,
      y: 0
    },
    playerCash: 0,
    autoFire: true,
    fireButtonDown: false,
    fireRate: 14,
    penetration: 1,
    bulletSize: 0.5,
    attractPower: 3
  },
  mutations: {
    toggleGameStarted(state) {
      state.gameStarted = !state.gameStarted;
    },
    toggleAutoFire(state) {
      state.autoFire = !state.autoFire;
    },
    setFireButtonDown(state, newStatus) {
      state.fireButtonDown = newStatus;
    },
    updateCursorPosition(state, newPosition) {
      state.cursorPosition = newPosition;
    },
    updatePlayerCash(state, amount) {
      state.playerCash += amount;
    },
    setPenetration(state, newValue) {
      state.penetration = newValue;
    },
    setBulletSize(state, newSize) {
      state.bulletSize = newSize;
    },
    setAttractPower(state, newValue) {
      state.attractPower = newValue;
    }
  },
  actions: {},
  modules: {}
});
