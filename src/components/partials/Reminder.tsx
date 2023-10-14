import type { Reminder as IReminder } from '@prisma/client';
import { i18n } from 'dateformat';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Else, If, Then } from 'react-if';
import TextareaAutosize from 'react-textarea-autosize';
import { trpc } from '~/utils/trpc';

import {
  ChatBubbleLeftIcon,
  ClockIcon,
  QueueListIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import Loading from '../buttons/Loading';
import DateSelect from '../shared/DateSelect';

const { TimePicker } =
  typeof window === 'object' ? require('react-ios-time-picker') : () => null;

export default function Reminder() {
  const [reminders, setReminder] = useState<IReminder[] | null>(null);
  const { status, refetch } = trpc.user.findReminders.useQuery(undefined, {
    onSuccess(data) {
      setReminder(data);
    },
  });

  const { mutate: deleteReminder } = trpc.user.deleteReminder.useMutation({
    onError: () => {
      refetch();
    },
  });

  const handleRemoveReminders = (id: string) => {
    setReminder((rs) => rs?.filter((r) => r.id !== id));
    deleteReminder({ id });
  };

  return (
    <div className="mt-4 flex w-full flex-col space-y-6 px-4 py-6 md:mt-0">
      <section className="flex flex-col px-2 md:px-0">
        <h1 className="flex space-x-4 text-3xl">
          <QueueListIcon className="h-8 w-8" /> <span>Reminder list</span>
        </h1>
        <p className="my-2 text-xl italic">
          The system will automatically send reminders to the account's email
          according to the schedule!
        </p>

        <If condition={status === 'loading'}>
          <Then>
            <div className="absolute-center my-4 min-h-[25rem] space-y-4 md:w-[80%] ">
              <Loading />
            </div>
          </Then>
          <Else>
            <ul className="my-4 flex max-h-[50rem] flex-col space-y-4 overflow-y-scroll md:w-[80%]">
              {reminders &&
                reminders.length > 0 &&
                reminders.map((r) => {
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col space-y-2 rounded-xl bg-white px-6 py-4 shadow dark:bg-dark-background"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          <h1 className="whitespace-nowrap text-xl font-bold">
                            Message:
                          </h1>

                          <p className="line-clamp-1 text-xl">{r.message}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveReminders(r.id)}
                          className="p-2"
                        >
                          <TrashIcon className="smooth-effect h-6 w-6 text-rose-500 hover:text-rose-700" />
                        </button>{' '}
                      </div>

                      <div className="flex items-center space-x-4">
                        <h1 className="whitespace-nowrap text-xl font-bold">
                          Reminder time:
                        </h1>
                        <span>
                          {r.time} {r.date}
                        </span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </Else>
        </If>
      </section>

      <ReminderSection
        refetchReminders={() => {
          refetch();
        }}
      />
    </div>
  );
}

function ReminderSection({
  refetchReminders,
}: {
  refetchReminders: () => void;
}) {
  const [date, setDate] = useState<
    { timeLabel: string; selected: boolean; timeValue: string }[]
  >([
    { timeLabel: 'Sun', selected: true, timeValue: String(i18n.dayNames[1]) },
    { timeLabel: 'Mon', selected: true, timeValue: String(i18n.dayNames[2]) },
    { timeLabel: 'Tue', selected: true, timeValue: String(i18n.dayNames[3]) },
    { timeLabel: 'Wed', selected: true, timeValue: String(i18n.dayNames[4]) },
    { timeLabel: 'Thu', selected: true, timeValue: String(i18n.dayNames[5]) },
    { timeLabel: 'Fri', selected: false, timeValue: String(i18n.dayNames[6]) },
    { timeLabel: 'Sat', selected: false, timeValue: String(i18n.dayNames[8]) },
  ]);
  const [time, setTime] = useState('08:00');
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const { mutate: addReminder, status } = trpc.user.addReminder.useMutation();

  const handleScrollBody = () => {
    const body = document.querySelector('body');
    if (body) {
      body.style.overflowY = 'hidden';
    }

    setTimeout(() => {
      //handle disable hidden body (bc react-ios-time-picker can not prevent scroll)
      const cancelBtn = document.querySelector(
        '.react-ios-time-picker-btn.react-ios-time-picker-btn-cancel',
      );
      const saveBtn = document.querySelector(
        'div.react-ios-time-picker-btn-container > button:nth-child(2)',
      );
      const overlay = document.querySelector(
        '.react-ios-time-picker-popup-overlay',
      );

      const removeHiddenScroll = () => {
        if (body) {
          body.style.overflowY = 'visible';
        }
      };

      if (cancelBtn && saveBtn && overlay && body) {
        [cancelBtn, saveBtn, overlay].forEach((e) => {
          e.addEventListener('click', removeHiddenScroll);
        });
      }
    }, 100);
  };

  const handleUpdateReminder = () => {
    const payload = {
      weekly: date.filter((d) => d.selected === true).map((e) => e.timeValue),
      time,
      message:
        textAreaRef?.current?.value ||
        'Its time for school, my friend! Just go to Teach-In',
    };

    addReminder(payload);
  };

  useEffect(() => {
    if (status === 'success') {
      refetchReminders();
      if (textAreaRef?.current) {
        textAreaRef.current.value = '';
      }
      toast.success('Add Successful Reminder!');
    }

    if (status === 'error') {
      toast.error('Add a failed reminder, try again later!');
    }
  }, [status]);

  return (
    <section className="flex flex-col px-2 md:px-0">
      <h1 className="flex space-x-4 text-3xl">
        <SpeakerWaveIcon className="h-8 w-8" /> <span>Learning Reminder</span>
      </h1>
      <p className="my-2 text-xl italic">Reminders by day</p>

      <div className="my-4 flex flex-col space-y-4">
        <div className="flex space-x-4">
          <DateSelect data={date} setSelections={setDate} />
        </div>
      </div>

      <div className="my-4 flex flex-col space-y-4">
        <h1 className="flex space-x-4 text-3xl">
          <ClockIcon className="h-8 w-8" /> <span>Time</span>
        </h1>

        <TimePicker
          className="max-w-md"
          onOpen={handleScrollBody}
          cancelButtonText="Cancel"
          saveButtonText="Save"
          placeHolder="Time option"
          onChange={(timeValue) => {
            setTime(timeValue);
          }}
          value={time}
        />
      </div>

      <div className="my-4 flex flex-col space-y-4 md:w-[80%]">
        <h1 className="flex space-x-4 text-3xl">
          <ChatBubbleLeftIcon className="h-8 w-8" />{' '}
          <span>Reminder message</span>
        </h1>

        <TextareaAutosize
          className="rounded-xl p-4"
          minRows={5}
          maxRows={8}
          ref={textAreaRef}
        />
      </div>
      <div className="my-4 flex flex-col space-y-4 md:w-[80%]">
        <button
          onClick={handleUpdateReminder}
          className="btn-primary btn-lg btn w-fit text-black"
        >
          Save
        </button>
      </div>
    </section>
  );
}
