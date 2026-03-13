export const TYPE_COLORS: Record<string, string> = {
  Normal:   'bg-slate-500 border-slate-400',
  Fire:     'bg-orange-600 border-orange-400',
  Water:    'bg-blue-600 border-blue-400',
  Grass:    'bg-green-600 border-green-400',
  Electric: 'bg-yellow-500 border-yellow-300',
  Ice:      'bg-cyan-500 border-cyan-300',
  Fighting: 'bg-red-700 border-red-500',
  Poison:   'bg-purple-600 border-purple-400',
  Ground:   'bg-amber-700 border-amber-500',
  Flying:   'bg-indigo-500 border-indigo-300',
  Psychic:  'bg-pink-600 border-pink-400',
  Bug:      'bg-lime-600 border-lime-400',
  Rock:     'bg-stone-600 border-stone-400',
  Ghost:    'bg-violet-800 border-violet-500',
  Dragon:   'bg-indigo-700 border-indigo-500',
  Dark:     'bg-slate-800 border-slate-600',
  Steel:    'bg-slate-400 border-slate-300',
  Fairy:    'bg-rose-400 border-rose-300',
};

export const getTypeColor = (type: string): string =>
  TYPE_COLORS[type] ?? 'bg-slate-700 border-white/10';
