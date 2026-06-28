import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
};

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function PageMeta({ title, description, ogTitle, ogDescription }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    if (description) setMeta("description", description);
    if (ogTitle) setMeta("og:title", ogTitle, true);
    if (ogDescription || description)
      setMeta("og:description", ogDescription || description || "", true);
  }, [title, description, ogTitle, ogDescription]);

  return null;
}
