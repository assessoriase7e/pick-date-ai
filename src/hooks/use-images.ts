import { ImageRecord } from "@prisma/client";
import useSWR from "swr";

type ImageWithProfessional = ImageRecord & {
  professional: {
    name: string;
  };
};

interface ImagesResponse {
  images: ImageWithProfessional[];
  totalPages: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useImages(page: number) {
  const { data, error, isLoading, mutate } = useSWR<ImagesResponse>(
    `/api/images?page=${page}`,
    fetcher
  );

  return {
    images: data?.images ?? [],
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    mutate,
  } as const;
}
