import { useState } from "react";
import { serviceCategories, services } from "../data";
import type { Service, ServiceCategory } from "../types";
import type { BookingStarter } from "./KernHeader";

const priceFormat = new Intl.NumberFormat("ru-RU");

function durationLabel(minutes: number): string {
  return minutes + " мин";
}

function servicePrice(service: Service): string {
  return priceFormat.format(service.price) + " ₽";
}

export function ServiceList({ onBook }: { onBook: BookingStarter }) {
  const [category, setCategory] = useState<(typeof serviceCategories)[number]>("Все услуги");
  const visibleServices = category === "Все услуги"
    ? services
    : services.filter((service) => service.category === category);

  return (
    <section className="kern-section kern-services" id="services" aria-labelledby="kern-services-title">
      <div className="kern-section__heading">
        <div>
          <p className="kern-eyebrow kern-eyebrow--dark"><span /> Прайс-лист</p>
          <h2 id="kern-services-title">Выбирай услугу.<br /><em>Остальное обсудим.</em></h2>
        </div>
        <p className="kern-section__aside">Цена и время известны до записи. Услуга привязана к расписанию барбера.</p>
      </div>
      <div className="kern-filter-row" role="group" aria-label="Фильтр услуг">
        {serviceCategories.map((item) => (
          <button
            aria-pressed={category === item}
            className={category === item ? "is-active" : ""}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="kern-service-list" aria-live="polite">
        {visibleServices.map((service, index) => (
          <article className="kern-service-row" key={service.id}>
            <div className="kern-service-row__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
            <div className="kern-service-row__main">
              <div className="kern-service-row__title">
                <h3>{service.name}</h3>
                {service.badge && <span>{service.badge}</span>}
              </div>
              <p>{service.description}</p>
            </div>
            <div className="kern-service-row__duration">{durationLabel(service.duration)}</div>
            <div className="kern-service-row__price">{servicePrice(service)}</div>
            <button
              className="kern-service-row__book"
              type="button"
              aria-label={"Записаться: " + service.name}
              onClick={(event) => onBook({ serviceId: service.id }, event.currentTarget)}
            >
              Записаться <span aria-hidden="true">↗</span>
            </button>
          </article>
        ))}
      </div>
      <p className="kern-services__note">Комплекс «Стрижка + борода» стоит на 600 ₽ меньше, чем те же услуги отдельно.</p>
    </section>
  );
}

export function getCategoryLabel(category: ServiceCategory): string {
  return category;
}
