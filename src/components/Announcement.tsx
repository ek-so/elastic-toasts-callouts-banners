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
import { AnnouncementScreenshot } from './AnnouncementScreenshot';

export type AnnouncementSize = 'm' | 's' | 'l';

/** Default M/L vector art in `public/announcements/` (`default-m.svg` / `default-l.svg`); copied into `dist/announcements/` on build. */
function defaultAnnouncementVectorArtSrc(size: Exclude<AnnouncementSize, 's'>): string {
  const file = size === 'l' ? 'default-l' : 'default-m';
  const publicPath =
    typeof __webpack_public_path__ === 'string' && __webpack_public_path__ !== ''
      ? __webpack_public_path__
      : '/';
  const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
  return `${base}announcements/${file}.svg`;
}

export type AnnouncementProps = {
  title: ReactNode;
  children?: ReactNode;
  /**
   * Optional media override (e.g. `<img alt="" />` or `<EuiIcon />`).
   * When omitted: size `s` uses `<EuiIcon type="addDataApp" size="xl" />`; `m` / `l` use default vector art from `public/announcements/`; `l` + `screenshot` uses the specimen PNG instead of `default-l.svg`.
   * Pass `null` to hide the lead slot entirely.
   */
  image?: ReactNode | null;
  /** `s` / `m` match callout spacing; `l` uses the same vertical content inset as `m` plus a wider horizontal shell (tokens). */
  size?: AnnouncementSize;
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
   * announcement shell instead of `backgroundBaseHighlighted` so the announcement still reads on the panel.
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
   * title, body, and actions stack below (see Figma Announcements–toasts–callouts super-narrow frames).
   */
  stackLeadMediaVertically?: boolean;
};

/**
 * Full-width-style announcement shell aligned to callout spacing and typography (no left stripe).
 * Sizes `m` / `s` match callout rhythm; `l` uses wider horizontal inset on the shell and content-box block padding. When `image` is omitted, size `s` uses `EuiIcon` (`addDataApp`, `xl`); `m` / `l` use default SVGs from `public/announcements/`; `l` + `screenshot` uses `specimen-screenshot.png` in a **320×160** slot (`20×` / `10×` theme `base` px). Override or hide with `image` / `image={null}`. Lead slot: `2×` / `5×` / `7.5×` theme `base` (S / M / L); image-to-copy gap `size.base` on `s` (~16px at default scale) / `base` (`m`) / `l` (`l`); super-narrow stacked `l` uses `size.base` (~16px) between lead media and copy. Size `s` shell start inset uses `size.base` (~16px); size `m` default shell start inset uses `size.base` (~16px); super-narrow stacked (`stackLeadMediaVertically` + lead media) uses `size.base` (~16px) on all shell sides for `s`, `size.base` (~16px) on all sides for `m`, and `size.l` (~24px) on all sides for `l` with vector/custom image (not specimen screenshot). Super-narrow stacked layouts mirror start inset on the end (`padRight` = `padLeft`), including L + specimen screenshot. Default shell uses `backgroundBaseHighlighted` (or `backgroundBasePlain` when `onSubduedSpecimenPanel`); subdued border; body subdued; dismiss `text`.
 * At container width ≥`layoutBreakpointPx` on the root, `notification-content-box` lays out lead and actions in a row with vertical centering (`align-items: center`) and `size.xxl` gap (~40px at default scale), matching wide callouts. When `stackLeadMediaVertically` is set, media stays above copy regardless of container width.
 */
export function Announcement({
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
}: AnnouncementProps) {
  const { euiTheme } = useEuiTheme();
  const bg = onSubduedSpecimenPanel
    ? euiTheme.colors.backgroundBasePlain
    : euiTheme.colors.backgroundBaseHighlighted;
  const edge = euiTheme.colors.borderBaseSubdued;
  const btnColor = 'primary';
  const specimenBorderRadius = '4px';
  const thin = euiTheme.border.width.thin;
  const isS = size === 's';
  const isM = size === 'm';
  const isL = size === 'l';
  const useScreenshotArt = screenshot && isL && image === undefined;

  /** Dismiss cross: **8px** from top and right (`size.s`). */
  const dismissCrossInset = euiTheme.size.s;
  const closeInset = dismissCrossInset;
  const closeInsetInline = dismissCrossInset;
  /** Stacked title ↔ body (text box): M matches toast (`size.xs`); L uses `size.s` (8px at default theme scale). */
  const titleBodyGap = size === 'm' ? euiTheme.size.xs : euiTheme.size.s;
  /** Lead stack ↔ action buttons: `s` on compact, `m` (≈12px) on M/L. */
  const leadToActionsGap = isS ? euiTheme.size.s : euiTheme.size.m;
  const actionsGutter = isS ? 'xs' : 's';
  /** Large announcement: primary/secondary use `m` controls; M/S stay `s`. */
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
              src={defaultAnnouncementVectorArtSrc(size)}
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
  /**
   * Top/bottom inset on `notification-content-box` when it sits beside/under lead media: L row uses `size.s` (~8px);
   * L screenshot uses `size.l`. Super-narrow stacked L screenshot: `size.l` (~24px) on all sides of the content box; vector stacked `l`: `0` block (spacing from shell / gaps).
   */
  const copyStackPaddingBlock =
    isL && stackedLead && useScreenshotArt
      ? euiTheme.size.l
      : isL && stackedLead
        ? 0
        : useScreenshotArt
          ? euiTheme.size.l
          : isL
            ? euiTheme.size.s
            : 0;
  const stackedSuperNarrowS = isS && stackedLead;
  const stackedSuperNarrowM = isM && stackedLead;
  /** Large super-narrow with vector/custom image (not specimen screenshot): shell padding on all sides uses `size.l` (~24px). */
  const stackedSuperNarrowLImage = isL && stackedLead && !useScreenshotArt;
  /** Top/bottom padding for the inner body; size `s` uses shell padding instead (see `rootPadding`). Medium super-narrow and large super-narrow (non-screenshot) use shell-only vertical padding. */
  const contentPaddingBlock =
    size === 's' ||
    (useScreenshotArt && !screenshotPaddings) ||
    stackedSuperNarrowM ||
    stackedSuperNarrowLImage
      ? '0'
      : euiTheme.size.base;
  /**
   * Shell padding (top / right / bottom / left). Size L with `screenshot` art: `size.base` (~16px) start inset.
   * Size `s` start inset: `size.base` (~16px). Super-narrow (`stackLeadMediaVertically` + image): `s` uses `size.base` (~16px) on all sides; `m` uses `size.base` (~16px) on all sides; `l` with vector/custom image (not screenshot) uses `size.l` (~24px) on all sides; shell end inset matches start inset (`padRight` = `padLeft`). Size `m` default start inset: `size.base` (~16px). Otherwise `s` top/bottom `12px`, dismissable end `40px`; L `xxl`/`xl`; non-dismissable tightening.
   */
  const padTop = isS
    ? stackedSuperNarrowS
      ? euiTheme.size.base
      : '12px'
    : stackedSuperNarrowM
      ? euiTheme.size.base
      : stackedSuperNarrowLImage
        ? euiTheme.size.l
        : '0';
  const padBottom = isS
    ? stackedSuperNarrowS
      ? euiTheme.size.base
      : '12px'
    : stackedSuperNarrowM
      ? euiTheme.size.base
      : stackedSuperNarrowLImage
        ? euiTheme.size.l
        : '0';
  const padLeft = useScreenshotArt
    ? screenshotPaddings ? euiTheme.size.base : '0'
    : isS
      ? euiTheme.size.base
      : isL
        ? stackedSuperNarrowLImage
          ? euiTheme.size.l
          : euiTheme.size.xl
        : euiTheme.size.base;
  /** Super-narrow (`stackedLead`): end inset matches start inset; otherwise dismissable / non-dismissable end rules apply. */
  const padRight = stackedLead
    ? padLeft
    : dismissable
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
  const effectivePadTop = useScreenshotArt && !screenshotPaddings ? '0' : padTop;
  const effectivePadBottom = useScreenshotArt && !screenshotPaddings ? '0' : padBottom;

  const rootPadding = `${effectivePadTop} ${padRight} ${effectivePadBottom} ${padLeft}`;
  /** Stacked super-narrow: only L + specimen screenshot spans full width on top; other media keeps narrow/wide slot size. */
  const stackedFullWidthScreenshotTop = stackedLead && useScreenshotArt;
  /** Stacked `s` / `m`: `size.m` (~12px) between lead media and copy; stacked `l` vector: `size.base` (~16px); stacked L screenshot: `0`. */
  const leadRowGap =
    stackedLead && useScreenshotArt
      ? 0
      : stackedLead && (isS || isM)
        ? euiTheme.size.m
        : stackedLead
          ? euiTheme.size.base
          : leadImageRowGap;
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
    @container announcement (min-width: ${wideLeadActionsMinWidth}) {
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
    ${stackedLead && useScreenshotArt
      ? css`
          padding-inline: ${euiTheme.size.l};
        `
      : css``}
    ${stackedLead ? css`` : wideContentBoxRowCss}
  `;

  const rootCss = css`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    container-type: inline-size;
    container-name: announcement;
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

  /** L + specimen screenshot + super-narrow (`stackedLead`): dismiss uses `textParagraph` on the control, `textGhost` on the icon; hover fill is 16% `emptyShade`. */
  const lScreenshotDismissChromeCss = css`
    display: inline-flex;
    line-height: 0;

    .euiButtonIcon {
      color: ${euiTheme.colors.textParagraph};
    }

    .euiButtonIcon .euiButtonIcon__icon {
      color: ${euiTheme.colors.textGhost};
    }

    &:hover .euiButtonIcon,
    &:focus-within .euiButtonIcon {
      background-color: color-mix(in srgb, ${euiTheme.colors.emptyShade} 16%, transparent);
    }
  `;

  const imageSlotCss =
    stackedLead && !useScreenshotArt
      ? css`
          width: ${imageSlotSize};
          height: ${imageSlotSize};
          flex-shrink: 0;
          align-self: flex-start;
          display: flex;
          align-items: center;
          justify-content: flex-start;
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
        @container announcement (min-width: ${wideLeadActionsMinWidth}) {
          flex-shrink: 0;
          align-self: stretch;
        }
      `;

  const actionsWideFlexCss = stackedLead
    ? css``
    : css`
        @container announcement (min-width: ${wideLeadActionsMinWidth}) {
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
      data-test-subj="announcement"
      data-announcement-size={size}
      data-announcement-has-image={hasImage || undefined}
      data-announcement-screenshot={useScreenshotArt || undefined}
      data-announcement-stacked-media={stackedLead || undefined}
    >
      {dismissable ? (
        <span css={closeCss}>
          <span css={useScreenshotArt && stackedLead ? lScreenshotDismissChromeCss : undefined}>
            <EuiButtonIcon
              iconType="cross"
              color="text"
              size="xs"
              display="empty"
              aria-label="Dismiss notification"
              onClick={() => onDismiss?.()}
            />
          </span>
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
              <AnnouncementScreenshot
                data-slot={notificationSlots.imageBox}
                mediaStackedLayout={stackedFullWidthScreenshotTop}
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
