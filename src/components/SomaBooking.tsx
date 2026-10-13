import { useEffect, useMemo, useState } from "react";
import {
  getDemoDates,
  getDemoSlots,
  getEligibleSpecialists,
  localDateKey,
  localDemoBookingAdapter,
} from "../booking/soma-booking";
import { somaServices, somaSpecialists, somaPrice } from "../content/soma";

type BookingStep = "ritual" | "time" | "contact" | "review" | "confirmed";
type ContactFields = { name: string; phone: string; email: string };

const stepNames: { id: Exclude<BookingStep, "confirmed">; label: string }[] = [
  { id: "ritual", label: "Ритуал" },
  { id: "time", label: "Время" },
  { id: "contact", label: "Контакты" },
  { id: "review", label: "Проверка" },
];

const emptyContact: ContactFields = { name: "", phone: "", email: "" };

function dateLabel(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric", month: "long" }).format(date);
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function SomaBooking({ presetServiceId, presetKey }: { presetServiceId: string | null; presetKey: number }) {
  const [step, setStep] = useState<BookingStep>("ritual");
  const [serviceId, setServiceId] = useState(presetServiceId ?? somaServices[0].id);
  const [duration, setDuration] = useState(somaServices[0].durationOptions[1]);
  const availableDates = useMemo(() => getDemoDates(14), []);
  const [dateKey, setDateKey] = useState(() => localDateKey(availableDates[0]));
  const [specialistId, setSpecialistId] = useState("any");
  const [time, setTime] = useState("");
  const [contact, setContact] = useState<ContactFields>(emptyContact);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [confirmedSpecialist, setConfirmedSpecialist] = useState("");
  const [persistence, setPersistence] = useState<"local" | "session">("local");

  const service = somaServices.find((item) => item.id === serviceId) ?? somaServices[0];
  const date = availableDates.find((item) => localDateKey(item) === dateKey) ?? availableDates[0];
  const compatibleSpecialists = getEligibleSpecialists(service, date);
  const slots = getDemoSlots(service, specialistId, date, duration);
  const selectedSpecialist = somaSpecialists.find((item) => item.id === specialistId);
  const stageIndex = stepNames.findIndex((item) => item.id === step);

  useEffect(() => {
    const preset = somaServices.find((item) => item.id === presetServiceId);
    if (!preset) return;
    setServiceId(preset.id);
    setDuration(preset.durationOptions[0]);
    setStep("ritual");
    setError("");
  }, [presetKey, presetServiceId]);

  useEffect(() => {
    if (!service.durationOptions.includes(duration)) setDuration(service.durationOptions[0]);
    if (specialistId !== "any" && !getEligibleSpecialists(service, date).some((item) => item.id === specialistId)) {
      setSpecialistId("any");
    }
    setTime("");
  }, [service, duration, dateKey, specialistId]);

  const advance = () => {
    setError("");
    if (step === "ritual") {
      if (!service.durationOptions.includes(duration)) {
        setError("Выберите длительность ритуала.");
        return;
      }
      setStep("time");
      return;
    }
    if (step === "time") {
      if (dateKey < localDateKey(new Date())) {
        setError("Выберите дату, которая ещё не наступила.");
        return;
      }
      if (!time || !slots.includes(time)) {
        setError(slots.length ? "Выберите свободное время." : "На эту дату нет подходящего времени. Выберите другой день.");
        return;
      }
      setStep("contact");
      return;
    }
    if (step === "contact") {
      const digits = phoneDigits(contact.phone);
      if (contact.name.trim().length < 2) {
        setError("Укажите имя, чтобы увидеть сводку демо-записи.");
        return;
      }
      if (digits.length < 10 || digits.length > 11) {
        setError("Проверьте номер телефона: нужно 10 или 11 цифр.");
        return;
      }
      if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        setError("Проверьте адрес электронной почты.");
        return;
      }
      if (!consent) {
        setError("Подтвердите согласие на обработку данных в рамках этой демонстрации.");
        return;
      }
      setStep("review");
    }
  };

  const goBack = () => {
    setError("");
    if (step === "review") setStep("contact");
    else if (step === "contact") setStep("time");
    else if (step === "time") setStep("ritual");
  };

  const confirm = () => {
    setError("");
    const result = localDemoBookingAdapter.reserve({
      date: dateKey,
      time,
      duration,
      serviceId: service.id,
      specialistId,
    });
    if (result.status === "taken") {
      setTime("");
      setStep("time");
      setError("Это время уже выбрали в демо. Выберите другой свободный слот.");
      return;
    }
    if (result.status === "past") {
      setStep("time");
      setError("Эта дата уже прошла. Выберите другой день.");
      return;
    }
    if (result.status === "unavailable") {
      setStep("time");
      setError("Для выбранного ритуала сейчас нет подходящего специалиста.");
      return;
    }
    setConfirmedSpecialist(somaSpecialists.find((item) => item.id === result.specialistId)?.name ?? "Команда SOMA");
    setPersistence(result.persistence);
    setContact(emptyContact);
    setConsent(false);
    setStep("confirmed");
  };

  return (
    <section className="soma-booking" id="booking" aria-labelledby="booking-heading">
      <div className="soma-booking__intro">
        <p className="soma-kicker">DEMO MODE · без реальной брони</p>
        <h2 id="booking-heading">Начать с <em>времени для себя.</em></h2>
        <p>Выберите ритуал и посмотрите, как устроена запись. Контакты не отправляются и не сохраняются.</p>
      </div>

      <div className="soma-booking__panel">
        <div className="soma-booking__topline">
          <span>Демо-запись</span>
          <span>без оплаты и передачи данных</span>
        </div>

        {step !== "confirmed" && (
          <ol className="soma-steps" aria-label="Этапы демонстрационной записи">
            {stepNames.map((item, index) => (
              <li key={item.id} className={index === stageIndex ? "is-current" : index < stageIndex ? "is-complete" : ""} aria-current={index === stageIndex ? "step" : undefined}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ol>
        )}

        {step === "ritual" && (
          <div className="soma-booking__step">
            <h3>Какой ритуал вам ближе?</h3>
            <label className="soma-field">
              <span>Выберите ритуал</span>
              <select value={service.id} onChange={(event) => { setServiceId(event.target.value); setError(""); }}>
                {somaServices.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <fieldset className="soma-choice-set">
              <legend>Длительность</legend>
              <div className="soma-duration-options">
                {service.durationOptions.map((minutes) => (
                  <label className={`soma-duration-option${duration === minutes ? " is-selected" : ""}`} key={minutes}>
                    <input type="radio" name="soma-duration" value={minutes} checked={duration === minutes} onChange={() => setDuration(minutes)} />
                    <span>{minutes} минут</span>
                    <strong>{somaPrice(service, minutes).toLocaleString("ru-RU")} ₽</strong>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="soma-booking__selection-note">{service.note}</p>
          </div>
        )}

        {step === "time" && (
          <div className="soma-booking__step">
            <h3>Выберите день и время</h3>
            <label className="soma-field">
              <span>Специалист</span>
              <select value={specialistId} onChange={(event) => { setSpecialistId(event.target.value); setTime(""); }}>
                <option value="any">Любой свободный специалист</option>
                {compatibleSpecialists.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.focus.toLocaleLowerCase("ru-RU")}</option>)}
              </select>
            </label>
            {compatibleSpecialists.length === 0 && <p className="soma-inline-error">Для этого ритуала пока нет специалистов в демо-расписании.</p>}
            <fieldset className="soma-choice-set">
              <legend>Дата</legend>
              <div className="soma-date-options">
                {availableDates.map((item) => {
                  const key = localDateKey(item);
                  return (
                    <label className={`soma-date-option${dateKey === key ? " is-selected" : ""}`} key={key}>
                      <input type="radio" name="soma-date" value={key} checked={dateKey === key} onChange={() => { setDateKey(key); setTime(""); }} />
                      <span>{dateLabel(item)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="soma-choice-set">
              <legend>Свободное время</legend>
              {slots.length ? (
                <div className="soma-time-options">
                  {slots.map((item) => (
                    <label className={`soma-time-option${time === item ? " is-selected" : ""}`} key={item}>
                      <input type="radio" name="soma-time" value={item} checked={time === item} onChange={() => setTime(item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              ) : <p className="soma-booking__selection-note">Свободное время на этот день появится после выбора другой даты.</p>}
            </fieldset>
          </div>
        )}

        {step === "contact" && (
          <div className="soma-booking__step">
            <h3>Кому показать сводку?</h3>
            <p className="soma-booking__selection-note">Поля нужны только для демонстрации формы. Нажатие на последнюю кнопку не отправляет их.</p>
            <label className="soma-field">
              <span>Имя</span>
              <input autoComplete="name" value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="soma-field">
              <span>Телефон</span>
              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} />
            </label>
            <label className="soma-field">
              <span>Почта <small>необязательно</small></span>
              <input type="email" inputMode="email" autoComplete="email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} />
            </label>
            <label className="soma-consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Я понимаю, что это демонстрационная форма: данные не отправляются и будут удалены после закрытия этой вкладки.</span>
            </label>
          </div>
        )}

        {step === "review" && (
          <div className="soma-booking__step">
            <h3>Всё верно?</h3>
            <dl className="soma-summary">
              <div><dt>Ритуал</dt><dd>{service.name}</dd></div>
              <div><dt>Длительность</dt><dd>{duration} минут</dd></div>
              <div><dt>День</dt><dd>{dateLabel(date)}</dd></div>
              <div><dt>Время</dt><dd>{time}</dd></div>
              <div><dt>Специалист</dt><dd>{selectedSpecialist?.name ?? "Любой свободный специалист"}</dd></div>
              <div><dt>Стоимость в демо</dt><dd>{somaPrice(service, duration).toLocaleString("ru-RU")} ₽</dd></div>
              <div><dt>Контакт</dt><dd>{contact.name.trim()} · {contact.phone}</dd></div>
            </dl>
            <p className="soma-booking__selection-note">Контактные данные остаются в оперативной памяти этой вкладки. В локальном хранилище учитывается только занятый демонстрационный слот.</p>
          </div>
        )}

        {step === "confirmed" && (
          <div className="soma-booking__step soma-booking__success" role="status" aria-live="polite">
            <span className="soma-booking__success-mark" aria-hidden="true">✓</span>
            <h3>Демо-запись учтена</h3>
            <p>{service.name}, {dateLabel(date)}, {time}. Специалист: {confirmedSpecialist}.</p>
            <p className="soma-booking__selection-note">
              {persistence === "local" ? "Слот сохранён в локальном хранилище этого браузера." : "Слот учтён только до закрытия или перезагрузки этой вкладки: браузерное хранилище недоступно."} Фактической брони нет; контактные данные не сохранены и не отправлены.
            </p>
            <button className="soma-text-button" type="button" onClick={() => { setStep("ritual"); setTime(""); setError(""); }}>Начать заново</button>
          </div>
        )}

        {error && <p className="soma-form-error" role="alert">{error}</p>}

        {step !== "confirmed" && (
          <div className="soma-booking__actions">
            {step !== "ritual" && <button className="soma-button soma-button--quiet" type="button" onClick={goBack}>Назад</button>}
            {step === "review" ? (
              <button className="soma-button soma-button--dark" type="button" onClick={confirm}>Сохранить демо-слот</button>
            ) : (
              <button className="soma-button soma-button--dark" type="button" onClick={advance}>{step === "contact" ? "Проверить запись" : "Продолжить"}</button>
            )}
          </div>
        )}
      </div>
      <p className="soma-booking__privacy">DEMO MODE · Контакты не покидают вкладку. Оплаты, CRM и настоящей записи нет.</p>
    </section>
  );
}
