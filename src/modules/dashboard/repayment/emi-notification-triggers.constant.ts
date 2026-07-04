// Static rule set for when EMI reminder notifications fire — not admin-editable
// data, so this lives as config rather than a DB model.
export const EMI_NOTIFICATION_TRIGGERS = [
  { trigger: '1 month', messageType: 'EMI due reminder (soft)' },
  { trigger: '15 days', messageType: 'EMI due reminder (medium)' },
  { trigger: '7 days', messageType: 'EMI due reminder (urgent)' },
  { trigger: '4 days', messageType: 'Action required reminder' },
  { trigger: '3 days', messageType: 'Final reminder before due' },
  { trigger: '2 days', messageType: 'Urgent — pay to avoid penalty' },
  { trigger: '1 day', messageType: 'Tomorrow is EMI day' },
  { trigger: 'Day 1 OD', messageType: 'Overdue — penal interest starts' },
  { trigger: 'Day 7 OD', messageType: 'Escalation + guarantor notice' },
  { trigger: 'Doc expiry', messageType: 'Document / insurance expiry alert' },
];
