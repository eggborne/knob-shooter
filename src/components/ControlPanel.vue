<template>
  <div id="control-panel">
    <div id='cash-display'>
      ${{ $store.state.playerCash }}
    </div>
  </div>
</template>

<script>

export default {
  name: 'ControlPanel',
};
</script>

<style scoped>
#control-panel {
  width: var(--control-bar-width);
  height: var(--control-bar-height);
  background-color: brown;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
#cash-display {
  background: rgb(119, 46, 46);
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 
    -1px -1px 0 #000,  
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
  color: #009900;
  min-width: 8rem;
  padding: 1rem;
}
@media only screen and (orientation: landscape) {
  #control-panel {
    align-items: stretch;
    flex-direction: column;
  }
  #cash-display {
    min-width: unset;
  }
}
</style>
