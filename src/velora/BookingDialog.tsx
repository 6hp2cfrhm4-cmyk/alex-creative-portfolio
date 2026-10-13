import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createDemoBookingRepository, getAvailableSlots, localDateKey, validateContact } from "./booking-engine.mjs";
import type { DemoSlot } from "./booking-engine.mjs";
import { formatDuration, formatPrice, masters, services, serviceCategories } from "./content";

const stepLabels = ["Услуга", "Мастер", "Дата и время", "Контакты", "Проверка"];
const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
}

function humanDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date(year, month - 1, day, 12));
}

function monthCells(date: Date): (string | null)[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12).getDate();
  const mondayOffset = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(mondayOffset).fill(null)];
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(localDateKey(new Date(date.getFullYear(), date.getMonth(), day, 12)));
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function moveMonth(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1, 12);
}

export function BookingDialog({ open, initialServiceId, initialMasterId, onClose }: {
  open: boolean;
  initialServiceId?: string;
  initialMasterId?: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const repository = useMemo(() => createDemoBookingRepository(), []);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [masterId, setMasterId] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const [chosenSlot, setChosenSlot] = useState<DemoSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string }>({});
  const [bookingError, setBookingError] = useState("");
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
    if (!open) {
      setName("");
      setPhone("");
      setConsent(false);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const currentService = services.find((item) => item.id === initialServiceId);
    const compatibleMaster = currentService && initialMasterId && currentService.masterIds.includes(initialMasterId) ? initialMasterId : null;
    setServiceId(currentService?.id ?? "");
    setMasterId(compatibleMaster);
    setDateKey("");
    setChosenSlot(null);
    setName("");
    setPhone("");
    setConsent(false);
    setErrors({});
    setBookingError("");
    setComplete(false);
    setSubmitting(false);
    setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
    setStep(currentService ? (compatibleMaster ? 2 : 1) : 0);
  }, [open, initialServiceId, initialMasterId]);

  const service = services.find((item) => item.id === serviceId);
  const eligibleMasters = masters.filter((master) => service?.masterIds.includes(master.id));
  const availableSlots = useMemo(() => {
    if (!service || !dateKey) return [];
    return getAvailableSlots({
      dateKey,
      durationMinutes: service.duration,
      masterId,
      eligibleMasterIds: eligibleMasters.map((master) => master.id),
      reservations: repository.listReservations(),
      todayKey: localDateKey(),
    });
  }, [dateKey, eligibleMasters, masterId, repository, service]);

  const selectService = (nextServiceId: string) => {
    const nextService = services.find((item) => item.id === nextServiceId);
    setServiceId(nextServiceId);
    if (masterId && !nextService?.masterIds.includes(masterId)) setMasterId(null);
    setDateKey("");
    setChosenSlot(null);
    setBookingError("");
    const nextStep = masterId && nextService?.masterIds.includes(masterId) ? 2 : 1;
    setStep(nextStep);
  };

  const selectMaster = (nextMasterId: string | null) => {
    setMasterId(nextMasterId);
    setDateKey("");
    setChosenSlot(null);
    setBookingError("");
  };

  const selectDate = (nextDateKey: string) => {
    setDateKey(nextDateKey);
    setChosenSlot(null);
    setBookingError("");
  };

  const handleCalendarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = directions[event.key];
    const current = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-date]");
    if (!delta || !current?.dataset.date) return;
    event.preventDefault();
    const [year, month, day] = current.dataset.date.split("-").map(Number);
    const target = new Date(year, month - 1, day + delta, 12);
    const targetKey = localDateKey(target);
    if (target.getFullYear() !== visibleMonth.getFullYear() || target.getMonth() !== visibleMonth.getMonth()) {
      setVisibleMonth(new Date(target.getFullYear(), target.getMonth(), 1, 12));
      window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-date="' + targetKey + '"]')?.focus());
      return;
    }
    document.querySelector<HTMLButtonElement>('[data-date="' + targetKey + '"]')?.focus();
  };

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateContact(name, phone, consent);
    setErrors(result.errors);
    if (!result.valid) return;
    setBookingError("");
    setStep(4);
  };

  const confirmBooking = () => {
    if (!chosenSlot || submitting) return;
    setSubmitting(true);
    const reserved = repository.reserve(chosenSlot);
    if (!reserved) {
      setBookingError("Это демо-время уже выбрано. Выберите соседнее время.");
      setStep(2);
      setChosenSlot(null);
      setSubmitting(false);
      return;
    }
    setName("");
    setPhone("");
    setConsent(false);
    setComplete(true);
    setSubmitting(false);
  };

  const closeDialog = () => {
    if (dialog.current?.open) dialog.current.close();
    onClose();
  };

  const activeMaster = chosenSlot ? masters.find((master) => master.id === chosenSlot.masterId) : masters.find((master) => master.id === masterId);
  const todayKey = localDateKey();
  const cells = monthCells(visibleMonth);
  const minimumMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);
  const maximumMonth = moveMonth(minimumMonth, 2);

  return (
    <dialog
      ref={dialog}
      className="velora-booking"
      aria-labelledby="booking-heading"
      onCancel={(event) => { event.preventDefault(); closeDialog(); }}
      onClick={(event) => { if (event.target === dialog.current) closeDialog(); }}
    >
      <div className="velora-booking__shell">
        <div className="velora-booking__topline"><span>VELORA / DEMO</span><button type="button" className="velora-booking__close" onClick={closeDialog}>Закрыть <span aria-hidden="true">×</span></button></div>
        {complete ? <section className="velora-booking__success" aria-live="polite">
          <span className="velora-booking__success-mark" aria-hidden="true">✓</span>
          <p className="velora-kicker">Готово</p>
          <h2 id="booking-heading">Демо-запись создана только в браузере</h2>
          <p>Тестовое время сохранено в этой вкладке, чтобы повторно его не предлагать. Салон не получит уведомление.</p>
          <div className="velora-booking__summary velora-booking__summary--success">
            <span>{service?.name}</span><span>{activeMaster?.name}</span><span>{dateKey && humanDate(dateKey)} · {chosenSlot?.time}</span>
          </div>
          <button className="velora-button velora-button--dark" type="button" onClick={closeDialog}>Вернуться на сайт</button>
        </section> : <>
          <div className="velora-booking__intro">
            <p className="velora-kicker">Онлайн-запись · демонстрация</p>
            <h2 id="booking-heading">Ваше время<br /><em>для себя.</em></h2>
            <p>Пройдите путь гостя салона. Данные никуда не отправляются.</p>
          </div>
          <ol className="velora-booking__steps" aria-label="Этапы записи">
            {stepLabels.map((label, index) => <li key={label} className={index === step ? "is-current" : index < step ? "is-complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><span>{label}</span></li>)}
          </ol>
          <div className="velora-booking__demo-note"><span aria-hidden="true">i</span> Время условное. Это не расписание действующего салона.</div>

          {step === 0 && <section className="velora-booking__step" aria-labelledby="booking-service-title">
            <p className="velora-kicker">01 / Выбор услуги</p><h3 id="booking-service-title">С чего начнём?</h3>
            {serviceCategories.map((category) => <div className="velora-booking__service-group" key={category.id}>
              <h4>{category.label}</h4>
              {services.filter((item) => item.category === category.id).map((item) => <button type="button" className="velora-booking__service" key={item.id} onClick={() => selectService(item.id)} aria-pressed={serviceId === item.id}>
                <span><strong>{item.name}</strong><small>{item.description}</small><small>{formatDuration(item.duration)}</small></span><span className="velora-booking__service-price">от {formatPrice(item.price)} <b aria-hidden="true">↗</b></span>
              </button>)}
            </div>)}
          </section>}

          {step === 1 && service && <section className="velora-booking__step" aria-labelledby="booking-master-title">
            <p className="velora-kicker">02 / Подбор специалиста</p><h3 id="booking-master-title">Кто позаботится о вас?</h3>
            <p className="velora-booking__context">{service.name} · {formatDuration(service.duration)}</p>
            <button type="button" className={`velora-booking__any-master${masterId === null ? " is-selected" : ""}`} aria-pressed={masterId === null} onClick={() => selectMaster(null)}><span>Довериться расписанию</span><small>Подберём первого свободного мастера с нужной специализацией</small></button>
            <div className="velora-booking__master-options">{eligibleMasters.map((master) => <button className={`velora-booking__master-option${masterId === master.id ? " is-selected" : ""}`} type="button" key={master.id} aria-pressed={masterId === master.id} onClick={() => selectMaster(master.id)}>
              <img src={master.image} alt="" loading="lazy" /><span><strong>{master.name}</strong><small>{master.role}</small></span><span className="velora-booking__radio" aria-hidden="true" />
            </button>)}</div>
            <div className="velora-booking__actions"><button className="velora-button velora-button--text" type="button" onClick={() => setStep(0)}>Назад к услугам</button><button className="velora-button velora-button--dark" type="button" disabled={!eligibleMasters.length} onClick={() => setStep(2)}>Выбрать дату <span aria-hidden="true">→</span></button></div>
          </section>}

          {step === 2 && service && <section className="velora-booking__step" aria-labelledby="booking-date-title">
            <p className="velora-kicker">03 / Дата и время</p><h3 id="booking-date-title">Когда вам удобно?</h3>
            <p className="velora-booking__context">{service.name} · {formatDuration(service.duration)} · от {formatPrice(service.price)}</p>
            <div className="velora-calendar-heading"><h4>{monthLabel(visibleMonth)}</h4><div><button type="button" aria-label="Предыдущий месяц" disabled={visibleMonth <= minimumMonth} onClick={() => setVisibleMonth((value) => moveMonth(value, -1))}>←</button><button type="button" aria-label="Следующий месяц" disabled={visibleMonth >= maximumMonth} onClick={() => setVisibleMonth((value) => moveMonth(value, 1))}>→</button></div></div>
            <div className="velora-calendar" role="grid" aria-label="Календарь выбора даты" onKeyDown={handleCalendarKeyDown}>
              <div className="velora-calendar__row" role="row">{weekdays.map((day) => <span role="columnheader" key={day}>{day}</span>)}</div>
              <div className="velora-calendar__days">{cells.map((date, index) => {
                const dateLabel = date ? Number(date.slice(-2)) : "";
                const isPast = date ? date < todayKey : true;
                const isSelected = date === dateKey;
                return <div role="gridcell" key={date ?? "blank-" + index} aria-selected={isSelected}>
                  {date ? <button type="button" data-date={date} aria-label={humanDate(date)} aria-pressed={isSelected} disabled={isPast} className={`${isSelected ? "is-selected" : ""}${date === todayKey ? " is-today" : ""}`} onClick={() => selectDate(date)}>{dateLabel}</button> : <span aria-hidden="true" />}
                </div>;
              })}</div>
            </div>
            {dateKey && <div className="velora-booking__times" aria-live="polite"><h4>Время · {humanDate(dateKey)}</h4>{availableSlots.length ? <div className="velora-booking__time-list">{availableSlots.map((slot) => <button key={slot.time + slot.masterId} type="button" aria-pressed={chosenSlot?.time === slot.time && chosenSlot.masterId === slot.masterId} className={chosenSlot?.time === slot.time && chosenSlot.masterId === slot.masterId ? "is-selected" : ""} onClick={() => { setChosenSlot(slot); setBookingError(""); }}>{slot.time}</button>)}</div> : <p className="velora-booking__empty">На этот день нет подходящего демо-времени. Попробуйте соседнюю дату.</p>}</div>}
            {bookingError && <p className="velora-form-error" role="alert">{bookingError}</p>}
            <div className="velora-booking__actions"><button className="velora-button velora-button--text" type="button" onClick={() => setStep(1)}>Назад к мастеру</button><button className="velora-button velora-button--dark" type="button" disabled={!chosenSlot} onClick={() => setStep(3)}>Продолжить <span aria-hidden="true">→</span></button></div>
          </section>}

          {step === 3 && service && chosenSlot && <form className="velora-booking__step velora-booking__form" aria-labelledby="booking-contact-title" onSubmit={submitContact} noValidate>
            <p className="velora-kicker">04 / Контакт</p><h3 id="booking-contact-title">Как к вам обращаться?</h3>
            <label className="velora-field" htmlFor="booking-name">Ваше имя<input id="booking-name" autoComplete="name" value={name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "booking-name-error" : undefined} onChange={(event) => { setName(event.target.value); setErrors((value) => ({ ...value, name: undefined })); }} /></label>
            {errors.name && <p className="velora-form-error" id="booking-name-error" role="alert">{errors.name}</p>}
            <label className="velora-field" htmlFor="booking-phone">Номер телефона<input id="booking-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" value={phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "booking-phone-error" : "booking-phone-help"} onChange={(event) => { setPhone(event.target.value); setErrors((value) => ({ ...value, phone: undefined })); }} /></label>
            <small className="velora-field-help" id="booking-phone-help">Контакт нужен только для вида итоговой формы — он не отправляется и не сохраняется.</small>
            {errors.phone && <p className="velora-form-error" id="booking-phone-error" role="alert">{errors.phone}</p>}
            <label className="velora-consent"><input type="checkbox" checked={consent} aria-invalid={Boolean(errors.consent)} onChange={(event) => { setConsent(event.target.checked); setErrors((value) => ({ ...value, consent: undefined })); }} /><span>Я подтверждаю, что это демонстрационная форма, и соглашаюсь на обработку данных только в памяти этой вкладки.</span></label>
            {errors.consent && <p className="velora-form-error" role="alert">{errors.consent}</p>}
            <p className="velora-booking__privacy">Имя и номер исчезнут после закрытия формы. Сообщение, звонок или заявка не отправляются.</p>
            <div className="velora-booking__actions"><button className="velora-button velora-button--text" type="button" onClick={() => setStep(2)}>Назад ко времени</button><button className="velora-button velora-button--dark" type="submit">Проверить запись <span aria-hidden="true">→</span></button></div>
          </form>}

          {step === 4 && service && chosenSlot && <section className="velora-booking__step" aria-labelledby="booking-review-title">
            <p className="velora-kicker">05 / Перед подтверждением</p><h3 id="booking-review-title">Проверьте детали</h3>
            <p className="velora-booking__review-note">Подтверждение останется в этом браузере. Никаких сообщений салону не отправится.</p>
            <dl className="velora-booking__summary">
              <div><dt>Услуга</dt><dd>{service.name}</dd></div>
              <div><dt>Специалист</dt><dd>{activeMaster?.name ?? "Первый свободный мастер"}</dd></div>
              <div><dt>Дата</dt><dd>{humanDate(chosenSlot.dateKey)}</dd></div>
              <div><dt>Время</dt><dd>{chosenSlot.time} · {formatDuration(service.duration)}</dd></div>
              <div><dt>Стоимость</dt><dd>от {formatPrice(service.price)}</dd></div>
            </dl>
            {bookingError && <p className="velora-form-error" role="alert">{bookingError}</p>}
            <div className="velora-booking__actions"><button className="velora-button velora-button--text" type="button" onClick={() => setStep(3)}>Назад к контактам</button><button className="velora-button velora-button--dark" type="button" disabled={submitting} onClick={confirmBooking}>{submitting ? "Сохраняем…" : "Создать демо-запись"}</button></div>
          </section>}
        </>}
      </div>
    </dialog>
  );
}
