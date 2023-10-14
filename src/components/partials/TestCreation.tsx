import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { FiDelete, FiSave } from 'react-icons/fi';
import { useIsFirstRender } from 'usehooks-ts';
import { trpc } from '~/utils/trpc';
import Loading from '../buttons/Loading';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { RiShieldUserLine } from 'react-icons/ri';
import Link from 'next/link';
import { BiCategoryAlt, BiExport, BiImport } from 'react-icons/bi';
import type { QuestionType, TestType } from '~/types';
import QuestionCreationTest from '../features/teaching/QuestionCreationTest';
import { toast } from 'react-hot-toast';
import { GrUserExpert } from 'react-icons/gr';
import { MdDriveFileRenameOutline, MdNumbers } from 'react-icons/md';
import { categories_detail, MathSection, QUESTION_LEVEL } from '~/constants';

export default function TestCreation() {
  const { data: session } = useSession();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  let importing = false;

  const [testLive, setTestLive] = useState<TestType>();

  // if (router.query?.slug) {
  //   fetchData();
  // }

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/trpc/test.findTestBySlug', {
        params: {
          batch: 1,
          input: JSON.stringify({
            '0': { json: { slug: router.query?.slug as string } },
          }),
        },
      });

      const test = response.data[0].result.data.json;
      console.log('Re Fetching....');
      setTestLive(test as TestType);
    } catch (error) {
      // Handle any errors that occur during the data fetching process
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    fetchData(); // Call fetchData when the component is mounted
  }, []);

  const deleteTest = async (testId: string) => {
    if (window.confirm('Are you sure to delete this test?')) {
      try {
        if (!testId) throw new Error();
        await axios.delete(`/api/test/${testId}`).then((res) => {
          console.log('res:: ', res);
          window.history.back();
        });
      } catch (error) {
        // Handle the error here
      }
    }
  };

  const exportTest = async (t) => {
    // Convert the t object to JSON string
    const jsonData = JSON.stringify(t, null, 2);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Generate a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);

    // Set the file name based on the t name property (if available)
    const fileName = t.name ? `${t.name}.json` : 't.json';
    downloadLink.download = fileName;

    // Append the link to the document and click it programmatically to trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Remove the link from the document
    document.body.removeChild(downloadLink);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileContent = await file.text();
    // Parse the JSON data
    const testData = JSON.parse(fileContent);

    testData?.questions?.sort((a, b) => a.order - b.order);
    console.log('Inserting....');
    setTestLive(testData);
  };

  const handleImportClick = () => {
    importing = true;
    document.getElementById('fileInput').click();
  };

  const ref = useRef<HTMLDivElement | null>(null);

  const saveChanges = (question: QuestionType) => {
    setTestLive((prev) => {
      const newQuestions = [...prev?.questions]; // Make a copy of the questions array
      newQuestions[question.order] = question; // Update the question at the specified index
      return { ...prev, questions: newQuestions }; // Update the testLive object with the new questions array
    });
    closeModal();
  };

  const removeQuestion = (question: QuestionType) => {
    setTestLive((prev) => {
      const newQuestions = [...prev?.questions]; // Make a copy of the questions array
      newQuestions.splice(question.order, 1); // Remove the question at the specified index
      return { ...prev, questions: newQuestions }; // Update the testLive object with the new questions array
    });
    closeModal();
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const openModal = (index: number) => {
    setSaving?.(false);
    setSelectedQuestionIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedQuestionIndex(0);
    setModalOpen(false);
  };

  const [showPassword, setShowPassword] = useState(false);
  const save = () => {
    if (testLive?.name) {
      toast.loading('Adding....');

      (async function () {
        try {
          if (!session?.user?.id) throw new Error();

          const r = await axios.post('/api/test/update', {
            ...testLive,
            userId: session?.user?.id,
          });
          if (r.status === 201) {
            toast.dismiss();
            toast.success('Updated');
          } else {
            toast.dismiss();
            toast.error('Failed: ' + r.status);
          }
        } catch (error) {
          toast.dismiss();
          toast.error('Failed');
        }
      })();
    }
  };

  function formatNumber(number) {
    if (!number) return ''; // Handle empty or undefined values
    return number
      .toString()
      .replace(/\D/g, '') // Remove non-digit characters
      .replace(/(\d{3})(?=\d)/g, '$1 '); // Add a space every 3 digits
  }

  return (
    <>
      <div className="flex min-h-screen flex-col space-y-14 pb-[10rem] pt-[7rem] md:pb-[7rem] md:pt-[5rem]">
        <div className="md:w-[80% mx-auto flex w-[90%] flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="mb-10 flex items-center space-x-4 text-3xl">
              <PencilIcon className="h-8 w-8" />{' '}
              <span className="font-bold">Make a Model Test</span>
            </h1>
            <Link href={'/merit/' + testLive?.id}>
              <button className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-green-400 px-4 py-3 text-gray-600">
                <span>Merit List</span>
                <RiShieldUserLine className="h-8 w-8" />
              </button>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleImportClick();
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-red-400 px-4 py-3 text-gray-600"
            >
              <span>Import</span>
              <BiImport className="h-8 w-8" />
            </button>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button
              onClick={(e) => {
                e.preventDefault();
                exportTest(testLive);
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-blue-400 px-4 py-3 text-gray-600"
            >
              <span>Export</span>
              <BiExport className="h-8 w-8" />
            </button>

            <button
              onClick={() => {
                deleteTest(testLive?.id);
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-yellow-400 px-4 py-3 text-gray-600"
            >
              <span>Delete</span>
              <FiDelete className="h-8 w-8" />
            </button>
          </div>

          <>
            <div className="flex flex-col justify-between lg:flex-row">
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="mt-4 flex flex-col"
                >
                  <h1 className="text-3xl">Basic information</h1>

                  <div className="my-4 flex w-full flex-col px-6">
                    <div className="flex flex-col">
                      <h2 className="flex items-center space-x-3">
                        <MdDriveFileRenameOutline className="h-8 w-8" />{' '}
                        <span>Test Unique name</span>
                      </h2>
                      <span className="text-xl italic text-red-500">
                        Do Not Edit this
                      </span>{' '}
                      <span className="text-xl italic">
                        (Up to 20 characters)
                      </span>
                    </div>

                    <input
                      type="text"
                      disabled={testLive?.name?.length > 10}
                      value={testLive?.name || ''}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          return { ...prev, name: e.target.value };
                        });
                      }}
                      placeholder="Test Unique Name"
                      className={`my-2 rounded-xl  p-4 focus:ring-1 focus:ring-gray-200 `}
                    />
                  </div>

                  <div className="my-4 flex w-full flex-col px-6">
                    <div className="flex flex-col">
                      <h2 className="flex items-center space-x-3">
                        <MdDriveFileRenameOutline className="h-8 w-8" />{' '}
                        <span>Test Show name</span>
                      </h2>
                      <span className="text-xl italic">
                        (Up to 100 characters)
                      </span>
                    </div>

                    <input
                      type="text"
                      value={testLive?.showName || testLive?.name || ''}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          return { ...prev, showName: e.target.value };
                        });
                      }}
                      placeholder="Model Tast Name..."
                      className={`my-2 rounded-xl  p-4 focus:ring-1 focus:ring-gray-200 `}
                    />
                  </div>

                  <div className="my-4 flex w-full flex-col px-6">
                    <div className="flex flex-col">
                      <h2 className="flex items-center space-x-3">
                        <MdNumbers className="h-8 w-8" />{' '}
                        <span>Order(For Serialization)</span>
                      </h2>
                      <span className="text-xl italic">
                        (000 digits for each category, subcategory and section )
                      </span>
                    </div>

                    <input
                      type="text" // Change the input type to "text" to display the formatted number
                      value={formatNumber(testLive?.order) || ''}
                      onChange={(e) => {
                        // When the input changes, update the state as usual
                        setTestLive((prev) => {
                          return {
                            ...prev,
                            order: Number(e.target.value.replace(/ /g, '')),
                          }; // Remove spaces before updating state
                        });
                      }}
                      placeholder="000 000 000"
                      className={`my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200`}
                    />
                  </div>

                  <div className="my-4 flex w-full flex-col px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                      <h2 className="flex items-center space-x-3">
                        <BiCategoryAlt className="h-8 w-8" />{' '}
                        <span>Category Test</span>
                      </h2>
                    </div>

                    <select
                      value={testLive?.category?.name || ''}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          const das = prev?.category || { name: '' };
                          das.name = e.target.value;
                          return { ...prev, category: das };
                        });
                      }}
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

                    {testLive?.category && (
                      <select
                        className="my-4 max-w-md rounded-xl p-4"
                        value={testLive?.subCategory || ''}
                        onChange={(e) => {
                          setTestLive((prev) => {
                            return { ...prev, subCategory: e.target.value };
                          });
                        }}
                      >
                        <option disabled defaultValue="Detailed Category">
                          Subcategory:
                        </option>
                        {categories_detail
                          .find((e) => e.title === testLive?.category?.name)
                          ?.fields.map((category_details) => {
                            return (
                              <option
                                value={category_details}
                                key={category_details}
                              >
                                {category_details}
                              </option>
                            );
                          })}
                      </select>
                    )}

                    {/গণিত/.test(testLive?.subCategory) && (
                      <select
                        value={testLive?.section || ''}
                        onChange={(e) => {
                          setTestLive((prev) => {
                            return { ...prev, section: e.target.value };
                          });
                        }}
                        className="my-4 max-w-md rounded-xl p-4"
                      >
                        <option disabled defaultValue="Detailed Section">
                          Category Section:
                        </option>
                        {MathSection.sections.map((d) => {
                          return (
                            <option value={d} key={d}>
                              {d}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {/*if the categories_detail == "গণিত" then I need to show another selet here, from MathSection object:
        export const MathSection = {
  title: 'গণিত',
  sections: ['বীজগণিত', 'পাটিগণিত', 'জ্যামিতি', 'মানসিক দক্ষতা'],
};
        */}
                  </div>

                  <div className="my-4 flex w-full flex-col px-6">
                    <div className="flex flex-col">
                      <h2 className="flex items-center space-x-3">
                        <GrUserExpert className="h-8 w-8" />{' '}
                        <span>Who is the Test for?</span>
                      </h2>
                      <span className="text-xl italic">
                        (The range of learners you want to target!)
                      </span>
                    </div>

                    <select
                      value={testLive?.testLevel || ''}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          return { ...prev, testLevel: e.target.value };
                        });
                      }}
                      className="my-4 max-w-md rounded-xl p-4"
                    >
                      <option disabled defaultValue={'Object:'}>
                        Object:
                      </option>
                      {QUESTION_LEVEL.map((level) => {
                        return (
                          <option value={level} key={level}>
                            {level}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </form>
              </div>
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="mt-6 flex flex-col space-y-6"
                >
                  <h1 ref={ref} className="text-3xl">
                    Release test
                  </h1>
                  <h3>Private Mode</h3>
                  <select
                    value={testLive?.publishMode || 'public'}
                    onChange={(e) => {
                      setTestLive((prev) => {
                        return { ...prev, publishMode: e.target.value };
                      });
                    }}
                    className="my-4 max-w-md rounded-xl p-4"
                  >
                    <option value="Public" defaultValue={'Public'}>
                      Public
                    </option>
                    <option value="Private">Private</option>
                  </select>
                  {testLive?.publishMode?.toLowerCase() === 'private' && (
                    <>
                      <h3>Test password</h3>
                      <div className="my-2 flex items-center">
                        <input
                          autoComplete="new-password"
                          value={testLive?.password || '69'}
                          onChange={(e) => {
                            setTestLive((prev) => {
                              return { ...prev, password: e.target.value };
                            });
                          }}
                          className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
                          type={showPassword ? 'text' : 'password'}
                        />

                        <button
                          onClick={() =>
                            setShowPassword((prevState) => !prevState)
                          }
                          className="p-4"
                        >
                          {!showPassword ? (
                            <EyeIcon className="h-8 w-8" />
                          ) : (
                            <EyeSlashIcon className="h-8 w-8" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                  <h3>Amount</h3>
                  <select
                    value={testLive?.testPriceSelect || 'free'}
                    onChange={(e) => {
                      setTestLive((prev) => {
                        return { ...prev, testPriceSelect: e.target.value };
                      });
                    }}
                    className="my-4 max-w-md rounded-xl p-4"
                  >
                    <option defaultChecked>Free</option>
                    <option>Paid</option>
                  </select>
                  {testLive?.testPriceSelect?.toLocaleLowerCase() ===
                    'paid' && (
                    <div className="flex items-center space-x-4">
                      <input
                        value={testLive?.amount || 0}
                        onChange={(e) => {
                          setTestLive((prev) => {
                            return { ...prev, amount: e.target.value };
                          });
                        }}
                        type="number"
                        placeholder="100"
                        className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
                      />
                      <span>Tk</span>
                    </div>
                  )}
                  Mark Per Question
                  <div className="flex items-center space-x-4">
                    <input
                      value={testLive?.markPerQuestion || 1}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          return { ...prev, markPerQuestion: e.target.value };
                        });
                      }}
                      type="number"
                      placeholder="1"
                      className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
                    />
                    <span>Mark</span>
                  </div>
                  Mark Reduce Per Question
                  <div className="flex items-center space-x-4">
                    <input
                      value={testLive?.markReducePerQuestion || 0.25}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          return {
                            ...prev,
                            markReducePerQuestion: e.target.value,
                          };
                        });
                      }}
                      type="number"
                      placeholder="0.25"
                      className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
                    />
                    <span>Mark</span>
                  </div>
                  Time Per Question
                  <div className="flex items-center space-x-4">
                    <input
                      value={testLive?.timePerQuestion || 1}
                      onChange={(e) => {
                        setTestLive((prev) => {
                          return { ...prev, timePerQuestion: e.target.value };
                        });
                      }}
                      type="number"
                      placeholder="1"
                      className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
                    />
                    <span>Min</span>
                  </div>
                  <h3>Test content in the test: </h3>
                  <select
                    value={testLive?.testState || 0}
                    onChange={(e) => {
                      setTestLive((prev) => {
                        return { ...prev, testState: e.target.value };
                      });
                    }}
                    className="my-4 max-w-md rounded-xl p-4"
                  >
                    <option defaultChecked>Complete</option>
                    <option>Not Completed</option>
                  </select>
                </form>
              </div>
            </div>

            <div className="mt-4 flex flex-col space-y-6">
              <h1 ref={ref} className="text-3xl">
                Questions:
              </h1>
              <p className="italic md:w-full">
                You should add at least 10 questions to your test. Please read
                the <span className="text-rose-500">instructions</span> for more
                details!
              </p>

              <table className="w-full border-collapse rounded-lg border border-gray-300">
                <thead>
                  <tr>
                    <th className="smooth-effect px-6 py-3 outline-1 odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400">
                      Index
                    </th>
                    <th className="smooth-effect px-6 py-3 outline-1 odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400">
                      Order
                    </th>
                    <th className="smooth-effect px-6 py-3 outline-1 odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400">
                      Group
                    </th>
                    <th className="smooth-effect px-6 py-3 outline-1 odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400">
                      Question
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testLive?.questions?.map((question, index: number) => (
                    <tr
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        openModal(index);
                      }}
                      className="smooth-effect cursor-pointer outline-1 odd:bg-slate-300 hover:bg-purple-500 hover:text-white odd:dark:bg-dark-background"
                    >
                      <td className=" px-2 py-3 text-center">{index + 1}</td>
                      <td className=" px-2 py-3 text-center">
                        {question?.order + 1}
                      </td>
                      <td className=" px-2 py-3 text-center">
                        {question?.group || -1}
                      </td>
                      <td className=" px-2 py-3 ">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: question.question || '',
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-row gap-4">
                <button
                  onClick={() => {
                    const q = {
                      question: '',
                      order: testLive?.questions?.length || 0,
                      group: testLive?.questions
                        ? testLive?.questions[testLive?.questions?.length - 1]
                            ?.group || 0
                        : 0,
                      option1: '',
                      option2: '',
                      option3: '',
                      option4: '',
                      option5: '',
                      correctOptionIndex: 0,
                      explanation: '',
                      tags: [],
                      boardExams: [],
                    } as any;

                    setTestLive((prev) => {
                      const newQuestions = [...(prev?.questions || [])];
                      newQuestions.push(q);
                      return { ...prev, questions: newQuestions }; // Update the testLive object with the new questions array
                    });

                    openModal(q.order);
                  }}
                  className="absolute-center w-fit space-x-3 rounded-xl border border-gray-500 p-3"
                >
                  <PlusIcon className="h-8 w-8" />
                  <span>Add Question</span>
                </button>
                <button className="absolute-center w-fit space-x-3 rounded-xl border border-gray-500 p-3">
                  <PlusIcon className="h-8 w-8" />
                  <span>Add Question From Repository</span>
                </button>
              </div>

              {modalOpen && !saving && (
                <QuestionCreationTest
                  q={testLive.questions[selectedQuestionIndex]}
                  removeQuestion={removeQuestion}
                  closeQModal={closeModal}
                  saveChanges={saveChanges}
                  questionIndex={selectedQuestionIndex}
                  key={selectedQuestionIndex}
                />
              )}
            </div>

            {/* <TestCreationContents
                test={testLive}
                saving={saving}
                setSaving={setSaving}
              /> */}
          </>
        </div>

        <div className="fixed bottom-10 right-10 z-[350] flex items-center space-x-4">
          <button
            onClick={() => {
              setSaving(true);
              save();
            }}
            className="smooth-effect group flex items-center space-x-4 rounded-xl border border-gray-600 bg-gray-600 p-4 text-white dark:border-white dark:bg-dark-background dark:text-white"
          >
            <FiSave className="smooth-effect h-8 w-8 group-hover:scale-125" />
            <span>Save</span>
          </button>
          {/* <button
            onClick={() => {
              testCtx?.dispatch();
              setShouldMountModel(true);
            }}
            className="smooth-effect group flex items-center space-x-4 rounded-xl border border-gray-600 bg-yellow-200 p-4 dark:border-white dark:text-black"
          >
            <HiOutlineSpeakerphone className="smooth-effect h-8 w-8 group-hover:scale-125" />
            <span>Release</span>
          </button> */}
        </div>
      </div>
    </>
  );
}
