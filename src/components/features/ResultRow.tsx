import React from 'react';

import Image from 'next/image';
export default function ResultRow({ id, result, index }) {
  const isIndex123 = index <= 3; // Check if index is 1, 2, or 3

  return (
    <div key={index} className="border-t border-gray-200 pt-2">
      <div className={`flex flex-row items-center`}>
        <div className="w-1/12 text-3xl font-bold md:mr-2">{index}</div>
        {isIndex123 ? (
          <Image
            alt=""
            className="mr-4 h-16 w-16 rounded-full border border-4 border-purple-800 outline-2 outline-violet-600"
            src={result?.user?.image || '/icons/android-chrome-192x192.png'}
            width={30}
            height={30}
          />
        ) : (
          <Image
            alt=""
            className="mr-4 rounded-full"
            src={result?.user?.image || '/icons/android-chrome-192x192.png'}
            height={20}
            width={20}
          />
        )}

        {isIndex123 ? (
          <span className="w-5/12 text-4xl font-bold">{result.user.name}</span>
        ) : (
          <span className="w-5/12 text-2xl font-semibold">
            {result.user.name}
          </span>
        )}

        <div className={`w-1/12 font-bold`}>{result.totalMarks}</div>
        <div className={`w-2/12 `}>
          {new Date(result.createdAt).toLocaleDateString('bn-BD')}
        </div>
      </div>
    </div>
  );
}
