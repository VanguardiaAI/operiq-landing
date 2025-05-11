import React from 'react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export default function Image({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  ...props
}: ImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const imgStyle: React.CSSProperties = {
    objectFit: props.objectFit,
    ...(fill ? {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    } : {}),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      style={imgStyle}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
} 