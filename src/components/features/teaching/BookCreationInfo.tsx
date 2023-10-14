import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BiCategoryAlt } from 'react-icons/bi';
import { GiArcheryTarget, GiSafetyPin } from 'react-icons/gi';
import {
  MdDelete,
  MdDriveFileRenameOutline,
  MdOutlineDraw,
  MdOutlinePublish,
  MdSubject,
  MdVerticalShadesClosed,
} from 'react-icons/md';
import { useIsFirstRender } from 'usehooks-ts';
import { categories_detail, PATHS } from '~/constants';
import useBook from '~/contexts/BookContext';
import Image from 'next/image';

import { PhotoIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/outline';

import type { GetServerSideProps } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import RichEditor from '~/components/shared/RichEditor';
import type { Book } from '@prisma/client';
import { BsFilePdf, BsPersonAdd } from 'react-icons/bs';
import Modal from '~/components/partials/Modal';
import { RiNumbersFill } from 'react-icons/ri';

export interface IFormInput {
  bookName: string;
  detailsDescription: string;

  features: string;
  stock: number;
  edition: string;
  pages: number;
  author: string;
  publisher: string;
  topics: string;

  bookLevel: string;
  briefDescBook: string;
  category: string;
  category_details: string;
}

interface BookCreationInfoProps {
  book?: Book | null;
  dirs?: string[];
}

function BookCreationInfo({ book, dirs }: BookCreationInfoProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingMainPdf, setUploadingMainPdf] = useState(false);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File>();

  const [selectedPdf, setSelectedPdf] = useState('');
  const [selectedFilePdf, setSelectedFilePdf] = useState<File>();

  const [selectedMainPdf, setSelectedMainPdf] = useState('');
  const [selectedFileMainPdf, setSelectedFileMainPdf] = useState<File>();

  const [detailsDescription, setDetailsDescription] = useState<string>(
    book?.detailDescription || '',
  );

  // const [downloadLinkImage, setDdownloadLinkImage] = useState(book?.thumbnail);
  // const [downloadLinkPdf, setDdownloadLinkPdf] = useState(book?.fileLink);

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) {
        setUploading(false);
        toast.error(' Please select a Image to upload ');
        return;
      }
      const formData = new FormData();
      formData.append('myImage', selectedFile);
      formData.append('source', 'Primary');
      const { data } = await axios.post('/api/image', formData);
      setImageURL(data.downloadUrl);
      //bookCtx?.updateBook({ thumbnail: data.downloadUrl });
      toast.success('Image uploaded successfully');
    } catch (error: unknown) {
      setUploading(false);
      toast.error(error.message);
    }
    setUploading(false);
  };

  const handleUploadPdf = async () => {
    setUploadingPdf(true);
    try {
      if (!selectedFilePdf) {
        setUploadingPdf(false);
        toast.error(' Please select a smaple pdf file to upload ');
        return;
      }
      const formData = new FormData();
      formData.append('myImage', selectedFilePdf);
      formData.append('source', 'Primary');
      const { data } = await axios.post('/api/pdf', formData);
      setPdfURL(data.downloadUrl);

      //bookCtx?.updateBook({ fileLink: data.downloadUrl });
      toast.success('Sample PDF uploaded successfully');
    } catch (error: unknown) {
      toast.error(error.message);
    }
    setUploadingPdf(false);
  };

  const handleUploadMainPdf = async () => {
    setUploadingMainPdf(true);
    try {
      if (!selectedFileMainPdf) {
        setUploadingMainPdf(false);
        toast.error(' Please select main pdf a file to upload ');
        return;
      }
      const formData = new FormData();
      formData.append('myImage', selectedFileMainPdf);
      formData.append('source', 'main');
      const { data } = await axios.post('/api/pdf', formData);
      setPdfFileLink(data.downloadUrl);
      setIsPdfAvailable(true);

      //bookCtx?.updateBook({ fileLink: data.downloadUrl });
      toast.success('Main PDF uploaded successfully');
    } catch (error: unknown) {
      toast.error(error.message);
    }
    setUploadingMainPdf(false);
  };

  const { data: session } = useSession();
  const bookCtx = useBook();
  const router = useRouter();
  const isFirst = useIsFirstRender();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageURL, setImageURL] = useState(() => {
    if (book?.thumbnail) return book.thumbnail;
    return '';
  });

  const [pdfURL, setPdfURL] = useState(() => {
    if (book?.fileLink) return book.fileLink;
    return '';
  });

  const [pdfFileLink, setPdfFileLink] = useState(() => {
    if (book?.pdfFileLink) return book.pdfFileLink;
    return '';
  });

  const [isFreePdf, setIsFreePdf] = useState(() => {
    if (book?.isFreePdf) return book.isFreePdf;
    return false;
  });

  const [isPdfAvailable, setIsPdfAvailable] = useState(() => {
    if (book?.isPdfAvailable) return book.isPdfAvailable;
    return false;
  });

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
      bookName: book?.name || '',
      features: book?.features || '',
      stock: book?.stock || 0,
      edition: book?.edition || '',
      pages: book?.pages || 0,
      author: book?.author || '',
      publisher: book?.publisher || '',
      topics: book?.topics || '',
      detailsDescription: book?.detailDescription || '',

      category_details: book?.subCategory || '',
      briefDescBook: book?.briefDescription || '',
    },
  });

  const [festuresData, setFeaturesData] = useState(
    JSON.parse(book?.features || '[]') || [],
  );

  useEffect(() => {
    if (book) {
      reset({
        bookName: book.name,
        thumbnail: book?.thumbnail || undefined,
        category: book?.category?.name,
        category_details: book.subCategory || '',
        briefDescBook: book.briefDescription || '',
        detailsDescription: book.detailDescription || '',
        features: book?.features || '',
        stock: book?.stock || 0,
        edition: book?.edition || '',
        pages: book?.pages || 0,
        author: book?.author || '',
        publisher: book?.publisher || '',
        topics: book?.topics || '',
      });
    }
  }, [book, reset]);

  const handleDetailDescription = useCallback((value: string) => {
    setDetailsDescription(value);
  }, []);

  // update form value to context:
  useEffect(() => {
    const {
      bookName,
      category,
      category_details,
      briefDescBook,

      stock,
      edition,
      pages,
      author,
      publisher,
      topics,
    } = getValues();

    //validate book name
    if (!bookName && !isFirst) {
      setError(
        'bookName',
        {
          type: 'required',
          message: 'Book name is required first!',
        },
        { shouldFocus: true },
      );

      toast.error('Save failed, please review the fields!');

      return;
    }

    if (bookName && !isFirst) {
      (async function () {
        try {
          // check duplicate name if create mode
          if (router.asPath.includes(PATHS.CREATE_BOOK)) {
            const { data } = await axios.get(`/api/book/${bookName}`);

            if (
              data?.booksResult &&
              data?.booksResult.userId !== session?.user?.id
            ) {
              toast.error('Book name already exists!');
              return;
            }
          }

          bookCtx?.updateBook({
            name: bookName,
            thumbnail: imageURL,
            fileLink: pdfURL,
            pdfFileLink: pdfFileLink,
            category: { name: category, subCategory: category_details },
            briefDescription: briefDescBook,
            detailDescription: detailsDescription,
            features: JSON.stringify(festuresData),
            stock,
            edition,
            pages,
            author,
            publisher,
            topics: topics,
            isPdfAvailable: isPdfAvailable,
            isFreePdf: isFreePdf,
          });

          toast.success('Save progress successfully!');
        } catch (error) {}
      })();
    }
  }, [bookCtx?.dispatchUpdate]);

  const [showFeatures, setShowFeatures] = useState(false);
  const [featureName, setFeatureName] = useState('');

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setFeatureName(newValue);
  };

  const handleRemoveFeatures = (i: number) => {
    const updatedArray = [...festuresData];
    updatedArray.splice(i, 1);
    setFeaturesData(updatedArray);
  };

  const handleAddFeature = () => {
    // Assuming `featuresData` is an array in your component's state
    setFeaturesData((prevFeaturesData) => [...prevFeaturesData, featureName]);
  };

  const handleRadioChangeAvailable = (event) => {
    const value = event.target.value === 'yes';
    setIsPdfAvailable(value);
  };

  const handleRadioChangeFree = (event) => {
    const value = event.target.value === 'yes';
    setIsFreePdf(value);
  };

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
            <span>Book name</span>
          </h2>
          <span className="text-xl italic">(Up to 100 characters)</span>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.bookName?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('bookName');
          }}
          {...register('bookName', { maxLength: 100, required: true })}
          type="text"
          placeholder="Book from hero to zero..."
          className={`my-2 rounded-xl ${
            errors?.bookName ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <BsPersonAdd className="h-8 w-8" /> <span>Writter Name</span>
          </h2>
          <span className="text-xl italic">(Up to 100 characters)</span>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.author?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('author');
          }}
          {...register('author', { maxLength: 100, required: true })}
          type="text"
          placeholder="Name of the book Author..."
          className={`my-2 rounded-xl ${
            errors?.author ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlinePublish className="h-8 w-8" /> <span>Publisher</span>
          </h2>
          <span className="text-xl italic">(Up to 100 characters)</span>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.publisher?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('publisher');
          }}
          {...register('publisher', { maxLength: 100, required: true })}
          type="text"
          placeholder="Name of the publisher..."
          className={`my-2 rounded-xl ${
            errors?.publisher ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdSubject className="h-8 w-8" />{' '}
            <span>Book Topics(Comma Sapareted)</span>
          </h2>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.topics?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('topics');
          }}
          {...register('topics')}
          type="text"
          placeholder="Topics...Ex: BCS, VIVA, HSC, SSC etc"
          className={`my-2 rounded-xl ${
            errors?.topics ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdVerticalShadesClosed className="h-8 w-8" />{' '}
            <span>Book Edition</span>
          </h2>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.edition?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('edition');
          }}
          {...register('edition')}
          type="text"
          placeholder="Edition..."
          className={`my-2 rounded-xl ${
            errors?.edition ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <RiNumbersFill className="h-8 w-8" /> <span>Total Page Number</span>
          </h2>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.pages?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('pages');
          }}
          {...register('pages')}
          type="number"
          placeholder="Name of the book pages..."
          className={`my-2 rounded-xl ${
            errors?.pages ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <GiSafetyPin className="h-8 w-8" />{' '}
            <span>Book Stock (0 if Stock out)</span>
          </h2>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.stock?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('stock');
          }}
          {...register('stock', { maxLength: 100, required: true })}
          type="number"
          placeholder="Current Stock..."
          className={`my-2 rounded-xl ${
            errors?.stock ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <PhotoIcon className="h-8 w-8" /> <span>Book avatar</span>
          </h2>
          <span className="text-xl italic">
            Required when releasing the book
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

            <div className="my-4 max-h-[35rem] overflow-hidden rounded-xl md:max-w-3xl">
              <figure className="aspect-h-1 aspect-w-1 relative">
                <Image
                  alt="book-thumbnail"
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
                  alt="book-thumbnail"
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
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <BsFilePdf className="h-8 w-8" /> <span>Book Sample Pdf</span>
          </h2>
        </div>

        <label>
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={({ target }) => {
              if (target.files) {
                const file = target.files[0];
                setSelectedPdf(URL.createObjectURL(file));
                setSelectedFilePdf(file);
              }
            }}
          />

          {selectedPdf || pdfURL ? (
            <div className="my-4 max-h-[35rem] overflow-hidden rounded-xl md:max-w-3xl">
              <embed
                src={selectedPdf || pdfURL}
                type="application/pdf"
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="my-4 max-h-[25rem] overflow-hidden rounded-xl md:max-w-3xl">
              Upload Sample PDF
            </div>
          )}
        </label>

        <button
          onClick={handleUploadPdf}
          disabled={uploadingPdf}
          style={{ opacity: uploadingPdf ? '.5' : '1' }}
          className="w-96 rounded-full bg-green-600 p-3 text-center text-white"
        >
          {uploadingPdf ? 'Uploading...' : 'Upload Sample'}
        </button>
        <div className="mt-20 flex flex-col space-y-3">
          {dirs?.map((item) => (
            <Link key={item} href={'/pdf/' + item}>
              <a className="text-blue-500 hover:underline">{item}</a>
            </Link>
          ))}
        </div>

        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <BsFilePdf className="h-8 w-8" /> <span>Book Main Pdf</span>
          </h2>
        </div>

        <label>
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={({ target }) => {
              if (target.files) {
                const file = target.files[0];
                setSelectedMainPdf(URL.createObjectURL(file));
                setSelectedFileMainPdf(file);
              }
            }}
          />

          {selectedMainPdf || pdfFileLink ? (
            <div className="my-4 max-h-[35rem] overflow-hidden rounded-xl md:max-w-3xl">
              <embed
                src={selectedMainPdf || pdfFileLink}
                type="application/pdf"
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="my-4 max-h-[25rem] overflow-hidden rounded-xl md:max-w-3xl">
              Upload Main PDF
            </div>
          )}
        </label>

        <button
          onClick={handleUploadMainPdf}
          disabled={uploadingMainPdf}
          style={{ opacity: uploadingMainPdf ? '.5' : '1' }}
          className="w-96 rounded-full bg-blue-600 p-3 text-center text-white"
        >
          {uploadingMainPdf ? 'Uploading...' : 'Upload Main'}
        </button>
        <div className="mt-20 flex flex-col space-y-3">
          {dirs?.map((item) => (
            <Link key={item} href={'/pdf/' + item}>
              <a className="text-blue-500 hover:underline">{item}</a>
            </Link>
          ))}
        </div>
      </div>

      <div className="my-2 rounded border-2 border-dotted p-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold">
            Is the PDF Book Available?
          </h2>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              checked={isPdfAvailable === true}
              onChange={handleRadioChangeAvailable}
              className="form-radio h-5 w-5 text-indigo-600"
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="ml-6 inline-flex items-center">
            <input
              type="radio"
              value="no"
              checked={isPdfAvailable === false}
              onChange={handleRadioChangeAvailable}
              className="form-radio h-5 w-5 text-indigo-600"
            />
            <span className="ml-2">No</span>
          </label>
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-2xl font-bold">Is the PDF Version Free?</h2>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              checked={isFreePdf === true}
              onChange={handleRadioChangeFree}
              className="form-radio h-5 w-5 text-indigo-600"
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="ml-6 inline-flex items-center">
            <input
              type="radio"
              value="no"
              checked={isFreePdf === false}
              onChange={handleRadioChangeFree}
              className="form-radio h-5 w-5 text-indigo-600"
            />
            <span className="ml-2">No</span>
          </label>
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <h2 className="flex items-center space-x-3">
            <BiCategoryAlt className="h-8 w-8" /> <span>Category Book</span>
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
          {...register('briefDescBook', { maxLength: 500 })}
          type="text"
          placeholder="Book offers you..."
          className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlineDraw className="h-8 w-8" />{' '}
            <span>Detail description</span>
          </h2>
          <span className="text-xl italic">(Up to 5000 characters)</span>
        </div>

        <RichEditor
          contents={detailsDescription || ''}
          onEditorChange={handleDetailDescription}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <GiArcheryTarget className="h-8 w-8" />{' '}
            <span>Whats in the Book</span>
          </h2>
          <span className="text-xl italic">
            (Need to provide at least 4 Features)
          </span>
        </div>

        {festuresData &&
          festuresData.map((e: string, i: number) => {
            return (
              <div
                className="bottom-1 my-2 overflow-auto rounded-md bg-gray-100 px-6 py-3 outline fade-in-10"
                key={i}
              >
                <div className="flex flex-row justify-between">
                  <span>{e}</span>
                  <MdDelete
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFeatures(i);
                    }}
                  />
                </div>
              </div>
            );
          })}

        <div className="flex items-center justify-between md:w-1/2">
          <button
            onClick={(e) => {
              setShowFeatures(true);
            }}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <PlusIcon className="h-8 w-8" /> <span>Add target</span>{' '}
          </button>

          {/* <button
            onClick={() => bookTargetsRemove(1)}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <FiTrash className="h-8 w-8" /> <span>Delete</span>{' '}
          </button> */}
        </div>

        {showFeatures && (
          <Modal
            title={'Add a Feature name'}
            onClose={(e) => {
              setShowFeatures(false);
            }}
          >
            <div className="flex flex-col">
              <input
                type="text"
                className="my-6 border px-4 py-2 outline-1"
                value={featureName}
                onChange={handleInputChange}
                placeholder="Enter feature name"
              />
              <div className="flex flex-row justify-between">
                <button
                  className="overscroll-x-auto rounded bg-red-500 px-4 py-2 text-white"
                  onClick={(e) => {
                    setShowFeatures(false);
                  }}
                >
                  close
                </button>

                <button
                  className="overscroll-x-auto rounded bg-purple-500 px-4 py-2 text-white"
                  onClick={handleAddFeature}
                >
                  Add
                </button>
              </div>
            </div>
          </Modal>
        )}
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

export default memo(BookCreationInfo);
