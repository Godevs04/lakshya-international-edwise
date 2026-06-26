export interface PartnerOption {
  _id: string;
  companyName: string;
}

export function mergePartnerOptions(
  partners: PartnerOption[],
  selectedId?: string,
  selectedName?: string
): PartnerOption[] {
  if (!selectedId || partners.some((partner) => partner._id === selectedId)) {
    return partners;
  }

  if (selectedName) {
    return [...partners, { _id: selectedId, companyName: selectedName }];
  }

  return partners;
}
