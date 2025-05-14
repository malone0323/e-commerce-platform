"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/shared/ui/button/Button"
import Input from "@/shared/ui/input/Input"
import { useCart } from "@/entities/cart/model/cartContext"
import styles from "./page.module.css"

export default function CheckoutPage() {
  const router = useRouter()
  const { state, dispatch } = useCart()
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card",
    deliveryMethod: "standard",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  // Redirect to cart if cart is empty
  if (state.items.length === 0) {
    router.push("/cart")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "Введите имя"
    if (!formData.lastName.trim()) newErrors.lastName = "Введите фамилию"
    if (!formData.email.trim()) newErrors.email = "Введите email"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Введите корректный email"
    if (!formData.phone.trim()) newErrors.phone = "Введите телефон"
    if (!formData.address.trim()) newErrors.address = "Введите адрес"
    if (!formData.city.trim()) newErrors.city = "Введите город"
    if (!formData.postalCode.trim()) newErrors.postalCode = "Введите почтовый индекс"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // In a real app, you would send the order to the server here
      console.log("Order submitted:", { formData, items: state.items })

      // Clear cart and redirect to success page
      dispatch({ type: "CLEAR_CART" })
      router.push("/success")
    }
  }

  return (
    <div className="container">
      <h1 className={styles.title}>Оформление заказа</h1>

      <div className={styles.checkoutContent}>
        <form className={styles.checkoutForm} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Контактная информация</h2>
            <div className={styles.formGrid}>
              <Input
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <Input
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <Input
                label="Телефон"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Адрес доставки</h2>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input
                  label="Адрес"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  required
                />
              </div>
              <Input
                label="Город"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                required
              />
              <Input
                label="Почтовый индекс"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                error={errors.postalCode}
                required
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Способ доставки</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="standard"
                  checked={formData.deliveryMethod === "standard"}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>Стандартная доставка</div>
                  <div className={styles.radioDescription}>3-5 рабочих дней</div>
                </div>
                <div className={styles.radioPrice}>Бесплатно</div>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="express"
                  checked={formData.deliveryMethod === "express"}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>Экспресс-доставка</div>
                  <div className={styles.radioDescription}>1-2 рабочих дня</div>
                </div>
                <div className={styles.radioPrice}>300 руб.</div>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Способ оплаты</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>Банковская карта</div>
                  <div className={styles.radioDescription}>Visa, MasterCard, Мир</div>
                </div>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === "cash"}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>Наличными при получении</div>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <Link href="/cart">
              <Button variant="outline" size="lg">
                Вернуться в корзину
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg">
              Оформить заказ
            </Button>
          </div>
        </form>

        <div className={styles.orderSummary}>
          <h2 className={styles.summaryTitle}>Ваш заказ</h2>
          <div className={styles.summaryItems}>
            {state.items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.product.name}</span>
                  <span className={styles.itemQuantity}>x{item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>{item.totalPrice} руб.</span>
              </div>
            ))}
          </div>
          <div className={styles.summaryTotals}>
            <div className={styles.summaryRow}>
              <span>Товары ({state.totalItems}):</span>
              <span>{state.totalPrice} руб.</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Доставка:</span>
              <span>{formData.deliveryMethod === "express" ? "300 руб." : "Бесплатно"}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Итого:</span>
              <span>
                {formData.deliveryMethod === "express" ? `${state.totalPrice + 300} руб.` : `${state.totalPrice} руб.`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
