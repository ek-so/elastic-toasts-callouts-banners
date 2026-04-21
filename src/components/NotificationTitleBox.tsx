import { css } from '@emotion/react';
import { EuiFlexGroup, EuiFlexItem, EuiIcon, useEuiTheme } from '@elastic/eui';
import type { ReactNode } from 'react';

import { notificationSlots } from './notificationSlots';

export type NotificationSemanticColor = 'success' | 'warning' | 'danger' | 'neutral';

/** Custom filled art for specimen “Filled icons” toggle (served from `public/`). */
const FILLED_STATUS_INFO_SRC = '/notification-icons/filled-info.svg';
const FILLED_STATUS_WARNING_SRC = '/notification-icons/filled-warning.svg';

type EuiIconColor = 'success' | 'warning' | 'danger' | 'primary';

function notificationStatusIconProps(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: NotificationSemanticColor,
  filled: boolean
): { type: string; color?: EuiIconColor | string } {
  if (filled) {
    switch (color) {
      case 'success':
        return { type: 'checkCircleFill', color: euiTheme.colors.backgroundFilledSuccess };
      case 'warning':
        return { type: FILLED_STATUS_WARNING_SRC };
      case 'danger':
        return { type: 'errorFilled', color: euiTheme.colors.backgroundFilledDanger };
      case 'neutral':
        return { type: FILLED_STATUS_INFO_SRC };
    }
  }
  switch (color) {
    case 'success':
      return { type: 'checkCircle', color: notificationStatusIconColor(color) };
    case 'warning':
      return { type: 'warning', color: notificationStatusIconColor(color) };
    case 'danger':
      return { type: 'error', color: notificationStatusIconColor(color) };
    case 'neutral':
      return { type: 'info', color: notificationStatusIconColor(color) };
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
  filled = false,
}: {
  color: NotificationSemanticColor;
  slotPx?: 16 | 20;
  /** Filled: `backgroundFilled*` on EUI filled glyphs; custom SVGs for neutral/info and warning. */
  filled?: boolean;
}) {
  const { euiTheme } = useEuiTheme();
  const { type, color: iconColor } = notificationStatusIconProps(euiTheme, color, filled);
  return (
    <span css={iconSlotCssFor(slotPx)}>
      <EuiIcon type={type} color={iconColor} size="m" aria-hidden />
    </span>
  );
}

/**
 * Lead row: semantic status icon in {@link NotificationIconBox}, then a content region (`children`: title, body, actions, etc.).
 * `iconToCopyGap` defaults to `size.s` (8px); toasts and M callouts pass `size.m` (~12px).
 */
export function NotificationIconLead({
  color,
  iconSlotPx,
  iconToCopyGap,
  statusIconFilled = false,
  children,
}: {
  color: NotificationSemanticColor;
  iconSlotPx: 16 | 20;
  /** Horizontal space between icon box and copy; defaults to `euiTheme.size.s`. */
  iconToCopyGap?: string;
  /** Use filled status glyphs where available (toast / callout specimens). */
  statusIconFilled?: boolean;
  children: ReactNode;
}) {
  const { euiTheme } = useEuiTheme();
  const columnGap = iconToCopyGap ?? euiTheme.size.s;
  return (
    <EuiFlexGroup
      responsive={false}
      direction="row"
      gutterSize="none"
      alignItems="flexStart"
      justifyContent="flexStart"
      css={css`
        min-width: 0;
        column-gap: ${columnGap};
      `}
    >
      <EuiFlexItem grow={false}>
        <NotificationIconBox>
          <NotificationStatusIcon color={color} slotPx={iconSlotPx} filled={statusIconFilled} />
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
