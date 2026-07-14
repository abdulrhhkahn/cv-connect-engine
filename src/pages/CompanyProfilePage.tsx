import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { CompanyProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Building2, MapPin, Globe, Phone, Mail, Users, Image, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadLogo, uploadBanner } from "@/lib/storage";

const CompanyProfilePage = () => {
  const { user } = useAuth();
  const { getCompanyProfile, updateCompanyProfile } = useJobStore();
  const profile = user ? getCompanyProfile(user.id) : null;

  const [form, setForm] = useState<Partial<CompanyProfile>>({
    companyName: "", about: "", industry: "", location: "",
    size: "", website: "", contactEmail: "", contactPhone: "",
    employees: [], followers: [],
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpTitle, setNewEmpTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ ...profile });
      setLogoPreview(profile.logoUrl || null);
      setBannerPreview(profile.bannerUrl || null);
    } else if (user) {
      setForm({
        companyName: user.company || "", about: "", industry: "", location: "",
        size: "", website: "", contactEmail: user.email, contactPhone: "",
        employees: [], followers: [],
      });
    }
  }, [profile, user]);

  const handleImageUpload = (type: "logo" | "banner") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    // Instant preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (type === "logo") setLogoPreview(url);
      else setBannerPreview(url);
    };
    reader.readAsDataURL(file);
    // Upload to Supabase Storage and replace base64 preview with stable URL
    const t = toast.loading(`Uploading ${type}…`);
    try {
      const url = type === "logo"
        ? await uploadLogo(user.id, file)
        : await uploadBanner(user.id, file);
      if (type === "logo") setLogoPreview(url);
      else setBannerPreview(url);
      toast.success(`${type === "logo" ? "Logo" : "Banner"} uploaded`, { id: t });
    } catch (err) {
      console.error(`${type} upload failed:`, err);
      toast.error(`${type === "logo" ? "Logo" : "Banner"} upload failed — preview only`, { id: t });
    }
  };

  const addEmployee = () => {
    if (!newEmpName.trim() || !newEmpTitle.trim()) return;
    setForm({ ...form, employees: [...(form.employees || []), { name: newEmpName.trim(), title: newEmpTitle.trim() }] });
    setNewEmpName("");
    setNewEmpTitle("");
  };

  const removeEmployee = (idx: number) => {
    setForm({ ...form, employees: (form.employees || []).filter((_, i) => i !== idx) });
  };

  const setField = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateCompanyProfile(user.id, {
        ...form, userId: user.id,
        logoUrl:   logoPreview   || undefined,
        bannerUrl: bannerPreview || undefined,
      } as CompanyProfile);
      toast.success("Company profile saved!");
    } catch (err) {
      console.error("Profile save failed:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Company Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Showcase your company to attract top talent</p>

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
        {/* Banner */}
        <label className="relative block h-40 bg-gradient-to-r from-primary/20 to-accent/30 cursor-pointer group overflow-hidden">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Image className="h-8 w-8 mx-auto mb-1" />
                <span className="text-xs">Upload banner image</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("banner")} />
        </label>

        <div className="p-6 space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-4 -mt-14 relative z-10">
            <label className="relative cursor-pointer group">
              <div className="h-20 w-20 rounded-xl bg-card border-4 border-background flex items-center justify-center overflow-hidden shadow-md">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("logo")} />
            </label>
            <div className="pt-8">
              <p className="font-bold text-lg">{form.companyName || "Company Name"}</p>
              {(form.followers || []).length > 0 && (
                <p className="text-xs text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{(form.followers || []).length} followers</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input value={form.companyName || ""} onChange={(e) => setField("companyName", e.target.value)} className="mt-1" /></div>
            <div><Label>Industry</Label><Input value={form.industry || ""} onChange={(e) => setField("industry", e.target.value)} placeholder="e.g. Technology / SaaS" className="mt-1" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
              <Input value={form.location || ""} onChange={(e) => setField("location", e.target.value)} placeholder="City, State" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Company Size</Label>
              <Input value={form.size || ""} onChange={(e) => setField("size", e.target.value)} placeholder="e.g. 200-500" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>About</Label>
            <Textarea value={form.about || ""} onChange={(e) => setField("about", e.target.value)} placeholder="Tell candidates about your company..." rows={4} className="mt-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</Label>
              <Input value={form.website || ""} onChange={(e) => setField("website", e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
              <Input value={form.contactEmail || ""} onChange={(e) => setField("contactEmail", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
              <Input value={form.contactPhone || ""} onChange={(e) => setField("contactPhone", e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Employees */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5" /> Team Members (hired via HireAI)
            </Label>
            {(form.employees || []).length > 0 && (
              <div className="space-y-2 mb-3">
                {(form.employees || []).map((emp, i) => (
                  <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {emp.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.title}</p>
                    </div>
                    <button onClick={() => removeEmployee(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} placeholder="Name" className="flex-1" />
              <Input value={newEmpTitle} onChange={(e) => setNewEmpTitle(e.target.value)} placeholder="Title" className="flex-1" />
              <Button variant="outline" size="sm" onClick={addEmployee}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="w-full"><Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save Company Profile"}</Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
