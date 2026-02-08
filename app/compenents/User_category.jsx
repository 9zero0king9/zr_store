"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";
import Rlist from "../compenents/Rlist.jsx";



export default function User_category() {

      const { id } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [showRlist, setShowRlist] = useState(false)

  // =========================
  // تقسيم المنتجات كل 5 بصف
  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  // =========================
  const getProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", id)
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    setProducts(data || []);
  };

  const getCategory = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .single();

    if (error) return alert(error.message);
    setCategoryName(data?.name || "");
  };

  useEffect(() => {
    if (id) {
      getProducts();
      getCategory();
    }
  }, [id]);

  const productRows = chunkArray(products, 5);

  
  return (
    <div className="flex justify-between  ">
          <div className="flex w-full rounded-2xl m-4">
            <div className="p-6 w-full">
              <div className=" relative flex justify-between border-b-2 border-white mb-6 ">
                    <h1 className="font-bold md:text-xl text-sm text-white ">
                    منتجات قائمة : {categoryName}
                    </h1>
        
                    <button
                    onClick={() => router.push("/")}
                    className="bg-gray-800 text-white rounded  md:h-10   md:w-30 w-16 h-9 text-xs mb-2 cursor-[url(/assets/sym.cur),pointer]"
                    >
                    ←    الصفحة الرئيسية
                    </button>
        
                    <div className='md:hidden'>           
                        <button
                        onClick={() => setShowRlist(!showRlist)}
                        className="bg-blue-600 text-white px-1 rounded  transition h-13 mt-1 mr-4 cursor-[url(/assets/sym.cur),pointer] zoom3"
                        >
                        {showRlist ? 'إخفاء القائمة' : 'عرض القائمة'}
                        </button>
        
                        <div className={`absolute top-fullleft-30 left-28    transition-all duration-200 ease-in-out ${showRlist ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                            <Rlist/>
                        </div> 
                    </div>
            </div>
    
              {products.length === 0 ? (
                <p className="text-white">ما في منتجات بهالقائمة</p>
              ) : (
                productRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-2  xl:grid-cols-5 md:grid-cols-3 gap-4 w-full bg-[url('/assets/productsbg.png')] bg-center bg-cover shadow-[0_-12px_25px_-4px_#ef4444] p-4 rounded-2xl mb-6"
                  >
                    {row.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/user_carddata/${p.id}`)}
                        className="border p-2 cursor-[url(/assets/sym.cur),pointer] lg:w-55 lg:h-70 md:w-30 md:h-50 sm:w-45 sm:h-60 flex flex-col justify-between backdrop-blur-3xl text-white rounded-2xl zoom3"
                      >
                        <div>
                          <img
                            src={p.image_url}
                            loading="lazy"
                            decoding="async"
                            className="h-32 w-full object-cover mb-2 drop-shadow-lg drop-shadow-blue-500 border-blue-950 border-6 rounded-2xl"
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
                ))
              )}
            </div>
          </div>
            <div className="md:block hidden">
                <Rlist />
            </div> 
          </div>    
  )
}

 