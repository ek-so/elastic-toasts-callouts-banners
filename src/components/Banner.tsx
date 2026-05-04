import { css } from '@emotion/react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import type { ReactNode } from 'react';

import { notificationSlots } from './notificationSlots';
import { BannerScreenshot } from './BannerScreenshot';

export type BannerSize = 'm' | 's' | 'l';

/** Default M/L vector art in `public/banners/` (`default-m.svg` / `default-l.svg`); copied into `dist/banners/` on build. */
function defaultBannerVectorArtSrc(size: Exclude<BannerSize, 's'>): string {
  const file = size === 'l' ? 'default-l' : 'default-m';
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
   * When omitted: size `s` uses `<EuiIcon type="addDataApp" size="xl" />`; `m` / `l` use default vector art from `public/banners/`; `l` + `screenshot` uses the specimen PNG instead of `default-l.svg`.
   * Pass `null` to hide the lead slot entirely.
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
  /** When true, primary CTA uses filled `EuiButton` (`fill`). */
  primaryButtonFill?: boolean;
  /** When false, the dismiss control is hidden and S/M end padding is reduced (specimen chrome). */
  dismissable?: boolean;
  /**
   * When the specimen panel uses a subdued page background, use `backgroundBasePlain` on the
   * banner shell instead of `backgroundBaseHighlighted` so the banner still reads on the panel.
   */
  onSubduedSpecimenPanel?: boolean;
  /**
   * When `true` with `size="l"`, uses the specimen UI screenshot instead of the default vector art.
   * The screenshot slot is **320×160** at the default theme scale (`20×` / `10×` theme `base` px).
   * Ignored for `size="s"` / `"m"` and when `image` is set (including `null`).
   */
  screenshot?: boolean;
  /** When `false` and using screenshot art, removes left, top, and bottom shell padding. Default `true`. */
  screenshotPaddings?: boolean;
  /**
   * Super-narrow specimen: lead media (icon, vector, or screenshot) spans the full width on top;
   * title, body, and actions stack below (see Figma Banners–toasts–callouts super-narrow frames).
   */
  stackLeadMediaVertically?: boolean;
};

/**
 * Full-width-style banner shell aligned to callout spacing and typography (no left stripe).
 * Sizes `m` / `s` match callout rhythm; `l` uses wider horizontal inset on the shell and content-box block padding. When `image` is omitted, size `s` uses `EuiIcon` (`addDataApp`, `xl`); `m` / `l` use default SVGs from `public/banners/`; `l` + `screenshot` uses `specimen-screenshot.png` in a **320×160** slot (`20×` / `10×` theme `base` px). Override or hide with `image` / `image={null}`. Lead slot: `2×` / `5×` / `7.5×` theme `base` (S / M / L); image-to-copy gap `size.base` on `s` (~16px at default scale) / `base` (`m`) / `l` (`l`). Default shell uses `backgroundBaseHighlighted` (or `backgroundBasePlain` when `onSubduedSpecimenPanel`); subdued border; body subdued; dismiss `text`.
 * At container width ≥`layoutBreakpointPx` on the root, `notification-content-box` lays out lead and actions in a row with vertical centering (`align-items: center`) and `size.xxl` gap (~40px at default scale), matching wide callouts. When `stackLeadMediaVertically` is set, media stays above copy regardless of container width.
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
  primaryButtonFill = false,
  dismissable = true,
  onSubduedSpecimenPanel = false,
  screenshot = false,
  screenshotPaddings = true,
  stackLeadMediaVertically = false,
}: BannerProps) {
  const { euiTheme } = useEuiTheme();
  const bg = onSubduedSpecimenPanel
    ? euiTheme.colors.backgroundBasePlain
    : euiTheme.colors.backgroundBaseHighlighted;
  const edge = euiTheme.colors.borderBaseSubdued;
  const btnColor = 'primary';
  const specimenBorderRadius = '4px';
  const thin = euiTheme.border.width.thin;
  const isS = size === 's';
  const isL = size === 'l';
  const useScreenshotArt = screenshot && isL && image === undefined;

  /**
   * Shell padding (top / right / bottom / left). Size L with `screenshot` art: `size.base` (~16px) start inset.
   * Size `s` start inset: `1.25×` theme `base` (~20px at 16px base). Otherwise: `s` / `m` dismissable ends; L `xxl`/`xl`; non-dismissable tightening.
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
      ? `${euiTheme.base * 1.25}px`
      : isL
        ? euiTheme.size.xxl
        : euiTheme.size.l;
  const padLeft = useScreenshotArt
    ? screenshotPaddings ? euiTheme.size.base : '0'
    : isS
      ? `${euiTheme.base * 1.25}px`
      : isL
        ? euiTheme.size.xl
        : `${euiTheme.base * 1.25}px`;
  const effectivePadTop = useScreenshotArt && !screenshotPaddings ? '0' : padTop;
  const effectivePadBottom = useScreenshotArt && !screenshotPaddings ? '0' : padBottom;

  const rootPadding = `${effectivePadTop} ${padRight} ${effectivePadBottom} ${padLeft}`;
  /** Top/bottom padding for the inner body; size `s` uses shell padding instead (see `rootPadding`). */
  const contentPaddingBlock =
    size === 's' || (useScreenshotArt && !screenshotPaddings) ? '0' : euiTheme.size.base;
  /** Dismiss cross: **8px** from top and right (`size.s`). */
  const dismissCrossInset = euiTheme.size.s;
  const closeInset = dismissCrossInset;
  const closeInsetInline = dismissCrossInset;
  /** Stacked title ↔ body (text box): M matches toast (`size.xs`); L uses `size.s` (8px at default theme scale). */
  const titleBodyGap = size === 'm' ? euiTheme.size.xs : euiTheme.size.s;
  /** Lead stack ↔ action buttons: `s` on compact, `m` (≈12px) on M/L. */
  const leadToActionsGap = isS ? euiTheme.size.s : euiTheme.size.m;
  /** Top/bottom inset on the content box: size `l` only (`size.s` ≈ 8px); M/S have no extra block padding. */
  const copyStackPaddingBlock = useScreenshotArt ? euiTheme.size.l : isL ? euiTheme.size.s : 0;
  const actionsGutter = isS ? 'xs' : 's';
  /** Large banner: primary/secondary use `m` controls; M/S stay `s`. */
  const actionButtonSize = isL ? 'm' : 's';
  const showPrimaryButton = !hidePrimaryButton;
  const showSecondaryButton = !hideSecondaryButton;
  const showActionButtons = showPrimaryButton || showSecondaryButton;
  const resolvedImage: ReactNode | null =
    image === undefined
      ? isS
        ? <EuiIcon type="addDataApp" size="xl" aria-hidden />
        : (
            <img
              src={defaultBannerVectorArtSrc(size)}
              alt=""
              css={css`
                display: block;
                width: 100%;
                height: 100%;
                object-fit: contain;
                object-position: unset;
              `}
            />
          )
      : image;
  const hasImage = useScreenshotArt || resolvedImage != null;
  /** Lead slot edge length (icon or legacy `<img>`): `xl` (32px) on S, `5×base` on M, `7.5×base` on L. */
  const imageSlotSize = isS
    ? euiTheme.size.xl
    : isL
      ? `calc(${euiTheme.size.base} * 7.5)`
      : `${euiTheme.base * 5}px`;
  /** `s`: `size.base` (~16px at default scale); `m`: `base`; `l`: `l`. */
  const imageLeadGap = isS
    ? euiTheme.size.base
    : isL
      ? euiTheme.size.l
      : euiTheme.size.base;
  /** Screenshot (size L only): gap between image slot and copy. */
  const leadImageRowGap = useScreenshotArt ? euiTheme.size.xl : imageLeadGap;
  const stackedLead = stackLeadMediaVertically && hasImage;
  const leadRowGap = stackedLead ? euiTheme.size.l : leadImageRowGap;
  /** Cap lead copy width (75 × theme base ≈ 1200px at default scale). */
  const textBoxMaxWidth = `${euiTheme.base * 75}px`;

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
    margin-inline-start: ${euiTheme.border.width.thick};
    vertical-align: baseline;
  `;

  /** Size S + stacked media: title and body as blocks (super-narrow Figma). */
  const sLeadStackedWrapCss = css`
    min-width: 0;
    word-break: break-word;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${titleBodyGap};

    h5,
    .euiTitle {
      margin-block: 0;
      margin-inline: 0;
      padding-block: 0;
      padding-inline: 0;
    }
  `;
  const sLeadStackedHeadingCss = css`
    display: block;
    margin: 0;
  `;
  const sLeadStackedBodyCss = css`
    &.euiText {
      display: block;
    }
    margin-block: 0;
    margin-inline: 0;
  `;

  const wideLeadActionsMinWidth = `${layoutBreakpointPx}px`;

  const wideContentBoxRowCss = css`
    @container banner (min-width: ${wideLeadActionsMinWidth}) {
      flex-direction: row;
      align-items: center;
      gap: ${euiTheme.size.xxl};

      [data-slot='${notificationSlots.textWrapper}'] {
        flex: 1;
        min-width: 0;
      }
    }
  `;

  const leadWithImageRowCss = stackedLead
    ? css`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${leadRowGap};
        min-width: 0;
      `
    : css`
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: ${leadRowGap};
        min-width: 0;
      `;

  const leadWithImageContentBoxCss = css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    align-self: stretch;
    gap: ${leadToActionsGap};
    flex: 1;
    min-width: 0;
    ${stackedLead
      ? css`
          width: 100%;
        `
      : css``}
    padding-block: ${copyStackPaddingBlock};
    ${stackedLead ? css`` : wideContentBoxRowCss}
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

  const imageSlotCss = stackedLead
    ? css`
        width: 100%;
        min-width: 0;
        height: auto;
        min-height: ${isS ? euiTheme.size.xxl : `calc(${euiTheme.size.base} * 6)`};
        max-height: ${isL ? `calc(${euiTheme.size.base} * 12)` : `calc(${euiTheme.size.base} * 8)`};
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

  const actionsWideColumnCss = stackedLead
    ? css``
    : css`
        @container banner (min-width: ${wideLeadActionsMinWidth}) {
          flex-shrink: 0;
          align-self: stretch;
        }
      `;

  const actionsWideFlexCss = stackedLead
    ? css``
    : css`
        @container banner (min-width: ${wideLeadActionsMinWidth}) {
          flex-direction: row-reverse;
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
        <div css={stackedLead ? sLeadStackedWrapCss : sLeadWrapCss}>
          <EuiTitle size="xxs">
            <h5 css={stackedLead ? sLeadStackedHeadingCss : sLeadHeadingCss}>
              {title}
              {!hideDescription && !stackedLead ? '.' : null}
            </h5>
          </EuiTitle>
          {!hideDescription && children != null ? (
            <EuiText
              size="s"
              color="subdued"
              component={stackedLead ? 'div' : 'span'}
              css={stackedLead ? sLeadStackedBodyCss : sLeadBodyCss}
            >
              {children}
            </EuiText>
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
        ${actionsWideColumnCss}
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
          ${actionsWideFlexCss}
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
                fill={primaryButtonFill}
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
      data-banner-stacked-media={stackedLead || undefined}
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
            {useScreenshotArt ? (
              <BannerScreenshot
                data-slot={notificationSlots.imageBox}
                mediaStackedLayout={stackedLead}
              />
            ) : (
              <div data-slot={notificationSlots.imageBox} css={imageSlotCss}>
                {resolvedImage}
              </div>
            )}
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
