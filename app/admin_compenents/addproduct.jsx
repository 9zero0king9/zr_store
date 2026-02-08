"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import { useRouter } from "next/navigation";

const MAX_EXTRA_IMAGES = 4;

export default function AddProduct() {
  const router = useRouter();

  const currencies = [
  { code: "USD", symbol: "$", label: "دولار $" },
  { code: "EUR", symbol: "€", label: "يورو €" },
  { code: "TRY", symbol: "₺", label: "ليرة تركية ₺" },
  { code: "SYP", symbol: "ل.س", label: "ليرة سورية" },
];

const [productCurrency, setProductCurrency] = useState("USD");
const [productCurrencySymbol, setProductCurrencySymbol] = useState("$");


  // ================= STATE =================

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");

  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]);

  const [editingProductId, setEditingProductId] = useState(null);
  const [saving, setSaving] = useState(false);

  // ================= FETCH =================

  const getProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false })
      .limit(4);

    setProducts(data || []);
  };

  const getCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  // ================= REALTIME =================

  useEffect(() => {
    getProducts();
    getCategories();

    const channel = supabase.channel("live-updates");

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        getProducts
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        getCategories
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ================= LEAF CATEGORIES =================

  const leafCategories = useMemo(() => {
    return categories.filter(cat => {
      const hasChildren = categories.some(
        c => c.parent_id === cat.id
      );
      return !hasChildren;
    });
  }, [categories]);

  // ================= IMAGE UPLOAD =================

  const uploadImage = async file => {
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const path = `products/${name}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, file);

    if (error) {
      alert(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const addExtraImages = async files => {
    const remaining = MAX_EXTRA_IMAGES - extraImages.length;

    if (remaining <= 0) return alert("الحد الأقصى 4 صور");

    for (let file of Array.from(files).slice(0, remaining)) {
      const url = await uploadImage(file);
      if (url) setExtraImages(p => [...p, url]);
    }
  };

  const removeExtraImage = i =>
    setExtraImages(p => p.filter((_, x) => x !== i));

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
  };

  // ================= SAVE =================

  const saveProduct = async () => {
    if (!productName || !productPrice)
      return alert("أدخل الاسم والسعر");

    if (!productCategoryId)
      return alert("اختر قائمة");

    setSaving(true);

    let mainUrl = mainImagePreview;

    if (mainImageFile) {
      const uploaded = await uploadImage(mainImageFile);
      if (!uploaded) return setSaving(false);
      mainUrl = uploaded;
    }

    const payload = {
      name: productName,
      price: Number(productPrice),
      description: productDesc,
      category_id: productCategoryId,
      currency: productCurrency,
      currency_symbol: productCurrencySymbol,
      image_url: mainUrl,
      images: extraImages,
    };


    if (editingProductId) {
      await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProductId);
    } else {
      await supabase.from("products").insert([payload]);
    }

    resetForm();
    setSaving(false);
  };

  const resetForm = () => {
    setProductName("");
    setProductPrice("");
    setProductDesc("");
    setProductCategoryId("");
    setMainImageFile(null);
    setMainImagePreview(null);
    setExtraImages([]);
    setEditingProductId(null);

    setProductCurrency("USD");
    setProductCurrencySymbol("$");

  };

  // ================= EDIT / DELETE =================

  const startEdit = p => {
    setProductCurrency(p.currency || "USD");
    setProductCurrencySymbol(p.currency_symbol || "$");
    setEditingProductId(p.id);
    setProductName(p.name || "");
    setProductPrice(p.price || "");
    setProductDesc(p.description || "");
    setProductCategoryId(p.category_id || "");
    setMainImagePreview(p.image_url || null);
    setExtraImages(p.images || []);

  };

  const deleteProduct = async id => {
    if (!confirm("متأكد بدك تحذف المنتج؟")) return;

    await supabase.from("products").delete().eq("id", id);
    getProducts();
  };

  // ================= UI =================

  return (
    <div className="mt-8 border p-4 rounded w-2/3 relative">

      {saving && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      )}

      <h2 className="font-bold text-lg mb-4">
        {editingProductId ? "تعديل منتج" : "إضافة منتج"}
      </h2>

      <input
        placeholder="اسم المنتج"
        className="border p-2 w-full mb-3"
        value={productName}
        onChange={e => setProductName(e.target.value)}
      />

      <input
        placeholder="السعر"
        className="border p-2 w-full mb-3"
        value={productPrice}
        onChange={e => setProductPrice(e.target.value)}
      />

            <select
        className="border p-2 w-full mb-3"
        value={productCurrency}
        onChange={(e) => {
          const c = currencies.find(x => x.code === e.target.value);
          setProductCurrency(c.code);
          setProductCurrencySymbol(c.symbol);
        }}
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>


      <select
        className="border p-2 w-full mb-3"
        value={productCategoryId}
        onChange={e => setProductCategoryId(e.target.value)}
      >
        <option value="">اختر قائمة</option>
        {leafCategories.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        placeholder="الوصف"
        className="border p-2 w-full mb-3"
        value={productDesc}
        onChange={e => setProductDesc(e.target.value)}
      />

      {/* MAIN IMAGE */}

      <input
        type="file"
        className="border p-2 w-full mb-3"
        onChange={e => {
          const f = e.target.files[0];
          if (!f) return;
          setMainImageFile(f);
          setMainImagePreview(URL.createObjectURL(f));
        }}
      />

      {mainImagePreview && (
        <div className="relative w-32 mb-4">
          <img src={mainImagePreview} className="rounded border" />
          <button
            onClick={removeMainImage}
            className="absolute top-0 right-0 bg-red-600 text-white px-2"
          >
            X
          </button>
        </div>
      )}

      {/* EXTRA IMAGES */}

      <input
        type="file"
        multiple
        className="border p-2 w-full mb-3"
        onChange={e => addExtraImages(e.target.files)}
      />

      <div className="flex gap-2 flex-wrap mb-4">
        {extraImages.map((img, i) => (
          <div key={i} className="relative w-20">
            <img src={img} className="rounded border w-20 h-20" />
            <button
              onClick={() => removeExtraImage(i)}
              className="absolute top-0 right-0 bg-red-600 text-white px-1"
            > 
              X
            </button>
          </div>
        ))} 
      </div>  

      <button
        onClick={saveProduct}
        className="bg-green-600 text-white p-2 w-full rounded"
      >
        حفظ المنتج
      </button>

      {/* LAST PRODUCTS */}

      <div className="mt-8 flex gap-4">
        {products.map(p => (
          <div
            key={p.id}
            onClick={() => router.push(`/card_data/${p.id}`)}
            className="border p-2 cursor-pointer w-44"
          >
            <img src={p.image_url} className="h-32 w-full object-cover" />

            <div>{p.name}</div>
            <div>{p.price}</div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  startEdit(p);
                }}
                className="bg-yellow-500 text-white text-xs w-full"
              >
                تعديل
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteProduct(p.id);
                }}
                className="bg-red-600 text-white text-xs w-full"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
