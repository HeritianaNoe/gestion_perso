"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Undo2 } from "lucide-react";
import { Label } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import type { FieldDef, Row } from "./types";

const MAX = 2 * 1024 * 1024;

export function ImageField({ f, row, error }: { f: FieldDef; row?: Row; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const hasPhoto = !!row?.[f.name];

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLocalError(undefined);
    if (!file) return setPreview(null);
    if (file.size > MAX) {
      setLocalError("Image trop lourde (2 Mo maximum)");
      e.target.value = "";
      return setPreview(null);
    }
    setRemoved(false);
    setPreview(URL.createObjectURL(file));
  }

  function reset() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  }

  const showDefault = removed && !preview;
  const btn =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300";

  return (
    <div className="space-y-2 md:col-span-2">
      <Label icon={f.icon}>{f.label}</Label>
      <div className="flex items-center gap-5">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Aperçu"
            className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200/80"
          />
        ) : (
          <Avatar
            size={64}
            photo={showDefault ? null : row?.[f.name]}
            sexe={row?.sexe}
            id={row?.id}
            alt="Photo actuelle"
          />
        )}
        <div className="space-y-2.5 text-sm">
          <input
            ref={inputRef}
            type="file"
            name={f.name}
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onPick}
            className="hidden"
          />
          <input type="hidden" name={`${f.name}__remove`} value={removed ? "1" : ""} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className={btn}>
              <ImagePlus size={15} /> {preview || hasPhoto ? "Changer la photo" : "Choisir une photo"}
            </button>
            {preview && (
              <button type="button" onClick={reset} className={btn}>
                <Undo2 size={15} /> Annuler le choix
              </button>
            )}
            {hasPhoto && !preview && (
              <button
                type="button"
                onClick={() => setRemoved((v) => !v)}
                className={
                  removed
                    ? btn
                    : "inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-1.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
                }
              >
                {removed ? (
                  <>
                    <Undo2 size={15} /> Garder la photo
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Retirer la photo
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            PNG, JPG, WEBP ou GIF · 2 Mo max. Sans photo, un avatar par défaut est utilisé.
          </p>
          {(localError || error) && (
            <p className="text-xs text-red-600">{localError ?? error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
