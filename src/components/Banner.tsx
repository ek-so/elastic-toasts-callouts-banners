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

/** Default artwork lives in `public/banners/` (served as `/banners/*.svg`); copied into `dist/banners/` on `yarn build`. */
function defaultBannerArtSrc(size: BannerSize): string {
  const file = size === 's' ? 'default-s' : size === 'l' ? 'default-l' : 'default-m';
  const publicPath =
    typeof __webpack_public_path__ === 'string' && __webpack_public_path__ !== ''
      ? __webpack_public_path__
      : '/';
  const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
  return `${base}banners/${file}.svg`;
}

export type BannerProps = {
  title: ReactNode;
  children?: ReactNode;
  /**
   * Optional media override (e.g. `<img alt="" />` or `<EuiIcon />`).
   * When omitted, the size-matched default artwork from `public/banners/` is shown (`default-s` / `default-m` / `default-l`.svg).
   * Pass `null` to hide the image slot entirely.
   */
  image?: ReactNode | null;
  /** `s` / `m` match callout spacing; `l` uses the same vertical content inset as `m` plus a wider horizontal shell (tokens). */
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
 * Sizes `m` / `s` match callout rhythm; `l` uses the same inner vertical padding as `m` and a wider horizontal inset on the shell. Default artwork per size is served from `public/banners/` (`/banners/*.svg`); override or hide with `image` / `image={null}`. Slot 32×32 / 64×64 / 120×120; image-to-copy gap `m` / `base` / `l`. Highlighted surface, subdued border; body subdued; dismiss `text`.
 */
export function Banner({
  title,
  children,
  image,
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
  /** Horizontal inset on the bordered shell only; vertical rhythm lives on the inner content wrapper. */
  const rootPaddingInline =
    size === 's'
      ? `0 40px 0 16px`
      : size === 'l'
        ? `0 ${euiTheme.size.xxl} 0 ${euiTheme.size.xl}`
        : `0 40px 0 ${euiTheme.size.l}`;
  /** Top/bottom padding for the main column (image + copy + actions), not the outer shell. */
  const contentPaddingBlock =
    size === 's' ? euiTheme.size.m : euiTheme.size.base;
  const dismissFromEdge = `calc(${euiTheme.size.xs} + 4px)`;
  const closeInset = dismissFromEdge;
  const closeInsetInline = dismissFromEdge;
  /** Title ↔ body in stacked lead (`m` / `l`); token `s` ≈ 8px at default scale. */
  const titleBodyGap = euiTheme.size.s;
  /** Lead stack ↔ action buttons: `s` on compact, `m` (≈12px) on M/L. */
  const leadToActionsGap = isS ? euiTheme.size.s : euiTheme.size.m;
  /** Top/bottom inset of the copy column beside media (title + body + actions). */
  const copyStackPaddingBlock = euiTheme.size.s;
  const actionsGutter = isS ? 'xs' : 's';
  const defaultBannerSrc = defaultBannerArtSrc(size);
  const resolvedImage: ReactNode | null =
    image === undefined
      ? (
          <img
            src={defaultBannerSrc}
            alt=""
            css={css`
              display: block;
              width: 100%;
              height: 100%;
              object-fit: contain;
            `}
          />
        )
      : image;
  const hasImage = resolvedImage != null;
  /** Slot edge length: `xl` (32px), `xxxxl` (64px), or 7.5× base (120px at 16px base). */
  const imageSlotSize = isS
    ? euiTheme.size.xl
    : isL
      ? `calc(${euiTheme.size.base} * 7.5)`
      : euiTheme.size.xxxxl;
  const imageLeadGap = isS ? euiTheme.size.m : isL ? euiTheme.size.l : euiTheme.size.base;

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
    padding: ${rootPaddingInline};
    word-break: break-word;
  `;

  const closeCss = css`
    position: absolute;
    z-index: 2;
    top: ${closeInset};
    right: ${closeInsetInline};
  `;

  const imageSlotCss = css`
    width: ${imageSlotSize};
    height: ${imageSlotSize};
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: ${euiTheme.border.radius.small};

    img,
    svg {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  `;

  const leadColumnCss = isS
    ? css`
        display: block;
        min-width: 0;
      `
    : css`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0;

        h3,
        h4 {
          margin-block: 0;
        }

        .euiTitle {
          margin-block: 0;
          padding-block: 0;
        }

        /* Exact title↔body offset; flex gap stacks with EuiText / paragraph margins in practice. */
        .euiTitle + .euiText {
          margin-block: 0;
          margin-top: ${titleBodyGap};
        }

        .euiTitle + .euiText p {
          margin-block: 0;
        }
      `;

  const leadBlock = (
    <div css={leadColumnCss}>
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
  );

  const actionsRow = (
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
  );

  return (
    <div
      className={className}
      css={rootCss}
      role="status"
      aria-live="polite"
      data-test-subj="banner"
      data-banner-size={size}
      data-banner-has-image={hasImage || undefined}
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
          gap: ${leadToActionsGap};
          padding-block: ${contentPaddingBlock};
        `}
      >
        {hasImage ? (
          <div
            css={css`
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: ${imageLeadGap};
              min-width: 0;
            `}
          >
            <div css={imageSlotCss}>{resolvedImage}</div>
            <div
              css={css`
                display: flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: flex-start;
                /* Intrinsic height + padding; stretch matched image height and left slack below actions. */
                align-self: center;
                gap: ${leadToActionsGap};
                flex: 1;
                min-width: 0;
                padding-block: ${copyStackPaddingBlock};
              `}
            >
              {leadBlock}
              {actionsRow}
            </div>
          </div>
        ) : (
          <>
            {leadBlock}
            {actionsRow}
          </>
        )}
      </div>
    </div>
  );
}
