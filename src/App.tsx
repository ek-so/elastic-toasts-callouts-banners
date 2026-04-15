import { css } from '@emotion/react';
import { useState } from 'react';
import {
  EuiCode,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeader,
  EuiHorizontalRule,
  EuiIcon,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
  euiFontSizeFromScale,
  euiLineHeightFromBaseline,
  useEuiTheme,
} from '@elastic/eui';

type TopicTab = 'toasts' | 'callouts' | 'banners';

function ThemeTokenSample() {
  const { euiTheme } = useEuiTheme();
  const sampleFontSize = euiFontSizeFromScale('s', euiTheme);
  const sampleLineHeight = euiLineHeightFromBaseline('s', euiTheme);

  return (
    <EuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <EuiTitle size="xs">
        <h2>Theme via useEuiTheme()</h2>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        Use <EuiCode>euiTheme</EuiCode> for colors, spacing, typography, borders,
        and breakpoints in Emotion <EuiCode>css</EuiCode> or the <EuiCode>css</EuiCode>{' '}
        prop on EUI components.
      </EuiText>
      <EuiSpacer size="m" />
      <EuiFlexGroup wrap responsive={false} gutterSize="m">
        <EuiFlexItem grow={false}>
          <div
            css={css`
              width: 120px;
              height: 72px;
              border-radius: ${euiTheme.border.radius.medium};
              background: ${euiTheme.colors.primary};
              border: ${euiTheme.border.thin};
            `}
          />
          <EuiSpacer size="xs" />
          <EuiText size="xs">
            <EuiCode>colors.primary</EuiCode>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <div
            css={css`
              width: 120px;
              height: 72px;
              border-radius: ${euiTheme.border.radius.medium};
              background: ${euiTheme.colors.lightShade};
              padding: ${euiTheme.size.s};
              font-family: ${euiTheme.font.family};
              font-size: ${sampleFontSize};
              line-height: ${sampleLineHeight};
              color: ${euiTheme.colors.text};
            `}
          >
            Sample text
          </div>
          <EuiSpacer size="xs" />
          <EuiText size="xs">
            <EuiCode>font</EuiCode> + <EuiCode>colors.text</EuiCode>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiIcon
            type="stopFill"
            size="xl"
            css={{ color: euiTheme.colors.accent }}
            aria-hidden
          />
          <EuiSpacer size="xs" />
          <EuiText size="xs">
            <EuiCode>colors.accent</EuiCode> on <EuiCode>EuiIcon</EuiCode>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

function TopicPanel({ topic }: { topic: TopicTab }) {
  switch (topic) {
    case 'toasts':
      return (
        <EuiText>
          <p>
            <strong>Toasts</strong> — brief, transient messages (often success, error, or
            info) anchored to a corner or edge of the screen.
          </p>
        </EuiText>
      );
    case 'callouts':
      return (
        <EuiText>
          <p>
            <strong>Callouts</strong> — inline notices within a page or panel, such as warnings,
            tips, or contextual help next to related UI.
          </p>
        </EuiText>
      );
    case 'banners':
      return (
        <EuiText>
          <p>
            <strong>Banners</strong> — prominent full-width messages at the top (or bottom) of
            a view, for announcements, outages, or policy notices.
          </p>
        </EuiText>
      );
    default:
      return null;
  }
}

export function App() {
  const { euiTheme } = useEuiTheme();
  const [selectedTab, setSelectedTab] = useState<TopicTab>('toasts');

  return (
    <div
      css={{
        minHeight: '100vh',
        backgroundColor: euiTheme.colors.body,
        color: euiTheme.colors.text,
      }}
    >
      <EuiHeader
        position="static"
        aria-label="Application chrome"
        sections={[
          {
            items: [
              <EuiTitle size="xs" key="app-title">
                <span>Toasts, callouts and banners</span>
              </EuiTitle>,
            ],
          },
        ]}
      />

      <div
        css={{
          maxWidth: 960,
          margin: '0 auto',
          padding: euiTheme.size.l,
        }}
      >
        <EuiTabs expand bottomBorder>
          <EuiTab
            isSelected={selectedTab === 'toasts'}
            onClick={() => setSelectedTab('toasts')}
          >
            Toasts
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === 'callouts'}
            onClick={() => setSelectedTab('callouts')}
          >
            Callouts
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === 'banners'}
            onClick={() => setSelectedTab('banners')}
          >
            Banners
          </EuiTab>
        </EuiTabs>

        <EuiSpacer size="l" />

        <EuiPanel paddingSize="l" hasBorder hasShadow={false}>
          <TopicPanel topic={selectedTab} />
        </EuiPanel>

        <EuiHorizontalRule margin="xl" />

        <EuiText size="s" color="subdued">
          <p>
            The app root is wrapped in <EuiCode>EuiProvider</EuiCode> per the{' '}
            <a href="https://eui.elastic.co/docs/getting-started/setup/">EUI setup guide</a>.
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <ThemeTokenSample />
      </div>
    </div>
  );
}
