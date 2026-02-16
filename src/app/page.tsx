"use client";

import { useState } from "react";
import { Check, ChevronRight, User, Package, FileText, CheckCircle } from "lucide-react";
import { createRequest, getStockItem } from "../actions/requests";

interface StockData {
  [size: string]: number;
}

interface WizardData {
  employeeName: string;
  service: string;
  category: string;
  size: string;
  reason: string;
}

const CATEGORIES = [
  { id: "Shoes", label: "Chaussures de sécurité" },
  { id: "Gloves", label: "Gants de protection" },
  { id: "Jackets", label: "Vestes de travail" },
  { id: "Helmets", label: "Casques de sécurité" },
];

const REASONS = ["Usure", "Perte", "Vol", "Première dotation", "Changement de taille"];

export default function EmployeeWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [data, setData] = useState<WizardData>({
    employeeName: "",
    service: "",
    category: "",
    size: "",
    reason: "",
  });

  const handleNext = async () => {
    if (step === 2 && data.category) {
      // Fetch stock data for selected category
      const result = await getStockItem(data.category);
      if (result.success && result.item) {
        setStockData(result.item.stock as StockData);
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await createRequest(data);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.employeeName && data.service;
      case 2:
        return data.category;
      case 3:
        return data.size && data.reason;
      default:
        return true;
    }
  };

  const getSizes = () => {
    if (!stockData) return [];
    return Object.keys(stockData).sort();
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
          <p className="text-gray-600 mb-6">
            Votre demande a été transmise au service des ressources. Vous serez notifié lors de la validation.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#004B9B] text-white py-3 rounded-xl font-medium hover:bg-[#003d7d] transition-colors"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-[#004B9B]">EPI MANAGER</h1>
          <p className="text-gray-500 text-sm">Demande d'équipement</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step
                    ? "bg-[#004B9B] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    s < step ? "bg-[#004B9B]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#004B9B]" />
                <h2 className="text-lg font-semibold">Votre identité</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom et prénom
                </label>
                <input
                  type="text"
                  value={data.employeeName}
                  onChange={(e) =>
                    setData({ ...data, employeeName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004B9B] focus:border-transparent"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <input
                  type="text"
                  value={data.service}
                  onChange={(e) =>
                    setData({ ...data, service: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004B9B] focus:border-transparent"
                  placeholder="Production"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-5 h-5 text-[#004B9B]" />
                <h2 className="text-lg font-semibold">Type d'équipement</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setData({ ...data, category: cat.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.category === cat.id
                        ? "border-[#004B9B] bg-[#004B9B]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-[#004B9B]" />
                <h2 className="text-lg font-semibold">Détails</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {getSizes().map((size) => {
                    const stockCount = stockData?.[size] || 0;
                    const isOutOfStock = stockCount === 0;
                    return (
                      <button
                        key={size}
                        onClick={() =>
                          !isOutOfStock && setData({ ...data, size })
                        }
                        disabled={isOutOfStock}
                        className={`p-3 rounded-xl border-2 font-medium transition-all ${
                          data.size === size
                            ? "border-[#004B9B] bg-[#004B9B] text-white"
                            : isOutOfStock
                            ? "border-red-200 bg-red-50 text-red-600 cursor-not-allowed"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>{size}</div>
                        {isOutOfStock && (
                          <div className="text-xs font-semibold text-red-700">Rupture</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de la demande
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setData({ ...data, reason })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        data.reason === reason
                          ? "border-[#004B9B] bg-[#004B9B]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-5 h-5 text-[#004B9B]" />
                <h2 className="text-lg font-semibold">Validation</h2>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Employé</span>
                  <span className="font-medium">{data.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium">{data.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Équipement</span>
                  <span className="font-medium">
                    {CATEGORIES.find((c) => c.id === data.category)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taille</span>
                  <span className="font-medium">{data.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Motif</span>
                  <span className="font-medium">{data.reason}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Vérifiez les informations avant de soumettre votre demande.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
            )}
            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={!canProceed() || loading}
              className="flex-1 bg-[#004B9B] text-white py-3 rounded-xl font-medium hover:bg-[#003d7d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Envoi..."
              ) : step === 4 ? (
                "Confirmer la demande"
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


