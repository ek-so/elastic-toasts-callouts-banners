import { css } from '@emotion/react';
import { euiShadowLarge } from '@elastic/eui-theme-common';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import type { ReactNode } from 'react';

import { notificationSlots } from './notificationSlots';

export type ToastColor = 'success' | 'warning' | 'danger' | 'neutral';

export type ToastProps = {
  title: ReactNode;
  children?: ReactNode;
  color?: ToastColor;
  primaryLabel?: ReactNode;
  secondaryLabel?: ReactNode;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/** Left stripe fill — same hues as `borderStrong*` (painted via `::after`, not `border-left`). */
function leftAccentColor(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: ToastColor
): string {
  switch (color) {
    case 'neutral':
      return euiTheme.colors.borderStrongPrimary;
    case 'success':
      return euiTheme.colors.borderStrongSuccess;
    case 'warning':
      return euiTheme.colors.borderStrongWarning;
    case 'danger':
      return euiTheme.colors.borderStrongDanger;
  }
}

function buttonColor(color: ToastColor): 'primary' | 'success' | 'warning' | 'danger' {
  switch (color) {
    case 'neutral':
      return 'primary';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'danger';
  }
}

/**
 * Toast card aligned to Figma node 6150:6490 (Banners–toasts–callouts):
 * 3px left stripe (`::after`, TL/BL radius 2px), 40px end padding for dismiss, large shadow,
 * Primary CTA uses base `EuiButton` (`fill={false}` / secondary prominence) + semantic `color`;
 * second action is `EuiButtonEmpty` (matches EUI guidance for action hierarchy).
 */
export function Toast({
  title,
  children,
  color = 'success',
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  onPrimaryClick,
  onSecondaryClick,
  onDismiss,
  className,
}: ToastProps) {
  const euiThemeContext = useEuiTheme();
  const { euiTheme } = euiThemeContext;
  const leftAccent = leftAccentColor(euiTheme, color);
  const btnColor = buttonColor(color);
  const leftStripe = '3px';
  const specimenBorderRadius = '2px';

  const rootCss = css`
    position: relative;
    box-sizing: border-box;
    width: 320px;
    max-width: 100%;
    border-top-left-radius: ${specimenBorderRadius};
    border-bottom-left-radius: ${specimenBorderRadius};
    border-top-right-radius: ${specimenBorderRadius};
    border-bottom-right-radius: ${specimenBorderRadius};
    background-color: ${euiTheme.colors.emptyShade};
    border: none;
    padding: ${euiTheme.size.base} 40px ${euiTheme.size.base} ${euiTheme.size.l};
    word-break: break-word;
    ${euiShadowLarge(euiThemeContext, { borderAllInHighContrastMode: false })}

    &::after {
      content: '';
      position: absolute;
      z-index: 0;
      left: 0;
      top: 0;
      bottom: 0;
      width: ${leftStripe};
      background-color: ${leftAccent};
      border-top-left-radius: ${specimenBorderRadius};
      border-bottom-left-radius: ${specimenBorderRadius};
      pointer-events: none;
    }
  `;

  const dismissFromEdge = `calc(${euiTheme.size.xs} + 4px)`;

  const closeCss = css`
    position: absolute;
    z-index: 2;
    top: ${dismissFromEdge};
    right: ${dismissFromEdge};
  `;

  return (
    <div
      data-slot={notificationSlots.root}
      className={className}
      css={rootCss}
      role="status"
      aria-live="polite"
      data-test-subj="toast"
    >
      <span css={closeCss}>
        <EuiButtonIcon
          iconType="cross"
          color="text"
          size="xs"
          display="empty"
          aria-label="Dismiss notification"
          onClick={() => onDismiss?.()}
        />
      </span>

      <div
        data-slot={notificationSlots.contentBox}
        css={css`
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: ${euiTheme.size.m};
        `}
      >
        <div
          data-slot={notificationSlots.textWrapper}
          css={css`
            min-width: 0;
            max-width: 100%;
          `}
        >
          <div
            data-slot={notificationSlots.textBox}
            css={css`
              display: flex;
              flex-direction: column;
              align-items: stretch;
              gap: ${euiTheme.size.xs};
            `}
          >
            <EuiTitle size="xs">
              <h4>{title}</h4>
            </EuiTitle>
            {children ? <EuiText size="s">{children}</EuiText> : null}
          </div>
        </div>

        <div
          data-slot={notificationSlots.buttonBox}
          css={css`
            align-self: flex-start;
            max-width: 100%;
          `}
        >
          <EuiFlexGroup
            responsive={false}
            gutterSize="s"
            alignItems="center"
            justifyContent="flexStart"
            wrap
          >
            <EuiFlexItem grow={false} css={{ minWidth: 0, maxWidth: '100%' }}>
              <span
                css={css`
                  display: inline-flex;
                  max-width: 100%;
                  flex: 0 1 auto;
                `}
              >
                <EuiButton
                  size="s"
                  color={btnColor}
                  fill={false}
                  fullWidth={false}
                  minWidth={false}
                  onClick={onPrimaryClick}
                >
                  {primaryLabel}
                </EuiButton>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false} css={{ minWidth: 0, flexShrink: 0 }}>
              <span
                css={css`
                  display: inline-flex;
                  flex: 0 0 auto;
                  max-width: 100%;
                `}
              >
                <EuiButtonEmpty size="s" color={btnColor} onClick={onSecondaryClick}>
                  {secondaryLabel}
                </EuiButtonEmpty>
              </span>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </div>
    </div>
  );
}
