import VerifyCourses from '~/components/features/admin/VerifyCourses';
import { useState } from 'react';
import PreviewCourseModal from './PreviewCourseModal';
import type { CourseType } from '~/types';

export default function CourseDashboard() {
  const [shouldRefetch, setShouldRefetch] = useState({
    pending: false,
    approved: false,
    reject: false,
  });

  const [openPreviewModal, setOpenPreviewModal] = useState(false);

  const [course, setCourse] = useState<CourseType | null>(null);

  return (
    <>
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        <PreviewCourseModal
          course={course}
          openPreviewModal={openPreviewModal}
          setOpenPreviewModal={setOpenPreviewModal}
        />

        <VerifyCourses
          setOpenPreviewModal={setOpenPreviewModal}
          setCourse={setCourse}
          shouldRefetch={shouldRefetch.pending}
          setShouldRefetch={setShouldRefetch}
          queryKeys={{ published: true, verified: 'PENDING' }}
          title="Course waiting for approval"
        />
        <VerifyCourses
          setOpenPreviewModal={setOpenPreviewModal}
          setCourse={setCourse}
          shouldRefetch={shouldRefetch.approved}
          setShouldRefetch={setShouldRefetch}
          queryKeys={{ published: true, verified: 'APPROVED' }}
          title="Course approved"
        />
        <VerifyCourses
          setOpenPreviewModal={setOpenPreviewModal}
          setCourse={setCourse}
          shouldRefetch={shouldRefetch.reject}
          setShouldRefetch={setShouldRefetch}
          queryKeys={{ published: true, verified: 'REJECT' }}
          title="Course refused"
        />
      </div>
    </>
  );
}
