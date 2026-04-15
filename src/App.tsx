import { useState, type ReactNode } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';

import { Banner, type BannerSize } from './components/Banner';
import { Callout } from './components/Callout';
import { Toast } from './components/Toast';

type TopicTab = 'toasts' | 'callouts' | 'banners';

function BannerSizeSection({
  size,
  title,
  children,
}: {
  size: BannerSize;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <strong>Size {size.toUpperCase()}</strong>
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <Banner size={size} title={title}>
          {children}
        </Banner>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <Banner size={size} image={null} title={title}>
          {children}
        </Banner>
      </EuiFlexItem>
    </>
  );
}

function TopicPanel({ topic }: { topic: TopicTab }) {
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
            <Toast color="neutral" title="Neutral toast">
              Life is a canvas, and you are the artist. Paint your dreams with vibrant colors
              and bold strokes.
            </Toast>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Toast color="success" title="Success toast">
              Adventure awaits around every corner, inviting you to explore the unknown. Take a
              leap of faith and let curiosity guide you.
            </Toast>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Toast color="warning" title="Warning toast">
              The sun rises on a new day, bringing fresh opportunities and endless potential.
            </Toast>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Toast color="danger" title="Danger toast">
              In a world of endless possibilities, creativity knows no bounds. Embrace the journey
              of discovery and let your imagination soar.
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
            <Callout size="m" color="neutral" title="Neutral callout">
              Life is a canvas, and you are the artist. Paint your dreams with vibrant colors and
              bold strokes.
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout size="m" color="success" title="Success callout">
              Adventure awaits around every corner, inviting you to explore the unknown. Take a leap
              of faith and let curiosity guide you.
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout size="m" color="warning" title="Warning callout">
              The sun rises on a new day, bringing fresh opportunities and endless potential.
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout size="m" color="danger" title="Danger callout">
              In a world of endless possibilities, creativity knows no bounds. Embrace the journey
              of discovery and let your imagination soar.
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
            <Callout size="s" color="neutral" title="Neutral callout">
              Shorter copy for compact callouts. Adjust padding and type scale for dense layouts.
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout size="s" color="success" title="Success callout">
              Keep body text brief so the smaller type stays readable at a glance.
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout size="s" color="warning" title="Warning callout">
              Tighter padding and smaller title and body type keep the footprint small.
            </Callout>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Callout size="s" color="danger" title="Danger callout">
              Same structure as size M: stripe, borders, and actions—just a denser layout.
            </Callout>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    case 'banners':
      return (
        <EuiFlexGroup
          direction="column"
          gutterSize="m"
          alignItems="stretch"
          css={{ maxWidth: '100%' }}
        >
          <BannerSizeSection size="l" title="Account notice">
            Extra padding for emphasis when the message should feel more substantial than size M.
          </BannerSizeSection>
          <EuiFlexItem grow={false}>
            <EuiSpacer size="l" />
          </EuiFlexItem>
          <BannerSizeSection size="m" title="Scheduled maintenance">
            We will deploy updates on Tuesday 02:00–04:00 UTC. Brief interruptions are possible.
          </BannerSizeSection>
          <EuiFlexItem grow={false}>
            <EuiSpacer size="l" />
          </EuiFlexItem>
          <BannerSizeSection size="s" title="New feature available">
            Inline title and body for tight headers—same actions as larger sizes.
          </BannerSizeSection>
        </EuiFlexGroup>
      );
    default:
      return null;
  }
}

export function App() {
  const { euiTheme } = useEuiTheme();
  const [selectedTab, setSelectedTab] = useState<TopicTab>('toasts');

  const constrained = {
    maxWidth: 960,
    margin: '0 auto' as const,
    width: '100%',
    boxSizing: 'border-box' as const,
    paddingLeft: euiTheme.size.l,
    paddingRight: euiTheme.size.l,
  };

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
            ...constrained,
            paddingTop: euiTheme.size.m,
          }}
        >
          <EuiTabs expand bottomBorder size="l" aria-label="Specimen topics">
            <EuiTab
              id="toasts-tab"
              aria-controls="topic-panel"
              isSelected={selectedTab === 'toasts'}
              onClick={() => setSelectedTab('toasts')}
            >
              Toasts
            </EuiTab>
            <EuiTab
              id="callouts-tab"
              aria-controls="topic-panel"
              isSelected={selectedTab === 'callouts'}
              onClick={() => setSelectedTab('callouts')}
            >
              Callouts
            </EuiTab>
            <EuiTab
              id="banners-tab"
              aria-controls="topic-panel"
              isSelected={selectedTab === 'banners'}
              onClick={() => setSelectedTab('banners')}
            >
              Banners
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
            ...constrained,
            paddingBottom: euiTheme.size.l,
          }}
        >
          <EuiSpacer size="l" />

          <EuiPanel paddingSize="l" hasBorder hasShadow={false}>
            <TopicPanel topic={selectedTab} />
          </EuiPanel>
        </div>
      </main>
    </div>
  );
}
