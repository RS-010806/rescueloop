import React, { useRef } from 'react';
import {
  Upload,
  Camera,
  Thermometer,
  MapPin,
  FileCheck,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Utensils,
  Layers,
} from 'lucide-react';
import type { IncidentData } from '../types/rescue.ts';
import { FRESH_MEAL_PREP_IMAGE } from '../data/demoScenario.ts';
import { InfoTooltip } from './InfoTooltip.tsx';

interface IncidentIntakePanelProps {
  incident: IncidentData;
  onChange: (updated: IncidentData) => void;
  onRunAnalysis: () => void;
  isRunning: boolean;
  isCustomMode: boolean;
}

export const IncidentIntakePanel: React.FC<IncidentIntakePanelProps> = ({
  incident,
  onChange,
  onRunAnalysis,
  isRunning,
  isCustomMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof IncidentData, value: any) => {
    onChange({
      ...incident,
      [field]: value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...incident,
        imageUrl: reader.result as string,
        imageFileName: file.name,
        isSimulatedData: false,
      });
    };
    reader.readAsDataURL(file);
  };

  const setSamplePhoto = () => {
    onChange({
      ...incident,
      imageUrl: FRESH_MEAL_PREP_IMAGE,
      imageFileName: 'fresh_meal_prep_boxes.jpg',
    });
  };

  // Readiness Calculation
  const hasPhoto = Boolean(incident.imageUrl);
  const hasTitle = Boolean(incident.title && incident.title.trim().length > 3);
  const hasLocation = Boolean(incident.locationAddress && incident.locationAddress.trim().length > 3);
  const hasPortions = incident.reportedPortions > 0;
  const hasOfficer = Boolean(incident.venueSafetyOfficerName && incident.venueSafetyOfficerName.trim().length > 2);
  const isTempSafe = incident.storageTempC >= 60 || incident.storageTempC <= 4.5;
  const isOfficerApproved = incident.venueSafetyClearanceGranted;

  const checks = [hasPhoto, hasTitle, hasLocation, hasPortions, hasOfficer, isOfficerApproved, isTempSafe];
  const passedChecks = checks.filter(Boolean).length;
  const readinessPercent = Math.round((passedChecks / checks.length) * 100);

  const isDangerZone = incident.storageTempC > 4.5 && incident.storageTempC < 60;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 lg:p-7 shadow-sm space-y-6">
      {/* Header with Readiness Meter */}
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Utensils className="h-5 w-5 text-emerald-600" />
              <span>{isCustomMode ? 'Submit Surplus Food Manifest' : 'Surplus Food Manifest'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isCustomMode
                ? 'Enter event surplus details below. Follow the guidance info icons to ensure full safety compliance.'
                : 'Verified meal manifest from university catering. Edit fields or click below to analyze.'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0">
            {incident.isSimulatedData ? 'Sample Preset' : 'Custom Entry'}
          </span>
        </div>

        {/* Readiness Meter */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-700 flex items-center gap-1.5">
              <span>Manifest Completion Readiness:</span>
              <InfoTooltip
                title="Redistribution Readiness"
                description="Community shelters and safety regulations require a verified food photo, portion estimate, core temperature log, and authorized coordinator clearance before courier dispatch."
              />
            </span>
            <span className={readinessPercent >= 80 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              {readinessPercent}% Complete
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                readinessPercent >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5 text-[11px]">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${hasPhoto ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              <CheckCircle2 className="h-3 w-3" /> Photo
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${hasTitle ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              <CheckCircle2 className="h-3 w-3" /> Event Title
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${hasPortions ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              <CheckCircle2 className="h-3 w-3" /> Portions
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${isTempSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              <CheckCircle2 className="h-3 w-3" /> Safe Temp
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${isOfficerApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              <CheckCircle2 className="h-3 w-3" /> Officer Sign-off
            </span>
          </div>
        </div>
      </div>

      {/* 1. Food Photo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-800 flex items-center">
            <span>Food Photo</span>
            <InfoTooltip
              title="Surplus Food Photo"
              description="Our Vision AI examines container lids, packaging format (bento boxes vs deep hotel pans), detects meal categories (protein, grains, vegetables), and estimates portion uncertainty."
            />
          </label>
          <button
            type="button"
            onClick={setSamplePhoto}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
          >
            Use Sample Photo
          </button>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3 overflow-hidden text-center">
          {incident.imageUrl ? (
            <div className="space-y-2.5">
              <img
                src={incident.imageUrl}
                alt="Surplus food bento boxes"
                className="h-48 w-full rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
                <span className="truncate max-w-[200px] text-slate-700 font-semibold">{incident.imageFileName || 'food_photo.jpg'}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Upload Different Photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="py-10 cursor-pointer flex flex-col items-center justify-center gap-2.5 hover:bg-slate-100/70 transition-colors rounded-xl"
            >
              <div className="rounded-full bg-emerald-100 p-3.5 text-emerald-700 shadow-xs">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-sm font-bold text-slate-900">Click to upload surplus food photo</div>
              <div className="text-xs text-slate-500">Supports JPG, PNG, WEBP, or take a quick photo on your mobile phone</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* 2. Title & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
            <span>Event / Donor Title</span>
            <InfoTooltip
              title="Event or Donor Name"
              description="Name of the organization, event, or catering kitchen offering surplus food (e.g. West Campus Alumni Banquet, Grand Hyatt Breakfast Buffet)."
            />
          </label>
          <input
            type="text"
            value={incident.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. West Campus Alumni Banquet"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
            <span>Venue Type</span>
            <InfoTooltip
              title="Venue Category"
              description="Helps courier volunteers anticipate parking clearance, loading dock elevations, and container transport cart requirements."
            />
          </label>
          <select
            value={incident.venueType}
            onChange={(e) => handleFieldChange('venueType', e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="college_event">College or University Event</option>
            <option value="restaurant">Restaurant or Bistro</option>
            <option value="hotel">Hotel Catering or Banquet</option>
            <option value="cafeteria">Campus or Corporate Cafeteria</option>
            <option value="corporate">Corporate Conference</option>
          </select>
        </div>
      </div>

      {/* 3. Location */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
          <span>Pickup Address & Loading Dock</span>
          <InfoTooltip
            title="Pickup Location"
            description="Specific street address and service dock door where food rescue couriers can park and load insulated transport containers."
          />
        </label>
        <div className="relative">
          <input
            type="text"
            value={incident.locationAddress}
            onChange={(e) => handleFieldChange('locationAddress', e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. University Hall Loading Dock B, West Campus"
          />
          <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* 4. Servings & Approx Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
            <span>Reported Servings</span>
            <InfoTooltip
              title="Portion Count"
              description="Estimated count of individual prepared meal servings ready for distribution (e.g. 120 boxed meals or 4 steam table pans)."
            />
          </label>
          <input
            type="number"
            min="1"
            value={incident.reportedPortions}
            onChange={(e) => handleFieldChange('reportedPortions', Number(e.target.value))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
            <span>Approx. Weight (kg)</span>
            <InfoTooltip
              title="Estimated Food Weight"
              description="Used for environmental accounting of diverted organic mass (EPA standard benchmark: 0.42 kg per prepared adult meal portion)."
            />
          </label>
          <input
            type="number"
            step="0.5"
            value={incident.reportedWeightKg || ''}
            onChange={(e) => handleFieldChange('reportedWeightKg', parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            placeholder="Auto (0.42 kg/serving)"
          />
        </div>
      </div>

      {/* 5. Thermal & Holding Safety Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4.5 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 flex items-center">
            <Thermometer className="h-4 w-4 text-emerald-600 mr-1.5" />
            <span>Thermal Storage Log</span>
            <InfoTooltip
              title="HACCP Thermal Control"
              description="Food safety regulations dictate that hot prepared food must be maintained above 60°C (140°F) and chilled perishables below 4.5°C (40°F) to prevent bacterial growth."
            />
          </span>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isDangerZone
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {incident.storageTempC}°C ({isDangerZone ? 'Danger Zone: Unsafe' : 'HACCP Compliant'})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-semibold">Storage Method</label>
            <select
              value={incident.storageMethod}
              onChange={(e) => handleFieldChange('storageMethod', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="hot_hold">Hot Hold (Insulated Cambros: above 60°C)</option>
              <option value="refrigerated">Refrigerated (Cold walk-in: below 4.5°C)</option>
              <option value="frozen">Frozen (Deep freeze: below -18°C)</option>
              <option value="ambient">Ambient (Room temp: not recommended)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-semibold">Internal Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={incident.storageTempC}
              onChange={(e) => handleFieldChange('storageTempC', parseFloat(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={incident.temperatureVerified}
            onChange={(e) => handleFieldChange('temperatureVerified', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-700 font-medium">
            Internal food core temperature was measured and verified with calibrated probe
          </span>
        </label>
      </div>

      {/* 6. Safety Officer Clearance */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4.5 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 flex items-center">
            <FileCheck className="h-4 w-4 text-emerald-600 mr-1.5" />
            <span>Safety Officer Clearance</span>
            <InfoTooltip
              title="Official Redistribution Sign-off"
              description="Official clearance from your venue food safety coordinator, head chef, or banquet lead confirms food was prepared in a certified commercial facility and complies with Good Samaritan donation standards."
            />
          </span>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={incident.venueSafetyClearanceGranted}
            onChange={(e) => handleFieldChange('venueSafetyClearanceGranted', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-800 font-medium">
            Authorized kitchen lead or safety officer has cleared food for community redistribution
          </span>
        </label>

        <div>
          <label className="block text-xs text-slate-600 mb-1 font-semibold">Authorizing Officer Name & Title</label>
          <input
            type="text"
            value={incident.venueSafetyOfficerName}
            onChange={(e) => handleFieldChange('venueSafetyOfficerName', e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. Dr. Elena Rostova (Campus Food Safety Lead)"
          />
        </div>
      </div>

      {/* 7. Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
          <span>Detailed Food Description</span>
          <InfoTooltip
            title="Menu & Packaging Details"
            description="Detail food items, container packaging (e.g. individual bento boxes, deep gastro pans), and preparation timestamps."
          />
        </label>
        <textarea
          rows={3}
          value={incident.rawDescription}
          onChange={(e) => handleFieldChange('rawDescription', e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
          placeholder="Describe items, ingredients, container format, and preparation..."
        />
      </div>

      {/* 8. Allergens & Dietary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
            <span>Declared Allergens</span>
            <InfoTooltip
              title="Allergen Disclosure"
              description="Recipient shelters need to separate allergen-containing meals (Gluten, Dairy, Peanuts, Tree Nuts, Shellfish, Eggs, Soy, Sesame)."
            />
          </label>
          <input
            type="text"
            value={incident.declaredAllergens.join(', ')}
            onChange={(e) =>
              handleFieldChange(
                'declaredAllergens',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. Gluten, Sesame"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center">
            <span>Dietary Tags</span>
            <InfoTooltip
              title="Dietary Compatibility"
              description="Helps our matching agent prioritize shelters that specialize in Halal, Kosher, Vegetarian, or Vegan meal requests."
            />
          </label>
          <input
            type="text"
            value={incident.dietaryTags.join(', ')}
            onChange={(e) =>
              handleFieldChange(
                'dietaryTags',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. Halal, Vegetarian"
          />
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isRunning}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
          id="intake-run-analysis-btn"
        >
          {isRunning ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin" />
              <span>Running 5-Agent Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Run Redistribution Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
