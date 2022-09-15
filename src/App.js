import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import useQuestionnaire from "./useQuestionnaire";

import MLQ_eng from "./MLQ_english.json";
import MLQ_id from "./MLQ_indonesian.json";

import {
  SnapItem,
  SnapList,
  useScroll,
  useVisibleElements,
} from "react-snaplist-carousel";
import QuestionCard from "./QuestionCard";
import ResultsCard from "./ResultsCard";

const languages = {
  English: MLQ_eng,
  Indonesian: MLQ_id,
};

function App() {
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const questionnaire = useQuestionnaire(languages[currentLanguage]);
  const [results, setResults] = useState(null);

  const snaplist = useRef();
  const visible = useVisibleElements(
    { ref: snaplist, debounce: 10 },
    ([element]) => element
  );
  const goToQuestion = useScroll({ ref: snaplist });

  const submitQuestionnaire = () => {
    const result = questionnaire.score();
    if (result.status === "FAIL_MISSING") return goToQuestion(result.data + 1);
    setResults(result.data);
  };

  useEffect(() => {
    const oldAnswers = questionnaire.questions.map((q, idx) => [idx, q.answer]);
    questionnaire.changeQuestionnaire(languages[currentLanguage]);
    for (const [idx, val] of oldAnswers) questionnaire.answerQuestion(idx, val);
  }, [currentLanguage]);

  useEffect(() => {
    window.document.title = questionnaire.metadata.name;
  }, [questionnaire]);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-800 pt-5 pb-5">
      <div className="flex flex-row items-center justify-center mb-3 bg-slate-200 rounded-xl cursor-pointer select-none">
        {results === null &&
          Object.keys(languages).map((language) => (
            <div
              className={clsx(
                "p-2 rounded-xl",
                currentLanguage === language ? "bg-green-400" : "bg-slate-200"
              )}
              onClick={() => setCurrentLanguage(language)}
            >
              {language}
            </div>
          ))}
      </div>

      {results === null ? (
        <>
          <SnapList ref={snaplist} tabIndex={0} className="flex w-full">
            <SnapItem
              margin={{
                left: "calc(100vw / 3)",
                right: "15px",
              }}
              className="h-5/6 w-5/6 lg:w-1/3 bg-slate-300 rounded-xl"
              snapAlign="center"
            >
              <QuestionCard
                question={{ prompt: questionnaire.metadata.instructions }}
              />
            </SnapItem>
            {questionnaire.questions.map((question, idx) => (
              <SnapItem
                margin={{
                  left: "15px",
                  right:
                    idx === questionnaire.questions.length - 1
                      ? "calc(100vw / 3)"
                      : "15px",
                }}
                className="h-5/6 w-5/6 lg:w-1/3 bg-slate-300 rounded-xl"
                snapAlign="center"
                key={idx}
              >
                <QuestionCard
                  question={question}
                  scale={questionnaire.metadata.scale}
                  onAnswer={(value) => {
                    questionnaire.answerQuestion(idx, value);
                    goToQuestion(idx + 2);
                  }}
                />
              </SnapItem>
            ))}
          </SnapList>
          <div className="flex flex-row items-center justify-between w-5/6 lg:w-1/3">
            <div
              className="bg-slate-300 text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => goToQuestion(visible - 1)}
            >
              &lt;
            </div>
            <div
              className="bg-slate-300 text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => submitQuestionnaire()}
            >
              Submit
            </div>
            <div
              className="bg-slate-300 text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => goToQuestion(visible + 1)}
            >
              &gt;
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-5/6 mb-5 w-5/6 md:w-1/3 bg-slate-300 rounded-xl">
            <ResultsCard
              results={results}
              scale={questionnaire.metadata.scale}
              questions={questionnaire.questions}
            />
          </div>
          <div className="flex flex-row items-center justify-center w-5/6 lg:w-1/3">
            <div
              className="bg-slate-300 text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => {
                setResults(null);
                questionnaire.reset();
              }}
            >
              Reset
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
