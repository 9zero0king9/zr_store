

import React from "react";
import Footer from "../../compenents/footer.jsx";
import User_category from "@/app/compenents/User_category";

export default function CategoryProductsPage() {


  // =========================
  return (
    <div className="
  min-h-screen 
  w-screen           {/* بدل w-full أحيانًا أفضل */}
  overflow-x-hidden  /* يمنع الـ horizontal scroll الوهمي */}
  pt-safe            /* أو pb-safe حسب الجهاز */
">
  <div className="
    bg-gradient-to-r from-blue-950 to-pink-900 
    bg-gradient-to-r from-50% to-90%  
    min-h-screen
    w-screen
    overflow-x-hidden
  ">
    <User_category />
  </div>

  <Footer />
</div>
  );
}
