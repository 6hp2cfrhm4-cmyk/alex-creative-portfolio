export function KernFooter() {
  return (
    <footer className="kern-footer" id="contacts">
      <div className="kern-footer__top">
        <div>
          <p className="kern-eyebrow"><span /> Контакты</p>
          <h2>Скоро<br /><em>на связи.</em></h2>
          <p className="kern-footer__notice">Реальные адрес, карта, телефон и интеграция записи подключаются перед запуском.</p>
        </div>
        <div className="kern-map-placeholder" aria-label="Место для карты после выбора реальной локации">
          <span className="kern-map-placeholder__cross" aria-hidden="true">+</span>
          <p>Карта появится после выбора реального адреса</p>
          <span className="kern-map-placeholder__line" aria-hidden="true" />
        </div>
      </div>
      <div className="kern-footer__bottom">
        <a className="kern-wordmark" href="#top" aria-label="KERN / BARBER CLUB — наверх">
          <span className="kern-wordmark__mark" aria-hidden="true">K</span>
          <span>KERN <i>/</i> BARBER CLUB</span>
        </a>
        <p>Демонстрационный проект. Бренд, команда, цены и фотографии вымышлены.</p>
        <a href="#top">Наверх ↑</a>
      </div>
    </footer>
  );
}
