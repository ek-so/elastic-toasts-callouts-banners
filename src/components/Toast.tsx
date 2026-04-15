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
 * 3px left stripe (`::after`, rounded only on outer TL/BL corners), large shadow, dismiss like `EuiToast`,
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
  const corner = euiTheme.size.xxs;

  const rootCss = css`
    position: relative;
    box-sizing: border-box;
    width: 320px;
    max-width: 100%;
    border-radius: ${corner};
    background-color: ${euiTheme.colors.emptyShade};
    border: none;
    padding: ${euiTheme.size.base} ${euiTheme.size.xxl} ${euiTheme.size.base} ${euiTheme.size.l};
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
      border-top-left-radius: ${corner};
      border-bottom-left-radius: ${corner};
      pointer-events: none;
    }
  `;

  const closeCss = css`
    position: absolute;
    z-index: 2;
    top: ${euiTheme.size.base};
    right: ${euiTheme.size.base};
  `;

  return (
    <div
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
          css={css`
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: ${euiTheme.size.xxs};
          `}
        >
          <EuiTitle size="xs">
            <h4>{title}</h4>
          </EuiTitle>
          {children ? <EuiText size="s">{children}</EuiText> : null}
        </div>

        <span
          css={css`
            align-self: flex-start;
            display: inline-block;
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
        </span>
      </div>
    </div>
  );
}
