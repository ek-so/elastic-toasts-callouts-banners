/**
 * Stable layout region markers for banner / callout / toast specimens.
 * Use on the outer `div` of each region so structure is obvious in DOM and tests.
 */
export const notificationSlots = {
  /** Outermost banner / callout / toast surface (border, padding, stripe, etc.). */
  root: 'notification-root',
  /** Padded frame around the semantic status icon (callout + toast). */
  iconBox: 'notification-icon-box',
  textBox: 'notification-text-box',
  textWrapper: 'notification-text-wrapper',
  buttonBox: 'notification-button-box',
  contentBox: 'notification-content-box',
  imageBox: 'notification-image-box',
} as const;
