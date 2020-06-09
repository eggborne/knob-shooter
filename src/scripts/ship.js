import { Container, utils } from 'pixi.js';
import { Knob, Bullet } from './knob';
import { pointAtAngle, distanceFromABToXY } from '../App';

const hexValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

const shipDesigns = {
  player: {
    orientation: 'vertical',
    pieces: [
      {
        position: { x: 0, y: 0 },
        tiers: [0, 2, 2, 3],
        color: 0x00aa00,
        spinSpeed: 3,
        gunKnobs: [
          [],
          [],
          [],
          [2, 6, 10],
          [],
        ]
      },
      {
        position: { x: 0, y: -1.5 },
        tiers: [1.5],
        color: 0x00aa00,
        spinSpeed: -2,
        gunKnobs: [
          [0, 1, 2]
        ]
      }
    ],
    knobScale: 1
  },
  egg: {
    orientation: 'vertical',
    pieces: [
      {
        position: { x: 0, y: 0 },
        tiers: [2, 3, 3.5, 4, 4.5, 5, 5, 5, 4, 3],
        color: 0xdddddd,
        knobHP: 1,
        spinSpeed: 1
      }
    ],
    knobScale: 1,
    coreKnobScale: 4,
    cashKnobFrequency: 3
  },
  saucer: {
    orientation: 'vertical',
    pieces: [
      {
        position: { x: 0, y: 0 },
        tiers: [2, 3, 6, 3, 2],
        color: 0xff4444,
        knobHP: 3,
        spinSpeed: 1.5
      }
    ],
    knobScale: 1.25,
    coreKnobScale: 2.5,
    cashKnobFrequency: 1
  }
};

export class Ship {
  constructor(game, type, startX, startY, fireRate, penetration, bulletSize, attractPower) {
    this.game = game;
    this.type = type;
    this.container = new Container();
    this.container.x = startX;
    this.container.y = startY;
    this.knobSize = game.knobSize;
    this.pieces = [];
    this.fireRate = fireRate;
    this.attractPower = attractPower;
    this.totalKnobs;
    this.penetration = penetration;
    this.bulletSize = bulletSize;
    this.cashKnobFrequency = shipDesigns[this.type].cashKnobFrequency;

    this.vectorAngle = 0;
    this.vectorDistance;
    this.offscreen = false;

  }

  spawn() {
    shipDesigns[this.type].pieces.forEach(piece => {
      let newPiece = new Shape(this, piece);
      newPiece.construct();
      this.container.addChild(newPiece.container);
    });
    this.game.stage.addChild(this.container);
    this.totalKnobs = 0;
    this.pieces.forEach(piece => {
      this.totalKnobs += piece.knobs.length;
    });
    if (this.type !== 'player') {
      this.vectorDistance = this.game.knobSize / 6;
      this.container.y = -this.container.height / 2;
    }
  }

  fire() {
    this.pieces.forEach(piece => {
      piece.knobs.filter(knob => knob.type === 'gun').forEach((gunKnob, g, arr) => {
        setTimeout(() => {
          const posX = this.container.x + gunKnob.container.x;
          const posY = this.container.y + gunKnob.container.y + (this.game.knobSize * piece.pieceData.position.y);
          new Bullet(this, gunKnob, this.penetration, this.game.knobSize * this.bulletSize, posX, posY);
        }, (g * this.fireRate * 5));
      });
    });
  }

  checkForBullets() {
    this.game.bullets.forEach(bullet => {
      this.pieces.forEach(piece => {
        piece.knobs.forEach(knob => {
          if (!bullet.spent && !bullet.offscreen) {
            const bulletX = bullet.sprite.x - this.container.x;
            const bulletY = bullet.sprite.y - this.container.y;
            // const inZRange = knob.container.z > piece.knobs.length / 4;
            const inZRange = true;
            const colliding = distanceFromABToXY(knob.container.x, knob.container.y, bulletX, bulletY) < (bullet.sprite.width / 2) + (knob.sprite.width) / 2;
            if (inZRange && colliding && !knob.doomed && !knob.dead && !bullet.spent) {              
              if (knob.type === 'core') {
                knob.damage(bullet.penetration)
                bullet.spent = true;
              } else {
                knob.damage(1);
                bullet.penetration -= 1;
                if (!bullet.penetration) {
                  bullet.spent = true;
                }
              }
            }
          }
        });
        const doomedKnobs = piece.knobs.filter(knob => knob.doomed);
        doomedKnobs.forEach(knob => {
          knob.die();
          if (knob.dead) {
            knob.container.alpha = 0;
            piece.knobs.splice(piece.knobs.indexOf(knob), 1);
            if (!piece.knobs.some(knob => !knob.dead)) {
              this.game.stage.removeChild(this.container);
            }
          }
        });
      });
    });
  }

  checkForCashKnobs() {
    this.game.cashKnobs.filter(cashKnob => cashKnob.loose).forEach(cashKnob => {
      const inRange = distanceFromABToXY(this.container.x, this.container.y, cashKnob.sprite.x, cashKnob.sprite.y) <= this.container.width + (this.attractPower * this.game.knobSize);
      if (inRange) {
        cashKnob.sprite.tint = 0x00ff00;
        cashKnob.loose = false;
      }
    });
  }

  zigzag(fullCircle) {
    const circularPath = pointAtAngle(this.container.x, this.container.y, this.vectorAngle, this.vectorDistance);
    this.container.x = circularPath.x;
    if (fullCircle) {
      this.container.y = circularPath.y;
    }
    this.vectorAngle += Math.PI / 64;
  }
  descend() {
    this.container.y += this.game.knobSize / 14;
    if (this.container.y > this.game.view.height + (this.container.height / 2)) {
      this.offscreen = true;
      this.game.stage.removeChild(this.container);
    }
  }
}

export class Shape {
  constructor(owner, pieceData) {
    this.owner = owner;
    this.game = owner.game;
    this.gun = pieceData.gun;
    this.container = new Container();
    this.knobs = [];
    this.tiers = pieceData.tiers;
    this.color = pieceData.color;
    this.spinSpeed = pieceData.spinSpeed;
    this.knobSize = shipDesigns[owner.type].knobScale * owner.game.knobSize;
    this.container.x = pieceData.position.x * this.knobSize;
    this.container.y = pieceData.position.y * this.knobSize;
    this.zRotation = 0;
    this.worldZ = 24;
    this.gunKnobs = [];
    this.pieceData = pieceData;
    if (false && owner.type !== 'player' && shipDesigns[owner.type].pieces.indexOf(pieceData) === 0) {
      this.coreKnobScale = shipDesigns[owner.type].coreKnobScale;
      this.coreKnob = new Knob('core', this, 0xaa0000, 0, 0, 'largeKnob', 0, 0, 100);
      this.coreKnob.sprite.width = this.knobSize * this.coreKnobScale;
      this.coreKnob.sprite.height = this.knobSize * this.coreKnobScale;
      this.container.addChild(this.coreKnob.sprite);
      this.knobs.push(this.coreKnob);
    }
  }

  construct() {
    let currentKnobY = -(this.tiers.length * this.knobSize) / 2;
    this.tiers.forEach((entry, e) => {
      let currentAngle = 0;
      const tierRadius = this.knobSize * (entry - 1);
      const outerCircumference = Math.round(tierRadius * Math.PI * 2);
      const rodsNeeded = Math.floor(outerCircumference / this.knobSize);
      const angleIncrement = (Math.PI * 2) / rodsNeeded;
      for (let i = 0; i < rodsNeeded; i += 1) {
        let knobColor = this.color;
        const topViewPosition = pointAtAngle(this.owner.container.x, this.owner.container.y, currentAngle, tierRadius);
        const knobX = topViewPosition.x - this.owner.container.x;
        // const knobY = topViewPosition.y - this.container.y;
        const knobY = currentKnobY;
        const isGunKnob = this.pieceData.gunKnobs && this.pieceData.gunKnobs[e] && this.pieceData.gunKnobs[e].includes(i);
        let knobType = isGunKnob ? 'gun' : 'normal';
        const newKnob = new Knob(knobType, this, knobColor, knobX, knobY, 'knob', 0, 0, this.pieceData.knobHP);
        newKnob.angleAway = currentAngle;
        newKnob.distanceAway = tierRadius;
        newKnob.scale = 1;
        this.knobs.push(newKnob);
        newKnob.initialIndex = this.knobs.indexOf(newKnob);
        this.container.addChild(newKnob.container);
        currentAngle += angleIncrement;
      }
      currentKnobY += this.knobSize;
    });
    this.owner.pieces.push(this);
  }

  spin(speed) {
    this.knobs.filter(knob => knob.type !== 'core').forEach(knob => {
      knob.angleAway += speed;
      const topViewPosition = pointAtAngle(this.container.x, this.container.y, knob.angleAway, knob.distanceAway);
      const newX = topViewPosition.x - this.container.x;
      knob.container.x = newX;
    });
    if (this.game.counter % 10 === 0) {
      this.setZLevels();
    }
  }

  setZLevels() {
    this.knobs = this.knobs.sort((knobA, knobB) => {
      const topViewPositionA = pointAtAngle(this.container.x, this.container.y, knobA.angleAway, knobA.distanceAway);
      const topViewPositionB = pointAtAngle(this.container.x, this.container.y, knobB.angleAway, knobB.distanceAway);
      return topViewPositionA.y - topViewPositionB.y;
    });
    this.knobs
      .filter(knob => !knob.doomed && knob.type !== 'core')
      .forEach((knob, k) => {
        this.container.setChildIndex(knob.container, k);
        knob.container.z = k;
        const frontHalf = k > this.knobs.length / 2;
        const sizeBoost = (k - this.knobs.length / 2) / 36;
        if (frontHalf) {
          knob.container.width = this.knobSize + sizeBoost;
          knob.container.height = this.knobSize + sizeBoost;
        } else {
          knob.container.width = this.knobSize;
          knob.container.height = this.knobSize;
        }
        knob.sprite.alpha = 0.75 + k / this.knobs.length;
      });
    if (this.coreKnob) {
      this.container.setChildIndex(this.coreKnob.sprite, Math.floor(this.knobs.length / 2));
    }
  }
}
