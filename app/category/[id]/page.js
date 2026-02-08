"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabaseClient";
import Catlist from "../../admin_compenents/catlist.jsx";

const MAX_EXTRA_IMAGES = 4;

export default function CategoryProductsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productCurrency, setProductCurrency] = useState("USD");
  const [productCurrencySymbol, setProductCurrencySymbol] = useState("$");

  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const currencies = [
    { code: "USD", symbol: "$", label: "دولار $" },
    { code: "TRY", symbol: "₺", label: "ليرة تركية ₺" },
    { code: "SYP", symbol: "ل.س", label: "ليرة سورية" },
    { code: "EUR", symbol: "€", label: "يورو €" },
  ];

  const getProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", id)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  const getCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  useEffect(() => {
    if (id) getProducts();
    getCategories();
  }, [id]);

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const path = `products/${name}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, file);

    if (error) return null;

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  const addExtraImages = async (files) => {
    const remaining = MAX_EXTRA_IMAGES - extraImages.length;
    for (let file of files.slice(0, remaining)) {
      const url = await uploadImage(file);
      if (url) setExtraImages((p) => [...p, url]);
    }
  };

  const removeExtraImage = (i) =>
    setExtraImages((p) => p.filter((_, x) => x !== i));

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
  };

  const deleteProduct = async (pid) => {
    if (!confirm("متأكد بدك تحذف المنتج؟")) return;
    await supabase.from("products").delete().eq("id", pid);
    getProducts();
  };

  const startEdit = (p) => {
    setEditingProduct(p);
    setProductName(p.name || "");
    setProductPrice(p.price || "");
    setProductDesc(p.description || "");
    setProductCategoryId(p.category_id ?? "");
    setProductCurrency(p.currency || "USD");
    setProductCurrencySymbol(p.currency_symbol || "$");
    setMainImagePreview(p.image_url || null);
    setExtraImages(p.images || []);
  };

  const saveEdit = async () => {
    if (!productName || !productPrice)
      return alert("يرجى إدخال الاسم والسعر");

    setSaving(true);

    let mainUrl = mainImagePreview;

    if (mainImageFile) {
      const uploaded = await uploadImage(mainImageFile);
      if (uploaded) mainUrl = uploaded;
    }

    await supabase
      .from("products")
      .update({
        name: productName,
        price: Number(productPrice),
        description: productDesc,
        category_id: productCategoryId || null,
        currency: productCurrency,
        currency_symbol: productCurrencySymbol,
        image_url: mainUrl,
        images: extraImages,
      })
      .eq("id", editingProduct.id);

    setEditingProduct(null);
    getProducts();
    setSaving(false);
  };

  return (
    <div className="flex justify-between">
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 relative">
            {saving && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full" />
              </div>
            )}

            <h2 className="font-bold mb-4">تعديل المنتج</h2>

            <input
              className="border p-2 w-full mb-2"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="اسم المنتج"
            />

            <input
              className="border p-2 w-full mb-2"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="السعر"
            />

            <select
              className="border p-2 w-full mb-2"
              value={productCurrency}
              onChange={(e) => {
                const c = currencies.find((x) => x.code === e.target.value);
                setProductCurrency(c.code);
                setProductCurrencySymbol(c.symbol);
              }}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              className="border p-2 w-full mb-2"
              value={productCategoryId}
              onChange={(e) => setProductCategoryId(e.target.value)}
            >
              <option value="">بدون قائمة</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <textarea
              className="border p-2 w-full mb-2"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              placeholder="الوصف"
            />

            <input
              type="file"
              className="border p-2 w-full mb-2"
              onChange={(e) => {
                const f = e.target.files[0];
                setMainImageFile(f);
                setMainImagePreview(URL.createObjectURL(f));
              }}
            />

            {mainImagePreview && (
              <div className="relative w-20 mb-2">
                <img src={mainImagePreview} className="w-20 h-20 object-cover" />
                <button
                  onClick={removeMainImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full"
                >
                  ×
                </button>
              </div>
            )}

            <input
              type="file"
              multiple
              className="border p-2 w-full mb-2"
              onChange={(e) => addExtraImages(Array.from(e.target.files))}
            />

            <div className="flex gap-2 mb-2">
              {extraImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} className="w-16 h-16 object-cover" />
                  <button
                    onClick={() => removeExtraImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-4 h-4 rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 bg-green-600 text-white p-1 rounded"
              >
                حفظ
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-gray-400 text-white p-1 rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 w-full">
        <div className="flex justify-between">
            <h1 className="font-bold text-xl mb-4">منتجات القائمة</h1>

            <button
              onClick={() => router.push("/admin")}
              className="mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 cursor-[url(/assets/sym.cur),pointer]"
            >
              ← رجوع لصفحة الأدمن
            </button>
        </div>
       

        {products.length === 0 ? (
          <p>ما في منتجات بهالقائمة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/card_data/${p.id}`)}
                className="border p-3 rounded bg-white cursor-[url(/assets/sym.cur),pointer] hover:shadow-lg transition h-80 relative"
              >
                {p.image_url && (
                  <img
                    src={p.image_url}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}

                <div className="font-bold mt-2">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.price} {p.currency_symbol}
                </div>

                <div
                  className="flex gap-2 mt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 bg-yellow-500 text-white p-1 rounded"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="flex-1 bg-red-600 text-white p-1 rounded"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        
      </div>

      <Catlist />
    </div>
  );
}
