import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingItem {
  id: string;
  category_id: string;
  name: string;
  unit: string;
  rate: number;
  vendor: string | null;
}

export interface PricingCategory {
  id: string;
  name: string;
}

export const usePricing = (categoryName?: string) => {
  return useQuery({
    queryKey: ["live-pricing", categoryName ?? "all"],
    queryFn: async () => {
      let categoryId: string | null = null;
      if (categoryName) {
        const { data: cat } = await supabase.from("pricing_categories").select("*").eq("name", categoryName).maybeSingle();
        categoryId = cat?.id ?? null;
      }
      let q = supabase.from("pricing_items").select("*").order("name");
      if (categoryId) q = q.eq("category_id", categoryId);
      const { data } = await q;
      return (data ?? []) as PricingItem[];
    },
  });
};
