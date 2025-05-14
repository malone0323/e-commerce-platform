import type { SofaData, BedData } from "@/shared/api/types"

export interface FavoriteItem {
  id: string
  product: SofaData | BedData
}

export interface FavoritesState {
  items: FavoriteItem[]
  totalItems: number
}

export type FavoritesAction =
  | { type: "ADD_TO_FAVORITES"; payload: FavoriteItem }
  | { type: "REMOVE_FROM_FAVORITES"; payload: string }
  | { type: "CLEAR_FAVORITES" }
