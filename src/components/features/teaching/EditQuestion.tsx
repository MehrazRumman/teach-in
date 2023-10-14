import { useAutoAnimate } from '@formkit/auto-animate/react';
import { CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Question } from '@prisma/client';
import axios from 'axios';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaCheckCircle } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { GiArcheryTarget, GiExplosiveMaterials } from 'react-icons/gi';
import RichEditor from '~/components/shared/RichEditor';

interface EditQuestionProps {
  q?: Question | null;
}

export default function EditQuestion({ q }: EditQuestionProps) {
  const [question, setQuestion] = useState<Question>(q as Question);

  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(
    question?.correctOptionIndex || 0,
  );

  const saveQuestion = async () => {
    // axios call to submit the question

    if (question.tags === undefined || question.tags === null) {
      question.tags = [];
    }
    if (question.boardExams === undefined || question.boardExams === null) {
      question.boardExams = [];
    }

    axios.put(`/api/question/${question.id}`, question).then((res) => {
      toast.success('Question Updated');
    });
  };

  const deleteQuestion = async () => {
    // axios call to submit the question
    axios.delete(`/api/question/${question.id}`).then((res) => {
      toast.success('Question Deleted');
    });
  };

  // Path: src/components/features/teaching/ChapterCreation.tsx
  // Compare this snippet from src/components/features/teaching/EditQuestion.tsx:

  const [selectedExams, setSelectedExams] = useState<string[]>(
    (question?.boardExams as string[]) || undefined,
  );

  const [selectedTags, setSelectedTags] = useState<string[]>(
    (question?.tags as string[]) || undefined,
  );

  const [showModal, setShowModal] = useState(false);
  const [showModalTags, setShowModalTags] = useState(false);
  const [selectedExamName, setSelectedExamName] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const openModal = () => {
    setShowModal(true);
  };
  const openModalTags = () => {
    setShowModalTags(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedExamName('');
  };

  const closeModalTags = () => {
    setSelectedTag('');
    setShowModalTags(false);
  };

  const handleExamRemoval = useCallback(
    (index: number) => {
      const updatedExams = [...selectedExams];
      updatedExams.splice(index, 1);
      setSelectedExams(updatedExams);
    },
    [selectedExams],
  );

  const handleTagRemoval = useCallback(
    (index: number) => {
      const updatedExams = [...selectedTags];
      updatedExams.splice(index, 1);
      setSelectedTags(updatedExams);
    },
    [selectedTags],
  );

  const extractInfo = useCallback(
    (text: string) => {
      let questionText = '';
      try {
        const pattern =
          /<p>([\d০-৯]+)\.\s(.*?)\[(.*?)\]\sক\s(.*?)\sখ\s(.*?)\sগ\s(.*?)\sঘ\s(.*?)\s(.*?)\s(.*?)<\/p>/;
        const match = text.match(pattern);

        questionText = match[2];
        const option1 = match[4];
        const option2 = match[5];
        const option3 = match[6];
        const option4 = match[7];
        const exams = match[3];
        const ansPattern = /(চ|ছ|জ|ঝ)/;
        const ansMatch = match[8].match(ansPattern);
        const ans = ansMatch[0];
        const explanation = match[9];
        const ansNumber =
          ans === 'চ'
            ? 1
            : ans === 'ছ'
            ? 2
            : ans === 'জ'
            ? 3
            : ans === 'ঝ'
            ? 4
            : null;

        setQuestion((prevState) => ({
          ...prevState,
          question: questionText,
          option1: option1,
          option2: option2,
          option3: option3,
          option4: option4,
          correctOptionIndex: ansNumber,
          explanation: explanation,
        }));
        console.log('exams');
        console.log(exams);
        setSelectedExams(exams?.split(';'));
        setCorrectOptionIndex(ansNumber);
        setShouldShowInput(!shouldShowInput);

        console.log('question');
        console.log(question);
      } catch (err) {
        if (questionText) {
          setQuestion((prevState) => ({
            ...prevState,
            question: questionText,
          }));
        } else {
          setQuestion((prevState) => ({
            ...prevState,
            question: text,
          }));
        }
      }
    },
    [question.question],
  );

  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const [shouldShowInput, setShouldShowInput] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleQuestionTitleChange = useCallback(
    (value: string) => {
      extractInfo(value);
    },
    [extractInfo],
  );

  const handleQuestionExplanationChange = useCallback((value: string) => {
    setQuestion((prevState) => ({
      ...prevState,
      explanation: value,
    }));
  }, []);

  const handleOptionChange = useCallback(
    (optionIndex: number, value: string) => {
      setQuestion((prevState) => ({
        ...prevState,
        [`option${optionIndex}`]: value,
      }));
    },
    [],
  );

  const handleCorrectOptionChange = useCallback((optionIndex: number) => {
    setCorrectOptionIndex(optionIndex);
    setQuestion((prevState) => ({
      ...prevState,
      correctOptionIndex: optionIndex,
    }));
  }, []);

  const [doneEditing, setDoneEditing] = useState(false);

  useEffect(() => {
    if (
      question.question &&
      question.explanation &&
      question.option1 &&
      question.option2 &&
      question.option3 &&
      question.option4 &&
      correctOptionIndex
    ) {
      setDoneEditing(true);
    }
  }, [
    question.question,
    question.explanation,
    correctOptionIndex,
    question.option1,
    question.option2,
    question.option3,
    question.option4,
  ]);

  return (
    <div
      ref={animationParent}
      className={`mx-5 flex flex-col space-y-4 rounded-xl ${
        !doneEditing ? 'bg-red-100 dark:bg-red-900' : 'bg-white'
      } p-4 dark:bg-[#3b3b3b]`}
    >
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <div>Question</div>
          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (shouldShowInput) {
                  setShouldShowInput(false);
                  saveQuestion();
                } else {
                  setShouldShowInput(true);
                }
              }}
              className="smooth-effect m-2 hover:text-yellow-400"
            >
              <CheckIcon className="h-8 w-8" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // make a confirm alret

                deleteQuestion();
              }}
              className="smooth-effect hover:text-rose-500"
            >
              <TrashIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
        <h1>
          <div className="flex flex-col space-y-6 md:px-6">
            <div
              className="border-grey-900 w-full rounded-lg border-2 border-dotted p-4"
              dangerouslySetInnerHTML={{
                __html: question.question,
              }}
            />
          </div>
        </h1>
      </div>
      {shouldShowInput && (
        <>
          <div className="mx-2 flex flex-col md:px-4">
            <RichEditor
              onEditorChange={handleQuestionTitleChange}
              contents={question.question}
            />
          </div>
        </>
      )}
      <div className="flex flex-col md:px-6">
        <div className="flex items-center justify-center">
          <div
            className={`mb-4 mr-4 mt-4 flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark ${
              correctOptionIndex === 1 ? 'border-green-500' : ''
            }`}
          >
            <div className="flex justify-between">
              <div className="m-2 flex">
                <div>{1 + '. '}</div>
                <div
                  className="ml-4 w-fit"
                  dangerouslySetInnerHTML={{
                    __html: question.option1 || '',
                  }}
                />
              </div>
              {correctOptionIndex === 1 && (
                <div className="flex items-center">
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              )}
            </div>

            {shouldShowInput && (
              <>
                <RichEditor
                  onEditorChange={(value) => handleOptionChange(1, value)}
                  contents={question.option1}
                />

                <div className="flex items-center space-x-4">
                  <label className="mt-6 flex items-center space-x-4">
                    <h3>Correct Answer? </h3>
                    <input
                      checked={correctOptionIndex === 1}
                      onChange={() => handleCorrectOptionChange(1)}
                      type="checkbox"
                      className="checkbox-success checkbox checkbox-lg md:checkbox-md"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
          <div
            className={`ml-2 flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark ${
              correctOptionIndex === 2 ? 'border-green-500' : ''
            }`}
          >
            <div className="flex justify-between">
              <div className="m-2 flex">
                <div>{2 + '. '}</div>
                <div
                  className="ml-4 w-fit"
                  dangerouslySetInnerHTML={{
                    __html: question.option2 || '',
                  }}
                />
              </div>
              {correctOptionIndex === 2 && (
                <div className="flex items-center">
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              )}
            </div>

            {shouldShowInput && (
              <>
                <RichEditor
                  styles="px-0"
                  onEditorChange={(value) => handleOptionChange(2, value)}
                  contents={question.option2}
                />

                <div className="flex items-center space-x-4">
                  <label className="mt-6 flex items-center space-x-4">
                    <h3>Correct Answer? </h3>
                    <input
                      checked={correctOptionIndex === 2}
                      onChange={() => handleCorrectOptionChange(2)}
                      type="checkbox"
                      className="checkbox-success checkbox checkbox-lg md:checkbox-md"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div
            className={` mb-4 mr-4 mt-4  flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark ${
              correctOptionIndex === 3 ? 'border-green-500' : ''
            }`}
          >
            <div className="flex justify-between">
              <div className="m-2 flex">
                <div>{3 + '. '}</div>
                <div
                  className="ml-4 w-fit"
                  dangerouslySetInnerHTML={{
                    __html: question.option3 || '',
                  }}
                />
              </div>
              {correctOptionIndex === 3 && (
                <div className="flex items-center">
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              )}
            </div>

            {shouldShowInput && (
              <>
                <RichEditor
                  onEditorChange={(value) => handleOptionChange(3, value)}
                  contents={question.option3}
                />

                <div className="flex items-center space-x-4">
                  <label className="mt-6 flex items-center space-x-4">
                    <h3>Correct Answer? </h3>
                    <input
                      checked={correctOptionIndex === 3}
                      onChange={() => handleCorrectOptionChange(3)}
                      type="checkbox"
                      className="checkbox-success checkbox checkbox-lg md:checkbox-md"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
          <div
            className={`ml-2 flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark ${
              correctOptionIndex === 4 ? 'border-green-500' : ''
            }`}
          >
            <div className="flex justify-between">
              <div className="m-2 flex">
                <div>{4 + '. '}</div>
                <div
                  className="ml-4 w-fit"
                  dangerouslySetInnerHTML={{
                    __html: question.option4 || '',
                  }}
                />
              </div>
              {correctOptionIndex === 4 && (
                <div className="flex items-center">
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              )}
            </div>

            {shouldShowInput && (
              <>
                <RichEditor
                  onEditorChange={(value) => handleOptionChange(4, value)}
                  contents={question.option4}
                />

                <div className="flex items-center space-x-4">
                  <label className="mt-6 flex items-center space-x-4">
                    <h3>Correct Answer? </h3>
                    <input
                      checked={correctOptionIndex === 4}
                      onChange={() => handleCorrectOptionChange(4)}
                      type="checkbox"
                      className="checkbox-success checkbox checkbox-lg md:checkbox-md"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <>
        <div className="mx-2 flex flex-col space-y-6 md:px-4">
          <div className="ml-4 flex flex-row justify-between">
            <div>Explanation: </div>
          </div>
          <RichEditor
            onEditorChange={handleQuestionExplanationChange}
            contents={question.explanation || ''}
          />
        </div>
      </>

      <div className="ml-6 mr-6 flex flex-row justify-center">
        <span
          className="text-xl"
          onClick={() => setShowAdvancedOptions((prev) => !prev)}
        >
          <button className="smooth-effect">
            {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
          </button>
        </span>
      </div>
      {showAdvancedOptions && (
        <div className="ml-6 mr-6 mt-4">
          <div className="my-4 flex w-full flex-col px-6">
            <div className="flex flex-col">
              <h2 className="flex items-center space-x-3">
                <GiArcheryTarget className="h-8 w-8" />{' '}
                <span>Question Tags</span>
              </h2>
              <span className="text-xl italic">
                (Tag like Force, Newtons Law, gravitational constants...)
              </span>
            </div>

            <div className="mt-2 flex flex-col space-y-2">
              {selectedTags.map((tag, index) => (
                <div
                  key={`${tag}`}
                  className="flex items-center justify-between rounded-lg bg-gray-200 p-2 px-4 dark:bg-gray-900"
                >
                  <div>{`${tag}`}</div>
                  <button
                    className="smooth-effect"
                    onClick={() => handleTagRemoval(index)}
                  >
                    <FiTrash className="h-6 w-6 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between md:w-1/2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  openModalTags();
                }}
                className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
              >
                <PlusIcon className="h-8 w-8" /> <span>Add Tag</span>{' '}
              </button>
            </div>
          </div>
          <div className="my-4 flex w-full flex-col px-6">
            <div className="flex flex-col">
              <h2 className="flex items-center space-x-3">
                <GiExplosiveMaterials className="h-8 w-8" />{' '}
                <span>Board Exams</span>
              </h2>
              <span className="text-xl italic">
                (Exams like ৩২তম বিসিএস, প্রাইমারী নিবন্ধন পরীক্ষা, এইচএসসি ঢাকা
                বোর্ড ২০১২ ইত্যাদি)
              </span>
            </div>

            <div className="mt-2 flex flex-col space-y-2">
              {selectedExams.map((Exam, index) => (
                <div
                  key={`${Exam}`}
                  className="flex items-center justify-between rounded-lg bg-gray-200 p-2 px-4 dark:bg-gray-900"
                >
                  <div>{`${Exam}`}</div>
                  <button
                    className="smooth-effect"
                    onClick={() => handleExamRemoval(index)}
                  >
                    <FiTrash className="h-6 w-6 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between md:w-1/2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  openModal();
                }}
                className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
              >
                <PlusIcon className="h-8 w-8" /> <span>Add Board Exam</span>{' '}
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-20 rounded-lg bg-white px-6 py-4 shadow-xl dark:bg-gray-800">
            <h2>Add Board Exams</h2>
            <div className="mt-4 flex flex-col space-y-4">
              <input
                type="text"
                className="w-full rounded-lg border p-2"
                placeholder="Exam name"
                value={selectedExamName}
                onChange={(e) => {
                  setSelectedExamName(e.target.value);
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedExamName) {
                    setSelectedExams((prevExams) => [
                      ...prevExams,
                      selectedExamName,
                    ]);

                    question.boardExams = JSON.parse(
                      JSON.stringify(selectedExams) || [],
                    );
                    closeModal();
                  }
                }}
                className="smooth-effect btn-primary btn ml-auto mt-4"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showModalTags && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-20 rounded-lg bg-white px-6 py-4 shadow-xl dark:bg-gray-800">
            <h2>Add Tags</h2>
            <div className="mt-4 flex flex-col space-y-4">
              <input
                type="text"
                className="w-full rounded-lg border p-2"
                placeholder="Tag name"
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedTag) {
                    setSelectedTags((prevTags) => [...prevTags, selectedTag]);

                    question.tags = selectedTags;

                    closeModalTags(); // Close the modal and reset selected exam and year
                  }
                }}
                className="smooth-effect btn-primary btn ml-auto mt-4"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
