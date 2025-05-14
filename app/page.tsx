import { getPopularProducts } from "@/shared/api/api"
import HeroSection from "@/widgets/hero-section/ui/HeroSection"
import PopularProducts from "@/widgets/popular-products/ui/PopularProducts"
import Categories from "@/widgets/categories/ui/Categories"
import PromoSection from "@/widgets/promo-section/ui/PromoSection"
import Reviews from "@/widgets/reviews/ui/Reviews"
import RecentlyViewed from "@/widgets/recently-viewed/ui/RecentlyViewed"

export default async function HomePage() {
  const popularProducts = await getPopularProducts(12)

  return (
    <>
      <HeroSection />
      <Categories />
      <PopularProducts products={popularProducts} />
      <PromoSection />
      <Reviews />
      <RecentlyViewed />
    </>
  )
}
