import type { GroupedAttributes } from "./grouped-attributes";

export type AttributeKey =
  | keyof GroupedAttributes["goalkeeping"]
  | keyof GroupedAttributes["technical"]
  | keyof GroupedAttributes["mental"]
  | keyof GroupedAttributes["physical"];

export type AttributeWeights = Partial<Record<AttributeKey, number>>;

export interface WeightProfile {
  id: string;
  name: string;
  description?: string;
  weights: AttributeWeights;
}
