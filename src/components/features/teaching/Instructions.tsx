import React from 'react';
import { DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Instructions() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-[10rem] pt-[7rem] md:pt-[5rem]">
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        <h1 className="flex space-x-4 text-3xl">
          <DocumentTextIcon className="h-8 w-8" />{' '}
          <span className="font-bold">
            Instructions for uploading and teaching on Teach-In
          </span>
        </h1>

        <ul className="my-8 list-inside list-decimal space-y-4 md:max-w-[80%] md:space-y-8 md:text-3xl">
          <li>
            <span className="text-rose-500">
              Save your progress regularly when composing lessons to avoid data
              loss Unsolicited uploads!
            </span>
          </li>
          <li>
            The course name on the system is unique (Please choose another name
            if coincide).
          </li>
          <li>Each lesson must have at least 1 video to be approved.</li>
          <li>
            Must fill in all required information (Course name, photo) course
            description, detailed description and short description).
          </li>
          <li>
            There must be at least one lesson out of all selected chapters
            (tick) is preview (preview). These lectures can be open-ended First,
            ভুমিকা the course. Purpose helps learners can see before deciding to
            enroll or purchase a course.
          </li>
          <li>
            The processing speed of upload and save progress depends on some
            file size course resources (Videos, Documents, ...).
          </li>
          <li>
            When the course is in the "Accumulated" state, it means in the
            future In the near future you will have to add more lectures.
          </li>
          <li>
            When the course is in the "Sequential learning" option, it means all
            All lectures must be learned in order, not arbitrary watch any
            lectures.
          </li>
          <li>
            For a fee-based course, after the student has successfully paid, the
            number balance will be added to "My Wallet" which can be withdrawn
            to the balance according to craft desire.
          </li>
          <li>
            The speed of approval depends on the length and content of the
            course.
          </li>
        </ul>

        <h1 className="mt-6 flex space-x-4 text-3xl">
          <ShieldCheckIcon className="h-8 w-8" />{' '}
          <span className="font-bold">Regulations</span>
        </h1>

        <ul className="my-8 list-inside list-decimal space-y-4 md:max-w-[80%] md:space-y-8 md:text-3xl">
          <li>
            Do not upload (upload) courses with content that violates the law
            and cybersecurity law!
          </li>
          <li>Do not re-upload other teachers' courses.</li>
          <li>
            Not directly compared with other courses of the same genre above
            Teach-In.
          </li>
          <li>
            Do not delete content after the course has been approved (If the
            course Loss of content will revert to pending approval or rejection
            forever).{' '}
          </li>
        </ul>
      </div>
    </div>
  );
}
