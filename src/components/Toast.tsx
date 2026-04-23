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
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { NotificationIconLead } from './NotificationTitleBox';
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
  /** When true, primary CTA uses filled `EuiButton` (`fill`). */
  primaryButtonFill?: boolean;
  /** Status lead icon uses filled glyphs by default; set `false` for outline icons. */
  filledIcons?: boolean;
  dismissable?: boolean;
  /**
   * When set to a positive finite duration (ms), the **top** 3px accent is a determinate bar
   * (`backgroundLight*` track, `backgroundFilled*` fill per semantic color; **warning** uses `borderStrongWarning` for
   * the fill): fill starts at 100% width, anchored at inline-start, and depletes to 0% so its trailing edge moves toward inline-start (e.g. right-to-left in LTR)—replacing
   * the solid stripe—and `onDismiss` runs once when it elapses (in addition to manual dismiss).
   */
  liveDurationMs?: number;
  /** Increment (or any change) to restart the live bar from 0 without remounting the toast. */
  liveProgressResetKey?: number;
};

/** Stripe accent fill — same hues as `borderStrong*` (separate layer, not a border property). */
function stripeAccentColor(
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

/** Live bar track — semantic `backgroundLight*` (lighter band behind the fill). */
function liveProgressTrackColor(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: ToastColor
): string {
  switch (color) {
    case 'neutral':
      return euiTheme.colors.backgroundLightPrimary;
    case 'success':
      return euiTheme.colors.backgroundLightSuccess;
    case 'warning':
      return euiTheme.colors.backgroundLightWarning;
    case 'danger':
      return euiTheme.colors.backgroundLightDanger;
  }
}

/** Live bar fill — `backgroundFilled*` except **warning**, which uses `borderStrongWarning`. */
function liveProgressFillColor(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: ToastColor
): string {
  switch (color) {
    case 'neutral':
      return euiTheme.colors.backgroundFilledPrimary;
    case 'success':
      return euiTheme.colors.backgroundFilledSuccess;
    case 'warning':
      return euiTheme.colors.borderStrongWarning;
    case 'danger':
      return euiTheme.colors.backgroundFilledDanger;
  }
}

/**
 * Toast card aligned to Figma node 6150:6490 (Banners–toasts–callouts):
 * 3px top accent—solid stripe (2px radius) by default, or a live bar (`euiTheme.border.radius.small` on track + fill) when `liveDurationMs` is set (fill anchored inline-start, width 100%→0%, trailing edge moves right to left in LTR)—
 * absolutely positioned (not `::after`), 16px leading inset to the icon, `size.xl` end padding for dismiss (32px), dismiss cross **7px** from top / **`size.xs`** from right, `useEuiShadow('l')` so
 * dark mode can add the refresh-variant floating border on `::after` without conflicting.
 * Primary CTA uses base `EuiButton` (`fill` from `primaryButtonFill`, default unfilled) + semantic `color`;
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
  primaryButtonFill = false,
  filledIcons = true,
  dismissable = true,
  liveDurationMs,
  liveProgressResetKey = 0,
}: ToastProps) {
  const euiThemeContext = useEuiTheme();
  const { euiTheme } = euiThemeContext;
  const stripeAccent = stripeAccentColor(euiTheme, color);
  const btnColor = buttonColor(color);
  /** Top solid stripe and live countdown bar (spec). */
  const topAccentHeight = '3px';
  const specimenBorderRadius = '2px';
  /** Live progress track: uniform theme radius; fill uses `1 1 1 0` (TL, TR, BR, BL) with `border.radius.small` for the rounded corners. */
  const liveProgressRadius = euiTheme.border.radius.small;
  const shadowStyles = useEuiShadow('l', { borderAllInHighContrastMode: false });
  const paddingEnd = dismissable ? euiTheme.size.xl : euiTheme.size.base;
  const paddingTopWithStripe = `calc(${topAccentHeight} + ${euiTheme.size.base})`;
  const showLiveProgress =
    typeof liveDurationMs === 'number' && liveDurationMs > 0 && Number.isFinite(liveDurationMs);
  const paddingBottom = euiTheme.size.base;

  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const timerCancelledRef = useRef(false);
  const autoCompleteFiredRef = useRef(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!showLiveProgress) {
      setElapsedMs(0);
      return;
    }

    timerCancelledRef.current = false;
    autoCompleteFiredRef.current = false;
    setElapsedMs(0);

    const duration = liveDurationMs as number;
    const start = performance.now();
    let raf = 0;
    let alive = true;

    const loop = (now: number) => {
      if (!alive || timerCancelledRef.current) {
        return;
      }

      const elapsed = Math.min(now - start, duration);
      setElapsedMs(elapsed);

      if (elapsed >= duration) {
        if (!autoCompleteFiredRef.current) {
          autoCompleteFiredRef.current = true;
          onDismissRef.current?.();
        }
        return;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [liveDurationMs, liveProgressResetKey, showLiveProgress]);

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
    padding: ${paddingTopWithStripe} ${paddingEnd} ${paddingBottom} 16px;
    word-break: break-word;
    ${shadowStyles}
  `;

  const stripeCss = css`
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    top: 0;
    height: ${topAccentHeight};
    background-color: ${stripeAccent};
    border-radius: ${specimenBorderRadius};
    pointer-events: none;
  `;

  /** Toast dismiss: **7px** from top, **4px** from right (`size.xs`). */
  const dismissCrossTop = '7px';
  const dismissCrossRight = euiTheme.size.xs;
  const showPrimaryButton = !hidePrimaryButton;
  const showSecondaryButton = !hideSecondaryButton;
  const showActionButtons = showPrimaryButton || showSecondaryButton;

  const closeCss = css`
    position: absolute;
    z-index: 3;
    top: ${dismissCrossTop};
    right: ${dismissCrossRight};
  `;

  const handleDismissClick = () => {
    timerCancelledRef.current = true;
    onDismiss?.();
  };

  const liveDuration = showLiveProgress ? (liveDurationMs as number) : 0;
  const elapsedPct =
    showLiveProgress && liveDuration > 0
      ? Math.min(100, (100 * elapsedMs) / liveDuration)
      : 0;
  /** Fill width depletes 100% → 0% (remaining time); start-aligned so the trailing edge travels toward inline-start (LTR: right to left). */
  const liveFillRemainingPct = 100 - elapsedPct;
  const liveRemainingMs = showLiveProgress
    ? Math.max(0, liveDuration - Math.min(elapsedMs, liveDuration))
    : 0;
  const liveProgressTrack = liveProgressTrackColor(euiTheme, color);
  const liveProgressFill = liveProgressFillColor(euiTheme, color);
  /** Same footprint as the solid stripe: full-width top band, `backgroundLight*` track + fill (`backgroundFilled*`, warning: `borderStrongWarning`). */
  const liveTopAccentTrackCss = css`
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    top: 0;
    height: ${topAccentHeight};
    overflow: hidden;
    border-radius: ${liveProgressRadius};
    pointer-events: none;
    background-color: ${liveProgressTrack};
    display: flex;
    flex-direction: row;
    justify-content: start;
  `;
  const liveProgressFillCss = css`
    height: 100%;
    width: ${liveFillRemainingPct}%;
    max-width: 100%;
    flex-shrink: 0;
    border-radius: ${liveProgressRadius} ${liveProgressRadius} ${liveProgressRadius} 0;
    background-color: ${liveProgressFill};
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
      {showLiveProgress ? (
        <div
          role="progressbar"
          aria-label="Auto-dismiss progress"
          aria-valuemin={0}
          aria-valuemax={liveDuration}
          aria-valuenow={Math.round(liveRemainingMs)}
          data-test-subj="toast-live-progress"
          css={liveTopAccentTrackCss}
        >
          <div aria-hidden css={liveProgressFillCss} />
        </div>
      ) : (
        <span aria-hidden css={stripeCss} />
      )}
      {dismissable ? (
        <span css={closeCss}>
          <EuiButtonIcon
            iconType="cross"
            color="text"
            size="xs"
            display="empty"
            aria-label="Dismiss notification"
            onClick={handleDismissClick}
          />
        </span>
      ) : null}

      <div
        data-slot={notificationSlots.contentBox}
        css={css`
          position: relative;
          z-index: 2;
          min-width: 0;
        `}
      >
        <NotificationIconLead
          color={color}
          iconSlotPx={20}
          iconToCopyGap={euiTheme.size.m}
          statusIconFilled={filledIcons}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              align-items: stretch;
              gap: ${euiTheme.size.m};
              min-width: 0;
              flex: 1 1 auto;
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
                <EuiTitle size="xs">
                  <h4>{title}</h4>
                </EuiTitle>
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
        </NotificationIconLead>
      </div>
    </div>
  );
}
