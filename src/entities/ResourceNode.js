/** A resource's static definition paired with its persistent daily damage state. */
export class ResourceNode {
  constructor(definition, state) { this.definition = definition; this.state = state; }

  get textureKey() {
    if (this.definition.type !== 'mining') return this.definition.textureKey;
    return this.state.depleted ? 'ore_node_depleted' : this.state.hits > 0 ? 'ore_node_cracked' : 'ore_node_intact';
  }

  get available() { return !this.state.depleted; }

  serialize() { return { ...this.state }; }
}
