import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaceFrownIcon } from '@heroicons/react/24/solid';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Else, If, Then } from 'react-if';
import slug from 'slug';
import useQuestion from '~/contexts/QuestionContext';
import { trpc } from '~/utils/trpc';
import axios from 'axios';
import Loading from '../buttons/Loading';

interface ConfirmPublishQuestionModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmPublishQuestionModal({
  isOpen,
  setIsOpen,
}: ConfirmPublishQuestionModalProps) {
  const questionCtx = useQuestion();

  const [missingFields, setMissingFields] = useState<string[]>([]);

  const {
    mutate: publishQuestion,
    isSuccess,
    status,
  } = trpc.question.publishQuestion.useMutation();

  const handlePublishQuestion = async () => {
    try {
      if (questionCtx?.question && questionCtx?.question?.question) {
        const existQuestion = await axios.get(
          `/api/question/${questionCtx?.question?.question}`,
        );

        if (existQuestion) {
          publishQuestion({
            published: true,
            slug: slug(questionCtx?.question?.question),
          });
        } else {
          questionCtx.updateQuestion({ published: true });
          setIsOpen(false);
        }
      } else {
        toast.error('Opps! Something is not right?');
      }
    } catch (error) {
      toast.error('Opps! Something is not right?');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Question release successful! Please wait for approval');
      setIsOpen(false);
    }
  }, [isSuccess, setIsOpen]);

  useEffect(() => {
    const mistakeFields: string[] = [];

    if (!questionCtx?.question?.question) {
      mistakeFields.push('Question text is required');
    }

    if (questionCtx?.question?.chapters.length === 0) {
      mistakeFields.push('Question needs at least 1 chapter');
    }

    if (
      questionCtx?.question?.chapters &&
      !questionCtx?.question?.chapters.some((chapter) => {
        return chapter.lectures?.some((lecture) => lecture.isPreview);
      })
    ) {
      mistakeFields.push('Question requires at least 1 lesson to be previewed');
    }

    setMissingFields(mistakeFields);

    return () => {
      setMissingFields([]);
    };
  }, [questionCtx]);

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[400]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto text-gray-600 dark:text-white/80">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex h-[80vh] w-[50rem] transform flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 text-left align-middle  shadow-xl transition-all dark:bg-dark-background md:h-[65vh] lg:h-[80vh]">
                  <div>
                    <Dialog.Title
                      as="div"
                      className="my-4 mx-4 flex items-center justify-between md:my-6"
                    >
                      <h2 className="text-2xl font-medium uppercase leading-6 md:text-3xl">
                        Question Release Confirmation
                      </h2>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-3 md:p-2"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </Dialog.Title>

                    <If condition={missingFields.length > 0}>
                      <Then>
                        <div className="flex flex-col">
                          <h4 className="flex items-center space-x-4 text-rose-500">
                            <FaceFrownIcon className="h-8 w-8" />{' '}
                            <span>
                              You are not eligible to create a Question!
                            </span>
                          </h4>

                          <p className="my-4">
                            Please fill in the missing fields below to complete
                            the release:
                          </p>

                          <ul className="list-inside list-disc space-y-4">
                            {missingFields &&
                              missingFields.length > 0 &&
                              missingFields.map((missingField, idx) => {
                                return <li key={idx}>{missingField}</li>;
                              })}
                          </ul>
                        </div>
                      </Then>
                      <Else>
                        <h4 className="my-4">
                          By agreeing to release, you agree to the terms after:
                        </h4>
                        <ul className="my-6 list-inside list-decimal space-y-4">
                          <li>
                            The question will be on a waiting list for approval,
                            you still editable at this stage.
                          </li>
                          <li>
                            Your question may be denied release if any
                            inappropriate and infringing content.
                          </li>
                          <li>
                            There must be no content that compares to questions
                            other.
                          </li>
                          <li>
                            It is your responsibility to support learners after
                            registered questions.
                          </li>
                          <li>
                            For the question there is a fee. Amount will be
                            added account and can be withdrawn manually.
                          </li>
                        </ul>
                      </Else>
                    </If>
                  </div>

                  <div className="flex w-full items-center justify-end">
                    <button
                      onClick={() => {
                        if (missingFields.length > 0) {
                          setIsOpen(false);
                        } else {
                          handlePublishQuestion();
                        }
                      }}
                      disabled={
                        status === 'loading' ||
                        questionCtx?.updateQuestionStatus === 'loading'
                      }
                      className="smooth-effect absolute-center min-h-[4.5rem] min-w-[16.9rem] rounded-2xl border border-gray-500 py-3 px-4 hover:border-green-300 hover:bg-green-300 dark:border-white dark:hover:text-black"
                    >
                      {status === 'loading' ||
                      questionCtx?.updateQuestionStatus === 'loading' ? (
                        <Loading />
                      ) : missingFields.length > 0 ? (
                        'Understood'
                      ) : (
                        'Agree and release'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
