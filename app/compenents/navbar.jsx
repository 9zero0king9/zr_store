"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation'   // ← أضفنا هذا الاستيراد
import Rlist from './Rlist.jsx'

function Navbar() {
  const [showRlist, setShowRlist] = useState(false)
  const router = useRouter()   // ← أضفنا هذا

  return (
    <div className='relative flex justify-between border-b-2 bg-[url("/assets/productsbg.png")] '>
      
      {/* بدل الـ div اللي فيه sss بزر يرجع للرئيسية */}
      <button
        onClick={() => router.push('/')}
        className="
          px-2  ml-4 mt-1
          bg-blue-600
          text-white 
          my-2
          rounded-lg 
          
          zoom3 
          cursor-[url(/assets/sym.cur),pointer]
        "
      >
        الصفحة الرئيسية
      </button>

      <div className='text-end h-16'>
        <div className=''>           
          <button
            onClick={() => setShowRlist(!showRlist)}
            className="bg-blue-600 text-white px-1 rounded  transition h-13 mt-1 mr-4 cursor-[url(/assets/sym.cur),pointer] zoom3"
          >
            {showRlist ? 'إخفاء القائمة' : 'عرض القائمة'}
          </button>
        </div>
        
        <div className={`
    absolute top-full right-0 mt-2
    transition-all duration-200 ease-in-out
    origin-top-right z-50 
    ${showRlist 
      ? 'opacity-100 visible scale-100' 
      : 'opacity-0 invisible scale-95 pointer-events-none'
    }
  `}>
          <Rlist />
        </div>
      </div>
    </div>
  )
}

export default Navbar