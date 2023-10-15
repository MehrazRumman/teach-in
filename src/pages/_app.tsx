import 'nprogress/nprogress.css';
import '~/styles/globals.scss';

import { Provider as JotaiProvider } from 'jotai';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import Router from 'next/router';
import NProgress from 'nprogress';
import MainLayout from '~/components/layouts/MainLayout';
import { CartContextProvider } from '~/contexts/CartContext';
import { CourseContextProvider } from '~/contexts/CourseContext';
import { HistoryRouteContextProvider } from '~/contexts/HistoryRouteContext';
import { SocketContextProvider } from '~/contexts/SocketContext';
import { trpc } from '~/utils/trpc';
import Script from 'next/script';

import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import type { AppProps, AppType } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import { BookContextProvider } from '~/contexts/BookContext';
import { ArticleContextProvider } from '~/contexts/ArticleContext';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ??
    ((page) => (
      <MainLayout showHeader showFooter>
        {page}
      </MainLayout>
    ));

  return ( 
              <ArticleContextProvider>
                <HistoryRouteContextProvider>
                  <CartContextProvider>
                    <SocketContextProvider>
                      <Script
                        strategy="afterInteractive"
                        src="https://www.googletagmanager.com/gtag/js?id=G-3XM9N6T0KE"
                      />
                      <Script
                        id="gtag-init"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                          __html: `
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());
                          gtag('config', 'G-3XM9N6T0KE');
                        `,
                        }}
                      />
                      {getLayout(<Component {...pageProps} />)}
                    </SocketContextProvider>
                  </CartContextProvider>
                </HistoryRouteContextProvider>
              </ArticleContextProvider>
            </BookContextProvider>
          </CourseContextProvider>
        </ThemeProvider>
      </JotaiProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
