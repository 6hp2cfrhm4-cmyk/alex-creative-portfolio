export function KernProcess() {
  return (
    <section className="kern-process" aria-labelledby="kern-process-title">
      <div className="kern-process__image" role="img" aria-label="Барбер с короткой текстурной стрижкой в тёмной студии">
        <span>Точность начинается<br />с разговора.</span>
      </div>
      <div className="kern-process__content">
        <p className="kern-eyebrow kern-eyebrow--dark"><span /> Как это устроено</p>
        <h2 id="kern-process-title">Форма важнее<br /><em>ритуала.</em></h2>
        <p className="kern-process__lead">Не нужно знать названия переходов. Достаточно понять, что удобно именно тебе.</p>
        <div className="kern-process__steps">
          <article>
            <span>Сначала — разговор</span>
            <p>Барбер уточнит привычную длину, работу и сколько времени ты готов тратить на укладку.</p>
          </article>
          <article>
            <span>Затем — форма</span>
            <p>Работаем по направлению роста волос, а не по картинке, которую сложно повторить.</p>
          </article>
          <article>
            <span>В конце — понятный уход</span>
            <p>Покажем, как уложить стрижку дома и какие средства действительно нужны.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function KernClub() {
  return (
    <section className="kern-club" id="club" aria-labelledby="kern-club-title">
      <p className="kern-eyebrow"><span /> KERN / BARBER CLUB</p>
      <div className="kern-club__body">
        <h2 id="kern-club-title">Место, где<br />можно просто<br /><em>быть собой.</em></h2>
        <div className="kern-club__note">
          <p>Без обязательного разговора. Без навязанных средств. Хорошая стрижка начинается с внимания к человеку, а не с готового сценария.</p>
          <span>Спокойный сервис — тоже часть формы.</span>
        </div>
      </div>
      <div className="kern-club__rule"><span>ТОЧНОСТЬ</span><span>УВАЖЕНИЕ КО ВРЕМЕНИ</span><span>ФОРМА В ЖИЗНИ</span></div>
    </section>
  );
}
