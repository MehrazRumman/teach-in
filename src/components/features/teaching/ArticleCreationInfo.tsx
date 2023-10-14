import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BiCategoryAlt } from 'react-icons/bi';
import { FiTrash } from 'react-icons/fi';
import { GiArcheryTarget } from 'react-icons/gi';
import { MdDriveFileRenameOutline, MdOutlineDraw } from 'react-icons/md';
import { useIsFirstRender } from 'usehooks-ts';
import {
  categories_detail,
  MAPPING_PUBLISH_MODE_LANGUAGE,
  PATHS,
} from '~/constants';
import useArticle from '~/contexts/ArticleContext';
import Image from 'next/image';

import { PhotoIcon } from '@heroicons/react/20/solid';

import type { GetServerSideProps } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import RichEditor from '~/components/shared/RichEditor';
import type { Article } from '@prisma/client';

export interface IFormInput {
  articleTitle: string;
  detailsDescription: string;
  briefDescription: string;
  category: string;
  category_details: string;
  publishMode: string;
}

interface ArticleCreationInfoProps {
  article?: Article | null;
  dirs?: string[];
}

function ArticleCreationInfo({ article, dirs }: ArticleCreationInfoProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File>();
  const [imageURL, setImageURL] = useState(() => {
    if (article?.thumbnail) return article.thumbnail;
    return '';
  });

  const [detailsDescription, setDetailsDescription] = useState<string>(
    article?.content || '',
  );

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('myImage', selectedFile);
      formData.append('source', 'Primary');
      const { data } = await axios.post('/api/image', formData);
      setImageURL(data.downloadUrl);

      toast.success('Image uploaded successfully');
    } catch (error: unknown) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const { data: session } = useSession();
  const articleCtx = useArticle();
  const router = useRouter();
  const isFirst = useIsFirstRender();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const {
    reset,
    getValues,
    register,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      articleTitle: article?.title || '',
      category: article?.category?.name,
      category_details: article?.subCategory || '',
      briefDescription: article?.briefDescription || '',
      content: article?.content || '',
      publishMode: article?.publishMode || 'PUBLIC',
    },
  });

  useEffect(() => {
    if (article) {
      reset({
        articleTitle: article.title,
        category: article.category.name,
        category_details: article?.subCategory || undefined,
        briefDescription: article.briefDescription || undefined,
        content: article.content || undefined,
      });
    }
  }, [article, reset]);

  const handleDetailDescription = useCallback((value: string) => {
    setDetailsDescription(value);
  }, []);

  // update form value to context:
  useEffect(() => {
    const {
      articleTitle,
      category,
      category_details,
      briefDescription,
      publishMode,
    } = getValues();

    //validate article title
    if (!articleTitle && !isFirst) {
      setError(
        'articleTitle',
        {
          type: 'required',
          message: 'Article title is required first!',
        },
        { shouldFocus: true },
      );

      toast.error('Save failed, please review the fields!');

      return;
    }

    if (articleTitle && !isFirst) {
      (async function () {
        try {
          // check duplicate title if create mode
          if (router.asPath.includes(PATHS.CREATE_BOOK)) {
            const { data } = await axios.get(`/api/article/${articleTitle}`);

            if (
              data?.articlesResult &&
              data?.articlesResult.userId !== session?.user?.id
            ) {
              toast.error('Article title already exists!');
              return;
            }
          }

          articleCtx?.updateArticle({
            title: articleTitle,
            category: { name: category, subCategory: category_details },
            briefDescription: briefDescription.trim(),
            content: detailsDescription,
            thumbnail: imageURL,
            publishMode: MAPPING_PUBLISH_MODE_LANGUAGE[publishMode],
          });

          toast.success('Save progress successfully!');
        } catch (error) {}
      })();
    }
  }, [articleCtx?.dispatchUpdate]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="mt-4 flex flex-col"
    >
      <h1 className="text-3xl">1.Basic information</h1>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdDriveFileRenameOutline className="h-8 w-8" />{' '}
            <span>Article title</span>
          </h2>
          <span className="text-xl italic">(Up to 60 characters)</span>
        </div>
        <span className="my-2 italic text-rose-400">
          {errors?.articleTitle?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('articleTitle');
          }}
          {...register('articleTitle', { maxLength: 60, required: true })}
          type="text"
          placeholder="Article from hero to zero..."
          className={`my-2 rounded-xl ${
            errors?.articleTitle ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
        Private Mode
        <select
          {...register('publishMode')}
          className="my-4 max-w-md rounded-xl p-4"
        >
          <option value="Public" defaultValue={'Public'}>
            Public
          </option>
          <option value="Private">Private</option>
        </select>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <PhotoIcon className="h-8 w-8" /> <span>Article avatar</span>
          </h2>
          <span className="text-xl italic">
            Required when releasing the article
          </span>
        </div>

        <label>
          <input
            type="file"
            hidden
            accept="image/png, image/gif, image/jpeg"
            onChange={({ target }) => {
              if (target.files) {
                const file = target.files[0];
                setSelectedImage(URL.createObjectURL(file));
                setSelectedFile(file);
              }
            }}
          />

          {selectedImage || imageURL ? (
            // eslint-disable-next-line @next/next/no-img-element

            <div className="my-4 max-h-[35rem] overflow-hidden rounded-xl  md:max-w-3xl">
              <figure className="aspect-h-16 aspect-w-9 relative">
                <Image
                  alt="article-thumbnail"
                  src={selectedImage || imageURL}
                  className="absolute inset-0 object-cover object-center"
                  fill
                />
              </figure>
            </div>
          ) : (
            <div className="my-4 max-h-[25rem] overflow-hidden rounded-xl  md:max-w-3xl">
              <figure className="aspect-h-9 aspect-w-16 relative">
                <Image
                  alt="article-thumbnail"
                  src={'/images/placeholder.png'}
                  className="absolute inset-0 object-cover object-center"
                  fill
                />
              </figure>
            </div>
          )}
        </label>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ opacity: uploading ? '.5' : '1' }}
          className="w-96 rounded-full bg-purple-600 p-3 text-center text-white"
        >
          {uploading ? 'Uploading..' : 'Upload'}
        </button>
        <div className="mt-20 flex flex-col space-y-3">
          {dirs?.map((item) => (
            <Link key={item} href={'/images/' + item}>
              <a className="text-blue-500 hover:underline">{item}</a>
            </Link>
          ))}
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <h2 className="flex items-center space-x-3">
            <BiCategoryAlt className="h-8 w-8" /> <span>Category Article</span>
          </h2>
        </div>

        <select
          {...register('category')}
          className="my-4 max-w-md rounded-xl p-4"
        >
          <option disabled defaultValue="Category:">
            Category:
          </option>
          {categories_detail.map((category) => {
            return (
              <option value={category.title} key={category.title}>
                {category.title}
              </option>
            );
          })}
        </select>

        {watch('category') && (
          <select
            {...register('category_details')}
            className="my-4 max-w-md rounded-xl p-4"
          >
            <option disabled defaultValue="Category chi tiết">
              Category detail:
            </option>
            {categories_detail
              .find((e) => e.title === watch('category'))
              ?.fields.map((category_details) => {
                return (
                  <option value={category_details} key={category_details}>
                    {category_details}
                  </option>
                );
              })}
          </select>
        )}
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlineDraw className="h-8 w-8" /> <span>Short description</span>
          </h2>
          <span className="text-xl italic">(Up to 500 characters)</span>
        </div>

        <input
          {...register('briefDescription', { maxLength: 500 })}
          type="text"
          placeholder="Article offers you..."
          className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlineDraw className="h-8 w-8" /> <span>Detail Content</span>
          </h2>
          <span className="text-xl italic">(Up to 5000 characters)</span>
        </div>

        <RichEditor
          contents={detailsDescription || ''}
          onEditorChange={handleDetailDescription}
        />
      </div>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const props = { dirs: [] };
  try {
    const dirs = await fs.promises.readdir(
      path.join(process.cwd(), '/public/images'),
    );
    props.dirs = dirs as never[];
    return { props };
  } catch (error) {
    return { props };
  }
};

export default memo(ArticleCreationInfo);
