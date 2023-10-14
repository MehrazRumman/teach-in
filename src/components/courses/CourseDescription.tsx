import { Disclosure, useDisclosureState } from 'ariakit/disclosure';
import { memo, useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface CourseDescriptionProps {
  description: string;
}

function CourseDescription({ description }: CourseDescriptionProps) {
  const disclosure = useDisclosureState();
  const [isOverflow, setIsOverflow] = useState(false);
  const [parent] = useAutoAnimate<HTMLParagraphElement>();

  useEffect(() => {
    parent.current && setIsOverflow(parent.current?.clientHeight > 200);
  }, [description]);

  return (
    <MathJaxContext>
      <div className="smooth-effect w-[90%] ">
        <h1 className="mb-2 mt-4 text-3xl font-semibold md:text-4xl ">
          কোর্স সম্পর্কেঃ{' '}
        </h1>
        <MathJax>
          <article
            ref={parent}
            className={`prose-2xl prose  text-2xl ${
              disclosure.open && isOverflow ? 'h-fit' : 'h-fit'
            } min-w-full overflow-hidden overflow-x-hidden text-gray-600 lg:prose-2xl prose-img:max-w-[60vw] prose-img:rounded-2xl dark:text-white/80`}
            dangerouslySetInnerHTML={{ __html: description }}
          ></article>
        </MathJax>

        {isOverflow && (
          <Disclosure
            className="absolute-center flex w-full flex-col"
            state={disclosure}
          >
            <span>{disclosure.open ? 'Collapse' : 'View More'}</span>
            <ChevronDownIcon
              className={`smooth-effect h-6 w-6 ${
                disclosure.open ? 'rotate-180 transform' : ''
              }`}
            />
          </Disclosure>
        )}
      </div>
    </MathJaxContext>
  );
}

export default memo(CourseDescription);
