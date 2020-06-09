<template>
  <div id="game-area">
    <TitleScreen
      v-if='!$store.state.gameStarted'
      :handlePressStart='handlePressStart'
    />
  </div>
</template>

<script>
import TitleScreen from './TitleScreen.vue';

export default {
  name: 'GameScreen',
  components: {
    TitleScreen,
  },
  props: {
    handlePressStart: Function,
  },
};
</script>

<style scoped>
#game-area {
  position: relative;
  width: var(--game-screen-width);
  height: var(--game-screen-height);
  background-color: #222;
  display: flex;
  align-items: center;
  justify-content: center;
}
#game-area canvas {
  width: var(--game-screen-width);
  height: var(--game-screen-height);
}
</style>
