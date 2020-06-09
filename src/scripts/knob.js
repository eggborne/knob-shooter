import { Sprite, Container } from 'pixi.js';
import { pointAtAngle, randomInt, degToRad } from '../App';

const cashKnobTypes = {
  green: {
    color: 0x00aa00,
    value: 1,
    size: 0.5
  },
  largeGreen: {
    color: 0x55ff55,
    value: 5,
    size: 1
  },
};

export class Knob {
  constructor(type, owner, color, posX, posY, texture, angleAway, distanceAway, maxHP) {
    this.type = type;
    this.owner = owner;
    this.container = new Container();
    this.sprite = new Sprite(owner.game.loader.resources[texture].texture);
    this.sprite.width = owner.knobSize;
    this.sprite.height = owner.knobSize;
    this.sprite.anchor.set(0.5);
    this.sprite.tint = color;
    this.origColor = color;
    this.container.x = posX;
    this.container.y = posY;
    this.container.z = 0;
    this.dying = false;
    this.diedAt = 0;
    this.owner = owner;
    this.origY = posY;
    this.centerAngle = angleAway;
    this.centerDistance = distanceAway;
    this.gridPosition = {};
    this.maxHP = maxHP;
    this.hp = this.maxHP;
    this.onFire = false;
    this.doomed = false;
    this.dead = false;
    
    this.backing = new Sprite(owner.game.loader.resources[texture].texture);
    this.backing.width = this.sprite.width;
    this.backing.height = this.sprite.height;
    this.backing.anchor.set(0.5);
    this.backing.tint = 0x000000;
    this.container.addChild(this.backing);

    if (this.type === 'gun') {
      this.sprite.tint = 0xffaa00;
    }

    this.container.addChild(this.sprite);
  }

  damage(amount) {
    this.hp -= amount;
    if (this.type === 'core') {
      this.sprite.tint = 0xffaa00;
      setTimeout(() => {
        if (!this.doomed) {
          this.sprite.tint = this.origColor;
        }
      }, 6);
    }
    if (this.hp <= 0) {
      this.doomed = true;
      this.backing.visible = false;
      this.sprite.tint = 0xffaa00;
      if (this.type === 'core') {
        this.owner.knobs.forEach(knob => {
          knob.backing.visible = false;
          knob.doomed = true;
        });
      }
    } else {
      if (this.type !== 'core') {
        this.sprite.texture = this.owner.game.loader.resources[`knobcrack${this.maxHP - this.hp}`].texture;
        this.container.rotation = degToRad(randomInt(1, 359));
      }
    }
  }

  die() {
    if (this.type !== 'core') {
      this.sprite.width -= this.owner.knobSize / 64;
      this.sprite.height -= this.owner.knobSize / 64;
      if (this.sprite.width <= this.owner.knobSize / 64) {
        this.dead = true;
        this.doomed = false;
        if (this.initialIndex % this.owner.owner.cashKnobFrequency === 0) {
          const cashKnobType = this.owner.knobs.length > 1 ? 'green' : 'largeGreen';
          new cashKnob(this.owner.game, cashKnobType, this.owner.owner.container.x + this.container.x, this.owner.owner.container.y + this.container.y);
        }
      }
    } else {
      this.sprite.width += this.owner.owner.game.knobSize / 12;
      this.sprite.height += this.owner.owner.game.knobSize / 12;
      this.sprite.alpha -= 0.01;
      this.sprite.tint = 0xffaa00;
      if (this.sprite.alpha <= 0) {
        this.dead = true;
        this.doomed = false;
      } 
    }
  }
}

export class Bullet {
  constructor(owner, firingKnob, penetration, size, startX, startY) {
    this.sprite = new Sprite(owner.game.loader.resources['knob'].texture);
    // this.sprite.cacheAsBitmap = true;
    this.sprite.width = size;
    this.sprite.height = size;
    this.sprite.anchor.set(0.5);
    this.sprite.tint = 0xffff66;
    this.sprite.x = startX;
    this.sprite.y = startY;
    this.sprite.z = firingKnob.sprite.alpha;
    this.penetration = penetration;
    this.spent = false;
    
    owner.game.stage.addChild(this.sprite);
    owner.game.bullets.push(this);
  }
}

export class cashKnob {
  constructor(game, type, posX, posY) {
    this.game = game;
    this.sprite = new Sprite(game.loader.resources['knob'].texture);
    this.sprite.width = game.knobSize * cashKnobTypes[type].size;
    this.sprite.height = game.knobSize * cashKnobTypes[type].size;
    this.sprite.x = posX;
    this.sprite.y = posY;
    this.sprite.anchor.set(0.5);
    this.sprite.tint = cashKnobTypes[type].color;
    this.value = cashKnobTypes[type].value;
    this.vectorAngle = 0;
    this.vectorDistance = (this.game.knobSize / 2) + randomInt(-this.game.knobSize / 2, this.game.knobSize / 2);
    this.loose = true;
    this.collected = false;
    this.fallSpeed = game.knobSize / 2 + randomInt(-game.knobSize / 4, 0);

    game.stage.addChild(this.sprite);
    game.cashKnobs.push(this);
  }

  zigzag() {
    const circularPath = pointAtAngle(this.sprite.x, this.sprite.y, this.vectorAngle, this.vectorDistance);
    this.sprite.x = circularPath.x;
    this.vectorAngle += Math.PI / 24;
  }
}
