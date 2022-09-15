import { useState } from "react";

export default function useQuestionnaire(data) {
  const [metadata, setMetadata] = useState({
    name: data.name,
    instructions: data.instructions,
    scale: data.scale,
    feedback: data.feedback,
  });
  const [questions, setQuestions] = useState(
    data.questions.map((val) => ({ ...val, answer: null }))
  );

  const changeQuestionnaire = (data) => {
    setMetadata({
      name: data.name,
      instructions: data.instructions,
      scale: data.scale,
      feedback: data.feedback,
    });
    setQuestions(data.questions.map((val) => ({ ...val, answer: null })));
  };

  const answerQuestion = (idx, answer) => {
    if (!metadata.scale.find((val) => val.value === answer)) return;
    if (idx >= questions.length) return;
    setQuestions((old) =>
      old.map((val, qIdx) => (qIdx !== idx ? val : { ...val, answer: answer }))
    );
  };

  const score = () => {
    // check all questions answered
    for (let [idx, question] of questions.entries())
      if (question.answer === null)
        return {
          status: "FAIL_MISSING",
          data: idx,
        };

    // total it up
    let totals = {};
    for (let question of questions) {
      if (totals[question.subcategory] === undefined)
        totals[question.subcategory] = 0;
      totals[question.subcategory] += question.answer;
    }

    // feedback
    let feedback = "";
    let feedbackPossibilities = [];
    for (let f of metadata.feedback)
      if (
        Object.entries(f.threshold).every(
          ([subcategory, threshold]) => totals[subcategory] >= threshold
        )
      )
        feedbackPossibilities.push(f);
    feedback = feedbackPossibilities.sort((a, b) => a.priority - b.priority)[0]
      .text;

    return {
      status: "SUCCESS",
      data: {
        totals: totals,
        feedback: feedback,
      },
    };
  };

  const reset = () => {
    setQuestions((old) => old.map((val) => ({ ...val, answer: null })));
  };

  return {
    metadata,
    questions,
    answerQuestion,
    score,
    reset,
    changeQuestionnaire
  };
}
