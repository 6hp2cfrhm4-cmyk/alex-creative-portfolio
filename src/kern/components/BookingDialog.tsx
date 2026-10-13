import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { barbers, getBarber, getService, services } from "../data";
import {
  getAvailableDates,
  getAvailableSlots,
  isValidPhone,
  LocalDemoBookingAdapter,
  parseDateKey,
} from "../booking";
import type { BookingDraft, BookingReservation, ReservationResult, Service } from "../types";

const adapter = new LocalDemoBookingAdapter();
const stepNames = ["Услуга", "Барбер", "Время", "Проверка", "Контакт"];
const priceFormat = new Intl.NumberFormat("ru-RU");

function initialStep(seed: Partial<BookingDraft>): number {
  if (seed.serviceId && seed.barberId) return 2;
  if (seed.serviceId) return 1;
  return 0;
}

function dateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  if (!date) return dateKey;
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function priceLabel(service: Service): string {
  return priceFormat.format(service.price) + " ₽";
}

export function BookingDialog({
  seed,
  returnFocusRef,
  onClose,
}: {
  seed: Partial<BookingDraft>;
  returnFocusRef: { current: HTMLElement | null };
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ignoreProgrammaticCloseRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) {
        ignoreProgrammaticCloseRef.current = true;
        dialog.close();
      }
    };
  }, []);

  const handleClose = () => {
    onClose();
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  return (
    <dialog
      ref={dialogRef}
      className="kern-booking-dialog"
      aria-label="Демо-запись в KERN / BARBER CLUB"
      data-booking-dialog
      onClose={() => {
        if (ignoreProgrammaticCloseRef.current) {
          ignoreProgrammaticCloseRef.current = false;
          return;
        }
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="kern-booking-dialog__rail">
        <a className="kern-wordmark" href="#top" aria-label="KERN / BARBER CLUB — на главную">
          <span className="kern-wordmark__mark" aria-hidden="true">K</span>
          <span>KERN <i>/</i> BARBER CLUB</span>
        </a>
        <p>Запись<br />без лишнего.</p>
        <span className="kern-booking-dialog__demo">Демонстрационный режим</span>
      </div>
      <div className="kern-booking-dialog__main">
        <div className="kern-booking-dialog__top">
          <div>
            <p className="kern-eyebrow kern-eyebrow--dark"><span /> Выбрать визит</p>
            <h2>Запись</h2>
          </div>
          <button
            className="kern-icon-button kern-icon-button--dark"
            type="button"
            aria-label="Закрыть запись"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
        </div>
        <BookingFlow seed={seed} />
      </div>
    </dialog>
  );
}

function BookingFlow({ seed }: { seed: Partial<BookingDraft> }) {
  const [step, setStep] = useState(() => initialStep(seed));
  const [draft, setDraft] = useState<BookingDraft>({
    serviceId: seed.serviceId ?? "",
    barberId: seed.barberId ?? "",
    date: "",
    time: "",
    name: "",
    phone: "",
    consent: false,
  });
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<BookingReservation | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; consent?: string }>({});
  const [now] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    adapter.getAll()
      .then((items) => {
        if (active) setReservations(items);
      })
      .catch(() => {
        if (active) setStorageError("Демо-расписание не загрузилось. Обнови страницу и попробуй ещё раз.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedService = getService(draft.serviceId);
  const availableServices = useMemo(() => {
    const selectedBarber = getBarber(draft.barberId);
    return selectedBarber
      ? services.filter((service) => selectedBarber.serviceIds.includes(service.id))
      : services;
  }, [draft.barberId]);
  const availableBarbers = selectedService
    ? barbers.filter((barber) => barber.serviceIds.includes(selectedService.id))
    : barbers;
  const availableDates = useMemo(() => selectedService
    ? getAvailableDates(selectedService.id, draft.barberId || "any", reservations, now, 21)
    : [], [selectedService, draft.barberId, reservations, now]);

  useEffect(() => {
    if (!selectedService) return;
    if (draft.date && availableDates.includes(draft.date)) return;
    setDraft((current) => ({ ...current, date: availableDates[0] ?? "", time: "" }));
  }, [selectedService, availableDates, draft.date]);

  const slots = useMemo(() => selectedService && draft.date
    ? getAvailableSlots(selectedService.id, draft.barberId || "any", draft.date, reservations, now)
    : [], [selectedService, draft.barberId, draft.date, reservations, now]);
  const selectedSlot = slots.find((slot) => slot.time === draft.time && slot.barberIds.length > 0);

  const chooseService = (serviceId: string) => {
    const selectedBarber = getBarber(draft.barberId);
    const barberId = draft.barberId !== "any" && selectedBarber && !selectedBarber.serviceIds.includes(serviceId)
      ? ""
      : draft.barberId;
    setDraft((current) => ({ ...current, serviceId, barberId, date: "", time: "" }));
    setError("");
  };

  const chooseBarber = (barberId: string) => {
    setDraft((current) => ({ ...current, barberId, date: "", time: "" }));
    setError("");
  };

  const goToNextStep = () => {
    if (step === 0 && !draft.serviceId) {
      setError("Выбери услугу, чтобы увидеть подходящих барберов.");
      return;
    }
    if (step === 1 && !draft.barberId) {
      setError("Выбери барбера или вариант «Любой барбер».");
      return;
    }
    if (step === 2 && (!draft.date || !draft.time || !selectedSlot)) {
      setError("Выбери дату и свободное время.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, stepNames.length - 1));
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { name?: string; phone?: string; consent?: string } = {};
    if (!draft.name.trim()) nextErrors.name = "Укажи имя.";
    if (!isValidPhone(draft.phone)) nextErrors.phone = "Проверь номер: нужно от 10 до 15 цифр.";
    if (!draft.consent) nextErrors.consent = "Подтверди условия демонстрационной формы.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Проверь отмеченные поля.");
      return;
    }
    if (!selectedService || !selectedSlot || !draft.date) {
      setStep(2);
      setError("Свободное время изменилось. Выбери другой слот.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const result: ReservationResult = await adapter.reserve({
        date: draft.date,
        time: draft.time,
        barberIds: selectedSlot.barberIds,
        duration: selectedService.duration,
      });
      if (!result.ok || !result.reservation) {
        const updatedReservations = await adapter.getAll();
        setReservations(updatedReservations);
        setStep(2);
        setDraft((current) => ({ ...current, time: "" }));
        setError("Этот слот только что заняли. Выбери другое время.");
        return;
      }
      setReservations(await adapter.getAll());
      setConfirmed(result.reservation);
    } catch {
      setStorageError("Демо-запись не сохранилась. Разреши локальное хранилище и попробуй ещё раз.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetFlow = () => {
    setConfirmed(null);
    setStep(0);
    setDraft({ serviceId: "", barberId: "", date: "", time: "", name: "", phone: "", consent: false });
    setError("");
    setFieldErrors({});
  };

  const bookedBarber = confirmed ? getBarber(confirmed.barberId) : undefined;

  return (
    <div className="kern-booking-flow">
      {confirmed ? (
        <div className="kern-booking-success" role="status">
          <span className="kern-booking-success__check" aria-hidden="true">✓</span>
          <p className="kern-eyebrow kern-eyebrow--dark"><span /> Демо-запись готова</p>
          <h3>Время<br /><em>за тобой.</em></h3>
          <p className="kern-booking-success__notice">Демо-запись сохранена в этом браузере; сообщение салону не отправлялось.</p>
          <dl>
            <div><dt>Услуга</dt><dd>{selectedService?.name}</dd></div>
            <div><dt>Барбер</dt><dd>{bookedBarber?.name ?? "KERN"}</dd></div>
            <div><dt>Дата и время</dt><dd>{dateLabel(confirmed.date)} · {confirmed.time}</dd></div>
            {selectedService && <div><dt>Стоимость</dt><dd>{priceLabel(selectedService)}</dd></div>}
          </dl>
          <button className="kern-button kern-button--dark" type="button" onClick={resetFlow}>Начать заново</button>
        </div>
      ) : (
        <>
          <ol className="kern-booking-steps" aria-label="Шаги записи">
            {stepNames.map((name, index) => (
              <li key={name}>
                <button
                  type="button"
                  aria-current={step === index ? "step" : undefined}
                  disabled={index > step}
                  onClick={() => {
                    if (index < step) {
                      setStep(index);
                      setError("");
                    }
                  }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>{name}
                </button>
              </li>
            ))}
          </ol>
          <p className="kern-booking-progress" aria-live="polite">Шаг {step + 1} из {stepNames.length}</p>
          {storageError && <p className="kern-booking-storage-error" role="alert">{storageError}</p>}
          {error && <p className="kern-booking-error" role="alert">{error}</p>}
          {isLoading && <p className="kern-booking-loading" role="status">Загружаем демо-расписание…</p>}

          {!isLoading && step === 0 && (
            <section className="kern-booking-step" aria-labelledby="booking-step-title">
              <h3 id="booking-step-title">Что будем делать?</h3>
              <p>Цена и длительность указаны сразу.</p>
              <div className="kern-booking-service-list">
                {availableServices.map((service) => (
                  <button
                    aria-pressed={draft.serviceId === service.id}
                    className={draft.serviceId === service.id ? "is-selected" : ""}
                    data-service-choice={service.id}
                    key={service.id}
                    onClick={() => chooseService(service.id)}
                    type="button"
                  >
                    <span><b>{service.name}</b><small>{service.duration} мин · {service.description}</small></span>
                    <strong>{priceLabel(service)}</strong>
                  </button>
                ))}
              </div>
            </section>
          )}

          {!isLoading && step === 1 && (
            <section className="kern-booking-step" aria-labelledby="booking-step-title">
              <h3 id="booking-step-title">К кому записаться?</h3>
              <p>В расписании останутся только подходящие услуги.</p>
              <div className="kern-booking-barbers">
                <button
                  aria-pressed={draft.barberId === "any"}
                  className={draft.barberId === "any" ? "is-selected kern-booking-any" : "kern-booking-any"}
                  data-barber-choice="any"
                  onClick={() => chooseBarber("any")}
                  type="button"
                >
                  <span><b>Любой барбер</b><small>Покажем все доступные окна</small></span>
                  <span aria-hidden="true">↗</span>
                </button>
                {availableBarbers.map((barber) => (
                  <button
                    aria-pressed={draft.barberId === barber.id}
                    className={draft.barberId === barber.id ? "is-selected" : ""}
                    data-barber-choice={barber.id}
                    key={barber.id}
                    onClick={() => chooseBarber(barber.id)}
                    type="button"
                  >
                    <span><b>{barber.name}</b><small>{barber.specialty}</small></span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
                {availableBarbers.length === 0 && <p className="kern-empty-state">Эта услуга пока не привязана к расписанию барбера.</p>}
              </div>
            </section>
          )}

          {!isLoading && step === 2 && (
            <section className="kern-booking-step" aria-labelledby="booking-step-title">
              <h3 id="booking-step-title">Когда удобно?</h3>
              <p>{selectedService ? selectedService.name + " · " + selectedService.duration + " минут" : "Сначала выбери услугу."}</p>
              {availableDates.length > 0 ? (
                <>
                  <div className="kern-booking-date-list" role="group" aria-label="Доступные даты">
                    {availableDates.map((date) => (
                      <button
                        aria-pressed={draft.date === date}
                        className={draft.date === date ? "is-selected" : ""}
                        data-booking-date={date}
                        key={date}
                        onClick={() => setDraft((current) => ({ ...current, date, time: "" }))}
                        type="button"
                      >
                        {dateLabel(date)}
                      </button>
                    ))}
                  </div>
                  <div className="kern-booking-time-heading">
                    <h4>{draft.date ? dateLabel(draft.date) : "Выбери дату"}</h4>
                    <span>Все времена местные</span>
                  </div>
                  <div className="kern-booking-time-list" role="group" aria-label="Демо-слоты">
                    {slots.map((slot) => {
                      const available = slot.barberIds.length > 0;
                      return (
                        <button
                          aria-pressed={available && draft.time === slot.time}
                          aria-label={available ? slot.time + ", свободно" : slot.time + ", недоступно"}
                          className={(draft.time === slot.time && available ? "is-selected " : "") + (!available ? "is-unavailable" : "")}
                          data-booking-time={slot.time}
                          data-available={available ? "true" : "false"}
                          disabled={!available}
                          key={slot.time}
                          onClick={() => {
                            setDraft((current) => ({ ...current, time: slot.time }));
                            setError("");
                          }}
                          type="button"
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="kern-empty-state">В ближайшие 3 недели нет подходящего времени. Попробуй другого барбера или услугу.</p>
              )}
            </section>
          )}

          {!isLoading && step === 3 && (
            <section className="kern-booking-step kern-booking-review" aria-labelledby="booking-step-title">
              <h3 id="booking-step-title">Проверь детали</h3>
              <p>Услугу и время можно изменить до подтверждения.</p>
              <dl>
                <div><dt>Услуга</dt><dd>{selectedService?.name ?? "Не выбрана"}</dd><button type="button" onClick={() => setStep(0)}>Изменить</button></div>
                <div><dt>Барбер</dt><dd>{draft.barberId === "any" ? "Любой барбер" : getBarber(draft.barberId)?.name ?? "Не выбран"}</dd><button type="button" onClick={() => setStep(1)}>Изменить</button></div>
                <div><dt>Время</dt><dd>{draft.date ? dateLabel(draft.date) : ""} · {draft.time || "Не выбрано"}</dd><button type="button" onClick={() => setStep(2)}>Изменить</button></div>
                {selectedService && <div><dt>Стоимость и время</dt><dd>{priceLabel(selectedService)} · {selectedService.duration} мин</dd></div>}
              </dl>
            </section>
          )}

          {!isLoading && step === 4 && (
            <form className="kern-booking-step kern-booking-contact" onSubmit={handleContactSubmit} noValidate>
              <h3 id="booking-step-title">Оставь контакты</h3>
              <p>Они нужны только для демонстрации формы и не сохраняются.</p>
              <label>
                <span>Имя</span>
                <input
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "booking-name-error" : undefined}
                  value={draft.name}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, name: event.target.value }));
                    setFieldErrors((current) => ({ ...current, name: undefined }));
                  }}
                  type="text"
                  name="name"
                />
                {fieldErrors.name && <small id="booking-name-error">{fieldErrors.name}</small>}
              </label>
              <label>
                <span>Телефон</span>
                <input
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? "booking-phone-error" : undefined}
                  inputMode="tel"
                  placeholder="+7 900 000-00-00"
                  value={draft.phone}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, phone: event.target.value }));
                    setFieldErrors((current) => ({ ...current, phone: undefined }));
                  }}
                  type="tel"
                  name="phone"
                />
                {fieldErrors.phone && <small id="booking-phone-error">{fieldErrors.phone}</small>}
              </label>
              <label className="kern-booking-consent">
                <input
                  aria-invalid={Boolean(fieldErrors.consent)}
                  aria-describedby={fieldErrors.consent ? "booking-consent-error" : undefined}
                  checked={draft.consent}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, consent: event.target.checked }));
                    setFieldErrors((current) => ({ ...current, consent: undefined }));
                  }}
                  type="checkbox"
                  name="demo-consent"
                />
                <span>Понимаю, что это демонстрация: контакт не отправится салону и не сохранится в браузере.</span>
              </label>
              {fieldErrors.consent && <small id="booking-consent-error" className="kern-booking-field-error">{fieldErrors.consent}</small>}
              <button className="kern-button kern-button--accent kern-booking-submit" disabled={isSaving || Boolean(storageError)} type="submit">
                {isSaving ? "Сохраняем…" : "Сохранить демо-запись"} <span aria-hidden="true">↗</span>
              </button>
            </form>
          )}

          <div className="kern-booking-nav">
            {step > 0 && <button className="kern-booking-back" type="button" onClick={() => { setStep((current) => Math.max(0, current - 1)); setError(""); }}>← Назад</button>}
            {step < 4 && <button className="kern-button kern-button--dark" type="button" onClick={goToNextStep} disabled={isLoading || Boolean(storageError)}>
              Продолжить <span aria-hidden="true">→</span>
            </button>}
          </div>
          <p className="kern-booking-privacy">В демо хранится только свободное время и выбранный барбер. Имя и телефон остаются в памяти открытой формы.</p>
        </>
      )}
    </div>
  );
}
