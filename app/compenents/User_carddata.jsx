    "use client";

    import { useEffect, useState } from "react";
    import { useParams, useRouter } from "next/navigation";
    import { supabase } from "../../src/lib/supabaseClient";
    import Navbar from "./navbar";

    export default function UserCarsData({ onProductLoad }) {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [enlargedImage, setEnlargedImage] = useState(null);

    // ======================
    // GET PRODUCT
    // ======================
    useEffect(() => {
        if (id) getProduct();
    }, [id]);
    const getProduct = async () => {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  setProduct(data);

  if (onProductLoad && data) {
    onProductLoad(data);
  }
};


    // ======================
    // BUILD IMAGE ARRAY
    // ======================
    const images = product
        ? [
            product.image_url, // الصورة الرئيسية أولاً
            ...(product.images || []), // بعدها الصور الإضافية
        ].filter(Boolean)
        : [];

    // ======================
    // UI
    // ======================
    return (
        <div className='bg-[url("/assets/carddata_bg.png")] bg-cover bg-top border rounded backdrop-blur-3xl  h-10/12 text-white '>
        {product ? (
            <>
            {/* breadcrumb */}
            <div className="max-w-5xl mx-auto px-6 mt-2  flex justify-between items-center text-sm ">
                
                <div>
                الرئيسية / المنتجات /
                <span className="font-semibold text-blue-600 ml-1">
                    {product.name}
                </span>
                </div>

                <button
                onClick={() => router.back()}
                className="text-blue-600 hover:underline cursor-[url(/assets/sym.cur),pointer]"
                >
                ← رجوع
                </button>
            </div>

            {/* card */}
            <div className="max-w-5xl  mx-5  border rounded  backdrop-blur-3xl md:mx-auto md:drop-shadow-2xl drop-shadow-xl drop-shadow-blue-600 shadow-red-600 md:shadow-2xl shadow-xl mt-5 ">
                <div className="grid lg:grid-cols-2 gap-8">

                {/* images */}
                <div className="md:block flex">
                    {images.length > 0 && (
                    <img
                        src={images[activeImage]}
                        className=" lg:w-full w-50  h-50 xl:h-90 lg:h-70 md:h-60 sm:h-50   object-cover rounded mb-2 border cursor-[url(/assets/sym.cur),pointer]"
                        onClick={() =>
                        setEnlargedImage(images[activeImage])
                        }
                    />
                    )}

                    <div className="md:grid-cols-5  flex-col grid grid-cols-2 ml-6 gap-2 border p-1 overflow-x-auto">
                    {images.map((img, i) => (
                        <img
                        key={i}
                        src={img}
                        onClick={() => setActiveImage(i)}
                        className={`md:w-18 md:h-18 w-14 h-14 p-1 object-cover cursor-[url(/assets/sym.cur),pointer]     ${
                            activeImage === i
                            ? "border-green-600"
                            : "border-gray-300"
                        }`}
                        />
                    ))}
                    </div>
                </div>

                {/* info */}
                <div className="m-3">

                    <div className="border p-3  mb-3 mt-2 flex justify-between ">
                    <span>{product.name}</span>
                    <span className="text-gray-500 ">
                        اسم المنتج
                    </span>
                    </div>

                    <div className="border p-3 mb-3 flex justify-between text-green-600">
                    <span>
                        {product.price} {product.currency_symbol}
                    </span>
                    <span className="text-gray-500">
                        السعر
                    </span>
                    </div>

                    <div className="text-right mb-1 text-gray-600">
                    وصف المنتج
                    </div>

                    <div className="border p-3">
                    {product.description || "لا يوجد وصف"}
                    </div>

                </div>
                </div>
            </div>

            {/* image modal */}
            {enlargedImage && (
                <div
                className="fixed inset-0 bg-black/40 flex items-center justify-center  mt-30"
                onClick={() => setEnlargedImage(null)}
                >
                <div className="relative border bg-white">
                    <img
                    src={enlargedImage}
                    className="max-w-[70vw] max-h-[70vh] object-contain"
                    />

                    <button
                    className="absolute top-2 right-2 bg-black text-white w-8 h-8 rounded-full"
                    onClick={() => setEnlargedImage(null)}
                    >
                    ×
                    </button>
                </div>
                </div>
            )}
            </>
        ) : (
            <div className="max-w-5xl mx-auto p-6 mt-4 text-center">
            جاري التحميل...
            </div>
        )}
        </div>
    );
    }
