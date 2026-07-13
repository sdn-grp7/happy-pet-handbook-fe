import { useCallback, useEffect, useState } from "react";
import { Popconfirm } from "antd";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useGuides } from "@/features/guides/contexts/GuidesContext";
import {
  createGuide,
  deleteGuide,
  getGuidesAdmin,
  updateGuide,
} from "@/features/guides/api/guidesApi";
import type { GuideBook } from "@/features/guides/types";
import { pickL } from "@/features/guides/types";
import { useI18n } from "@/i18n/I18nContext";
import { toast } from "@/shared/lib/toast";

type FormState = {
  id?: string;
  slug: string;
  chapter: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  sourceTitle: string;
  attribution: string;
  sourceUrl: string;
  published: boolean;
  pdf?: File | null;
};

const emptyForm = (): FormState => ({
  slug: "",
  chapter: "1",
  titleVi: "",
  titleEn: "",
  subtitleVi: "",
  subtitleEn: "",
  sourceTitle: "",
  attribution: "",
  sourceUrl: "",
  published: true,
  pdf: null,
});

function toFormData(form: FormState) {
  const fd = new FormData();
  fd.set("slug", form.slug.trim().toLowerCase());
  fd.set("chapter", form.chapter);
  fd.set("titleVi", form.titleVi);
  fd.set("titleEn", form.titleEn);
  fd.set("subtitleVi", form.subtitleVi);
  fd.set("subtitleEn", form.subtitleEn);
  fd.set("sourceTitle", form.sourceTitle);
  fd.set("attribution", form.attribution);
  fd.set("sourceUrl", form.sourceUrl);
  fd.set("published", form.published ? "true" : "false");
  if (form.pdf) fd.set("pdf", form.pdf);
  return fd;
}

export function AdminGuidesPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const { refresh } = useGuides();
  const [guides, setGuides] = useState<GuideBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getGuidesAdmin(token);
      setGuides(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminGuides.loadError"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setForm(emptyForm());
    setEditing(true);
  };

  const startEdit = (g: GuideBook) => {
    setForm({
      id: g.id,
      slug: g.slug,
      chapter: String(g.chapter),
      titleVi: g.title.vi,
      titleEn: g.title.en,
      subtitleVi: g.subtitle.vi,
      subtitleEn: g.subtitle.en,
      sourceTitle: g.sourceTitle ?? "",
      attribution: g.attribution ?? "",
      sourceUrl: g.sourceUrl ?? "",
      published: g.published !== false,
      pdf: null,
    });
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!form.id && !form.pdf) {
      toast.error(t("adminGuides.pdfRequired"));
      return;
    }
    setSaving(true);
    try {
      const fd = toFormData(form);
      if (form.id) await updateGuide(token, form.id, fd);
      else await createGuide(token, fd);
      toast.success(t("adminGuides.saved"));
      setEditing(false);
      setForm(emptyForm());
      await load();
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminGuides.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: GuideBook) => {
    if (!token) return;
    try {
      await deleteGuide(token, g.id);
      toast.success(t("adminGuides.deleted"));
      await load();
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminGuides.deleteError"));
    }
  };

  const field =
    "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

  return (
    <>
      <PageMeta title={t("adminGuides.title")} description={t("adminGuides.subtitle")} />
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("adminGuides.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? t("common.loading") : t("adminGuides.count", { count: guides.length })}
            </p>
          </div>
          <Button type="button" size="sm" onClick={startCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t("adminGuides.add")}
          </Button>
        </div>

        {editing && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-border bg-card p-5"
          >
            <h2 className="font-semibold">
              {form.id ? t("adminGuides.edit") : t("adminGuides.add")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted-foreground">
                Slug
                <input
                  className={field}
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {t("adminGuides.chapter")}
                <input
                  className={field}
                  type="number"
                  min={1}
                  required
                  value={form.chapter}
                  onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {t("adminGuides.titleVi")}
                <input
                  className={field}
                  required
                  value={form.titleVi}
                  onChange={(e) => setForm((f) => ({ ...f, titleVi: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {t("adminGuides.titleEn")}
                <input
                  className={field}
                  required
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground sm:col-span-2">
                {t("adminGuides.subtitleVi")}
                <input
                  className={field}
                  required
                  value={form.subtitleVi}
                  onChange={(e) => setForm((f) => ({ ...f, subtitleVi: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground sm:col-span-2">
                {t("adminGuides.subtitleEn")}
                <input
                  className={field}
                  required
                  value={form.subtitleEn}
                  onChange={(e) => setForm((f) => ({ ...f, subtitleEn: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {t("adminGuides.sourceTitle")}
                <input
                  className={field}
                  value={form.sourceTitle}
                  onChange={(e) => setForm((f) => ({ ...f, sourceTitle: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                {t("adminGuides.sourceUrl")}
                <input
                  className={field}
                  type="text"
                  inputMode="url"
                  placeholder="https://"
                  value={form.sourceUrl}
                  onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground sm:col-span-2">
                {t("adminGuides.attribution")}
                <input
                  className={field}
                  value={form.attribution}
                  onChange={(e) => setForm((f) => ({ ...f, attribution: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground sm:col-span-2">
                PDF {form.id ? t("adminGuides.pdfOptional") : "*"}
                <input
                  className={field}
                  type="file"
                  accept="application/pdf,.pdf"
                  required={!form.id}
                  onChange={(e) => setForm((f) => ({ ...f, pdf: e.target.files?.[0] ?? null }))}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                />
                {t("adminGuides.published")}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? t("common.loading") : t("adminGuides.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setForm(emptyForm());
                }}
              >
                {t("pet.cancel")}
              </Button>
            </div>
          </form>
        )}

        <ul className="space-y-3">
          {guides.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {pickL(g.title, locale)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    · ch.{g.chapter} · /{g.slug}
                    {g.published === false ? ` · ${t("adminGuides.draft")}` : ""}
                  </span>
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {pickL(g.subtitle, locale)}
                </p>
                <a
                  href={g.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                >
                  PDF <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit(g)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Popconfirm
                  title={t("adminGuides.deleteConfirm", { title: pickL(g.title, locale) })}
                  onConfirm={() => void handleDelete(g)}
                  okText={t("adminGuides.deleteOk")}
                  cancelText={t("adminGuides.deleteCancel")}
                  okButtonProps={{ danger: true }}
                >
                  <Button type="button" size="sm" variant="outline" className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Popconfirm>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
