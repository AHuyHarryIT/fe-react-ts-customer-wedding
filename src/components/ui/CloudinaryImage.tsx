import defaultImg from '@assets/default-image.svg';
import { Image } from 'antd';
import { type ComponentProps } from 'react';

const ERROR_IMG_SRC = defaultImg;

type AntdImageProps = ComponentProps<typeof Image>;

interface CloudinaryImageProps extends Omit<AntdImageProps, 'src' | 'width' | 'height'> {
  width?: number;
  height?: number;
  src: string;
  previewOriginal?: boolean;
  cloudinaryCropMode?: 'fill' | 'fit' | 'thumb' | 'scale';
}

const toCloudinaryTransformedUrl = (
  url: string,
  width?: number,
  height?: number,
  mode: CloudinaryImageProps['cloudinaryCropMode'] = 'fill'
) => {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  const transformations = [
    mode && `c_${mode}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ].join(',');

  return url.replace('/upload/', `/upload/${transformations}/`);
};

export function CloudinaryImage({
  src,
  width,
  height,
  preview,
  previewOriginal = true,
  cloudinaryCropMode = 'fill',
  ...imageProps
}: CloudinaryImageProps) {
  const transformedSrc = toCloudinaryTransformedUrl(src, width, height, cloudinaryCropMode);

  return (
    <Image
      width={width}
      height={height}
      src={transformedSrc}
      preview={preview ?? (previewOriginal ? { src } : true)}
      {...imageProps}
      fallback={ERROR_IMG_SRC}
    />
  );
}
