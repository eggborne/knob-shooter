<template>
  <div id="app">
    <GameScreen
      :handlePressStart='startGame'
    />
    <ControlPanel />
  </div>
</template>

<script>
import {
  Application,
  Container
} from 'pixi.js';
import ControlPanel from './components/ControlPanel.vue';
import GameScreen from './components/GameScreen.vue';
import * as EntityConstructor from './scripts/ship';

export const degToRad = function(radians) {
  return radians * (Math.PI / 180);
};
export const radToDeg = function(radians) {
  deg = radians * (180 / Math.PI);
  if (deg < 0) {
    deg += 360;
  } else if (deg > 359) {
    deg -= 360;
  }
  return radians * (180 / Math.PI);
};

const game = new Application({
  transparent: true,
  autoDensity: true,
  autoResize: true,
  resolution: window.devicePixelRatio,
  resizeTo: document.getElementById('game-area'),
  sharedTicker: true,
  sharedLoader: true,
  powerPreference: 'high-performance',
  // roundPixels: true,
  // antialias: true
});
game.renderer.autoResize = true;

game.ticker.autoStart = false;
game.ticker.stop();
game.counter = 0;

game.ships = [];
game.bullets = [];
game.cashKnobs = [];

game.loader
  .add('largeKnob', require('./assets/knob.png'))
  .add('knob', require('./assets/smallknob.png'))
  .add('knobcrack1', require('./assets/smallknobcrack1.png'))
  .add('knobcrack2', require('./assets/smallknobcrack2.png'))
  .add('knobcrack3', require('./assets/smallknobcrack3.png'))
  .add('pixel', require('./assets/pixel.png'))
  .load(() => {
    console.log('loaded images.', game.loader.resources);
    game.resizeTo = document.getElementById('game-area');
    game.resize();
    game.knobSize = Math.round((game.view.width / 36) / window.devicePixelRatio);
    game.followSpeed = game.knobSize * 1.5;
    game.center = {
      x: game.view.width / 2 / window.devicePixelRatio,
      y: game.view.height / 2 / window.devicePixelRatio,
    };
    game.ticker.start();
  }); 

export function pointAtAngle(x, y, angle, distance) {
  return { x: x + distance * Math.cos(angle), y: y + distance * Math.sin(angle) };
}
export function angleOfPointABFromXY(a, b, x, y) {
  return Math.atan2(b - y, a - x);
}
export function distanceFromABToXY(a, b, x, y) {
  const distanceX = x - a;
  const distanceY = y - b;
  return Math.round(Math.sqrt(distanceX * distanceX + distanceY * distanceY));
}
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let player;

export default {
  name: 'App',
  created() {
    console.log('App created');
  },
  mounted() {
    document.getElementById('game-area').appendChild(game.view);
    document.getElementById('game-area').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (game.counter > 10) {
        console.log('touched', Math.round(e.pageX), Math.round(e.pageY))
        const posX = e.pageX;
        const posY = e.pageY;
        // const posX = e.clientX - document.getElementById('game-area').offsetLeft;
        // const posY = e.clientY - document.getElementById('game-area').offsetTop;
        if (posX && posY) {
          this.$store.commit('updateCursorPosition', {x: posX, y: posY});
        }
      }
      // this.$store.commit('setFireButtonDown', true);
    }, false);
    // document.getElementById('game-area').addEventListener('pointermove', (e) => {
    //   if (game.counter > 10) {
    //     console.log('moved', Math.round(e.pageX), Math.round(e.pageY));
    //      const posX = e.pageX;
    //     const posY = e.pageY;
    //     // const posX = e.clientX - document.getElementById('game-area').offsetLeft;
    //     // const posY = e.clientY - document.getElementById('game-area').offsetTop;
    //     if (posX && posY) {
    //       this.$store.commit('updateCursorPosition', {x: posX, y: posY});
    //     }
    //   }
    // });
    document.getElementById('game-area').addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (game.counter > 10) {
        // const posX = e.changedTouches[0].pageX;
        // const posY = e.changedTouches[0].pageY;

        const touch = e.originalEvent ? e.originalEvent.touches[0] : e.changedTouches[0];

        const posX = touch.pageX;
        const posY = touch.pageY;

        console.log('moved', e, Math.round(posX), Math.round(posY));
        // const posX = e.clientX - document.getElementById('game-area').offsetLeft;
        // const posY = e.clientY - document.getElementById('game-area').offsetTop;
        if (posX && posY) {
          this.$store.commit('updateCursorPosition', {x: posX, y: posY});
        }
      }
    }, false);
    // document.getElementById('game-area').addEventListener('touchmove', (e) => {
    //   if (game.counter > 10) {
    //     console.log('moved', e)
    //     const clientX = e.clientX || e.targetTouches[0].clientX;
    //     const clientY = e.clientY || e.targetTouches[0].clientY;
    //     const posX = clientX - document.getElementById('game-area').offsetLeft;
    //     const posY = clientY - document.getElementById('game-area').offsetTop;
    //     if (posX && posY) {
    //       this.$store.commit('updateCursorPosition', {x: posX, y: posY});
    //     }
    //   }
    // });

    // document.getElementById('game-area').addEventListener('touchstart', (e) => {
    //   console.log('touched', e)
    //   const clientX = e.clientX || e.targetTouches[0].clientX;
    //   const clientY = e.clientY || e.targetTouches[0].clientY;
    //   if (game.counter > 10) {
    //     const posX = clientX - document.getElementById('game-area').offsetLeft;
    //     const posY = clientY - document.getElementById('game-area').offsetTop;
    //     if (posX && posY) {
    //       this.$store.commit('updateCursorPosition', {x: posX, y: posY});
    //     }
    //   }
    //   // this.$store.commit('setFireButtonDown', true);
    // });
    // document.getElementById('game-area').addEventListener('pointerup', (e) => {
    //   this.$store.commit('setFireButtonDown', false);
    // });

    game.ticker.add(() => {
      if (game.counter === 0 && this.$store.state.gameStarted) {
        player = new EntityConstructor.Ship(game, 'player', game.center.x, 0, this.$store.state.fireRate, this.$store.state.penetration, this.$store.state.bulletSize, this.$store.state.attractPower);
        player.spawn();
        player.container.x = game.view.width / window.devicePixelRatio / 2;
        player.container.y = game.view.height / window.devicePixelRatio - player.container.height;
        game.ships.push(player);
        this.$store.commit('updateCursorPosition', {x: player.container.x, y: player.container.y});
      }
      
      game.ships.forEach((ship) => {
        ship.pieces.forEach(piece => {
          piece.spin(degToRad(piece.spinSpeed));
        });
        if (ship.type !== 'player') {
          ship.checkForBullets();
          ship.zigzag();
          ship.descend();
        } else {
          ship.checkForCashKnobs();
        }          
      });

      game.ships = game.ships.filter(ship => !ship.offscreen && ship.pieces[0].knobs.length);

      if (player && this.$store.state.gameStarted) {
        if (true || game.counter > 10) {
          if (game.counter % 360 === 0) {
            const randomType = randomInt(0, 1) ? 'egg' : 'saucer';
            const newRandomEnemy = new EntityConstructor.Ship(game, randomType, game.center.x + randomInt((-game.view.width / window.devicePixelRatio) / 4, (game.view.width / window.devicePixelRatio) / 4));
            newRandomEnemy.spawn();
            game.ships.push(newRandomEnemy);
          }
          const offLeftBounds = player.container.width / 2;
          const offRightBounds = (game.view.width / window.devicePixelRatio) - player.container.width / 2;
          const offTopBounds = player.container.height / 2;
          const offBottomBounds = (game.view.height / window.devicePixelRatio) - player.container.height / 2;
          let newPos;
          if (Math.abs(player.container.x - this.$store.state.cursorPosition.x) > game.followSpeed || Math.abs(player.container.y - this.$store.state.cursorPosition.y) > game.followSpeed) {
            const angleAway = angleOfPointABFromXY(this.$store.state.cursorPosition.x, this.$store.state.cursorPosition.y, player.container.x, player.container.y)
            newPos = pointAtAngle(player.container.x, player.container.y, angleAway, game.followSpeed);
          } else {
            newPos = { x: this.$store.state.cursorPosition.x, y: this.$store.state.cursorPosition.y };
            // if (this.$store.state.cursorPosition.x < offLeftBounds) {
              //   player.container.x = offLeftBounds          
            // } else if (this.$store.state.cursorPosition.x > offRightBounds) {
              //   player.container.x = offRightBounds
            // } else  {
              //   player.container.x = this.$store.state.cursorPosition.x;
            // }
            // player.container.x = newPos.x < offLeftBounds ? offLeftBounds : this.$store.state.cursorPosition.x;
            // player.container.y = this.$store.state.cursorPosition.y < offTopBounds ? offTopBounds : this.$store.state.cursorPosition.x;
          }
          player.container.x = newPos.x < offLeftBounds ? offLeftBounds : newPos.x > offRightBounds ? offRightBounds : newPos.x
          player.container.y = newPos.y < offTopBounds ? offTopBounds : newPos.y > offBottomBounds ? offBottomBounds : newPos.y;
          if ((this.$store.state.autoFire || this.$store.state.fireButtonDown) && game.counter % player.fireRate === 0) {
            player.fire();
          }
        }

        game.bullets.forEach(bullet => {
          if (!bullet.spent) {
            bullet.sprite.y -= game.knobSize;
            if (bullet.sprite.y < -bullet.sprite.height) {
              bullet.offscreen = true;
            }
          }
        });
        game.bullets.filter(bullet => bullet.spent || bullet.offscreen).forEach(bullet => {
          game.stage.removeChild(bullet.sprite);
        });
        game.bullets = game.bullets.filter(bullet => !bullet.spent && !bullet.offscreen);

        game.cashKnobs.forEach(cashKnob => {
          if (cashKnob.loose) {
            cashKnob.sprite.y += cashKnob.fallSpeed;
            if (cashKnob.sprite.y > game.view.height + cashKnob.sprite.height / 2) {
              cashKnob.collected = true;
            }
            cashKnob.zigzag();
          } else {
            const playerAngle = angleOfPointABFromXY(player.container.x, player.container.y, cashKnob.sprite.x, cashKnob.sprite.y);
            const newPos = pointAtAngle(cashKnob.sprite.x, cashKnob.sprite.y, playerAngle, game.knobSize);
            cashKnob.sprite.x = newPos.x;
            cashKnob.sprite.y = newPos.y;
            const newDistance = distanceFromABToXY(player.container.x, player.container.y, cashKnob.sprite.x, cashKnob.sprite.y);
            if (newDistance < game.knobSize) {
              this.$store.commit('updatePlayerCash', cashKnob.value);
              cashKnob.collected = true;
              game.stage.removeChild(cashKnob.sprite);
            }
          }
        });
        game.cashKnobs = game.cashKnobs.filter(cashKnob => !cashKnob.collected);
      }

      if (this.$store.state.gameStarted) {
        game.counter += 1;
      }
      game.renderer.render(game.stage);
    });
  },
  components: {
    ControlPanel,
    GameScreen,
  },
  methods: {
    startGame() {
      this.$store.commit('toggleGameStarted');
    },
  },
};
</script>

<style>
:root {
  --device-height: 100vh; /* set with js on load */
  --game-screen-ratio: calc(8/6);
  --game-screen-width: 100vw;
  --game-screen-height: calc(100vw * var(--game-screen-ratio));
  --control-bar-width: 100vw;
  --control-bar-height: calc(var(--device-height) - var(--game-screen-height));
  --control-knob-size: 90px;
  --title-border-width: calc(var(--game-screen-width) / 12);
  --title-button-font-size: calc(var(--game-screen-width) / 9);
}
* {
  box-sizing: border-box;
  /* overflow: hidden; */
}
body {
  margin: 0;
  height: var(--device-height);
  width: 100vw;
}
#app {
  width: 100vw;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  grid-template-rows: 1fr var(--control-bar-height);
  grid-template-columns: 1fr;
  background: gray;
}

@media only screen and (orientation: landscape) {
  :root {
    --game-screen-height: 100vh;
    --game-screen-width: calc(100vh / var(--game-screen-ratio));
    --control-bar-width: 120px;
    --control-bar-height: 100vh;
  }
  #app {
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr;
    justify-items: center;
  }
}
</style>
