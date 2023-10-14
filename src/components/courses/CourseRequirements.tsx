interface CourseRequirementsProps {
  requirements: { id: string; content: string }[];
}

export default function CourseRequirements({
  requirements,
}: CourseRequirementsProps) {
  return (
    <section className="w-[90%]">
      <h1 className="my-4 mt-2 text-3xl font-semibold md:text-4xl">
        Requourments for this course
      </h1>
      <ul className="flex w-full list-inside list-disc flex-col space-y-2">
        {requirements && requirements.length > 0 ? (
          requirements.map((req) => {
            return <li key={req.id}>{req.content}</li>;
          })
        ) : (
          <li>No Requourments needed</li>
        )}
      </ul>
    </section>
  );
}
