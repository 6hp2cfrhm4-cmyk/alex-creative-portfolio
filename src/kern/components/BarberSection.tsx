import { barbers } from "../data";
import type { BookingStarter } from "./KernHeader";

export function BarberSection({ onBook }: { onBook: BookingStarter }) {
  return (
    <section className="kern-section kern-barbers" id="barbers" aria-labelledby="kern-barbers-title">
      <div className="kern-section__heading kern-section__heading--light">
        <div>
          <p className="kern-eyebrow"><span /> Команда</p>
          <h2 id="kern-barbers-title">Разные руки.<br /><em>Одна точность.</em></h2>
        </div>
        <p className="kern-section__aside">Выбери барбера по задаче. Список услуг и доступное время изменятся вместе с выбором.</p>
      </div>
      <div className="kern-barber-grid">
        {barbers.map((barber) => (
          <article className="kern-barber" key={barber.id}>
            <div
              className="kern-barber__portrait"
              role="img"
              aria-label={"Портрет барбера " + barber.name}
              style={{ backgroundPosition: (barber.portraitIndex * 50) + "% center" }}
            >
              <span>{barber.specialty}</span>
            </div>
            <div className="kern-barber__meta">
              <div>
                <h3>{barber.name}</h3>
                <p>{barber.description}</p>
              </div>
              <button
                type="button"
                aria-label={"Записаться к " + barber.name}
                onClick={(event) => onBook({ barberId: barber.id }, event.currentTarget)}
              >
                Записаться <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="kern-fiction-note">Имена, команда и фотографии созданы для демонстрации проекта.</p>
    </section>
  );
}
