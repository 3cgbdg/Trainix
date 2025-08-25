"use client"
import { UseMutationResult } from '@tanstack/react-query';
import { UploadIcon } from 'lucide-react';
import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadPhoto = ({ isAnalyzed,setIsAnalyzed, setFileName, fileName, setFile, file, mutation }: { mutation: UseMutationResult<any, unknown, File, unknown>, isAnalyzed: boolean, setFileName: Dispatch<SetStateAction<string>>, setIsAnalyzed: Dispatch<SetStateAction<boolean>>, fileName: string, setFile: Dispatch<SetStateAction<File | null>>, file: File | null }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFileName(acceptedFiles[0].name);
            setFile(acceptedFiles[0]);
        }
    }, [setFile, setFileName]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="flex flex-col items-center ">
            <div className="max-w-[900px] w-full text-center">
                <h1 className='page-title mb-10'>AI Photo Analysis - Upload</h1>

                <div className="_border rounded-[10px] p-7 md:p-12 items-center flex flex-col mb-4    bg-white">
                    <div className="flex flex-col text-center gap-2 max-w-[520px] w-full mb-10">
                        <h2 className='section-title'>Upload Your Fitness Photo</h2>
                        <p className='text-sm  leading-5 text-neutral-600'>Drag and drop your fitness photo here, or click to select a file. Our AI will analyze your progress and provide insights.</p>
                    </div>


                    <div
                        {...getRootProps()}
                        className={` border-2 border-dashed ${!isAnalyzed ? "skeleton" : ""}  border-neutral-600 outline-0 rounded-[10px] max-w-[800px] w-full sm:min-h-[288px] min-h-[200px] px-10 sm:py-[50px] py-5 mb-[25px] text-center cursor-pointer transition hover:border-green`}
                    >
                        <input {...getInputProps()} />
                        {isAnalyzed ? <> <div className="flex flex-col items-center justify-center">
                            <UploadIcon className='text-neutral-600 mb-4.5' size={64} />
                            <p className="text-neutral-600 font-medium">
                                {isDragActive ? 'Drop the file here...' : 'Drag and drop your photo here'}
                            </p>
                            <span className="text-sm leading-5 mt-2 text-neutral-600">– or –</span>
                            <button
                                type="button"
                                className="mt-4 inline-flex items-center p-2.5 border border-neutral-300 cursor-pointer text-sm font-medium rounded-md text-neutral-900 leading-5.5 bg-transparent hover:bg-gray-100"
                            >
                                Browse Files
                            </button>
                            {fileName && (
                                <p className={`mt-4 text-sm text-green-500`}>Selected: {fileName}</p>
                            )}
                        </div></> : <div className="h-full flex items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green border-solid mx-auto  "></div></div>}

                    </div>

                    <p className="text-sm leading-5 text-neutral-600 max-w-[450px] text-center">
                        <span>Photo Guidelines:</span>  Ensure good lighting, full body visibility, and a neutral background for best analysis results. Supported formats: JPG, PNG. Max size: 10MB.
                    </p>
                </div>
                <button disabled={!isAnalyzed ? true : false} onClick={() => {
                    setIsAnalyzed(false);
                    if (file) mutation.mutate(file);
                }} className={`button-green w-full disabled:bg-neutral-800 ${!isAnalyzed ? "!bg-neutral-700 !cursor-auto" : ""}`}>{!isAnalyzed ? "Processing" : "Proceed to Analysis"}</button>
            </div>
        </div >
    )
}

export default React.memo(UploadPhoto)  