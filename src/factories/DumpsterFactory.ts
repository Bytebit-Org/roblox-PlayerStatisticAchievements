import { Dumpster } from "@rbxts/dumpster";
import { GenericFactory } from "./GenericFactory";

export type DumpsterFactory = GenericFactory<Dumpster, () => Dumpster>;
export const DumpsterFactoryInstance = new GenericFactory<Dumpster, () => Dumpster>(() => new Dumpster());
