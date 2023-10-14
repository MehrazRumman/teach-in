import dateFormat from 'dateformat';
import { group } from 'radash';
import { useMemo, useState } from 'react';
import { Else, If, Then } from 'react-if';
import Loading from '~/components/buttons/Loading';
import DashboardCard from '~/components/shared/DashboardCard';
import HorizontalBarChart from '~/components/shared/HorizontalBarChart';
import { mInVietnamese } from '~/constants';
import { getDaysInMonth } from '~/utils/dateHandler';

import {
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import type { Review, Student } from '@prisma/client';
import AreaChart from '../../shared/AreaChart';
import PieChart from '../../shared/PieChart';

type FilterTimeType = 'month' | 'day';

interface TeachingDashboardProps {
  courses:
    | {
        payments: {
          id: string;
          createdAt: Date;
        }[];
        reviews: Review[];
        students: Student[];
        id: string;
        name: string;
        coursePrice: number | null;
      }[]
    | undefined;
  status: 'error' | 'success' | 'loading';
}

export default function TeachingDashboard({
  courses,
  status,
}: TeachingDashboardProps) {
  const [filterTimeType, setFilterTimeType] = useState<FilterTimeType>('day');

  const totalStudentsEnrolled = useMemo(() => {
    if (!courses) return 0;

    return courses.reduce((acc, course) => {
      return acc + course.students.length;
    }, 0);
  }, [courses]);

  const totalReviews = useMemo(() => {
    if (!courses) return 0;

    return courses.reduce((acc, course) => {
      return acc + course.reviews.length;
    }, 0);
  }, [courses]);

  const paymentsGroupByDate = useMemo(() => {
    if (!courses) return null;

    // concat all payments:
    const totalPayments = courses?.reduce((accPayments, course) => {
      return accPayments.concat(
        course.payments.map((p) => {
          const createdAt =
            filterTimeType === 'day'
              ? dateFormat(p.createdAt, 'dd/mm')
              : `Month ${new Date(p.createdAt).getMonth() + 1}`;

          return { ...p, createdAt, coursePrice: course.coursePrice };
        }),
      );
    }, []);

    const paymentsGroupByDate = group(totalPayments, (f) => f.createdAt);

    // calculate total prices in group
    Object.keys(paymentsGroupByDate).map((key) => {
      const totalPrices = paymentsGroupByDate[key].reduce((acc, e) => {
        return acc + e?.coursePrice;
      }, 0);

      Object.assign(paymentsGroupByDate[key], { totalPrices });
    });

    return paymentsGroupByDate;
  }, [courses, filterTimeType]);

  const totalPayments = useMemo(() => {
    if (!courses) return 0;

    return courses.reduce((acc, course) => {
      return acc + course.payments.length * Number(course.coursePrice);
    }, 0);
  }, [courses]);

  const labelsAreaChart = useMemo(() => {
    if (filterTimeType === 'month') {
      return mInVietnamese;
    }

    if (filterTimeType === 'day') {
      return getDaysInMonth(
        new Date().getMonth(),
        new Date().getFullYear(),
      ).map((date) => dateFormat(date, 'dd/mm'));
    }

    return [];
  }, [filterTimeType]);

  return (
    <div className="min-h-screen w-full pb-[10rem] pt-[7rem] md:pt-[5rem]">
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        <div className="flex w-full flex-col space-y-6 md:flex-row md:justify-evenly md:space-x-6 md:space-y-0">
          <DashboardCard title="Course" data={courses ? courses.length : 0} />

          <DashboardCard
            title="Number of Student Registered"
            data={totalStudentsEnrolled}
          />

          <DashboardCard title="Number of Reviews" data={totalReviews} />
        </div>

        <div className="mt-14 flex w-full flex-col space-y-6">
          <h1 className="flex space-x-4 text-3xl">
            <CurrencyDollarIcon className="h-8 w-8" />{' '}
            <span className="font-bold">
              Revenue(Total:{' '}
              {new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT',
                minimumFractionDigits: 0,
              }).format(totalPayments)}
              )
            </span>
          </h1>

          <select
            onChange={(e) => {
              setFilterTimeType(e.currentTarget.value as FilterTimeType);
            }}
            className="my-4 w-full max-w-sm overflow-hidden rounded-xl p-4"
          >
            <option value={'day'}>By date</option>
            <option value={'month'}>Monthly</option>
          </select>

          <If condition={status === 'loading'}>
            <Then>
              <div className="absolute-center min-h-[10rem] w-full">
                <Loading />
              </div>
            </Then>

            <Else>
              <div className="absolute-center h-[30rem] max-h-[25rem] w-full md:max-h-[30rem] lg:max-h-[45rem]">
                <AreaChart
                  chartTitle="Course Revenue Report"
                  labels={labelsAreaChart}
                  datasets={[
                    {
                      data: labelsAreaChart?.map((e) => {
                        if (paymentsGroupByDate && paymentsGroupByDate[e])
                          return paymentsGroupByDate[e]?.totalPrices;

                        return 0;
                      }),
                      fill: true,
                      label: 'Taka',
                      borderColor: 'rgb(53, 162, 235)',
                      backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    },
                  ]}
                />
              </div>
            </Else>
          </If>
        </div>

        <div className="mt-14 flex w-full flex-col space-y-6">
          <h1 className="flex space-x-4 text-3xl">
            <ChartPieIcon className="h-8 w-8" />{' '}
            <span className="font-bold">Rate of Course Enrolled</span>
          </h1>

          <If condition={status === 'loading'}>
            <Then>
              <div className="absolute-center min-h-[10rem] w-full">
                <Loading />
              </div>
            </Then>

            <Else>
              {courses && courses.length > 0 ? (
                <div className="absolute-center h-[30rem] max-h-[25rem] w-full md:max-h-[30rem] lg:max-h-[45rem]">
                  <PieChart
                    labels={courses?.map((course) => course.name)}
                    datasets={[
                      {
                        label: 'Student number',
                        data: courses?.map((course) => course.students.length),
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 2,
                      },
                    ]}
                  />
                </div>
              ) : (
                <p>No data on enrollment rates yet</p>
              )}
            </Else>
          </If>
        </div>

        <div className="mt-14 flex w-full flex-col space-y-6">
          <h1 className="flex space-x-4 text-3xl">
            <ChartBarIcon className="h-8 w-8" />{' '}
            <span className="font-bold">Courses are rated</span>
          </h1>

          <If condition={status === 'loading'}>
            <Then>
              <div className="absolute-center min-h-[10rem] w-full">
                <Loading />
              </div>
            </Then>

            <Else>
              {courses && courses.length > 0 ? (
                <div className="absolute-center h-[30rem] w-full">
                  <HorizontalBarChart
                    chartTitle="Number of reviews by Course"
                    data={{
                      labels: courses?.map((course) => course.name),
                      datasets: [
                        {
                          label: 'Number of reviews',
                          data: courses?.map((course) => course.reviews.length),
                          borderColor: 'rgb(255, 99, 132)',
                          backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        },
                      ],
                    }}
                  />
                </div>
              ) : (
                <p>No rating data yet</p>
              )}
            </Else>
          </If>
        </div>
      </div>
    </div>
  );
}
