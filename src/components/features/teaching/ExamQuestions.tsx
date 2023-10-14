import { useEffect, useRef, useState } from 'react';
import type { TestType } from '~/types';
import Countdown from 'react-countdown-now';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  FaCheckCircle,
  FaInfoCircle,
  FaPlayCircle,
  FaQuestionCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import {
  MdDoneAll,
  MdOutlineRadioButtonUnchecked,
  MdTry,
  MdUpdate,
} from 'react-icons/md';
import { useSession } from 'next-auth/react';
import PieChart from '~/components/shared/PieChart';
import { BiCategory, BiCheckboxSquare, BiTime } from 'react-icons/bi';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

import axios from 'axios';
import type { Result } from '@prisma/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { PATHS } from '~/constants';
import { useTheme } from 'next-themes';
import router from 'next/router';
import Modal from '~/components/partials/Modal';
import CryptoJS from 'crypto-js';

interface ExamQuestionsProps {
  test?: TestType | null;
}

export default function ExamQuestions({ test }: ExamQuestionsProps) {
  const currentDateTime = new Date();
  const contestEndTime = test?.contestEnd;

  const timeDiff = contestEndTime?.getTime() - currentDateTime?.getTime();
  const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
  );
  const secondsRemaining = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const [remainingTimeContest, setRemainingTimeContest] = useState({
    hours: hoursRemaining,
    minutes: minutesRemaining,
    seconds: secondsRemaining,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainingTimeContest?.seconds > 0) {
        setRemainingTimeContest((prevTime) => ({
          ...prevTime,
          seconds: prevTime.seconds - 1,
        }));
      } else if (remainingTimeContest?.minutes > 0) {
        setRemainingTimeContest((prevTime) => ({
          hours: prevTime.hours,
          minutes: prevTime.minutes - 1,
          seconds: 59,
        }));
      } else if (remainingTimeContest?.hours > 0) {
        setRemainingTimeContest({
          hours: remainingTimeContest?.hours - 1,
          minutes: 59,
          seconds: 59,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTimeContest]);

  //get user from session
  const { data: session } = useSession();

  const [examGivenEarlier, setExamGivenEarlier] = useState(false);

  const { status: sessionStatus } = useSession();

  const divRef = useRef(null);

  const componentRef = useRef(null);

  const scrollToComponent = () => {
    // Access the DOM node of the component using the ref
    if (componentRef.current) {
      const topOffset = componentRef?.current?.getBoundingClientRect().top;
      window.scrollTo({
        top: window.scrollY + topOffset - 270,
        behavior: 'smooth',
      });
    }
  };

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

  const scrollToComponentStart = () => {
    // startExam()
    // scrollToComponent()
    const scrollTopPosition = window.innerHeight * 1.4; // Calculate the top 5% of the page
    window.scrollTo(0, scrollTopPosition); // Scrolls the page to the top 5%
  };

  const [showJustResultView, setShowJustResultView] = useState(false);

  const questionLength = test?.questions?.length || 0;

  const markPerQuestion = test?.markPerQuestion || 1;
  const timePerQuestion = test?.timePerQuestion || 1;

  let markReducePerQuestion = 0.25;
  markReducePerQuestion = Number(test?.markReducePerQuestion);

  const [givingReExam, setGivingReExam] = useState(false);

  const xorKey = 0x55;
  const secretKey = '0';

  const [remainingTime, setRemainingTime] = useState(() => {
    return questionLength * timePerQuestion * 60;
  });

  const [isTimeUp, setIsTimeUp] = useState(false);
  const [startPageExam, setStartPageExam] = useState(false);
  useEffect(() => {
    if (startPageExam || givingReExam) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 0) {
            setIsTimeUp(true);
            clearInterval(timer);
            // Obfuscate and store remaining time in local storage
            localStorage.removeItem(`timer_${test?.id}`);
            return 0;
          }
          // Obfuscate and store remaining time in local storage
          const obfuscatedValue = (prevTime - 1) ^ xorKey;
          localStorage.setItem(`timer_${test?.id}`, obfuscatedValue.toString());
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [startPageExam, givingReExam, test?.id, xorKey]);

  const [result, setResult] = useState<Result>({} as Result);

  const [canSelectOption, setCanSelectOption] = useState(true);

  const showResult = () => {
    setShowExplanation(true);
    setCanSelectOption(false);
    setRemainingTime(0);
  };

  const hideResult = () => {
    setShowExplanation(false);
    setCanSelectOption(true);
    // setRemainingTime(0);
  };

  const [experience, setExperience] = useState(
    test?.results && test?.results[0] && test?.results[0]?.experience
      ? test?.results[0]?.experience
      : '',
  );

  const startExam = () => {
    setStartPageExam(true);
    setCanSelectOption(true);
    scrollToComponent();
    const storedValue = localStorage.getItem(`timer_${test?.id}`);

    if (storedValue) {
      setRemainingTime(parseInt(storedValue, 10) ^ xorKey);
    } else {
      setRemainingTime(questionLength * markPerQuestion * 60);
    }
    const encryptedArray = localStorage.getItem(`result_${test?.id}`);
    if (encryptedArray !== null) {
      // Decrypt the stored array using AES decryption
      const bytes = CryptoJS.AES.decrypt(encryptedArray, secretKey);
      const decryptedArray = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setSelectedOptionIndexes(decryptedArray);
    } else {
      setSelectedOptionIndexes([]);
    }

    setShowExplanation(false);
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!session?.user?.id) throw new Error();

      await axios.put('/api/test/submit', {
        ...result,
        experience: experience,
        userId: session?.user?.id,
      });

      toast.success('Thank you for your feedback.');
    } catch (error: any) {
      toast.error(error?.toLocaleString());
    }
  };

  const startReExam = () => {
    setStartPageExam(false);
    setGivingReExam(true);
    startExam();
    setIsTimeUp(false);
    // const scrollTopPosition = window.innerHeight * 0.1; // Calculate the top 5% of the page
    // window.scrollTo(0, scrollTopPosition); // Scrolls the page to the top 5%
  };
  const updateResult = async (origin: string) => {
    //setStartPageExam(true);
    const scrollTopPosition = window.innerHeight * 0.1; // Calculate the top 5% of the page
    window.scrollTo(0, scrollTopPosition); // Scrolls the page to the top 5%

    localStorage.removeItem(`timer_${test?.id}`);

    localStorage.removeItem(`result_${test?.id}`);

    showResult();
    setShowJustResultView(true);
    const correctOptionIndexes = test?.questions.map(
      (question) => question.correctOptionIndex,
    );
    let correctSelections = 0;

    selectedOptionIndexes.forEach((optionIndex, questionIndex) => {
      if (
        correctOptionIndexes &&
        optionIndex === correctOptionIndexes[questionIndex]
      ) {
        correctSelections++;
      }
    });

    //calculate undefined selections

    const notAttemptedCount =
      questionLength -
      selectedOptionIndexes.filter((item) => typeof item === 'number').length;

    const totalWrong = questionLength - correctSelections - notAttemptedCount;
    const totalMarks = correctSelections - totalWrong * markReducePerQuestion;

    // console.log('totalMarks: ' + totalMarks);
    // console.log('correctSelections: ' + correctSelections);
    // console.log('totalWrong: ' + totalWrong);
    // console.log('markReducePerQuestion: ' + markReducePerQuestion);
    // console.log('notAttemptedCount: ' + notAttemptedCount);

    const result = {
      testId: test?.id,
      userId: session?.user?.id,
      totalQuestions: questionLength || 0,
      totalAttempted: questionLength - notAttemptedCount || 0,
      totalCorrect: correctSelections,
      totalWrong,
      totalMarks,
      percentage: (totalMarks / (questionLength * markPerQuestion)) * 100,
      selectedOptionIndexes: selectedOptionIndexes,
      slug: test?.slug,
    };

    if (!examGivenEarlier) {
      test?.results.unshift(result as Result);
    }

    setResult(result as Result);

    if (!examGivenEarlier) {
      if (!test?.isRunning) {
        toast.error(
          'We are no longer taking submission, but you can still practice',
        );
        return;
      }

      try {
        if (test?.contestMode) {
          if (
            remainingTimeContest.seconds <= 0 &&
            remainingTimeContest.minutes <= 0 &&
            remainingTimeContest.hours <= 0
          ) {
            return toast.error('Contest is over, Result not submitted');
          }
        }

        if (!session?.user?.id) throw new Error();
        await axios.put('/api/test/submit', {
          ...result,
          userId: session?.user?.id,
        });
        toast.success('Your result is submitted in the Merit List.');
      } catch (error) {}
    } else {
      setGivingReExam(false);
      //setStartPageExam(false);
    }
  };

  const [showExplanation, setShowExplanation] = useState(false);

  const [animationParent] = useAutoAnimate<HTMLDivElement>();

  const [selectedOptionIndexes, setSelectedOptionIndexes] = useState<number[]>(
    [],
  );

  const handleOptionSelect = async (
    optionIndex: number,
    questionIndex: number,
  ) => {
    if (canSelectOption) {
      setSelectedOptionIndexes((prev) => {
        const newSelectedOptionIndexes = [...prev];
        newSelectedOptionIndexes[questionIndex] = optionIndex;
        encryptData(newSelectedOptionIndexes);
        return newSelectedOptionIndexes;
      });
    }
  };

  async function encryptData(data: any[]) {
    const encryptedArray = await CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey,
    );
    localStorage.setItem(`result_${test?.id}`, encryptedArray.toString());
  }

  useEffect(() => {
    if (test?.results?.length === 1 && !givingReExam) {
      setExamGivenEarlier(true);
      setResult(test?.results[0] as Result);
      setSelectedOptionIndexes(test?.results[0]?.selectedOptionIndexes || []);
      showResult();
    }
  });

  const [password, setPassword] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const handlePasswordCheck = (e) => {
    e.preventDefault();

    // Replace "yourActualPassword" with the actual password to check against
    if (password === '69') {
      toast.loading('Loading Questions...');

      const storedValue = localStorage.getItem(`timer_${test?.id}`);

      if (storedValue) {
        setRemainingTime(
          (parseInt(storedValue, 10) ^ xorKey) -
            Number(questionLength * 0.1) * markPerQuestion * 60,
        );
      } else {
        setRemainingTime(questionLength * markPerQuestion * 60);
      }
      const encryptedArray = localStorage.getItem(`result_${test?.id}`);
      if (encryptedArray !== null) {
        // Decrypt the stored array using AES decryption
        const bytes = CryptoJS.AES.decrypt(encryptedArray, secretKey);
        const decryptedArray = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        setSelectedOptionIndexes(decryptedArray);
      } else {
        setSelectedOptionIndexes([]);
      }

      scrollToComponent();
      setStartPageExam(true);
      setIsModalOpen(false);

      toast.dismiss();
    } else {
      toast.error("Passcode doesn't matched");
    }
  };
  // useEffect(() => {
  //   const loadScript = () => {
  //     const script = document.createElement('script');
  //     script.src =
  //       'https://www.wiris.net/demo/plugins/app/WIRISplugins.js?viewer=image';
  //     document.body.appendChild(script);
  //   };

  //   const timeout = setTimeout(loadScript, 7000);

  //   return () => clearTimeout(timeout);
  // }, []);
  const theme = useTheme();
  const isDarkMode = theme.theme === 'dark';

  useEffect(() => {
    if (isTimeUp) {
      updateResult('useEffect TimeUp');
    }
  }, [isTimeUp]);

  return (
    <>
      {isModalOpen && (
        <Modal
          onClose={() => {
            setIsModalOpen(false);
            toast.error(
              'You must enter the password to participate in this exam',
            );
          }}
          title={'Password Needed!'}
        >
          <div className="text-center">
            <p className="mx-4 my-4 text-black dark:text-white">
              Enter the model test Password to participate in this exam.
            </p>

            <input
              type="password"
              id="passwordInput"
              className="rounded border p-2"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="mx-5 my-5 rounded-lg bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-600"
              onClick={handlePasswordCheck}
            >
              See Questions
            </button>

            <div>
              Rules:
              <div className="mx-4 my-6">
                <li>
                  Time per question {test?.timePerQuestion} in minutes can be
                  found
                </li>
                <li>
                  Only the 1st time submission will be included in the merit
                  list
                </li>
                <li>
                  All subsequent submissions will be treated as PACTIS
                  submissions
                </li>
                <li>
                  Assigning {test?.markPerQuestion} marks to each question will
                  be
                </li>
                <li>
                  {test?.markReducePerQuestion} marks for each wrong answer Can
                  be cut
                </li>

                <li>
                  If for any reason the first exam is missed, later 10% less
                  time will be available to give the exam
                </li>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <MathJaxContext version={3} config={config}>
        <div className={isDarkMode ? 'dark-div' : 'normal-div'}>
          <div className="mt-4 flex flex-col items-center justify-center">
            <div className="flex w-full flex-col space-y-4 lg:w-3/5">
              <div className="flex flex-col items-center justify-center rounded-xl bg-gray-200 p-3 dark:bg-gray-800 ">
                <div className="flex w-full flex-col justify-between ">
                  <div
                    className={`flex w-full flex-col rounded-xl bg-purple-200 p-4 text-xl dark:bg-gray-900
            `}
                  >
                    {test?.contestMode && remainingTimeContest ? (
                      <>
                        <h2 className="text-2xl font-bold">
                          Running Contest : {test?.name}
                        </h2>
                        {/* show remaining time */}
                        <div className="flex flex-row items-center p-2 text-2xl">
                          <BiTime className="mr-2" /> Contest Remaining Time:{' '}
                          {remainingTimeContest.hours}:
                          {remainingTimeContest.minutes}:
                          {remainingTimeContest.seconds}
                        </div>
                      </>
                    ) : (
                      <h2 className="text-2xl font-bold">
                        EXAM : {test?.name}
                      </h2>
                    )}
                    <div className="flex h-full w-full flex-col justify-between">
                      {showExplanation ? (
                        // className="hidden lg:block"
                        <div>
                          <div className="flex flex-row items-center p-2 text-2xl">
                            <BiCategory className="mr-2" /> Topic:{' '}
                            {test?.category.name} - {test?.subCategory}
                          </div>

                          <div className="flex flex-row items-center p-2 text-2xl">
                            <BiTime className="mr-2" /> Duration:{' '}
                            {questionLength * markPerQuestion} minutes
                            <FaQuestionCircle className="mx-2 mr-2 " />{' '}
                            Questions: {test?.questions?.length}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex flex-row items-center p-2 text-2xl">
                            <BiCategory className="mr-2" /> Topic:{' '}
                            {test?.category.name} - {test?.subCategory}
                          </div>

                          <div className="flex flex-row items-center p-2 text-2xl">
                            <BiTime className="mr-2" /> Duration:{' '}
                            {questionLength * markPerQuestion} minutes
                            <FaQuestionCircle className="mx-2 mr-2" />{' '}
                            Questions: {test?.questions?.length}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-center py-2 text-2xl">
                    {examGivenEarlier ? (
                      <div className="collapse mt-2 w-full rounded-xl bg-gray-200 dark:bg-slate-900">
                        <input
                          type="checkbox"
                          checked={showJustResultView}
                          onChange={(e) => {
                            setShowJustResultView(!showJustResultView);
                            setShowExplanation(!showExplanation);
                          }}
                        />
                        {!showJustResultView && (
                          <div className="collapse-title text-xl font-medium">
                            You have already given the Exam.{' '}
                            <u>
                              <b>Click here to see Result</b>
                            </u>
                          </div>
                        )}

                        <div className="collapse-content">
                          <div
                            ref={divRef}
                            id="myDiv"
                            className={`flex flex-col items-center justify-center rounded bg-purple-200 p-2 text-xl dark:bg-gray-900 
            ${showExplanation ? 'w-full ' : 'hidden'}
            `}
                          >
                            <h2 className="text-2xl font-bold">
                              Result{' : '}
                              {examGivenEarlier ? (
                                <span className="text-xl font-bold text-green-600">
                                  Exam given at :{' '}
                                  {new Date(
                                    result.updatedAt || new Date(),
                                  ).toLocaleString()}
                                </span>
                              ) : null}
                            </h2>

                            {showExplanation && result?.totalAttempted ? (
                              <div>
                                <div className=" inset-0 flex h-[20rem] max-h-[18rem] w-full items-center justify-center md:max-h-[20rem] lg:max-h-[30rem]">
                                  <PieChart
                                    labels={['Correct', 'Wrong', 'Not Tried']}
                                    datasets={[
                                      {
                                        label: 'questions',
                                        data: [
                                          result?.totalCorrect || 0,
                                          result?.totalWrong || 0,
                                          questionLength -
                                            result?.totalAttempted || 0,
                                        ],
                                        backgroundColor: [
                                          'rgba(46, 204, 113, 0.2)', // Correct - light green
                                          'rgba(231, 76, 60, 0.2)', // Wrong - light red
                                          'rgba(149, 117, 205, 0.2)', // Not Tried - light purple
                                        ],
                                        borderColor: [
                                          'rgba(46, 204, 113, 1)', // Correct - green
                                          'rgba(231, 76, 60, 1)', // Wrong - red
                                          'rgba(149, 117, 205, 1)', // Not Tried - purple
                                        ],
                                        borderWidth: 2,
                                      },
                                    ]}
                                  />
                                </div>

                                <div>
                                  <p
                                    className={`text-bold m-3 rounded-xl border-2 px-4 py-2 text-center text-4xl ${
                                      result.percentage >= 70
                                        ? 'outline-green dark:outline-green bg-green-300  dark:bg-green-900'
                                        : result.percentage >= 40
                                        ? 'outline-yellow dark: outline-yellow bg-yellow-300 dark:bg-yellow-900'
                                        : 'outline-red dark:outline-red bg-red-300 dark:bg-red-900'
                                    } `}
                                  >
                                    You got{' '}
                                    <b className="text-4xl">
                                      {result.totalMarks}
                                    </b>{' '}
                                    out of{' '}
                                    {result.totalQuestions * markPerQuestion}
                                  </p>
                                </div>

                                <div className="m-2 flex flex-row justify-between">
                                  <div className="mr-1 flex flex-row items-center ">
                                    <MdTry className="mr-2" /> Tried:{' '}
                                    {result?.totalAttempted}
                                  </div>
                                  <div className="mr-1 flex flex-row items-center ">
                                    <FaCheckCircle className="mr-2" /> Correct:{' '}
                                    {result?.totalCorrect}
                                  </div>
                                  <div className="mr-1 flex flex-row items-center ">
                                    <FaTimesCircle className="mr-2" /> Wrong:{' '}
                                    {result?.totalWrong}
                                  </div>

                                  <div className="mr-1 flex flex-row items-center ">
                                    <FaInfoCircle className="mr-2" />{' '}
                                    Percentage: {/* only xx.xx% */}
                                    {result?.percentage?.toFixed(2) || 100}%
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col items-center justify-center ">
                  {showExplanation ? (
                    <></>
                  ) : (
                    <div className="collapse  w-full items-center justify-center rounded-xl bg-gray-200 px-2 dark:bg-slate-900">
                      <input type="checkbox" />
                      <div className="collapse-title text-xl font-medium">
                        To Know Exam Rules{' '}
                        <u>
                          <b>Click here</b>
                        </u>
                      </div>
                      <div className="collapse-content">
                        <li>
                          {test?.timePerQuestion} minutes per question Time will
                          be available
                        </li>
                        <li>Only 1st time submission is merit list will get</li>
                        <li>
                          All subsequent submissions will be treated as Practice
                          submissions
                        </li>
                        <li>
                          {test?.markPerQuestion} marks for each question will
                          be provided
                        </li>
                        <li>
                          {test?.markReducePerQuestion} for each wrong answer
                          Can be marked and cut
                        </li>

                        <li>
                          If for some reason the first exam is missed Later, 10%
                          less time will be available to give the exam
                        </li>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <hr className="border-gray-200" />
            </div>

            {startPageExam ? (
              <>
                <h1 ref={componentRef} className="p:2 mt-2 text-3xl">
                  {showExplanation ? 'Questions with Solution' : 'Questions'}
                </h1>
                {test?.questions.map((question, questionIndex) => {
                  const optionIndexes = [
                    [1, 2],
                    [3, 4],
                  ];

                  return (
                    <div
                      key={questionIndex}
                      id="question"
                      ref={animationParent}
                      className="m-4 flex w-full flex-col space-y-4 rounded-xl bg-white p-4 dark:bg-[#3b3b3b] lg:w-3/5 "
                    >
                      <div className="flex flex-col">
                        <div className="flex flex-row justify-between">
                          <div className="m-4 flex w-full flex-row justify-between rounded-lg">
                            {questionIndex + 1}
                            {showExplanation && (
                              <div className="flex w-full flex-col items-center justify-center lg:flex-row">
                                {question.boardExams?.map(
                                  (boardExam: string) => {
                                    return (
                                      <div key={boardExam}>
                                        <span className="mx-3 rounded-full bg-violet-200 px-4 py-1 text-lg  dark:bg-violet-950">
                                          {boardExam}
                                        </span>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            )}

                            {showExplanation &&
                              (selectedOptionIndexes[questionIndex] ===
                              question.correctOptionIndex ? (
                                <FaCheckCircle className="ml-1 text-green-500" />
                              ) : (
                                <FaTimesCircle className="ml-1 text-red-500" />
                              ))}
                          </div>
                        </div>
                        <h1>
                          <div className="ml-2 mr-2 flex flex-col space-y-8 rounded-lg bg-gray-100 dark:bg-gray-900 md:px-6">
                            <MathJax>
                              <div
                                className="border-grey-900 w-full rounded-lg p-2"
                                dangerouslySetInnerHTML={{
                                  __html: question.question,
                                }}
                              />
                            </MathJax>
                          </div>
                        </h1>
                      </div>

                      {optionIndexes.map((optionPair: number[]) => {
                        return (
                          <div
                            key={optionPair[0] + 'i' + questionIndex}
                            className="mr-4 flex flex-col lg:mr-0 lg:flex-row"
                          >
                            {optionPair.map((optionIndex: number) => {
                              const isSelected =
                                selectedOptionIndexes[questionIndex] ===
                                optionIndex;
                              const isCorrect =
                                question.correctOptionIndex === optionIndex;
                              const isExplanationShown = showExplanation;

                              return (
                                <div
                                  key={optionIndex + 'i' + questionIndex}
                                  className={`m-2 flex  w-full flex-col rounded-lg lg:w-1/2 ${
                                    isExplanationShown
                                      ? isCorrect
                                        ? 'bg-green-400 dark:bg-green-900'
                                        : isSelected
                                        ? 'bg-red-400 dark:bg-red-900' // If selected and incorrect, bg color is red
                                        : 'bg-gray-200 dark:bg-gray-800'
                                      : ''
                                  } ${
                                    canSelectOption
                                      ? isSelected
                                        ? 'bg-purple-300 dark:bg-purple-900'
                                        : 'bg-gray-200 dark:bg-gray-800'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    handleOptionSelect(
                                      optionIndex,
                                      questionIndex,
                                    )
                                  }
                                >
                                  <div
                                    key={optionIndex + 'a' + questionIndex}
                                    className={`flex items-center justify-between `}
                                  >
                                    <div
                                      key={optionIndex + 'd' + questionIndex}
                                      className={`m-2 flex `}
                                    >
                                      <div className={`mr-2 text-center`}>
                                        {isSelected ? (
                                          isExplanationShown ? (
                                            isCorrect ? (
                                              <FaCheckCircle
                                                className={`m-2 text-green-800 dark:text-green-400`}
                                              />
                                            ) : (
                                              <FaTimesCircle
                                                className={`m-2 text-red-800 dark:text-red-400`}
                                              />
                                            )
                                          ) : (
                                            <FaCheckCircle
                                              className={`m-2 text-purple-800 dark:text-purple-400`}
                                            />
                                          )
                                        ) : (
                                          <MdOutlineRadioButtonUnchecked className="m-2 text-gray-500" />
                                        )}
                                      </div>
                                      <MathJax>
                                        <div
                                          key={
                                            optionIndex + 'j' + questionIndex
                                          }
                                          className={`w-fit `}
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              (question as any)[
                                                `option${optionIndex}`
                                              ] || 0,
                                          }}
                                        />
                                      </MathJax>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      {showExplanation && (
                        <>
                          <div className="ml-2 mr-2 flex flex-col rounded-lg  bg-green-100 p-4 dark:bg-[#073515]">
                            <h2>
                              <b>Explanation:</b>
                            </h2>
                            <MathJax>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: question.explanation || '',
                                }}
                              />
                            </MathJax>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Fixed position div */}
                <div className="text-purple glow-animation fixed bottom-4 left-1/2 my-2 flex w-fit -translate-x-1/2 transform items-center justify-center rounded-full bg-gray-200 px-3 dark:bg-gray-800 dark:text-white md:bottom-10 md:right-4">
                  <div className="m-2">
                    <Countdown
                      date={Date.now() + remainingTime * 1000}
                      onComplete={() => {
                        setIsTimeUp(true);
                      }}
                      renderer={({ total }) => {
                        const minutes = Math.floor(total / 60000);
                        const seconds = Math.floor((total % 60000) / 1000);

                        return (
                          <span>
                            Time: {minutes}:{seconds < 10 ? '0' : ''}
                            {seconds.toFixed(1)}
                          </span>
                        );
                      }}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (showExplanation) {
                        startReExam();
                      } else {
                        updateResult('Submit Button');
                      }
                    }}
                    className={`m-2 flex flex-row items-center rounded-full ${
                      showExplanation ? 'bg-purple-700' : 'bg-green-700'
                    } my-4 p-4 text-white shadow-md hover:shadow-lg`}
                  >
                    {!showExplanation ? (
                      <MdDoneAll className="mr-2" />
                    ) : (
                      <MdUpdate className="mr-2" />
                    )}
                    {!showExplanation ? <b>Submit</b> : <b>Reexam</b>}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-row items-center justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();

                    if (sessionStatus === 'unauthenticated') {
                      toast.error(
                        'You need to log in first to participate in this exam',
                      );
                      router.push(`/${PATHS.LOGIN}`);
                    } else {
                      // Prompt a password dialog

                      //Start

                      if (examGivenEarlier) {
                        startReExam();
                      } else {
                        // setIsModalOpen(true);
                        // // scrollToComponentStart();
                        // // setStartPageExam(true);

                        toast.loading('Loading Questions...');

                        const storedValue = localStorage.getItem(
                          `timer_${test?.id}`,
                        );

                        if (storedValue) {
                          setRemainingTime(
                            (parseInt(storedValue, 10) ^ xorKey) -
                              Number(questionLength * 0.1) *
                                markPerQuestion *
                                60,
                          );
                        } else {
                          setRemainingTime(
                            questionLength * markPerQuestion * 60,
                          );
                        }
                        const encryptedArray = localStorage.getItem(
                          `result_${test?.id}`,
                        );
                        if (encryptedArray !== null) {
                          // Decrypt the stored array using AES decryption
                          const bytes = CryptoJS.AES.decrypt(
                            encryptedArray,
                            secretKey,
                          );
                          const decryptedArray = JSON.parse(
                            bytes.toString(CryptoJS.enc.Utf8),
                          );
                          setSelectedOptionIndexes(decryptedArray);
                        } else {
                          setSelectedOptionIndexes([]);
                        }

                        scrollToComponent();
                        setStartPageExam(true);
                        setIsModalOpen(false);

                        toast.dismiss();
                      }
                    }
                  }}
                  className="dart:text-black mt-2 flex h-16 w-full flex-row items-center justify-center rounded text-white hover:text-white lg:h-16 lg:w-3/5 lg:text-3xl"
                  style={{
                    background: 'linear-gradient(to right, #8E2DE2, #4A00E0)',
                  }}
                >
                  <FaPlayCircle className="mr-2" />
                  {/* Assuming you're using Font Awesome for icons */}
                  <strong>
                    {examGivenEarlier ? (
                      <>Re-Exam</>
                    ) : (
                      <>{test?.contestMode ? 'Start Contest' : 'Start Exam'}</>
                    )}
                  </strong>
                </button>
              </div>
            )}
          </div>

          {!startPageExam && !test?.isRunning && (
            <div className="flex h-full w-full flex-row items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${PATHS.MERIT}/${test?.slug}`);
                }}
                className="dart:text-black mt-2 flex h-16 w-full flex-row items-center justify-center rounded text-white hover:text-white lg:h-16 lg:w-3/5 lg:text-3xl"
                style={{
                  background: 'linear-gradient(to right, #2fa162, #1dad76)',
                }}
              >
                <BiCheckboxSquare className="mr-2" />
                {/* Assuming you're using Font Awesome for icons */}
                <strong>Merit List</strong>
              </button>
            </div>
          )}

          {examGivenEarlier || showExplanation ? (
            <>
              <div className="bg-100 dark:bg-gray mx-4 my-4 flex flex-col items-center justify-center rounded">
                Your Feedback about the exam:
                <textarea
                  value={experience || ''}
                  onChange={(e) => setExperience(e.target.value)}
                  className="my-5 w-4/5 rounded-lg p-3 lg:w-3/5 "
                ></textarea>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmitFeedback();
                  }}
                  className="text- mt-2 flex h-16 w-4/5 flex-row items-center justify-center rounded bg-gray-300 text-violet-600 dark:bg-gray-800 lg:h-16 lg:w-3/5"
                >
                  Submit Feedback
                </button>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </MathJaxContext>
    </>
  );
}
