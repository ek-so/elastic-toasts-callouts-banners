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

/** Specimen UI screenshot in `public/banners/specimen-screenshot.png` (M/L `screenshot` prop). */
function specimenBannerScreenshotSrc(): string {
  const publicPath =
    typeof __webpack_public_path__ === 'string' && __webpack_public_path__ !== ''
      ? __webpack_public_path__
      : '/';
  const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
  return `${base}banners/specimen-screenshot.png`;
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
  /**
   * Root `inline-size` (px) at which `notification-content-box` lays out lead and actions in a row.
   * Specimens pass the app “Layout breakpoint” value.
   */
  layoutBreakpointPx?: number;
  /** When true, body copy (`children`) is omitted; title and actions stay. */
  hideDescription?: boolean;
  hidePrimaryButton?: boolean;
  hideSecondaryButton?: boolean;
  /** When false, the dismiss control is hidden and S/M end padding is reduced (specimen chrome). */
  dismissable?: boolean;
  /**
   * When the specimen panel uses a subdued page background, use `backgroundBasePlain` on the
   * banner shell instead of `backgroundBaseHighlighted` so the banner still reads on the panel.
   */
  onSubduedSpecimenPanel?: boolean;
  /**
   * When `true` with `size="m"` or `"l"`, uses the specimen UI screenshot instead of the default vector art.
   * The screenshot slot is **320×160** at the default theme scale (`20×` / `10×` theme `base` px).
   * Ignored for `size="s"` and when `image` is set (including `null`).
   */
  screenshot?: boolean;
};

/**
 * Full-width-style banner shell aligned to callout spacing and typography (no left stripe).
 * Sizes `m` / `s` match callout rhythm; `l` uses wider horizontal inset on the shell and content-box block padding. Default vector art per size is served from `public/banners/` (`/banners/*.svg`); M/L may set `screenshot` to use `specimen-screenshot.png` in a **320×160** slot (`20×` / `10×` theme `base` px); override or hide with `image` / `image={null}`. Vector slots: 32×32 / 64×64 / 120×120; image-to-copy gap `calc(0.75×size.base)` on `s` (12px when base is 16px) / `base` (`m`) / `l` (`l`). Default shell uses `backgroundBaseHighlighted` (or `backgroundBasePlain` when `onSubduedSpecimenPanel`); subdued border; body subdued; dismiss `text`.
 * At container width ≥`layoutBreakpointPx` on the root, `notification-content-box` lays out lead and actions in a row with vertical centering (`align-items: center`) and `size.l` gap, matching wide callouts.
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
  layoutBreakpointPx = 800,
  hideDescription = false,
  hidePrimaryButton = false,
  hideSecondaryButton = false,
  dismissable = true,
  onSubduedSpecimenPanel = false,
  screenshot = false,
}: BannerProps) {
  const { euiTheme } = useEuiTheme();
  const bg = onSubduedSpecimenPanel
    ? euiTheme.colors.backgroundBasePlain
    : euiTheme.colors.backgroundBaseHighlighted;
  const edge = euiTheme.colors.borderBaseSubdued;
  const btnColor = 'primary';
  const specimenBorderRadius = '2px';
  const thin = euiTheme.border.width.thin;
  const isS = size === 's';
  const isL = size === 'l';
  const useScreenshotArt = screenshot && !isS && image === undefined;

  /**
   * Shell padding (top / right / bottom / left). M/L with `screenshot` art: `size.base` (~16px) start inset.
   * Otherwise same as before: `s` / `m` dismissable ends; L `xxl`/`xl`; non-dismissable tightening.
   */
  const padTop = isS ? '12px' : '0';
  const padBottom = isS ? '12px' : '0';
  const padRight = dismissable
    ? isS
      ? '40px'
      : isL
        ? euiTheme.size.xxl
        : '40px'
    : isS
      ? euiTheme.size.base
      : isL
        ? euiTheme.size.xxl
        : euiTheme.size.l;
  const padLeft = useScreenshotArt
    ? euiTheme.size.base
    : isS
      ? euiTheme.size.base
      : isL
        ? euiTheme.size.xl
        : euiTheme.size.l;

  const rootPadding = `${padTop} ${padRight} ${padBottom} ${padLeft}`;
  /** Top/bottom padding for the inner body; size `s` uses shell padding instead (see `rootPadding`). */
  const contentPaddingBlock =
    size === 's' ? '0' : euiTheme.size.base;
  const dismissFromEdge = `calc(${euiTheme.size.xs} + 4px)`;
  const closeInset = dismissFromEdge;
  const closeInsetInline = dismissFromEdge;
  /** Stacked title ↔ body (text box): M matches toast (`size.xs`); L uses `size.s` (8px at default theme scale). */
  const titleBodyGap = size === 'm' ? euiTheme.size.xs : euiTheme.size.s;
  /** Lead stack ↔ action buttons: `s` on compact, `m` (≈12px) on M/L. */
  const leadToActionsGap = isS ? euiTheme.size.s : euiTheme.size.m;
  /** Top/bottom inset on the content box: size `l` only (`size.s` ≈ 8px); M/S have no extra block padding. */
  const copyStackPaddingBlock = isL ? euiTheme.size.s : 0;
  const actionsGutter = isS ? 'xs' : 's';
  /** Large banner: primary/secondary use `m` controls; M/S stay `s`. */
  const actionButtonSize = isL ? 'm' : 's';
  const showPrimaryButton = !hidePrimaryButton;
  const showSecondaryButton = !hideSecondaryButton;
  const showActionButtons = showPrimaryButton || showSecondaryButton;
  const defaultBannerSrc = defaultBannerArtSrc(size);
  const screenshotSrc = specimenBannerScreenshotSrc();
  const resolvedImage: ReactNode | null =
    image === undefined
      ? (
          <img
            src={useScreenshotArt ? screenshotSrc : defaultBannerSrc}
            alt=""
            css={css`
              display: block;
              width: 100%;
              height: 100%;
              object-fit: ${useScreenshotArt ? 'cover' : 'contain'};
              object-position: ${useScreenshotArt ? 'center' : 'unset'};
            `}
          />
        )
      : image;
  const hasImage = resolvedImage != null;
  /** Slot edge length for vector art: `xl` (32px), `xxxxl` (64px), or 7.5× base (120px at 16px base). */
  const imageSlotSize = isS
    ? euiTheme.size.xl
    : isL
      ? `calc(${euiTheme.size.base} * 7.5)`
      : euiTheme.size.xxxxl;
  /** Screenshot specimen slot: 320×160 at default scale (`20` / `10` × theme `base` px). */
  const screenshotSlotWidth = `${euiTheme.base * 20}px`;
  const screenshotSlotHeight = `${euiTheme.base * 10}px`;
  /** `s`: 12px at default scale via `0.75 × size.base`; `m`: `base`; `l`: `l`. */
  const imageLeadGap = isS
    ? `calc(${euiTheme.size.base} * 0.75)`
    : isL
      ? euiTheme.size.l
      : euiTheme.size.base;
  /** Screenshot M/L only: gap between image slot and copy (24px / 32px at default scale). */
  const leadImageRowGap =
    useScreenshotArt && size === 'm'
      ? euiTheme.size.l
      : useScreenshotArt && isL
        ? euiTheme.size.xl
        : imageLeadGap;
  /** Cap lead copy width (62.5 × theme base ≈ 1000px at default scale). */
  const textBoxMaxWidth = `${euiTheme.base * 62.5}px`;

  const sLeadWrapCss = css`
    min-width: 0;
    word-break: break-word;

    h5,
    .euiTitle {
      margin-block: 0;
      margin-inline: 0;
      padding-block: 0;
      padding-inline: 0;
    }
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
    margin-inline-start: 2px;
    vertical-align: baseline;
  `;

  const wideLeadActionsMinWidth = `${layoutBreakpointPx}px`;

  const wideContentBoxRowCss = css`
    @container banner (min-width: ${wideLeadActionsMinWidth}) {
      flex-direction: row;
      align-items: center;
      gap: ${euiTheme.size.l};

      [data-slot='${notificationSlots.textWrapper}'] {
        flex: 1;
        min-width: 0;
      }
    }
  `;

  /** Vertically center image slot and copy/actions on the row cross-axis (all banners with art). */
  const leadWithImageRowCss = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${leadImageRowGap};
    min-width: 0;
  `;

  const leadWithImageContentBoxCss = css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    align-self: center;
    gap: ${leadToActionsGap};
    flex: 1;
    min-width: 0;
    padding-block: ${copyStackPaddingBlock};
    ${wideContentBoxRowCss}
  `;

  const rootCss = css`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    container-type: inline-size;
    container-name: banner;
    border-top-left-radius: ${specimenBorderRadius};
    border-bottom-left-radius: ${specimenBorderRadius};
    border-top-right-radius: ${specimenBorderRadius};
    border-bottom-right-radius: ${specimenBorderRadius};
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

  const imageSlotCss = useScreenshotArt
    ? css`
        position: relative;
        width: ${screenshotSlotWidth};
        height: ${screenshotSlotHeight};
        flex-shrink: 0;
        overflow: hidden;
        border-radius: ${thin};
        box-sizing: border-box;

        /* Fill slot; preserve aspect ratio; crop overflow (object-fit: cover). */
        line-height: 0;

        img,
        svg {
          position: absolute;
          inset: 0;
          display: block;
          margin: 0;
          padding: 0;
          border: none;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      `
    : css`
        width: ${imageSlotSize};
        height: ${imageSlotSize};
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: ${specimenBorderRadius};

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
        max-width: ${textBoxMaxWidth};
      `
    : css`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${titleBodyGap};
        max-width: ${textBoxMaxWidth};

        h3,
        h4 {
          margin-block: 0;
        }

        .euiTitle {
          margin-block: 0;
          padding-block: 0;
        }

        .euiTitle + .euiText {
          margin-block: 0;
        }

        .euiTitle + .euiText p {
          margin-block: 0;
        }
      `;

  const leadBlock = (
    <div data-slot={notificationSlots.textBox} css={leadColumnCss}>
      {isS ? (
        <div css={sLeadWrapCss}>
          <EuiTitle size="xxs">
            <h5 css={sLeadHeadingCss}>
              {title}
              {!hideDescription ? '.' : null}
            </h5>
          </EuiTitle>
          {!hideDescription && children != null ? (
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
          {!hideDescription && children ? (
            <EuiText size="s" color="subdued">
              {children}
            </EuiText>
          ) : null}
        </>
      )}
    </div>
  );

  const actionsRow = showActionButtons ? (
    <div
      data-slot={notificationSlots.buttonBox}
      css={css`
        align-self: flex-start;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 0;

        @container banner (min-width: ${wideLeadActionsMinWidth}) {
          flex-shrink: 0;
          align-self: stretch;
        }
      `}
    >
      <EuiFlexGroup
        responsive={false}
        gutterSize={actionsGutter}
        alignItems="center"
        justifyContent="flexStart"
        wrap
        css={css`
          flex-grow: 0;
          flex-shrink: 0;

          @container banner (min-width: ${wideLeadActionsMinWidth}) {
            flex-direction: row-reverse;
          }
        `}
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
                size={actionButtonSize}
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
              <EuiButtonEmpty size={actionButtonSize} color={btnColor} onClick={onSecondaryClick}>
                {secondaryLabel}
              </EuiButtonEmpty>
            </span>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </div>
  ) : null;

  return (
    <div
      data-slot={notificationSlots.root}
      className={className}
      css={rootCss}
      role="status"
      aria-live="polite"
      data-test-subj="banner"
      data-banner-size={size}
      data-banner-has-image={hasImage || undefined}
      data-banner-screenshot={useScreenshotArt || undefined}
    >
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
        css={css`
          position: relative;
          z-index: 1;
          padding-block: ${contentPaddingBlock};
        `}
      >
        {hasImage ? (
          <div css={leadWithImageRowCss}>
            <div data-slot={notificationSlots.imageBox} css={imageSlotCss}>
              {resolvedImage}
            </div>
            <div data-slot={notificationSlots.contentBox} css={leadWithImageContentBoxCss}>
              <div
                data-slot={notificationSlots.textWrapper}
                css={css`
                  min-width: 0;
                  max-width: 100%;
                  width: 100%;
                `}
              >
                {leadBlock}
              </div>
              {actionsRow}
            </div>
          </div>
        ) : (
          <div
            data-slot={notificationSlots.contentBox}
            css={css`
              display: flex;
              flex-direction: column;
              align-items: stretch;
              gap: ${leadToActionsGap};
              padding-block: ${copyStackPaddingBlock};
              min-width: 0;
              ${wideContentBoxRowCss}
            `}
          >
            <div
              data-slot={notificationSlots.textWrapper}
              css={css`
                min-width: 0;
                max-width: 100%;
              `}
            >
              {leadBlock}
            </div>
            {actionsRow}
          </div>
        )}
      </div>
    </div>
  );
}
