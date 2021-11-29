export const CONDITION_NI = "NI";
export const CONDITION_FLU = "Flu";

export const conditionName = (c) => ({
  CONDITION_NI: "Non-infected",
  CONDITION_FLU: "Flu",
}[c] ?? "Unknown");
