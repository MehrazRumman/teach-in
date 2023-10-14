import React, { memo, useEffect, useState, useCallback } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FiTrash } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import Editor from '~/components/shared/RichEditor';
import type { QuestionType } from '~/types';
import { GiArcheryTarget, GiExplosiveMaterials } from 'react-icons/gi';
import { MdDisabledVisible } from 'react-icons/md';

interface QuestionCreationTestProps {
  q?: QuestionType;
  questionIndex: number;
  saveChanges: (question: QuestionType) => void;
  closeQModal: () => void;
  removeQuestion: (question: QuestionType) => void;
}

function QuestionCreationTest({
  q,
  questionIndex,
  removeQuestion,
  closeQModal,
  saveChanges,
}: QuestionCreationTestProps) {
  const [question, setQuestion] = useState(q);

  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(
    question?.correctOptionIndex || 0,
  );

  const [selectedExams, setSelectedExams] = useState<string[]>(
    question?.boardExams || [],
  );

  const [selectedTags, setSelectedTags] = useState<string[]>(
    question?.tags || [],
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

  const [rerenderUi, setRerenderUi] = useState(true);

  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);

  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  function extractInfo(text: string) {
    const questionText = '';

    // console.log(':::::');
    // console.log(text);

    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/<br \/>/g, ' ');

    text = text.replace(/\s+/g, ' ');

    console.log(':::::2');
    console.log(text);

    try {
      const pattern =
        /<p>\s*([\d০-৯]+)\.\s(.*?)\s*\[\s*(.*?)\s*\]\sক\s+(.*?)\s*খ\s+(.*?)\s*গ\s+(.*?)\s*ঘ\s+(.*?) (চ|ছ|জ|ঝ) (.*?)<\/p>/;

      const match = text.match(pattern);

      if (match !== null) {
        console.log(match);
        const questionText = match[2];
        const option1 = match[4];
        const option2 = match[5];
        const option3 = match[6];
        const option4 = match[7];
        const exams = match[3] ? (match[3].length > 1 ? match[3] : null) : null;
        const ansPattern = /(চ|ছ|জ|ঝ)/;
        const ansMatch = match[8]?.match(ansPattern);
        const explanation = match[9];

        if (ansMatch !== null) {
          if (ansMatch) {
            const ans = ansMatch[0];
            const ansNumber =
              ans === 'চ'
                ? 1
                : ans === 'ছ'
                ? 2
                : ans === 'জ'
                ? 3
                : ans === 'ঝ'
                ? 4
                : 0;

            setQuestion((prevState: any) => ({
              ...prevState,
              question: questionText,
              option1: option1,
              option2: option2,
              option3: option3,
              option4: option4,
              correctOptionIndex: ansNumber,
              explanation: explanation,
            }));

            setSelectedExams((exams?.split(';') as string[]) || []);
            setCorrectOptionIndex(ansNumber);
          }
        }
      } else {
        setQuestion((prevState: any) => ({
          ...prevState,
          question: text,
        }));
      }
    } catch (err) {
      if (questionText) {
        setQuestion((prevState: any) => ({
          ...prevState,
          question: questionText,
        }));
      } else {
        setQuestion((prevState: any) => ({
          ...prevState,
          question: text,
        }));
      }
    }
  }

  function extractInfoEnglish(text: string) {
    const questionText = '';

    // console.log(':::::');
    // console.log(text);

    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/<br>/g, ' ');
    text = text.replace(/<br \/>/g, ' ');

    text = text.replace(/\s+/g, ' ');

    // console.log('English:::::2');
    // console.log(text);

    try {
      const pattern =
        /<p>\s*([\d0-9]+)\.\s(.*?)\s*\[\s*(.*?)\s*\]\sK\s+(.*?)\s*L\s+(.*?)\s*M\s+(.*?)\s*N\s+(.*?) (P|Q|R|S) (.*?)<\/p>/;
      //   /<p>\s*([\d0-৯]+)\.\s(.*?)\s*\[\s*(.*?)\s*\]\sক\s+(.*?)\s*খ\s+(.*?)\s*গ\s+(.*?)\s*ঘ\s+(.*?) (চ|ছ|জ|ঝ) (.*?)<\/p>/;

      //  // /<p>\s*([\d0-9]+)\.\s(.*?)\s*\[\s*(.*?)\s*\]\sK\s+(.*?)\s*L\s+(.*?)\s*M\s+(.*?)\s*N\s+(.*?) (P|Q|R|S) (.*?)<\/p>/;
      //  //  <p>\s*([\d0-9]+)\.\s(.*?)\[(.*?)\]\sK\s*(.*?)\s*L\s*(.*?)\s*M\s*(.*?)\s*N\s*(.*?)\s*(P|Q|R|S)\s*(.*?)<\/p></p>

      // /\s*([\d0-9]+)\.\s(.*?)\[(.*?)\]\sK\s*(.*?)\s*L\s*(.*?)\s*M\s*(.*?)\s*N\s*(.*?)\s*(P|Q|R|S)\s*(.*?)<\/p>/;

      const match = text.match(pattern);

      if (match !== null) {
        // console.log(match);

        const questionText = match[2];
        const option1 = match[4];
        const option2 = match[5];
        const option3 = match[6];
        const option4 = match[7];
        const exams = match[3] ? (match[3].length > 1 ? match[3] : null) : null;
        const ansPattern = /(P|Q|R|S)/;
        const ansMatch = match[8]?.match(ansPattern);
        const explanation = match[9];

        setQuestion((prevState: any) => ({
          ...prevState,
          question: questionText,
          option1: option1,
          option2: option2,
          option3: option3,
          option4: option4,
          explanation: explanation,
        }));

        if (ansMatch !== null) {
          if (ansMatch) {
            const ans = ansMatch[0];
            const ansNumber =
              ans === 'P'
                ? 1
                : ans === 'Q'
                ? 2
                : ans === 'R'
                ? 3
                : ans === 'S'
                ? 4
                : 0;

            setQuestion((prevState: any) => ({
              ...prevState,
              correctOptionIndex: ansNumber,
            }));

            setSelectedExams((exams?.split(';') as string[]) || []);
            setCorrectOptionIndex(ansNumber);
          }
        }
      } else {
        console.log('Match Not Found');
        setQuestion((prevState: any) => ({
          ...prevState,
          question: text,
        }));
      }
    } catch (err) {
      console.error(err);
      if (questionText) {
        setQuestion((prevState: any) => ({
          ...prevState,
          question: questionText,
        }));
      } else {
        setQuestion((prevState: any) => ({
          ...prevState,
          question: text,
        }));
      }
    }
  }

  function extractInfoEnglishOption(text: string, optionIndex: number) {
    // console.log(':::::');
    // console.log(text);

    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/<br>/g, ' ');
    text = text.replace(/<br \/>/g, ' ');

    text = text.replace(/\s+/g, ' ');

    console.log(':::::2 Option English');
    console.log(text);

    try {
      const pattern =
        /<p>K\s+(.*?)\s*L\s+(.*?)\s*M\s+(.*?)\s*N\s+(.*?) (P|Q|R|S) (.*?)<\/p>/;

      const match = text.match(pattern);

      if (match !== null) {
        console.log(match);

        const option1 = match[1];
        const option2 = match[2];
        const option3 = match[3];
        const option4 = match[4];

        setQuestion((prevState: any) => ({
          ...prevState,
          option1: option1,
          option2: option2,
          option3: option3,
          option4: option4,
        }));

        const ansPattern = /(P|Q|R|S)/;
        const ansMatch = match[5]?.match(ansPattern);

        if (ansMatch !== null) {
          if (ansMatch) {
            const ans = ansMatch[0];
            const ansNumber =
              ans === 'P'
                ? 1
                : ans === 'Q'
                ? 2
                : ans === 'R'
                ? 3
                : ans === 'S'
                ? 4
                : 0;

            setQuestion((prevState: any) => ({
              ...prevState,
              correctOptionIndex: ansNumber,
            }));
            setCorrectOptionIndex(ansNumber);
          }
        }
      } else {
        setQuestion((prevState: any) => ({
          ...prevState,
          [`option${optionIndex}`]: text,
        }));
      }
    } catch (err) {
      console.log('Errorr');
      setQuestion((prevState: any) => ({
        ...prevState,
        [`option${optionIndex}`]: text,
      }));
    }
  }

  const handleQuestionTitleChange = (value: string) => {
    //if value starts with more than 3 ore more spaces, remove them

    if (value.startsWith('   ')) {
      value = value.replace(/(^\s*)/g, '');
    }

    setQuestion((prevState: any) => ({
      ...prevState,
      question: value,
    }));

    if (isChecked) {
      extractInfoEnglish(value);
    } else {
      extractInfo(value);
    }
  };

  const handleQuestionExplanationChange = useCallback((value: string) => {
    setQuestion((prevState: any) => ({
      ...prevState,
      explanation: value,
    }));
  }, []);

  const handleOptionChange = (optionIndex: number, value: string) => {
    // setQuestion((prevState: any) => ({
    //   ...prevState,
    //   [`option${optionIndex}`]: value,
    // }));

    console.log(value);
    console.log(optionIndex);

    if (optionIndex === 1) {
      if (value.startsWith('   ')) {
        value = value.replace(/(^\s*)/g, '');
      }

      extractInfoEnglishOption(value, optionIndex);
    } else {
      setQuestion((prevState: any) => ({
        ...prevState,
        [`option${optionIndex}`]: value,
      }));
    }
  };

  const handleCorrectOptionChange = useCallback((optionIndex: number) => {
    setCorrectOptionIndex(optionIndex);
    setQuestion((prevState: any) => ({
      ...prevState,
      correctOptionIndex: optionIndex,
    }));
  }, []);

  const [doneEditing, setDoneEditing] = useState(false);

  useEffect(() => {
    if (
      question?.question &&
      question?.explanation &&
      question?.option1 &&
      question?.option2 &&
      question?.option3 &&
      question?.option4 &&
      correctOptionIndex
    ) {
      setDoneEditing(true);
    }
  }, [
    question?.question,
    question?.explanation,
    correctOptionIndex,
    question?.option1,
    question?.option2,
    question?.option3,
    question?.option4,
  ]);
  return (
    <div className="fixed inset-0 ml-[16rem] flex rounded bg-opacity-50 p-2">
      <div
        className={`ml-12 h-full w-full overflow-y-auto rounded-lg ${
          !doneEditing ? 'bg-red-100 dark:bg-rose-950' : 'bg-white'
        } p-1 dark:bg-[#3b3b3b]`}
      >
        <div className="mb-2 ">
          <div
            ref={animationParent}
            className={`mx-5 flex flex-col space-y-4 rounded-xl ${
              !doneEditing ? 'bg-red-100 dark:bg-rose-950' : 'bg-white'
            } p-1 dark:bg-[#3b3b3b]`}
          >
            <div className="flex flex-col">
              <div className="flex flex-row justify-between">
                <div>
                  Question: {questionIndex + 1} : {question?.order + 1}
                </div>
                <div className="mt-2 flex flex-col space-y-2"></div>
                <div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={handleToggle}
                      />
                      <div className="toggle__line h-4 w-10 rounded-full bg-gray-400 shadow-inner"></div>
                      <div
                        className={`toggle__dot absolute inset-y-0 left-0 h-6 w-6 rounded-full bg-white shadow ${
                          isChecked ? 'ml-5' : 'ml-0'
                        }`}
                      ></div>
                    </div>
                    <div
                      className={`ml-3 text-gray-700 ${
                        isChecked ? 'font-semibold' : 'font-normal'
                      }`}
                    >
                      English Text
                    </div>
                  </label>
                </div>
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRerenderUi(!rerenderUi);
                    }}
                    className="smooth-effect text-bold m-2 mx-12 rounded-full bg-gray-100  p-3 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-yellow-950"
                  >
                    <MdDisabledVisible className="h-8 w-8" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      saveChanges(question as QuestionType);
                    }}
                    className="smooth-effect text-bold m-2 mx-12 rounded-full  bg-gray-100 p-3 hover:bg-green-300 hover:text-green-700 dark:bg-green-950"
                  >
                    <CheckIcon className="h-8 w-8" />
                  </button>
                  <button
                    onClick={() => {
                      closeQModal();
                      removeQuestion(question as QuestionType);
                    }}
                    className="smooth-effect text-bold mx-12 rounded-full bg-gray-100  p-3 hover:bg-red-100 hover:text-rose-700 dark:bg-rose-950"
                  >
                    <TrashIcon className="h-8 w-8" />
                  </button>

                  <button
                    onClick={closeQModal}
                    className="smooth-effect text-bold m-2 mx-12 rounded-full  bg-gray-100 p-3 hover:bg-red-100 hover:text-red-700 dark:bg-red-950"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {rerenderUi && (
              <div>
                <>
                  <div className="mx-2 flex flex-col md:px-4">
                    <Editor
                      onEditorChange={handleQuestionTitleChange}
                      contents={question?.question}
                    />
                  </div>
                </>

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
                        </div>
                        {correctOptionIndex === 1 && (
                          <div className="flex items-center">
                            <FaCheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                      </div>

                      <>
                        <Editor
                          onEditorChange={(value) =>
                            handleOptionChange(1, value)
                          }
                          contents={question?.option1}
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
                    </div>
                    <div
                      className={`ml-2 flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark ${
                        correctOptionIndex === 2 ? 'border-green-500' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="m-2 flex">
                          <div>{2 + '. '}</div>
                        </div>
                        {correctOptionIndex === 2 && (
                          <div className="flex items-center">
                            <FaCheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                      </div>

                      {/* {shouldShowInput && (
                  
                )} */}

                      <>
                        <Editor
                          styles="px-0"
                          onEditorChange={(value) =>
                            handleOptionChange(2, value)
                          }
                          contents={question?.option2}
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
                          {/* <div
                      className="ml-4 w-fit"
                      dangerouslySetInnerHTML={{
                        __html: question?.option3 || '',
                      }}
                    /> */}
                        </div>
                        {correctOptionIndex === 3 && (
                          <div className="flex items-center">
                            <FaCheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                      </div>

                      {/* {shouldShowInput && (
                 
                )} */}

                      <>
                        <Editor
                          styles="px-0"
                          onEditorChange={(value) =>
                            handleOptionChange(3, value)
                          }
                          contents={question?.option3}
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
                    </div>
                    <div
                      className={`ml-2 flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark ${
                        correctOptionIndex === 4 ? 'border-green-500' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="m-2 flex">
                          <div>{4 + '. '}</div>
                          {/* <div
                      className="ml-4 w-fit"
                      dangerouslySetInnerHTML={{
                        __html: question?.option4 || '',
                      }}
                    /> */}
                        </div>
                        {correctOptionIndex === 4 && (
                          <div className="flex items-center">
                            <FaCheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                        )}
                      </div>

                      {/* {shouldShowInput && (
                 
                )} */}

                      <>
                        <Editor
                          styles="px-0"
                          onEditorChange={(value) =>
                            handleOptionChange(4, value)
                          }
                          contents={question?.option4}
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
                    </div>
                  </div>
                </div>

                <>
                  <div className="mx-2 flex flex-col space-y-6 md:px-4">
                    <div className="ml-4 flex flex-row justify-between">
                      <div>Explanation: </div>
                    </div>
                    <Editor
                      onEditorChange={handleQuestionExplanationChange}
                      contents={question?.explanation || ''}
                    />
                  </div>
                </>
              </div>
            )}

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
                      (Exams like ৩২তম বিসিএস, প্রাইমারী নিবন্ধন পরীক্ষা,
                      এইচএসসি ঢাকা বোর্ড ২০১২ ইত্যাদি)
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col space-y-2">
                    {selectedExams?.map((Exam, index) => (
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
                      <PlusIcon className="h-8 w-8" />{' '}
                      <span>Add Board Exam</span>{' '}
                    </button>
                  </div>
                </div>

                <div className="my-4 flex w-full flex-col px-6">
                  <div className="flex flex-col">
                    <h2 className="flex items-center space-x-3">
                      <GiArcheryTarget className="h-8 w-8" /> <span>Group</span>
                    </h2>
                  </div>

                  <div className="mt-2 flex flex-col space-y-2">
                    <input
                      type="number"
                      className="w-full rounded-lg border p-2"
                      placeholder="Group"
                      value={question?.group}
                      onChange={(e) => {
                        setQuestion((prevState: any) => ({
                          ...prevState,
                          group: e.target.value,
                        }));
                      }}
                    />
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
                          // setQuestion((prev: any) => ({
                          //   ...prev,
                          //   exams: [...prev?.exams, selectedExamName],
                          // }));

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
                          setSelectedTags((prevTags) => [
                            ...prevTags,
                            selectedTag,
                          ]);

                          setQuestion((prevQuestion: any) => ({
                            ...prevQuestion,
                            tags: [...prevQuestion.tags, selectedTag],
                          }));

                          // question?.tags = JSON.parse(
                          //   JSON.stringify(selectedTags) || [],
                          // );
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
        </div>
      </div>
    </div>
  );
}
export default memo(QuestionCreationTest);
