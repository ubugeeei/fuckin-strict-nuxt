import type { UoW, CreateUoW } from "./uow.def";

export type { UoW } from "./uow.def";

/*
 *
 * UoW
 *
 */

export const createUoW: CreateUoW = (bus) => {
  const events: UoW["events"] = [];
  return {
    events,
    commit: () => {
      events.forEach((e) => bus.publish(e));
      events.length = 0;
    },
  };
};
