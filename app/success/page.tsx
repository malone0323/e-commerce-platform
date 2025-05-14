import type { Metadata } from "next"
import Link from "next/link"
import Button from "@/shared/ui/button/Button"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Заказ успешно оформлен",
  description: "Ваш заказ успешно оформлен",
}

export default function SuccessPage() {
  return (
    <div className="container">
      <div className={styles.successPage}>
        <div className={styles.successIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
              stroke="#2ecc71"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 4L12 14.01L9 11.01"
              stroke="#2ecc71"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.successTitle}>Заказ успешно оформлен!</h1>
        <p className={styles.successText}>
          Спасибо за ваш заказ! Номер вашего заказа: <strong>#12345</strong>
        </p>
        <p className={styles.successInfo}>
          Мы отправили подтверждение на вашу электронную почту. Наш менеджер свяжется с вами в ближайшее время для
          уточнения деталей.
        </p>
        <div className={styles.actions}>
          <Link href="/">
            <Button size="lg">Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
