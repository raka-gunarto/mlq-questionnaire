import clsx from "clsx";
import React from "react";

export default function QuestionCard({ question, scale, onAnswer }) {
  return (
    <div className="flex flex-col w-full h-full align-center justify-between p-5">
      <div className="text-center font-semibold text-lg lg:text-xl">
        {question.prompt}
      </div>
      {scale && (
        <div className="flex flex-col space-y-3 w-full">
          {scale.map((item) => {
            const value = question.reverse ? item.reverseValue : item.value;
            return (
              <div
                className={clsx(
                  "w-full rounded-xl p-2 text-center text-slate-200 cursor-pointer text-md lg:text-lg select-none",
                  question.answer === value ? "bg-green-600" : "bg-slate-600"
                )}
                onClick={() => onAnswer(value)}
              >
                {item.prompt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
