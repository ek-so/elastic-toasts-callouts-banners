import { css } from '@emotion/react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiTitle,
  useEuiShadow,
  useEuiTheme,
} from '@elastic/eui';
import type { ReactNode } from 'react';

import { NotificationTitleBox } from './NotificationTitleBox';
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
  /** When true, body copy (`children`) is omitted; title and actions stay. */
  hideDescription?: boolean;
  hidePrimaryButton?: boolean;
  hideSecondaryButton?: boolean;
  dismissable?: boolean;
};

/** Left accent fill — same hues as `borderStrong*` (separate layer, not `border-left`). */
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
 * 3px left accent (absolutely positioned span, not `::after`), 40px end padding for dismiss,
 * `useEuiShadow('l')` (Sass `euiBottomShadow` / Emotion per EUI shadow docs) so dark mode can add
 * the refresh-variant floating border on `::after` without conflicting with the stripe.
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
  hideDescription = false,
  hidePrimaryButton = false,
  hideSecondaryButton = false,
  dismissable = true,
}: ToastProps) {
  const euiThemeContext = useEuiTheme();
  const { euiTheme } = euiThemeContext;
  const leftAccent = leftAccentColor(euiTheme, color);
  const btnColor = buttonColor(color);
  const leftStripe = '3px';
  const specimenBorderRadius = '2px';
  const shadowStyles = useEuiShadow('l', { borderAllInHighContrastMode: false });
  const paddingEnd = dismissable ? '40px' : euiTheme.size.base;

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
    padding: ${euiTheme.size.base} ${paddingEnd} ${euiTheme.size.base} ${euiTheme.size.l};
    word-break: break-word;
    ${shadowStyles}
  `;

  const stripeCss = css`
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${leftStripe};
    background-color: ${leftAccent};
    border-top-left-radius: ${specimenBorderRadius};
    border-bottom-left-radius: ${specimenBorderRadius};
    pointer-events: none;
  `;

  const dismissFromEdge = `calc(${euiTheme.size.xs} + 4px)`;
  const showPrimaryButton = !hidePrimaryButton;
  const showSecondaryButton = !hideSecondaryButton;
  const showActionButtons = showPrimaryButton || showSecondaryButton;

  const closeCss = css`
    position: absolute;
    z-index: 3;
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
      <span aria-hidden css={stripeCss} />
      {dismissable ? (
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
      ) : null}

      <div
        data-slot={notificationSlots.contentBox}
        css={css`
          position: relative;
          z-index: 2;
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
              min-width: 0;
            `}
          >
            <NotificationTitleBox color={color}>
              <EuiTitle size="xs">
                <h4>{title}</h4>
              </EuiTitle>
            </NotificationTitleBox>
            {!hideDescription && children ? <EuiText size="s">{children}</EuiText> : null}
          </div>
        </div>

        {showActionButtons ? (
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
              {showPrimaryButton ? (
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
              ) : null}
              {showSecondaryButton ? (
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
              ) : null}
            </EuiFlexGroup>
          </div>
        ) : null}
      </div>
    </div>
  );
}
