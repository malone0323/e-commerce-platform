"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Button from "@/shared/ui/button/Button"
import { useFavorites } from "@/entities/favorites/model/favoritesContext"
import ProductCard from "@/entities/product/ui/ProductCard"
import styles from "./page.module.css"

type SortOption = "date-newest" | "date-oldest" | "price-low" | "price-high" | "name-asc" | "name-desc"

export default function FavoritesPage() {
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const [isClient, setIsClient] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("date-newest")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const favoritesIsEmpty = favoritesState.items.length === 0

  // Sort favorites based on selected option
  const sortedFavorites = [...favoritesState.items].sort((a, b) => {
    switch (sortOption) {
      case "date-newest":
        // Newest items are already at the beginning of the array
        return 0
      case "date-oldest":
        // Reverse the array to get oldest first
        return 1
      case "price-low":
        return a.product.price.current - b.product.price.current
      case "price-high":
        return b.product.price.current - a.product.price.current
      case "name-asc":
        return a.product.name.localeCompare(b.product.name)
      case "name-desc":
        return b.product.name.localeCompare(a.product.name)
      default:
        return 0
    }
  })

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption)
  }

  const handleRemoveSelected = () => {
    selectedItems.forEach((id) => {
      favoritesDispatch({ type: "REMOVE_FROM_FAVORITES", payload: id })
    })
    setSelectedItems([])
    setIsSelectMode(false)
  }

  const handleRemoveAll = () => {
    if (window.confirm("Вы уверены, что хотите удалить все товары из избранного?")) {
      favoritesDispatch({ type: "CLEAR_FAVORITES" })
      setSelectedItems([])
      setIsSelectMode(false)
    }
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedItems([])
  }

  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const selectAll = () => {
    if (selectedItems.length === favoritesState.items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(favoritesState.items.map((item) => item.id))
    }
  }

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Избранное</h1>
        <div className={styles.favoriteStats}>
          <span className={styles.favoriteCount}>{favoritesState.totalItems} товаров</span>
        </div>
      </div>

      {favoritesIsEmpty ? (
        <div className={styles.emptyFavorites}>
          <div className={styles.emptyFavoritesIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h2 className={styles.emptyFavoritesTitle}>У вас нет избранных товаров</h2>
          <p className={styles.emptyFavoritesText}>Добавьте товары в избранное, чтобы вернуться к ним позже</p>
          <Link href="/catalog">
            <Button size="lg">Перейти в каталог</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.favoritesContent}>
          <div className={styles.controlsBar}>
            <div className={styles.controlsLeft}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewButton} ${viewMode === "grid" ? styles.active : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Отображение сеткой"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === "list" ? styles.active : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="Отображение списком"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 6H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 12H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 18H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 6H3.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 12H3.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 18H3.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.sortContainer}>
                <label htmlFor="sort-select" className={styles.sortLabel}>
                  Сортировать:
                </label>
                <div className={styles.selectWrapper}>
                  <select id="sort-select" className={styles.sortSelect} value={sortOption} onChange={handleSortChange}>
                    <option value="date-newest">По дате добавления (сначала новые)</option>
                    <option value="date-oldest">По дате добавления (сначала старые)</option>
                    <option value="price-low">По цене (сначала дешевые)</option>
                    <option value="price-high">По цене (сначала дорогие)</option>
                    <option value="name-asc">По названию (А-Я)</option>
                    <option value="name-desc">По названию (Я-А)</option>
                  </select>
                  <div className={styles.selectArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlsRight}>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectMode}
                className={`${styles.selectButton} ${isSelectMode ? styles.active : ""}`}
              >
                {isSelectMode ? "Отменить выбор" : "Выбрать товары"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRemoveAll} className={styles.clearButton}>
                Очистить все
              </Button>
            </div>
          </div>

          {isSelectMode && (
            <div className={styles.selectionBar}>
              <div className={styles.selectionInfo}>
                <label className={styles.selectAllLabel}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length > 0 && selectedItems.length === favoritesState.items.length}
                    onChange={selectAll}
                    className={styles.selectAllCheckbox}
                  />
                  <span>Выбрать все</span>
                </label>
                <span className={styles.selectedCount}>
                  Выбрано: {selectedItems.length} из {favoritesState.totalItems}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRemoveSelected}
                disabled={selectedItems.length === 0}
                className={styles.removeSelectedButton}
              >
                Удалить выбранные
              </Button>
            </div>
          )}

          <AnimatePresence>
            <motion.div
              className={`${styles.favoritesList} ${viewMode === "list" ? styles.listView : styles.gridView}`}
              layout
            >
              {sortedFavorites.map((item) => (
                <motion.div
                  key={item.id}
                  className={`${styles.favoriteItem} ${isSelectMode ? styles.selectMode : ""} ${selectedItems.includes(item.id) ? styles.selected : ""}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSelectMode && (
                    <div className={styles.selectOverlay} onClick={() => toggleItemSelection(item.id)}>
                      <div className={`${styles.checkbox} ${selectedItems.includes(item.id) ? styles.checked : ""}`}>
                        {selectedItems.includes(item.id) && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  <ProductCard product={item.product} showOptions={true} />
                  {viewMode === "list" && (
                    <button
                      className={styles.quickRemoveButton}
                      onClick={() => favoritesDispatch({ type: "REMOVE_FROM_FAVORITES", payload: item.id })}
                      aria-label="Удалить из избранного"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
