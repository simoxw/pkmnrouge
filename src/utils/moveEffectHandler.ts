import { BattlePokemon, Move, Type, StatusCondition, Stats } from '../types';
import { getTypeEffectiveness } from '../battleLogic';

export enum MoveCategory {
  DAMAGE = 'damage',
  HEALING = 'healing',
  STAT_BUFF = 'stat_buff',
  STAT_DEBUFF = 'stat_debuff',
  STATUS_ONLY = 'status_only',
  DAMAGE_STATUS = 'damage_status',
  DAMAGE_DEBUFF = 'damage_debuff'
}

export interface MoveEffectResult {
  damage?: number;
  healing?: number;
  statChanges?: { stat: keyof Stats; change: number; target: 'user' | 'opponent' }[];
  statusApplied?: { status: StatusCondition; target: 'user' | 'opponent' };
  messages: string[];
  effectiveness?: number;
  isCritical?: boolean;
  isMiss?: boolean;
}

export class MoveEffectHandler {
  static categorizeMove(move: Move): MoveCategory {
    // Status moves (no damage)
    if (move.damageClass === 'status') {
      if (move.statChanges && move.statChanges.length > 0) {
        // Check if it's buff or debuff based on target
        const hasBuff = move.statChanges.some(sc => sc.change > 0 && move.target === 'user');
        const hasDebuff = move.statChanges.some(sc => sc.change < 0 && move.target !== 'user');
        if (hasBuff) return MoveCategory.STAT_BUFF;
        if (hasDebuff) return MoveCategory.STAT_DEBUFF;
      }
      if (move.ailment) {
        return MoveCategory.STATUS_ONLY;
      }
      // Healing moves
      if (this.isHealingMove(move)) {
        return MoveCategory.HEALING;
      }
    }

    // Damage moves with additional effects
    if (move.damageClass !== 'status' && move.power > 0) {
      if (move.ailment) {
        return MoveCategory.DAMAGE_STATUS;
      }
      if (move.statChanges && move.statChanges.length > 0) {
        return MoveCategory.DAMAGE_DEBUFF;
      }
      return MoveCategory.DAMAGE;
    }

    return MoveCategory.DAMAGE; // fallback
  }

  private static isHealingMove(move: Move): boolean {
    const healingMoves = ['Rest', 'Synthesis', 'Roost', 'Wish', 'Milk Drink', 'Soft-Boiled'];
    return healingMoves.includes(move.name);
  }

  static processMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const category = this.categorizeMove(move);
    const result: MoveEffectResult = { messages: [] };

    switch (category) {
      case MoveCategory.DAMAGE:
        return this.processDamageMove(attacker, defender, move);

      case MoveCategory.HEALING:
        return this.processHealingMove(attacker, move);

      case MoveCategory.STAT_BUFF:
        return this.processStatBuffMove(attacker, move);

      case MoveCategory.STAT_DEBUFF:
        return this.processStatDebuffMove(attacker, defender, move);

      case MoveCategory.STATUS_ONLY:
        return this.processStatusOnlyMove(attacker, defender, move);

      case MoveCategory.DAMAGE_STATUS:
        return this.processDamageStatusMove(attacker, defender, move);

      case MoveCategory.DAMAGE_DEBUFF:
        return this.processDamageDebuffMove(attacker, defender, move);

      default:
        return result;
    }
  }

  private static processDamageMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const result = this.calculateDamage(attacker, defender, move);
    result.messages.push(`${attacker.name} usa ${move.name}!`);
    return result;
  }

  private static processHealingMove(attacker: BattlePokemon, move: Move): MoveEffectResult {
    let healing = 0;
    const messages: string[] = [];

    if (move.name === 'Rest') {
      healing = attacker.maxHp; // Full heal
      messages.push(`${attacker.name} si riposa e recupera tutti gli HP!`);
      messages.push(`${attacker.name} si è addormentato!`);
      return {
        healing,
        statusApplied: { status: 'SLP', target: 'user' },
        messages
      };
    } else {
      // Synthesis, Roost, etc. - 50% heal
      healing = Math.floor(attacker.maxHp / 2);
      messages.push(`${attacker.name} usa ${move.name} e recupera HP!`);
    }

    return { healing, messages };
  }

  private static processStatBuffMove(attacker: BattlePokemon, move: Move): MoveEffectResult {
    const messages: string[] = [`${attacker.name} usa ${move.name}!`];
    const statChanges: { stat: keyof Stats; change: number; target: 'user' | 'opponent' }[] = [];

    if (move.statChanges) {
      move.statChanges.forEach(sc => {
        statChanges.push({ ...sc, target: 'user' });
        const statName = this.getStatDisplayName(sc.stat);
        const changeText = sc.change > 0 ? 'aumentato' : 'diminuito';
        messages.push(`${statName} di ${attacker.name} è ${changeText}!`);
      });
    }

    return { statChanges, messages };
  }

  private static processStatDebuffMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const messages: string[] = [`${attacker.name} usa ${move.name}!`];
    const statChanges: { stat: keyof Stats; change: number; target: 'user' | 'opponent' }[] = [];

    if (move.statChanges) {
      move.statChanges.forEach(sc => {
        statChanges.push({ ...sc, target: 'opponent' });
        const statName = this.getStatDisplayName(sc.stat);
        const changeText = sc.change > 0 ? 'aumentato' : 'diminuito';
        messages.push(`${statName} di ${defender.name} è ${changeText}!`);
      });
    }

    return { statChanges, messages };
  }

  private static processStatusOnlyMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const messages: string[] = [`${attacker.name} usa ${move.name}!`];

    if (move.ailment) {
      const chance = move.ailmentChance || 100;
      if (Math.random() * 100 < chance) {
        const status = this.mapAilmentToStatus(move.ailment);
        if (status) {
          const target = move.target === 'user' ? 'user' : 'opponent';
          const targetName = target === 'user' ? attacker.name : defender.name;
          messages.push(`${targetName} è ${this.getStatusDisplayText(status)}!`);
          return {
            statusApplied: { status, target },
            messages
          };
        }
      } else {
        messages.push(`${attacker.name} ha fallito!`);
      }
    }

    return { messages };
  }

  private static processDamageStatusMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const result = this.calculateDamage(attacker, defender, move);
    result.messages.push(`${attacker.name} usa ${move.name}!`);

    // Chance to apply status
    if (move.ailment) {
      const chance = move.ailmentChance || 10;
      if (Math.random() * 100 < chance) {
        const status = this.mapAilmentToStatus(move.ailment);
        if (status) {
          result.messages.push(`${defender.name} è ${this.getStatusDisplayText(status)}!`);
          result.statusApplied = { status, target: 'opponent' };
        }
      }
    }

    return result;
  }

  private static processDamageDebuffMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const result = this.calculateDamage(attacker, defender, move);
    result.messages.push(`${attacker.name} usa ${move.name}!`);

    // Chance to apply stat debuff
    if (move.statChanges) {
      const chance = move.ailmentChance || 10;
      if (Math.random() * 100 < chance) {
        const statChanges: { stat: keyof Stats; change: number; target: 'user' | 'opponent' }[] = [];
        move.statChanges.forEach(sc => {
          statChanges.push({ ...sc, target: 'opponent' });
          const statName = this.getStatDisplayName(sc.stat);
          result.messages.push(`${statName} di ${defender.name} è diminuito!`);
        });
        result.statChanges = statChanges;
      }
    }

    return result;
  }

  private static calculateDamage(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    // Check accuracy
    if (Math.random() * 100 > move.accuracy) {
      return { isMiss: true, messages: [`L'attacco di ${attacker.name} è fallito!`] };
    }

    const level = attacker.level || 50;

    // Get attack and defense based on damage class
    let A: number, D: number;
    if (move.damageClass === 'physical') {
      A = attacker.actualStats.attack;
      D = defender.actualStats.defense;
      // Burn reduces physical attack
      if (attacker.status === 'BRN') {
        A = Math.floor(A / 2);
      }
    } else {
      A = attacker.actualStats.spAtk;
      D = defender.actualStats.spDef;
    }

    const baseDamage = (((2 * level / 5 + 2) * move.power * (A / D)) / 50 + 2);

    // Random multiplier (0.85-1.0)
    const random = 0.85 + Math.random() * 0.15;

    // STAB (Same Type Attack Bonus)
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;

    // Type effectiveness
    let effectiveness = 1;
    defender.types.forEach(type => {
      effectiveness *= getTypeEffectiveness(move.type, type);
    });

    // Critical hit (6.25% chance)
    const isCritical = Math.random() < 0.0625;
    const critMultiplier = isCritical ? 2 : 1;

    const finalDamage = Math.floor(baseDamage * random * stab * effectiveness * critMultiplier);

    const result: MoveEffectResult = {
      damage: finalDamage,
      effectiveness,
      isCritical,
      messages: []
    };

    // Add effectiveness messages
    if (effectiveness > 1) {
      result.messages.push('È superefficace!');
    } else if (effectiveness < 1 && effectiveness > 0) {
      result.messages.push('Non è molto efficace...');
    } else if (effectiveness === 0) {
      result.messages.push('Non ha effetto...');
    }

    if (isCritical) {
      result.messages.push('Brutto colpo!');
    }

    return result;
  }

  private static mapAilmentToStatus(ailment: string): StatusCondition | null {
    const statusMap: Record<string, StatusCondition> = {
      'paralysis': 'PAR',
      'burn': 'BRN',
      'poison': 'PSN',
      'sleep': 'SLP',
      'freeze': 'FRZ'
    };
    return statusMap[ailment] || null;
  }

  private static getStatusDisplayText(status: StatusCondition): string {
    const statusTexts: Record<StatusCondition, string> = {
      'PAR': 'paralizzato',
      'BRN': 'scottato',
      'PSN': 'avvelenato',
      'SLP': 'addormentato',
      'FRZ': 'congelato'
    };
    return statusTexts[status] || status;
  }

  private static getStatDisplayName(stat: keyof Stats): string {
    const statNames: Record<keyof Stats, string> = {
      hp: 'PS',
      attack: 'Attacco',
      defense: 'Difesa',
      spAtk: 'Attacco Speciale',
      spDef: 'Difesa Speciale',
      speed: 'Velocità'
    };
    return statNames[stat] || stat;
  }

  // Check if pokemon can act due to status conditions
  static canAct(pokemon: BattlePokemon): { canAct: boolean; messages: string[] } {
    if (pokemon.status === 'SLP') {
      if (pokemon.sleepTurns && pokemon.sleepTurns > 0) {
        return {
          canAct: false,
          messages: [`${pokemon.name} sta dormendo profondamente...`]
        };
      } else {
        // Wake up
        return {
          canAct: true,
          messages: [`${pokemon.name} si è svegliato!`]
        };
      }
    }

    if (pokemon.status === 'FRZ') {
      if (Math.random() < 0.2) {
        return {
          canAct: true,
          messages: [`${pokemon.name} si è scongelato!`]
        };
      } else {
        return {
          canAct: false,
          messages: [`${pokemon.name} è congelato!`]
        };
      }
    }

    if (pokemon.status === 'PAR' && Math.random() < 0.25) {
      return {
        canAct: false,
        messages: [`${pokemon.name} è paralizzato! Non riesce a muoversi!`]
      };
    }

    return { canAct: true, messages: [] };
  }

  // Process a turn for a pokemon, including status checks and move execution
  static processTurn(attacker: BattlePokemon, defender: BattlePokemon, move: Move): { 
    effectResult?: MoveEffectResult; 
    statusResult: { canAct: boolean; messages: string[]; statusCleared?: boolean } 
  } {
    const statusCheck = this.canAct(attacker);
    
    if (!statusCheck.canAct) {
      return { statusResult: { ...statusCheck, statusCleared: false } };
    }

    // Clear status if applicable (waking up, thawing)
    const statusCleared = statusCheck.messages.some(msg => 
      msg.includes('svegliato') || msg.includes('scongelato')
    );

    const effectResult = this.processMove(attacker, defender, move);
    
    return { 
      effectResult, 
      statusResult: { 
        canAct: true, 
        messages: statusCheck.messages,
        statusCleared 
      } 
    };
  }

  // Apply status effects to stats
  static applyStatusEffects(pokemon: BattlePokemon): Stats {
    const stats = { ...pokemon.actualStats };

    if (pokemon.status === 'PAR') {
      stats.speed = Math.floor(stats.speed / 2);
    }

    return stats;
  }

  // Apply end of turn effects (damage from status conditions)
  static applyEndOfTurnEffects(pokemon: BattlePokemon): { damage: number; messages: string[] } {
    let damage = 0;
    const messages: string[] = [];

    if (pokemon.status === 'PSN' || pokemon.status === 'BRN') {
      damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
      const statusText = pokemon.status === 'PSN' ? 'veleno' : 'scottatura';
      messages.push(`Il ${statusText} danneggia ${pokemon.name}!`);
    }

    return { damage, messages };
  }
}