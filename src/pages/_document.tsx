import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head title="Teach-In">
          <link
            href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300&display=swap"
            rel="stylesheet"
          />

          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.0/skins/content/tinymce-5/content.min.css"
            integrity="sha512-AQlh8pNI8GdH0sbUsSACzz37sCq68PohXzXYt/YOJt581nIiqnMjF4YM9lp5YVBMLR90GzkJLQNQjcfLn2yhUA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Head>
        <body
          style={{
            fontFamily: 'Hind Siliguri',
          }}
        >
          <Main />
          <NextScript />
          {/* No need for the ES6 polyfill from Polyfill.io */}

          {/* Add your scripts using next/script */}
          {/* <Script
            src="/plugins/mathJax/es5/tex-mml-chtml.js"
            strategy="lazyOnload"
          />
          <Script
            src="/plugins/tinymce-mathjax/config.js?class=custom-mathjax-element-class"
            strategy="lazyOnload"
          /> */}
        </body>
      </Html>
    );
  }
}
