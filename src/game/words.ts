/**
 * Curated vocabulary banks for TypeStrike.
 * Includes short, medium, long, space combat, and code/tech terms.
 */

export type Difficulty = 'easy' | 'normal' | 'hard' | 'code';
export type GameMode = 'survival' | 'waves' | 'time_attack';

export const SHORT_WORDS = [
  'ace', 'aim', 'air', 'arc', 'arm', 'ash', 'axe', 'bad', 'bag', 'ban',
  'bar', 'bat', 'bay', 'beam', 'bee', 'bell', 'bind', 'bit', 'blip', 'blow',
  'blue', 'boat', 'bolt', 'bomb', 'bond', 'boom', 'boot', 'boss', 'burn', 'buzz',
  'calm', 'camp', 'card', 'care', 'case', 'cast', 'chip', 'city', 'clap', 'clay',
  'clip', 'club', 'coal', 'code', 'coil', 'coin', 'cold', 'comb', 'cook', 'cool',
  'cope', 'cord', 'core', 'cork', 'corn', 'crew', 'crop', 'crow', 'cube', 'cure',
  'curl', 'cute', 'dash', 'data', 'dawn', 'dead', 'deal', 'deck', 'deed', 'deep',
  'desk', 'dial', 'dirt', 'disc', 'dock', 'dome', 'door', 'dose', 'dot', 'drag',
  'draw', 'drip', 'drop', 'drum', 'dual', 'duck', 'dust', 'duty', 'echo', 'edge',
  'emit', 'epic', 'exit', 'fade', 'fail', 'fake', 'fall', 'fast', 'fate', 'feed',
  'file', 'fill', 'film', 'fire', 'fish', 'flag', 'flow', 'flux', 'foam', 'foil',
  'fold', 'folk', 'font', 'food', 'fuel', 'full', 'fume', 'fund', 'fuse', 'fury',
  'gain', 'game', 'gang', 'gear', 'gift', 'glow', 'glue', 'goal', 'gold', 'golf',
  'grid', 'grip', 'grow', 'halo', 'halt', 'hard', 'hash', 'hawk', 'head', 'heal',
  'heat', 'helm', 'hero', 'hide', 'hill', 'hint', 'hive', 'hold', 'hole', 'hook',
  'hope', 'horn', 'host', 'hour', 'hull', 'hunt', 'hymn', 'icon', 'idea', 'iron',
  'item', 'jade', 'jail', 'jazz', 'jeep', 'join', 'joke', 'jump', 'junk', 'jury',
  'keen', 'keep', 'kick', 'kill', 'kind', 'king', 'kite', 'knot', 'lace', 'lamp',
  'land', 'lane', 'laser', 'lava', 'lead', 'leaf', 'leak', 'lens', 'lift', 'limb',
  'lime', 'line', 'link', 'lion', 'lips', 'list', 'load', 'lock', 'loft', 'log',
  'loop', 'lord', 'luck', 'lung', 'lure', 'lurk', 'lush', 'mail', 'main', 'mark',
  'mask', 'mast', 'mate', 'maze', 'meal', 'melt', 'memo', 'mesh', 'mild', 'mine',
  'mint', 'mist', 'mode', 'mold', 'moon', 'moss', 'move', 'myth', 'nail', 'navy',
  'near', 'neat', 'neon', 'nest', 'node', 'nova', 'oath', 'odor', 'omen', 'open',
  'orbit', 'pack', 'page', 'pale', 'palm', 'park', 'pass', 'path', 'peak', 'peer',
  'pelt', 'pick', 'pile', 'pill', 'pine', 'ping', 'pipe', 'plan', 'plug', 'plum',
  'plus', 'poem', 'pole', 'pond', 'pool', 'port', 'post', 'pour', 'prop', 'pulse',
  'pump', 'punk', 'pure', 'quiz', 'race', 'raft', 'raid', 'rail', 'rain', 'ramp',
  'rank', 'rare', 'ray', 'read', 'realm', 'reap', 'rear', 'reed', 'reef', 'reel',
  'rely', 'rent', 'rest', 'rice', 'rich', 'ride', 'rift', 'ring', 'riot', 'rise',
  'risk', 'road', 'roar', 'robe', 'rock', 'rod', 'role', 'roll', 'roof', 'root',
  'rope', 'rose', 'rout', 'ruin', 'rule', 'rush', 'rust', 'safe', 'sail', 'salt',
  'sand', 'save', 'scan', 'scar', 'seal', 'seed', 'seek', 'send', 'shed', 'ship',
  'shop', 'shot', 'show', 'side', 'sign', 'silk', 'sink', 'sire', 'site', 'size',
  'skin', 'skip', 'slab', 'slam', 'slap', 'slit', 'slot', 'slow', 'slug', 'smog',
  'snap', 'snow', 'soak', 'soap', 'soar', 'soil', 'solar', 'sole', 'song', 'soul',
  'span', 'spark', 'spin', 'spit', 'spot', 'spur', 'star', 'stem', 'step', 'stir',
  'stop', 'suit', 'surf', 'swan', 'swap', 'swim', 'sync', 'tact', 'tail', 'tank',
  'tape', 'task', 'team', 'tear', 'tech', 'tide', 'tile', 'time', 'tiny', 'toil',
  'toll', 'tone', 'tool', 'tops', 'tour', 'trap', 'tree', 'trim', 'trio', 'trip',
  'tube', 'tune', 'turf', 'twin', 'type', 'unit', 'vale', 'vane', 'vapor', 'vast',
  'veil', 'vein', 'vent', 'verb', 'vest', 'vibe', 'vice', 'view', 'vine', 'visa',
  'void', 'volt', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall', 'wand', 'ward',
  'warm', 'warp', 'wart', 'wary', 'wash', 'wasp', 'wave', 'wax', 'wear', 'weed',
  'week', 'weld', 'well', 'west', 'wild', 'will', 'wind', 'wine', 'wing', 'wink',
  'wire', 'wise', 'wish', 'wolf', 'wood', 'wool', 'word', 'work', 'worm', 'yard',
  'yarn', 'yawn', 'year', 'yell', 'yoga', 'yoke', 'zeal', 'zero', 'zinc', 'zone'
];

export const MEDIUM_WORDS = [
  'absorb', 'action', 'active', 'aerial', 'agency', 'agenda', 'airlock', 'aliens',
  'align', 'anchor', 'anthem', 'apollo', 'arcane', 'armada', 'armor', 'arrow',
  'aspect', 'assault', 'astral', 'atomic', 'aurora', 'avatar', 'avenue', 'barrel',
  'beacon', 'binary', 'blade', 'blaster', 'bounce', 'bounty', 'breach', 'bullet',
  'bunker', 'cannon', 'carbon', 'carrier', 'castle', 'catalyst', 'center', 'channel',
  'chrono', 'cipher', 'circuit', 'citadel', 'clash', 'client', 'climax', 'clutch',
  'cluster', 'comet', 'command', 'complex', 'conduit', 'control', 'copper', 'cosmos',
  'crater', 'crystal', 'current', 'custom', 'cyber', 'cyborg', 'dagger', 'danger',
  'defense', 'deploy', 'destiny', 'device', 'digital', 'dimension', 'direct', 'domain',
  'dragon', 'dynamo', 'eclipse', 'effect', 'element', 'empire', 'energy', 'engine',
  'entity', 'escape', 'escort', 'evolve', 'exodus', 'falcon', 'fathom', 'fighter',
  'flame', 'flash', 'flight', 'force', 'forge', 'fractal', 'frigate', 'fusion',
  'galaxy', 'gateway', 'glider', 'gravity', 'ground', 'guardian', 'gunner', 'hammer',
  'hazard', 'helios', 'horizon', 'hybrid', 'impact', 'infantry', 'infiltrate', 'input',
  'insight', 'invade', 'islands', 'javelin', 'joule', 'judgment', 'knight', 'kinetic',
  'launch', 'legacy', 'legend', 'legion', 'matrix', 'mecha', 'meteor', 'missile',
  'nebula', 'neutron', 'nexus', 'nozzle', 'nuclear', 'optics', 'orbital', 'outpost',
  'packet', 'patrol', 'payload', 'peril', 'photon', 'pioneer', 'planet', 'plasma',
  'portal', 'power', 'proton', 'pulsar', 'pulse', 'quantum', 'quasar', 'radar',
  'radiation', 'raptor', 'reactor', 'recon', 'relic', 'remote', 'rescue', 'robot',
  'rocket', 'roster', 'router', 'runner', 'saber', 'satellite', 'sector', 'sensor',
  'server', 'shadow', 'shield', 'signal', 'silicon', 'siren', 'socket', 'sonar',
  'spectral', 'specter', 'sphere', 'spiral', 'squad', 'starship', 'stealth', 'stellar',
  'strike', 'subway', 'surge', 'system', 'target', 'telecom', 'terminal', 'thermal',
  'thrust', 'titan', 'tracer', 'tracker', 'tractor', 'trigger', 'trooper', 'turbo',
  'turret', 'typhoon', 'ultra', 'vacuum', 'vector', 'velocity', 'vessel', 'vertex',
  'viper', 'vortex', 'voyage', 'vulcan', 'warden', 'warfare', 'warrior', 'weapon',
  'xenon', 'zenith', 'zeppelin', 'zipper'
];

export const HARD_WORDS = [
  'accelerator', 'ammunition', 'annihilation', 'antimatter', 'apocalypse', 'atmosphere',
  'astrophysics', 'autonomous', 'battleship', 'cataclysm', 'chronosphere', 'clandestine',
  'colosseum', 'constellation', 'counterstrike', 'cybernetic', 'decryption', 'demolition',
  'dreadnought', 'electromagnetic', 'encryption', 'equilibrium', 'extinction', 'fluorescence',
  'gravitational', 'gyroscope', 'heliocentric', 'hypervelocity', 'illumination', 'incinerator',
  'indestructible', 'interceptor', 'intergalactic', 'interstellar', 'jurisdiction', 'kaleidoscope',
  'luminescence', 'maneuverability', 'metamorphosis', 'microprocessor', 'nanotechnology', 'navigational',
  'neutralization', 'obliteration', 'omnipotent', 'oscillation', 'overwhelming', 'perpendicular',
  'photosynthesis', 'polytechnic', 'propulsion', 'reconnaissance', 'rejuvenation', 'resurrection',
  'revolutionary', 'scintillation', 'semiconductor', 'singularity', 'stratosphere', 'superconductor',
  'supernova', 'synchronization', 'technological', 'teleportation', 'thermonuclear', 'trajectory',
  'transformation', 'transmutation', 'transponder', 'unprecedented', 'vanguard', 'vulnerability',
  'wavelength', 'xenobiology'
];

export const CODE_WORDS = [
  'async', 'await', 'const', 'let', 'function', 'return', 'import', 'export',
  'default', 'class', 'extends', 'interface', 'type', 'boolean', 'string', 'number',
  'symbol', 'object', 'array', 'promise', 'resolve', 'reject', 'try', 'catch',
  'finally', 'throw', 'switch', 'break', 'case', 'continue', 'while', 'filter',
  'reduce', 'forEach', 'slice', 'splice', 'concat', 'push', 'unshift', 'length',
  'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'package', 'module',
  'server', 'router', 'express', 'database', 'payload', 'status', 'header', 'binary',
  'compile', 'runtime', 'canvas', 'request', 'response', 'socket', 'stream', 'buffer'
];

export interface PowerUpWord {
  word: string;
  type: 'emp' | 'freeze' | 'shield' | 'overdrive';
  label: string;
  description: string;
  color: string;
}

export const POWER_UPS: PowerUpWord[] = [
  { word: 'BLAST', type: 'emp', label: 'EMP BLAST', description: 'Clears all incoming threats', color: '#f59e0b' },
  { word: 'FREEZE', type: 'freeze', label: 'STASIS FREEZE', description: 'Slows enemies for 5s', color: '#06b6d4' },
  { word: 'SHIELD', type: 'shield', label: 'SHIELD REPAIR', description: 'Restores +1 Hull Integrity', color: '#10b981' },
  { word: 'HYPER', type: 'overdrive', label: 'HYPER OVERDRIVE', description: 'Double score & rapid blast', color: '#a855f7' }
];

export function getRandomWord(difficulty: Difficulty, activeWords: string[] = []): string {
  let list: string[];
  switch (difficulty) {
    case 'easy':
      list = SHORT_WORDS;
      break;
    case 'normal':
      list = Math.random() < 0.4 ? SHORT_WORDS : MEDIUM_WORDS;
      break;
    case 'hard':
      list = Math.random() < 0.35 ? MEDIUM_WORDS : HARD_WORDS;
      break;
    case 'code':
      list = CODE_WORDS;
      break;
    default:
      list = MEDIUM_WORDS;
  }

  // Find existing starting letters to minimize annoying collisions
  const usedStarters = new Set(activeWords.map(w => w.charAt(0).toLowerCase()));

  // Try candidate words whose first letter is unique among current targets
  const candidates = list.filter(w => !activeWords.includes(w) && !usedStarters.has(w.charAt(0).toLowerCase()));
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Fallback to any unused word
  const unused = list.filter(w => !activeWords.includes(w));
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }

  return list[Math.floor(Math.random() * list.length)];
}
