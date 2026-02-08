"use client";

// مكون عرض قائمة المنتجات
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function ProdctMap() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  // الحصول على مسار الفئة الكامل
  const getCategoryPath = (catId) => {
    if (!catId) return "بدون قائمة";
    let current = categoriesById[catId];
    if (!current) return "بدون قائمة";

    const names = [];
    while (current) {
      names.unshift(current.name);
      current = current.parent_id ? categoriesById[current.parent_id] : null;
    }
    return names.join(" > ");
  };

  // جلب المنتجات مرتبة بآخر إضافة
  const getProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    setProducts(data || []);
  };

  // تنفيذ العمليات بعد التأكد من تسجيل الدخول
  useEffect(() => {
    if (user) {
      getCategories();
      getProducts();
    }
  }, [user]);

  // الاشتراك في تغييرات المنتجات من Supabase ليتم التحديث تلقائياً
  useEffect(() => {
    // إنشاء قناة اشتراك
    const channel = supabase.channel("public:products");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          console.log("products INSERT", payload);
          getProducts();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          console.log("products UPDATE", payload);
          getProducts();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products" },
        (payload) => {
          console.log("products DELETE", payload);
          getProducts();
        }
      );

    channel.subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <div className="mt-4 border-2 border-red-700 p-2 w-1/4 ">
      <h3 className="font-bold mb-2">كل المنتجات</h3>

      {products.length === 0 ? (
        <p>ما في منتجات لسا</p>
      ) : (
              products.map((p) => (
                <div key={p.id} className="border p-3 rounded mb-3">
                  <div className="font-bold">
                    {p.name} — {p.currency_symbol || ""} {p.price}
                  </div>
  
                  <div className="text-sm text-gray-600">
                    القائمة: {getCategoryPath(p.category_id)}
                  </div>
  
                  {p.description && (
                    <div className="text-sm mt-1">{p.description}</div>
                  )}
  
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-32 h-32 object-cover rounded border mt-2"
                    />
                  )}
  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEditProduct(p)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      تعديل
                    </button>
  
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
    )
  }
  


