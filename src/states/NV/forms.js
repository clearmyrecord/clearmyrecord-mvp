const NV_CHARGES = [
  { label: "Possession of Controlled Substance", statute: "NRS 453" },
  { label: "Petit Larceny", statute: "NRS 205.240" },
  { label: "Trespass", statute: "NRS 207.200" },
  { label: "Disorderly Conduct", statute: "NRS 203.010" }
];

export function getChargeOptions() {
  return NV_CHARGES;
}
