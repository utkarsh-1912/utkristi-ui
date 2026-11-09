import { forwardRef, useRef, useState, type FormHTMLAttributes } from 'react';
import { Button } from './Button.js';
import { Checkbox, Radio } from './Choice.js';
import { Field, Input } from './Field.js';
import { Progress } from './Loading.js';
import { cx } from './utils/cx.js';
import { useId } from './utils/useId.js';

export interface QuestionnaireChoice { value: string; label: string }
export interface Question {
  id: string; prompt: string; description?: string; required?: boolean;
  options?: readonly QuestionnaireChoice[]; multiple?: boolean; placeholder?: string;
}
export type QuestionnaireAnswers = Record<string, string | string[]>;
export interface QuestionnaireProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  questions: readonly Question[];
  onSubmit: (answers: QuestionnaireAnswers) => void;
  defaultAnswers?: QuestionnaireAnswers;
}
export const Questionnaire = forwardRef<HTMLFormElement, QuestionnaireProps>(function Questionnaire(
  { questions, onSubmit, defaultAnswers = {}, className, ...props }, ref,
) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(defaultAnswers);
  const [error, setError] = useState(false);
  const focusHeading = useRef(false);
  const current = Math.min(index, questions.length - 1);
  const question = questions[current];
  if (!question) return null;
  const answer = answers[question.id];
  const options = question.options;
  const picked = Array.isArray(answer) ? answer : typeof answer === 'string' ? [answer] : [];
  const complete = (item: Question, response: QuestionnaireAnswers) => {
    const value = response[item.id];
    return !item.required || (Array.isArray(value) ? value.length > 0 : !!value?.trim());
  };
  const setAnswer = (value: string | string[]) => {
    setAnswers((existing) => ({ ...existing, [question.id]: value }));
    setError(false);
  };
  const move = (next: number, invalid = false) => {
    setError(invalid);
    focusHeading.current = true;
    setIndex(next);
  };
  const last = current === questions.length - 1;

  return <form {...props} ref={ref} noValidate className={cx('questionnaire', className)} onSubmit={(event) => {
    event.preventDefault();
    if (!complete(question, answers)) { setError(true); return; }
    if (!last) { move(current + 1); return; }
    const missing = questions.findIndex((item) => !complete(item, answers));
    if (missing !== -1) move(missing, true);
    else onSubmit(answers);
  }}>
    <div className="questionnaire-status"><span className="label">Question {current + 1} of {questions.length}</span>
      <Progress value={current + 1} max={questions.length} label="Questionnaire progress" /></div>
    <h3 tabIndex={-1} id={`${id}-question`} ref={(node) => {
      if (node && focusHeading.current) { focusHeading.current = false; node.focus(); }
    }}>{question.prompt}</h3>
    {options ? <fieldset className="questionnaire-choices" aria-labelledby={`${id}-question`}
      aria-describedby={cx(question.description && `${id}-help`, error && `${id}-error`) || undefined}>
      {question.description && <p id={`${id}-help`} className="muted">{question.description}</p>}
      {options.map(({ value, label }) => question.multiple
        ? <Checkbox key={value} label={label} checked={picked.includes(value)}
          onChange={(event) => setAnswer(event.target.checked ? [...picked, value] : picked.filter((item) => item !== value))} />
        : <Radio key={value} name={`${id}-answer`} label={label} checked={answer === value}
          onChange={() => setAnswer(value)} />)}
      {error && <p id={`${id}-error`} role="alert" className="field-error">Select an answer to continue.</p>}
    </fieldset> : <Field hint={question.description} error={error ? 'Enter an answer to continue.' : undefined}>
      <Input aria-labelledby={`${id}-question`} value={typeof answer === 'string' ? answer : ''}
        onChange={(event) => setAnswer(event.target.value)} placeholder={question.placeholder} />
    </Field>}
    <div className="questionnaire-actions">
      {current > 0 && <Button variant="ghost" onClick={() => move(current - 1)}>Back</Button>}
      {!last && !question.required && <Button variant="plain" onClick={() => move(current + 1)}>Skip</Button>}
      <Button type="submit">{last ? 'Submit' : 'Next'}</Button>
    </div>
  </form>;
});
