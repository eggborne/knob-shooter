
let counter = 0;

function update() {
  if (counter % 50 === 0) { console.log('updating', counter); }
  game.renderer.render(stage);
  counter += 1;
}

export default update;
