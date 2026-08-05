import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { discountCodeService } from "../services/discountCodeService";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  promo: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  percent: "M19 5l-14 14M5 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
};

export default function CreatePromoCode() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    code: "",
    type_usage: "unique",
    pourcentage: "",
  });
  const [current, setCurrent] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    discountCodeService.getById(id)
      .then((data) => {
        setCurrent(data);
        setFormData({
          code: data.code ?? "",
          type_usage: data.type_usage ?? "unique",
          pourcentage: data.pourcentage ?? "",
        });
      })
      .catch(() => Swal.fire("Error", "Unable to load this promo code.", "error"))
      .finally(() => setLoadingData(false));
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = "The promo code is required";
    if (formData.pourcentage === "" || isNaN(formData.pourcentage)) {
      newErrors.pourcentage = "The percentage is required";
    } else if (Number(formData.pourcentage) < 0 || Number(formData.pourcentage) > 100) {
      newErrors.pourcentage = "The percentage must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCode = () => {
    const prefixes = ["SPON", "PART", "VIP", "EARLY", "SUMMER", "WINTER"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    setFormData({ ...formData, code: `${randomPrefix}-${randomNum}` });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        type_usage: formData.type_usage,
        pourcentage: Number(formData.pourcentage),
      };

      if (isEditing) {
        await discountCodeService.update(id, payload);
      } else {
        await discountCodeService.create(payload);
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditing ? "Promo code updated successfully" : "Promo code created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/finance");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message ?? "Error saving the promo code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f5f6f8] text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/finance")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back"
          >
            <Icon d={ICONS.arrowLeft} size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Edit promo code" : "Add a promo code"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/finance")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "In progress..." : isEditing ? "Update" : "Add"}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Promo code information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Promo Code <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Icon d={ICONS.promo} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="E.g.: SPON-1234"
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                            errors.code ? "border-red-400" : "border-gray-200"
                          } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition uppercase`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={generateCode}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Usage type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.users} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.type_usage}
                        onChange={(e) => setFormData({ ...formData, type_usage: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                      >
                        <option value="unique">Single use (1 use only)</option>
                        <option value="massif">Mass use (unlimited)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Discount percentage <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon d={ICONS.percent} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.pourcentage}
                        onChange={(e) => setFormData({ ...formData, pourcentage: e.target.value })}
                        placeholder="E.g.: 20"
                        className={`w-full pl-10 pr-8 py-2.5 rounded-lg border ${
                          errors.pourcentage ? "border-red-400" : "border-gray-200"
                        } text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                    {errors.pourcentage && <p className="text-xs text-red-500">{errors.pourcentage}</p>}
                  </div>

                  {isEditing && current && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Number of uses</label>
                      <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600">
                        {current.nombre_utilisations ?? 0} — status: {current.activated ? "Active" : "Disabled"}
                      </div>
                      <p className="text-xs text-gray-400">
                        Status (active/disabled) and history are managed from the promo codes list.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate("/finance")}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Icon d={ICONS.save} size={15} />
                  {isLoading ? "In progress..." : isEditing ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
