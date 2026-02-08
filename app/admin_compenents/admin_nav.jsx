"use client";

// مكون شريط التنقل للإدارة
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function AdminNav() {
  const router = useRouter();

  // تسجيل الخروج
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="flex justify-between items-center pt-2 w-2/3">
      {/* عنوان لوحة التحكم */}
      <h1 className="font-bold text-2xl text-green-600">
        Admin Dashboard
      </h1>

      {/* زر تسجيل الخروج */}
      <button
        onClick={logout}
        className="border px-4 py-2 bg-red-600 text-white rounded"
      >
        تسجيل خروج
      </button>
    </div>
  );
}
