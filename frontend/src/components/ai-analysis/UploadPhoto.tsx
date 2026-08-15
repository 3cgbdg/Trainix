"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import { Camera, Check, ImagePlus, LockKeyhole, ScanLine } from "lucide-react";
import { memo, useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/lib/cn";

type UploadPhotoProps = {
  mutation: UseMutationResult<unknown, unknown, File, unknown>;
  setReset: Dispatch<SetStateAction<boolean>>;
  isAnalyzed: boolean;
  setFileName: Dispatch<SetStateAction<string>>;
  setIsAnalyzed: Dispatch<SetStateAction<boolean>>;
  fileName: string;
  setFile: Dispatch<SetStateAction<File | null>>;
  file: File | null;
};

const guidelines = ["Full body visible", "Even front lighting", "Simple, neutral background"];

function UploadPhoto({ isAnalyzed, setIsAnalyzed, setFileName, setReset, fileName, setFile, file, mutation }: UploadPhotoProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;
    setFileName(selected.name);
    setFile(selected);
    setFileError(null);
  }, [setFile, setFileName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => setFileError("Choose a JPG or PNG image smaller than 10 MB."),
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: !isAnalyzed,
  });

  const submit = () => {
    if (!file) return;
    setIsAnalyzed(false);
    setReset(false);
    mutation.mutate(file);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><ScanLine size={23} /></span>
        <p className="mt-5 text-sm font-semibold text-brand-strong">Private body check-in</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Understand your current baseline</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">Upload one clear photo to estimate body metrics and personalize your training and nutrition plan.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.55fr)]">
        <Surface padding="lg">
          <div
            {...getRootProps()}
            className={cn(
              "flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-10 text-center outline-none transition-colors",
              "border-border-strong bg-surface-muted hover:border-brand hover:bg-brand-soft/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-focus",
              isDragActive && "border-brand bg-brand-soft",
              !isAnalyzed && "cursor-wait border-brand bg-brand-soft",
            )}
          >
            <input aria-label="input" {...getInputProps()} />
            {isAnalyzed ? (
              <>
                <span className="flex size-16 items-center justify-center rounded-full bg-surface text-brand-strong shadow-sm"><ImagePlus size={29} /></span>
                <h2 className="mt-5 text-xl font-bold text-strong">{isDragActive ? "Drop your photo here" : "Drag and drop your photo"}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">or select a JPG or PNG up to 10 MB</p>
                <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-semibold text-strong">Browse files</span>
                {fileName ? <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand-strong"><Check size={16} /> {fileName}</p> : null}
              </>
            ) : (
              <div role="status">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface text-brand-strong"><span aria-hidden="true" className="size-7 animate-spin rounded-full border-3 border-brand border-r-transparent" /></span>
                <h2 className="mt-5 text-xl font-bold text-strong">Analyzing your check-in</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted">We’re estimating your metrics and preparing the connected plan. This can take around 90 seconds.</p>
              </div>
            )}
          </div>
          {fileError ? <p role="alert" className="mt-3 text-sm font-medium text-danger">{fileError}</p> : null}
          {mutation.isError ? <p role="alert" className="mt-3 text-sm font-medium text-danger">The analysis could not be completed. Your current plan was not changed.</p> : null}
        </Surface>

        <div className="space-y-4">
          <Surface padding="lg">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Camera size={19} /></span><h2 className="font-bold text-strong">For the clearest result</h2></div>
            <ul className="mt-5 space-y-3">
              {guidelines.map((guideline) => <li key={guideline} className="flex items-center gap-3 text-sm text-muted"><Check size={16} className="shrink-0 text-brand" />{guideline}</li>)}
            </ul>
          </Surface>
          <Surface padding="lg" variant="muted">
            <div className="flex items-start gap-3"><LockKeyhole size={20} className="mt-0.5 shrink-0 text-brand-strong" /><div><h2 className="font-bold text-strong">Your photo stays private</h2><p className="mt-2 text-sm leading-6 text-muted">It is used for your personal measurements and progress comparison, never displayed publicly.</p></div></div>
          </Surface>
        </div>
      </div>

      <Button aria-label="btn" className="w-full" size="lg" disabled={!file || !isAnalyzed} loading={!isAnalyzed} loadingLabel="Analyzing your photo…" leadingIcon={<ScanLine size={19} />} onClick={submit}>Analyze photo</Button>
    </div>
  );
}

export default memo(UploadPhoto);
