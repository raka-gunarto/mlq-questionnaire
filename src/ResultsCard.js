import { getSpaceUntilMaxLength } from "@testing-library/user-event/dist/utils";
import React from "react";

export default function ResultsCard({ results, scale, questions }) {
  const maxRating = Math.max(...scale.map((item) => item.value));
  const scores = results.totals;
  return (
    <div className="flex flex-col w-full h-full align-center justify-between p-5">
      <div className="text-center font-semibold text-lg lg:text-xl">
        Results
        <br />
        <br />
        Total Score:{" "}
        {Object.values(scores).reduce((total, val) => total + val, 0)} /{" "}
        {maxRating * questions.length}
        <br />
        <br />
        {Object.entries(scores).map(([key, val]) => (
          <p>
            {key}: {val} /{" "}
            {maxRating * questions.filter((q) => q.subcategory === key).length}
          </p>
        ))}
      </div>
      <div className="text-center text-md lg:text-lg overflow-auto flex-1 flex flex-col justify-center">
        <p>{results.feedback}</p>
      </div>
    </div>
  );
}
