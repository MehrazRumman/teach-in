import type { Article } from '@prisma/client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useToggle } from 'usehooks-ts';

import type { ReactNode } from 'react';

export interface ArticleType extends Omit<Article, 'id' | 'categoryId'> {
  category?: { name: string; subCategory: string };
}

interface ArticleContextValues {
  updateArticleStatus: 'error' | 'success' | 'idle' | 'loading';
  article: ArticleType | null;
  dispatchUpdate: boolean;
  dispatch: () => void;
  updateArticle: (article: Partial<ArticleType>) => void;
  resetArticle: () => void;
}

interface ArticleContextProps {
  children: ReactNode;
}

const ArticleContext = createContext<ArticleContextValues | null>(null);

export const ArticleContextProvider = ({ children }: ArticleContextProps) => {
  const [dispatchUpdate, toggle] = useToggle();
  const [article, setArticle] = useState<ArticleType | null>(null);

  const { data: session } = useSession();

  const [updateArticleStatus, setUpdateArticleStatus] = useState<
    'error' | 'success' | 'idle' | 'loading'
  >('idle');

  // console.log('article updating:: ', article);

  const updateArticle = (articleParam: Partial<ArticleType>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore

    setArticle((prevState) => {
      return { ...prevState, ...articleParam };
    });
  };

  // effect create/update article
  useEffect(() => {
    if (article?.title) {
      setUpdateArticleStatus('loading');

      (async function () {
        try {
          if (!session?.user?.id) throw new Error();

          console.log('article updating:: ', article);

          await axios.post('/api/article/update', {
            ...article,
            userId: session?.user?.id,
          });

          setUpdateArticleStatus('success');
        } catch (error) {
          console.log(error);
          setUpdateArticleStatus('error');
        }
      })();
    }
  }, [article, session?.user?.id]);

  const resetArticle = () => {
    setArticle(null);
  };

  return (
    <ArticleContext.Provider
      value={{
        updateArticleStatus,
        dispatchUpdate,
        dispatch: toggle,
        article,
        updateArticle,
        resetArticle,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

export default function useArticle() {
  return useContext(ArticleContext);
}
