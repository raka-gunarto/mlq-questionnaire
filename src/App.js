import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import useQuestionnaire from "./useQuestionnaire";

import {
  SnapItem,
  SnapList,
  useScroll,
  useVisibleElements,
} from "react-snaplist-carousel";
import QuestionCard from "./QuestionCard";
import ResultsCard from "./ResultsCard";

function App() {
  const [currentLanguage, setCurrentLanguage] = useState("Indonesian");
  const [languages, setLanguages] = useState(null);

  const questionnaire = useQuestionnaire(
    languages !== null
      ? languages[currentLanguage]
      : { name: "", instructions: "", scale: [], feedback: [], questions: [] }
  );
  const [results, setResults] = useState(null);

  const snaplist = useRef();
  const visible = useVisibleElements(
    { ref: snaplist, debounce: 10 },
    ([element]) => element
  );
  const goToQuestion = useScroll({ ref: snaplist });

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/raka-gunarto/mlq-questionnaire/data/data.json",
      {
        body: null,
        method: "GET",
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        setLanguages(data);
        questionnaire.changeQuestionnaire(data[currentLanguage]);
      });

    fetch(
      "https://raw.githubusercontent.com/raka-gunarto/mlq-questionnaire/data/config.json",
      {
        body: null,
        method: "GET",
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        // set css variables
        document.documentElement.style.setProperty("--color-pagebackground", data.colors.pageBG);
        document.documentElement.style.setProperty("--color-cardbackground", data.colors.cardBG);
        document.documentElement.style.setProperty("--color-answerunselected", data.colors.answerUnselected);
        document.documentElement.style.setProperty("--color-answerselected", data.colors.answerSelected);
      });
  }, []);

  const submitQuestionnaire = () => {
    const result = questionnaire.score();
    if (result.status === "FAIL_MISSING") return goToQuestion(result.data + 1);
    setResults(result.data);
  };

  useEffect(() => {
    if (languages == null) return;
    const oldAnswers = questionnaire.questions.map((q, idx) => [idx, q.answer]);
    questionnaire.changeQuestionnaire(languages[currentLanguage]);
    for (const [idx, val] of oldAnswers) questionnaire.answerQuestion(idx, val);
  }, [currentLanguage]);

  useEffect(() => {
    window.document.title = questionnaire.metadata.name;
  }, [questionnaire]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
    window.addEventListener("resize", () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    });
  }, []);

  if (languages == null) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-pagebackground pt-5 pb-5">
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
              className="h-5/6 w-5/6 lg:w-1/3 bg-cardbackground rounded-xl"
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
                className="h-5/6 w-5/6 lg:w-1/3 bg-cardbackground rounded-xl"
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
              className="bg-cardbackground text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => goToQuestion(visible - 1)}
            >
              &lt;
            </div>
            <div
              className="bg-cardbackground text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => submitQuestionnaire()}
            >
              Submit
            </div>
            <div
              className="bg-cardbackground text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
              onClick={() => goToQuestion(visible + 1)}
            >
              &gt;
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-5/6 mb-5 w-5/6 md:w-1/3 bg-cardbackground rounded-xl">
            <ResultsCard
              results={results}
              scale={questionnaire.metadata.scale}
              questions={questionnaire.questions}
            />
          </div>
          <div className="flex flex-row items-center justify-center w-5/6 lg:w-1/3">
            <div
              className="bg-cardbackground text-2xl p-3 rounded-xl cursor-pointer leading-none select-none"
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
