"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Button from "@/shared/ui/button/Button"
import Input from "@/shared/ui/input/Input"
import { useCart } from "@/entities/cart/model/cartContext"
import styles from "./page.module.css"

// Mock promo codes for demonstration
const PROMO_CODES = {
  МЕБЕЛЬ15: { discount: 0.15, description: "Скидка 15% на весь заказ" },
  ДИВАН10: { discount: 0.1, description: "Скидка 10% на весь заказ" },
  ДОСТАВКА: { discount: 0, freeShipping: true, description: "Бесплатная доставка" },
}

// Delivery methods
const DELIVERY_METHODS = [
  { id: "courier", name: "Курьерская доставка", price: 300 },
  { id: "pickup", name: "Самовывоз", price: 0 },
  { id: "express", name: "Экспресс-доставка (1-2 дня)", price: 500 },
]

// Payment methods
const PAYMENT_METHODS = [
  { id: "cash", name: "Наличными при получении" },
  { id: "card", name: "Банковской картой" },
  { id: "online", name: "Онлайн на сайте" },
  { id: "installment", name: "Рассрочка" },
  { id: "credit", name: "Кредит" },
]

// Social media options
const SOCIAL_MEDIA = [
  { id: "telegram", name: "Telegram" },
  { id: "viber", name: "Viber" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "vk", name: "ВКонтакте" },
]

export default function CartPage() {
  const router = useRouter()
  const { state, dispatch } = useCart()
  const [isClient, setIsClient] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null)
  const [shippingCost, setShippingCost] = useState(300) // Default shipping cost
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    deliveryMethod: "courier",
    address: "",
    city: "",
    socialMedia: "telegram",
    socialMediaUsername: "",
    paymentMethod: "card",
  })

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const cartIsEmpty = state.items.length === 0

  const handleRemoveItem = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id })
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const handleClearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    setAppliedPromo(null)
    setShippingCost(300)
  }

  const handleApplyPromoCode = () => {
    // Reset messages
    setPromoError(null)
    setPromoSuccess(null)

    if (!promoCode.trim()) {
      setPromoError("Введите промокод")
      return
    }

    const normalizedCode = promoCode.trim().toUpperCase()

    if (normalizedCode in PROMO_CODES) {
      setAppliedPromo(normalizedCode)
      setPromoCode("")
      setPromoSuccess(`Промокод ${normalizedCode} успешно применен!`)

      // Apply free shipping if applicable
      if (PROMO_CODES[normalizedCode as keyof typeof PROMO_CODES].freeShipping) {
        setShippingCost(0)
      }
    } else {
      setPromoError("Недействительный промокод")
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromo(null)
    setShippingCost(300) // Reset shipping cost
    setPromoSuccess(null)
  }

  const handleProceedToCheckout = () => {
    setShowCheckoutForm(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Update shipping cost when delivery method changes
    if (name === "deliveryMethod") {
      const selectedMethod = DELIVERY_METHODS.find((method) => method.id === value)
      if (selectedMethod && !appliedPromo) {
        setShippingCost(selectedMethod.price)
      }
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Пожалуйста, введите ФИО"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Пожалуйста, введите номер телефона"
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s+/g, ""))) {
      errors.phone = "Пожалуйста, введите корректный номер телефона"
    }

    if (formData.deliveryMethod !== "pickup" && !formData.address.trim()) {
      errors.address = "Пожалуйста, введите адрес доставки"
    }

    if (formData.deliveryMethod !== "pickup" && !formData.city.trim()) {
      errors.city = "Пожалуйста, введите город"
    }

    if (!formData.socialMediaUsername.trim()) {
      errors.socialMediaUsername = "Пожалуйста, введите имя пользователя"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Show success message
    setOrderSuccess(true)

    // Clear cart after 2 seconds and redirect to success page
    setTimeout(() => {
      dispatch({ type: "CLEAR_CART" })
      router.push("/success")
    }, 2000)
  }

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedPromo) return 0

    const promoInfo = PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES]
    if (promoInfo.discount) {
      return Math.round(state.totalPrice * promoInfo.discount)
    }
    return 0
  }

  // Calculate final total
  const getFinalTotal = () => {
    const discount = getDiscountAmount()
    return (
      state.totalPrice -
      discount +
      (appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].freeShipping ? 0 : shippingCost)
    )
  }

  if (orderSuccess) {
    return (
      <div className="container">
        <div className={styles.orderSuccess}>
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
          <h2 className={styles.successTitle}>Заказ успешно оформлен!</h2>
          <p className={styles.successMessage}>Перенаправление на страницу подтверждения...</p>
          <div className={styles.loader}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className={styles.title}>Корзина</h1>

      {cartIsEmpty ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.emptyCartTitle}>Ваша корзина пуста</h2>
          <p className={styles.emptyCartText}>Добавьте товары в корзину, чтобы оформить заказ</p>
          <Link href="/catalog">
            <Button size="lg">Перейти в каталог</Button>
          </Link>
        </div>
      ) : showCheckoutForm ? (
        <div className={styles.checkoutContainer}>
          <div className={styles.checkoutForm}>
            <h2 className={styles.checkoutTitle}>Оформление заказа</h2>
            <form onSubmit={handleSubmitOrder}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Контактная информация</h3>
                <div className={styles.formGroup}>
                  <Input
                    label="ФИО"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={formErrors.fullName}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <Input
                    label="Номер телефона"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={formErrors.phone}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.selectLabel}>Социальная сеть для связи</label>
                  <div className={styles.socialMediaInputs}>
                    <select
                      name="socialMedia"
                      value={formData.socialMedia}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      {SOCIAL_MEDIA.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder={`Имя пользователя в ${
                        SOCIAL_MEDIA.find((sm) => sm.id === formData.socialMedia)?.name
                      }`}
                      name="socialMediaUsername"
                      value={formData.socialMediaUsername}
                      onChange={handleInputChange}
                      error={formErrors.socialMediaUsername}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Способ доставки</h3>
                <div className={styles.deliveryOptions}>
                  {DELIVERY_METHODS.map((method) => (
                    <label key={method.id} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={method.id}
                        checked={formData.deliveryMethod === method.id}
                        onChange={handleInputChange}
                      />
                      <div className={styles.radioContent}>
                        <div className={styles.radioTitle}>{method.name}</div>
                        <div className={styles.radioPrice}>
                          {method.price === 0 ? "Бесплатно" : `${method.price} руб.`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formData.deliveryMethod !== "pickup" && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Адрес доставки</h3>
                  <div className={styles.formGroup}>
                    <Input
                      label="Город"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      error={formErrors.city}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <Input
                      label="Адрес"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      error={formErrors.address}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Способ оплаты</h3>
                <div className={styles.paymentOptions}>
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.id} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                      />
                      <div className={styles.radioContent}>
                        <div className={styles.radioTitle}>{method.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckoutForm(false)}
                  className={styles.backButton}
                >
                  Назад к корзине
                </Button>
                <Button type="submit" variant="primary" className={styles.submitButton}>
                  Оформить заказ
                </Button>
              </div>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>Ваш заказ</h3>
            <div className={styles.summaryItems}>
              {state.items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemInfo}>
                    <span className={styles.summaryItemName}>{item.product.name}</span>
                    <span className={styles.summaryItemQuantity}>x{item.quantity}</span>
                  </div>
                  <span className={styles.summaryItemPrice}>{item.totalPrice} руб.</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Товары ({state.totalItems}):</span>
                <span>{state.totalPrice} руб.</span>
              </div>

              {appliedPromo && getDiscountAmount() > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Скидка по промокоду:</span>
                  <span>-{getDiscountAmount()} руб.</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Доставка:</span>
                <span>
                  {appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].freeShipping ? (
                    <span className={styles.freeShipping}>Бесплатно</span>
                  ) : (
                    `${shippingCost} руб.`
                  )}
                </span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>К оплате:</span>
                <span>{getFinalTotal()} руб.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <h2 className={styles.cartSectionTitle}>Товары в корзине</h2>
              <button className={styles.clearCartButton} onClick={handleClearCart}>
                Очистить корзину
              </button>
            </div>

            {state.items.map((item) => {
              const isBed = "bed" in item.product
              const category = isBed ? "bed" : "sofa"
              const productUrl = `/products/${category}/${item.product.slug}`

              // Get size info
              const sizeInfo = isBed
                ? item.product.bed[item.selectedSize || 0]
                : "sizes" in item.product
                  ? item.product.sizes.sofa[item.selectedSize || 0]
                  : null

              const sizeText = sizeInfo ? `${sizeInfo.width}x${sizeInfo.length} см` : ""

              // Get mechanism info for beds
              const mechanismText =
                isBed && item.withMechanism && item.selectedSize !== null
                  ? `, с подъемным механизмом (+${item.product.bed[item.selectedSize].lifting_mechanism[1].price} руб.)`
                  : ""

              return (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <Link href={productUrl}>
                      <Image
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        width={120}
                        height={120}
                        className={styles.image}
                      />
                    </Link>
                  </div>
                  <div className={styles.itemInfo}>
                    <Link href={productUrl} className={styles.itemName}>
                      {item.product.name}
                    </Link>
                    <div className={styles.itemOptions}>
                      {sizeText}
                      {mechanismText}
                    </div>
                  </div>
                  <div className={styles.itemQuantity}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.itemPrice}>
                    <span className={styles.price}>{item.totalPrice} руб.</span>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Удалить товар"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Итого</h2>
            </div>

            <div className={styles.promoCodeSection}>
              <h3 className={styles.promoTitle}>Промокод</h3>
              {!appliedPromo ? (
                <>
                  <div className={styles.promoCodeInput}>
                    <Input
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      error={promoError || undefined}
                    />
                    <Button variant="outline" onClick={handleApplyPromoCode} className={styles.applyPromoButton}>
                      Применить
                    </Button>
                  </div>
                  {promoSuccess && <div className={styles.promoSuccess}>{promoSuccess}</div>}
                </>
              ) : (
                <div className={styles.appliedPromo}>
                  <div className={styles.appliedPromoInfo}>
                    <span className={styles.appliedPromoCode}>{appliedPromo}</span>
                    <span className={styles.appliedPromoDescription}>
                      {PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].description}
                    </span>
                  </div>
                  <button
                    className={styles.removePromoButton}
                    onClick={handleRemovePromoCode}
                    aria-label="Удалить промокод"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Товары ({state.totalItems}):</span>
                <span className={styles.summaryValue}>{state.totalPrice} руб.</span>
              </div>

              {appliedPromo && getDiscountAmount() > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span className={styles.summaryLabel}>Скидка по промокоду:</span>
                  <span className={styles.summaryValue}>-{getDiscountAmount()} руб.</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Доставка:</span>
                <span className={styles.summaryValue}>
                  {appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].freeShipping ? (
                    <span className={styles.freeShipping}>Бесплатно</span>
                  ) : (
                    `${shippingCost} руб.`
                  )}
                </span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span className={styles.summaryLabel}>К оплате:</span>
                <span className={styles.summaryValue}>{getFinalTotal()} руб.</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className={styles.checkoutButton}
                onClick={handleProceedToCheckout}
              >
                Перейти к оформлению
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
