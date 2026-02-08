"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    router.push("/admin");
  };

  return (
    <div className=" text-center items-center mx-150  mt-70 border-2 border-black p-6 ">
      <h1 className="text-2xl mb-4 font-bold ">Admin-Login</h1>

      <input 
        className="border"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
      />

      <input
        className="border"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
      />

      <button className="border font-bold text-black bg-red-600 " onClick={login} style={{ width: "100%", padding: 10 }}>
        تسجيل دخول
      </button>
    </div>
  );  
}
