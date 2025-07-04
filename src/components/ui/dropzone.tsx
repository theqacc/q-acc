'use client';

import { useCallback, useEffect, useState, useRef, FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import axios from 'axios';
import { IconX } from '@/components/icons/IconX';
import { uploadToIPFS } from '@/services/ipfs';
import { getIpfsAddress } from '@/helpers/image';

interface DropzoneProps {
  onDrop: (name: string, acceptedFile: File, ipfsHash: string) => void;
  name: string;
  rules?: RegisterOptions;
}

export const Dropzone: FC<DropzoneProps> = ({ name, rules, onDrop }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const { register, setValue, trigger, watch } = useFormContext();

  const onDropCallback = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setSelectedImage(file);
      setIpfsHash(null);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const ipfsHash = await uploadToIPFS(
        file,
        progressEvent => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          }
        },
        controller.signal, // Pass the AbortController signal for cancellation
      );

      setIsLoading(false);
      abortControllerRef.current = null;

      if (ipfsHash) {
        onDrop(name, file, ipfsHash);
        setIpfsHash(ipfsHash);
        setValue(name, getIpfsAddress(ipfsHash), { shouldValidate: false }); // Set value without triggering validation immediately
      }
    },
    [onDrop, setValue, name],
  );

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploadProgress(0);
      setSelectedImage(null);
      setIsLoading(false);
    }
  };

  const deleteUploadedImage = async () => {
    if (ipfsHash) {
      try {
        setUploadProgress(0);
        setSelectedImage(null);
        setIpfsHash(null);
        setIsLoading(false);
        await axios.delete('/api/ipfs', { data: { ipfsHash } });
      } catch (error) {
        console.error('Error deleting from IPFS', error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
    },
  });

  useEffect(() => {
    // Set validation state when image is selected
    trigger(name);
  }, [selectedImage, trigger, name, ipfsHash, isLoading]);

  const formValue = watch(name);

  return formValue ? (
    <div className='flex flex-col gap-6'>
      <div className='py-14 border-[1px] border-dashed border-neutral-700 p-4 rounded-2xl text-center bg-neutral-900 text-neutral-400 cursor-pointer'>
        <img
          src={formValue}
          alt='Selected Image'
          className='block mb-4 mx-auto'
        />
      </div>
      <div className='flex flex-col gap-1'>
        <div className='flex justify-between overflow-hidden max-w-full'>
          <p className='text-xs text-nowrap max-w-full overflow-hidden text-ellipsis'>
            Uploaded
          </p>
          <button
            type='button'
            onClick={() => {
              setValue(name, null);
              setSelectedImage(null);
            }}
            className='px-2 text-xs text-red-500 rounded border-none flex gap-1 items-center'
          >
            <IconX size={8} />
            <span>Delete</span>
          </button>
        </div>
        <div className='relative w-full bg-neutral-900 h-2 rounded-lg overflow-hidden mb-4'>
          <div
            className='absolute top-0 left-0 h-full bg-peach-400 transition-all'
            style={{ width: `${100}%` }}
          ></div>
        </div>
      </div>
    </div>
  ) : (
    <>
      <div
        {...getRootProps()}
        className={`py-14 border-[1px] border-dashed border-neutral-700 p-4 rounded-2xl text-center bg-neutral-900 text-neutral-400 cursor-pointer ${
          isLoading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <input {...getInputProps()} />
        <input
          {...register(name, {
            ...rules,
            validate: value => {
              if (isLoading) {
                return 'Upload in progress...';
              }
              return true;
            },
          })}
          type="hidden"
          value={ipfsHash || ''}
          className='hidden'
          readOnly
        />
        {isDragActive ? (
          <p>Drop the icon here ...</p>
        ) : (
          <>
            {selectedImage ? (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt='Selected Icon'
                className='block mb-4 mx-auto'
              />
            ) : (
              <>
                <p>Drag & drop an image her</p>
                <p>or</p>
                <p className='font-bold'>Browse Files</p>
              </>
            )}
            {isLoading && <p className='text-peach-400 mt-2'>Uploading...</p>}
          </>
        )}
      </div>
      {selectedImage && (
        <div className='flex flex-col gap-1'>
          <p className='text-sm text-nowrap max-w-full overflow-hidden text-ellipsis'>
            {selectedImage.name}
          </p>
          <div className='flex justify-between overflow-hidden max-w-full'>
            <p className='text-xs text-nowrap max-w-full overflow-hidden text-ellipsis'>
              {ipfsHash ? 'Uploaded' : 'Uploading...'}
            </p>
            <button
              type='button'
              onClick={ipfsHash ? deleteUploadedImage : cancelUpload}
              className='px-2 text-xs text-peach-400 rounded border-none flex gap-1 items-center'
            >
              <IconX size={8} />
              {ipfsHash ? <span>Delete</span> : <span>Cancel Upload</span>}
            </button>
          </div>
          <div className='relative w-full bg-neutral-900 h-2 rounded-lg overflow-hidden mb-4'>
            <div
              className='absolute top-0 left-0 h-full bg-peach-400 transition-all'
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};
