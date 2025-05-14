"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/entities/product/ui/ProductCard"
import Button from "@/shared/ui/button/Button"
import Input from "@/shared/ui/input/Input"
import { getProductsByFilters, getPriceRange, getSortedProducts } from "@/shared/api/api"
import type { SofaData, BedData } from "@/shared/api/types"
import styles from "./page.module.css"

export default function CatalogPage() {
  const searchParams = useSearchParams()

  // Get initial filter values from URL
  const initialCategory = searchParams.get("category") || "all"
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
  const initialSortBy = searchParams.get("sort") || "popularity"

  // State for products and filters
  const [products, setProducts] = useState<(SofaData | BedData)[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 })
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filteredCount, setFilteredCount] = useState<number>(0)

  const filterDrawerRef = useRef<HTMLDivElement>(null)
  const filterOverlayRef = useRef<HTMLDivElement>(null)

  // Load products and filter options
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Get price range
        const range = await getPriceRange()
        setPriceRange(range)

        // Set default price range if not specified in URL
        if (minPrice === undefined) setMinPrice(range.min)
        if (maxPrice === undefined) setMaxPrice(range.max)

        // Load products with filters
        let filteredProducts = await getProductsByFilters({
          category: activeCategory,
          minPrice: minPrice || range.min,
          maxPrice: maxPrice || range.max,
        })

        // Sort products
        filteredProducts = await getSortedProducts(filteredProducts, sortBy)

        setProducts(filteredProducts)
        setFilteredCount(filteredProducts.length)
      } catch (error) {
        console.error("Error loading catalog data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeCategory, minPrice, maxPrice, sortBy])

  // Update URL with filters without navigating away
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Update or remove category parameter
    if (activeCategory !== "all") {
      params.set("category", activeCategory)
    } else {
      params.delete("category")
    }

    // Update or remove price parameters
    if (minPrice !== undefined && minPrice !== priceRange.min) {
      params.set("minPrice", minPrice.toString())
    } else {
      params.delete("minPrice")
    }

    if (maxPrice !== undefined && maxPrice !== priceRange.max) {
      params.set("maxPrice", maxPrice.toString())
    } else {
      params.delete("maxPrice")
    }

    // Update or remove sort parameter
    if (sortBy !== "popularity") {
      params.set("sort", sortBy)
    } else {
      params.delete("sort")
    }

    // Update URL without refreshing the page using history API
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, "", newUrl)
  }, [activeCategory, minPrice, maxPrice, priceRange, sortBy])

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFiltersOpen &&
        filterDrawerRef.current &&
        filterOverlayRef.current &&
        event.target === filterOverlayRef.current
      ) {
        setIsFiltersOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isFiltersOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isFiltersOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isFiltersOpen])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    // Don't close filters immediately
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setMinPrice(value)
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setMaxPrice(value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  const handleResetFilters = () => {
    setActiveCategory("all")
    setMinPrice(priceRange.min)
    setMaxPrice(priceRange.max)
    setSortBy("popularity")
    setIsFiltersOpen(false)
  }

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }

  const calculateFilteredCount = async () => {
    try {
      const filteredProducts = await getProductsByFilters({
        category: activeCategory,
        minPrice: minPrice || priceRange.min,
        maxPrice: maxPrice || priceRange.max,
      })
      setFilteredCount(filteredProducts.length)
    } catch (error) {
      console.error("Error calculating filtered count:", error)
      setFilteredCount(0)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateFilteredCount()
    }, 300) // Debounce to avoid too many API calls

    return () => clearTimeout(timer)
  }, [activeCategory, minPrice, maxPrice])

  return (
    <div className="container">
      <div className={styles.catalogHeader}>
        <h1 className={styles.title}>Каталог мебели</h1>
        <div className={styles.headerActions}>
          <button className={styles.filterToggle} onClick={toggleFilters}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 6H21M10 12H21M17 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Фильтры
          </button>
          <div className={styles.sortContainer}>
            <label htmlFor="sort-select" className={styles.sortLabel}>
              Сортировать:
            </label>
            <select id="sort-select" className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
              <option value="popularity">По популярности</option>
              <option value="price-asc">По возрастанию цены</option>
              <option value="price-desc">По убыванию цены</option>
              <option value="name-asc">По названию (А-Я)</option>
              <option value="name-desc">По названию (Я-А)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      <div
        ref={filterOverlayRef}
        className={`${styles.filterOverlay} ${isFiltersOpen ? styles.active : ""}`}
        onClick={() => setIsFiltersOpen(false)}
      ></div>

      {/* Filter Drawer */}
      <div ref={filterDrawerRef} className={`${styles.filterDrawer} ${isFiltersOpen ? styles.active : ""}`}>
        <div className={styles.filterDrawerHeader}>
          <h2 className={styles.filterDrawerTitle}>Фильтры</h2>
          <button
            className={styles.closeFilterButton}
            onClick={() => setIsFiltersOpen(false)}
            aria-label="Закрыть фильтры"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className={styles.filterDrawerContent}>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Категории</h3>
            <div className={styles.categoryButtons}>
              <button
                className={`${styles.categoryButton} ${activeCategory === "all" ? styles.active : ""}`}
                onClick={() => handleCategoryChange("all")}
              >
                Все
              </button>
              <button
                className={`${styles.categoryButton} ${activeCategory === "sofa" ? styles.active : ""}`}
                onClick={() => handleCategoryChange("sofa")}
              >
                Диваны
              </button>
              <button
                className={`${styles.categoryButton} ${activeCategory === "bed" ? styles.active : ""}`}
                onClick={() => handleCategoryChange("bed")}
              >
                Кровати
              </button>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Цена</h3>
            <div className={styles.priceInputs}>
              <Input
                type="number"
                placeholder="От"
                className={styles.priceInput}
                value={minPrice?.toString() || ""}
                onChange={handleMinPriceChange}
                min={priceRange.min}
                max={maxPrice || priceRange.max}
              />
              <span className={styles.priceDivider}>-</span>
              <Input
                type="number"
                placeholder="До"
                className={styles.priceInput}
                value={maxPrice?.toString() || ""}
                onChange={handleMaxPriceChange}
                min={minPrice || priceRange.min}
                max={priceRange.max}
              />
            </div>
          </div>

          <div className={styles.filterActions}>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className={styles.resetButton}>
              Сбросить фильтры
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsFiltersOpen(false)} className={styles.applyButton}>
              Применить ({filteredCount})
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.catalogLayout}>
        <div className={styles.productsSection}>
          <div className={styles.resultsInfo}>
            {!loading && <span className={styles.resultsCount}>Найдено товаров: {products.length}</span>}
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Загрузка товаров...</p>
            </div>
          ) : products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showOptions={true} />
              ))}
            </div>
          ) : (
            <div className={styles.noProducts}>
              <p>По вашему запросу ничего не найдено.</p>
              <p>Попробуйте изменить параметры фильтрации.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
