import * as React from 'react';
import {
  RenderPage,
  RenderPageProps,
  ScrollMode,
  ViewMode,
  Viewer,
} from '@react-pdf-viewer/core';
import type { ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/toolbar';
import { MoreActionsPopover } from '@react-pdf-viewer/toolbar';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// import SearchSidebar from './SearchSidebar';
import { BiSearch } from 'react-icons/bi';

import Image from 'next/image';
import { MdWarningAmber } from 'react-icons/md';
interface SearchSidebarDefaultLayoutProps {
  fileUrl: string;
  keywords: string[];
}

interface DocumentKeywordsData {
  isDocumentLoaded: boolean;
  keywords: string[];
}

const compareArrays = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const SearchSidebarDefaultLayout: React.FC<SearchSidebarDefaultLayoutProps> = ({
  fileUrl,
  keywords,
}) => {
  const [docKeywords, setDocKeywords] = React.useState<DocumentKeywordsData>({
    isDocumentLoaded: false,
    keywords,
  });
  const [searchKeywords, setSearchKeywords] = React.useState(keywords);

  const renderToolbar = (
    Toolbar: (props: ToolbarProps) => React.ReactElement,
  ) => (
    <Toolbar>
      {(toolbarSlot: ToolbarSlot) => {
        const {
          CurrentPageInput,
          SwitchViewMode,
          SwitchScrollMode,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          SwitchTheme,
          Zoom,
          ZoomIn,
          ZoomOut,
        } = toolbarSlot;

        return (
          <div
            className="rpv-toolbar mt-2"
            role="toolbar"
            aria-orientation="horizontal"
          >
            <div className="rpv-toolbar__left">
              <div className="rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <SwitchTheme />
                </div>
              </div>
              <div className="rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <SwitchViewMode mode={ViewMode.SinglePage} />
                </div>
              </div>
              <div className="rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <SwitchViewMode mode={ViewMode.DualPage} />
                </div>
              </div>

              <div className="rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <SwitchScrollMode mode={ScrollMode.Horizontal} />
                </div>
              </div>
              <div className="rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <SwitchScrollMode mode={ScrollMode.Vertical} />
                </div>
              </div>

              <div className="rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <SwitchScrollMode mode={ScrollMode.Page} />
                </div>
              </div>

              <div className="rpv-core__display--hidden rpv-core__display--block-medium">
                <div className="rpv-toolbar__item">
                  <EnterFullScreen />
                </div>
              </div>

              <div className="rpv-core__display--hidden rpv-core__display--block-medium">
                <MoreActionsPopover toolbarSlot={toolbarSlot} />
              </div>
            </div>

            <div className="rpv-toolbar__center">
              <div className="rpv-core__display--hidden rpv-core__display--block-medium">
                <ZoomOut />
              </div>
              <div>
                <div className="rpv-toolbar__item">
                  <Zoom />
                </div>
              </div>
              <div className="rpv-core__display--hidden rpv-core__display--block-medium">
                <ZoomIn />
              </div>
            </div>
            <div className="rpv-toolbar__right">
              <div>
                <div className="rpv-toolbar__item">
                  <GoToPreviousPage />
                </div>
              </div>
              <div className="rpv-toolbar__item">
                <CurrentPageInput />
                <span className="rpv-toolbar__label">
                  / <NumberOfPages />
                </span>
              </div>
              <div>
                <div className="rpv-toolbar__item">
                  <GoToNextPage />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: (defaultTabs) =>
      [
        {
          content: (
            // <SearchSidebar
            //   isDocumentLoaded={docKeywords.isDocumentLoaded}
            //   keywords={searchKeywords}
            //   searchPluginInstance={
            //     defaultLayoutPluginInstance.toolbarPluginInstance
            //       .searchPluginInstance
            //   }
            // />
            <>
              <div className="items-center justify-center px-4 py-2 font-bold">
                {' '}
                <MdWarningAmber /> Under Development
              </div>
            </>
          ),
          icon: <BiSearch />,
          title: 'Search',
        },
      ].concat(defaultTabs),
  });

  const { activateTab } = defaultLayoutPluginInstance;

  const handleDocumentLoad = () => {
    setDocKeywords({
      isDocumentLoaded: true,
      keywords,
    });
  };

  React.useLayoutEffect(() => {
    // Open the search tab if we pass the new keywords
    if (
      docKeywords &&
      docKeywords.isDocumentLoaded &&
      docKeywords.keywords.length > 0
    ) {
      setSearchKeywords(docKeywords.keywords);
      activateTab(0);
    }
  }, [docKeywords]);

  React.useLayoutEffect(() => {
    setDocKeywords({
      isDocumentLoaded: false,
      keywords: [''],
    });
  }, [fileUrl]);

  React.useLayoutEffect(() => {
    setDocKeywords((currentValue) =>
      keywords &&
      currentValue &&
      currentValue.isDocumentLoaded &&
      !compareArrays(currentValue.keywords, keywords)
        ? { isDocumentLoaded: true, keywords }
        : currentValue,
    );
  }, [keywords]);

  const renderPage: RenderPage = (props: RenderPageProps) => (
    <>
      {props.canvasLayer.children}
      <div style={{ userSelect: 'none' }}>{props.textLayer.children}</div>

      <div
        style={{
          userSelect: 'none',
          alignItems: 'center',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            color: 'rgba(0, 0, 0, 0.2)',
            fontSize: `${2 * props.scale}rem`,
            fontWeight: 'bold',
            userSelect: 'none',
          }}
        >
          <div className="flex items-center">
            <Image
              src={'/images/logo.svg'}
              alt="book"
              width={8}
              height={8}
              className="h-8 w-8 opacity-20 md:h-12 md:w-12"
            />
            <span className="px-2 text-2xl md:text-4xl">teach-in.com</span>
          </div>
        </div>
      </div>
      {props.annotationLayer.children}
    </>
  );

  return (
    <Viewer
      fileUrl={fileUrl}
      onDocumentLoad={handleDocumentLoad}
      defaultScale={0.8}
      renderPage={renderPage}
      plugins={[defaultLayoutPluginInstance]}
    />
  );
};

export default SearchSidebarDefaultLayout;
