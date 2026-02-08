"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function HomeCategories() {
  const [cats, setCats] = useState([]);
  const router = useRouter();

  // دالة خلط عشوائي
  const shuffleArray = (array) => {
    return [...array]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  };

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        products (*)
      `
      )
      .eq("show_on_home", true);

    if (error) {
      console.error("Error loading categories:", error);
      return;
    }

    // تعديل كل فئة لتعرض فقط 5 منتجات عشوائية
    const updated = (data || []).map((cat) => ({
      ...cat,
      products: shuffleArray(cat.products || []),
    }));

    // preload الصور
    updated.forEach((cat) => {
      cat.products.forEach((p) => {
        const img = new Image();
        img.src = p.image_url;
      });
    });

    setCats(updated);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase.channel("public:home-categories");

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [load]);

  return (
    <div>
      {cats.map((cat) => (
        <div
          key={cat.id}
          className='bg-[url("/assets/productsbg.png")] bg-center shadow-[0_-12px_25px_-4px_#ef4444] flex flex-col justify-center items-center pb-12'
        >
          <h2 className="text-xl font-bold mb-2 text-white text-end mt-2 w-full px-20">
            : {cat.name}
          </h2>

          <div className="grid xl:grid-cols-5 lg:grid-cols-4 grid-cols-2  mx-15 gap-4">
            {cat.products?.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/user_carddata/${p.id}`)}
                className="border p-2 cursor-[url(/assets/sym.cur),pointer] lg:w-55 lg:h-70 md:w-30 md:h-50 sm:w-45 sm:h-60 mb-4 flex flex-col justify-between backdrop-blur-3xl text-white rounded-2xl drop-shadow-2xl drop-shadow-blue-600 zoom3"
              >
                <div>
                  <img
                    src={p.image_url}
                    loading="lazy"
                    decoding="async"
                    className="h-32 w-full object-cover mb-2 drop-shadow-xl drop-shadow-red-600 border-blue-950 border-6 rounded-2xl"
                  />
                </div>

                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-green-400">
                    {p.price} {p.currency_symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
