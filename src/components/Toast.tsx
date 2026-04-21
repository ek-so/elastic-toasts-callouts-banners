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
  dismissable?: boolean;
  /**
   * When set to a positive finite duration (ms), the **top** 3px accent is a determinate bar
   * (`borderBase*` track per semantic color, `borderStrong*` fill) for elapsed time vs this total—replacing the solid
   * stripe—and `onDismiss` runs once when it elapses (in addition to manual dismiss).
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

/** Unfilled live bar track — semantic `borderBase*` (same mapping as callout shell borders). */
function liveProgressTrackColor(
  euiTheme: ReturnType<typeof useEuiTheme>['euiTheme'],
  color: ToastColor
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

/**
 * Toast card aligned to Figma node 6150:6490 (Banners–toasts–callouts):
 * 3px top accent—solid stripe (2px radius) by default, or a live bar (`euiTheme.border.radius.small` on track + fill) when `liveDurationMs` is set—
 * absolutely positioned (not `::after`), 16px leading inset to the icon, 40px end padding for dismiss, `useEuiShadow('l')` so
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
  /** Live progress track + fill: single theme radius on all corners (`1×` = `border.radius.small`). */
  const liveProgressRadius = euiTheme.border.radius.small;
  const shadowStyles = useEuiShadow('l', { borderAllInHighContrastMode: false });
  const paddingEnd = dismissable ? '40px' : euiTheme.size.base;
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

  /** 10px from top/right at default scale: `size.xs` + `size.xs` + `border.width.thick`. */
  const dismissFromEdge = `calc(${euiTheme.size.xs} + ${euiTheme.size.xs} + ${euiTheme.border.width.thick})`;
  const showPrimaryButton = !hidePrimaryButton;
  const showSecondaryButton = !hideSecondaryButton;
  const showActionButtons = showPrimaryButton || showSecondaryButton;

  const closeCss = css`
    position: absolute;
    z-index: 3;
    top: ${dismissFromEdge};
    right: ${dismissFromEdge};
  `;

  const handleDismissClick = () => {
    timerCancelledRef.current = true;
    onDismiss?.();
  };

  const liveDuration = showLiveProgress ? (liveDurationMs as number) : 0;
  const liveProgressPct =
    showLiveProgress && liveDuration > 0
      ? Math.min(100, (100 * elapsedMs) / liveDuration)
      : 0;
  const liveProgressTrack = liveProgressTrackColor(euiTheme, color);
  const liveProgressFill = stripeAccentColor(euiTheme, color);
  /** Same footprint as the solid stripe: full-width top band, semantic `borderBase*` track + `borderStrong*` fill. */
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
  `;
  const liveProgressFillCss = css`
    height: 100%;
    width: ${liveProgressPct}%;
    max-width: 100%;
    border-radius: ${liveProgressRadius};
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
          aria-valuenow={Math.round(elapsedMs)}
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
        <NotificationIconLead color={color} iconSlotPx={20} iconToCopyGap={euiTheme.size.m}>
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
