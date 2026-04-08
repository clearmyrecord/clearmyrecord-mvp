import { OH_MODULE } from "../states/OH/config.js";
import { NV_MODULE } from "../states/NV/config.js";

export const STATE_REGISTRY = {
  OH: OH_MODULE,
  NV: NV_MODULE
};

export function getStateModule(stateCode) {
  if (!stateCode) {
    throw new Error("Missing case state.");
  }

  const normalized = String(stateCode).toUpperCase().trim();
  const module = STATE_REGISTRY[normalized];

  if (!module) {
    throw new Error(`Unsupported state: ${normalized}`);
  }

  return module;
}
