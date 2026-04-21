import { css } from '@emotion/react';
import { EuiFlexGroup, EuiFlexItem, EuiIcon, useEuiTheme } from '@elastic/eui';
import type { ReactNode } from 'react';

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
 * Title row only: semantic status icon + title (`children`), so body copy can sit below at full text width.
 */
export function NotificationTitleBox({
  color,
  children,
}: {
  color: NotificationSemanticColor;
  children: ReactNode;
}) {
  const { euiTheme } = useEuiTheme();
  return (
    <EuiFlexGroup
      responsive={false}
      gutterSize="none"
      alignItems="center"
      justifyContent="flexStart"
      css={css`
        min-width: 0;
        /* 6px at default scale: size.base × 0.375. M callouts + toasts title row only. */
        column-gap: calc(${euiTheme.size.base} * 0.375);
      `}
    >
      <EuiFlexItem grow={false}>
        <NotificationStatusIcon color={color} slotPx={20} />
      </EuiFlexItem>
      <EuiFlexItem
        grow
        css={{
          minWidth: 0,
        }}
      >
        {children}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
