// Общие типы
export interface Price {
  current: number
  old: number | null
  discount: number | null
}

export interface Material {
  name: string
  localizedTitles: {
    ru: string
  }
  type: string
  color: string | null
}

export interface SleepingPlace {
  width: number | null
  length: number | null
}

export interface Delivery {
  available: boolean
  cost: string
  time: string
}

export interface InstallmentPlan {
  bank: string
  installment: {
    duration_months: number
    interest: string
    additional_fees: string
  }
  credit: {
    duration_months: number
    interest: string
  }
}

export interface Promotion {
  type: string | null
  text: string | null
  valid_until: string | null
}

// Типы для диванов
export interface SofaSize {
  width: number
  length: number
  depth: number | null
  height: number | null
  price: number
}

export interface SofaData {
  id: string
  category: string
  subcategory: string
  "subcategory-ru": string
  "category-ru": string
  name: string
  slug: string
  description: string
  seo: {
    title: string
    meta_description: string
    keywords: string[]
  }
  images: string[]
  price: Price
  availability: string
  manufacturing: string
  popularity: number
  sizes: {
    sofa: SofaSize[]
    materials: Material[]
    sleepingPlace: SleepingPlace
    features: string[]
    style: string
    color: string | null
    max_load: number | null
    country: string
    promotion: Promotion
    warranty: string
    delivery: Delivery
    "commercial-offer": string
    installment_plans: InstallmentPlan[]
  }
}

// Типы для кроватей
export interface LiftingMechanism {
  available: boolean
  price: number
}

export interface BedSize {
  width: number
  length: number
  height: number | null
  price: number
  lifting_mechanism: LiftingMechanism[]
}

export interface BedData {
  id: string
  category: string
  subcategory: string
  "subcategory-ru": string
  "category-ru": string
  name: string
  slug: string
  description: string
  seo: {
    title: string
    meta_description: string
    keywords: string[]
  }
  images: string[]
  price: Price
  availability: string
  manufacturing: string
  popularity: number
  bed: BedSize[]
  materials: Material[]
  sleepingPlace: SleepingPlace
  features: string[]
  style: string
  color: string | null
  max_load: number | null
  country: string
  promotion: Promotion
  warranty: string
  delivery: Delivery
  "commercial-offer": string
  installment_plans: InstallmentPlan[]
}

export type ProductData = SofaData | BedData
