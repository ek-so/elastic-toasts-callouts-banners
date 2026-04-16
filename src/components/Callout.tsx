import { css } from '@emotion/react';
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

export type CalloutColor = 'success' | 'warning' | 'danger' | 'neutral';

export type CalloutSize = 'm' | 's';

export type CalloutProps = {
  title: ReactNode;
  children?: ReactNode;
  color?: CalloutColor;
  /** `m` — default scales, 40px end padding; `s` — 12px/16px + 40px end, 8px gap before actions, inline lead, dismiss `xs`. */
  size?: CalloutSize;
  primaryLabel?: ReactNode;
  secondaryLabel?: ReactNode;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/** `neutral` uses primary base background / border tokens. */
function calloutBackground(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: CalloutColor
): string {
  switch (color) {
    case 'neutral':
      return euiTheme.colors.backgroundBasePrimary;
    case 'success':
      return euiTheme.colors.backgroundBaseSuccess;
    case 'warning':
      return euiTheme.colors.backgroundBaseWarning;
    case 'danger':
      return euiTheme.colors.backgroundBaseDanger;
  }
}

function calloutBorder(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: CalloutColor
): string {
  switch (color) {
    case 'neutral':
      return euiTheme.colors.borderBasePrimary;
    case 'success':
      return euiTheme.colors.borderBaseSuccess;
    case 'warning':
      return euiTheme.colors.borderBaseWarning;
    case 'danger':
      return euiTheme.colors.borderBaseDanger;
  }
}

function calloutLeftAccent(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: CalloutColor
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

function buttonColor(color: CalloutColor): 'primary' | 'success' | 'warning' | 'danger' {
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
 * Callout: `backgroundBase*`, thin `borderBase*` on three sides, 3px left stripe (`::after`, TL/BL radius 2px).
 * `size="m"` — stacked title (`EuiTitle` `xs`) + body (`EuiText` `s`), `xs` gap between. `size="s"` — one wrapping lead line: `EuiTitle` `xxs` + full stop + `EuiText` `s` inline in the same block.
 */
export function Callout({
  title,
  children,
  color = 'success',
  size = 'm',
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  onPrimaryClick,
  onSecondaryClick,
  onDismiss,
  className,
}: CalloutProps) {
  const { euiTheme } = useEuiTheme();
  const bg = calloutBackground(euiTheme, color);
  const edge = calloutBorder(euiTheme, color);
  const leftAccent = calloutLeftAccent(euiTheme, color);
  const btnColor = buttonColor(color);
  const specimenBorderRadius = '2px';
  const thin = euiTheme.border.width.thin;
  const leftStripe = '3px';
  const isS = size === 's';
  /** Size `s`: 12px vertical / 16px start; 40px end so dismiss does not overlap copy. */
  const rootPadding = isS
    ? '12px 40px 12px 16px'
    : `${euiTheme.size.base} 40px ${euiTheme.size.base} ${euiTheme.size.l}`;
  const dismissFromEdge = `calc(${euiTheme.size.xs} + 4px)`;
  const closeInset = dismissFromEdge;
  const closeInsetInline = dismissFromEdge;
  const blockGap = isS ? '8px' : euiTheme.size.m;
  const actionsGutter = isS ? 'xs' : 's';

  /** Size `s`: inline `h5` + body so copy wraps together (heading stays `EuiTitle`, not `<strong>` in a `<p>`). */
  const sLeadWrapCss = css`
    min-width: 0;
    word-break: break-word;
  `;
  const sLeadHeadingCss = css`
    display: inline;
    margin: 0;
    vertical-align: baseline;
  `;
  const sLeadBodyCss = css`
    &.euiText {
      display: inline;
    }
    margin-block: 0;
    vertical-align: baseline;
  `;

  const rootCss = css`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    border-radius: ${specimenBorderRadius};
    overflow: hidden;
    background-color: ${bg};
    border-top: ${thin} solid ${edge};
    border-right: ${thin} solid ${edge};
    border-bottom: ${thin} solid ${edge};
    border-left: none;
    padding: ${rootPadding};
    word-break: break-word;

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

  const closeCss = css`
    position: absolute;
    z-index: 2;
    top: ${closeInset};
    right: ${closeInsetInline};
  `;

  return (
    <div
      data-slot={notificationSlots.root}
      className={className}
      css={rootCss}
      role="status"
      aria-live="polite"
      data-test-subj="callout"
      data-callout-size={size}
    >
      <span css={closeCss}>
        <EuiButtonIcon
          iconType="cross"
          color={btnColor}
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
          gap: ${blockGap};
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
            css={
              isS
                ? css`
                    display: block;
                    min-width: 0;
                  `
                : css`
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    gap: ${euiTheme.size.xs};
                  `
            }
          >
            {isS ? (
              <div css={sLeadWrapCss}>
                <EuiTitle size="xxs">
                  <h5 css={sLeadHeadingCss}>
                    {title}
                    {'.'}
                  </h5>
                </EuiTitle>
                {children != null ? (
                  <>
                    {' '}
                    <EuiText size="s" component="span" css={sLeadBodyCss}>
                      {children}
                    </EuiText>
                  </>
                ) : null}
              </div>
            ) : (
              <>
                <EuiTitle size="xs">
                  <h4>{title}</h4>
                </EuiTitle>
                {children ? <EuiText size="s">{children}</EuiText> : null}
              </>
            )}
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
            gutterSize={actionsGutter}
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
                <EuiButtonEmpty
                  size="s"
                  color={btnColor}
                  onClick={onSecondaryClick}
                >
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
