import type { Metadata } from "next"
import Image from "next/image"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "О нас",
  description: "Информация о нашем мебельном магазине",
}

export default function AboutPage() {
  return (
    <div className="container">
      <h1 className={styles.title}>О нас</h1>

      <div className={styles.content}>
        <div className={styles.imageWrapper}>
          <Image src="/modern-furniture-showroom.png" alt="Наш магазин" width={600} height={400} className={styles.image} />
        </div>

        <div className={styles.text}>
          <p>
            Мы - команда профессионалов, которая уже более 10 лет занимается производством и продажей качественной
            мебели для дома. Наша миссия - создавать комфортное пространство для жизни наших клиентов.
          </p>

          <p>
            Мы предлагаем широкий ассортимент мебели: диваны, кровати и другие предметы интерьера. Вся продукция
            изготавливается из высококачественных материалов и соответствует современным стандартам.
          </p>

          <p>Наши преимущества:</p>

          <ul className={styles.advantagesList}>
            <li>Собственное производство</li>
            <li>Гарантия качества на всю продукцию</li>
            <li>Индивидуальный подход к каждому клиенту</li>
            <li>Бесплатная доставка по всей Беларуси</li>
            <li>Возможность изготовления мебели по индивидуальным заказам</li>
          </ul>

          <p>
            Мы стремимся к постоянному совершенствованию и развитию, чтобы предлагать нашим клиентам лучшие решения для
            их дома.
          </p>
        </div>
      </div>
    </div>
  )
}
