// legacy entry point – the real logic lives under utils so that other
// modules can import from a centralized, self‑contained “battleMechanics”
// file without dragging in unrelated helpers.

export * from './utils/battleMechanics';
