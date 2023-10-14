import { Else, If, Then } from 'react-if';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import { useState, useEffect } from 'react';
import type { SetStateAction, Dispatch } from 'react';
import toast from 'react-hot-toast';

interface VerifyWithdrawalProps {
  title: string;
  isStaticTable: boolean;
  status: 'PENDING' | 'SUCCESS' | 'CANCEL';
  setShouldRefetch: Dispatch<SetStateAction<string[]>>;
  shouldRefetch: string[];
}

export default function VerifyWithdrawal({
  title,
  status,
  setShouldRefetch,
  shouldRefetch,
  isStaticTable,
}: VerifyWithdrawalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const {
    data: withdrawals,
    status: withdrawalsStatus,
    refetch: refetchWithdrawals,
  } = trpc.user.findWithdrawals.useQuery({
    status,
    isAdmin: true,
    includeUser: true,
  });

  const { mutate: approveWithdrawal, status: approveWithdrawalStatus } =
    trpc.user.approveWithdrawal.useMutation();

  const handleAction = (action: 'APPROVED' | 'REJECT', all?: boolean) => {
    if (!withdrawals) return;

    if (all) {
      approveWithdrawal({
        withdrawalsId: withdrawals?.map((e) => e.id),
        status: action === 'APPROVED' ? 'SUCCESS' : 'CANCEL',
      });
    } else {
      approveWithdrawal({
        withdrawalsId: selected,
        status: action === 'APPROVED' ? 'SUCCESS' : 'CANCEL',
      });
    }
  };

  useEffect(() => {
    if (shouldRefetch.find((e) => e === status)) {
      refetchWithdrawals();
    }
  }, [shouldRefetch]);

  useEffect(() => {
    if (approveWithdrawalStatus === 'success') {
      refetchWithdrawals();
      toast.success('Thao tác thành công!');
      switch (status) {
        case 'CANCEL':
          setShouldRefetch(['PENDING', 'SUCCESS']);
          break;
        case 'PENDING':
          setShouldRefetch(['CANCEL', 'SUCCESS']);
          break;
        case 'SUCCESS':
          setShouldRefetch(['CANCEL', 'PENDING']);
          break;
      }
    }

    if (approveWithdrawalStatus === 'error') {
      toast.success('Failed action!');
    }

    setSelected([]);

    return () => setSelected([]);
  }, [approveWithdrawalStatus]);

  return (
    <>
      <div className="flex w-full flex-col px-6 pt-24 md:pt-20">
        <h1 className="mb-6 text-3xl font-bold">{title}</h1>

        {!isStaticTable && (
          <div className="my-4 flex items-center space-x-4 overflow-x-scroll">
            {Array.isArray(withdrawals) && withdrawals.length > 0 && (
              <>
                <button
                  onClick={() => {
                    const isConfirm = window.confirm('Maybe no?');

                    if (!isConfirm) return;

                    handleAction('APPROVED', true);
                  }}
                  className="w-fit min-w-[14rem] rounded-2xl border border-gray-500 px-4 py-3 dark:border-white"
                >
                  Phê duyệt tất cả
                </button>
              </>
            )}

            {selected.length > 0 && (
              <>
                <button
                  onClick={() => handleAction('APPROVED')}
                  className="w-fit min-w-[9rem] rounded-2xl bg-green-100 px-4 py-3 font-bold text-green-800"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleAction('REJECT')}
                  className="w-fit min-w-[7.5rem] rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-900 dark:border-white"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        )}

        <If condition={withdrawalsStatus === 'loading'}>
          <Then>
            <div className="absolute-center h-[20rem] w-full overflow-x-scroll lg:max-w-[90%]">
              <Loading />
            </div>
          </Then>

          <Else>
            <If condition={withdrawals && withdrawals.length > 0}>
              <Then>
                <div className="w-full overflow-x-scroll">
                  <table className="w-full table-auto">
                    <thead className="select-none">
                      <tr>
                        <th></th>
                        {!isStaticTable && <th></th>}

                        <th className="whitespace-nowrap  px-4 py-3">Bank</th>
                        <th className="whitespace-nowrap  px-4 py-3">
                          Date created
                        </th>
                        <th className="whitespace-nowrap  px-4 py-3">
                          User name
                        </th>
                        <th className="whitespace-nowrap  px-4 py-3">
                          Account number
                        </th>

                        <th className="whitespace-nowrap  px-4 py-3">
                          Account name
                        </th>
                        <th className="whitespace-nowrap  px-4 py-3">
                          Amount of money
                        </th>
                      </tr>
                    </thead>
                    <tbody className="rounded-xl">
                      {withdrawals &&
                        withdrawals?.map((withdrawal, idx) => {
                          return (
                            <tr
                              key={withdrawal.id}
                              className="smooth-effect cursor-pointer rounded-2xl odd:bg-slate-300 odd:dark:bg-dark-background "
                            >
                              <th className="px-4">{idx + 1}</th>
                              {!isStaticTable && (
                                <th className="px-6">
                                  <div className="full-size absolute-center">
                                    <input
                                      onClick={(e) => {
                                        if (e.currentTarget.checked) {
                                          setSelected((prevState) => [
                                            ...prevState,
                                            withdrawal.id,
                                          ]);
                                        } else {
                                          setSelected((prevState) =>
                                            prevState.filter(
                                              (w) => withdrawal.id !== w,
                                            ),
                                          );
                                        }
                                      }}
                                      type="checkbox"
                                      className="checkbox-success checkbox checkbox-lg"
                                    />
                                  </div>
                                </th>
                              )}

                              <td className="min-w-[20rem] py-6 lg:min-w-min lg:py-4">
                                {withdrawal.transaction.bankCode}
                              </td>
                              <td className="text-center">
                                {' '}
                                {new Date(withdrawal.createdAt).toLocaleString(
                                  'bn-BD',
                                )}
                              </td>
                              <td className="min-w-[20rem] py-6 text-center lg:min-w-min lg:py-4">
                                {withdrawal.user.name}
                              </td>
                              <td className="text-center">
                                {withdrawal.transaction.bankAccount}
                              </td>
                              <td className={`text-center`}>
                                {withdrawal.transaction.bankName}
                              </td>
                              <td className={`text-center`}>
                                {new Intl.NumberFormat('bn-BD', {
                                  style: 'currency',
                                  currency: 'BDT',
                                  minimumFractionDigits: 0,
                                }).format(
                                  Number(withdrawal.transaction.amount),
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Then>
              <Else>
                <p>No list yet!</p>
              </Else>
            </If>
          </Else>
        </If>
      </div>
    </>
  );
}
