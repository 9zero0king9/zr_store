"use client";

import { useState } from "react";
import User_card from "@/app/compenents/User_carddata.jsx";
import RelatedProducts from "@/app/compenents/RelatedProducts";
import Lobi_prodacts from "@/app/compenents/lobi_prodacts.jsx";
import Navbar from "@/app/compenents/navbar";
import Footer from "@/app/compenents/footer.jsx";

export default function Page() {
  const [product, setProduct] = useState(null);

  return (
    <div className="h-screen">
        <Navbar />
        <User_card onProductLoad={setProduct} />

      {product && (
        <RelatedProducts
          categoryId={product.category_id}
          currentProductId={product.id}
        />
      )}
      <Lobi_prodacts />
      <Footer />
    </div>
  );
}
