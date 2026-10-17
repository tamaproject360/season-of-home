import { inventoryTransaction } from './inventoryTransaction.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { ResourceNode } from '../entities/ResourceNode.js';

export class ResourceSystem {
  constructor(definitions, inventory, wallet, clock, state) {
    Object.assign(this, { definitions, inventory, wallet, clock, state });
    this.onNewDay();
  }

  onNewDay() {
    if (this.state.day !== this.clock.day) {
      this.state.day = this.clock.day;
      this.state.nodes = {};
    }
    this.state.nodes ||= {};
  }

  getNodeState(id) { return this.state.nodes[id] ||= { hits: 0, depleted: false }; }

  getNode(id) {
    const definition = this.definitions.find(node => node.id === id);
    return definition ? new ResourceNode(definition, this.getNodeState(id)) : null;
  }

  getTargets() {
    return this.definitions.filter(node => !this.getNodeState(node.id).depleted)
      .map(node => ({ ...node, type: 'resource', priority: 52,
        prompt: `${node.type === 'mining' ? 'Tambang batu' : 'Kumpulkan bahan'} [E]` }));
  }

  interact(id) {
    this.onNewDay();
    const definition = this.definitions.find(node => node.id === id);
    if (!definition) return { success: false, message: 'Sumber daya tidak dikenal.' };
    const node = this.getNodeState(id);
    if (node.depleted) return { success: false, message: 'Sudah diambil hari ini. Kembali besok.' };
    if (node.hits + 1 < definition.hits) {
      node.hits++;
      EventBus.emit(EVENTS.SAVE_REQUESTED, { reason: 'mining_hit' });
      return { success: true, message: `Batu mulai retak (${node.hits}/${definition.hits}).` };
    }
    return inventoryTransaction(this.inventory, this.wallet, {
      outputs: [{ itemId: definition.itemId, count: definition.count }],
      commit: () => { node.hits = definition.hits; node.depleted = true; }
    });
  }
}
