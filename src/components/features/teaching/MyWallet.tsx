import {
  ArrowsUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Else, If, Then } from 'react-if';
import Loading from '~/components/buttons/Loading';
import ComboBox from '~/components/shared/ComboBox';
import { banksCode } from '~/constants';
import { trpc } from '~/utils/trpc';

interface Inputs {
  bankAccount: string;
  bankName: string;
  withdrawAmount: number;
}

export default function MyWallet() {
  const [bankCode, setBankCode] = useState(banksCode[0]);
  const {
    register,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const { data: revenues } = trpc.user.findRevenues.useQuery();

  const { mutate: deleteWithdrawal, status: deleteWithdrawalStatus } =
    trpc.user.deleteWithdrawal.useMutation();

  const {
    data: withdrawals,
    status: withdrawalsStatus,
    refetch: refetchWithdrawals,
  } = trpc.user.findWithdrawals.useQuery({ status: 'PENDING' });

  const { data: successfulWithdrawals, status: successfulWithdrawalsStatus } =
    trpc.user.findWithdrawals.useQuery({ status: 'SUCCESS' });

  const { data: rejectedWithdrawals, status: rejectedWithdrawalsStatus } =
    trpc.user.findWithdrawals.useQuery({ status: 'CANCEL' });

  const { mutate: withdrawMoney, status: withdrawStatus } =
    trpc.user.withdrawMoney.useMutation();

  const totalPayments = useMemo(() => {
    if (!revenues) return 0;

    const totalWithoutWithdrawal = revenues.reduce((acc, revenue) => {
      return acc + Number(revenue.amount);
    }, 0);

    if (withdrawals && withdrawals.length > 0) {
      const deductible = withdrawals.reduce((acc, w) => {
        return acc + Number(w.transaction.amount);
      }, 0);

      return totalWithoutWithdrawal - deductible;
    }

    return totalWithoutWithdrawal;
  }, [revenues, withdrawals]);

  const handleSubmit = () => {
    const { bankAccount, bankName, withdrawAmount } = getValues();

    if (!bankAccount) {
      setError('bankAccount', {
        message: 'Account number cannot be blank!',
      });
      return;
    }

    if (!bankName) {
      setError('bankName', {
        message: 'Account name cannot be blank!',
      });
      return;
    }

    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setError('withdrawAmount', {
        message: 'Withdrawal amount cannot be empty or less than zero!',
      });
      return;
    }

    if (withdrawAmount > totalPayments) {
      setError('withdrawAmount', {
        message: `The withdrawal amount cannot exceed ${new Intl.NumberFormat(
          'bn-BD',
          {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
          },
        ).format(totalPayments)}`,
      });
      return;
    }

    withdrawMoney({
      amount: Number(withdrawAmount),
      bankAccount,
      bankName,
      bankCode: String(bankCode),
    });
  };

  const handleDeleteWithdraw = (withdrawalId: string) => {
    const isConfirmed = window.confirm('Confirm transaction cancellation?');

    if (isConfirmed) {
      deleteWithdrawal({ withdrawalId });
    }
  };

  useEffect(() => {
    if (deleteWithdrawalStatus === 'success') {
      toast.success('Successful cancellation!');
      refetchWithdrawals();
    }

    if (withdrawStatus === 'error') {
      toast.success('Cancel failed, try again later');
    }
  }, [deleteWithdrawalStatus]);

  useEffect(() => {
    if (withdrawStatus === 'success') {
      toast.success('Withdrawal success!');
      // clear input:
      reset({ withdrawAmount: 0 });
      refetchWithdrawals();
    }

    if (withdrawStatus === 'error') {
      toast.success('Withdraw failed, try again later');
    }
  }, [withdrawStatus]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-[10rem] pt-[7rem] md:pt-[5rem]">
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="mt-14 flex w-full flex-col space-y-6"
        >
          <h1 className="flex space-x-4 text-3xl">
            <ArrowsUpDownIcon className="h-8 w-8" />{' '}
            <span className="font-bold">
              Withdraw money(Maximum can withdraw{' '}
              {new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT',
                minimumFractionDigits: 0,
              }).format(totalPayments)}
              )
            </span>
          </h1>

          <div className="relative flex w-full flex-col pl-10">
            <h2>Bank:</h2>
            <ComboBox
              getSelectedValue={(value) => {
                setBankCode(value);
              }}
              selections={banksCode.map((e, idx) => ({ id: idx, name: e }))}
            />

            <h2>Account number:</h2>
            {errors.bankAccount && (
              <span className="test-sm italic text-rose-500">
                {errors.bankAccount.message}
              </span>
            )}
            <input
              {...register('bankAccount', { required: true })}
              onFocus={() => clearErrors('bankAccount')}
              placeholder="070123456..."
              className="my-4 min-w-[30rem] max-w-[30rem] rounded-xl bg-white px-4 py-3 dark:bg-dark-background md:min-w-[45rem] md:max-w-[45rem]"
              type="number"
            />

            <h2>Account name:</h2>
            {errors.bankName && (
              <span className="test-sm italic text-rose-500">
                {errors.bankName.message}
              </span>
            )}
            <input
              {...register('bankName', { required: true })}
              onFocus={() => clearErrors('bankName')}
              placeholder="Jahangir Hossain"
              className="my-4 min-w-[30rem] max-w-[30rem] rounded-xl bg-white px-4 py-3 dark:bg-dark-background md:min-w-[45rem] md:max-w-[45rem]"
              type="text"
            />

            <h2>Withdrawal amount:</h2>
            {errors.withdrawAmount && (
              <span className="test-sm italic text-rose-500">
                {errors.withdrawAmount.message}
              </span>
            )}
            <input
              {...register('withdrawAmount', { required: true })}
              onFocus={() => clearErrors('withdrawAmount')}
              placeholder="100 000"
              className="my-4 min-w-[20rem] max-w-[20rem] rounded-xl bg-white px-4 py-3 dark:bg-dark-background md:min-w-[30rem] md:max-w-[30rem]"
              type="number"
            />

            <button
              onClick={handleSubmit}
              disabled={withdrawStatus === 'loading'}
              type="submit"
              className="absolute-center btn-primary btn-lg btn mt-4 min-h-[4rem] min-w-[24rem] max-w-sm text-black"
            >
              {withdrawStatus === 'loading' ? <Loading /> : ' Withdraw money'}
            </button>
          </div>
        </form>

        <div className="mt-14 flex w-full flex-col space-y-6">
          <h1 className="flex space-x-4 text-3xl">
            <ArrowsUpDownIcon className="h-8 w-8 rotate-90" />{' '}
            <span className="font-bold">Transaction pending approval</span>
          </h1>

          <If condition={withdrawalsStatus === 'loading'}>
            <Then>
              <div className="absolute-center min-h-[20rem] w-full">
                <Loading />
              </div>
            </Then>

            <Else>
              {withdrawals && withdrawals.length > 0 ? (
                <table className="table-auto">
                  <thead className="select-none">
                    <tr>
                      <th></th>
                      <th></th>
                      <th className="whitespace-nowrap  px-4 py-3">Bank</th>
                      <th className="whitespace-nowrap  px-4 py-3">
                        Date created
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
                    {withdrawals.map((withdrawal, idx) => {
                      return (
                        <tr
                          key={withdrawal.id}
                          className="smooth-effect cursor-pointer rounded-2xl odd:bg-slate-300 odd:dark:bg-dark-background "
                        >
                          <th className="px-4">{idx + 1}</th>
                          <th
                            onClick={() => handleDeleteWithdraw(withdrawal.id)}
                            className="px-4 hover:text-sky-400"
                          >
                            Cancel
                          </th>
                          <td className="min-w-[20rem] py-6 lg:min-w-min lg:py-4">
                            {withdrawal.transaction.bankCode}
                          </td>
                          <td className="text-center">
                            {new Date(withdrawal.createdAt).toLocaleString(
                              'bn-BD',
                            )}
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
                            }).format(Number(withdrawal.transaction.amount))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </Else>
          </If>
        </div>

        <div className="mt-14 flex w-full flex-col space-y-6">
          <h1 className="flex space-x-4 text-3xl">
            <CheckIcon className="h-8 w-8" />{' '}
            <span className="font-bold">Transaction was successful</span>
          </h1>

          <If condition={successfulWithdrawalsStatus === 'loading'}>
            <Then>
              <div className="absolute-center min-h-[20rem] w-full">
                <Loading />
              </div>
            </Then>

            <Else>
              {successfulWithdrawals && successfulWithdrawals.length > 0 ? (
                <table className="table-auto">
                  <thead className="select-none">
                    <tr>
                      <th></th>

                      <th className="whitespace-nowrap  px-4 py-3">Bank</th>
                      <th className="whitespace-nowrap  px-4 py-3">
                        Date created
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
                    {successfulWithdrawals.map((w, idx) => {
                      return (
                        <tr
                          key={w.id}
                          className="smooth-effect cursor-pointer rounded-2xl odd:bg-slate-300 odd:dark:bg-dark-background "
                        >
                          <th className="px-4">{idx + 1}</th>
                          <td className="min-w-[20rem] py-6 lg:min-w-min lg:py-4">
                            {w.transaction.bankCode}
                          </td>
                          <td className="text-center">
                            {new Date(w.createdAt).toLocaleString('bn-BD')}
                          </td>
                          <td className="text-center">
                            {w.transaction.bankAccount}
                          </td>
                          <td className={`text-center`}>
                            {w.transaction.bankName}
                          </td>
                          <td className={`text-center`}>
                            {new Intl.NumberFormat('bn-BD', {
                              style: 'currency',
                              currency: 'BDT',
                              minimumFractionDigits: 0,
                            }).format(Number(w.transaction.amount))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </Else>
          </If>
        </div>

        <div className="mt-14 flex w-full flex-col space-y-6">
          <h1 className="flex space-x-4 text-3xl">
            <XMarkIcon className="h-8 w-8" />{' '}
            <span className="font-bold">Transaction refused</span>
          </h1>

          <If condition={rejectedWithdrawalsStatus === 'loading'}>
            <Then>
              <div className="absolute-center min-h-[20rem] w-full">
                <Loading />
              </div>
            </Then>

            <Else>
              {rejectedWithdrawals && rejectedWithdrawals.length > 0 ? (
                <table className="table-auto">
                  <thead className="select-none">
                    <tr>
                      <th></th>

                      <th className="whitespace-nowrap  px-4 py-3">Bank</th>
                      <th className="whitespace-nowrap  px-4 py-3">
                        Date created
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
                    {rejectedWithdrawals.map((w, idx) => {
                      return (
                        <tr
                          key={w.id}
                          className="smooth-effect cursor-pointer rounded-2xl odd:bg-slate-300 odd:dark:bg-dark-background "
                        >
                          <th className="px-4">{idx + 1}</th>
                          <td className="min-w-[20rem] py-6 lg:min-w-min lg:py-4">
                            {w.transaction.bankCode}
                          </td>
                          <td className="text-center">
                            {new Date(w.createdAt).toLocaleString('bn-BD')}
                          </td>
                          <td className="text-center">
                            {w.transaction.bankAccount}
                          </td>
                          <td className={`text-center`}>
                            {w.transaction.bankName}
                          </td>
                          <td className={`text-center`}>
                            {new Intl.NumberFormat('bn-BD', {
                              style: 'currency',
                              currency: 'BDT',
                              minimumFractionDigits: 0,
                            }).format(Number(w.transaction.amount))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </Else>
          </If>
        </div>
      </div>
    </div>
  );
}
