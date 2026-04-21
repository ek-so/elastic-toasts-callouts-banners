import { css } from '@emotion/react';
import { EuiFlexGroup, EuiFlexItem, EuiIcon, useEuiTheme } from '@elastic/eui';
import type { ReactNode } from 'react';

import { notificationSlots } from './notificationSlots';

export type NotificationSemanticColor = 'success' | 'warning' | 'danger' | 'neutral';

function notificationStatusIconType(color: NotificationSemanticColor): string {
  switch (color) {
    case 'success':
      return 'checkCircle';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'error';
    case 'neutral':
      return 'info';
  }
}

function notificationStatusIconColor(
  color: NotificationSemanticColor
): 'success' | 'warning' | 'danger' | 'primary' {
  return color === 'neutral' ? 'primary' : color;
}

function iconSlotCssFor(slotPx: 16 | 20) {
  return css`
    width: ${slotPx}px;
    height: ${slotPx}px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;

    .euiIcon,
    .euiIcon svg {
      width: ${slotPx}px !important;
      height: ${slotPx}px !important;
    }
  `;
}

/**
 * Padded cell around the glyph: `border.width.thick` (2px at default scale) top/bottom, no horizontal inset.
 */
export function NotificationIconBox({ children }: { children: ReactNode }) {
  const { euiTheme } = useEuiTheme();
  return (
    <span
      data-slot={notificationSlots.iconBox}
      css={css`
        box-sizing: border-box;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding-block: ${euiTheme.border.width.thick};
        padding-inline: 0;
        line-height: 0;
      `}
    >
      {children}
    </span>
  );
}

/** Status icon (`EuiIcon`); **20×20** when `slotPx={20}` (toast + M callout), **16×16** when `slotPx={16}` (S callout). */
export function NotificationStatusIcon({
  color,
  slotPx = 16,
}: {
  color: NotificationSemanticColor;
  slotPx?: 16 | 20;
}) {
  return (
    <span css={iconSlotCssFor(slotPx)}>
      <EuiIcon
        type={notificationStatusIconType(color)}
        color={notificationStatusIconColor(color)}
        size="m"
        aria-hidden
      />
    </span>
  );
}

/**
 * Lead row: semantic status icon in {@link NotificationIconBox}, then a content region (`children`: title, body, actions, etc.).
 * Icon-to-copy gap is always `size.s` (8px at default scale) for M, S, and toast.
 */
export function NotificationIconLead({
  color,
  iconSlotPx,
  children,
}: {
  color: NotificationSemanticColor;
  iconSlotPx: 16 | 20;
  children: ReactNode;
}) {
  const { euiTheme } = useEuiTheme();
  return (
    <EuiFlexGroup
      responsive={false}
      direction="row"
      gutterSize="none"
      alignItems="flexStart"
      justifyContent="flexStart"
      css={css`
        min-width: 0;
        column-gap: ${euiTheme.size.s};
      `}
    >
      <EuiFlexItem grow={false}>
        <NotificationIconBox>
          <NotificationStatusIcon color={color} slotPx={iconSlotPx} />
        </NotificationIconBox>
      </EuiFlexItem>
      <EuiFlexItem
        grow
        css={{
          minWidth: 0,
          alignSelf: 'stretch',
        }}
      >
        {children}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
