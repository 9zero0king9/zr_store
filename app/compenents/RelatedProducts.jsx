"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function RelatedProducts({ categoryId, currentProductId }) {
  const router = useRouter();
  const [relatedProducts, setRelatedProducts] = useState([]);

  const shuffleArray = (array) => {
    return [...array]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  };

  useEffect(() => {
    const getRelated = async () => {
      if (!categoryId) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .neq("id", currentProductId);

      if (error) {
        console.error(error);
        return;
      }

      const randomFive = shuffleArray(data || []);

      // preload الصور
      randomFive.forEach((p) => {
        const img = new Image();
        img.src = p.image_url;
      });

      setRelatedProducts(randomFive);
    };

    getRelated();
  }, [categoryId, currentProductId]);

  if (!relatedProducts.length) return null;

  return (
    <div className='bg-[url("/assets/productsbg.png")] bg-center shadow-[0_-12px_25px_-4px_#ef4444] flex flex-col justify-center items-center pb-12'>
      <h3 className="text-xl text-white font-bold w-full text-end px-10 mt-2">
        : من نفس الفئة
      </h3>

      <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2 mx-15 gap-4">
        {relatedProducts.map((p) => (
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
  );
}
