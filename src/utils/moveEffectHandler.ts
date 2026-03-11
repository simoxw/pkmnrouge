import { BattlePokemon, Move, Type, StatusCondition, Stats } from '../types';
import { getTypeEffectiveness } from './battleMechanics';
import { getStatWithStage, calculateDamage } from './battleMechanics';

export enum MoveCategory {
  DAMAGE = 'damage',
  HEALING = 'healing',
  STAT_BUFF = 'stat_buff',
  STAT_DEBUFF = 'stat_debuff',
  STATUS_ONLY = 'status_only',
  DAMAGE_STATUS = 'damage_status',
  DAMAGE_DEBUFF = 'damage_debuff',
  DRAIN = 'drain',
  NO_EFFECT = 'no_effect'
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
    if (move.damageClass === 'status') {
      if (this.isHealingMove(move)) return MoveCategory.HEALING;
      if (move.statChanges && move.statChanges.length > 0) {
        const hasPositive = move.statChanges.some(sc => sc.change > 0);
        return hasPositive ? MoveCategory.STAT_BUFF : MoveCategory.STAT_DEBUFF;
      }
      if (move.ailment) return MoveCategory.STATUS_ONLY;
      return MoveCategory.NO_EFFECT;
    }
    if (move.power > 0) {
      if (this.isDrainMove(move)) return MoveCategory.DRAIN;
      if (move.ailment) return MoveCategory.DAMAGE_STATUS;
      if (move.statChanges && move.statChanges.length > 0) return MoveCategory.DAMAGE_DEBUFF;
      return MoveCategory.DAMAGE;
    }
    return MoveCategory.NO_EFFECT;
  }

  private static isHealingMove(move: Move): boolean {
    const healingMoveIds = [
      'rest','recover','synthesis','roost','wish',
      'milk-drink','soft-boiled','moonlight','morning-sun',
      'slack-off','healing-wish','jungle-healing','life-dew',
      'shore-up','strength-sap',
    ];
    return healingMoveIds.includes(move.id);
  }

  private static isDrainMove(move: Move): boolean {
    const drainMoveIds = [
      'absorb','mega-drain','giga-drain','leech-life',
      'drain-punch','dream-eater','horn-leech','oblivion-wing',
    ];
    return drainMoveIds.includes(move.id);
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

      case MoveCategory.DRAIN:
        return this.processDrainMove(attacker, defender, move);

      case MoveCategory.NO_EFFECT:
        return { messages: [`${attacker.name} usa ${move.name}... senza effetto!`] };

      default:
        return result;
    }
  }

  private static processDamageMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const dmgResult = calculateDamage(attacker, defender, move);
    const result: MoveEffectResult = { ...dmgResult, messages: [] };
    result.messages.push(`${attacker.name} usa ${move.name}!`);
    return result;
  }

  private static processDrainMove(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: Move
  ): MoveEffectResult {
    const dmgResult = calculateDamage(attacker, defender, move);
    const healing = Math.floor((dmgResult.damage || 0) / 2);
    return {
      ...dmgResult,
      healing,
      messages: [
        `${attacker.name} usa ${move.name}!`,
        healing > 0 ? `${attacker.name} ha assorbito ${healing} PS!` : '',
      ].filter(Boolean),
    };
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
        // I buff vanno sempre su se stesso (user)
        statChanges.push({ ...sc, target: 'user', change: Math.abs(sc.change) });
        const statName = this.getStatDisplayName(sc.stat);
        const changeStages = Math.abs(sc.change);
        messages.push(`${statName} di ${attacker.name} è aumentato di ${changeStages} ${changeStages === 1 ? 'stadio' : 'stadi'}!`);
      });
    }

    return { statChanges, messages };
  }

  private static processStatDebuffMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const messages: string[] = [`${attacker.name} usa ${move.name}!`];
    const statChanges: { stat: keyof Stats; change: number; target: 'user' | 'opponent' }[] = [];

    if (move.statChanges) {
      move.statChanges.forEach(sc => {
        // I debuff vanno sull'avversario (opponent)
        statChanges.push({ ...sc, target: 'opponent', change: -Math.abs(sc.change) });
        const statName = this.getStatDisplayName(sc.stat);
        const changeStages = Math.abs(sc.change);
        messages.push(`${statName} di ${defender.name} è diminuito di ${changeStages} ${changeStages === 1 ? 'stadio' : 'stadi'}!`);
      });
    }

    return { statChanges, messages };
  }

  private static isImmuneToStatus(
    pokemon: BattlePokemon,
    status: StatusCondition
  ): boolean {
    switch (status) {
      case 'BRN': return pokemon.types.includes(Type.FIRE);
      case 'PAR': return pokemon.types.includes(Type.ELECTRIC);
      case 'FRZ': return pokemon.types.includes(Type.ICE);
      case 'PSN': return pokemon.types.includes(Type.POISON)
        || pokemon.types.includes(Type.STEEL);
      default: return false;
    }
  }

  private static processStatusOnlyMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const messages: string[] = [`${attacker.name} usa ${move.name}!`];

    if (move.ailment) {
      const chance = move.ailmentChance || 100;
      if (Math.random() * 100 < chance) {
        const status = this.mapAilmentToStatus(move.ailment);
        if (status) {
          // Determina il target: se target contiene "self" o "user", è su se stesso, altrimenti sull'avversario
          const targetIsSelf = move.target === 'user' || move.target === 'self';
          const target = targetIsSelf ? 'user' : 'opponent';
          const targetName = target === 'user' ? attacker.name : defender.name;
          const targetPokemon = target === 'user' ? attacker : defender;

          if (this.isImmuneToStatus(targetPokemon, status)) {
            messages.push(`Non ha effetto su ${targetPokemon.name}!`);
            return { messages };
          }

          messages.push(`${targetName} è ${this.getStatusDisplayText(status)}!`);
          return {
            statusApplied: { status, target },
            messages
          };
        }
      } else {
        messages.push(`L'attacco di ${attacker.name} ha fallito!`);
      }
    }

    return { messages };
  }

  private static processDamageStatusMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const dmgResult = calculateDamage(attacker, defender, move);
    const result: MoveEffectResult = { ...dmgResult, messages: [] };
    result.messages.push(`${attacker.name} usa ${move.name}!`);

    // Se la mossa non ha effetto, non applicare stati alterati
    if (dmgResult.effectiveness === 0) return result;

    // Chance to apply status
    if (move.ailment) {
      const chance = move.ailmentChance || 10;
      if (Math.random() * 100 < chance) {
        const status = this.mapAilmentToStatus(move.ailment);
        if (status) {
          if (this.isImmuneToStatus(defender, status)) {
            // Se immune, non aggiungiamo lo status e non diamo messaggi (solitamente silenzioso in damage+status)
            return result;
          }
          result.messages.push(`${defender.name} è ${this.getStatusDisplayText(status)}!`);
          result.statusApplied = { status, target: 'opponent' };
        }
      }
    }

    return result;
  }

  private static processDamageDebuffMove(attacker: BattlePokemon, defender: BattlePokemon, move: Move): MoveEffectResult {
    const dmgResult = calculateDamage(attacker, defender, move);
    const result: MoveEffectResult = { ...dmgResult, messages: [] };
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

  // Apply status effects (checks only, non modifica le stats permanenti)
  // La paralisi riduce la velocità al momento del calcolo, non modifica actualStats
  static applyStatusEffects(pokemon: BattlePokemon): Stats {
    // Ritorna le stat attuali senza mutazioni - gli speed stages vengono applicati
    // al momento del calcolo della velocità in BattleEngine tramite getStatWithStage
    return { ...pokemon.actualStats };
  }

  // Apply end of turn effects (damage from status conditions)
  static applyEndOfTurnEffects(pokemon: BattlePokemon): { damage: number; messages: string[] } {
    let damage = 0;
    const messages: string[] = [];

    if (pokemon.status === 'PSN' || pokemon.status === 'BRN') {
      damage = Math.max(1, Math.floor(pokemon.maxHp / 8));
      const statusText = pokemon.status === 'PSN' ? 'veleno' : 'scottatura';
      messages.push(`Il ${statusText} danneggia ${pokemon.name}!`);
    }

    return { damage, messages };
  }
}