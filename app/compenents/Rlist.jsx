"use client";

// مكون عرض شجرة الفئات (القوائم)
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function CategorySidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // قائمة الفئات
  const [categories, setCategories] = useState([]);
  // حالة فتح/إغلاق الفئات الفرعية
  const [openCats, setOpenCats] = useState({});



  // =========================
  // جلب الفئات من قاعدة البيانات
  // =========================
  const getCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    setCategories(data || []);
  };

  // جلب الفئات عند التحميل والاستماع للتحديثات
  useEffect(() => {
    getCategories();

    const handler = () => getCategories();
    window.addEventListener("categories-updated", handler);
    return () =>
      window.removeEventListener("categories-updated", handler);
  }, []);

  // =========================
  // تنظيم الفئات في خريطة حسب الأب
  // =========================
  const categoriesByParent = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      const parent = c.parent_id || "root";
      if (!map[parent]) map[parent] = [];
      map[parent].push(c);
    });
    return map;
  }, [categories]);

  // =========================
  // دوال مساعدة
  // =========================
  // تبديل حالة فتح/إغلاق فئة
  const toggleCat = (id) => {
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // الانتقال إلى صفحة الفئة
  const goToCategory = (id) => {
    router.push(`/user_category/${id}`);
  };



  // =========================
  // عرض شجرة الفئات
  // =========================
  const renderCategories = (parentId = "root", level = 0) =>
    (categoriesByParent[parentId] || []).map((cat) => {
      const hasChildren = categoriesByParent[cat.id]?.length > 0;
      const active = pathname === `/category/${cat.id}`;

      return (
        <div key={cat.id} >
          <div
            className={`flex items-center justify-between p-2 rounded z-50 
 
              ${active ? "  font-bold" : 'hover:text-blue-500 '}
            `}
           >
            <div
              className='flex gap-2 flex-1 zoom3 justify-between cursor-[url(/assets/sym.cur),pointer]'
              onClick={() =>
                hasChildren ? toggleCat(cat.id) : goToCategory(cat.id)
              }
            >
              <span className="text-center md:text-end  w-full mr-4">{cat.name}</span>
              {hasChildren && (
                <span className="text-lg 
                 border rounded-2xl px-2 ">
                  {openCats[cat.id] ? "−" : <p className=" animate-bounce">↓</p>}
                </span>
              )} 
            </div>


          </div>

          {hasChildren && openCats[cat.id] && (
            <div >{renderCategories(cat.id, level + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <>
      <aside className="w-47 md:w-52 xl:w-60 overflow-x-hidden border-l backdrop-blur-3xl   shadow-2xl shadow-red-500 rounded-2xl text-white drop-shadow-2xl drop-shadow-blue-900 p-4 sticky top-0 z-50 h-screen overflow-y-auto">
        <h2 className="font-bold mb-4 text-center md:text-end">  : الأقسام</h2>
        {renderCategories()}
      </aside>

      
   

     
    
    </>
  );
}
