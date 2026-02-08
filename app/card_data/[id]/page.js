"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabaseClient";

/* =========================
   EDIT MODAL (COMPACT)
========================= */
function EditModal({ product, onClose, onSaved }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [desc, setDesc] = useState(product.description || "");

  const [currency, setCurrency] = useState(product.currency);
  const [currencySymbol, setCurrencySymbol] =
    useState(product.currency_symbol);

  const [mainImage, setMainImage] = useState(product.image_url);
  const [mainImageFile, setMainImageFile] = useState(null);

  const [extraImages, setExtraImages] = useState(product.images || []);
  const [extraFiles, setExtraFiles] = useState([]);

  const [saving, setSaving] = useState(false);

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}-${Math.random()}.${ext}`;
    const path = `products/${name}`;
    await supabase.storage.from("products").upload(path, file);
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    setSaving(true);

    let finalMain = mainImage;
    if (mainImageFile) {
      finalMain = await uploadImage(mainImageFile);
    }

    let finalExtras = [...extraImages];
    for (let f of extraFiles) {
      if (finalExtras.length >= 4) break;
      finalExtras.push(await uploadImage(f));
    }

    await supabase
      .from("products")
      .update({
        name,
        price: Number(price),
        description: desc,
        currency,
        currency_symbol: currencySymbol,
        image_url: finalMain,
        images: finalExtras,
      })
      .eq("id", product.id);

    onSaved({
      ...product,
      name,
      price,
      description: desc,
      currency,
      currency_symbol: currencySymbol,
      image_url: finalMain,
      images: finalExtras,
    });

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-5">
        <h2 className="font-bold text-lg mb-4">✏️ تعديل المنتج</h2>

        <label className="text-sm">اسم المنتج</label>
        <input
          className="border p-1 w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="text-sm">السعر</label>
        <input
          className="border p-1 w-full mb-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <label className="text-sm">العملة</label>
        <select
          className="border p-1 w-full mb-3"
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
            setCurrencySymbol(
              e.target.value === "USD"
                ? "$"
                : e.target.value === "TRY"
                ? "₺"
                : e.target.value === "EUR"
                ? "€"
                : "ل.س"
            );
          }}
        >
          <option value="USD">دولار $</option>
          <option value="TRY">ليرة تركية ₺</option>
          <option value="EUR">يورو €</option>
          <option value="SYP">ليرة سورية</option>
        </select>

        <label className="text-sm">الوصف</label>
        <textarea
          className="border p-1 w-full mb-3"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <label className="text-sm">صورة الغلاف</label>
        {mainImage && (
          <div className="relative w-32 mb-2">
            <img
              src={mainImage}
              className="w-32 h-32 object-cover rounded border"
            />
            <button
              onClick={() => setMainImage(null)}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded"
            >
              ✕
            </button>
          </div>
        )}
        <input
          type="file"
          onChange={(e) => setMainImageFile(e.target.files[0])}
          className="border mb-3"
        />

        <label className="text-sm">صور إضافية</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {extraImages.map((img, i) => (
            <div key={i} className="relative">
              <img
                src={img}
                className="w-20 h-20 object-cover rounded border"
              />
              <button
                onClick={() =>
                  setExtraImages(extraImages.filter((_, x) => x !== i))
                }
                className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => setExtraFiles(Array.from(e.target.files))}
          className="border mb-3"
        />

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-green-600 text-white p-2 rounded w-full"
          >
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 p-2 rounded w-full"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default function CardData() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  const getProduct = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    setProduct(data);
  };

  useEffect(() => {
    if (id) getProduct();
  }, [id]);

  if (!product) return <p className="p-6">جاري التحميل...</p>;

  const images = [product.image_url, ...(product.images || [])].filter(Boolean);

  const deleteProduct = async () => {
    if (!confirm("متأكد بدك تحذف المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    router.back();
  };

  return (
    <>
      {/* BREADCRUMB */}
      <div className="max-w-5xl mx-auto px-6 mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          الرئيسية / المنتجات /{" "}
          <span className="font-semibold text-black">
            {product.name}
          </span>
        </div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← رجوع
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 mt-4 border">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={images[activeImage]}
              className="w-full h-96 object-cover rounded mb-4 border"
            />
            <div className="flex gap-2 border p-2">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 cursor-pointer border ${
                    activeImage === i
                      ? "border-green-600"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="">
            <h1 className="text-2xl font-bold mb-2 border p-2 flex justify-between">
              {product.name}
              <h1 className="font-normal text-lg"> : اسم المنتج </h1>
            </h1>
            <div className="text-xl text-green-600 mb-4 border p-2 border-black flex justify-between">
              <div> {product.price} {product.currency_symbol} </div>
              <h1 className="text-lg"> : سعر المنتج </h1>
              
            </div>
            <p className="text-end mb-1"> :  وصف المنتج </p>
            <p className="border p-2 mb-4">
              {product.description}
            </p>

            <div className="flex gap-3 justify-center pt-65">
              <button
                onClick={() => setShowEdit(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                تعديل
              </button>
              <button
                onClick={deleteProduct}
                className="bg-red-600 text-white px-4 py-2 rounded "
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={(p) => {
            setProduct(p);
            setActiveImage(0);
          }}
        />
      )}
    </>
  );
}
