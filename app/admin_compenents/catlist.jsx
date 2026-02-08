"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function CategorySidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [categories, setCategories] = useState([]);
  const [openCats, setOpenCats] = useState({});

  const [editingCat, setEditingCat] = useState(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [originalParentId, setOriginalParentId] = useState("");
  const [editShowOnHome, setEditShowOnHome] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);

  // ================= FETCH =================
  const getCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    setCategories(data || []);
  };

  useEffect(() => {
    getCategories();

    const handler = () => getCategories();
    window.addEventListener("categories-updated", handler);

    const channel = supabase.channel("public:categories");

    channel
      .on("postgres_changes",{event:"*",schema:"public",table:"categories"},()=>getCategories())
      .on("postgres_changes",{event:"*",schema:"public",table:"products"},()=>getCategories());

    channel.subscribe();

    return () => {
      window.removeEventListener("categories-updated", handler);
      supabase.removeChannel(channel);
    };
  }, []);

  // ================= TREE MAP =================
  const categoriesByParent = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      const parent = c.parent_id || "root";
      if (!map[parent]) map[parent] = [];
      map[parent].push(c);
    });
    return map;
  }, [categories]);

  const toggleCat = (id) =>
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const goToCategory = (id) =>
    router.push(`/category/${id}`);

  // ================= LOOP PROTECTION =================
  const getAllDescendants = (id) => {
    const children = categories.filter((c) => c.parent_id === id);
    let result = [...children.map((c) => c.id)];
    children.forEach((child) => {
      result = result.concat(getAllDescendants(child.id));
    });
    return result;
  };

  const isInvalidMove = () => {
    if (!editingCatId) return false;

    // نقل داخل نفسها
    if (editParentId === editingCatId) return true;

    // نقل داخل ابن من أبنائها
    const descendants = getAllDescendants(editingCatId);
    if (descendants.includes(editParentId)) return true;

    return false;
  };

  // ================= DELETE =================
  const deleteCategoryRecursive = async (id) => {
    const children = categories.filter((c) => c.parent_id === id);
    for (const child of children) {
      await deleteCategoryRecursive(child.id);
    }
    await supabase.from("products").delete().eq("category_id", id);
    await supabase.from("categories").delete().eq("id", id);
  };

  const handleDelete = async (cat) => {
    if (!confirm(`متأكد بدك تحذف "${cat.name}" وكل شي بداخلها؟`)) return;
    await deleteCategoryRecursive(cat.id);
    window.dispatchEvent(new Event("categories-updated"));
  };

  // ================= EDIT =================
  const handleEdit = (cat) => {
    setEditingCat(cat);
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditParentId(cat.parent_id || "");
    setOriginalParentId(cat.parent_id || "");
    setEditShowOnHome(!!cat.show_o_nhome);
  };

  const closeEdit = () => {
    setEditingCat(null);
    setShowConfirm(false);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return alert("اسم القائمة مطلوب");

    if (isInvalidMove()) {
      alert("لا يمكن نقل القائمة داخل نفسها أو داخل أحد أبنائها");
      return;
    }

    if (editParentId !== originalParentId) {
      setShowConfirm(true);
      return;
    }

    await supabase
      .from("categories")
      .update({
        name: editName,
        parent_id: editParentId || null,
        show_on_home: editShowOnHome,
      })
      .eq("id", editingCatId);

    closeEdit();
    window.dispatchEvent(new Event("categories-updated"));
  };

  // ================= RENDER =================
  const renderCategories = (parentId = "root", level = 0) =>
    (categoriesByParent[parentId] || []).map((cat) => {
      const hasChildren = categoriesByParent[cat.id]?.length > 0;
      const active = pathname === `/category/${cat.id}`;

      return (
        <div key={cat.id} style={{ paddingRight: level * 14 }}>
          <div className={`flex items-center justify-between p-2 rounded
            ${active ? "bg-blue-100 font-bold" : "hover:bg-gray-100"}`}>

            <div
              className="flex gap-2 flex-1 cursor-pointer"
              onClick={() =>
                hasChildren ? toggleCat(cat.id) : goToCategory(cat.id)
              }
            >
              <span>{cat.name}</span>
              {hasChildren && (
                <span className="text-xs">
                  {openCats[cat.id] ? "−" : "+"}
                </span>
              )}
            </div>

            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(cat);
                }}
                className="bg-yellow-500 text-white text-xs px-2 rounded"
              >
                تعديل
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(cat);
                }}
                className="bg-red-600 text-white text-xs px-2 rounded"
              >
                حذف
              </button>
            </div>
          </div>

          {hasChildren && openCats[cat.id] && (
            <div>{renderCategories(cat.id, level + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <>
      <aside className="w-64 border-l bg-gray-200 p-4 sticky top-0 h-screen overflow-y-auto">
        <h2 className="font-bold mb-4">الأقسام</h2>
        {renderCategories()}
      </aside>

      {/* EDIT MODAL */}
      {editingCat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="font-bold mb-3">تعديل القائمة</h3>

            <input
              className="border p-2 w-full mb-3"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <select
              className="border p-2 w-full mb-3"
              value={editParentId}
              onChange={(e) => setEditParentId(e.target.value)}
            >
              <option value="">رئيسية</option>
              {categories
                .filter((c) => c.id !== editingCatId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={editShowOnHome}
                onChange={(e) => setEditShowOnHome(e.target.checked)}
              />
              عرض في الصفحة الرئيسية
            </label>

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                حفظ
              </button>
              <button
                onClick={closeEdit}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MOVE MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded w-96">
            <h3 className="font-bold mb-4 text-center">
              تم تغيير مكان القائمة
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await supabase
                    .from("categories")
                    .update({
                      name: editName,
                      parent_id: editParentId || null,
                      show_on_home: editShowOnHome,
                    })
                    .eq("id", editingCatId);

                  closeEdit();
                  window.dispatchEvent(new Event("categories-updated"));
                }}
                className="bg-blue-600 text-white p-2 rounded"
              >
                نقل مع كل المحتويات
              </button>

              <button
                onClick={async () => {
                  await supabase
                    .from("products")
                    .delete()
                    .eq("category_id", editingCatId);

                  await supabase
                    .from("categories")
                    .update({
                      name: editName,
                      parent_id: editParentId || null,
                      show_on_home: editShowOnHome,
                    })
                    .eq("id", editingCatId);

                  closeEdit();
                  window.dispatchEvent(new Event("categories-updated"));
                }}
                className="bg-red-600 text-white p-2 rounded"
              >
                نقل وحذف المحتويات
              </button>

              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-400 text-white p-2 rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
