import { useSetAtom } from 'jotai';
import { memo, useState } from 'react';
import { quillEditorState } from '~/atoms/quillEditorState';

import {
  BellIcon,
  ChatBubbleBottomCenterIcon,
  DocumentChartBarIcon,
  PencilSquareIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

import type { Dispatch, SetStateAction } from 'react';
import type { LearningOptions } from '~/types';

const Mapping_Icon: { [key: string]: JSX.Element } = {
  Note: <PencilSquareIcon className="h-6 w-6" />,
  Discuss: <ChatBubbleBottomCenterIcon className="h-6 w-6" />,
  'Learning Tools': <WrenchIcon className="h-6 w-6" />,
  Resources: <DocumentChartBarIcon className="h-6 w-6" />,
  Notification: <BellIcon className="h-6 w-6" />,
} as const;

const Mapping_Lables: { [key: string]: LearningOptions } = {
  Note: 'note',
  Discuss: 'discuss',
  'Learning Tools': 'tools',
  Resources: 'resources',
  Notification: 'announce',
} as const;

interface LearningControlBarProps {
  setOption: Dispatch<SetStateAction<LearningOptions>>;
}

function LearningControlBar({ setOption }: LearningControlBarProps) {
  const setGoToEditor = useSetAtom(quillEditorState);

  const [selectIndex, setSelectIndex] = useState(0);

  const handleClickOption = (btnContent: string, index: number) => {
    setOption(Mapping_Lables[btnContent]!);
    setSelectIndex(index);
    switch (btnContent) {
      case 'Note':
        setGoToEditor(true);
        break;
    }
  };

  return (
    <div className="w-full lg:h-[10vh]">
      <div className="mx-auto w-full overflow-x-scroll py-4 md:max-w-[720px] lg:max-w-[1200px]">
        <div className="tabs mx-auto flex h-fit w-fit flex-nowrap justify-start space-y-6">
          {Array.from([
            'Note',
            'Discuss',
            'Learning Tools',
            'Resources',
            'Notification',
          ]).map((btnContent, index) => {
            return (
              <button
                onClick={() => handleClickOption(btnContent, index)}
                key={btnContent}
                style={{
                  color: selectIndex === index ? '#4b5563' : '',
                }}
                className={`${
                  selectIndex === index ? 'tab-active' : ''
                } smooth-effect tab-lifted tab tab-lg flex min-w-fit flex-nowrap space-x-2 text-3xl text-gray-600 dark:text-white/80`}
              >
                {Mapping_Icon[btnContent]}
                <span>{btnContent}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(LearningControlBar);
