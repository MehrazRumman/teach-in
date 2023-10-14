import { useSetAtom } from 'jotai';
import { memo, useEffect, useRef, useState, useMemo } from 'react';
import { lecturesContents } from '~/atoms/lecturesContents';
import Editor from '~/components/shared/RichEditor';
import { checkFileType } from '~/utils/stringHandler';

import {
  DocumentTextIcon,
  FilmIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

interface VideoInfo {
  title: string;
  duration: string;
  youtubeId: string;
}

import type { Dispatch, SetStateAction } from 'react';
import type QuillComponent from 'react-quill';
import type { LectureType } from '~/types';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
interface LectureCreationProps {
  lectures?: LectureType[];
  chapterIndex: number;
  lectureIndex: number;
  removeLecture: Dispatch<SetStateAction<number[]>>;
}

function LectureCreation({
  lectures,
  chapterIndex,
  lectureIndex,
  removeLecture,
}: LectureCreationProps) {
  const lectureByDb = useMemo(() => {
    return (
      lectures && lectures.find((lecture) => lecture.order === lectureIndex)
    );
  }, [lectures]);

  // console.log('lectureByDb:; ', lectureByDb);

  const [lectureTitle, setLectureTitle] = useState(() => {
    if (lectureByDb) return lectureByDb.title;

    return `Lesson ${lectureIndex}`;
  });

  const [description, setDescription] = useState(() => {
    if (lectureByDb) return lectureByDb.description || '';

    return '';
  });

  const [isPreview, setIsPreview] = useState(() => {
    if (lectureByDb) return lectureByDb.isPreview;

    return true;
  });
  const [shouldShowInput, setShouldShowInput] = useState(false);
  const [shouldContents, setShouldContents] = useState(false);
  const [shouldVideoUpload, setShouldVideoUpload] = useState(true);
  const [addingVideo, setAddingVideo] = useState(true);

  const [fileURL, setFileUrl] = useState<string>(' ');
  const [fileName, setFileName] = useState<string>(' ');

  const [fileUrls, setFilesUrl] = useState<
    {
      fileId: string;
      fileName: string;
      fileURL: string;
      fileType: string;
      fileDuration: number;
      fileYoutubeId?: string;
    }[]
  >(() => {
    if (lectureByDb) {
      return lectureByDb.resources.map((rsc) => ({
        fileId: rsc.id,
        fileName: rsc.name,
        fileURL: rsc.url,
        fileType: rsc.type,
        fileDuration: rsc.videoDuration || 0,
        fileYoutubeId: rsc.youtubeVideoId || '',
      }));
    }

    return [];
  });

  const editorRef = useRef<QuillComponent | null>(null);

  const setLecturesContents = useSetAtom(lecturesContents);

  //hook update lecture values
  useEffect(() => {
    const payload = {
      title: lectureTitle,
      description: description,
      isPreview,
      order: lectureIndex,
      chapterOrder: chapterIndex,
      resources: fileUrls.map((elem) => ({
        id: nanoid(),
        name: elem.fileName,
        url: elem.fileURL,
        type: elem.fileType,
        videoDuration: elem.fileDuration,
        youtubeVideoId: elem.fileYoutubeId,
      })),
    };

    // console.log('payload::::; ', payload);

    setLecturesContents((prevState) => {
      //create if non-exist:
      if (
        !prevState.find(
          (lecture) =>
            lecture.order === lectureIndex &&
            lecture.chapterOrder === chapterIndex,
        )
      ) {
        return [...prevState, payload];
      }
      //update if exist:
      else {
        return prevState.map((lecture) => {
          if (
            lecture.order === lectureIndex &&
            lecture.chapterOrder === chapterIndex
          ) {
            return payload;
          }

          return lecture;
        });
      }
    });
  }, [
    description,
    lectureTitle,
    isPreview,
    fileUrls,
    editorRef.current?.value,
    lectureIndex,
    chapterIndex,
  ]);

  const [info, setInfo] = useState<VideoInfo>({
    title: '',
    duration: '',
    youtubeId: '',
  });

  useEffect(() => {
    if (fileURL) {
      const getVideoInfo = async () => {
        try {
          const videoId = getVideoId(fileURL);
          const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=AIzaSyCKEpwjAEcy979dinuoTSsCD4eMB8JaHLA`,
          );

          setInfo({
            title: response.data.items[0].snippet.title,
            duration: response.data.items[0].contentDetails.duration,
            youtubeId: videoId ?? '',
          });
        } catch (error) {
          console.error(error);
        }
      };

      try {
        if (addingVideo) {
          getVideoInfo();
        }
      } catch (e) {}
    }
  }, [fileURL, fileName, addingVideo]);

  const getVideoId = (videoLink: string) => {
    try {
      if (videoLink.includes('youtube.com')) {
        const videoIdMatch = videoLink.match(/v=([^&]+)/);
        return videoIdMatch![1];
      } else {
        toast.error('Invalid Youtube Link');
        setFileUrl('');
        return;
      }
    } catch (e) {
      toast.error('Invalid Youtube Link');
      setFileUrl('');
      return;
    }
  };

  return (
    <div className="flex w-full flex-col rounded-lg bg-slate-200 p-4 dark:bg-background_dark">
      <div className="flex justify-between">
        <h2>
          {lectureIndex}: {lectureTitle}
        </h2>

        <div className="flex space-x-4">
          <button
            onClick={() => setShouldContents((prevState) => !prevState)}
            className="smooth-effect flex items-center justify-center rounded-xl  border border-gray-600 p-2 text-xl hover:border-green-500 hover:text-green-500"
          >
            <PlusIcon className="h-8 w-8" />
            <span>Resources</span>
          </button>
          <button
            onClick={() => setShouldShowInput((prevState) => !prevState)}
            className="smooth-effect hover:text-yellow-400"
          >
            <PencilIcon className="h-8 w-8" />
          </button>
          <button
            onClick={() => {
              setLecturesContents((prevState) => {
                prevState.splice(
                  prevState.findIndex(
                    (lecture) =>
                      lecture.chapterOrder === chapterIndex &&
                      lecture.order === lectureIndex,
                  ),
                  1,
                );

                return prevState;
              });
              setTimeout(() => {
                removeLecture((prev) => {
                  return prev.filter((idx) => idx !== lectureIndex);
                });
              }, 100);
            }}
            className="smooth-effect hover:text-rose-500"
          >
            <TrashIcon className="h-8 w-8" />
          </button>
        </div>
      </div>

      {shouldShowInput && (
        <>
          <input
            onChange={(event) => {
              setLectureTitle(event.currentTarget.value);
            }}
            placeholder="Lesson "
            type="text"
            className="my-4 rounded border border-gray-600 p-3 dark:border-white/70"
            value={lectureTitle}
          />
          <h3 className="italic">Description Course</h3>
          <Editor
            styles="px-0"
            onEditorChange={(value) => {
              setDescription(value);
            }}
            contents={description}
            getInstance={(editor) => {
              editorRef.current = editor;
            }}
          />
          <label className="mt-6 flex items-center space-x-4">
            <h3 className="italic">Lesson previewed(Preview)</h3>
            <input
              onChange={(e) => {
                setIsPreview(e.target.checked);
              }}
              type="checkbox"
              defaultChecked={false}
              className="checkbox-success checkbox checkbox-lg md:checkbox-md"
            />
          </label>
        </>
      )}

      {shouldContents && (
        <div className="mx-auto my-4 flex space-x-4">
          {shouldVideoUpload && (
            <div className="flex flex-col space-y-4">
              <label className="flex flex-col space-y-2">
                <span>Enter YouTube Video URL</span>
                <input
                  onChange={(e) => {
                    setAddingVideo(true);
                    setFileUrl(e.currentTarget.value);
                  }}
                  type="text"
                  className="rounded border border-gray-600 p-3 dark:border-white/70"
                  placeholder="https://www.youtube.com/watch?v=example"
                />
              </label>
              <button
                onClick={async () => {
                  if (fileURL && info.title && addingVideo) {
                    setFilesUrl((urls) =>
                      urls.concat({
                        fileId: nanoid(),
                        fileName: info.title,
                        fileURL: fileURL,
                        fileYoutubeId: info.youtubeId,
                        fileDuration: moment
                          .duration(info.duration)
                          .asSeconds(),
                        fileType: 'youtube',
                      }),
                    );
                    setShouldVideoUpload(false);
                  } else {
                    toast.error('Please provide a valid youtube link');
                  }
                }}
                className="smooth-effect flex items-center justify-center rounded-xl border border-gray-600 p-2 text-xl hover:border-green-500 hover:text-green-500"
              >
                <PlusIcon className="h-8 w-8" />
                <span>Add Video</span>
              </button>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <label className="flex flex-col space-y-2">
              <span>Enter Note (PDF or other) Name</span>
              <input
                onChange={(e) => {
                  setAddingVideo(false);
                  setFileName(e.currentTarget.value);
                }}
                type="text"
                className="rounded border border-gray-600 p-3 dark:border-white/70"
                placeholder="Note Name"
              />
            </label>

            <label className="flex flex-col space-y-2">
              <span>Enter Download Link</span>
              <input
                onChange={(e) => {
                  setAddingVideo(false);
                  setFileUrl(e.currentTarget.value);
                }}
                type="text"
                className="rounded border border-gray-600 p-3 dark:border-white/70"
                placeholder="https://example.com/note.pdf"
              />
            </label>

            <button
              onClick={async () => {
                if (!addingVideo && fileName && fileURL) {
                  setFilesUrl((urls) =>
                    urls.concat({
                      fileId: nanoid(),
                      fileName: fileName,
                      fileURL: fileURL,
                      fileYoutubeId: '',
                      fileDuration: 0,
                      fileType: 'file',
                    }),
                  );
                } else {
                  toast.error('Please provide a valid file name and URL');
                }
              }}
              className="smooth-effect flex items-center justify-center rounded-xl border border-gray-600 p-2 text-xl hover:border-green-500 hover:text-green-500"
            >
              <PlusIcon className="h-8 w-8" />
              <span>Add File</span>
            </button>
          </div>
        </div>
      )}

      <ul className="mx-auto my-4 flex w-full flex-col space-y-4">
        {fileUrls.length > 0 &&
          fileUrls.map((fileInfo) => {
            return (
              <li
                key={fileInfo.fileId}
                className="flex w-full items-center justify-between"
              >
                <div className="flex h-fit w-fit items-center space-x-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  <span className="line-clamp-1 max-w-[90%]">
                    {fileInfo.fileName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFilesUrl((prevState) => {
                      return prevState.filter(
                        (file) => file.fileId !== fileInfo.fileId,
                      );
                    });

                    if (fileInfo.fileType === 'youtube') {
                      setShouldVideoUpload(false);
                    } else {
                      setShouldVideoUpload(true);
                    }
                  }}
                  className="absolute-center smooth-effect rounded-full border border-gray-600 p-1 hover:bg-rose-500 hover:text-white dark:border-white"
                >
                  <XMarkIcon className="h-6 w-6" />{' '}
                </button>
              </li>
            );
          })}
      </ul>

      <div className=""></div>
    </div>
  );
}

export default memo(LectureCreation);

// <UploadButton
//   uploader={uploader}
//   options={{ multi: false, mimeTypes: ['video/mp4'] }}
//   onComplete={(files) => {
//     setFilesUrl((urls) =>
//       urls.concat(
//         files.map((file) => {
//           return {
//             fileId: String(file.originalFile.lastModified),
//             fileName: file.originalFile.originalFileName as string,
//             fileURL: file.originalFile.fileURL,
//           };
//         }),
//       ),
//     );

//     if (files.length > 0) {
//       setShouldVideoUpload(false);
//     }
//   }}
// >
//   {({ onClick }) => (
//     <button
//       className="smooth-effect absolute-center space-x-3 rounded-xl border border-dashed border-gray-500 p-2 "
//       onClick={onClick}
//     >
//       <FilmIcon className="h-8 w-8" />
//       <span>Video</span>
//     </button>
//   )}
// </UploadButton>
