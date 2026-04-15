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

export type BannerSize = 'm' | 's' | 'l';

export type BannerProps = {
  title: ReactNode;
  children?: ReactNode;
  /** `s` / `m` match callout spacing; `l` uses 16px root vertical inset plus 8px inner shell, 40px right, 32px left (tokens). */
  size?: BannerSize;
  primaryLabel?: ReactNode;
  secondaryLabel?: ReactNode;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/**
 * Full-width-style banner shell aligned to callout spacing and typography (no left stripe).
 * Sizes `m` / `s` match callout rhythm; `l` uses larger vertical padding and wider left inset. Highlighted surface, subdued border; body subdued; dismiss `text`.
 */
export function Banner({
  title,
  children,
  size = 'm',
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  onPrimaryClick,
  onSecondaryClick,
  onDismiss,
  className,
}: BannerProps) {
  const { euiTheme } = useEuiTheme();
  const bg = euiTheme.colors.backgroundBaseHighlighted;
  const edge = euiTheme.colors.borderBaseSubdued;
  const btnColor = 'primary';
  const corner = euiTheme.size.xxs;
  const leftCorner = '1px';
  const thin = euiTheme.border.width.thin;
  const isS = size === 's';
  const isL = size === 'l';
  const rootPadding =
    size === 's'
      ? '12px 40px 12px 16px'
      : size === 'l'
        ? `${euiTheme.size.base} ${euiTheme.size.xxl} ${euiTheme.size.base} ${euiTheme.size.xl}`
        : `${euiTheme.size.base} 40px ${euiTheme.size.base} ${euiTheme.size.l}`;
  const dismissFromEdge = `calc(${euiTheme.size.xs} + 4px)`;
  const closeInset = dismissFromEdge;
  const closeInsetInline = dismissFromEdge;
  const blockGap = isS ? '8px' : euiTheme.size.m;
  const titleBodyGap = isL ? euiTheme.size.s : euiTheme.size.xs;
  const actionsGutter = isS ? 'xs' : 's';

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
    border-top-left-radius: ${leftCorner};
    border-bottom-left-radius: ${leftCorner};
    border-top-right-radius: ${corner};
    border-bottom-right-radius: ${corner};
    overflow: hidden;
    background-color: ${bg};
    border: ${thin} solid ${edge};
    padding: ${rootPadding};
    word-break: break-word;
  `;

  const closeCss = css`
    position: absolute;
    z-index: 2;
    top: ${closeInset};
    right: ${closeInsetInline};
  `;

  return (
    <div
      className={className}
      css={rootCss}
      role="status"
      aria-live="polite"
      data-test-subj="banner"
      data-banner-size={size}
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
          gap: ${blockGap};
          ${isL
            ? css`
                padding-block: ${euiTheme.size.s};
              `
            : undefined}
        `}
      >
        <div
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
                  gap: ${titleBodyGap};
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
                  <EuiText size="s" component="span" color="subdued" css={sLeadBodyCss}>
                    {children}
                  </EuiText>
                </>
              ) : null}
            </div>
          ) : (
            <>
              <EuiTitle size={isL ? 's' : 'xs'}>
                {isL ? <h3>{title}</h3> : <h4>{title}</h4>}
              </EuiTitle>
              {children ? (
                <EuiText size="s" color="subdued">
                  {children}
                </EuiText>
              ) : null}
            </>
          )}
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
