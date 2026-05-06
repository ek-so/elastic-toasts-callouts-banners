import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  EuiButton,
  EuiButtonGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTextArea,
  useEuiTheme,
} from '@elastic/eui';

import { Announcement, type AnnouncementSize } from './components/Announcement';
import { Callout } from './components/Callout';
import { Toast } from './components/Toast';

type TopicTab = 'toasts' | 'callouts' | 'announcements';

/** Announcements tab only: panel fill vs announcement shell fill for subdued specimen context. */
type AnnouncementsPanelMode = 'plain' | 'subdued';

type SpecimenCopy = { title: string; description: string };

/** Min line count via `rows`; height grows with content (no inner scroll). */
function useAutosizeTextAreaRef(value: string, syncTrigger?: unknown) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.overflow = 'hidden';
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
  }, [value, resize, syncTrigger]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  return ref;
}

const INITIAL_SPECIMEN_COPY: Record<TopicTab, SpecimenCopy> = {
  toasts: {
    title: 'Toast title',
    description:
      'Shared toast body across neutral, success, warning, and danger—compare shadow, stripe, and actions in the stack.',
  },
  callouts: {
    title: 'Callout title',
    description:
      'Shared callout body for size M and S in every color—check stripe, borders, and wide layout at the breakpoint.',
  },
  announcements: {
    title: 'Announcement title',
    description:
      'Shared announcement body for S, M, and L (vector art or optional L-only screenshot)—stress-wrap in narrow columns, wide rows at the layout breakpoint so line length and action alignment are easy to compare.',
  },
};

export type AppColorMode = 'LIGHT' | 'DARK';

export type AppContentWidth = 'narrow' | 'wide' | 'superNarrow';

/** Narrow / wide column cap and main layout media query (inclusive `max-width`). */
const DEFAULT_NARROW_MAX_WIDTH_PX = 1000;

/** Announcements super-narrow column cap, second media query, and `layoutBreakpointPx` in that mode. */
const DEFAULT_SUPER_NARROW_MAX_WIDTH_PX = 600;

/** Toast specimens only: top-accent live countdown vs auto-dismiss (see Figma Announcements–toasts–callouts). */
const TOAST_SPECIMEN_LIVE_MS = 15_000;

/**
 * Temporary: omit size-L announcement specimen that uses default vector art (`default-l.svg`).
 * The L + screenshot specimen stays.
 */
const SHOW_ANNOUNCEMENT_L_VECTOR_SPECIMEN = false;

/** Label above each specimen row, aligned with callouts (`Size M`, `Size S`, …). */
function specimenSizeLabel(size: AnnouncementSize): string {
  return `Size ${size.toUpperCase()}`;
}

function AnnouncementSizeSection({
  size,
  layoutBreakpointPx,
  stackLeadMediaVertically,
  hideDescription,
  hidePrimaryButton,
  hideSecondaryButton,
  primaryButtonFill,
  dismissable,
  onSubduedSpecimenPanel,
  specimenDescription,
  specimenTitle,
  screenshotPaddings,
}: {
  size: AnnouncementSize;
  layoutBreakpointPx: number;
  /** Announcements super-narrow: media row on top, copy and actions below. */
  stackLeadMediaVertically: boolean;
  hideDescription: boolean;
  hidePrimaryButton: boolean;
  hideSecondaryButton: boolean;
  primaryButtonFill: boolean;
  dismissable: boolean;
  onSubduedSpecimenPanel: boolean;
  specimenDescription: string;
  specimenTitle: string;
  screenshotPaddings: boolean;
}) {
  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <strong>{specimenSizeLabel(size)}</strong>
          </p>
        </EuiText>
      </EuiFlexItem>
      {size === 'l' ? (
        <EuiFlexItem grow={false}>
          <Announcement
            dismissable={dismissable}
            hideDescription={hideDescription}
            hidePrimaryButton={hidePrimaryButton}
            primaryButtonFill={primaryButtonFill}
            hideSecondaryButton={hideSecondaryButton}
            layoutBreakpointPx={layoutBreakpointPx}
            onSubduedSpecimenPanel={onSubduedSpecimenPanel}
            screenshot
            screenshotPaddings={screenshotPaddings}
            size={size}
            stackLeadMediaVertically={stackLeadMediaVertically}
            title={specimenTitle}
          >
            {specimenDescription}
          </Announcement>
        </EuiFlexItem>
      ) : null}
      {size !== 'l' || SHOW_ANNOUNCEMENT_L_VECTOR_SPECIMEN ? (
        <EuiFlexItem grow={false}>
          <Announcement
            dismissable={dismissable}
            hideDescription={hideDescription}
            hidePrimaryButton={hidePrimaryButton}
            primaryButtonFill={primaryButtonFill}
            hideSecondaryButton={hideSecondaryButton}
            layoutBreakpointPx={layoutBreakpointPx}
            onSubduedSpecimenPanel={onSubduedSpecimenPanel}
            size={size}
            stackLeadMediaVertically={stackLeadMediaVertically}
            title={specimenTitle}
          >
            {specimenDescription}
          </Announcement>
        </EuiFlexItem>
      ) : null}
    </>
  );
}

function TopicPanel({
  topic,
  layoutBreakpointPx,
  stackAnnouncementLeadMediaVertically,
  hideDescription,
  hidePrimaryButton,
  hideSecondaryButton,
  primaryButtonFill,
  dismissable,
  announcementsPanelMode,
  specimenDescription,
  specimenTitle,
  toastLiveResetKey,
  screenshotPaddings,
}: {
  topic: TopicTab;
  layoutBreakpointPx: number;
  /** Announcements super-narrow: `Announcement` stacks lead media above copy and actions. */
  stackAnnouncementLeadMediaVertically: boolean;
  hideDescription: boolean;
  hidePrimaryButton: boolean;
  hideSecondaryButton: boolean;
  primaryButtonFill: boolean;
  dismissable: boolean;
  /** Used when `topic === 'announcements'`; `plain` keeps default panel + subdued announcement shells. */
  announcementsPanelMode: AnnouncementsPanelMode;
  specimenDescription: string;
  specimenTitle: string;
  /** Passed to toast specimens so “Reset progress” can restart the top live bar. */
  toastLiveResetKey: number;
  screenshotPaddings: boolean;
}) {
  switch (topic) {
    case 'toasts':
      return (
        <EuiFlexGroup
          direction="column"
          gutterSize="m"
          alignItems="stretch"
          css={{ maxWidth: '100%' }}
        >
          <EuiFlexItem grow={false}>
            <Toast
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              liveDurationMs={TOAST_SPECIMEN_LIVE_MS}
              liveProgressResetKey={toastLiveResetKey}
              color="neutral" title={specimenTitle}>
              {specimenDescription}
            </Toast>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Toast
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              liveDurationMs={TOAST_SPECIMEN_LIVE_MS}
              liveProgressResetKey={toastLiveResetKey}
              color="success" title={specimenTitle}>
              {specimenDescription}
            </Toast>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Toast
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              liveDurationMs={TOAST_SPECIMEN_LIVE_MS}
              liveProgressResetKey={toastLiveResetKey}
              color="warning" title={specimenTitle}>
              {specimenDescription}
            </Toast>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Toast
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              liveDurationMs={TOAST_SPECIMEN_LIVE_MS}
              liveProgressResetKey={toastLiveResetKey}
              color="danger" title={specimenTitle}>
              {specimenDescription}
            </Toast>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    case 'callouts':
      return (
        <EuiFlexGroup
          direction="column"
          gutterSize="m"
          alignItems="stretch"
          css={{ maxWidth: '100%' }}
        >
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <p>
                <strong>Size M</strong>
              </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="m"
              color="neutral"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="m"
              color="success"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="m"
              color="warning"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="m"
              color="danger"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiSpacer size="l" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <p>
                <strong>Size S</strong>
              </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="s"
              color="neutral"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="s"
              color="success"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="s"
              color="warning"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout
              dismissable={dismissable}
              hideDescription={hideDescription}
              hidePrimaryButton={hidePrimaryButton}
              primaryButtonFill={primaryButtonFill}
              hideSecondaryButton={hideSecondaryButton}
              layoutBreakpointPx={layoutBreakpointPx}
              size="s"
              color="danger"
              title={specimenTitle}
            >
              {specimenDescription}
            </Callout>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    case 'announcements':
      return (
        <EuiFlexGroup
          direction="column"
          gutterSize="m"
          alignItems="stretch"
          css={{ maxWidth: '100%' }}
        >
          <AnnouncementSizeSection
            dismissable={dismissable}
            hideDescription={hideDescription}
            hidePrimaryButton={hidePrimaryButton}
            primaryButtonFill={primaryButtonFill}
            hideSecondaryButton={hideSecondaryButton}
            layoutBreakpointPx={layoutBreakpointPx}
            onSubduedSpecimenPanel={announcementsPanelMode === 'subdued'}
            specimenDescription={specimenDescription}
            specimenTitle={specimenTitle}
            screenshotPaddings={screenshotPaddings}
            size="l"
            stackLeadMediaVertically={stackAnnouncementLeadMediaVertically}
          />
          <EuiFlexItem grow={false}>
            <EuiSpacer size="l" />
          </EuiFlexItem>
          <AnnouncementSizeSection
            dismissable={dismissable}
            hideDescription={hideDescription}
            hidePrimaryButton={hidePrimaryButton}
            primaryButtonFill={primaryButtonFill}
            hideSecondaryButton={hideSecondaryButton}
            layoutBreakpointPx={layoutBreakpointPx}
            onSubduedSpecimenPanel={announcementsPanelMode === 'subdued'}
            specimenDescription={specimenDescription}
            specimenTitle={specimenTitle}
            screenshotPaddings={screenshotPaddings}
            size="m"
            stackLeadMediaVertically={stackAnnouncementLeadMediaVertically}
          />
          <EuiFlexItem grow={false}>
            <EuiSpacer size="l" />
          </EuiFlexItem>
          <AnnouncementSizeSection
            dismissable={dismissable}
            hideDescription={hideDescription}
            hidePrimaryButton={hidePrimaryButton}
            primaryButtonFill={primaryButtonFill}
            hideSecondaryButton={hideSecondaryButton}
            layoutBreakpointPx={layoutBreakpointPx}
            onSubduedSpecimenPanel={announcementsPanelMode === 'subdued'}
            specimenDescription={specimenDescription}
            specimenTitle={specimenTitle}
            screenshotPaddings={screenshotPaddings}
            size="s"
            stackLeadMediaVertically={stackAnnouncementLeadMediaVertically}
          />
        </EuiFlexGroup>
      );
    default:
      return null;
  }
}

type AppProps = {
  colorMode: AppColorMode;
  onColorModeChange: (mode: AppColorMode) => void;
};

export function App({ colorMode, onColorModeChange }: AppProps) {
  const { euiTheme } = useEuiTheme();
  /** When `true`, specimen shows body copy (switch on by default). */
  const [showDescription, setShowDescription] = useState(true);
  /** When `true`, specimen shows primary and secondary CTAs (switch on by default). */
  const [showActionButtons, setShowActionButtons] = useState(true);
  /** When `true` and action buttons are on, specimen shows the secondary CTA (callouts and announcements; toasts never show a secondary CTA). */
  const [showSecondaryButton, setShowSecondaryButton] = useState(true);
  /** When `true`, primary CTA uses filled `EuiButton`. */
  const [filledPrimaryButton, setFilledPrimaryButton] = useState(false);
  const [dismissable, setDismissable] = useState(true);
  const [screenshotPaddings, setScreenshotPaddings] = useState(false);
  const [announcementsPanelMode, setAnnouncementsPanelMode] =
    useState<AnnouncementsPanelMode>('plain');
  const [selectedTab, setSelectedTab] = useState<TopicTab>('callouts');
  const [contentWidth, setContentWidth] = useState<AppContentWidth>('narrow');
  const [specimenCopy, setSpecimenCopy] = useState<Record<TopicTab, SpecimenCopy>>(() => ({
    toasts: { ...INITIAL_SPECIMEN_COPY.toasts },
    callouts: { ...INITIAL_SPECIMEN_COPY.callouts },
    announcements: { ...INITIAL_SPECIMEN_COPY.announcements },
  }));
  const [toastLiveResetKey, setToastLiveResetKey] = useState(0);

  const specimenTitle = specimenCopy[selectedTab].title;
  const specimenDescription = specimenCopy[selectedTab].description;
  const titleTextAreaRef = useAutosizeTextAreaRef(specimenTitle);
  const descriptionTextAreaRef = useAutosizeTextAreaRef(specimenDescription, showDescription);

  /**
   * Keep the content-width toggle in sync with the viewport.
   *
   * Callouts / toasts: Wide while the viewport is under the main layout breakpoint → Narrow.
   *
   * Announcements: two breakpoints — viewport ≤ super-narrow px → Super narrow; viewport ≤ main layout
   * px and > super: only **Wide** is coerced to **Narrow** (shrinking from the wide zone); **Narrow**
   * and **Super narrow** are left as-is (same idea as narrow on a large monitor). Above the main
   * breakpoint, the previous mode is kept. Inclusive `max-width` matches the fixed constants below.
   */
  useEffect(() => {
    const mqNarrow = window.matchMedia(`(max-width: ${DEFAULT_NARROW_MAX_WIDTH_PX}px)`);
    const mqSuperNarrow = window.matchMedia(`(max-width: ${DEFAULT_SUPER_NARROW_MAX_WIDTH_PX}px)`);
    const apply = () => {
      const atOrBelowSuper = mqSuperNarrow.matches;
      const atOrBelowNarrow = mqNarrow.matches;

      if (selectedTab === 'announcements') {
        setContentWidth((prev) => {
          if (atOrBelowSuper) return 'superNarrow';
          if (atOrBelowNarrow) {
            return prev === 'wide' ? 'narrow' : prev;
          }
          return prev;
        });
        return;
      }

      setContentWidth((prev) => {
        if (prev === 'wide' && mqNarrow.matches) return 'narrow';
        return prev;
      });
    };
    apply();
    mqNarrow.addEventListener('change', apply);
    mqSuperNarrow.addEventListener('change', apply);
    return () => {
      mqNarrow.removeEventListener('change', apply);
      mqSuperNarrow.removeEventListener('change', apply);
    };
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab !== 'announcements' && contentWidth === 'superNarrow') {
      setContentWidth('narrow');
    }
  }, [selectedTab, contentWidth]);

  /** Super narrow is announcements-only; treat as narrow for layout until state is coerced. */
  const resolvedContentWidth: AppContentWidth =
    selectedTab !== 'announcements' && contentWidth === 'superNarrow' ? 'narrow' : contentWidth;

  const pageMaxWidthPx =
    resolvedContentWidth === 'superNarrow'
      ? DEFAULT_SUPER_NARROW_MAX_WIDTH_PX
      : resolvedContentWidth === 'narrow'
        ? DEFAULT_NARROW_MAX_WIDTH_PX
        : null;

  const pageFrame =
    pageMaxWidthPx !== null
      ? {
          width: '100%',
          maxWidth: `${pageMaxWidthPx}px`,
          margin: '0 auto' as const,
          boxSizing: 'border-box' as const,
          paddingLeft: euiTheme.size.l,
          paddingRight: euiTheme.size.l,
        }
      : {
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box' as const,
          paddingLeft: euiTheme.size.l,
          paddingRight: euiTheme.size.l,
        };

  const announcementLayoutBreakpointPx =
    selectedTab === 'announcements' && resolvedContentWidth === 'superNarrow'
      ? DEFAULT_SUPER_NARROW_MAX_WIDTH_PX
      : DEFAULT_NARROW_MAX_WIDTH_PX;

  const stackAnnouncementLeadMediaVertically =
    selectedTab === 'announcements' && resolvedContentWidth === 'superNarrow';

  const contentWidthButtonOptions =
    selectedTab === 'announcements'
      ? [
          { id: 'superNarrow' as const, label: 'Super narrow' },
          { id: 'narrow' as const, label: 'Narrow' },
          { id: 'wide' as const, label: 'Wide' },
        ]
      : [
          { id: 'narrow' as const, label: 'Narrow' },
          { id: 'wide' as const, label: 'Wide' },
        ];

  return (
    <div
      css={{
        height: '100vh',
        maxHeight: '100vh',
        minHeight: 0,
        boxSizing: 'border-box',
        backgroundColor: euiTheme.colors.emptyShade,
        color: euiTheme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header
        css={{
          flexShrink: 0,
          backgroundColor: euiTheme.colors.emptyShade,
          width: '100%',
          zIndex: 1,
        }}
      >
        <div
          css={{
            ...pageFrame,
            paddingTop: euiTheme.size.m,
            paddingBottom: euiTheme.size.m,
          }}
        >
          <EuiTabs expand bottomBorder size="l" aria-label="Specimen topics">
            <EuiTab
              id="callouts-tab"
              aria-controls="topic-panel"
              isSelected={selectedTab === 'callouts'}
              onClick={() => setSelectedTab('callouts')}
            >
              Callouts
            </EuiTab>
            <EuiTab
              id="announcements-tab"
              aria-controls="topic-panel"
              isSelected={selectedTab === 'announcements'}
              onClick={() => setSelectedTab('announcements')}
            >
              Announcements
            </EuiTab>
            <EuiTab
              id="toasts-tab"
              aria-controls="topic-panel"
              isSelected={selectedTab === 'toasts'}
              onClick={() => setSelectedTab('toasts')}
            >
              Toasts
            </EuiTab>
          </EuiTabs>
        </div>
      </header>

      <main
        id="topic-panel"
        role="tabpanel"
        aria-labelledby={`${selectedTab}-tab`}
        css={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        <div
          css={{
            ...pageFrame,
            paddingTop: euiTheme.size.m,
            paddingBottom: euiTheme.size.l,
          }}
        >
          <EuiFlexGroup
            responsive={false}
            direction="row"
            gutterSize="s"
            alignItems="center"
            wrap
          >
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                legend="Color mode"
                type="single"
                buttonSize="s"
                color="text"
                idSelected={colorMode === 'LIGHT' ? 'light' : 'dark'}
                onChange={(id) => onColorModeChange(id === 'light' ? 'LIGHT' : 'DARK')}
                options={[
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                ]}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                legend="Content width"
                type="single"
                buttonSize="s"
                color="text"
                idSelected={resolvedContentWidth}
                onChange={(id) =>
                  setContentWidth(
                    id === 'wide' ? 'wide' : id === 'superNarrow' ? 'superNarrow' : 'narrow'
                  )
                }
                options={contentWidthButtonOptions}
              />
            </EuiFlexItem>
            {selectedTab === 'announcements' ? (
              <EuiFlexItem grow={false}>
                <EuiButtonGroup
                  legend="Announcement specimen panel"
                  type="single"
                  buttonSize="s"
                  color="text"
                  idSelected={announcementsPanelMode}
                  onChange={(id) => setAnnouncementsPanelMode(id as AnnouncementsPanelMode)}
                  options={[
                    { id: 'plain', label: 'Plain' },
                    { id: 'subdued', label: 'Subdued' },
                  ]}
                />
              </EuiFlexItem>
            ) : null}
            {selectedTab === 'toasts' ? (
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  color="text"
                  fill={false}
                  minWidth={false}
                  onClick={() => setToastLiveResetKey((k) => k + 1)}
                >
                  Reset progress
                </EuiButton>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiFormRow fullWidth label="Title">
            <EuiTextArea
              fullWidth
              compressed
              rows={1}
              resize="none"
              inputRef={titleTextAreaRef}
              value={specimenTitle}
              onChange={(e) =>
                setSpecimenCopy((prev) => ({
                  ...prev,
                  [selectedTab]: { ...prev[selectedTab], title: e.target.value },
                }))
              }
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiFlexGroup
            responsive={false}
            direction="row"
            gutterSize="m"
            alignItems="center"
            wrap
          >
            <EuiFlexItem grow={false}>
              <EuiSwitch
                label="Description"
                checked={showDescription}
                onChange={(e) => setShowDescription(e.target.checked)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSwitch
                label="Action buttons"
                checked={showActionButtons}
                onChange={(e) => setShowActionButtons(e.target.checked)}
              />
            </EuiFlexItem>
            {showActionButtons && selectedTab !== 'toasts' ? (
              <EuiFlexItem grow={false}>
                <EuiSwitch
                  label="Secondary btn"
                  checked={showSecondaryButton}
                  onChange={(e) => setShowSecondaryButton(e.target.checked)}
                />
              </EuiFlexItem>
            ) : null}
            {showActionButtons && selectedTab === 'announcements' ? (
              <EuiFlexItem grow={false}>
                <EuiSwitch
                  label="Filled primary btn"
                  checked={filledPrimaryButton}
                  onChange={(e) => setFilledPrimaryButton(e.target.checked)}
                />
              </EuiFlexItem>
            ) : null}
            <EuiFlexItem grow={false}>
              <EuiSwitch
                label="Dismissable"
                checked={dismissable}
                onChange={(e) => setDismissable(e.target.checked)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          {showDescription ? (
            <>
              <EuiSpacer size="m" />
              <EuiFormRow fullWidth label="Description">
                <EuiTextArea
                  fullWidth
                  compressed
                  rows={3}
                  resize="none"
                  inputRef={descriptionTextAreaRef}
                  value={specimenDescription}
                  onChange={(e) =>
                    setSpecimenCopy((prev) => ({
                      ...prev,
                      [selectedTab]: { ...prev[selectedTab], description: e.target.value },
                    }))
                  }
                />
              </EuiFormRow>
            </>
          ) : null}
          {selectedTab === 'announcements' ? (
            <>
              <EuiSpacer size="m" />
              <EuiSwitch
                label="Screenshot paddings"
                checked={screenshotPaddings}
                onChange={(e) => setScreenshotPaddings(e.target.checked)}
              />
            </>
          ) : null}
          <EuiSpacer size="l" />

          <EuiPanel
            paddingSize="l"
            hasBorder
            hasShadow={false}
            css={
              selectedTab === 'announcements' && announcementsPanelMode === 'subdued'
                ? { backgroundColor: euiTheme.colors.backgroundBaseSubdued }
                : undefined
            }
          >
            <TopicPanel
              announcementsPanelMode={announcementsPanelMode}
              dismissable={dismissable}
              hideDescription={!showDescription}
              hidePrimaryButton={!showActionButtons}
              hideSecondaryButton={
                !showActionButtons || selectedTab === 'toasts' || !showSecondaryButton
              }
              primaryButtonFill={selectedTab === 'announcements' ? filledPrimaryButton : false}
              layoutBreakpointPx={announcementLayoutBreakpointPx}
              specimenDescription={specimenCopy[selectedTab].description}
              specimenTitle={specimenCopy[selectedTab].title}
              stackAnnouncementLeadMediaVertically={stackAnnouncementLeadMediaVertically}
              toastLiveResetKey={toastLiveResetKey}
              topic={selectedTab}
              screenshotPaddings={screenshotPaddings}
            />
          </EuiPanel>
        </div>
      </main>
    </div>
  );
}
