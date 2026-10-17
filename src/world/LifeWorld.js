import { ZONE_FARM } from './zoneDefinitions.js';
import { tileToScreen } from './isoMath.js';
import { ResourceSystem } from '../systems/ResourceSystem.js';
import { FishingSystem } from '../systems/FishingSystem.js';
import { DecorationSystem } from '../systems/DecorationSystem.js';
import { PetSystem } from '../systems/PetSystem.js';
import { FestivalSystem } from '../systems/FestivalSystem.js';
import { Pet } from '../entities/Pet.js';
import { getItemDefinition } from '../data/items.js';

export class LifeWorld {
  constructor(scene) {
    this.scene = scene;
    const world = scene.saveData.world;
    world.zoneStates ||= {};
    const zoneState = world.zoneStates.farm ||= {};
    zoneState.resources ||= {}; zoneState.fishing ||= {};
    world.festivalState ||= {};
    scene.resourceSystem = new ResourceSystem(ZONE_FARM.resources, scene.inventory, scene.wallet, scene.worldClock, zoneState.resources);
    scene.fishing = new FishingSystem(scene.inventory, scene.wallet, scene.worldClock, zoneState.fishing);
    scene.decorations = new DecorationSystem(scene.saveData.housing);
    scene.petSystem = new PetSystem(scene.saveData.pet, scene.worldClock);
    scene.pet = new Pet(scene, scene.saveData.pet, scene.player);
    scene.depthSorter.register(scene.pet);
    scene.festival = new FestivalSystem({ flags: scene.saveData.flags, festivalState: world.festivalState,
      clock: scene.worldClock, inventory: scene.inventory, wallet: scene.wallet, relationships: scene.relationshipSystem });
    this.unsubscribeDay = scene.worldClock.on('day', () => {
      scene.resourceSystem.onNewDay(); this.refreshResources(); this.syncFestival();
    });
    this.refreshResources();
    this.createFestivalBoard();
    this.syncFestival();
  }

  createFestivalBoard() {
    const scene = this.scene;
    const p = tileToScreen(18.5, 18.5);
    const board = scene.add.container(p.x, p.y, [
      scene.add.rectangle(-17, -5, 4, 25, 0x59483B), scene.add.rectangle(17, -5, 4, 25, 0x59483B),
      scene.add.rectangle(0, -20, 56, 24, 0x87674E).setStrokeStyle(2, 0x59483B),
      scene.add.text(0, -20, 'FESTIVAL', { fontFamily: 'sans-serif', fontSize: '9px', color: '#EEE1C4' }).setOrigin(0.5)
    ]);
    scene.depthSorter.register({ sprite: board, active: true, getFootY: () => p.y });
    this.banners = scene.add.graphics().setDepth(1600);
    const start = tileToScreen(17, 14), end = tileToScreen(24, 14);
    this.banners.lineStyle(1, 0x87674E).lineBetween(start.x, start.y - 56, end.x, end.y - 56);
    for (let i = 1; i < 9; i++) {
      const t = i / 9, x = start.x + (end.x - start.x) * t, y = start.y + (end.y - start.y) * t - 56;
      this.banners.fillStyle(i % 2 ? 0xD9AE6B : 0xBC7654).fillTriangle(x - 4, y, x + 4, y, x, y + 9);
    }
  }

  getTargets() {
    const pet = this.scene.pet;
    return [...this.scene.resourceSystem.getTargets(),
      { id: 'kiko', tileX: pet.tileX, tileY: pet.tileY, type: 'pet', priority: 46, prompt: 'Sapa Kiko [E]' }];
  }

  refreshResources() {
    for (const prop of this.scene.worldRenderer.props) {
      const definition = prop.definition;
      if (!definition?.id || !ZONE_FARM.resources.some(node => node.id === definition.id)) continue;
      const state = this.scene.resourceSystem.getNodeState(definition.id);
      if (definition.type === 'mining') {
        prop.sprite.setTexture(this.scene.resourceSystem.getNode(definition.id).textureKey);
        prop.sprite.setScale(definition.displayHeight / prop.sprite.height);
        prop.sprite.setAlpha(state.depleted ? 0.65 : 1);
      } else prop.sprite.setVisible(!state.depleted);
    }
  }

  interact(target) {
    const ui = this.scene.scene.get('UIScene');
    if (target.type === 'resource') {
      const definition = ZONE_FARM.resources.find(node => node.id === target.item.id);
      const result = this.scene.resourceSystem.interact(target.item.id);
      const depleted = this.scene.resourceSystem.getNodeState(target.item.id).depleted;
      if (result.success) this.scene.audio.play(definition.type === 'mining' ? 'mining' : 'harvest');
      ui.showToast(result.success && depleted ? `+${definition.count} ${getItemDefinition(definition.itemId).name}` : result.message);
      this.refreshResources(); return true;
    }
    const actions = { pet: 'openPet', fishing: 'openFishing', door: 'openHome', festival: 'openFestival', portal: 'openGuide' };
    const action = actions[target.type];
    if (!action) return false;
    ui.lifePanels[action](); return true;
  }

  syncFestival() {
    const scene = this.scene;
    const celebrated = scene.saveData.world.festivalState.harvest_lantern_night === 'celebrated';
    const active = celebrated && scene.worldClock.isNight();
    this.banners.setVisible(celebrated);
    if (this.festivalActive === active) return;
    this.festivalActive = active;
    scene.dialogueSystem.festivalActive = active;
    const gathering = [{ tileX: 19.5, tileY: 16.5 }, { tileX: 20.5, tileY: 18.5 }, { tileX: 22.5, tileY: 17.5 }];
    scene.npcs.forEach((npc, i) => {
      scene.navGrid.setSolid(Math.floor(npc.tileX), Math.floor(npc.tileY), false);
      const position = active ? gathering[i] : ZONE_FARM.npcs[i];
      npc.tileX = position.tileX; npc.tileY = position.tileY;
      const screen = tileToScreen(npc.tileX, npc.tileY);
      npc.x = screen.x; npc.y = screen.y; npc.sprite.setPosition(npc.x, npc.y);
      scene.navGrid.setSolid(Math.floor(npc.tileX), Math.floor(npc.tileY), true);
    });
    for (const prop of scene.worldRenderer.props) {
      if (prop.sprite.texture?.key.startsWith('lantern_')) prop.sprite.setTexture(active ? 'lantern_lit' : 'lantern_unlit');
    }
  }

  update(dt) {
    if (!this.scene.inputRouter.isFrozen) this.scene.pet.update(dt, this.scene.player, this.scene.navGrid);
    this.syncFestival();
  }

  destroy() { this.unsubscribeDay(); }
}
