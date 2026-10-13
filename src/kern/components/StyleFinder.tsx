import { useState } from "react";
import { getService } from "../data";
import { explainStyleMatch, recommendStyles } from "../styleFinder";
import type { HairReference, StyleCharacter, StyleFinderAnswers, StyleLength, StylingEffort } from "../types";
import type { BookingStarter } from "./KernHeader";
import { HairReferenceImage } from "./LookbookSection";

const lengthOptions: { value: StyleLength; label: string }[] = [
  { value: "short", label: "Короткую" },
  { value: "medium", label: "Среднюю" },
  { value: "long", label: "Длинную" },
];

const effortOptions: { value: StylingEffort; label: string }[] = [
  { value: "minimal", label: "До 5 минут" },
  { value: "regular", label: "5–10 минут" },
  { value: "detailed", label: "10+ минут" },
];

const characterOptions: { value: StyleCharacter; label: string }[] = [
  { value: "sharp", label: "Собранную" },
  { value: "natural", label: "Естественную" },
  { value: "classic", label: "Классическую" },
];

export function StyleFinder({ onBook }: { onBook: BookingStarter }) {
  const [answers, setAnswers] = useState<Partial<StyleFinderAnswers>>({});
  const complete = Boolean(answers.length && answers.effort && answers.character);
  const results = complete
    ? recommendStyles(answers as StyleFinderAnswers)
    : [];

  const updateAnswer = <K extends keyof StyleFinderAnswers>(key: K, value: StyleFinderAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="kern-section kern-finder" id="finder" aria-labelledby="kern-finder-title">
      <div className="kern-finder__intro">
        <p className="kern-eyebrow"><span /> Подбор формы</p>
        <h2 id="kern-finder-title">Три ответа.<br /><em>Два точных ориентира.</em></h2>
        <p>Локальные правила сопоставят длину, время на укладку и характер формы. Это не AI и не замена консультации с барбером.</p>
      </div>
      <div className="kern-finder__questions">
        <QuestionGroup
          index="01"
          legend="Какая длина ближе?"
          options={lengthOptions}
          selected={answers.length}
          testId="length"
          onSelect={(value) => updateAnswer("length", value)}
        />
        <QuestionGroup
          index="02"
          legend="Сколько времени на укладку?"
          options={effortOptions}
          selected={answers.effort}
          testId="effort"
          onSelect={(value) => updateAnswer("effort", value)}
        />
        <QuestionGroup
          index="03"
          legend="Какой характер формы?"
          options={characterOptions}
          selected={answers.character}
          testId="character"
          onSelect={(value) => updateAnswer("character", value)}
        />
        {!complete && <p className="kern-finder__progress" aria-live="polite">Выбрано {Object.keys(answers).length} из 3</p>}
        {complete && (
          <div className="kern-finder-results" aria-live="polite">
            <div className="kern-finder-results__heading">
              <h3>С чего начать разговор</h3>
              <button type="button" onClick={() => setAnswers({})}>Изменить ответы</button>
            </div>
            <div className="kern-finder-results__grid">
              {results.map((reference) => (
                <Recommendation
                  answers={answers as StyleFinderAnswers}
                  key={reference.id}
                  reference={reference}
                  onBook={onBook}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function QuestionGroup<T extends string>({
  index,
  legend,
  options,
  selected,
  testId,
  onSelect,
}: {
  index: string;
  legend: string;
  options: { value: T; label: string }[];
  selected: T | undefined;
  testId: string;
  onSelect: (value: T) => void;
}) {
  return (
    <fieldset className="kern-finder-question">
      <legend><span>{index}</span>{legend}</legend>
      <div role="group" aria-label={legend}>
        {options.map((option) => (
          <button
            aria-pressed={selected === option.value}
            className={selected === option.value ? "is-selected" : ""}
            data-finder-option={testId + ":" + option.value}
            key={option.value}
            onClick={() => onSelect(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Recommendation({
  answers,
  reference,
  onBook,
}: {
  answers: StyleFinderAnswers;
  reference: HairReference;
  onBook: BookingStarter;
}) {
  const service = getService(reference.serviceId);
  return (
    <article className="kern-finder-result">
      <HairReferenceImage className="kern-finder-result__image" reference={reference} />
      <div className="kern-finder-result__content">
        <h4>{reference.title}</h4>
        <p>{explainStyleMatch(reference, answers)}</p>
        <a href="#services">Услуга: {service?.name ?? "Стрижка"} <span aria-hidden="true">↓</span></a>
        <button
          type="button"
          onClick={(event) => onBook({ serviceId: reference.serviceId }, event.currentTarget)}
        >
          Выбрать время <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}
