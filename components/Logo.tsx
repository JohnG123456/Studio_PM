import Image from "next/image";

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <Image
      src="/icons/icon-512.png"
      alt="Studio PM"
      width={size}
      height={size}
      priority
      className="select-none"
      style={{ width: size, height: size }}
    />
  );
}
