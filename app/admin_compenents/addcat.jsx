  "use client";

  import { useEffect, useMemo, useState } from "react";
  import { supabase } from "../../src/lib/supabaseClient";

  export default function AddCat() {

    const [categories, setCategories] = useState([]);

    const [catName, setCatName] = useState("");
    const [catParentId, setCatParentId] = useState("");
    const [showOnHome, setShowOnHome] = useState(false);
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

      return () =>
        window.removeEventListener("categories-updated", handler);
    }, []);

    // ================= TREE HELPERS =================
    const categoriesById = useMemo(() => {
      const map = {};
      categories.forEach((c) => (map[c.id] = c));
      return map;
    }, [categories]);

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

      // داخل نفسها
      if (catParentId === editingCatId) return true;

      // داخل أحد أبنائها
      const descendants = getAllDescendants(editingCatId);
      if (descendants.includes(catParentId)) return true;

      return false;
    };

    const getCategoryPath = (catId) => {
      if (!catId) return "بدون قائمة";

      let current = categoriesById[catId];
      const names = [];

      while (current) {
        names.unshift(current.name);
        current = current.parent_id
          ? categoriesById[current.parent_id]
          : null;
      }

      return names.join(" / ");
    };

    // ================= SAVE =================
    const saveCategory = async () => {
      if (!catName.trim()) return alert("اكتب اسم القائمة");

      if (isInvalidMove()) {
        alert("لا يمكن نقل القائمة داخل نفسها أو داخل أحد أبنائها");
        return;
      }

      const payload = {
        name: catName.trim(),
        parent_id: catParentId || null,
        show_on_home: showOnHome,
      };

      if (editingCatId) {
        await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCatId);
        alert("تم التعديل ✅");
      } else {
        await supabase.from("categories").insert([payload]);
        alert("تمت الإضافة ✅");
      }

      resetForm();
      getCategories();
      window.dispatchEvent(new Event("categories-updated"));
    };

    const resetForm = () => {
      setCatName("");
      setCatParentId("");
      setShowOnHome(false);
      setEditingCatId(null);
    };

    // ================= EDIT =================
    const startEditCategory = (c) => {
      setEditingCatId(c.id);
      setCatName(c.name || "");
      setCatParentId(c.parent_id || "");
      setShowOnHome(!!c.show_on_home);
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
      getCategories();
      window.dispatchEvent(new Event("categories-updated"));
    };

    // ================= UI =================
    return (
      <div className="w-2/3">
        <div className="mt-8 border p-4 rounded">
          <h2 className="font-bold text-lg mb-3">
            {editingCatId ? "تعديل قائمة" : "إضافة قائمة"}
          </h2>

          <input
            placeholder="اسم القائمة"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="p-2 w-full border mb-2"
          />

          <select
            value={catParentId}
            onChange={(e) => setCatParentId(e.target.value)}
            className="p-2 w-full border mb-2"
          >
            <option value="">قائمة رئيسية</option>
            {categories
              .filter((c) => c.id !== editingCatId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryPath(c.id)}
                </option>
              ))}
          </select>

          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
            />
            عرض هذه القائمة في الصفحة الرئيسية
          </label>

          <button
            onClick={saveCategory}
            className="w-full p-2 bg-blue-600 text-white rounded"
          >
            حفظ
          </button>

          {editingCatId && (
            <button
              onClick={resetForm}
              className="w-full p-2 bg-gray-200 rounded mt-2"
            >
              إلغاء
            </button>
          )}

          {/* آخر قوائم */}
          <div className="mt-4">
            <h3 className="font-bold mb-2">آخر القوائم</h3>

            {categories.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="border p-2 rounded mb-2 flex justify-between"
              >
                <div>
                  <div className="font-bold">{c.name}</div>
                  {c.show_on_home && (
                    <div className="text-green-600 text-sm">
                      تظهر في الرئيسية
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditCategory(c)}
                    className="bg-yellow-500 text-white px-2 rounded"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
