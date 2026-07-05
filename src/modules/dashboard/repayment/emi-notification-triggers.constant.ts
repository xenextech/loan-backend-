// Rule set for when EMI reminder notifications fire — not admin-editable
// data, so this lives as config rather than a DB model.
//
// offsetDays is relative to an entry's dueDate: negative = days before due
// (reminder), positive = days after due (overdue escalation). Triggers with
// no offsetDays (e.g. document expiry) aren't tied to an EMI due date and
// are excluded from the cron's date-matching, kept only for display via
// getNotificationTriggers().
export interface EmiNotificationTrigger {
  trigger: string;
  messageType: string;
  offsetDays?: number;
}

export const EMI_NOTIFICATION_TRIGGERS: EmiNotificationTrigger[] = [
  {
    trigger: '1 month',
    messageType: 'EMI due reminder (soft)',
    offsetDays: -30,
  },
  {
    trigger: '15 days',
    messageType: 'EMI due reminder (medium)',
    offsetDays: -15,
  },
  {
    trigger: '7 days',
    messageType: 'EMI due reminder (urgent)',
    offsetDays: -7,
  },
  {
    trigger: '4 days',
    messageType: 'Action required reminder',
    offsetDays: -4,
  },
  {
    trigger: '3 days',
    messageType: 'Final reminder before due',
    offsetDays: -3,
  },
  {
    trigger: '2 days',
    messageType: 'Urgent — pay to avoid penalty',
    offsetDays: -2,
  },
  { trigger: '1 day', messageType: 'Tomorrow is EMI day', offsetDays: -1 },
  {
    trigger: 'Day 1 OD',
    messageType: 'Overdue — penal interest starts',
    offsetDays: 1,
  },
  {
    trigger: 'Day 7 OD',
    messageType: 'Escalation + guarantor notice',
    offsetDays: 7,
  },
  { trigger: 'Doc expiry', messageType: 'Document / insurance expiry alert' },
];
