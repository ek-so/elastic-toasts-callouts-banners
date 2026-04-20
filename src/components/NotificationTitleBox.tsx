import { css } from '@emotion/react';
import { EuiFlexGroup, EuiFlexItem, EuiIcon, useEuiTheme } from '@elastic/eui';
import type { ComponentProps, ReactNode } from 'react';

export type NotificationSemanticColor = 'success' | 'warning' | 'danger' | 'neutral';

function statusIcon(color: NotificationSemanticColor): {
  type: ComponentProps<typeof EuiIcon>['type'];
  iconColor: ComponentProps<typeof EuiIcon>['color'];
} {
  switch (color) {
    case 'success':
      return { type: 'checkCircle', iconColor: 'success' };
    case 'warning':
      return { type: 'warning', iconColor: 'warning' };
    case 'danger':
      return { type: 'error', iconColor: 'danger' };
    case 'neutral':
      return { type: 'info', iconColor: 'primary' };
  }
}

/**
 * Title row only: semantic status icon + title (`children`), so body copy can sit below at full text width.
 */
const iconSlotCss = css`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  & > svg,
  & svg {
    width: 16px;
    height: 16px;
  }
`;

export function NotificationTitleBox({
  color,
  children,
}: {
  color: NotificationSemanticColor;
  children: ReactNode;
}) {
  const { euiTheme } = useEuiTheme();
  const { type, iconColor } = statusIcon(color);
  return (
    <EuiFlexGroup
      responsive={false}
      gutterSize="none"
      alignItems="center"
      justifyContent="flexStart"
      css={css`
        min-width: 0;
        column-gap: calc(${euiTheme.size.base} * 0.25);
      `}
    >
      <EuiFlexItem grow={false}>
        <EuiIcon aria-hidden type={type} color={iconColor} css={iconSlotCss} />
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
