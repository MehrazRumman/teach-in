import VerifyWithdrawal from './VerifyWithdrawal';
import { useState } from 'react';

export default function MoneyHandling() {
  const [shouldRefetch, setShouldRefetch] = useState<string[]>([]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden pt-[7rem] pb-[10rem] md:pt-[5rem]">
      <div className="mx-auto flex w-[90%] flex-col">
        <VerifyWithdrawal
          title="Transaction pending approval"
          status="PENDING"
          setShouldRefetch={setShouldRefetch}
          shouldRefetch={shouldRefetch}
          isStaticTable={false}
        />
        <VerifyWithdrawal
          title="Transaction done"
          status="SUCCESS"
          setShouldRefetch={setShouldRefetch}
          shouldRefetch={shouldRefetch}
          isStaticTable
        />
        <VerifyWithdrawal
          title="The transaction has been rejected"
          status="CANCEL"
          setShouldRefetch={setShouldRefetch}
          shouldRefetch={shouldRefetch}
          isStaticTable
        />
      </div>
    </div>
  );
}
