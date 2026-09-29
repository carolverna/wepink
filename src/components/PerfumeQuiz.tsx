import { useState } from "react";
import { perfumeQuestions, rankPerfumes } from "../data/perfumes";
import OptionGroup from "./OptionGroup";

export default function PerfumeQuiz() {
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);

  const answer = (questionIndex: number, value: number) => {
    setAnswers((current) => current.map((item, index) => (index === questionIndex ? value : item)));
  };

  const complete = !answers.includes(-1);
  const [best, runnerUp] = complete ? rankPerfumes(answers) : [];

  return (
    <div className="panel">
      <h3>Descubra seu perfume</h3>
      <small style={{ color: "var(--muted)" }}>Três perguntas e a fragrância ideal.</small>

      {perfumeQuestions.map((question, index) => (
        <div key={question.label}>
          <p style={{ marginTop: ".8rem" }}>
            <b>{question.label}</b>
          </p>
          <OptionGroup
            label={question.label}
            options={question.options}
            selected={answers[index]}
            onSelect={(value) => answer(index, value)}
          />
        </div>
      ))}

      <div className="res">
        {complete && best && runnerUp ? (
          <>
            <small>Sua fragrância ideal</small>
            <b>Body Splash {best.name}</b>
            <span className="pill">{best.family}</span>
            <p>{best.notes}</p>
            <small>
              Também combina: Body Splash {runnerUp.name} ({runnerUp.family})
            </small>
          </>
        ) : (
          "Responda as três perguntas."
        )}
      </div>
    </div>
  );
}
