"use client";

// صفحة لوحة التحكم الإدارية
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";
import Addcat from "../admin_compenents/addcat.jsx";
import Addproduct from "../admin_compenents/addproduct.jsx";
import AdminNav from "../admin_compenents/admin_nav.jsx";
import Catlist from "../admin_compenents/catlist.jsx";

export default function AdminPage() {
  const router = useRouter();

  // حالة المستخدم
  const [user, setUser] = useState(null);


  
  // =========================
  // AUTH GUARD
  //يتاكد من معلومات تسجيل الدخول اذا مو صحيحة يرسله للوغين=
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, [router]);


  if (!user) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className=" ">
      
      <div className="flex justify-between">

        <div className="  items-center flex flex-col  ">
          <AdminNav />
          <Addcat />
          <Addproduct />      
        </div>
          
          <Catlist />

      </div>
    


    </div>
  );
}
