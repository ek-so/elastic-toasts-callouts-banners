import { css } from '@emotion/react';
import { useEuiTheme } from '@elastic/eui';
import type { ComponentPropsWithoutRef } from 'react';

export type BannerScreenshotProps = ComponentPropsWithoutRef<'div'> & {
  /** Super-narrow banner: full-width media row on top of copy (see Figma). */
  mediaStackedLayout?: boolean;
};

function assetSrc(file: string): string {
  const publicPath =
    typeof __webpack_public_path__ === 'string' && __webpack_public_path__ !== ''
      ? __webpack_public_path__
      : '/';
  const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
  return `${base}banners/${file}`;
}

export function BannerScreenshot({
  children,
  mediaStackedLayout = false,
  ...rest
}: BannerScreenshotProps) {
  const { euiTheme } = useEuiTheme();
  const width = `${euiTheme.base * 20}px`;
  const minHeight = `${euiTheme.base * 10}px`;
  /** Same as banner `specimenBorderRadius`; only the outer (leading) corners — inline-end stays square against copy. */
  const screenshotLeadingRadius = '4px';

  return (
    <div
      {...rest}
      css={
        mediaStackedLayout
          ? css`
              position: relative;
              box-sizing: border-box;
              width: 100%;
              min-width: 0;
              min-height: ${minHeight};
              align-self: stretch;
              flex-shrink: 0;
              overflow: hidden;
              border-top-left-radius: ${screenshotLeadingRadius};
              border-top-right-radius: ${screenshotLeadingRadius};
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
              background-image: url(${assetSrc('screenshot.png')}),
                url(${assetSrc('screenshot-bg.png')});
              background-size: contain, cover;
              background-position: center, center;
              background-repeat: no-repeat, no-repeat;
              background-origin: content-box, padding-box;
              background-clip: content-box, border-box;
              padding: ${euiTheme.size.base} ${euiTheme.size.l};
              line-height: 0;
            `
          : css`
              position: relative;
              width: ${width};
              min-height: ${minHeight};
              align-self: stretch;
              flex-shrink: 0;
              overflow: hidden;
              border-top-left-radius: ${screenshotLeadingRadius};
              border-bottom-left-radius: ${screenshotLeadingRadius};
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
              box-sizing: border-box;
              background-image: url(${assetSrc('screenshot.png')}),
                url(${assetSrc('screenshot-bg.png')});
              background-size: contain, cover;
              background-position: center, center;
              background-repeat: no-repeat, no-repeat;
              background-origin: content-box, padding-box;
              background-clip: content-box, border-box;
              padding: 20px 30px;
              line-height: 0;
            `
      }
    >
      {children}
    </div>
  );
}
