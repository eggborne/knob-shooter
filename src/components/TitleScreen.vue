<template>
  <div class="title-screen">
    <div class='title-button-area'>
      <button @click='handlePressStart' class='title-button'>START!</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleScreen',
  data: () => ({
    touchedAt: false,
    position: {
      x: 0,
      y: 0,
    },
  }),
  props: {
    handlePressStart: Function,
  },
};
</script>

<style scoped>
.title-screen {
  position: absolute;
  width: calc(100% - var(--title-border-width));
  height: calc(100% - var(--title-border-width));
  /* background: #888; */
  border: 3px solid #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: var(--title-border-width);
}
.title-button-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
button.title-button {
  font-size: var(--title-button-font-size);
  border-radius: calc(var(--game-screen-width) / 64);
  padding: calc(var(--title-button-font-size) / 3) calc(var(--title-button-font-size) / 2);
  width: min-content;
}
</style>
