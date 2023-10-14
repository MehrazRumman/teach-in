// import RelatedArticles from '~/components/articles/RelatedArticles';

import { MathJax, MathJaxContext } from 'better-react-mathjax';
import type { GetServerSideProps, NextPage } from 'next';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import Image from 'next/image';
import { prisma } from '~/server/db/client';

interface ArticlePageProps {
  thumbnail?: string;
  title?: string;
  content?: string;
  createdAt?: string;
  addedBy?: {
    name: string;
    image: string;
  };
}

const ArticlePage: NextPage = ({
  thumbnail,
  title,
  content,
  createdAt,
  addedBy,
}: ArticlePageProps) => {
  const config = {
    loader: { load: ['[tex]/html'] },
    tex: {
      packages: { '[+]': ['html'] },
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)'],
      ],
      displayMath: [
        ['$$', '$$'],
        ['\\[', '\\]'],
      ],
    },
    chtml: {
      mtextInheritFont: true,
    },
  };

  const theme = useTheme();
  const isDarkMode = theme.theme === 'dark';

  return (
    <MathJaxContext version={3} config={config}>
      <Head
        title={title ? `${title} - Teach-In` : 'Article - Teach-In'}
        image={thumbnail ? thumbnail : undefined}
      ></Head>

      <div className="smooth-effect w-screen px-10 lg:mx-auto lg:w-[70%]">
        <h1 className="my-4 text-3xl font-semibold md:text-5xl ">{title}</h1>
        {addedBy && (
          <div className="mb-4 flex items-center">
            <Image
              src={addedBy.image}
              alt={addedBy.name}
              height={100}
              width={100}
              className="mr-2 h-8 w-8 rounded-full"
            />
            <span className="text-gray-500">{addedBy.name}</span>
          </div>
        )}

        {/* Creation date */}
        {createdAt && (
          <p className="mb-4 text-gray-500">Published: {createdAt}</p>
        )}
        {/* thumbnail */}
        {thumbnail && (
          <div className="flex h-auto w-full items-center justify-center">
            <Image
              height={180}
              width={180}
              src={thumbnail}
              alt="article-thumbnail"
              className=""
            />
          </div>
        )}

        {/* Author information */}

        <MathJax>
          <article
            className={isDarkMode ? 'dark-div' : 'normal-div'}
            dangerouslySetInnerHTML={{ __html: content || '' }}
          ></article>
        </MathJax>
      </div>
    </MathJaxContext>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// middleware check article has a password
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { slug } = query;

  const article = await prisma?.article.findUnique({
    where: { slug: slug as string },
    select: {
      verified: true,
      thumbnail: true,
      title: true,
      content: true,
      briefDescription: true,
      addedBy: {
        select: {
          name: true,
          image: true,
          id: true,
        },
      },
      category: {
        select: {
          name: true,
          id: true,
        },
      },
      subCategory: true,
      createdAt: true,
    },
  });

  return {
    props: {
      thumbnail: article?.thumbnail,
      title: article?.title,
      content: article?.content,
      berifDescription: article?.briefDescription,
      addedBy: article?.addedBy,
      category: article?.category,
      subCategory: article?.subCategory,
      createdAt: article?.createdAt?.toUTCString(),
    },
  };
};

export default ArticlePage;
