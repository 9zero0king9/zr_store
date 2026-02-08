"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export default function TestPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.log("ERROR:", error.message);
      } else {
        console.log("DATA:", data);
        setProducts(data);
      }
    };

    getProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Products Test</h1>

      {products.map((p) => (
        <div key={p.id}>
          {p.title} - {p.price}
        </div>
      ))}
    </div>
  );
}
